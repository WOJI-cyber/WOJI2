import React, { useMemo, useState, useRef } from 'react';
import { PaperNote, FilterState, PaperStatus, SortField, ResearchProject, ResearchGapItem, ResearchTopicProposal } from '../types';
import { PaperCard } from './PaperCard';
import { PaperTableView } from './PaperTableView';
import {
  Search,
  LayoutGrid,
  List,
  Filter,
  ArrowUpDown,
  Tag,
  Star,
  BookOpen,
  Plus,
  Sparkles,
  CheckCircle2,
  Clock,
  Bookmark,
  X,
  UploadCloud,
  Link2,
  Compass,
  GitCompare,
  FolderKanban,
  Check,
  FileText,
  Lightbulb,
  ExternalLink,
  ChevronDown,
  Layers
} from 'lucide-react';

interface DashboardProps {
  papers: PaperNote[];
  projects: ResearchProject[];
  currentProjectId?: string;
  onSelectProject: (projectId?: string) => void;
  onCreateProject: (project: Partial<ResearchProject>) => void;
  filters: FilterState;
  onUpdateFilters: (filters: Partial<FilterState>) => void;
  onResetFilters: () => void;
  viewMode: 'grid' | 'table';
  onToggleViewMode: (mode: 'grid' | 'table') => void;
  onSelectPaper: (paper: PaperNote) => void;
  onNewPaper: () => void;
  onOpenAiExtract: () => void;
  onOpenDoiModal: () => void;
  onOpenCompareModal: (papers: PaperNote[]) => void;
  onOpenGapModal: (papers: PaperNote[]) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onDeletePaper: (id: string, e: React.MouseEvent) => void;
  onExportMarkdown: (paper: PaperNote, e: React.MouseEvent) => void;
  onSaveTopicToProject?: (projectId: string, topic: ResearchTopicProposal) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  papers,
  projects,
  currentProjectId,
  onSelectProject,
  onCreateProject,
  filters,
  onUpdateFilters,
  onResetFilters,
  viewMode,
  onToggleViewMode,
  onSelectPaper,
  onNewPaper,
  onOpenAiExtract,
  onOpenDoiModal,
  onOpenCompareModal,
  onOpenGapModal,
  onToggleFavorite,
  onDeletePaper,
  onExportMarkdown,
  onSaveTopicToProject,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [selectedPaperIds, setSelectedPaperIds] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [projectSubTab, setProjectSubTab] = useState<'papers' | 'key' | 'to_read' | 'notes' | 'gaps' | 'topics'>('papers');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  const currentProject = useMemo(() => {
    return projects.find(p => p.id === currentProjectId);
  }, [projects, currentProjectId]);

