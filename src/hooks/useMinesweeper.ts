import { useState, useCallback, useMemo, useEffect } from 'react';
import { MinesweeperEngine } from '../logic/engine';
import { MinesweeperSolver } from '../logic/solver';
import { Cell, GameSettings, GameStatus } from '../types/game';

export const useMinesweeper = (settings: GameSettings) => {
  const [engine, setEngine] = useState(() => new MinesweeperEngine(settings));
  const [grid, setGrid] = useState<Cell[][]>(() => engine.getGrid());
  const [gameStatus, setGameStatus] = useState<GameStatus>('ready');
  const [mineCount, setMineCount] = useState(settings.mines);
  const [time, setTime] = useState(0);

  const solver = useMemo(() => new MinesweeperSolver(engine, settings), [engine, settings]);
  const [stats, setStats] = useState({ wins: 0, losses: 0, bestTimes: {} as Record<string, number> });

  // Load stats from LocalStorage on mount to prevent hydration mismatch
  useEffect(() => {
    const saved = localStorage.getItem('minesweeper_stats');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStats(parsed);
      } catch (e) {
        console.error("Failed to parse stats", e);
      }
    }
  }, []);

// Initialize/Reset game
const resetGame = useCallback((newSettings?: GameSettings) => {
  const s = newSettings || settings;
  const newEngine = new MinesweeperEngine(s);
  setEngine(newEngine);
  setGrid([...newEngine.getGrid().map(row => [...row])]);
  setGameStatus('ready');
  setMineCount(s.mines);
  setTime(0);
}, [settings]);

// Statistics persistence
useEffect(() => {
  if (gameStatus === 'won' || gameStatus === 'lost') {
    const difficultyKey = `${settings.rows}x${settings.cols}x${settings.mines}`;
    
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setStats(prevStats => {
      const newStats = { ...prevStats };
      if (gameStatus === 'won') {
        newStats.wins += 1;
        const currentBest = prevStats.bestTimes[difficultyKey] || Infinity;
        if (time < currentBest) {
          newStats.bestTimes[difficultyKey] = time;
        }
      } else {
        newStats.losses += 1;
      }
      localStorage.setItem('minesweeper_stats', JSON.stringify(newStats));
      return newStats;
    });
  }
}, [gameStatus, time, settings.rows, settings.cols, settings.mines]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStatus === 'playing') {
      interval = setInterval(() => {
        setTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStatus]);

  const onCellClick = useCallback((x: number, y: number) => {
    if (gameStatus === 'won' || gameStatus === 'lost') return;

    const currentEngine = engine;
    if (gameStatus === 'ready') {
      currentEngine.generateMines(x, y);
      setGameStatus('playing');
    }

    const { status } = currentEngine.revealCell(x, y);
    
    if (status !== 'playing') {
      setGameStatus(status);
    }

    // Reset probabilities when a cell is revealed
    const newGrid = currentEngine.getGrid().map(row => 
      row.map(cell => ({ ...cell, probability: undefined }))
    );
    setGrid(newGrid);
  }, [engine, gameStatus]);

  const onCellContextMenu = useCallback((e: React.MouseEvent, x: number, y: number) => {
    e.preventDefault();
    if (gameStatus === 'won' || gameStatus === 'lost' || gameStatus === 'ready') return;

    const cell = engine.toggleFlag(x, y);
    if (cell) {
      setMineCount(prev => (cell.status === 'flagged' ? prev - 1 : prev + 1));
      setGrid([...engine.getGrid().map(row => [...row])]);
    }
  }, [engine, gameStatus]);

  const analyzeBoard = useCallback(() => {
    if (gameStatus !== 'playing') return;
    
    const probabilities = solver.analyze(grid);
    const newGrid = grid.map(row => 
      row.map(cell => ({
        ...cell,
        probability: probabilities.get(`${cell.x},${cell.y}`)
      }))
    );
    setGrid(newGrid);
  }, [grid, gameStatus, solver]);

  return {
    grid,
    gameStatus,
    mineCount,
    time,
    stats,
    onCellClick,
    onCellContextMenu,
    resetGame,
    analyzeBoard,
  };
};
