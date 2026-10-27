/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useCallback } from 'react';
import {
  GridSize,
  ImageMode,
  GridCell,
  CellCoord,
} from './types';
import {
  createEmptyGrid,
  extractMatrices,
  transformGrid,
  makeGrayscaleCell,
  makeColorCell,
  hexToRgb,
} from './utils/matrixUtils';
import { GoogleSheetsColorPicker } from './components/GoogleSheetsColorPicker';
import { GridEditor } from './components/GridEditor';
import { MatrixViewer } from './components/MatrixViewer';
import { ResultSection } from './components/ResultSection';
import {
  RotateCcw,
  Eye,
  EyeOff,
} from 'lucide-react';

export default function App() {
  // Application State
  const [mode, setMode] = useState<ImageMode>('grayscale');
  const [size, setSize] = useState<GridSize>(3);
  const [selectedToolColor, setSelectedToolColor] = useState<string>('#e69999'); // Default fill color
  const [isEyedropperActive, setIsEyedropperActive] = useState<boolean>(false);
  const [showCellValues, setShowCellValues] = useState<boolean>(false);
  const [hoveredCoord, setHoveredCoord] = useState<CellCoord | null>(null);
  const [kValue, setKValue] = useState<number>(0);
  const [cValue, setCValue] = useState<number>(1); // 실수배 슬라이더 (0~255, 기본 배율 1)

  // Initialize with initial 3x3 grid
  const [grid, setGrid] = useState<GridCell[][]>(() => createEmptyGrid(3, 'grayscale'));

  // Handle Mode Change (monochrome <-> grayscale <-> color)
  const handleModeChange = (newMode: ImageMode) => {
    if (newMode === mode) return;
    setMode(newMode);
    // Convert current grid cells to appropriate color format
    const newGrid = grid.map((row) =>
      row.map((cell) => {
        if (newMode === 'monochrome') {
          const gray = Math.round((cell.r + cell.g + cell.b) / 3);
          const binary = gray < 128 ? 0 : 255;
          return makeGrayscaleCell(binary);
        } else if (newMode === 'grayscale') {
          const gray = Math.round((cell.r + cell.g + cell.b) / 3);
          return makeGrayscaleCell(gray);
        } else {
          return cell;
        }
      })
    );
    setGrid(newGrid);
    if (newMode === 'monochrome') {
      setSelectedToolColor('#000000');
    } else if (newMode === 'grayscale') {
      setSelectedToolColor('#808080');
    } else {
      setSelectedToolColor('#cc4125');
    }
  };

  // Handle Size Change (3x3, 4x4, 5x5)
  const handleSizeChange = (newSize: GridSize) => {
    if (newSize === size) return;
    setSize(newSize);

    // If an existing preset matches, or adjust grid dimensions
    const newGrid: GridCell[][] = [];
    const defaultVal = 255;
    for (let r = 0; r < newSize; r++) {
      const row: GridCell[] = [];
      for (let c = 0; c < newSize; c++) {
        if (grid[r] && grid[r][c]) {
          row.push(grid[r][c]);
        } else {
          row.push(mode !== 'color' ? makeGrayscaleCell(defaultVal) : makeColorCell(255, 255, 255));
        }
      }
      newGrid.push(row);
    }
    setGrid(newGrid);
  };

  // Handle Single Cell Painting
  const handleCellClick = useCallback(
    (row: number, col: number) => {
      setGrid((prev) => {
        const next = prev.map((r, rIdx) =>
          r.map((c, cIdx) => {
            if (rIdx === row && cIdx === col) {
              const rgb = hexToRgb(selectedToolColor);
              if (mode === 'monochrome') {
                const gray = Math.round((rgb.r + rgb.g + rgb.b) / 3);
                const binary = gray < 128 ? 0 : 255;
                return makeGrayscaleCell(binary);
              }
              if (mode === 'grayscale') {
                const gray = Math.round((rgb.r + rgb.g + rgb.b) / 3);
                return makeGrayscaleCell(gray);
              }
              return makeColorCell(rgb.r, rgb.g, rgb.b);
            }
            return c;
          })
        );
        return next;
      });
    },
    [selectedToolColor, mode]
  );

  // Fill All Cells
  const handleFillAll = (hex: string) => {
    const rgb = hexToRgb(hex);
    setGrid((prev) =>
      prev.map((r) =>
        r.map(() => {
          if (mode === 'monochrome') {
            const gray = Math.round((rgb.r + rgb.g + rgb.b) / 3);
            const binary = gray < 128 ? 0 : 255;
            return makeGrayscaleCell(binary);
          }
          if (mode === 'grayscale') {
            const gray = Math.round((rgb.r + rgb.g + rgb.b) / 3);
            return makeGrayscaleCell(gray);
          }
          return makeColorCell(rgb.r, rgb.g, rgb.b);
        })
      )
    );
  };

  // Reset Grid to all white
  const handleResetGrid = () => {
    setGrid(createEmptyGrid(size, mode));
    setKValue(0);
    setCValue(1);
  };

  // Eyedropper Color Pick
  const handlePickColor = (hex: string) => {
    setSelectedToolColor(hex);
    setIsEyedropperActive(false);
  };

  // Original extracted channel matrices (R, G, B, A)
  const originalMatrices = useMemo(() => {
    return extractMatrices(grid);
  }, [grid]);

  // Transformed grid and resulting matrices based on slider kValue and cValue
  const { transformedGrid, transformedR, transformedG, transformedB, transformedA } =
    useMemo(() => {
      return transformGrid(grid, kValue, mode, cValue);
    }, [grid, kValue, mode, cValue]);

  const transformedMatrices = useMemo(() => {
    return {
      R: transformedR,
      G: transformedG,
      B: transformedB,
      A: transformedA,
    };
  }, [transformedR, transformedG, transformedB, transformedA]);

  // Apply result as new original
  const handleApplyAsOriginal = () => {
    setGrid(
      transformedGrid.map((row) =>
        row.map((cell) => ({
          r: cell.r,
          g: cell.g,
          b: cell.b,
          hex: cell.hex,
        }))
      )
    );
    setKValue(0);
    setCValue(1);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Top Bar following design constitution */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-13 flex items-center justify-between gap-4">
          {/* Zone 1: Brand title */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <span className="font-mono font-black text-xs tracking-tighter">cA+K</span>
            </div>
            <div>
              <h1 className="text-sm sm:text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
                이미지 밝기 변환 실습실
              </h1>
              <div className="hidden sm:flex items-center gap-2 text-[11px] text-slate-500">
                <span>인공지능 수학</span>
                <span aria-hidden="true">·</span>
                <span>교과서 90~91쪽 연계</span>
                <span aria-hidden="true">·</span>
                <span>행렬의 덧셈과 뺄셈, 실수배</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto px-3 sm:px-5 py-3 w-full flex-1 space-y-3">
        {/* Top Control Bar: Requirements 1, 2, 3 and presets */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-2.5 sm:p-3">
          <div className="flex flex-wrap items-center justify-between gap-2.5 sm:gap-3">
            {/* (1) Grid Size Switcher: 3x3, 4x4, 5x5 */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">표 크기:</span>
              <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/80">
                {([3, 4, 5] as GridSize[]).map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleSizeChange(s)}
                    className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-md transition-all whitespace-nowrap ${
                      size === s
                        ? 'bg-white text-blue-700 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {s}×{s}
                  </button>
                ))}
              </div>
            </div>

            {/* (2) Mode Switcher: 흑백 vs 회색조 vs 컬러 */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">모드:</span>
              <div className="flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => handleModeChange('monochrome')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                    mode === 'monochrome'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  흑백 이미지
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('grayscale')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                    mode === 'grayscale'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  회색조 이미지
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('color')}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                    mode === 'color'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  컬러 이미지
                </button>
              </div>
            </div>

            {/* (3) Google Sheets Color Fill Tool */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">색상 도구:</span>
              <GoogleSheetsColorPicker
                selectedColor={selectedToolColor}
                onSelectColor={setSelectedToolColor}
                mode={mode}
                onFillAll={handleFillAll}
                isEyedropperActive={isEyedropperActive}
                onToggleEyedropper={() => setIsEyedropperActive(!isEyedropperActive)}
              />
            </div>

            {/* (4) Sliders: 덧셈/뺄셈 슬라이더 및 실수배 슬라이더 (0.1 간격 지원) */}
            <div className="flex flex-col gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-lg border border-slate-200/80">
              {/* Row 1: 덧셈/뺄셈 슬라이더 */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap min-w-[100px]">
                  덧셈/뺄셈 슬라이더:
                </span>

                {/* Slider track with under-dot value badge */}
                <div className="relative w-28 sm:w-36 md:w-44 pt-0.5 pb-3 flex items-center">
                  <input
                    type="range"
                    min="-255"
                    max="255"
                    step="1"
                    value={kValue}
                    onChange={(e) => setKValue(parseInt(e.target.value, 10))}
                    aria-label="덧셈/뺄셈 조절 슬라이더"
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-gradient-to-r from-indigo-300 via-slate-200 to-amber-300 shadow-inner"
                  />
                  {/* Zero marker line */}
                  <div className="absolute top-0.5 bottom-3 left-1/2 w-0.5 bg-slate-400 pointer-events-none -translate-x-1/2" />

                  {/* Point (Thumb) direct under-value badge */}
                  {(() => {
                    const percent = ((kValue + 255) / 510) * 100;
                    const thumbOffset = (50 - percent) * 0.16;
                    return (
                      <div
                        className="absolute top-3 flex flex-col items-center pointer-events-none transition-all duration-75 z-10"
                        style={{
                          left: `calc(${percent}% + ${thumbOffset}px)`,
                          transform: 'translateX(-50%)',
                        }}
                      >
                        <div
                          className={`w-0 h-0 border-x-[3px] border-x-transparent border-b-[3px] ${
                            kValue > 0
                              ? 'border-b-amber-500'
                              : kValue < 0
                              ? 'border-b-indigo-500'
                              : 'border-b-blue-600'
                          }`}
                        />
                        <div
                          className={`px-1 py-0.2 rounded text-[9px] font-mono font-bold shadow-xs whitespace-nowrap tabular-nums text-white flex items-center gap-0.5 ${
                            kValue > 0
                              ? 'bg-amber-600 ring-1 ring-amber-400'
                              : kValue < 0
                              ? 'bg-indigo-600 ring-1 ring-indigo-400'
                              : 'bg-blue-600 ring-1 ring-blue-400'
                          }`}
                        >
                          <span>{kValue > 0 ? `+${kValue}` : kValue}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Number Input & 0 Reset */}
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    min="-255"
                    max="255"
                    value={kValue}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      setKValue(isNaN(val) ? 0 : Math.max(-255, Math.min(255, val)));
                    }}
                    className="w-12 text-center font-mono font-bold text-xs px-1 py-0.5 border border-slate-300 rounded focus:outline-blue-500 tabular-nums bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setKValue(0)}
                    title="덧셈/뺄셈 슬라이더 0으로 초기화"
                    className="px-1.5 py-0.5 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-100 border border-slate-200 rounded transition-colors"
                  >
                    0
                  </button>
                </div>
              </div>

              {/* Row 2: 실수배 슬라이더 (0 이상 255 이하, 0.1 간격) */}
              <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60">
                <span className="text-xs font-semibold text-slate-500 whitespace-nowrap min-w-[100px]">
                  실수배 슬라이더:
                </span>

                {/* Slider track with under-dot value badge */}
                <div className="relative w-28 sm:w-36 md:w-44 pt-0.5 pb-3 flex items-center">
                  <input
                    type="range"
                    min="0"
                    max="255"
                    step="0.1"
                    value={cValue}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setCValue(isNaN(val) ? 1 : Math.round(val * 10) / 10);
                    }}
                    aria-label="실수배 조절 슬라이더"
                    className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-emerald-600 bg-gradient-to-r from-slate-200 via-emerald-200 to-teal-400 shadow-inner"
                  />
                  {/* 1 marker indicator */}
                  <div
                    className="absolute top-0.5 bottom-3 w-0.5 bg-emerald-500 pointer-events-none -translate-x-1/2"
                    style={{ left: `${(1 / 255) * 100}%` }}
                    title="기본 배율 1"
                  />

                  {/* Point (Thumb) direct under-value badge */}
                  {(() => {
                    const percent = (cValue / 255) * 100;
                    const thumbOffset = (50 - percent) * 0.16;
                    const displayC = Number.isInteger(cValue) ? cValue : Number(cValue.toFixed(1));
                    return (
                      <div
                        className="absolute top-3 flex flex-col items-center pointer-events-none transition-all duration-75 z-10"
                        style={{
                          left: `calc(${percent}% + ${thumbOffset}px)`,
                          transform: 'translateX(-50%)',
                        }}
                      >
                        <div className="w-0 h-0 border-x-[3px] border-x-transparent border-b-[3px] border-b-emerald-600" />
                        <div className="px-1 py-0.2 rounded text-[9px] font-mono font-bold shadow-xs whitespace-nowrap tabular-nums text-white bg-emerald-600 ring-1 ring-emerald-400 flex items-center gap-0.5">
                          <span>×{displayC}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Number Input & 1 Reset */}
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    min="0"
                    max="255"
                    step="0.1"
                    value={Number.isInteger(cValue) ? cValue : Number(cValue.toFixed(1))}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setCValue(isNaN(val) ? 1 : Math.max(0, Math.min(255, Math.round(val * 10) / 10)));
                    }}
                    className="w-14 text-center font-mono font-bold text-xs px-1 py-0.5 border border-slate-300 rounded focus:outline-emerald-500 tabular-nums bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => setCValue(1)}
                    title="실수배 슬라이더 1배(원본)로 초기화"
                    className="px-1.5 py-0.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                  >
                    1
                  </button>
                </div>
              </div>
            </div>

            {/* (5) Utilities: Show cell values & Reset */}
            <div className="flex items-center gap-2 sm:ml-auto">
              <button
                type="button"
                onClick={() => setShowCellValues(!showCellValues)}
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-lg border transition-colors ${
                  showCellValues
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
                title="표 안의 각 셀에 숫자값(RGB/명암) 표시 전환"
              >
                {showCellValues ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                <span>숫자값 {showCellValues ? '숨기기' : '보기'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetGrid}
                className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors"
                title="표의 모든 칸을 흰색(255)으로 초기화"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>지우기</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main 2-Column Side-by-Side Comparison: Left (원본 이미지 + 행렬), Right (결과 이미지 + 행렬) */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3.5 items-start">
          {/* [좌측 카드] 원본 이미지 (표 바로 아래쪽에 행렬만 한 카드에 포함) */}
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm p-3 sm:p-3.5 space-y-2">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center shrink-0">
                    1
                  </span>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                      <span>원본 이미지</span>
                      <span className="text-[11px] font-normal text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded-full border border-blue-200">
                        좌측
                      </span>
                    </h2>
                    <p className="text-[11px] text-slate-500">
                      표에 색을 칠하면 바로 아래 행렬에 각 픽셀 채널값이 실시간으로 표시됩니다.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 self-start sm:self-auto">
                  <span className="font-mono bg-slate-100 px-1.5 py-0.2 rounded text-[11px] border border-slate-200">
                    {size}×{size}
                  </span>
                </div>
              </div>

              {/* 1. 원본 이미지 표 (크기 축소) */}
              <div className="py-1.5 flex justify-center">
                <GridEditor
                  grid={grid}
                  size={size}
                  mode={mode}
                  onCellClick={handleCellClick}
                  hoveredCoord={hoveredCoord}
                  onHoverCoord={setHoveredCoord}
                  selectedToolColor={selectedToolColor}
                  isEyedropperActive={isEyedropperActive}
                  onPickColor={handlePickColor}
                  showCellValues={showCellValues}
                />
              </div>

              {/* 2. 원본 이미지 표 바로 아래쪽: 행렬만 배치 */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600" />
                    {mode === 'monochrome'
                      ? '원본 이미지 행렬 A (흑백)'
                      : mode === 'grayscale'
                      ? '원본 이미지 행렬 A (명암)'
                      : '원본 이미지 채널별 행렬 R, G, B'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    표의 각 칸 ↔ 행렬의 대응 성분
                  </span>
                </div>

                <div className="py-1">
                  <MatrixViewer
                    matrices={originalMatrices}
                    mode={mode}
                    hoveredCoord={hoveredCoord}
                    onHoverCoord={setHoveredCoord}
                    titlePrefix="원본 "
                  />
                </div>
              </div>
            </div>
          </div>

          {/* [우측 카드] 결과 이미지 (표 바로 아래쪽에 연산 결과 행렬만 한 카드에 포함) */}
          <ResultSection
            transformedGrid={transformedGrid}
            transformedMatrices={transformedMatrices}
            size={size}
            mode={mode}
            kValue={kValue}
            cValue={cValue}
            hoveredCoord={hoveredCoord}
            onHoverCoord={setHoveredCoord}
            showCellValues={showCellValues}
            onApplyAsOriginal={handleApplyAsOriginal}
          />
        </div>

      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-2 px-4 text-center text-[11px] text-slate-500">
        <div className="max-w-7xl mx-auto flex items-center justify-center">
          <span>인공지능 수학-행렬의 덧셈과 뺄셈, 실수배를 이용한 이미지 밝기 변환 실습</span>
        </div>
      </footer>
    </div>
  );
}
