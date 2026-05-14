export type CellStatus = 'closed' | 'open' | 'flagged' | 'exploded';

export interface Cell {
  x: number;
  y: number;
  isMine: boolean;
  status: CellStatus;
  neighborMines: number;
  probability?: number; // Used for AI Coach
}

export type GameStatus = 'playing' | 'won' | 'lost' | 'ready';

export interface GameSettings {
  rows: number;
  cols: number;
  mines: number;
}

export const DIFFICULTIES: Record<string, GameSettings> = {
  beginner: { rows: 9, cols: 9, mines: 10 },
  intermediate: { rows: 12, cols: 12, mines: 20 },
  expert: { rows: 16, cols: 16, mines: 40 },
  pro: { rows: 16, cols: 30, mines: 99 },
};
