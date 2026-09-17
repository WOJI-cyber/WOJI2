import React from 'react';
import { PaperNote, PaperStatus } from '../types';
import { Star, Download, Trash2, ArrowUpRight, CheckCircle2, Clock, Bookmark, AlertCircle } from 'lucide-react';

interface PaperTableViewProps {
  papers: PaperNote[];
  onSelect: (paper: PaperNote) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onExportMarkdown: (paper: PaperNote, e: React.MouseEvent) => void;
  onTagClick?: (tag: string, e: React.MouseEvent) => void;
}

const statusConfig: Record<PaperStatus, { label: string; color: string; icon: React.ComponentType<{ className?: string }> }> = {
  to_read: { label: '읽을 예정', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: Bookmark },
  reading: { label: '읽는 중', color: 'bg-amber-50 text-amber-700 border-amber-200', icon: Clock },
  completed: { label: '완료', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  revisit: { label: '재검토', color: 'bg-rose-50 text-rose-700 border-rose-200', icon: AlertCircle },
};

export const PaperTableView: React.FC<PaperTableViewProps> = ({
  papers,
  onSelect,
  onToggleFavorite,
  onDelete,
  onExportMarkdown,
  onTagClick,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <th className="py-3 px-3 w-10 text-center">⭐</th>
              <th className="py-3 px-4 min-w-[240px]">논문 제목 & 저자</th>
              <th className="py-3 px-4 min-w-[140px]">게재지 / 연도</th>
              <th className="py-3 px-3 min-w-[100px]">상태</th>
              <th className="py-3 px-3 min-w-[70px]">별점</th>
              <th className="py-3 px-4 min-w-[160px]">태그</th>
              <th className="py-3 px-3 text-right min-w-[90px]">최종 수정일</th>
              <th className="py-3 px-3 text-center w-24">관리</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {papers.map((paper) => {
              const statusInfo = statusConfig[paper.status] || statusConfig.to_read;
              const StatusIcon = statusInfo.icon;
              return (
                <tr
                  key={paper.id}
                  onClick={() => onSelect(paper)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                >
                  {/* Favorite */}
                  <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => onToggleFavorite(paper.id, e)}
                      className={`p-1 rounded transition-colors ${
                        paper.isFavorite ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-amber-400'
                      }`}
                    >
                      <Star className={`w-3.5 h-3.5 ${paper.isFavorite ? 'fill-amber-400 text-amber-500' : ''}`} />
                    </button>
                  </td>

                  {/* Title & Authors */}
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1 text-sm">
                      {paper.title || '제목 없음'}
                    </div>
                    <div className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {paper.authors || '저자 미입력'}
                    </div>
                  </td>

                  {/* Venue & Year */}
                  <td className="py-3 px-4 text-slate-600">
                    <div className="font-medium text-slate-700 truncate max-w-[160px]">
                      {paper.venue || '-'}
                    </div>
                    <div className="text-[11px] text-slate-400">{paper.year || '-'}</div>
                  </td>

                  {/* Status */}
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border ${statusInfo.color}`}>
                      <StatusIcon className="w-2.5 h-2.5" />
                      {statusInfo.label}
                    </span>
                  </td>

                  {/* Rating */}
                  <td className="py-3 px-3">
                    {paper.rating > 0 ? (
                      <span className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                        <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                        {paper.rating}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </td>

                  {/* Tags */}
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {paper.tags.slice(0, 3).map((tag, idx) => (
                        <span
                          key={idx}
                          onClick={(e) => {
                            if (onTagClick) {
                              e.stopPropagation();
                              onTagClick(tag, e);
                            }
                          }}
                          className="text-[10px] text-slate-600 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 px-1.5 py-0.5 rounded border border-slate-200 transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                      {paper.tags.length > 3 && (
                        <span className="text-[10px] text-slate-400 self-center">
                          +{paper.tags.length - 3}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Updated At */}
                  <td className="py-3 px-3 text-right text-slate-400 text-[11px]">
                    {new Date(paper.updatedAt).toLocaleDateString('ko-KR', {
                      year: '2-digit',
                      month: '2-digit',
                      day: '2-digit',
                    })}
                  </td>

                  {/* Actions */}
                  <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-center gap-1">
                      {paper.doi && (
                        <a
                          href={paper.doi.startsWith('http') ? paper.doi : `https://doi.org/${paper.doi}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-slate-400 hover:text-emerald-700 rounded transition-colors"
                          title="원문 링크"
                        >
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        type="button"
                        onClick={(e) => onExportMarkdown(paper, e)}
                        className="p-1 text-slate-400 hover:text-emerald-700 rounded transition-colors"
                        title="Markdown 다운로드"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => onDelete(paper.id, e)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="삭제"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
