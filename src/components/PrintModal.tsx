import React from 'react';
import { PaperNote } from '../types';
import { Printer, Download, X, FileText } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { downloadMarkdown } from '../utils/export';

interface PrintModalProps {
  paper: PaperNote | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PrintModal: React.FC<PrintModalProps> = ({
  paper,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !paper) return null;

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-3xl w-full p-6 space-y-6 my-8">
        {/* Modal Toolbar (hidden when printing) */}
        <div className="no-print flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-emerald-600" />
            <h3 className="font-bold text-slate-900 text-base">논문 요약 리포트 (PDF 인쇄 / 내보내기)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTriggerPrint}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              PDF 저장 / 인쇄 실행
            </button>
            <button
              type="button"
              onClick={() => downloadMarkdown(paper)}
              className="px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Markdown 저장
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Research Note Sheet */}
        <div id="printable-research-sheet" className="p-8 bg-white border border-slate-200 rounded-xl space-y-6 text-slate-900">
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-4">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span className="font-bold tracking-wider text-emerald-800 uppercase">PaperNote Research Brief</span>
              <span>기록일: {new Date(paper.createdAt).toLocaleDateString('ko-KR')}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">
              {paper.title || '제목 없는 논문'}
            </h1>
            <p className="text-sm font-medium text-slate-700 mt-1">
              {paper.authors}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-600 mt-2 flex-wrap">
              <span><strong>게재지:</strong> {paper.venue || '미기재'}</span>
              <span><strong>연도:</strong> {paper.year || '미기재'}</span>
              <span><strong>분야:</strong> {paper.category || '미기재'}</span>
              {paper.doi && (
                <span><strong>DOI:</strong> {paper.doi}</span>
              )}
            </div>
            {paper.tags && paper.tags.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap mt-2">
                {paper.tags.map((t, idx) => (
                  <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono">
                    #{t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* 5 Core Sections */}
          <div className="space-y-6">
            {/* 1. Objective */}
            <div className="page-break">
              <h2 className="text-sm font-bold text-emerald-950 border-b border-emerald-100 pb-1 mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center text-xs">1</span>
                연구 목적 (Objective)
              </h2>
              <div className="text-xs leading-relaxed text-slate-800 prose prose-sm max-w-none pl-1">
                {paper.objective ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{paper.objective}</ReactMarkdown>
                ) : (
                  <p className="italic text-slate-400">작성된 내용이 없습니다.</p>
                )}
              </div>
            </div>

            {/* 2. Methodology */}
            <div className="page-break">
              <h2 className="text-sm font-bold text-emerald-950 border-b border-emerald-100 pb-1 mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center text-xs">2</span>
                연구 방법 (Methodology)
              </h2>
              <div className="text-xs leading-relaxed text-slate-800 prose prose-sm max-w-none pl-1">
                {paper.methodology ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{paper.methodology}</ReactMarkdown>
                ) : (
                  <p className="italic text-slate-400">작성된 내용이 없습니다.</p>
                )}
              </div>
            </div>

            {/* 3. Results */}
            <div className="page-break">
              <h2 className="text-sm font-bold text-emerald-950 border-b border-emerald-100 pb-1 mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center text-xs">3</span>
                연구 결과 (Results)
              </h2>
              <div className="text-xs leading-relaxed text-slate-800 prose prose-sm max-w-none pl-1">
                {paper.results ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{paper.results}</ReactMarkdown>
                ) : (
                  <p className="italic text-slate-400">작성된 내용이 없습니다.</p>
                )}
              </div>
            </div>

            {/* 4. Limitations */}
            <div className="page-break">
              <h2 className="text-sm font-bold text-emerald-950 border-b border-emerald-100 pb-1 mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center text-xs">4</span>
                한계점 (Limitations)
              </h2>
              <div className="text-xs leading-relaxed text-slate-800 prose prose-sm max-w-none pl-1">
                {paper.limitations ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{paper.limitations}</ReactMarkdown>
                ) : (
                  <p className="italic text-slate-400">작성된 내용이 없습니다.</p>
                )}
              </div>
            </div>

            {/* 5. My Thoughts */}
            <div className="page-break">
              <h2 className="text-sm font-bold text-emerald-950 border-b border-emerald-100 pb-1 mb-2 flex items-center gap-2">
                <span className="w-5 h-5 rounded bg-emerald-600 text-white flex items-center justify-center text-xs">5</span>
                내 생각 & 연구 아이디어 (My Thoughts)
              </h2>
              <div className="text-xs leading-relaxed text-slate-800 prose prose-sm max-w-none pl-1">
                {paper.myThoughts ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{paper.myThoughts}</ReactMarkdown>
                ) : (
                  <p className="italic text-slate-400">작성된 내용이 없습니다.</p>
                )}
              </div>
            </div>
          </div>

          {/* Footer watermark */}
          <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-[11px] text-slate-400">
            <span>PaperNote - 학술 연구 논문 5대 표준 분석 도우미</span>
            <span>최종 수정일: {new Date(paper.updatedAt).toLocaleDateString('ko-KR')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
