
import { ProjectileType, LevelConfig } from './types';

export const INITIAL_AMMO = {
  [ProjectileType.BOMB]: 5,
  [ProjectileType.CAR]: 2,
  [ProjectileType.GAS_CYLINDER]: 10,
};

export const LEVELS: LevelConfig[] = [
  { id: 1, name: "Small Outpost", rows: 3, cols: 3, height: 4, spacing: 1.1 },
  { id: 2, name: "The Tower", rows: 2, cols: 2, height: 12, spacing: 1.1 },
  { id: 3, name: "The Fortress", rows: 5, cols: 5, height: 5, spacing: 1.1 },
  { id: 4, name: "Sky Scraper", rows: 3, cols: 3, height: 15, spacing: 1.1 },
  { id: 5, name: "Mega Block", rows: 8, cols: 8, height: 6, spacing: 1.1 },
];

export const PROJECTILE_PROPERTIES = {
  [ProjectileType.BOMB]: {
    mass: 10,
    color: '#ff4444',
    radius: 0.5,
    explosionImpulse: 150,
    explosionRadius: 8,
  },
  [ProjectileType.CAR]: {
    mass: 50,
    color: '#4444ff',
    size: [1.2, 0.6, 2],
    explosionImpulse: 50,
    explosionRadius: 3,
  },
  [ProjectileType.GAS_CYLINDER]: {
    mass: 5,
    color: '#ffaa00',
    radius: 0.3,
    height: 1,
    explosionImpulse: 250,
    explosionRadius: 12,
  },
};
