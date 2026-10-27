import React from 'react';
import { Sun, Moon, RotateCcw, Plus, Minus, Sparkles } from 'lucide-react';
import { GridSize, ImageMode } from '../types';

interface Props {
  kValue: number;
  onChangeK: (val: number) => void;
  mode: ImageMode;
  size: GridSize;
}

export const BrightnessControl: React.FC<Props> = ({
  kValue,
  onChangeK,
  mode,
  size,
}) => {
  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeK(parseInt(e.target.value, 10));
  };

  const step = (delta: number) => {
    const next = Math.max(-255, Math.min(255, kValue + delta));
    onChangeK(next);
  };

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-sm p-4 sm:p-5 space-y-4">
      {/* Header and Value */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div
              className={`p-2 rounded-xl ${
                kValue > 0
                  ? 'bg-amber-100 text-amber-700'
                  : kValue < 0
                  ? 'bg-indigo-100 text-indigo-700'
                  : 'bg-slate-100 text-slate-700'
              }`}
            >
              {kValue > 0 ? (
                <Sun className="w-5 h-5" />
              ) : kValue < 0 ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                밝기 변환 정수 슬라이더 ({kValue >= 0 ? `+${kValue}` : kValue})
              </h3>
              <p className="text-xs text-slate-500">
                {kValue > 0
                  ? `모든 성분에 +${kValue}를 더하여 이미지를 밝게 변환합니다 (덧셈 연산)`
                  : kValue < 0
                  ? `모든 성분에서 ${Math.abs(kValue)}를 빼서 이미지를 어둡게 변환합니다 (뺄셈 연산)`
                  : '변화 없음 (원본 유지, k = 0)'}
              </p>
            </div>
          </div>
        </div>

        {/* Direct Integer Input & Reset */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="relative">
            <input
              type="number"
              min="-255"
              max="255"
              value={kValue}
              onChange={(e) => {
                const num = parseInt(e.target.value, 10);
                if (!isNaN(num)) {
                  onChangeK(Math.max(-255, Math.min(255, num)));
                } else {
                  onChangeK(0);
                }
              }}
              className="w-24 text-center font-mono font-bold text-base px-2 py-1.5 border border-slate-300 rounded-lg focus:outline-blue-500 tabular-nums"
            />
            <span className="absolute right-2 top-2 text-[10px] text-slate-400 font-mono pointer-events-none">
              값
            </span>
          </div>

          <button
            type="button"
            onClick={() => onChangeK(0)}
            title="슬라이더 0으로 초기화"
            className="flex items-center gap-1 px-3 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>0 초기화</span>
          </button>
        </div>
      </div>

      {/* The -255 to +255 Slider */}
      <div className="space-y-1.5 pt-1">
        <div className="flex items-center justify-between text-xs font-mono text-slate-500">
          <span className="flex items-center gap-1 text-indigo-600 font-semibold">
            <Moon className="w-3.5 h-3.5" /> -255 (최대 어둡게)
          </span>
          <span className="text-slate-400">0 (원본 유지)</span>
          <span className="flex items-center gap-1 text-amber-600 font-semibold">
            <Sun className="w-3.5 h-3.5" /> +255 (최대 밝게)
          </span>
        </div>

        <div className="relative pt-1 pb-7">
          <input
            type="range"
            min="-255"
            max="255"
            step="1"
            value={kValue}
            onChange={handleSliderChange}
            aria-label="밝기 조절 슬라이더"
            className="w-full h-3 rounded-lg appearance-none cursor-pointer accent-blue-600 bg-gradient-to-r from-indigo-300 via-slate-200 to-amber-300 shadow-inner"
          />
          {/* Zero marker line */}
          <div className="absolute top-1 bottom-7 left-1/2 w-0.5 bg-slate-400 pointer-events-none -translate-x-1/2" />

          {/* (1) Thumb direct under-value badge: 점 바로 아래쪽에 값 표시 */}
          {(() => {
            const percent = ((kValue + 255) / 510) * 100;
            const thumbOffset = (50 - percent) * 0.16;
            return (
              <div
                className="absolute top-5 flex flex-col items-center pointer-events-none transition-all duration-75 z-10"
                style={{
                  left: `calc(${percent}% + ${thumbOffset}px)`,
                  transform: 'translateX(-50%)',
                }}
              >
                {/* Caret arrow pointing up to the dot */}
                <div
                  className={`w-0 h-0 border-x-4 border-x-transparent border-b-4 ${
                    kValue > 0
                      ? 'border-b-amber-500'
                      : kValue < 0
                      ? 'border-b-indigo-500'
                      : 'border-b-blue-600'
                  }`}
                />
                {/* Badge showing the current value directly underneath the dot */}
                <div
                  className={`px-2.5 py-0.5 rounded-md text-xs font-mono font-bold shadow-sm whitespace-nowrap tabular-nums text-white flex items-center gap-1.5 ${
                    kValue > 0
                      ? 'bg-amber-600 ring-1 ring-amber-400'
                      : kValue < 0
                      ? 'bg-indigo-600 ring-1 ring-indigo-400'
                      : 'bg-blue-600 ring-1 ring-blue-400'
                  }`}
                >
                  <span>{kValue > 0 ? `+${kValue}` : kValue}</span>
                  {kValue !== 0 && (
                    <span className="text-[10px] font-normal opacity-90">
                      {kValue > 0 ? '밝아짐' : '어두워짐'}
                    </span>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Stepper Buttons and Textbook Quick Presets */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        {/* Step Micro-adjusters */}
        <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/70">
          <span className="text-[11px] font-medium text-slate-500 px-1.5">미세 조절:</span>
          <button
            type="button"
            onClick={() => step(-10)}
            className="px-2 py-1 text-xs font-mono rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            -10
          </button>
          <button
            type="button"
            onClick={() => step(-1)}
            className="px-2 py-1 text-xs font-mono rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            -1
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            className="px-2 py-1 text-xs font-mono rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            +1
          </button>
          <button
            type="button"
            onClick={() => step(10)}
            className="px-2 py-1 text-xs font-mono rounded-md bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 transition-colors"
          >
            +10
          </button>
        </div>
      </div>

      {/* Visual Matrix Addition Formula */}
      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">행렬 덧셈 식:</span>
          <span className="text-xs font-mono text-slate-600">
            {mode === 'grayscale' ? (
              <>
                <span className="font-bold text-slate-900">
                  {kValue >= 0 ? 'B' : 'C'}
                </span>
                {' = '}
                <span className="font-bold text-slate-900">A</span>
                {' + '}
                <span className="font-bold text-blue-600">
                  [{kValue}]_{'{' + size + '×' + size + '}'}
                </span>
              </>
            ) : (
              <>
                <span className="font-bold text-rose-600">R'</span> = R + [{kValue}],{' '}
                <span className="font-bold text-emerald-600">G'</span> = G + [{kValue}],{' '}
                <span className="font-bold text-blue-600">B'</span> = B + [{kValue}]
              </>
            )}
          </span>
        </div>

        {/* Clipping Rule Reminder from Textbook */}
        <div className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200 flex items-center gap-1">
          <span className="font-semibold">교과서 클리핑 원칙:</span>
          <span>0 미만은 0으로, 255 초과는 255로 처리</span>
        </div>
      </div>
    </div>
  );
};
