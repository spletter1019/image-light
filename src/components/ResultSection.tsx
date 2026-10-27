import React, { useState } from 'react';
import { CellCoord, GridSize, ImageMode, Matrix, TransformedCell } from '../types';
import { MatrixViewer } from './MatrixViewer';
import { Layers } from 'lucide-react';

interface Props {
  transformedGrid: TransformedCell[][];
  transformedMatrices: {
    R: Matrix;
    G: Matrix;
    B: Matrix;
    A: Matrix;
  };
  size: GridSize;
  mode: ImageMode;
  kValue: number;
  cValue: number;
  hoveredCoord: CellCoord | null;
  onHoverCoord: (coord: CellCoord | null) => void;
  showCellValues: boolean;
  onApplyAsOriginal: () => void;
}

export const ResultSection: React.FC<Props> = ({
  transformedGrid,
  transformedMatrices,
  size,
  mode,
  kValue,
  cValue,
  hoveredCoord,
  onHoverCoord,
  showCellValues,
  onApplyAsOriginal,
}) => {
  const [selectedInspectCell, setSelectedInspectCell] = useState<CellCoord | null>(null);

  // Cell size calculation matching GridEditor exactly (모니터 화면에 한눈에 들어오도록 한 번 더 축소)
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

  // Find any clamped cells to highlight the clipping rule in action
  const clampedCellsCount = transformedGrid.flat().filter((c) => c.isRClamped || c.isGClamped || c.isBClamped).length;

  const inspectedData = selectedInspectCell
    ? transformedGrid[selectedInspectCell.row][selectedInspectCell.col]
    : hoveredCoord
    ? transformedGrid[hoveredCoord.row][hoveredCoord.col]
    : null;

  const inspectedCoord = selectedInspectCell || hoveredCoord;

  const formattedCValue = Number.isInteger(cValue) ? cValue : Number(cValue.toFixed(1));

  const renderFormula = (orig: number, raw: number, finalVal: number, isClamped: boolean) => {
    let expr = '';
    if (cValue !== 1 && kValue !== 0) {
      expr = `${formattedCValue} × ${orig} ${kValue >= 0 ? `+ ${kValue}` : `- ${Math.abs(kValue)}`} = `;
    } else if (cValue !== 1) {
      expr = `${formattedCValue} × ${orig} = `;
    } else {
      expr = `${orig} ${kValue >= 0 ? `+ ${kValue}` : `- ${Math.abs(kValue)}`} = `;
    }

    return (
      <div>
        {expr}
        <span className={isClamped ? 'line-through text-slate-400' : 'font-bold'}>
          {raw}
        </span>{' '}
        {isClamped && (
          <span className="font-bold text-amber-700">
            → {finalVal} ({raw > 255 ? '최댓값 255 제한' : '최솟값 0 제한'})
          </span>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-3 sm:p-3.5 space-y-2">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                <span>결과 이미지</span>
                <span className="text-[11px] font-normal text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded-full border border-emerald-200">
                  우측
                </span>
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {cValue !== 1 && kValue !== 0
                ? `행렬에 실수배 (${formattedCValue}배) 및 덧셈/뺄셈 값 (${kValue >= 0 ? `+${kValue}` : kValue})을 연산한 색상 표와 연산 결과 행렬입니다.`
                : cValue !== 1
                ? `행렬에 실수배 (${formattedCValue}배)를 곱한 색상 표와 연산 결과 행렬입니다.`
                : `행렬에 슬라이더 값(${kValue >= 0 ? `+${kValue}` : kValue})을 더한 색상 표와 연산 결과 행렬입니다.`}
            </p>
          </div>

          {/* Action button: Apply result as original */}
          <button
            type="button"
            onClick={onApplyAsOriginal}
            className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors self-start sm:self-auto shrink-0"
            title="현재 변환된 결과를 새 원본으로 설정하여 연속적인 변환 실습 진행"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>새 원본으로 적용</span>
          </button>
        </div>

        {/* 1. 결과 이미지 표 (크기 축소) */}
        <div className="py-1.5 flex flex-col items-center">
          {/* Column Headers */}
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
            {/* Row Headers */}
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

            {/* Transformed Grid */}
            <div
              className="grid gap-1 sm:gap-1.5 p-1.5 bg-slate-100 rounded-lg border-2 border-emerald-300/80 shadow-inner"
              style={{
                gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
              }}
            >
              {transformedGrid.map((row, r) =>
                row.map((cell, c) => {
                  const isHovered = hoveredCoord?.row === r && hoveredCoord?.col === c;
                  const isSelected = selectedInspectCell?.row === r && selectedInspectCell?.col === c;
                  const brightness = (cell.r * 299 + cell.g * 587 + cell.b * 114) / 1000;
                  const textColor = brightness > 140 ? 'text-slate-900' : 'text-white';
                  const textShadow = brightness > 140 ? 'none' : '0 1px 2px rgba(0,0,0,0.6)';

                  return (
                    <div
                      key={`res-${r}-${c}`}
                      onClick={() => setSelectedInspectCell(isSelected ? null : { row: r, col: c })}
                      onMouseEnter={() => onHoverCoord({ row: r, col: c })}
                      onMouseLeave={() => onHoverCoord(null)}
                      className={`${cellSizeClass} rounded-md border flex flex-col items-center justify-center relative cursor-pointer transition-all duration-150 ${
                        isHovered || isSelected
                          ? 'ring-2 ring-emerald-500 scale-[1.03] z-10 border-emerald-600 shadow-sm'
                          : 'border-slate-300 shadow-xs hover:border-slate-400'
                      }`}
                      style={{ backgroundColor: cell.hex }}
                      title={`변환 결과: (${r + 1}행, ${c + 1}열) R:${cell.r}, G:${cell.g}, B:${cell.b}`}
                    >
                      {/* Coordinate (only if showCellValues is enabled) */}
                      {showCellValues && (
                        <span
                          className={`absolute top-0.5 left-1 text-[8px] sm:text-[9px] font-mono opacity-60 leading-none ${textColor}`}
                        >
                          ({r + 1},{c + 1})
                        </span>
                      )}

                      {/* Clamping indicator badge (only if showCellValues is enabled) */}
                      {showCellValues && (cell.isRClamped || cell.isGClamped || cell.isBClamped) && (
                        <span
                          className="absolute top-0.5 right-0.5 px-0.5 py-0.1 rounded text-[8px] font-bold bg-amber-500 text-white shadow-xs"
                          title="0 또는 255 범위로 클리핑된 픽셀"
                        >
                          클리핑
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
                              <span className="text-rose-200">R' {cell.r}</span>
                              <span className="text-emerald-200">G' {cell.g}</span>
                              <span className="text-blue-200">B' {cell.b}</span>
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

        {/* 2. 결과 이미지 표 바로 아래쪽: 연산 결과 행렬만 배치 */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              {mode === 'monochrome' || mode === 'grayscale'
                ? cValue !== 1 && kValue !== 0
                  ? `연산 결과 행렬 B (${formattedCValue} · A + [${kValue}])`
                  : cValue !== 1
                  ? `연산 결과 행렬 B (${formattedCValue} · A)`
                  : `연산 결과 행렬 ${kValue >= 0 ? 'B' : 'C'} (A + [${kValue}])`
                : cValue !== 1 && kValue !== 0
                ? `연산 결과 행렬 R', G', B' (${formattedCValue} · 성분 + [${kValue}])`
                : cValue !== 1
                ? `연산 결과 행렬 R', G', B' (${formattedCValue} · 성분)`
                : `연산 결과 행렬 R', G', B' (각 성분 + [${kValue}])`}
            </span>

            {clampedCellsCount > 0 && (
              <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                클리핑: {clampedCellsCount}개 성분 제한됨
              </span>
            )}
          </div>

          {/* Matrix display component */}
          <div className="py-0.5">
            <MatrixViewer
              matrices={transformedMatrices}
              mode={mode}
              hoveredCoord={hoveredCoord}
              onHoverCoord={onHoverCoord}
              titlePrefix="결과 "
              isTransformed={true}
              kValue={kValue}
            />
          </div>

          {/* Interactive Element Inspection Box */}
          {inspectedData && inspectedCoord && (
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/90 text-xs space-y-1 mt-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-700">
                  선택된 성분 ({inspectedCoord.row + 1}행, {inspectedCoord.col + 1}열) 계산 과정 상세:
                </span>
                <span className="font-mono text-slate-400 text-[11px]">
                  {mode === 'monochrome'
                    ? '흑백 단일 채널'
                    : mode === 'grayscale'
                    ? '회색조 단일 채널'
                    : 'RGB 3개 채널'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-mono">
                {/* Channel R or Grayscale/Monochrome */}
                <div
                  className={`p-2 rounded-lg border ${
                    inspectedData.isRClamped
                      ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                      : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div
                    className={`text-[11px] font-bold mb-0.5 ${
                      mode === 'color' ? 'text-rose-600' : 'text-slate-800'
                    }`}
                  >
                    {mode === 'monochrome'
                      ? '흑백(A) 성분'
                      : mode === 'grayscale'
                      ? '명암(A) 성분'
                      : '빨강(R) 성분'}
                  </div>
                  {renderFormula(
                    inspectedData.originalR,
                    inspectedData.rawR,
                    inspectedData.r,
                    inspectedData.isRClamped
                  )}
                </div>

                {/* Channel G */}
                {mode === 'color' && (
                  <div
                    className={`p-2 rounded-lg border ${
                      inspectedData.isGClamped
                        ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="text-[11px] font-bold text-emerald-600 mb-0.5">초록(G) 성분</div>
                    {renderFormula(
                      inspectedData.originalG,
                      inspectedData.rawG,
                      inspectedData.g,
                      inspectedData.isGClamped
                    )}
                  </div>
                )}

                {/* Channel B */}
                {mode === 'color' && (
                  <div
                    className={`p-2 rounded-lg border ${
                      inspectedData.isBClamped
                        ? 'bg-amber-50/70 border-amber-300 text-amber-900'
                        : 'bg-white border-slate-200 text-slate-800'
                    }`}
                  >
                    <div className="text-[11px] font-bold text-blue-600 mb-0.5">파랑(B) 성분</div>
                    {renderFormula(
                      inspectedData.originalB,
                      inspectedData.rawB,
                      inspectedData.b,
                      inspectedData.isBClamped
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
