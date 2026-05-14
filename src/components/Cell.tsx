'use strict';

import React from 'react';
import { Cell as CellType } from '../types/game';

interface CellProps {
  cell: CellType;
  onClick: (x: number, y: number) => void;
  onContextMenu: (e: React.MouseEvent, x: number, y: number) => void;
}

const Cell: React.FC<CellProps> = ({ cell, onClick, onContextMenu }) => {
  const getCellContent = () => {
    if (cell.status === 'flagged') return (
      <span className="text-base leading-none drop-shadow-sm select-none" role="img" aria-label="flag">🚩</span>
    );
    if (cell.status === 'exploded') return (
      <span className="text-base leading-none" role="img" aria-label="explosion">💣</span>
    );
    if (cell.status === 'open') {
      if (cell.isMine) return (
        <span className="text-base leading-none" role="img" aria-label="mine">💣</span>
      );
      return cell.neighborMines > 0 ? cell.neighborMines : '';
    }
    // Show probability if available
    if (cell.probability !== undefined) {
      if (cell.probability === 0) return '✓';
      if (cell.probability === 1) return '×';
      return `${Math.round(cell.probability * 100)}%`;
    }
    return '';
  };

  const getCellClassName = () => {
    let base = "w-8 h-8 flex items-center justify-center text-[10px] font-bold border-[0.5px] cursor-pointer select-none transition-all duration-75 ";
    
    if (cell.status === 'closed' || cell.status === 'flagged') {
      base += "bg-gray-100 border-gray-300 hover:bg-gray-200 ";
      
      // Improved AI Coach Colors with better contrast
      if (cell.probability !== undefined) {
        if (cell.probability === 0) base = base.replace("bg-gray-100", "bg-emerald-500") + " !text-white shadow-inner";
        else if (cell.probability === 1) base = base.replace("bg-gray-100", "bg-rose-500") + " !text-white shadow-inner";
        else base = base.replace("bg-gray-100", "bg-indigo-500") + " !text-white opacity-90";
      }
    } else {
      base += "bg-white border-gray-200 ";
      if (cell.status === 'exploded') base += "bg-red-500 text-white ";
    }

    // Text coloring for numbers
    const colors: Record<number, string> = {
      1: "text-blue-600",
      2: "text-green-600",
      3: "text-red-600",
      4: "text-purple-600",
      5: "text-maroon-600",
      6: "text-turquoise-600",
      7: "text-black",
      8: "text-gray-600",
    };

    if (cell.status === 'open' && cell.neighborMines > 0) {
      base += " " + colors[cell.neighborMines];
    }

    return base;
  };

  return (
    <div
      className={getCellClassName()}
      onClick={() => onClick(cell.x, cell.y)}
      onContextMenu={(e) => onContextMenu(e, cell.x, cell.y)}
    >
      {getCellContent()}
    </div>
  );
};

export default React.memo(Cell);
