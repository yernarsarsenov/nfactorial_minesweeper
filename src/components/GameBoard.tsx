'use client';

import React, { useState } from 'react';
import { useMinesweeper } from '../hooks/useMinesweeper';
import { DIFFICULTIES, GameSettings } from '../types/game';
import Cell from './Cell';
import AuthButton from './AuthButton';

const GameBoard: React.FC = () => {
  const [difficulty, setDifficulty] = useState<GameSettings>(DIFFICULTIES.beginner);
  const {
    grid,
    gameStatus,
    mineCount,
    time,
    onCellClick,
    onCellContextMenu,
    resetGame,
    analyzeBoard,
    stats,
  } = useMinesweeper(difficulty);

  const [isDarkMode, setIsDarkMode] = useState(false);

  const difficultyKey = `${difficulty.rows}x${difficulty.cols}x${difficulty.mines}`;
  const bestTime = stats.bestTimes[difficultyKey];

  const handleDifficultyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newDiff = DIFFICULTIES[e.target.value];
    setDifficulty(newDiff);
    resetGame(newDiff);
  };

  return (
    <div className={`flex flex-col items-center gap-6 p-4 md:p-8 min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
      <div className="w-full max-w-5xl flex items-center justify-between mb-2">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight">
          MINESWEEPER <span className="text-blue-600">PRO</span>
        </h1>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`p-2 rounded-xl transition-all ${isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-400 border border-gray-200 shadow-sm'}`}
          >
            {isDarkMode ? '☀️' : '🌙'}
          </button>
          <AuthButton />
        </div>
      </div>

      <div className={`flex flex-wrap items-center justify-center gap-4 p-4 rounded-2xl shadow-lg border transition-all ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
        <div className="flex items-center gap-2">
          <label className={`text-[10px] font-bold uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Level</label>
          <select 
            onChange={handleDifficultyChange}
            className={`bg-transparent border-none rounded-lg px-2 py-1 text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none ${isDarkMode ? 'text-white' : 'text-gray-700'}`}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="expert">Expert</option>
            <option value="pro">Pro (99 Mines)</option>
          </select>
        </div>

        <div className={`h-8 w-px hidden sm:block ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`} />

        <div className="flex items-center gap-6">
          <div className="text-center">
            <p className={`text-[10px] font-bold uppercase leading-none ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Mines</p>
            <p className="text-xl font-mono font-bold text-rose-500 leading-tight">
              {mineCount.toString().padStart(3, '0')}
            </p>
          </div>
          <div className="text-center">
            <p className={`text-[10px] font-bold uppercase leading-none ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>Time</p>
            <p className="text-xl font-mono font-bold text-indigo-500 leading-tight">
              {time.toString().padStart(3, '0')}
            </p>
          </div>
        </div>

        <button 
          onClick={() => resetGame()}
          className="ml-2 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 w-10 h-10 flex items-center justify-center rounded-xl shadow-sm active:scale-95 transition-all text-2xl"
        >
          {gameStatus === 'won' ? '😎' : gameStatus === 'lost' ? '😵' : '😊'}
        </button>
      </div>

      <div className={`relative p-2 rounded-2xl shadow-2xl border transition-all overflow-auto max-w-full ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'}`}>
        <div 
          className={`grid gap-0 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'}`}
          style={{ 
            gridTemplateColumns: `repeat(${difficulty.cols}, minmax(0, 1fr))`,
            width: 'fit-content'
          }}
        >
          {grid.map((row, y) => 
            row.map((cell, x) => (
              <Cell 
                key={`${x}-${y}`} 
                cell={cell} 
                onClick={onCellClick} 
                onContextMenu={onCellContextMenu} 
              />
            ))
          )}
        </div>

        {gameStatus !== 'playing' && gameStatus !== 'ready' && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/40 backdrop-blur-[2px] pointer-events-none">
            <div className="bg-white px-10 py-6 rounded-3xl shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-300 pointer-events-auto text-center">
              <h2 className={`text-4xl font-black mb-2 ${gameStatus === 'won' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {gameStatus === 'won' ? 'VICTORY' : 'DEFEAT'}
              </h2>
              <p className="text-gray-500 font-medium mb-6">Time: {time} seconds</p>
              <button 
                onClick={() => resetGame()}
                className="w-full bg-gray-900 text-white font-bold py-3 rounded-2xl hover:bg-black transition-colors"
              >
                Play Again
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl w-full">
        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-6 rounded-3xl shadow-sm border transition-all hover:shadow-md`}>
          <h3 className="text-lg font-bold mb-2">AI Coach</h3>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Probability analysis with high contrast mapping:</p>
          <div className="flex flex-wrap gap-3 mb-6">
             <div className="flex items-center gap-2"><div className="w-4 h-4 bg-emerald-500 rounded-md shadow-sm" /><span className={`text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Safe</span></div>
             <div className="flex items-center gap-2"><div className="w-4 h-4 bg-rose-500 rounded-md shadow-sm" /><span className={`text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Mine</span></div>
             <div className="flex items-center gap-2"><div className="w-4 h-4 bg-indigo-500 rounded-md shadow-sm" /><span className={`text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Probable</span></div>
          </div>
          <button 
            onClick={analyzeBoard}
            disabled={gameStatus !== 'playing'}
            className="w-full py-3 bg-indigo-600 text-white font-black rounded-2xl shadow-lg shadow-indigo-100 hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-[0.98]"
          >
            GET AI HINT
          </button>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-6 rounded-3xl shadow-sm border transition-all hover:shadow-md`}>
          <h3 className="text-lg font-bold mb-2">My Stats</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Wins</p>
              <p className="text-2xl font-black text-emerald-500">{stats.wins}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase">Losses</p>
              <p className="text-2xl font-black text-rose-500">{stats.losses}</p>
            </div>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase mb-2">Best Time (Current)</p>
          <p className="text-xl font-mono font-bold text-indigo-500">
            {bestTime === undefined ? '--' : `${bestTime}s`}
          </p>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-6 rounded-3xl shadow-sm border transition-all hover:shadow-md`}>
          <h3 className="text-lg font-bold mb-2">Daily</h3>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Today's global seed: #2026-05-14</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">Active Now</span>
            <button className="text-sm font-bold text-gray-400 hover:text-gray-600">Leaderboard</button>
          </div>
        </div>

        <div className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'} p-6 rounded-3xl shadow-sm border transition-all hover:shadow-md`}>
          <h3 className="text-lg font-bold mb-2">Upgrade</h3>
          <p className={`text-sm mb-4 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>Unlock skins and detailed analytics.</p>
          <button className="mt-4 w-full py-2 bg-purple-500/10 text-purple-500 font-bold rounded-xl border border-purple-500/20 hover:bg-purple-500/20 transition-colors">
            Get Pro
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameBoard;
