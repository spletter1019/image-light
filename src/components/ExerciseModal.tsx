import React, { useState } from 'react';
import { X, CheckCircle2, HelpCircle, ArrowRight, RotateCcw } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoadExerciseGrid: () => void;
}

export const ExerciseModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onLoadExerciseGrid,
}) => {
  const [ans1, setAns1] = useState<string | null>(null);
  const [ans2, setAns2] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  if (!isOpen) return null;

  const isQ1Correct = ans1 === 'bright';
  const isQ2Correct = ans2 === 'dark';

  const handleReset = () => {
    setAns1(null);
    setAns2(null);
    setSubmitted(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-xl">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                교과서 91쪽 [문제 1] 스스로 확인하기
              </h2>
              <span className="text-xs text-slate-500">행렬의 덧셈과 뺄셈에 따른 밝기 변화 추론</span>
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

        {/* Question Statement */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 space-y-2">
          <p className="font-semibold text-slate-900">
            [문제 1] 회색조 이미지를 나타내는 행렬을 A라고 할 때, 다음 행렬이 나타내는 이미지의 변화로 가장 적절한 것을 고르시오.
          </p>
        </div>

        {/* Sub-question 1 */}
        <div className="space-y-2 text-xs sm:text-sm">
          <div className="font-semibold text-slate-800">
            ⑴ 행렬 A + <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">[50]</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAns1('bright')}
              className={`p-3 rounded-xl border text-left transition-all ${
                ans1 === 'bright'
                  ? 'border-blue-600 bg-blue-50/70 font-semibold text-blue-900 ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              ㄱ. 전체적으로 더 밝아진 이미지
            </button>
            <button
              type="button"
              onClick={() => setAns1('dark')}
              className={`p-3 rounded-xl border text-left transition-all ${
                ans1 === 'dark'
                  ? 'border-blue-600 bg-blue-50/70 font-semibold text-blue-900 ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              ㄴ. 전체적으로 더 어두워진 이미지
            </button>
          </div>
        </div>

        {/* Sub-question 2 */}
        <div className="space-y-2 text-xs sm:text-sm">
          <div className="font-semibold text-slate-800">
            ⑵ 행렬 A - <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">[50]</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAns2('bright')}
              className={`p-3 rounded-xl border text-left transition-all ${
                ans2 === 'bright'
                  ? 'border-blue-600 bg-blue-50/70 font-semibold text-blue-900 ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              ㄱ. 전체적으로 더 밝아진 이미지
            </button>
            <button
              type="button"
              onClick={() => setAns2('dark')}
              className={`p-3 rounded-xl border text-left transition-all ${
                ans2 === 'dark'
                  ? 'border-blue-600 bg-blue-50/70 font-semibold text-blue-900 ring-2 ring-blue-500/20'
                  : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
              }`}
            >
              ㄴ. 전체적으로 더 어두워진 이미지
            </button>
          </div>
        </div>

        {/* Result & Feedback */}
        {submitted && (
          <div
            className={`p-4 rounded-xl border text-xs sm:text-sm space-y-1.5 ${
              isQ1Correct && isQ2Correct
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : 'bg-amber-50 border-amber-300 text-amber-900'
            }`}
          >
            <div className="flex items-center gap-1.5 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isQ1Correct && isQ2Correct
                  ? '정답입니다! 완벽하게 이해하셨습니다.'
                  : '다시 한번 원리를 확인해 보세요!'}
              </span>
            </div>
            <p className="text-xs opacity-90 leading-relaxed">
              <strong>해설:</strong> 모든 성분에 양수를 더하면 각 픽셀의 밝기 수치가 증가하므로 이미지가 밝아지고(ㄱ),
              수를 빼면 수치가 감소하므로 이미지가 어두워집니다(ㄴ).
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={() => {
              onLoadExerciseGrid();
              onClose();
            }}
            className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline flex items-center gap-1"
          >
            <span>이 문제 패턴으로 앱에서 실습하기</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-2">
            {submitted ? (
              <button
                type="button"
                onClick={handleReset}
                className="flex items-center gap-1 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>다시 풀기</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={!ans1 || !ans2}
                onClick={() => setSubmitted(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 rounded-xl transition-colors shadow-xs"
              >
                정답 확인
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
