
export enum ProjectileType {
  BOMB = 'BOMB',
  CAR = 'CAR',
  GAS_CYLINDER = 'GAS_CYLINDER'
}

export interface GameState {
  level: number;
  score: number;
  destroyedCount: number;
  totalBlocks: number;
  isGameOver: boolean;
  isLevelComplete: boolean;
  selectedProjectile: ProjectileType;
  ammo: Record<ProjectileType, number>;
}

export interface LevelConfig {
  id: number;
  name: string;
  rows: number;
  cols: number;
  height: number;
  spacing: number;
  aiHint?: string;
}

export interface ProjectileInstance {
  id: string;
  type: ProjectileType;
  position: [number, number, number];
}
