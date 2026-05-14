import { Cell, GameSettings } from '../types/game';
import { MinesweeperEngine } from './engine';

export class MinesweeperSolver {
  private engine: MinesweeperEngine;
  private settings: GameSettings;

  constructor(engine: MinesweeperEngine, settings: GameSettings) {
    this.engine = engine;
    this.settings = settings;
  }

  /**
   * Analyzes the current grid and returns probabilities for each closed cell.
   * 1.0 means guaranteed mine.
   * 0.0 means guaranteed safe.
   */
  public analyze(grid: Cell[][]): Map<string, number> {
    const probabilities = new Map<string, number>();
    const closedCells = grid.flat().filter(c => c.status === 'closed' || c.status === 'flagged');
    
    // Default probability: total mines / total closed cells
    const defaultProb = this.settings.mines / closedCells.length;
    closedCells.forEach(c => probabilities.set(`${c.x},${c.y}`, defaultProb));

    // Simple Logical Solver (Step 1: Trivial cases)
    const openCells = grid.flat().filter(c => c.status === 'open' && c.neighborMines > 0);
    
    let changed = true;
    while (changed) {
      changed = false;
      
      for (const cell of openCells) {
        const neighbors = this.engine.getNeighbors(cell.x, cell.y);
        const closedNeighbors = neighbors.filter(n => n.status === 'closed' || n.status === 'flagged');
        const flaggedNeighbors = neighbors.filter(n => n.status === 'flagged');

        // Rule 1: All closed neighbors are mines
        if (closedNeighbors.length === cell.neighborMines) {
          closedNeighbors.forEach(n => {
            if (probabilities.get(`${n.x},${n.y}`) !== 1.0) {
              probabilities.set(`${n.x},${n.y}`, 1.0);
              changed = true;
            }
          });
        }

        // Rule 2: All closed neighbors are safe
        if (flaggedNeighbors.length === cell.neighborMines) {
          closedNeighbors.forEach(n => {
            if (n.status !== 'flagged' && probabilities.get(`${n.x},${n.y}`) !== 0.0) {
              probabilities.set(`${n.x},${n.y}`, 0.0);
              changed = true;
            }
          });
        }
      }
    }

    return probabilities;
  }
}
