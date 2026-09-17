import React from 'react';
import { PaperNote, PaperStatus } from '../types';
import { Star, Calendar, Bookmark, Download, Trash2, ArrowUpRight, CheckCircle2, Clock, AlertCircle, Sparkles, Check } from 'lucide-react';

interface PaperCardProps {
  paper: PaperNote;
  isSelected?: boolean;
  onToggleSelect?: (id: string, e: React.MouseEvent) => void;
  onSelect: (paper: PaperNote) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onExportMarkdown: (paper: PaperNote, e: React.MouseEvent) => void;
  onTagClick?: (tag: string, e: React.MouseEvent) => void;
}

const statusConfig: Record<PaperStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  to_read: { label: '읽을 논문', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Bookmark },
  reading: { label: '읽는 중', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  completed: { label: '읽음 완료', color: 'bg-emerald-50 text-emerald-700 border-emerald-700/20', icon: CheckCircle2 },
  revisit: { label: '재검토', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertCircle },
};

export const PaperCard: React.FC<PaperCardProps> = ({
  paper,
  isSelected = false,
  onToggleSelect,
  onSelect,
  onToggleFavorite,
  onDelete,
  onExportMarkdown,
  onTagClick,
}) => {
  const statusInfo = statusConfig[paper.status] || statusConfig.to_read;
  const StatusIcon = statusInfo.icon;

  // Prefer structured oneLineSummary, fallback to abstractSummary or first sentence
  const oneLineSummary = paper.structuredAnalysis?.oneLineSummary || paper.abstractSummary;

  return (
    <div
      id={`paper-card-${paper.id}`}
      onClick={() => onSelect(paper)}
      className={`group relative bg-white rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden cursor-pointer ${
        isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md bg-emerald-50/[0.03]'
          : 'border-slate-200 hover:border-emerald-300 hover:shadow-md'
      }`}
    >
      <div className="p-5 pb-3">
        {/* Top Header: Multi-select Checkbox + Badges + Favorite */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Multi-select Checkbox */}
            <button
              type="button"
              id={`paper-card-select-btn-${paper.id}`}
              aria-label={isSelected ? '선택 해제' : '논문 비교 및 공백 분석용 선택'}
              onClick={(e) => {
                e.stopPropagation();
                if (onToggleSelect) onToggleSelect(paper.id, e);
              }}
              className={`w-5 h-5 rounded flex items-center justify-center transition-all ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'border border-slate-300 bg-white hover:border-emerald-400 group-hover:border-slate-400'
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
            </button>

            {/* Reading Status Badge */}
            <span className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md border ${statusInfo.color}`}>
              <StatusIcon className="w-3 h-3" />
              {statusInfo.label}
            </span>

            {/* Category / Field */}
            {paper.category && (
              <span className="text-[11px] font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                {paper.category}
              </span>
            )}

            {/* Open Access Badge */}
            {paper.isOpenAccess && (
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                Open Access
              </span>
            )}
          </div>

          <button
            type="button"
            id={`paper-favorite-btn-${paper.id}`}
            aria-label={paper.isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            onClick={(e) => onToggleFavorite(paper.id, e)}
            className={`p-1.5 rounded-lg transition-colors ${
              paper.isFavorite
                ? 'text-amber-500 hover:text-amber-600 bg-amber-50'
                : 'text-slate-300 hover:text-amber-400 hover:bg-slate-50'
            }`}
          >
            <Star className={`w-4 h-4 ${paper.isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
          </button>
        </div>

        {/* Paper Title */}
        <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-emerald-600 transition-colors line-clamp-2 mb-1.5">
          {paper.title || '제목 없는 논문'}
        </h3>

        {/* Authors */}
        <p className="text-xs text-slate-600 line-clamp-1 mb-2 font-normal">
          {paper.authors || '저자 미입력'}
        </p>

        {/* Venue & Year */}
        <div className="flex items-center gap-2 text-[11px] text-slate-500 mb-3 flex-wrap">
          <span className="font-medium text-slate-700 truncate max-w-[220px]">
            {paper.venue || '출판/학회 미지정'}
          </span>
          {paper.year && (
            <span className="inline-flex items-center gap-1 text-slate-500 shrink-0 font-medium">
              <Calendar className="w-3 h-3 text-slate-400" />
              {paper.year}
            </span>
          )}
          {paper.studyType && (
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-100">
              {paper.studyType}
            </span>
          )}
        </div>

        {/* AI One-Line Summary - Highlighted Core Card Section */}
        {oneLineSummary ? (
          <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/40 rounded-lg p-3 mb-3 border border-emerald-100/80">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 mb-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>AI 핵심 한 줄 요약</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-normal line-clamp-2">
              {oneLineSummary}
            </p>
          </div>
        ) : (
          <div className="bg-slate-50 rounded-lg p-2.5 mb-3 border border-slate-100 text-slate-400 text-xs italic flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-slate-400" />
            AI 요약 생성 대기 중 (상세 페이지에서 자동 생성)
          </div>
        )}

        {/* Key Tags (Keywords / Topics) */}
        {paper.tags && paper.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1">
            {paper.tags.slice(0, 4).map((tag, idx) => (
              <span
                key={idx}
                onClick={(e) => {
                  if (onTagClick) {
                    e.stopPropagation();
                    onTagClick(tag, e);
                  }
                }}
                className="text-[10px] font-medium text-slate-600 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 px-2 py-0.5 rounded-md border border-slate-200 transition-colors"
              >
                #{tag}
              </span>
            ))}
            {paper.tags.length > 4 && (
              <span className="text-[10px] text-slate-400 self-center">
                +{paper.tags.length - 4}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer: Metadata info & Action shortcuts */}
      <div className="px-5 py-2.5 border-t border-slate-100 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
        <span className="text-[11px] text-slate-400">
          {paper.origin === 'domestic' ? '국내 학술지' : paper.origin === 'international' ? '해외 저널' : '학술 문헌'}
        </span>

        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {paper.doi && (
            <a
              href={paper.doi.startsWith('http') ? paper.doi : `https://doi.org/${paper.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              title="원문 학술 DB 열기"
              className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-white rounded transition-colors"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          )}
          <button
            type="button"
            title="Markdown 다운로드"
            onClick={(e) => onExportMarkdown(paper, e)}
            className="p-1 text-slate-400 hover:text-emerald-600 hover:bg-white rounded transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title="삭제"
            onClick={(e) => onDelete(paper.id, e)}
            className="p-1 text-slate-400 hover:text-rose-600 hover:bg-white rounded transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
