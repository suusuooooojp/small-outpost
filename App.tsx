
import React, { useState, useEffect, useCallback } from 'react';
import { PhysicsGame } from './components/PhysicsGame';
import { UI } from './components/UI';
import { GameState, ProjectileType } from './types';
import { LEVELS, INITIAL_AMMO } from './constants';
import { getDemolitionAdvice } from './services/geminiService';

const App: React.FC = () => {
  const [levelIndex, setLevelIndex] = useState(0);
  const currentLevel = LEVELS[levelIndex];
  
  const [gameState, setGameState] = useState<GameState>({
    level: currentLevel.id,
    score: 0,
    destroyedCount: 0,
    totalBlocks: currentLevel.rows * currentLevel.cols * currentLevel.height,
    isGameOver: false,
    isLevelComplete: false,
    selectedProjectile: ProjectileType.BOMB,
    ammo: { ...INITIAL_AMMO }
  });

  const [aiHint, setAiHint] = useState<string>('');

  useEffect(() => {
    // Fetch advice from Gemini when level changes
    getDemolitionAdvice(currentLevel.name, currentLevel.id).then(setAiHint);
  }, [levelIndex, currentLevel.name, currentLevel.id]);

  const handleBlockDestroyed = useCallback(() => {
    setGameState(prev => {
      const newDestroyed = prev.destroyedCount + 1;
      const isComplete = newDestroyed / prev.totalBlocks >= 0.7; // 70% destruction to pass
      return {
        ...prev,
        destroyedCount: newDestroyed,
        isLevelComplete: isComplete
      };
    });
  }, []);

  const handleProjectileUsed = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      ammo: {
        ...prev.ammo,
        [prev.selectedProjectile]: prev.ammo[prev.selectedProjectile] - 1
      }
    }));
  }, []);

  const handleNextLevel = () => {
    const nextIdx = (levelIndex + 1) % LEVELS.length;
    const nextLvl = LEVELS[nextIdx];
    setLevelIndex(nextIdx);
    setGameState({
      level: nextLvl.id,
      score: 0,
      destroyedCount: 0,
      totalBlocks: nextLvl.rows * nextLvl.cols * nextLvl.height,
      isGameOver: false,
      isLevelComplete: false,
      selectedProjectile: ProjectileType.BOMB,
      ammo: { ...INITIAL_AMMO }
    });
  };

  const handleReset = () => {
    setGameState({
      ...gameState,
      destroyedCount: 0,
      isLevelComplete: false,
      ammo: { ...INITIAL_AMMO }
    });
    // Triggers re-render of PhysicsGame by changing its key (implicitly via level logic if we reset properly)
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden">
      <PhysicsGame 
        key={`level-${levelIndex}-${gameState.ammo[ProjectileType.BOMB] + gameState.ammo[ProjectileType.CAR] + gameState.ammo[ProjectileType.GAS_CYLINDER]}`} // Force re-render on reset
        level={currentLevel} 
        onBlockDestroyed={handleBlockDestroyed}
        selectedProjectile={gameState.selectedProjectile}
        onProjectileUsed={handleProjectileUsed}
        ammo={gameState.ammo}
      />
      
      <UI 
        gameState={gameState}
        levelName={currentLevel.name}
        aiHint={aiHint}
        onSelectProjectile={(type) => setGameState(prev => ({ ...prev, selectedProjectile: type }))}
        onReset={handleReset}
        onNextLevel={handleNextLevel}
      />
    </div>
  );
};

export default App;
