import React, { useState, useRef, useEffect } from 'react';
import { BookOpen, Plus, Sparkles, Download, Upload, RotateCcw, Database, ChevronDown } from 'lucide-react';
import { PaperNote } from '../types';

interface NavbarProps {
  papers: PaperNote[];
  onNewPaper: () => void;
  onOpenAiExtract: () => void;
  onExportBackup: () => void;
  onImportBackup: (json: string) => void;
  onResetSamples: () => void;
  isEditing: boolean;
  onBackToDashboard: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  papers,
  onNewPaper,
  onOpenAiExtract,
  onExportBackup,
  onImportBackup,
  onResetSamples,
  isEditing,
  onBackToDashboard,
}) => {
  const [showBackupMenu, setShowBackupMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const completedCount = papers.filter(p => p.status === 'completed').length;
  const readingCount = papers.filter(p => p.status === 'reading').length;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowBackupMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onImportBackup(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
    setShowBackupMenu(false);
  };

  return (
    <header className="no-print sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo & Title */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={onBackToDashboard}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-700 flex items-center justify-center text-white shadow-xs">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg tracking-tight text-slate-900">PaperNote</span>
              <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                v1.2 Research
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">정형화된 템플릿 기반 학술 논문 분석 도우미</p>
          </div>
        </div>

        {/* Stats Pill on Dashboard */}
        {!isEditing && (
          <div className="hidden md:flex items-center gap-2 text-xs text-slate-600 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200">
            <span>보관 논문 <strong>{papers.length}</strong>편</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-700 font-medium">완료 {completedCount}</span>
            <span className="text-slate-300">|</span>
            <span className="text-amber-700 font-medium">읽는 중 {readingCount}</span>
          </div>
        )}

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Data Backup Dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              id="btn-backup-menu"
              type="button"
              onClick={() => setShowBackupMenu(prev => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="데이터 백업 및 복원"
            >
              <Database className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">데이터 관리</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showBackupMenu && (
              <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white shadow-xl border border-slate-200 py-1.5 z-50 text-xs">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  데이터 보관 및 백업
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onExportBackup();
                    setShowBackupMenu(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <Download className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-medium">전체 노트 백업 (JSON)</div>
                    <div className="text-[10px] text-slate-400">내 로컬 파일로 안전 저장</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center gap-2 text-slate-700"
                >
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-medium">백업 파일 복원 (JSON)</div>
                    <div className="text-[10px] text-slate-400">이전에 저장한 백업 가져오기</div>
                  </div>
                </button>
                <div className="border-t border-slate-100 my-1"></div>
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('샘플 논문 데이터(Transformer, ResNet, LoRA)로 초기화하시겠습니까? 현재 작성된 데이터가 덮어씌워질 수 있습니다.')) {
                      onResetSamples();
                      setShowBackupMenu(false);
                    }
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-rose-50 flex items-center gap-2 text-rose-700"
                >
                  <RotateCcw className="w-4 h-4 text-rose-500" />
                  <div>
                    <div className="font-medium">샘플 데이터로 재설정</div>
                    <div className="text-[10px] text-rose-500">기본 대표 논문 3종 로드</div>
                  </div>
                </button>
              </div>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* AI Auto Extract (Phase 3) */}
          <button
            id="btn-open-ai-extract"
            type="button"
            onClick={onOpenAiExtract}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 rounded-lg transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>AI 논문 추출</span>
          </button>

          {/* New Paper Note */}
          <button
            id="btn-new-paper-note"
            type="button"
            onClick={onNewPaper}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 rounded-lg transition-all shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>새 논문 작성</span>
          </button>
        </div>
      </div>
    </header>
  );
};
