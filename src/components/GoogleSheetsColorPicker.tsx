import React, { useState, useRef, useEffect } from 'react';
import { PaintBucket, Plus, RotateCcw, Pipette, Check } from 'lucide-react';
import { ImageMode } from '../types';
import { hexToRgb, rgbToHex } from '../utils/matrixUtils';

interface Props {
  selectedColor: string;
  onSelectColor: (hex: string) => void;
  mode: ImageMode;
  onFillAll: (hex: string) => void;
  isEyedropperActive: boolean;
  onToggleEyedropper: () => void;
  disabled?: boolean;
}

// Google Sheets Theme Color Matrix (10 columns, 6 lightness levels)
const GOOGLE_SHEETS_PALETTE = [
  // Row 0: Base / Darkest shades
  ['#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff'],
  // Row 1: Vivid primaries
  ['#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff'],
  // Row 2: Light tints (level 1)
  ['#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc'],
  // Row 3: Medium tints (level 2)
  ['#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd'],
  // Row 4: Saturated shades (level 3)
  ['#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0'],
  // Row 5: Deep dark shades (level 4)
  ['#5b0f00', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1c4587', '#073763', '#20124d', '#4c1130'],
];

// Google Sheets Standard Colors Row
const STANDARD_COLORS = [
  '#000000', '#434343', '#ea4335', '#ff9900', '#fbbc04',
  '#34a853', '#00bcd4', '#4285f4', '#3f51b5', '#a142f4'
];

// Dedicated Grayscale 8-bit palette (Textbook relevant numbers!)
const GRAYSCALE_LEVELS = [
  0, 30, 60, 80, 100, 130, 160, 190, 210, 230, 255
];

export const GoogleSheetsColorPicker: React.FC<Props> = ({
  selectedColor,
  onSelectColor,
  mode,
  onFillAll,
  isEyedropperActive,
  onToggleEyedropper,
  disabled = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customHex, setCustomHex] = useState(selectedColor);
  const [grayValue, setGrayValue] = useState<number>(() => hexToRgb(selectedColor).r);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleColorPick = (hex: string) => {
    onSelectColor(hex);
    setCustomHex(hex);
    setGrayValue(hexToRgb(hex).r);
    setIsOpen(false);
  };

  const handleCustomApply = () => {
    onSelectColor(customHex);
    setIsOpen(false);
    setShowCustomModal(false);
  };

  const handleGrayscaleSliderChange = (val: number) => {
    setGrayValue(val);
    const hex = rgbToHex(val, val, val);
    setCustomHex(hex);
    onSelectColor(hex);
  };

  const currentRgb = hexToRgb(selectedColor);

  return (
    <div className="relative inline-flex items-center gap-2" ref={dropdownRef}>
      {/* Google Sheets style Fill Color Toolbar Button */}
      <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white shadow-xs p-0.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label="채우기 색상 선택"
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md hover:bg-slate-100 transition-colors focus-visible:outline-2 focus-visible:outline-slate-900 disabled:opacity-50"
        >
          <div className="flex flex-col items-center">
            <PaintBucket className="w-4 h-4 text-slate-700" />
            <span
              className="w-4 h-1 rounded-xs mt-0.5 border border-slate-300"
              style={{ backgroundColor: selectedColor }}
            />
          </div>
          <span className="text-xs font-medium text-slate-700 whitespace-nowrap">
            {mode === 'grayscale' ? `명암 ${currentRgb.r}` : '채우기 색상'}
          </span>
          <svg className="w-3 h-3 text-slate-500 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Eyedropper Tool */}
        <button
          type="button"
          onClick={onToggleEyedropper}
          title="스포이트 도구 (표에서 색상 추출)"
          className={`p-1.5 rounded-md transition-colors ${
            isEyedropperActive
              ? 'bg-blue-100 text-blue-700 font-medium'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Pipette className="w-4 h-4" />
        </button>

        {/* Fill All Cells Button */}
        <button
          type="button"
          onClick={() => onFillAll(selectedColor)}
          title="현재 선택한 색상으로 표 전체 채우기"
          className="px-2 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors whitespace-nowrap"
        >
          전체 채우기
        </button>
      </div>

      {/* Google Sheets Color Picker Dropdown Box */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 z-50 w-72 rounded-xl bg-white border border-slate-200 shadow-xl p-3 animate-in fade-in zoom-in-95 duration-100">
          {/* Header & Reset */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-800">
              {mode === 'monochrome'
                ? '흑백 선택 (이진 0 또는 255)'
                : mode === 'grayscale'
                ? '회색조 명암 선택 (8비트 0~255)'
                : '구글 시트 테마 색상'}
            </span>
            <button
              type="button"
              onClick={() => handleColorPick('#ffffff')}
              className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 px-1.5 py-0.5 rounded hover:bg-slate-100"
            >
              <RotateCcw className="w-3 h-3" />
              <span>초기화 (흰색)</span>
            </button>
          </div>

          {/* Monochrome Mode: Binary 0 or 255 */}
          {mode === 'monochrome' ? (
            <div className="space-y-2.5 py-1">
              <span className="text-[11px] font-medium text-slate-600 block">
                이진 흑백 성분값 (0 또는 255)
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleColorPick('#000000')}
                  className={`h-14 rounded-xl border-2 flex flex-col items-center justify-center transition-all bg-black text-white relative shadow-xs ${
                    selectedColor.toLowerCase() === '#000000'
                      ? 'ring-2 ring-blue-500 border-blue-600'
                      : 'border-slate-800 hover:border-slate-600'
                  }`}
                >
                  <span className="font-mono font-bold text-base">0</span>
                  <span className="text-[11px] text-slate-300">검은색 (Black)</span>
                  {selectedColor.toLowerCase() === '#000000' && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleColorPick('#ffffff')}
                  className={`h-14 rounded-xl border-2 flex flex-col items-center justify-center transition-all bg-white text-slate-900 relative shadow-xs ${
                    selectedColor.toLowerCase() === '#ffffff'
                      ? 'ring-2 ring-blue-500 border-blue-600'
                      : 'border-slate-300 hover:border-slate-400'
                  }`}
                >
                  <span className="font-mono font-bold text-base">255</span>
                  <span className="text-[11px] text-slate-600">흰색 (White)</span>
                  {selectedColor.toLowerCase() === '#ffffff' && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </button>
              </div>
            </div>
          ) : mode === 'grayscale' ? (
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                  <span>명암 슬라이더</span>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {grayValue} (0x{grayValue.toString(16).toUpperCase().padStart(2, '0')})
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="255"
                  value={grayValue}
                  onChange={(e) => handleGrayscaleSliderChange(Number(e.target.value))}
                  className="w-full h-2 bg-gradient-to-r from-black via-gray-400 to-white rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-0.5">
                  <span>0 (검은색)</span>
                  <span>128 (중간 회색)</span>
                  <span>255 (흰색)</span>
                </div>
              </div>

              {/* Textbook Preset Chips */}
              <div>
                <span className="text-[11px] font-medium text-slate-600 block mb-1">
                  교과서 및 대표 명암 단계
                </span>
                <div className="grid grid-cols-6 gap-1.5">
                  {GRAYSCALE_LEVELS.map((v) => {
                    const hex = rgbToHex(v, v, v);
                    const isSelected = hexToRgb(selectedColor).r === v;
                    return (
                      <button
                        key={v}
                        type="button"
                        onClick={() => handleColorPick(hex)}
                        title={`명암 ${v}${v === 230 || v === 80 ? ' (교과서 90쪽 성분)' : ''}`}
                        className={`h-7 rounded border relative flex items-center justify-center transition-transform hover:scale-105 ${
                          isSelected ? 'ring-2 ring-blue-500 ring-offset-1' : 'border-slate-300'
                        }`}
                        style={{ backgroundColor: hex }}
                      >
                        {isSelected && (
                          <Check className={`w-3.5 h-3.5 ${v > 130 ? 'text-slate-900' : 'text-white'}`} />
                        )}
                        <span
                          className={`absolute bottom-0 text-[9px] font-mono leading-none ${
                            v > 130 ? 'text-slate-800' : 'text-slate-200'
                          }`}
                        >
                          {v}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* Color Mode: Google Sheets Palette Grid */
            <div className="space-y-3">
              {/* Theme Colors Grid */}
              <div>
                <span className="text-[11px] font-medium text-slate-500 block mb-1">테마 색상</span>
                <div className="grid grid-cols-10 gap-1">
                  {GOOGLE_SHEETS_PALETTE.flat().map((hex, idx) => {
                    const isSelected = selectedColor.toLowerCase() === hex.toLowerCase();
                    return (
                      <button
                        key={`${hex}-${idx}`}
                        type="button"
                        onClick={() => handleColorPick(hex)}
                        className={`w-5 h-5 rounded-xs transition-transform hover:scale-125 relative flex items-center justify-center border ${
                          isSelected ? 'ring-2 ring-blue-600 ring-offset-1 z-10' : 'border-slate-200'
                        }`}
                        style={{ backgroundColor: hex }}
                        title={hex}
                      >
                        {isSelected && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              hexToRgb(hex).r + hexToRgb(hex).g + hexToRgb(hex).b > 380
                                ? 'bg-slate-900'
                                : 'bg-white'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Standard Colors */}
              <div>
                <span className="text-[11px] font-medium text-slate-500 block mb-1">표준 색상</span>
                <div className="grid grid-cols-10 gap-1">
                  {STANDARD_COLORS.map((hex) => {
                    const isSelected = selectedColor.toLowerCase() === hex.toLowerCase();
                    return (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => handleColorPick(hex)}
                        className={`w-5 h-5 rounded-full border border-slate-200 transition-transform hover:scale-125 relative flex items-center justify-center ${
                          isSelected ? 'ring-2 ring-blue-600 ring-offset-1' : ''
                        }`}
                        style={{ backgroundColor: hex }}
                        title={hex}
                      >
                        {isSelected && (
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              hexToRgb(hex).r + hexToRgb(hex).g + hexToRgb(hex).b > 380
                                ? 'bg-slate-900'
                                : 'bg-white'
                            }`}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Custom Color Button & Preview */}
          <div className="pt-2 mt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-5 h-5 rounded-md border border-slate-300 shadow-xs"
                style={{ backgroundColor: selectedColor }}
              />
              <span className="font-mono text-xs text-slate-600">
                RGB({currentRgb.r}, {currentRgb.g}, {currentRgb.b})
              </span>
            </div>

            <button
              type="button"
              onClick={() => setShowCustomModal(true)}
              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium px-2 py-1 rounded-md hover:bg-blue-50 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>맞춤 색상...</span>
            </button>
          </div>
        </div>
      )}

      {/* Custom Color Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white border border-slate-200 shadow-2xl p-5 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="text-sm font-semibold text-slate-900">맞춤 색상 선택</h3>

            <div className="flex items-center gap-4">
              <input
                type="color"
                value={customHex}
                onChange={(e) => setCustomHex(e.target.value)}
                className="w-16 h-16 rounded-xl border border-slate-300 cursor-pointer p-0.5 bg-white"
              />
              <div className="flex-1 space-y-2">
                <div>
                  <label className="text-[11px] font-medium text-slate-500 block mb-0.5">HEX 코드</label>
                  <input
                    type="text"
                    value={customHex}
                    onChange={(e) => setCustomHex(e.target.value)}
                    className="w-full text-xs font-mono px-2.5 py-1.5 border border-slate-300 rounded-lg focus:outline-blue-500"
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>
            </div>

            {/* RGB Inputs */}
            {(() => {
              const rgb = hexToRgb(customHex);
              const updateChannel = (channel: 'r' | 'g' | 'b', val: number) => {
                const next = { ...rgb, [channel]: Math.max(0, Math.min(255, val)) };
                setCustomHex(rgbToHex(next.r, next.g, next.b));
              };

              return (
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[11px] font-semibold text-rose-600 block mb-0.5">R (빨강)</label>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={rgb.r}
                      onChange={(e) => updateChannel('r', Number(e.target.value))}
                      className="w-full text-xs font-mono px-2 py-1 border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-emerald-600 block mb-0.5">G (초록)</label>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={rgb.g}
                      onChange={(e) => updateChannel('g', Number(e.target.value))}
                      className="w-full text-xs font-mono px-2 py-1 border border-slate-300 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-blue-600 block mb-0.5">B (파랑)</label>
                    <input
                      type="number"
                      min="0"
                      max="255"
                      value={rgb.b}
                      onChange={(e) => updateChannel('b', Number(e.target.value))}
                      className="w-full text-xs font-mono px-2 py-1 border border-slate-300 rounded-md"
                    />
                  </div>
                </div>
              );
            })()}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCustomModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition-colors"
              >
                취소
              </button>
              <button
                type="button"
                onClick={handleCustomApply}
                className="px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                적용
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
