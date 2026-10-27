import React from 'react';
import { CellCoord, ImageMode, Matrix } from '../types';

interface Props {
  matrices: {
    R: Matrix;
    G: Matrix;
    B: Matrix;
    A: Matrix; // Grayscale single matrix
  };
  mode: ImageMode;
  hoveredCoord: CellCoord | null;
  onHoverCoord: (coord: CellCoord | null) => void;
  titlePrefix?: string;
  isTransformed?: boolean;
  kValue?: number;
}

export const MatrixViewer: React.FC<Props> = ({
  matrices,
  mode,
  hoveredCoord,
  onHoverCoord,
  titlePrefix = '',
  isTransformed = false,
  kValue = 0,
}) => {
  const renderSingleMatrix = (
    matrix: Matrix,
    label: string,
    accentColor: 'rose' | 'emerald' | 'blue' | 'slate',
    channelName: string
  ) => {
    const colorClasses = {
      rose: {
        border: 'border-rose-300',
        bracket: 'text-rose-600',
        labelBg: 'bg-rose-50 text-rose-700 border-rose-200',
        highlight: 'bg-rose-100 text-rose-900 font-bold ring-2 ring-rose-500',
        cellText: 'text-rose-950',
      },
      emerald: {
        border: 'border-emerald-300',
        bracket: 'text-emerald-600',
        labelBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        highlight: 'bg-emerald-100 text-emerald-900 font-bold ring-2 ring-emerald-500',
        cellText: 'text-emerald-950',
      },
      blue: {
        border: 'border-blue-300',
        bracket: 'text-blue-600',
        labelBg: 'bg-blue-50 text-blue-700 border-blue-200',
        highlight: 'bg-blue-100 text-blue-900 font-bold ring-2 ring-blue-500',
        cellText: 'text-blue-950',
      },
      slate: {
        border: 'border-slate-300',
        bracket: 'text-slate-700',
        labelBg: 'bg-slate-100 text-slate-800 border-slate-200',
        highlight: 'bg-blue-100 text-blue-900 font-bold ring-2 ring-blue-500',
        cellText: 'text-slate-800',
      },
    }[accentColor];

    return (
      <div className="flex flex-col items-center flex-1 min-w-0 p-2 sm:p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-xs">
        {/* Matrix Display with Brackets */}
        <div className="flex items-center justify-center my-auto py-1 sm:py-2 w-full overflow-x-auto">
          {/* Left Bracket */}
          <div className={`w-1.5 sm:w-2.5 self-stretch matrix-bracket-left shrink-0 ${colorClasses.bracket}`} />

          {/* Matrix Elements Grid */}
          <div className="grid gap-x-1 sm:gap-x-1.5 gap-y-1 sm:gap-y-1 px-1 sm:px-1.5 py-0.5">
            {matrix.map((row, r) => (
              <div key={r} className="flex items-center justify-center gap-1 sm:gap-1.5">
                {row.map((val, c) => {
                  const isHovered = hoveredCoord?.row === r && hoveredCoord?.col === c;
                  const isClampedHigh = isTransformed && val === 255 && kValue > 0;
                  const isClampedLow = isTransformed && val === 0 && kValue < 0;

                  const dim = matrix.length;
                  const sizeClasses =
                    dim === 5
                      ? 'min-w-[20px] sm:min-w-[24px] md:min-w-[28px] h-5 sm:h-6 md:h-6.5 text-[9px] sm:text-[10px] md:text-xs'
                      : dim === 4
                      ? 'min-w-[22px] sm:min-w-[28px] md:min-w-[32px] h-5.5 sm:h-6.5 md:h-7 text-[10px] sm:text-[11px] md:text-xs'
                      : 'min-w-[24px] sm:min-w-[32px] md:min-w-[36px] h-6 sm:h-7 md:h-8 text-[11px] sm:text-xs md:text-sm';

                  return (
                    <div
                      key={`${r}-${c}`}
                      onMouseEnter={() => onHoverCoord({ row: r, col: c })}
                      onMouseLeave={() => onHoverCoord(null)}
                      className={`${sizeClasses} flex items-center justify-center rounded font-mono tabular-nums cursor-pointer transition-all duration-150 relative ${
                        isHovered
                          ? colorClasses.highlight
                          : 'hover:bg-slate-100 ' + colorClasses.cellText
                      } ${
                        isClampedHigh
                          ? 'bg-amber-50 text-amber-900 border border-amber-300'
                          : isClampedLow
                          ? 'bg-indigo-50 text-indigo-900 border border-indigo-300'
                          : ''
                      }`}
                      title={`${r + 1}행 ${c + 1}열 성분값: ${val}${
                        isClampedHigh ? ' (255로 클리핑됨)' : isClampedLow ? ' (0으로 클리핑됨)' : ''
                      }`}
                    >
                      <span>{val}</span>
                      {isClampedHigh && (
                        <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
                      )}
                      {isClampedLow && (
                        <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-indigo-500" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Right Bracket */}
          <div className={`w-1.5 sm:w-2.5 self-stretch matrix-bracket-right shrink-0 ${colorClasses.bracket}`} />
        </div>
      </div>
    );
  };

  if (mode === 'monochrome' || mode === 'grayscale') {
    const isMono = mode === 'monochrome';
    const mainMatrixName = isTransformed
      ? kValue >= 0
        ? '행렬 B (결과)'
        : '행렬 C (결과)'
      : isMono
      ? '행렬 A (흑백)'
      : '행렬 A (명암)';

    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            {isMono
              ? '이진 흑백(0: 검정, 255: 흰색) 단일 행렬 표현'
              : '8비트 회색조(0: 검정 ~ 255: 흰색) 단일 행렬 표현'}
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            {isMono ? '0 또는 255' : 'R = G = B'}
          </span>
        </div>
        <div className="flex justify-center">
          {renderSingleMatrix(
            matrices.A,
            `${titlePrefix}${mainMatrixName}`,
            'slate',
            isMono ? '흑백 성분' : '회색조 명암 성분'
          )}
        </div>
      </div>
    );
  }

  // Color mode: Three matrices R, G, B side by side
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>각 픽셀의 빨강(R), 초록(G), 파랑(B) 성분 행렬</span>
        <span className="font-mono text-[11px] text-slate-400">3개 채널 분리</span>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {renderSingleMatrix(
          matrices.R,
          `${titlePrefix}${isTransformed ? "R'" : 'R'}`,
          'rose',
          '빨강(R)'
        )}
        {renderSingleMatrix(
          matrices.G,
          `${titlePrefix}${isTransformed ? "G'" : 'G'}`,
          'emerald',
          '초록(G)'
        )}
        {renderSingleMatrix(
          matrices.B,
          `${titlePrefix}${isTransformed ? "B'" : 'B'}`,
          'blue',
          '파랑(B)'
        )}
      </div>
    </div>
  );
};
