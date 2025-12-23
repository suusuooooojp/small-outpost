
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Physics, useBox, usePlane, useSphere, PublicApi } from '@react-three/cannon';
import { PerspectiveCamera, OrbitControls, Stars, Environment, Text } from '@react-three/drei';
import * as THREE from 'three';
import { ProjectileType, LevelConfig } from '../types';
import { PROJECTILE_PROPERTIES } from '../constants';

// --- Components ---

// Fix: Use React.FC to correctly allow the 'key' prop when rendered in a list
const Block: React.FC<{ position: [number, number, number], onDestroyed: () => void }> = ({ position, onDestroyed }) => {
  const [ref, api] = useBox(() => ({
    mass: 1,
    position,
    args: [1, 1, 1],
    onCollide: (e) => {
      // Logic for destruction could go here based on impact force
    }
  }));

  const [active, setActive] = useState(true);
  const pos = useRef([0, 0, 0]);
  
  useEffect(() => {
    const unsub = api.position.subscribe(v => pos.current = v);
    return unsub;
  }, [api]);

  useFrame(() => {
    if (active && pos.current[1] < -5) {
      setActive(false);
      onDestroyed();
    }
  });

  if (!active) return null;

  return (
    <mesh ref={ref as any} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#888" roughness={0.3} metalness={0.2} />
    </mesh>
  );
};

const Plane = () => {
  const [ref] = usePlane(() => ({ rotation: [-Math.PI / 2, 0, 0], position: [0, 0, 0] }));
  return (
    <mesh ref={ref as any} receiveShadow>
      <planeGeometry args={[100, 100]} />
      <meshStandardMaterial color="#111" />
    </mesh>
  );
};

// Fix: Use React.FC to allow 'key' prop and resolve type-specific property access on config union
const Projectile: React.FC<{ 
  type: ProjectileType, 
  position: [number, number, number],
  onImpact: (pos: THREE.Vector3, config: any) => void
}> = ({ 
  type, 
  position, 
  onImpact 
}) => {
  const config = PROJECTILE_PROPERTIES[type];
  const impactHandled = useRef(false);

  // Fix: Use type casting to any to access size/radius from the union type config
  const [ref, api] = (type === ProjectileType.CAR) 
    ? useBox(() => ({ mass: config.mass, position, args: (config as any).size as [number, number, number] }))
    : useSphere(() => ({ mass: config.mass, position, args: [(config as any).radius] }));

  useFrame(() => {
    api.position.subscribe(p => {
      if (!impactHandled.current && p[1] <= 0.6) {
        impactHandled.current = true;
        onImpact(new THREE.Vector3(p[0], p[1], p[2]), config);
      }
    });
  });

  return (
    <mesh ref={ref as any} castShadow>
      {/* Fix: Resolve property access errors by casting config to any */}
      {type === ProjectileType.CAR ? (
        <boxGeometry args={(config as any).size as [number, number, number]} />
      ) : (
        <sphereGeometry args={[(config as any).radius]} />
      )}
      <meshStandardMaterial color={config.color} emissive={config.color} emissiveIntensity={0.5} />
    </mesh>
  );
};

// Fix: Use React.FC to resolve the 'key' prop issue
const ExplosionEffect: React.FC<{ position: THREE.Vector3, color: string }> = ({ position, color }) => {
  const [scale, setScale] = useState(1);
  const [opacity, setOpacity] = useState(1);

  useFrame(() => {
    setScale(s => s + 0.5);
    setOpacity(o => o - 0.05);
  });

  if (opacity <= 0) return null;

  return (
    <mesh position={position}>
      <sphereGeometry args={[scale]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
};

// --- Scene Manager ---

interface PhysicsGameProps {
  level: LevelConfig;
  onBlockDestroyed: () => void;
  selectedProjectile: ProjectileType;
  onProjectileUsed: () => void;
  ammo: Record<ProjectileType, number>;
}

const SceneContent = ({ level, onBlockDestroyed, selectedProjectile, onProjectileUsed, ammo }: PhysicsGameProps) => {
  const [projectiles, setProjectiles] = useState<{ id: string, type: ProjectileType, pos: [number, number, number] }[]>([]);
  const [explosions, setExplosions] = useState<{ id: string, pos: THREE.Vector3, color: string }[]>([]);
  const { raycaster, mouse, camera, scene } = useThree();

  const blocks = useMemo(() => {
    const arr = [];
    const offsetX = (level.cols * level.spacing) / 2;
    const offsetZ = (level.rows * level.spacing) / 2;
    for (let y = 0; y < level.height; y++) {
      for (let x = 0; x < level.cols; x++) {
        for (let z = 0; z < level.rows; z++) {
          arr.push([
            x * level.spacing - offsetX,
            y * level.spacing + 0.5,
            z * level.spacing - offsetZ
          ] as [number, number, number]);
        }
      }
    }
    return arr;
  }, [level]);

  const handlePointerDown = (e: any) => {
    if (ammo[selectedProjectile] <= 0) return;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children);
    
    if (intersects.length > 0) {
      const point = intersects[0].point;
      const id = Math.random().toString(36).substr(2, 9);
      setProjectiles(prev => [...prev, { id, type: selectedProjectile, pos: [point.x, 20, point.z] }]);
      onProjectileUsed();
    }
  };

  const handleImpact = useCallback((pos: THREE.Vector3, config: any) => {
    const explosionId = Math.random().toString(36).substr(2, 9);
    setExplosions(prev => [...prev, { id: explosionId, pos, color: config.color }]);
    
    // Auto-remove explosion after some time
    setTimeout(() => {
      setExplosions(prev => prev.filter(e => e.id !== explosionId));
    }, 1000);
  }, []);

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Environment preset="city" />

      <Physics gravity={[0, -20, 0]}>
        <Plane />
        {blocks.map((pos, i) => (
          <Block key={`${level.id}-${i}`} position={pos as [number, number, number]} onDestroyed={onBlockDestroyed} />
        ))}
        {projectiles.map(p => (
          <Projectile 
            key={p.id} 
            type={p.type} 
            position={p.pos} 
            onImpact={handleImpact}
          />
        ))}
      </Physics>

      {explosions.map(e => (
        <ExplosionEffect key={e.id} position={e.pos} color={e.color} />
      ))}

      {/* Invisible plane for raycasting clicks */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.1, 0]} onPointerDown={handlePointerDown} visible={false}>
        <planeGeometry args={[100, 100]} />
      </mesh>
    </>
  );
};

// Fix: Use React.FC to resolve the 'key' property error in App.tsx
export const PhysicsGame: React.FC<PhysicsGameProps> = (props) => {
  return (
    <div className="w-full h-full cursor-crosshair bg-slate-900">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[15, 20, 15]} fov={50} />
        <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2.2} minDistance={10} maxDistance={50} />
        <SceneContent {...props} />
      </Canvas>
    </div>
  );
};
