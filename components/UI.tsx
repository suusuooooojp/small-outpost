
import React from 'react';
import { ProjectileType, GameState } from '../types';
import { Bomb, Car, Cylinder, RotateCcw, Play, ChevronRight, Trophy } from 'lucide-react';

interface UIProps {
  gameState: GameState;
  levelName: string;
  onSelectProjectile: (type: ProjectileType) => void;
  onReset: () => void;
  onNextLevel: () => void;
  aiHint: string;
}

export const UI: React.FC<UIProps> = ({ 
  gameState, 
  levelName, 
  onSelectProjectile, 
  onReset, 
  onNextLevel,
  aiHint
}) => {
  const { selectedProjectile, ammo, destroyedCount, totalBlocks, level, isLevelComplete } = gameState;
  const progress = Math.min(100, Math.round((destroyedCount / totalBlocks) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
      {/* Top Header */}
      <div className="flex justify-between items-start pointer-events-auto">
        <div className="bg-black/60 backdrop-blur-md p-4 rounded-xl border border-white/10">
          <h1 className="text-2xl font-black text-white uppercase tracking-widest">{levelName}</h1>
          <div className="flex gap-4 mt-2">
            <div className="text-xs uppercase text-white/50 font-bold">Level {level}</div>
            <div className="text-xs uppercase text-white/50 font-bold">Blocks: {destroyedCount}/{totalBlocks}</div>
          </div>
          <div className="mt-2 w-48 h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-500 ease-out" 
              style={{ width: `${progress}%` }}
            />
          </div>
          {aiHint && (
            <p className="mt-4 text-xs italic text-blue-300 max-w-[200px]">" {aiHint} "</p>
          )}
        </div>

        <button 
          onClick={onReset}
          className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-colors shadow-lg"
        >
          <RotateCcw size={24} />
        </button>
      </div>

      {/* Bottom Controls */}
      <div className="flex justify-center gap-4 mb-8 pointer-events-auto">
        {(Object.entries(ProjectileType) as [string, ProjectileType][]).map(([key, type]) => {
          const isSelected = selectedProjectile === type;
          const count = ammo[type];
          
          return (
            <button
              key={type}
              onClick={() => onSelectProjectile(type)}
              disabled={count <= 0}
              className={`
                relative flex flex-col items-center justify-center w-20 h-24 rounded-2xl border-2 transition-all
                ${isSelected ? 'bg-white text-black border-white scale-110' : 'bg-black/60 text-white border-white/20 hover:border-white/40'}
                ${count <= 0 ? 'opacity-30 grayscale cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {type === ProjectileType.BOMB && <Bomb size={32} />}
              {type === ProjectileType.CAR && <Car size={32} />}
              {type === ProjectileType.GAS_CYLINDER && <Cylinder size={32} />}
              <span className="text-[10px] font-bold mt-2 uppercase">{type.replace('_', ' ')}</span>
              <span className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shadow-lg ${isSelected ? 'bg-red-500 text-white' : 'bg-white text-black'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Modals */}
      {isLevelComplete && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center pointer-events-auto">
          <div className="bg-slate-900 border border-white/10 p-10 rounded-3xl text-center shadow-2xl max-w-sm w-full">
            <Trophy className="mx-auto text-yellow-400 mb-4" size={64} />
            <h2 className="text-4xl font-black text-white mb-2 italic">MISSION SUCCESS</h2>
            <p className="text-white/60 mb-8 uppercase tracking-widest text-sm">Target Structure Demolished</p>
            <button 
              onClick={onNextLevel}
              className="group flex items-center justify-center gap-3 w-full bg-emerald-500 hover:bg-emerald-400 text-black font-black py-4 rounded-xl transition-all uppercase tracking-tighter"
            >
              Next Demolition
              <ChevronRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {/* Game Start/Over could be added here similarly */}
    </div>
  );
};
