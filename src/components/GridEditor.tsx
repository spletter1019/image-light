import React, { useState } from 'react';
import { CellCoord, GridCell, GridSize, ImageMode } from '../types';

interface Props {
  grid: GridCell[][];
  size: GridSize;
  mode: ImageMode;
  onCellClick: (row: number, col: number) => void;
  hoveredCoord: CellCoord | null;
  onHoverCoord: (coord: CellCoord | null) => void;
  selectedToolColor: string;
  isEyedropperActive: boolean;
  onPickColor: (hex: string) => void;
  showCellValues: boolean;
}

export const GridEditor: React.FC<Props> = ({
  grid,
  size,
  mode,
  onCellClick,
  hoveredCoord,
  onHoverCoord,
  isEyedropperActive,
  onPickColor,
  showCellValues,
}) => {
  const [isMouseDown, setIsMouseDown] = useState(false);

  // Cell size calculation based on grid dimension (모니터 화면에 한눈에 들어오도록 한 번 더 축소)
  const cellSizeClass =
    size === 3
      ? 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 text-[9px] sm:text-xs'
      : size === 4
      ? 'w-6.5 h-6.5 sm:w-7 sm:h-7 md:w-8 md:h-8 text-[8px] sm:text-[9px]'
      : 'w-5.5 h-5.5 sm:w-6 sm:h-6 md:w-6.5 md:h-6.5 text-[7px] sm:text-[8px]';

  const colHeaderClass =
    size === 3
      ? 'w-8 sm:w-9 md:w-10'
      : size === 4
      ? 'w-6.5 sm:w-7 md:w-8'
      : 'w-5.5 sm:w-6 md:w-6.5';

  const rowHeaderClass =
    size === 3
      ? 'h-8 sm:h-9 md:h-10'
      : size === 4
      ? 'h-6.5 sm:h-7 md:h-8'
      : 'h-5.5 sm:h-6 md:h-6.5';

  const handleCellMouseDown = (r: number, c: number) => {
    setIsMouseDown(true);
    if (isEyedropperActive) {
      onPickColor(grid[r][c].hex);
    } else {
      onCellClick(r, c);
    }
  };

  const handleCellMouseEnter = (r: number, c: number) => {
    onHoverCoord({ row: r, col: c });
    if (isMouseDown && !isEyedropperActive) {
      onCellClick(r, c);
    }
  };

  const handleMouseUp = () => {
    setIsMouseDown(false);
  };

  return (
    <div
      className="select-none flex flex-col items-center"
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        setIsMouseDown(false);
        onHoverCoord(null);
      }}
    >
      {/* Column Headers (1, 2, 3...) */}
      <div className="flex pl-3.5 sm:pl-4 mb-0.5">
        {Array.from({ length: size }).map((_, c) => (
          <div
            key={c}
            className={`text-center font-mono text-[9px] sm:text-[10px] font-semibold text-slate-400 ${colHeaderClass}`}
          >
            {c + 1}열
          </div>
        ))}
      </div>

      <div className="flex">
        {/* Row Headers (1, 2, 3...) */}
        <div className="flex flex-col justify-around pr-1 text-right">
          {Array.from({ length: size }).map((_, r) => (
            <div
              key={r}
              className={`flex items-center justify-end font-mono text-[9px] sm:text-[10px] font-semibold text-slate-400 ${rowHeaderClass}`}
            >
              {r + 1}행
            </div>
          ))}
        </div>

        {/* The Grid Table */}
        <div
          className={`grid gap-1 sm:gap-1.5 p-1.5 bg-slate-100 rounded-lg border-2 border-slate-300 shadow-inner ${
            isEyedropperActive ? 'cursor-crosshair' : 'cursor-pointer'
          }`}
          style={{
            gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              const isHovered =
                hoveredCoord?.row === r && hoveredCoord?.col === c;
              // Calculate contrast text color
              const brightness = (cell.r * 299 + cell.g * 587 + cell.b * 114) / 1000;
              const textColor = brightness > 140 ? 'text-slate-900' : 'text-white';
              const textShadow = brightness > 140 ? 'none' : '0 1px 2px rgba(0,0,0,0.6)';

              return (
                <div
                  key={`${r}-${c}`}
                  onMouseDown={() => handleCellMouseDown(r, c)}
                  onMouseEnter={() => handleCellMouseEnter(r, c)}
                  className={`${cellSizeClass} rounded-md border flex flex-col items-center justify-center relative transition-all duration-150 ${
                    isHovered
                      ? 'ring-2 ring-blue-500 scale-[1.03] z-10 border-blue-600 shadow-sm'
                      : 'border-slate-300/80 shadow-xs hover:border-slate-400'
                  }`}
                  style={{ backgroundColor: cell.hex }}
                  title={`(${r + 1}행, ${c + 1}열) 성분값: ${
                    mode !== 'color' ? cell.r : `R:${cell.r}, G:${cell.g}, B:${cell.b}`
                  }`}
                >
                  {/* Coordinate Subscript in corner (only if showCellValues is enabled) */}
                  {showCellValues && (
                    <span
                      className={`absolute top-0.5 left-1 text-[8px] sm:text-[9px] font-mono opacity-60 leading-none ${textColor}`}
                    >
                      ({r + 1},{c + 1})
                    </span>
                  )}

                  {/* Cell Value Overlay */}
                  {showCellValues && (
                    <div
                      className={`text-center font-mono font-medium leading-tight px-0.5 ${textColor}`}
                      style={{ textShadow }}
                    >
                      {mode !== 'color' ? (
                        <span className="text-xs sm:text-sm font-bold tabular-nums">{cell.r}</span>
                      ) : (
                        <div className="flex flex-col text-[8px] sm:text-[9px] tabular-nums font-semibold leading-tight">
                          <span className="text-rose-200">R {cell.r}</span>
                          <span className="text-emerald-200">G {cell.g}</span>
                          <span className="text-blue-200">B {cell.b}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
