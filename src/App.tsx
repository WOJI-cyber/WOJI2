import React, { useState, useEffect, useMemo } from 'react';
import { PaperNote, FilterState, ResearchProject, ResearchTopicProposal, ResearchGapItem } from './types';
import {
  loadPapers,
  savePapers,
  loadProjects,
  saveProjects,
  exportBackupJson,
  importBackupJson,
  resetToSamples,
  saveTopicToProject,
  saveGapToProject
} from './utils/storage';
import { downloadMarkdown } from './utils/export';
import { Navbar } from './components/Navbar';
import { Dashboard } from './components/Dashboard';
import { PaperEditor } from './components/PaperEditor';
import { AiExtractModal } from './components/AiExtractModal';
import { PrintModal } from './components/PrintModal';
import { PaperCompareModal } from './components/PaperCompareModal';
import { ResearchGapModal } from './components/ResearchGapModal';
import { DoiAddModal } from './components/DoiAddModal';

export default function App() {
  const [papers, setPapers] = useState<PaperNote[]>(() => loadPapers());
  const [projects, setProjects] = useState<ResearchProject[]>(() => loadProjects());
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(undefined);
  const [selectedPaperId, setSelectedPaperId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [isAiExtractOpen, setIsAiExtractOpen] = useState(false);
  const [isDoiModalOpen, setIsDoiModalOpen] = useState(false);
  const [comparePapersList, setComparePapersList] = useState<PaperNote[] | null>(null);
  const [gapPapersList, setGapPapersList] = useState<PaperNote[] | null>(null);
  const [printModalPaper, setPrintModalPaper] = useState<PaperNote | null>(null);

  // Filters State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    status: 'all',
    selectedCategory: 'all',
    selectedTags: [],
    sortBy: 'updatedAt',
    sortOrder: 'desc',
    onlyFavorites: false,
    origin: 'all',
    recent5Years: false,
    openAccessOnly: false,
    studyType: 'all',
  });

  // Sync to localStorage
  useEffect(() => {
    savePapers(papers);
  }, [papers]);

  useEffect(() => {
    saveProjects(projects);
  }, [projects]);

  const selectedPaper = useMemo(() => {
    if (!selectedPaperId) return null;
    return papers.find(p => p.id === selectedPaperId) || null;
  }, [papers, selectedPaperId]);

  // Existing tags for auto-complete
  const existingTags = useMemo(() => {
    const set = new Set<string>();
    papers.forEach(p => p.tags.forEach(t => {
      const clean = t.trim();
      if (clean) set.add(clean);
    }));
    return Array.from(set).sort();
  }, [papers]);

  // Create new blank paper note with standard 5-section template
  const handleNewPaper = () => {
    const newId = `paper-${Date.now()}`;
    const newNote: PaperNote = {
      id: newId,
      title: '',
      authors: '',
      venue: '',
      year: new Date().getFullYear(),
      doi: '',
      pdfUrl: '',
      category: '보건의료정책',
      origin: 'domestic',
      isOpenAccess: true,
      studyType: '양적 연구',
      tags: [],
      projectId: currentProjectId,
      status: 'reading',
      rating: 0,
      isFavorite: false,
      objective: '',
      methodology: '',
      results: '',
      limitations: '',
      myThoughts: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPapers(prev => [newNote, ...prev]);
    setSelectedPaperId(newId);
  };

  // Save single paper
  const handleSavePaper = (updatedPaper: PaperNote) => {
    setPapers(prev => prev.map(p => (p.id === updatedPaper.id ? updatedPaper : p)));
  };

  // Delete paper
  const handleDeletePaper = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setPapers(prev => prev.filter(p => p.id !== id));
    if (selectedPaperId === id) {
      setSelectedPaperId(null);
    }
  };

  // Toggle favorite
  const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setPapers(prev =>
      prev.map(p => (p.id === id ? { ...p, isFavorite: !p.isFavorite } : p))
    );
  };

  // Export Markdown
  const handleExportMarkdown = (paper: PaperNote, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    downloadMarkdown(paper);
  };

  // Handle AI extracted note
  const handleAiExtractSuccess = (extracted: Partial<PaperNote>) => {
    const newId = `ai-paper-${Date.now()}`;
    const newNote: PaperNote = {
      id: newId,
      title: extracted.title || 'AI 추출 논문',
      authors: extracted.authors || '',
      venue: extracted.venue || '',
      year: extracted.year || new Date().getFullYear(),
      doi: extracted.doi || '',
      pdfUrl: extracted.pdfUrl || '',
      category: extracted.category || '보건의료정책',
      origin: extracted.origin || 'domestic',
      isOpenAccess: true,
      studyType: extracted.studyType || '양적 연구',
      tags: extracted.tags || ['AI-추출'],
      projectId: currentProjectId,
      status: 'reading',
      rating: 0,
      isFavorite: false,
      objective: extracted.objective || '',
      methodology: extracted.methodology || '',
      results: extracted.results || '',
      limitations: extracted.limitations || '',
      myThoughts: extracted.myThoughts || '',
      structuredAnalysis: extracted.structuredAnalysis,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setPapers(prev => [newNote, ...prev]);
    setSelectedPaperId(newId);
  };

  // Handle DOI note created
  const handleDoiPaperCreated = (newPaper: PaperNote) => {
    const enriched = { ...newPaper, projectId: currentProjectId };
    setPapers(prev => [enriched, ...prev]);
    setSelectedPaperId(enriched.id);
  };

  // Handle Project Creation
  const handleCreateProject = (newProject: Partial<ResearchProject>) => {
    const created: ResearchProject = {
      id: newProject.id || `proj-${Date.now()}`,
      name: newProject.name || '새 프로젝트',
      description: newProject.description || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      keyPaperIds: newProject.keyPaperIds || [],
      researchNotes: newProject.researchNotes || '# 연구 메모\n- ',
      researchGaps: [],
      topicProposals: [],
    };
    setProjects(prev => [...prev, created]);
    setCurrentProjectId(created.id);
  };

  // Handle Topic save to project
  const handleSaveTopicToProject = (projId: string, topic: ResearchTopicProposal) => {
    saveTopicToProject(projId, topic);
    setProjects(loadProjects());
  };

  // Backup & restore
  const handleExportBackup = () => {
    exportBackupJson(papers);
  };

  const handleImportBackup = (jsonStr: string) => {
    try {
      const restored = importBackupJson(jsonStr);
      setPapers(restored.papers);
      if (restored.projects) {
        setProjects(restored.projects);
      }
      setSelectedPaperId(null);
      alert(`성공적으로 ${restored.papers.length}편의 논문 노트를 복원했습니다.`);
    } catch (err: any) {
      alert(`백업 파일 복원 실패: ${err.message}`);
    }
  };

  const handleResetSamples = () => {
    const reset = resetToSamples();
    setPapers(reset.papers);
    setProjects(reset.projects);
    setSelectedPaperId(null);
  };

  const handleUpdateFilters = (newFilters: Partial<FilterState>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const handleResetFilters = () => {
    setFilters({
      searchQuery: '',
      status: 'all',
      selectedCategory: 'all',
      selectedTags: [],
      sortBy: 'updatedAt',
      sortOrder: 'desc',
      onlyFavorites: false,
      origin: 'all',
      recent5Years: false,
      openAccessOnly: false,
      studyType: 'all',
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navigation */}
      <Navbar
        papers={papers}
        onNewPaper={handleNewPaper}
        onOpenAiExtract={() => setIsAiExtractOpen(true)}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetSamples={handleResetSamples}
        isEditing={!!selectedPaper}
        onBackToDashboard={() => setSelectedPaperId(null)}
      />

      {/* Main View Area */}
      <main className="flex-1 pb-20">
        {selectedPaper ? (
          <PaperEditor
            paper={selectedPaper}
            onSave={handleSavePaper}
            onBack={() => setSelectedPaperId(null)}
            onDelete={handleDeletePaper}
            onExportMarkdown={handleExportMarkdown}
            onPrintPdf={(p) => setPrintModalPaper(p)}
            existingTags={existingTags}
          />
        ) : (
          <Dashboard
            papers={papers}
            projects={projects}
            currentProjectId={currentProjectId}
            onSelectProject={(id) => setCurrentProjectId(id)}
            onCreateProject={handleCreateProject}
            filters={filters}
            onUpdateFilters={handleUpdateFilters}
            onResetFilters={handleResetFilters}
            viewMode={viewMode}
            onToggleViewMode={setViewMode}
            onSelectPaper={(paper) => setSelectedPaperId(paper.id)}
            onNewPaper={handleNewPaper}
            onOpenAiExtract={() => setIsAiExtractOpen(true)}
            onOpenDoiModal={() => setIsDoiModalOpen(true)}
            onOpenCompareModal={(pList) => setComparePapersList(pList)}
            onOpenGapModal={(pList) => setGapPapersList(pList.length > 0 ? pList : papers)}
            onToggleFavorite={handleToggleFavorite}
            onDeletePaper={handleDeletePaper}
            onExportMarkdown={handleExportMarkdown}
            onSaveTopicToProject={handleSaveTopicToProject}
          />
        )}
      </main>

      {/* AI Extraction Modal */}
      <AiExtractModal
        isOpen={isAiExtractOpen}
        onClose={() => setIsAiExtractOpen(false)}
        onSuccess={handleAiExtractSuccess}
      />

      {/* DOI / Academic URL Modal */}
      <DoiAddModal
        isOpen={isDoiModalOpen}
        onClose={() => setIsDoiModalOpen(false)}
        onPaperCreated={handleDoiPaperCreated}
      />

      {/* Paper Comparison Modal (요구사항 6) */}
      <PaperCompareModal
        isOpen={!!comparePapersList}
        onClose={() => setComparePapersList(null)}
        selectedPapers={comparePapersList || []}
        onTriggerGapAnalysis={() => {
          if (comparePapersList) {
            setGapPapersList(comparePapersList);
            setComparePapersList(null);
          }
        }}
      />

      {/* Research Gap & Topic Proposal Modal (요구사항 7 & 8) */}
      <ResearchGapModal
        isOpen={!!gapPapersList}
        onClose={() => setGapPapersList(null)}
        papers={gapPapersList || papers}
        projects={projects}
        currentProjectId={currentProjectId}
        onSaveTopicToProject={handleSaveTopicToProject}
      />

      {/* Printable / PDF Export Sheet Modal */}
      <PrintModal
        isOpen={!!printModalPaper}
        paper={printModalPaper}
        onClose={() => setPrintModalPaper(null)}
      />
    </div>
  );
}