  // Collect all unique tags and count them
  const allTagsWithCount = useMemo(() => {
    const map = new Map<string, number>();
    papers.forEach(p => {
      p.tags.forEach(t => {
        const clean = t.trim();
        if (clean) {
          map.set(clean, (map.get(clean) || 0) + 1);
        }
      });
    });
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [papers]);

  // Filtered and sorted papers
  const filteredPapers = useMemo(() => {
    return papers
      .filter(p => {
        // Project filter
        if (currentProjectId && p.projectId !== currentProjectId) {
          // If in key tab or specific sub-tab
          if (projectSubTab === 'key') {
            if (!currentProject?.keyPaperIds?.includes(p.id) && !p.isFavorite) return false;
          }
          return false;
        }

        // Project sub-tabs (if project active)
        if (currentProjectId) {
          if (projectSubTab === 'key' && (!currentProject?.keyPaperIds?.includes(p.id) && !p.isFavorite)) {
            return false;
          }
          if (projectSubTab === 'to_read' && p.status !== 'to_read') {
            return false;
          }
        }

        // Status filter
        if (filters.status !== 'all' && p.status !== filters.status) return false;

        // Favorite filter
        if (filters.onlyFavorites && !p.isFavorite) return false;

        // Category filter
        if (filters.selectedCategory !== 'all' && p.category !== filters.selectedCategory) return false;

        // Origin filter (domestic vs international)
        if (filters.origin && filters.origin !== 'all') {
          if (p.origin !== filters.origin) return false;
        }

        // Recent 5 years filter
        const pYearNum = p.year ? Number(p.year) : NaN;
        if (filters.recent5Years) {
          const currentYear = new Date().getFullYear();
          if (isNaN(pYearNum) || pYearNum < currentYear - 4) return false;
        }

        // Publication year range
        if (filters.yearFrom && !isNaN(pYearNum) && pYearNum < filters.yearFrom) return false;
        if (filters.yearTo && !isNaN(pYearNum) && pYearNum > filters.yearTo) return false;

        // Open Access Only
        if (filters.openAccessOnly && !p.isOpenAccess) return false;

        // Study Type filter
        if (filters.studyType && filters.studyType !== 'all') {
          if (!p.studyType?.includes(filters.studyType)) return false;
        }

        // Tags filter
        if (filters.selectedTags.length > 0) {
          const hasSelectedTags = filters.selectedTags.every(st =>
            p.tags.some(t => t.toLowerCase() === st.toLowerCase())
          );
          if (!hasSelectedTags) return false;
        }

        // Enhanced Search Query filter: searches title, authors, venue, keywords, topic, variables, structured summary
        if (filters.searchQuery.trim()) {
          const q = filters.searchQuery.toLowerCase().trim();
          const matchTitle = p.title.toLowerCase().includes(q);
          const matchAuthors = p.authors.toLowerCase().includes(q);
          const matchVenue = p.venue.toLowerCase().includes(q);
          const matchCategory = p.category.toLowerCase().includes(q);
          const matchTags = p.tags.some(t => t.toLowerCase().includes(q));
          const matchAbstract = (p.abstract || '').toLowerCase().includes(q);
          const matchOneLine = (p.structuredAnalysis?.oneLineSummary || p.abstractSummary || '').toLowerCase().includes(q);
          const matchTarget = (p.structuredAnalysis?.studyTarget || '').toLowerCase().includes(q);
          const matchIndepVar = (p.structuredAnalysis?.variables?.independent || '').toLowerCase().includes(q);
          const matchDepVar = (p.structuredAnalysis?.variables?.dependent || '').toLowerCase().includes(q);
          const matchMethod = (p.structuredAnalysis?.researchMethod || p.methodology || '').toLowerCase().includes(q);

          if (!matchTitle && !matchAuthors && !matchVenue && !matchCategory && !matchTags &&
              !matchAbstract && !matchOneLine && !matchTarget && !matchIndepVar && !matchDepVar && !matchMethod) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const order = filters.sortOrder === 'asc' ? 1 : -1;
        if (filters.sortBy === 'updatedAt') {
          return (new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()) * order;
        }
        if (filters.sortBy === 'createdAt') {
          return (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) * order;
        }
        if (filters.sortBy === 'year') {
          return (Number(a.year || 0) - Number(b.year || 0)) * order;
        }
        if (filters.sortBy === 'rating') {
          return ((a.rating || 0) - (b.rating || 0)) * order;
        }
        if (filters.sortBy === 'title') {
          return a.title.localeCompare(b.title, 'ko') * order;
        }
        return 0;
      });
  }, [papers, filters, currentProjectId, projectSubTab, currentProject]);

  // Handle Multi-select
  const handleToggleSelectPaper = (paperId: string) => {
    setSelectedPaperIds(prev =>
      prev.includes(paperId) ? prev.filter(id => id !== paperId) : [...prev, paperId]
    );
  };

  const handleSelectAllFiltered = () => {
    const allFilteredIds = filteredPapers.map(p => p.id);
    const areAllSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedPaperIds.includes(id));
    if (areAllSelected) {
      setSelectedPaperIds(prev => prev.filter(id => !allFilteredIds.includes(id)));
    } else {
      setSelectedPaperIds(Array.from(new Set([...selectedPaperIds, ...allFilteredIds])));
    }
  };

  const selectedPapers = useMemo(() => {
    return papers.filter(p => selectedPaperIds.includes(p.id));
  }, [papers, selectedPaperIds]);

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    const newProj: ResearchProject = {
      id: `proj-${Date.now()}`,
      name: newProjectName.trim(),
      description: newProjectDesc.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      keyPaperIds: [],
      researchNotes: '# 연구 메모 및 방향\n- ',
      researchGaps: [],
      topicProposals: [],
    };
    onCreateProject(newProj);
    setIsCreatingProject(false);
    setNewProjectName('');
    setNewProjectDesc('');
    onSelectProject(newProj.id);
  };

