import { Cell, GameSettings } from '../types/game';

export class MinesweeperEngine {
  private grid: Cell[][] = [];
  private settings: GameSettings;
  private mineLocations: Set<string> = new Set();

  constructor(settings: GameSettings) {
    this.settings = settings;
    this.initializeGrid();
  }

  private initializeGrid() {
    this.grid = Array.from({ length: this.settings.rows }, (_, y) =>
      Array.from({ length: this.settings.cols }, (_, x) => ({
        x,
        y,
        isMine: false,
        status: 'closed',
        neighborMines: 0,
      }))
    );
  }

  public generateMines(firstClickX: number, firstClickY: number) {
    this.mineLocations.clear();
    let minesPlaced = 0;

    while (minesPlaced < this.settings.mines) {
      const x = Math.floor(Math.random() * this.settings.cols);
      const y = Math.floor(Math.random() * this.settings.rows);
      const key = `${x},${y}`;

      // Avoid placing mine on first click or its neighbors (3x3 area)
      const isTooClose = Math.abs(x - firstClickX) <= 1 && Math.abs(y - firstClickY) <= 1;

      if (!this.mineLocations.has(key) && !isTooClose) {
        this.mineLocations.add(key);
        this.grid[y][x].isMine = true;
        minesPlaced++;
      }
    }

    this.calculateNeighbors();
  }

  private calculateNeighbors() {
    for (let y = 0; y < this.settings.rows; y++) {
      for (let x = 0; x < this.settings.cols; x++) {
        if (this.grid[y][x].isMine) continue;

        let count = 0;
        this.getNeighbors(x, y).forEach(neighbor => {
          if (neighbor.isMine) count++;
        });
        this.grid[y][x].neighborMines = count;
      }
    }
  }

  public getNeighbors(x: number, y: number): Cell[] {
    const neighbors: Cell[] = [];
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < this.settings.cols && ny >= 0 && ny < this.settings.rows) {
          neighbors.push(this.grid[ny][nx]);
        }
      }
    }
    return neighbors;
  }

  public revealCell(x: number, y: number): { status: 'won' | 'lost' | 'playing'; updatedCells: Cell[] } {
    const cell = this.grid[y][x];
    if (cell.status !== 'closed') return { status: 'playing', updatedCells: [] };

    if (cell.isMine) {
      cell.status = 'exploded';
      this.revealAllMines();
      return { status: 'lost', updatedCells: this.getAllCells() };
    }

    const updatedCells: Cell[] = [];
    this.floodFill(x, y, updatedCells);

    if (this.checkWin()) {
      return { status: 'won', updatedCells: this.getAllCells() };
    }

    return { status: 'playing', updatedCells };
  }

  private floodFill(x: number, y: number, updatedCells: Cell[]) {
    const cell = this.grid[y][x];
    if (cell.status !== 'closed' || cell.isMine) return;

    cell.status = 'open';
    updatedCells.push(cell);

    if (cell.neighborMines === 0) {
      this.getNeighbors(x, y).forEach(neighbor => {
        this.floodFill(neighbor.x, neighbor.y, updatedCells);
      });
    }
  }

  public toggleFlag(x: number, y: number): Cell | null {
    const cell = this.grid[y][x];
    if (cell.status === 'open') return null;

    cell.status = cell.status === 'flagged' ? 'closed' : 'flagged';
    return cell;
  }

  private revealAllMines() {
    this.grid.forEach(row => {
      row.forEach(cell => {
        if (cell.isMine && cell.status !== 'flagged') {
          cell.status = 'open';
        }
      });
    });
  }

  private checkWin(): boolean {
    return this.grid.every(row =>
      row.every(cell => (cell.isMine ? cell.status !== 'open' : cell.status === 'open'))
    );
  }

  public getGrid(): Cell[][] {
    return this.grid;
  }

  public getAllCells(): Cell[] {
    return this.grid.flat();
  }
}
