import React from 'react';
import { X, BookOpen, Sparkles, Check, ArrowRight } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoadP90Example: () => void;
}

export const TextbookModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onLoadP90Example,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                교과서 90~91쪽 원리 해설: 행렬의 덧셈과 뺄셈을 이용한 밝기 변환
              </h2>
              <span className="text-xs text-slate-500">Ⅲ. 이미지 데이터 처리 02. 이미지 데이터의 변환</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="space-y-4 text-sm text-slate-700 leading-relaxed max-h-[65vh] overflow-y-auto pr-1">
          {/* Section 1 */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              1. 픽셀 값과 행렬 표현
            </h3>
            <p className="text-xs text-slate-600">
              이미지 데이터는 각 픽셀의 색상값을 성분으로 하는 <strong>행렬</strong>로 표현할 수 있습니다.
              회색조(흑백) 이미지 데이터의 각 픽셀 값은 8비트일 경우 <strong>0부터 255까지의 정수</strong> 중에서
              하나의 값을 갖습니다.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <span className="font-mono font-bold text-slate-900">0에 가까울 때</span>
                <p className="text-[11px] text-slate-500">어두운 색 (0은 완전한 검은색)</p>
              </div>
              <div className="p-2 rounded-lg bg-white border border-slate-200">
                <span className="font-mono font-bold text-slate-900">255에 가까울 때</span>
                <p className="text-[11px] text-slate-500">밝은 색 (255는 완전한 흰색)</p>
              </div>
            </div>
          </div>

          {/* Section 2: Mathematical formula from Textbook */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <h3 className="font-semibold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              2. 밝기 변환의 수학 원리
            </h3>
            <p className="text-xs text-slate-600">
              이미지 데이터를 나타낸 행렬의 모든 성분에 <strong>같은 수를 더하거나 빼면</strong> 균일하게
              밝기가 변경됩니다.
            </p>

            {/* Matrix Formulas Display */}
            <div className="space-y-2 text-xs font-mono bg-white p-3 rounded-lg border border-slate-200">
              <div className="text-slate-800">
                <strong>(1) 밝게 하기 (덧셈):</strong> B = A + [50]
                <div className="text-slate-500 text-[11px] mt-0.5">
                  행렬 A의 모든 성분에 50을 더하면 이미지가 전체적으로 밝아집니다.
                </div>
              </div>
              <div className="text-slate-800 pt-1 border-t border-slate-100">
                <strong>(2) 어둡게 하기 (뺄셈):</strong> C = A - [100]
                <div className="text-slate-500 text-[11px] mt-0.5">
                  행렬 A의 모든 성분에서 100을 빼면 이미지가 전체적으로 어두워집니다.
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Clamping character note */}
          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-amber-950">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>교과서 속 핵심 개념: 클리핑(Clipping) 처리</span>
            </div>
            <p className="text-xs text-amber-800 leading-normal">
              &quot;픽셀의 값은 0부터 255까지만 가능하므로, <strong>255 이상은 모두 255</strong>로 처리하고,{' '}
              <strong>0 이하는 모두 0</strong>으로 처리해요.&quot;
            </p>
            <p className="text-[11px] text-amber-700">
              예: 성분값 230에 50을 더하면 280이지만, 8비트 한도에 의해 255로 저장됩니다.
            </p>
          </div>

          {/* Section 4: Color image RGB extension */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h3 className="font-semibold text-slate-900 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-rose-600" />
              3. 컬러 이미지로의 확장 (RGB 세 행렬)
            </h3>
            <p className="text-xs text-slate-600">
              컬러 이미지는 각 픽셀이 빨강(R), 초록(G), 파랑(B) 3가지 채널의 값을 가집니다. 따라서 같은 크기의{' '}
              <strong>세 행렬 R, G, B</strong>로 분리하여 표현하며, 밝기를 조절할 때는 세 행렬의 모든 성분에 동일한 정수 k를 더해줍니다.
            </p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              onLoadP90Example();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors shadow-xs"
          >
            <span>교과서 90쪽 예제 A 지금 실습하기</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