  const handleTagToggle = (tag: string) => {
    if (filters.selectedTags.includes(tag)) {
      onUpdateFilters({ selectedTags: filters.selectedTags.filter(t => t !== tag) });
    } else {
      onUpdateFilters({ selectedTags: [...filters.selectedTags, tag] });
    }
  };

  const hasActiveFilters =
    filters.searchQuery !== '' ||
    filters.status !== 'all' ||
    filters.selectedCategory !== 'all' ||
    filters.selectedTags.length > 0 ||
    filters.onlyFavorites ||
    filters.origin !== 'all' ||
    filters.recent5Years ||
    filters.openAccessOnly ||
    (filters.studyType && filters.studyType !== 'all') ||
    filters.yearFrom !== undefined ||
    filters.yearTo !== undefined;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
      {/* 1. Enhanced Hero Section (요구사항 1 & 2) */}
      <div 
        id="hero-banner-section"
        className="bg-gradient-to-br from-emerald-950 via-slate-900 to-teal-950 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden border border-emerald-900/50"
      >
        <div className="relative z-10 max-w-3xl">
          {/* Tagline / Workflow tracker */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-xs font-semibold text-emerald-300 mb-3.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            논문 검색 &rarr; 저장 &rarr; AI 구조화 &rarr; 비교 &rarr; Research Gap &rarr; 주제 제안
          </div>

          {/* Main Title */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-2.5 leading-tight">
            논문 검색부터 연구주제 발견까지, 한 곳에서
          </h1>

          {/* Subtitle */}
          <p className="text-sm text-emerald-100/90 leading-relaxed max-w-2xl mb-6">
            논문을 검색·저장하고 AI로 핵심 내용을 구조화하세요.<br className="hidden sm:inline" />
            여러 연구를 비교해 연구 공백과 다음 연구주제까지 발견할 수 있습니다.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 1. 논문 검색 */}
            <button
              type="button"
              id="hero-search-btn"
              onClick={() => {
                searchInputRef.current?.focus();
                searchInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-emerald-950 font-bold text-xs shadow-sm hover:bg-emerald-50 active:scale-[0.98] transition-all"
            >
              <Search className="w-4 h-4 text-emerald-700" />
              논문 검색
            </button>

            {/* 2. PDF 업로드 */}
            <button
              type="button"
              id="hero-pdf-upload-btn"
              onClick={onOpenAiExtract}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-900/80 hover:bg-emerald-800 text-white font-semibold text-xs border border-emerald-500/40 active:scale-[0.98] transition-all"
            >
              <UploadCloud className="w-4 h-4 text-emerald-200" />
              PDF 업로드
            </button>

            {/* 3. DOI / URL로 추가 */}
            <button
              type="button"
              id="hero-doi-add-btn"
              onClick={onOpenDoiModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-white font-semibold text-xs border border-emerald-400/30 active:scale-[0.98] transition-all"
            >
              <Link2 className="w-4 h-4 text-emerald-300" />
              DOI / URL로 추가
            </button>

            {/* 4. 별도의 강조 버튼: ✨ AI 연구주제 찾기 */}
            <button
              type="button"
              id="hero-topic-discovery-btn"
              onClick={() => onOpenGapModal(selectedPapers.length > 0 ? selectedPapers : papers)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold text-xs shadow-md ring-2 ring-emerald-400/40 active:scale-[0.98] transition-all ml-0 sm:ml-2"
            >
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
              <span>✨ AI 연구주제 찾기</span>
            </button>
          </div>
        </div>

        {/* Decorative backdrop graphics */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 bottom-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* 2. Research Project Management Navigation Bar (요구사항 9) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FolderKanban className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900">연구 프로젝트</span>
              <span className="text-[11px] text-slate-500 ml-2">논문군, 메모, 공백 및 주제 통합 관리</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Project Select Dropdown */}
            <select
              id="select-active-project"
              value={currentProjectId || 'all'}
              onChange={(e) => onSelectProject(e.target.value === 'all' ? undefined : e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">전체 보관함 (모든 논문)</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>📁 {p.name}</option>
              ))}
            </select>

            {/* New Project Button */}
            <button
              type="button"
              onClick={() => setIsCreatingProject(true)}
              className="px-2.5 py-1.5 rounded-lg border border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              새 프로젝트
            </button>
          </div>
        </div>

        {/* Project Sub-navigation if project is selected */}
        {currentProject && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1 overflow-x-auto text-xs">
              {[
                { key: 'papers', label: '저장 논문', count: papers.filter(p => p.projectId === currentProject.id).length },
                { key: 'key', label: '핵심 논문', count: currentProject.keyPaperIds?.length || 0, icon: Star },
                { key: 'to_read', label: '읽을 논문', count: papers.filter(p => p.projectId === currentProject.id && p.status === 'to_read').length, icon: Bookmark },
                { key: 'notes', label: '연구 메모', icon: FileText },
                { key: 'gaps', label: 'Research Gap 분석', count: currentProject.researchGaps?.length || 0, icon: Compass },
                { key: 'topics', label: '연구주제 후보', count: currentProject.topicProposals?.length || 0, icon: Lightbulb },
              ].map(tab => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setProjectSubTab(tab.key as any)}
                  className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                    projectSubTab === tab.key
                      ? 'bg-emerald-600 text-white shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.icon && <tab.icon className="w-3 h-3" />}
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      projectSubTab === tab.key ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="text-[11px] text-slate-500 line-clamp-1 italic">
              {currentProject.description}
            </div>
          </div>
        )}

        {/* Modal: New Project creation */}
        {isCreatingProject && (
          <form onSubmit={handleCreateProjectSubmit} className="mt-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-900">새 연구 프로젝트 만들기</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <input
                type="text"
                required
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="프로젝트 이름 (예: 초고령사회 지역사회 커뮤니티 케어 연구)"
                className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="프로젝트 설명 또는 주요 연구 방향"
                className="px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsCreatingProject(false)}
                className="px-3 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                취소
              </button>
              <button
                type="submit"
                className="px-3.5 py-1 text-xs bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700"
              >
                프로젝트 생성
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Project Sub-Tab Dedicated Panels (Notes, Gaps, Topics) */}
      {currentProject && projectSubTab === 'notes' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              {currentProject.name} - 연구 진행 메모
            </h3>
            <span className="text-xs text-slate-400">자유 양식 마크다운 노트</span>
          </div>
          <div className="prose prose-sm max-w-none bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 whitespace-pre-wrap">
            {currentProject.researchNotes || '작성된 연구 메모가 없습니다.'}
          </div>
        </div>
      )}

      {currentProject && projectSubTab === 'gaps' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-600" />
              프로젝트 식별 Research Gap ({currentProject.researchGaps?.length || 0})
            </h3>
            <button
              type="button"
              onClick={() => onOpenGapModal(papers.filter(p => p.projectId === currentProject.id))}
              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI로 새 Research Gap 발굴하기
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {currentProject.researchGaps && currentProject.researchGaps.length > 0 ? (
              currentProject.researchGaps.map(gap => (
                <div key={gap.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {gap.categoryLabel || gap.category}
                    </span>
                    {gap.severity === 'high' && (
                      <span className="text-[10px] text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded font-bold">중요</span>
                    )}
                  </div>
                  <h4 className="font-bold text-slate-900 text-xs mb-1">{gap.title}</h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed mb-2">{gap.description}</p>
                  <div className="text-[10px] text-slate-500 italic bg-white p-2 rounded border border-slate-100">
                    근거: {gap.groundedPaperTitles.join(', ')}
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-6 text-xs text-slate-400">
                아직 저장된 Research Gap이 없습니다. 상단 'AI 연구주제 찾기'를 통해 공백을 발굴해보세요.
              </div>
            )}
          </div>
        </div>
      )}

      {currentProject && projectSubTab === 'topics' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              보관된 연구주제 후보 ({currentProject.topicProposals?.length || 0})
            </h3>
            <button
              type="button"
              onClick={() => onOpenGapModal(papers.filter(p => p.projectId === currentProject.id))}
              className="px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI 연구주제 추천받기
            </button>
          </div>

          <div className="space-y-3">
            {currentProject.topicProposals && currentProject.topicProposals.length > 0 ? (
              currentProject.topicProposals.map(t => (
                <div key={t.id} className="p-4 bg-white rounded-xl border border-emerald-100 shadow-xs space-y-2">
                  <h4 className="font-bold text-slate-900 text-sm">{t.title}</h4>
                  <p className="text-xs font-medium text-emerald-700">Q. {t.researchQuestion}</p>
                  <p className="text-xs text-slate-600">{t.necessity}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] pt-1">
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">대상</span>
                      <span className="font-semibold">{t.studyTarget}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">독립변수</span>
                      <span className="font-semibold text-emerald-900">{t.independentVariable}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">종속변수</span>
                      <span className="font-semibold text-emerald-900">{t.dependentVariable}</span>
                    </div>
                    <div className="bg-slate-50 p-2 rounded border border-slate-200">
                      <span className="text-slate-400 block text-[10px]">추천방법</span>
                      <span className="font-semibold">{t.recommendedMethod}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-xs text-slate-400">
                아직 보관된 연구주제가 없습니다. 'AI 연구주제 찾기'에서 마음에 드는 주제를 저장해보세요.
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Enhanced Search & Multi-dimension Filters (요구사항 3) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Main Search Input with required placeholder */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              id="input-paper-search"
              type="text"
              value={filters.searchQuery}
              onChange={(e) => onUpdateFilters({ searchQuery: e.target.value })}
              placeholder="연구하고 싶은 주제나 논문 제목을 입력하세요"
              className="w-full pl-10 pr-9 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all shadow-xs"
            />
            {filters.searchQuery && (
              <button
                type="button"
                onClick={() => onUpdateFilters({ searchQuery: '' })}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Bar Toggle Button & Quick Controls */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="toggle-advanced-filters-btn"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors border ${
                showAdvancedFilters || hasActiveFilters
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Filter className="w-3.5 h-3.5" />
              <span>상세 검색 필터</span>
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
              )}
            </button>

            {/* Sort Select */}
            <div className="relative flex items-center">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
              <select
                id="select-sort-by"
                aria-label="정렬 기준"
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split('-') as [SortField, 'asc' | 'desc'];
                  onUpdateFilters({ sortBy: field, sortOrder: order });
                }}
                className="pl-8 pr-7 py-2 text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="updatedAt-desc">최근 수정순</option>
                <option value="createdAt-desc">최근 작성순</option>
                <option value="year-desc">출판 연도 (최신순)</option>
                <option value="rating-desc">별점 높은순</option>
                <option value="title-asc">제목 (가나다순)</option>
              </select>
            </div>

            {/* View Mode Toggle (Grid vs Table) */}
            <div className="flex items-center border border-slate-200 rounded-xl p-0.5 bg-slate-50">
              <button
                type="button"
                onClick={() => onToggleViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-white text-emerald-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="카드형 보기"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onToggleViewMode('table')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'table'
                    ? 'bg-white text-emerald-600 shadow-xs'
                    : 'text-slate-400 hover:text-slate-700'
                }`}
                title="리스트/표 보기"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel (국내/해외, 출판 연도, 최근 5년, 무료 원문, 연구 유형) */}
        {(showAdvancedFilters || hasActiveFilters) && (
          <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            {/* 1. 국내 / 해외 필터 */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">국내 / 해외 구분</label>
              <select
                id="filter-origin-select"
                value={filters.origin || 'all'}
                onChange={(e) => onUpdateFilters({ origin: e.target.value as any })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
              >
                <option value="all">전체 (국내외 통합)</option>
                <option value="domestic">국내 학술지 (KCI, RISS, DBpia)</option>
                <option value="international">해외 저널 (SSCI, SCIE)</option>
              </select>
            </div>

            {/* 2. 최근 5년 & 무료 원문 (Open Access) 원클릭 토글 */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">빠른 조건</label>
              <div className="flex items-center gap-2 pt-0.5">
                <button
                  type="button"
                  id="filter-recent5years-btn"
                  onClick={() => onUpdateFilters({ recent5Years: !filters.recent5Years })}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                    filters.recent5Years
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <Clock className="w-3 h-3" />
                  최근 5년 (2021~)
                </button>
                <button
                  type="button"
                  id="filter-openaccess-btn"
                  onClick={() => onUpdateFilters({ openAccessOnly: !filters.openAccessOnly })}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-1 ${
                    filters.openAccessOnly
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  무료 원문 (OA)
                </button>
              </div>
            </div>

            {/* 3. 출판 연도 직접 지정 */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">출판 연도 범위</label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  placeholder="2018"
                  value={filters.yearFrom || ''}
                  onChange={(e) => onUpdateFilters({ yearFrom: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center"
                />
                <span className="text-slate-400">~</span>
                <input
                  type="number"
                  placeholder="2026"
                  value={filters.yearTo || ''}
                  onChange={(e) => onUpdateFilters({ yearTo: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-20 px-2 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center"
                />
              </div>
            </div>

            {/* 4. 연구 유형 필터 */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">연구 유형</label>
              <select
                id="filter-study-type-select"
                value={filters.studyType || 'all'}
                onChange={(e) => onUpdateFilters({ studyType: e.target.value })}
                className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
              >
                <option value="all">모든 연구 유형</option>
                <option value="양적 연구">양적 연구 (계량/통계)</option>
                <option value="질적 연구">질적 연구 (FGI/인터뷰)</option>
                <option value="체계적 문헌고찰">체계적 문헌고찰 / 메타분석</option>
                <option value="정책/실증평가">정책 / 실증평가 (DID/PSM)</option>
                <option value="혼합 연구">혼합 연구 (Mixed Methods)</option>
              </select>
            </div>

            {/* 5. 읽기 상태 & 초기화 */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 mb-1">읽기 상태</label>
              <div className="flex items-center gap-1.5">
                <select
                  value={filters.status}
                  onChange={(e) => onUpdateFilters({ status: e.target.value as any })}
                  className="flex-1 px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none"
                >
                  <option value="all">전체 상태</option>
                  <option value="to_read">읽을 논문</option>
                  <option value="reading">읽는 중</option>
                  <option value="completed">읽음 완료</option>
                  <option value="revisit">재검토 필요</option>
                </select>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={onResetFilters}
                    className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-medium transition-colors shrink-0"
                  >
                    필터 초기화
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tag Cloud & Quick Tag toggles */}
        {allTagsWithCount.length > 0 && (
          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-slate-400 text-[11px] font-medium flex items-center gap-1 mr-1">
              <Tag className="w-3 h-3 text-slate-400" />
              추천 키워드:
            </span>
            {allTagsWithCount.slice(0, 8).map(([tag, count]) => {
              const isSelected = filters.selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleTagToggle(tag)}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                    isSelected
                      ? 'bg-emerald-600 text-white border-emerald-600 font-medium'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  #{tag} <span className="opacity-70 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Results Header: Count & Multi-select all */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSelectAllFiltered}
            className="flex items-center gap-1.5 font-medium text-slate-700 hover:text-emerald-600 transition-colors"
          >
            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
              filteredPapers.length > 0 && filteredPapers.every(p => selectedPaperIds.includes(p.id))
                ? 'bg-emerald-600 border-emerald-600 text-white'
                : 'border-slate-300 bg-white'
            }`}>
              {filteredPapers.length > 0 && filteredPapers.every(p => selectedPaperIds.includes(p.id)) && (
                <Check className="w-3 h-3 stroke-[3]" />
              )}
            </div>
            <span>전체 선택</span>
          </button>

          <span>
            검색 결과 <strong className="text-slate-800">{filteredPapers.length}</strong>편
            {papers.length !== filteredPapers.length && ` (전체 ${papers.length}편 중)`}
          </span>
        </div>

        {selectedPaperIds.length > 0 && (
          <span className="text-emerald-600 font-semibold">
            {selectedPaperIds.length}편 선택됨 (하단 액션바를 이용하세요)
          </span>
        )}
      </div>

      {/* Main List / Grid Display */}
      {filteredPapers.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center max-w-md mx-auto space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-base">일치하는 논문을 찾을 수 없습니다</h3>
            <p className="text-xs text-slate-500 mt-1">
              검색어나 필터 조건을 변경하거나, PDF 업로드 또는 DOI로 논문을 새로 추가해보세요.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 pt-2">
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={onResetFilters}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                필터 초기화
              </button>
            ) : (
              <button
                type="button"
                onClick={onNewPaper}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
              >
                새 논문 작성하기
              </button>
            )}
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPapers.map((paper) => (
            <PaperCard
              key={paper.id}
              paper={paper}
              isSelected={selectedPaperIds.includes(paper.id)}
              onToggleSelect={() => handleToggleSelectPaper(paper.id)}
              onSelect={onSelectPaper}
              onToggleFavorite={onToggleFavorite}
              onDelete={onDeletePaper}
              onExportMarkdown={onExportMarkdown}
              onTagClick={(tag) => handleTagToggle(tag)}
            />
          ))}
        </div>
      ) : (
        <PaperTableView
          papers={filteredPapers}
          onSelect={onSelectPaper}
          onToggleFavorite={onToggleFavorite}
          onDelete={onDeletePaper}
          onExportMarkdown={onExportMarkdown}
          onTagClick={(tag) => handleTagToggle(tag)}
        />
      )}

      {/* 4. Multi-paper Selection Floating Action Bar (요구사항 4, 6, 7, 8) */}
      {selectedPaperIds.length > 0 && (
        <div 
          id="multi-paper-action-bar"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-slate-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 backdrop-blur-md flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-200"
        >
          <div className="flex items-center gap-2 pr-2 border-r border-slate-700">
            <span className="w-6 h-6 rounded-full bg-emerald-500 text-white font-bold text-xs flex items-center justify-center">
              {selectedPaperIds.length}
            </span>
            <span className="text-xs font-semibold text-slate-200">편 선택됨</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Action 1: Compare Papers */}
            <button
              type="button"
              id="compare-selected-papers-btn"
              disabled={selectedPaperIds.length < 2}
              onClick={() => onOpenCompareModal(selectedPapers)}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-all disabled:opacity-40"
              title={selectedPaperIds.length < 2 ? '최소 2편 이상을 선택해주세요' : '선택 논문 표 비교 & AI 종합 분석'}
            >
              <GitCompare className="w-4 h-4" />
              <span>논문 비교하기 ({selectedPaperIds.length})</span>
            </button>

            {/* Action 2: Research Gap & Topic Discovery */}
            <button
              type="button"
              id="gap-selected-papers-btn"
              onClick={() => onOpenGapModal(selectedPapers)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white text-xs font-bold shadow-md flex items-center gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Research Gap & 주제 제안</span>
            </button>

            {/* Clear Selection */}
            <button
              type="button"
              onClick={() => setSelectedPaperIds([])}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              title="선택 해제"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
