import React, { useState, useEffect, useRef } from 'react';
import { PaperNote, PaperStatus, TemplateSectionKey } from '../types';
import { TEMPLATE_SECTIONS } from '../data/templateMetadata';
import {
  ArrowLeft,
  Save,
  Check,
  Star,
  Download,
  Printer,
  Copy,
  Trash2,
  Sparkles,
  Eye,
  Edit3,
  Columns,
  Code,
  Bold,
  Italic,
  List,
  Heading2,
  Quote,
  Calculator,
  HelpCircle,
  ExternalLink,
  Tag,
  CheckCircle2,
  Clock,
  Bookmark,
  AlertCircle
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { generateBibtex, copyToClipboard } from '../utils/export';
import { AbstractAssistant } from './AbstractAssistant';
import { StructuredAnalysisCard } from './StructuredAnalysisCard';
import { ACADEMIC_PORTALS } from '../utils/academicSearch';

interface PaperEditorProps {
  paper: PaperNote;
  onSave: (paper: PaperNote) => void;
  onBack: () => void;
  onDelete: (id: string) => void;
  onExportMarkdown: (paper: PaperNote) => void;
  onPrintPdf: (paper: PaperNote) => void;
  existingTags: string[];
}

export const PaperEditor: React.FC<PaperEditorProps> = ({
  paper,
  onSave,
  onBack,
  onDelete,
  onExportMarkdown,
  onPrintPdf,
  existingTags,
}) => {
  const [formData, setFormData] = useState<PaperNote>(paper);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'dirty'>('saved');
  const [activeSection, setActiveSection] = useState<TemplateSectionKey>('objective');
  const [tagInput, setTagInput] = useState('');
  const [showBibtexModal, setShowBibtexModal] = useState(false);
  const [bibtexCopied, setBibtexCopied] = useState(false);
  const [previewModes, setPreviewModes] = useState<Record<TemplateSectionKey, 'edit' | 'split' | 'preview'>>({
    objective: 'split',
    methodology: 'split',
    results: 'split',
    limitations: 'split',
    myThoughts: 'split',
  });
  const [aiLoadingSection, setAiLoadingSection] = useState<TemplateSectionKey | null>(null);
  const [aiPromptOpen, setAiPromptOpen] = useState<TemplateSectionKey | null>(null);
  const [customAiPrompt, setCustomAiPrompt] = useState('');
  const [showAbstractAssistant, setShowAbstractAssistant] = useState<boolean>(!paper.title || paper.title.trim() === '');
  const [showAbstractSection, setShowAbstractSection] = useState<boolean>(!!paper.abstract || !!paper.abstractSummary);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state if external paper changes
  useEffect(() => {
    setFormData(paper);
    setSaveStatus('saved');
    if (!paper.title || paper.title.trim() === '') {
      setShowAbstractAssistant(true);
    }
  }, [paper.id]);

  // Auto-save logic: debounce save by 800ms
  const updateField = <K extends keyof PaperNote>(key: K, value: PaperNote[K]) => {
    const updated = {
      ...formData,
      [key]: value,
      updatedAt: new Date().toISOString(),
    };
    setFormData(updated);
    setSaveStatus('dirty');

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    setSaveStatus('saving');
    autoSaveTimerRef.current = setTimeout(() => {
      onSave(updated);
      setSaveStatus('saved');
    }, 700);
  };

  const handleManualSave = () => {
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    onSave(formData);
    setSaveStatus('saved');
  };

  // Add tag
  const handleAddTag = (newTag: string) => {
    const trimmed = newTag.trim().replace(/^#/, '');
    if (trimmed && !formData.tags.includes(trimmed)) {
      updateField('tags', [...formData.tags, trimmed]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tagToRemove: string) => {
    updateField('tags', formData.tags.filter(t => t !== tagToRemove));
  };

  // Insert markdown snippet into section textarea
  const insertMarkdown = (sectionKey: TemplateSectionKey, before: string, after: string = '') => {
    const textarea = document.getElementById(`editor-${sectionKey}`) as HTMLTextAreaElement | null;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = formData[sectionKey] || '';
    const selected = text.substring(start, end);
    const replacement = `${before}${selected || '텍스트'}${after}`;
    const newContent = text.substring(0, start) + replacement + text.substring(end);

    updateField(sectionKey, newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + (selected ? selected.length : 3));
    }, 50);
  };

  // Trigger AI assistant for a specific section
  const handleRunAiAssist = async (sectionKey: TemplateSectionKey) => {
    try {
      setAiLoadingSection(sectionKey);
      const sectionMeta = TEMPLATE_SECTIONS.find(s => s.key === sectionKey);

      const res = await fetch('/api/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionTitle: sectionMeta?.title || sectionKey,
          paperTitle: formData.title,
          paperContext: `저자: ${formData.authors}, 학회: ${formData.venue} (${formData.year}), DOI: ${formData.doi}`,
          currentContent: formData[sectionKey],
          prompt: customAiPrompt.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'AI 응답 실패');
      }

      const data = await res.json();
      if (data.success && data.result) {
        const appended = formData[sectionKey]?.trim()
          ? `${formData[sectionKey]}\n\n${data.result}`
          : data.result;
        updateField(sectionKey, appended);
      }
      setAiPromptOpen(null);
      setCustomAiPrompt('');
    } catch (err: any) {
      alert(`AI 보조 기능 호출 중 오류: ${err.message}`);
    } finally {
      setAiLoadingSection(null);
    }
  };

  const statusLabels: Record<PaperStatus, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
    to_read: { label: '읽을 예정', icon: Bookmark },
    reading: { label: '읽는 중', icon: Clock },
    completed: { label: '읽음 완료', icon: CheckCircle2 },
    revisit: { label: '재검토 필요', icon: AlertCircle },
  };

  // Jump to section
  const scrollToSection = (secKey: TemplateSectionKey) => {
    setActiveSection(secKey);
    const el = document.getElementById(`section-container-${secKey}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Action Header */}
      <div className="no-print bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 sticky top-18 z-20">
        <div className="flex items-center gap-3">
          <button
            id="btn-back-to-dashboard"
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>목록으로</span>
          </button>

          {/* Auto-save status badge */}
          <div className="flex items-center gap-1.5 text-xs">
            {saveStatus === 'saving' ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-ping" />
                자동 저장 중...
              </span>
            ) : saveStatus === 'dirty' ? (
              <span className="inline-flex items-center gap-1 text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                임시 저장 상태
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                <Check className="w-3 h-3" />
                모든 변경사항 저장됨
              </span>
            )}
          </div>
        </div>

        {/* Status, Rating & Export Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* AI Abstract & Keyword Assistant Toggle */}
          <button
            type="button"
            onClick={() => setShowAbstractAssistant(prev => !prev)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              showAbstractAssistant
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}
            title="AI 논문 초록 요약 및 핵심 키워드 자동 추천 도우미 열기/닫기"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI 초록 요약 & 키워드</span>
          </button>

          {/* Status selector */}
          <select
            id="select-editor-status"
            aria-label="독서 진행 상태"
            value={formData.status}
            onChange={(e) => updateField('status', e.target.value as PaperStatus)}
            className="text-xs py-1.5 px-2.5 rounded-lg border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="to_read">📌 읽을 예정</option>
            <option value="reading">⏳ 읽는 중</option>
            <option value="completed">✅ 읽음 완료</option>
            <option value="revisit">⚠️ 재검토 필요</option>
          </select>

          {/* Star Rating */}
          <div className="flex items-center gap-1 px-2 py-1 bg-slate-50 rounded-lg border border-slate-200">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                aria-label={`${star}점 별점 주기`}
                onClick={() => updateField('rating', formData.rating === star ? 0 : star)}
                className="p-0.5 transition-transform hover:scale-110"
              >
                <Star
                  className={`w-4 h-4 ${
                    formData.rating >= star
                      ? 'fill-amber-400 text-amber-500'
                      : 'text-slate-300 hover:text-amber-300'
                  }`}
                />
              </button>
            ))}
          </div>

          {/* Export to Markdown */}
          <button
            type="button"
            onClick={() => onExportMarkdown(formData)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Markdown (.md) 파일로 다운로드"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Markdown</span>
          </button>

          {/* Print / PDF view */}
          <button
            type="button"
            onClick={() => onPrintPdf(formData)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="인쇄 또는 PDF 저장"
          >
            <Printer className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">PDF 인쇄</span>
          </button>

          {/* BibTeX copy button */}
          <button
            type="button"
            onClick={() => setShowBibtexModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="BibTeX 인용 정보 확인"
          >
            <Copy className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">BibTeX</span>
          </button>

          {/* Delete */}
          <button
            type="button"
            onClick={() => {
              if (window.confirm('이 논문 요약 노트를 영구히 삭제하시겠습니까?')) {
                onDelete(formData.id);
              }
            }}
            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
            title="노트 삭제"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Sticky Outline / Quick Navigation (Desktop) */}
        <div className="no-print lg:col-span-1 space-y-4 lg:sticky lg:top-36">
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center justify-between">
              <span>템플릿 바로가기</span>
              <span className="text-[10px] text-emerald-600 font-semibold">5대 표준</span>
            </h4>
            <nav className="space-y-1 text-xs">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById('section-container-structured');
                  el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-emerald-800 bg-emerald-50/80 hover:bg-emerald-100 font-semibold transition-colors mb-2 border border-emerald-200"
              >
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  AI 14대 구조화 분석
                </span>
                {formData.structuredAnalysis?.oneLineSummary ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <span className="text-[10px] text-emerald-600 font-normal">분석</span>
                )}
              </button>

              {TEMPLATE_SECTIONS.map((sec, idx) => {
                const isFilled = formData[sec.key] && formData[sec.key].trim().length > 0;
                const isActive = activeSection === sec.key;
                const displayTitle = sec.shortTitle || sec.title.replace(/^\d+\.\s*/, '').replace(/\s*\([^)]*\)$/, '');
                return (
                  <button
                    key={sec.key}
                    type="button"
                    onClick={() => scrollToSection(sec.key)}
                    className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between transition-colors ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-900 font-semibold border-l-3 border-emerald-600'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <span className="truncate whitespace-nowrap">{idx + 1}. {displayTitle}</span>
                    {isFilled ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-1.5" />
                    ) : (
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0 ml-1.5" />
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Guide Card */}
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-4 text-xs text-emerald-950 space-y-2">
            <div className="font-bold flex items-center gap-1.5 text-emerald-900">
              <HelpCircle className="w-4 h-4 text-emerald-600" />
              작성 가이드 팁
            </div>
            <p className="text-[11px] text-emerald-900/80 leading-relaxed">
              각 입력창에서 <kbd className="bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-mono text-[10px]">Tab</kbd> 키를 눌러 다음 섹션으로 직관적으로 이동할 수 있습니다. 수식은 <code className="bg-white/80 px-1 py-0.5 rounded font-mono text-[10px]">$E=mc^2$</code> 문법을 지원합니다.
            </p>
          </div>
        </div>

        {/* Right Main Content (Basic Info + 5 Standard Sections) */}
        <div className="lg:col-span-3 space-y-6">
          {/* AI Abstract Summarizer & Keyword Suggestion Panel */}
          {showAbstractAssistant && (
            <AbstractAssistant
              paper={formData}
              onApplyData={(data) => {
                const updated = { ...formData, ...data, updatedAt: new Date().toISOString() };
                setFormData(updated);
                onSave(updated);
                if (data.abstract || data.abstractSummary) {
                  setShowAbstractSection(true);
                }
              }}
              onClose={() => setShowAbstractAssistant(false)}
              defaultExpanded={true}
            />
          )}

          {/* 1. Basic Metadata Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-3 gap-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <span>기본 정보 (Basic Information)</span>
                {formData.doi && (
                  <a
                    href={formData.doi.startsWith('http') ? formData.doi : `https://doi.org/${formData.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-normal"
                  >
                    원문 링크 <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </h3>

              {/* Quick Academic Portals Search Bar */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs">
                <span className="text-[11px] text-slate-500 font-medium">학술 DB 검색:</span>
                {ACADEMIC_PORTALS.map((portal) => (
                  <a
                    key={portal.id}
                    href={formData.title ? portal.searchUrl(formData.title) : portal.homeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border transition-colors shadow-2xs ${portal.bgColor} ${portal.color} ${portal.borderColor} hover:brightness-95`}
                    title={`${portal.fullName}에서 '${formData.title || '논문'}' 검색하기`}
                  >
                    <span>{portal.name}</span>
                    <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                  </a>
                ))}
              </div>
            </div>

            {/* Paper Title */}
            <div>
              <label htmlFor="input-paper-title" className="block text-xs font-semibold text-slate-700 mb-1">
                논문 제목 (Title) <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-paper-title"
                type="text"
                tabIndex={1}
                value={formData.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="예: Attention Is All You Need"
                className="w-full px-3.5 py-2 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            {/* Authors & Venue/Year Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="input-paper-authors" className="block text-xs font-medium text-slate-700 mb-1">
                  저자 (Authors)
                </label>
                <input
                  id="input-paper-authors"
                  type="text"
                  tabIndex={2}
                  value={formData.authors}
                  onChange={(e) => updateField('authors', e.target.value)}
                  placeholder="예: Ashish Vaswani, Noam Shazeer, et al."
                  className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label htmlFor="input-paper-venue" className="block text-xs font-medium text-slate-700 mb-1">
                    게재 학회 / 저널 (Venue)
                  </label>
                  <input
                    id="input-paper-venue"
                    type="text"
                    tabIndex={3}
                    value={formData.venue}
                    onChange={(e) => updateField('venue', e.target.value)}
                    placeholder="예: NeurIPS, CVPR, Nature"
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label htmlFor="input-paper-year" className="block text-xs font-medium text-slate-700 mb-1">
                    연도 (Year)
                  </label>
                  <input
                    id="input-paper-year"
                    type="text"
                    tabIndex={4}
                    value={formData.year}
                    onChange={(e) => updateField('year', e.target.value)}
                    placeholder="2023"
                    className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* DOI/URL & Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="input-paper-doi" className="block text-xs font-medium text-slate-700 mb-1">
                  DOI 또는 arXiv 링크 / URL
                </label>
                <input
                  id="input-paper-doi"
                  type="text"
                  tabIndex={5}
                  value={formData.doi}
                  onChange={(e) => updateField('doi', e.target.value)}
                  placeholder="https://doi.org/... 또는 https://arxiv.org/abs/..."
                  className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label htmlFor="input-paper-category" className="block text-xs font-medium text-slate-700 mb-1">
                  연구 분야 (Category)
                </label>
                <input
                  id="input-paper-category"
                  type="text"
                  tabIndex={6}
                  value={formData.category}
                  onChange={(e) => updateField('category', e.target.value)}
                  placeholder="예: 인공지능, 컴퓨터비전, 생명과학, 시스템"
                  className="w-full px-3 py-2 text-xs text-slate-800 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Tags Input */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                태그 관리 (Tags)
              </label>
              <div className="flex flex-wrap items-center gap-1.5 p-2 bg-slate-50 border border-slate-200 rounded-lg">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs bg-white text-emerald-800 px-2 py-1 rounded-md border border-emerald-200 shadow-2xs"
                  >
                    #{tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-slate-400 hover:text-rose-600 ml-0.5"
                    >
                      ×
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  tabIndex={7}
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ',') {
                      e.preventDefault();
                      handleAddTag(tagInput);
                    }
                  }}
                  placeholder="태그 입력 후 Enter (예: 만성질환, 일차의료, 보건정책, 건강보험)"
                  className="text-xs bg-transparent border-none outline-none focus:ring-0 flex-1 min-w-[140px] px-1 py-0.5 text-slate-800 placeholder:text-slate-400"
                />
              </div>

              {/* AI Extracted Keywords quick-add */}
              {formData.extractedKeywords &&
                formData.extractedKeywords.some((k) => !formData.tags.includes(k)) && (
                  <div className="flex items-center gap-1.5 flex-wrap mt-2 p-2 bg-emerald-50/70 border border-emerald-100 rounded-lg text-[11px]">
                    <span className="text-emerald-900 font-bold flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-600" />
                      AI 추천 키워드 바로 추가:
                    </span>
                    {formData.extractedKeywords
                      .filter((k) => !formData.tags.includes(k))
                      .map((k) => (
                        <button
                          key={k}
                          type="button"
                          onClick={() => handleAddTag(k)}
                          className="px-2 py-0.5 bg-white hover:bg-emerald-100 text-emerald-800 font-medium rounded border border-emerald-200 shadow-2xs transition-colors cursor-pointer"
                        >
                          +{k}
                        </button>
                      ))}
                  </div>
                )}

              {/* Tag suggestions */}
              {existingTags.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap mt-1.5 text-[11px] text-slate-500">
                  <span className="text-slate-400">기존 태그 추천:</span>
                  {existingTags.filter(t => !formData.tags.includes(t)).slice(0, 6).map(t => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleAddTag(t)}
                      className="text-[10px] text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 px-1.5 py-0.5 rounded border border-slate-200"
                    >
                      +{t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Abstract & Executive Summary Expandable Section */}
            <div className="pt-3 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowAbstractSection((prev) => !prev)}
                  className="text-xs font-bold text-slate-800 hover:text-emerald-700 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5 text-emerald-600" />
                  <span>초록 원문 및 AI 핵심 요약 (Abstract & Summary)</span>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {showAbstractSection ? '접기 ▲' : '펼치기 ▼'}
                  </span>
                </button>
                {formData.abstractSummary && (
                  <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">
                    AI 핵심 요약 반영됨
                  </span>
                )}
              </div>

              {showAbstractSection && (
                <div className="mt-3 space-y-3 bg-slate-50/90 p-3.5 rounded-xl border border-slate-200">
                  {formData.abstractSummary && (
                    <div>
                      <label className="block text-xs font-bold text-emerald-900 mb-1 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        AI 초록 핵심 요약 (Executive Summary)
                      </label>
                      <textarea
                        value={formData.abstractSummary}
                        onChange={(e) => updateField('abstractSummary', e.target.value)}
                        rows={3}
                        className="w-full p-2.5 text-xs text-slate-800 bg-white border border-emerald-200 rounded-lg focus:ring-1 focus:ring-emerald-500 font-sans leading-relaxed shadow-2xs"
                        placeholder="AI가 요약한 초록의 핵심 내용..."
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-700 mb-1">
                      논문 초록 원문 (Abstract)
                    </label>
                    <textarea
                      value={formData.abstract || ''}
                      onChange={(e) => updateField('abstract', e.target.value)}
                      rows={4}
                      className="w-full p-2.5 text-xs text-slate-800 bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-emerald-500 font-sans leading-relaxed shadow-2xs"
                      placeholder="학술 DB(RISS, KISS, DBpia, KCI)에서 복사한 초록 원문을 입력하거나 보관하세요..."
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. AI Structured Analysis (14 Core Dimensions) */}
          <div id="section-container-structured">
            <StructuredAnalysisCard
              paper={formData}
              onUpdateAnalysis={(analysis) => updateField('structuredAnalysis', analysis)}
            />
          </div>

          {/* 3. The 5 Core Standard Template Sections */}
          {TEMPLATE_SECTIONS.map((sec, secIndex) => {
            const currentMode = previewModes[sec.key];
            const content = formData[sec.key] || '';
            const isAiLoading = aiLoadingSection === sec.key;
            const isAiPromptThis = aiPromptOpen === sec.key;

            return (
              <div
                key={sec.key}
                id={`section-container-${sec.key}`}
                className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden transition-all focus-within:border-emerald-400"
              >
                {/* Section Header */}
                <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                        {secIndex + 1}
                      </span>
                      {sec.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {sec.description}
                    </p>
                  </div>

                  {/* View Mode & AI Buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* AI Section Assist Button */}
                    <button
                      type="button"
                      onClick={() => setAiPromptOpen(isAiPromptThis ? null : sec.key)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                      title="AI로 이 섹션 초안 작성 및 다듬기"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>AI 보조</span>
                    </button>

                    {/* Editor View Switch: Edit, Split, Preview */}
                    <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-white">
                      <button
                        type="button"
                        onClick={() => setPreviewModes(prev => ({ ...prev, [sec.key]: 'edit' }))}
                        className={`p-1 rounded text-xs transition-colors ${
                          currentMode === 'edit' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-400 hover:text-slate-700'
                        }`}
                        title="편집 모드"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewModes(prev => ({ ...prev, [sec.key]: 'split' }))}
                        className={`p-1 rounded text-xs transition-colors ${
                          currentMode === 'split' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-400 hover:text-slate-700'
                        }`}
                        title="분할 미리보기"
                      >
                        <Columns className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewModes(prev => ({ ...prev, [sec.key]: 'preview' }))}
                        className={`p-1 rounded text-xs transition-colors ${
                          currentMode === 'preview' ? 'bg-emerald-50 text-emerald-700 font-medium' : 'text-slate-400 hover:text-slate-700'
                        }`}
                        title="전체 미리보기"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* AI Prompt Drawer if open */}
                {isAiPromptThis && (
                  <div className="p-3.5 bg-emerald-50/50 border-b border-emerald-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      value={customAiPrompt}
                      onChange={(e) => setCustomAiPrompt(e.target.value)}
                      placeholder="AI에게 요청할 지시사항 (비워두면 기본 템플릿에 맞게 자동 보완)"
                      className="text-xs flex-1 px-3 py-1.5 rounded-lg border border-emerald-200 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={isAiLoading}
                        onClick={() => handleRunAiAssist(sec.key)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg disabled:opacity-50 transition-colors flex items-center gap-1 shadow-2xs"
                      >
                        {isAiLoading ? (
                          <>
                            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            생성 중...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3 h-3 text-amber-300" />
                            작성 실행
                          </>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setAiPromptOpen(null)}
                        className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-700"
                      >
                        닫기
                      </button>
                    </div>
                  </div>
                )}

                {/* Guide prompts collapsible row */}
                <div className="px-4 py-2 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="font-semibold text-slate-600">핵심 질문:</span>
                    <span className="truncate italic">{sec.guideQuestions.join(' · ')}</span>
                  </div>
                  {content.length === 0 && (
                    <button
                      type="button"
                      onClick={() => updateField(sec.key, sec.placeholder)}
                      className="text-emerald-700 hover:underline shrink-0 font-medium"
                    >
                      예시 템플릿 채우기
                    </button>
                  )}
                </div>

                {/* Markdown Formatting Toolbar */}
                {currentMode !== 'preview' && (
                  <div className="px-4 py-1.5 bg-white border-b border-slate-100 flex items-center gap-1 flex-wrap text-xs text-slate-600">
                    <button
                      type="button"
                      onClick={() => insertMarkdown(sec.key, '## ', '')}
                      className="p-1 hover:bg-slate-100 rounded"
                      title="소제목 H2"
                    >
                      <Heading2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown(sec.key, '**', '**')}
                      className="p-1 hover:bg-slate-100 rounded font-bold"
                      title="굵게"
                    >
                      <Bold className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown(sec.key, '*', '*')}
                      className="p-1 hover:bg-slate-100 rounded italic"
                      title="기울임"
                    >
                      <Italic className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown(sec.key, '- ', '')}
                      className="p-1 hover:bg-slate-100 rounded"
                      title="글머리 기호 목록"
                    >
                      <List className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown(sec.key, '`', '`')}
                      className="p-1 hover:bg-slate-100 rounded"
                      title="인라인 코드"
                    >
                      <Code className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown(sec.key, '$', '$')}
                      className="p-1 hover:bg-slate-100 rounded"
                      title="LaTeX 수식 ($...$)"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown(sec.key, '> ', '')}
                      className="p-1 hover:bg-slate-100 rounded"
                      title="인용구"
                    >
                      <Quote className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {/* Content Editor Body */}
                <div className="p-4">
                  {currentMode === 'edit' && (
                    <textarea
                      id={`editor-${sec.key}`}
                      tabIndex={8 + secIndex}
                      value={content}
                      onChange={(e) => updateField(sec.key, e.target.value)}
                      placeholder={sec.placeholder}
                      rows={8}
                      className="w-full p-3 font-mono text-xs leading-relaxed text-slate-800 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-y transition-all"
                    />
                  )}

                  {currentMode === 'split' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          Markdown 편집기
                        </div>
                        <textarea
                          id={`editor-${sec.key}`}
                          tabIndex={8 + secIndex}
                          value={content}
                          onChange={(e) => updateField(sec.key, e.target.value)}
                          placeholder={sec.placeholder}
                          rows={9}
                          className="w-full p-3 font-mono text-xs leading-relaxed text-slate-800 bg-slate-50/50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-y transition-all"
                        />
                      </div>
                      <div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                          실시간 미리보기
                        </div>
                        <div className="p-3 bg-slate-50/30 border border-slate-200 rounded-lg min-h-[170px] max-h-[300px] overflow-y-auto text-xs leading-relaxed text-slate-800 prose prose-sm prose-slate max-w-none">
                          {content.trim() ? (
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                              {content}
                            </ReactMarkdown>
                          ) : (
                            <span className="text-slate-400 italic text-xs">작성된 내용이 여기에 실시간으로 렌더링됩니다.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {currentMode === 'preview' && (
                    <div className="p-4 bg-slate-50/30 border border-slate-200 rounded-lg min-h-[120px] text-xs leading-relaxed text-slate-800 prose prose-sm prose-slate max-w-none">
                      {content.trim() ? (
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {content}
                        </ReactMarkdown>
                      ) : (
                        <span className="text-slate-400 italic text-xs">내용이 비어 있습니다. 편집 모드로 전환하여 내용을 작성하세요.</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BibTeX Modal */}
      {showBibtexModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base">BibTeX 인용 정보</h3>
              <button
                type="button"
                onClick={() => setShowBibtexModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <pre className="p-3 bg-slate-900 text-emerald-300 font-mono text-xs rounded-xl overflow-x-auto">
              {generateBibtex(formData)}
            </pre>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={async () => {
                  const success = await copyToClipboard(generateBibtex(formData));
                  if (success) {
                    setBibtexCopied(true);
                    setTimeout(() => setBibtexCopied(false), 2000);
                  }
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                {bibtexCopied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {bibtexCopied ? '복사 완료!' : '클립보드에 복사'}
              </button>
              <button
                type="button"
                onClick={() => setShowBibtexModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
