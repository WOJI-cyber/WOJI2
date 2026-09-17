import React, { useState } from 'react';
import { PaperNote } from '../types';
import { X, Link2, Loader2, Sparkles, Check, ArrowRight, BookOpen } from 'lucide-react';

interface DoiAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPaperCreated: (paper: PaperNote) => void;
}

export const DoiAddModal: React.FC<DoiAddModalProps> = ({
  isOpen,
  onClose,
  onPaperCreated,
}) => {
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedPreview, setResolvedPreview] = useState<Partial<PaperNote> | null>(null);

  if (!isOpen) return null;

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    setIsLoading(true);
    setError(null);
    setResolvedPreview(null);

    try {
      const res = await fetch('/api/resolve-doi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'DOI 또는 URL 분석에 실패했습니다.');
      }
      setResolvedPreview(data.data);
    } catch (err: any) {
      console.error('DOI resolve error:', err);
      setError(err.message || '논문 정보를 가져오는 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmAdd = () => {
    if (!resolvedPreview) return;

    const newPaper: PaperNote = {
      id: `paper-${Date.now()}`,
      title: resolvedPreview.title || identifier,
      authors: resolvedPreview.authors || '저자 미상',
      venue: resolvedPreview.venue || '학술 저널',
      year: resolvedPreview.year || new Date().getFullYear(),
      doi: identifier.trim(),
      category: resolvedPreview.category || '보건의료정책',
      origin: resolvedPreview.origin || 'domestic',
      isOpenAccess: true,
      studyType: resolvedPreview.studyType || '양적 연구',
      tags: ['DOI가져오기', resolvedPreview.category || '연구'],
      status: 'to_read',
      rating: 0,
      isFavorite: false,
      abstractSummary: resolvedPreview.abstractSummary || '',
      objective: '',
      methodology: '',
      results: '',
      limitations: '',
      myThoughts: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onPaperCreated(newPaper);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Link2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">DOI / 학술 URL로 논문 추가</h3>
              <p className="text-[11px] text-slate-500">RISS, KISS, DBpia, KCI 링크 또는 DOI 식별자</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <div className="p-6 space-y-4">
          <form onSubmit={handleResolve} className="space-y-3">
            <div>
              <label htmlFor="doi-input-field" className="block text-xs font-semibold text-slate-700 mb-1.5">
                DOI 또는 논문 웹 URL
              </label>
              <div className="flex gap-2">
                <input
                  id="doi-input-field"
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="예: 10.4332/KJHPA.2023.33.2.145 또는 KCI/RISS URL"
                  className="flex-1 px-3.5 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-mono"
                />
                <button
                  type="submit"
                  disabled={isLoading || !identifier.trim()}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-1.5 shrink-0 transition-colors shadow-sm"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  {isLoading ? '조회 중...' : '메타데이터 조회'}
                </button>
              </div>
            </div>
          </form>

          {/* Quick Example chips */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 flex-wrap">
            <span>추천 예시:</span>
            <button
              type="button"
              onClick={() => setIdentifier('10.4332/KJHPA.2023.33.2.145')}
              className="text-emerald-700 hover:underline bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
            >
              보건행정학회지 DOI
            </button>
            <button
              type="button"
              onClick={() => setIdentifier('https://doi.org/10.15709/hswr.2024.44.1.89')}
              className="text-emerald-700 hover:underline bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
            >
              보건사회연구 URL
            </button>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Resolved Preview Card */}
          {resolvedPreview && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  논문 메타데이터 추출 완료
                </span>
                <span className="text-xs text-slate-500">{resolvedPreview.year}년</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug">
                {resolvedPreview.title}
              </h4>

              <p className="text-xs text-slate-600">
                저자: {resolvedPreview.authors} · 학술지: {resolvedPreview.venue}
              </p>

              {resolvedPreview.abstractSummary && (
                <p className="text-xs text-slate-600 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                  {resolvedPreview.abstractSummary}
                </p>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  id="confirm-doi-add-btn"
                  onClick={handleConfirmAdd}
                  className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  이 논문을 내 보관함에 추가하기 &rarr;
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
