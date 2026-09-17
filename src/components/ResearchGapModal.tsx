import React, { useState, useEffect } from 'react';
import { PaperNote, ResearchGapItem, ResearchTopicProposal, ResearchProject } from '../types';
import { X, Sparkles, Loader2, Compass, Lightbulb, BookmarkPlus, Check, Copy, AlertCircle, ArrowRight, ShieldCheck, ChevronRight } from 'lucide-react';

interface ResearchGapModalProps {
  isOpen: boolean;
  onClose: () => void;
  papers: PaperNote[];
  projects: ResearchProject[];
  currentProjectId?: string;
  onSaveTopicToProject?: (projectId: string, topic: ResearchTopicProposal) => void;
  onSaveGapToProject?: (projectId: string, gap: ResearchGapItem) => void;
}

export const ResearchGapModal: React.FC<ResearchGapModalProps> = ({
  isOpen,
  onClose,
  papers,
  projects,
  currentProjectId,
  onSaveTopicToProject,
  onSaveGapToProject,
}) => {
  const [activeStep, setActiveStep] = useState<'gaps' | 'topics'>('gaps');
  const [gaps, setGaps] = useState<ResearchGapItem[]>([]);
  const [topics, setTopics] = useState<ResearchTopicProposal[]>([]);
  const [isLoadingGaps, setIsLoadingGaps] = useState(false);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [savedTopicIds, setSavedTopicIds] = useState<string[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(currentProjectId || (projects[0]?.id || ''));

  // Preload or generate gaps when opened
  useEffect(() => {
    if (isOpen && gaps.length === 0 && !isLoadingGaps && papers.length > 0) {
      handleAnalyzeGaps();
    }
  }, [isOpen, papers]);

  useEffect(() => {
    if (currentProjectId) {
      setSelectedProjectId(currentProjectId);
    } else if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [currentProjectId, projects]);

  if (!isOpen) return null;

  const handleAnalyzeGaps = async () => {
    setIsLoadingGaps(true);
    setError(null);
    try {
      const activeProject = projects.find(p => p.id === selectedProjectId);
      const res = await fetch('/api/analyze-research-gap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          papers: papers,
          projectContext: activeProject ? `${activeProject.name}: ${activeProject.description}` : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Research Gap 분석에 실패했습니다.');
      }
      setGaps(data.data || []);
    } catch (err: any) {
      console.error('Gap analysis error:', err);
      setError(err.message || '연구 공백 분석 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingGaps(false);
    }
  };

  const handleGenerateTopics = async () => {
    setIsLoadingTopics(true);
    setError(null);
    setActiveStep('topics');
    try {
      const activeProject = projects.find(p => p.id === selectedProjectId);
      const res = await fetch('/api/generate-research-topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gaps: gaps,
          papers: papers,
          projectContext: activeProject ? `${activeProject.name}: ${activeProject.description}` : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '연구주제 제안 생성에 실패했습니다.');
      }
      setTopics(data.data || []);
    } catch (err: any) {
      console.error('Topic generation error:', err);
      setError(err.message || '연구주제 제안 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingTopics(false);
    }
  };

  const handleSaveTopic = (topic: ResearchTopicProposal) => {
    if (onSaveTopicToProject && selectedProjectId) {
      onSaveTopicToProject(selectedProjectId, topic);
      setSavedTopicIds(prev => [...prev, topic.id]);
    }
  };

  const handleCopyTopic = (topic: ResearchTopicProposal) => {
    const text = `[추천 연구주제] ${topic.title}
- 연구 질문: ${topic.researchQuestion}
- 연구 필요성: ${topic.necessity}
- 연구 대상: ${topic.studyTarget}
- 독립변수: ${topic.independentVariable}
- 종속변수: ${topic.dependentVariable}
- 조절/매개변수: ${topic.mediatorOrModerator || '해당 없음'}
- 추천 방법: ${topic.recommendedMethod}
- 선행 연구와의 차별점: ${topic.noveltyAndDifference}`;
    navigator.clipboard.writeText(text);
    setCopiedId(topic.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categoryBadgeColors: Record<string, string> = {
    subject: 'bg-teal-50 text-teal-700 border-teal-200',
    region: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    variable: 'bg-purple-50 text-purple-700 border-purple-200',
    method: 'bg-amber-50 text-amber-700 border-amber-200',
    period: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    contradiction: 'bg-rose-50 text-rose-700 border-rose-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="research-gap-modal-container"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-6xl h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-md">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">
                  AI 연구 공백(Research Gap) 발굴 & 차기 연구주제 제안
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  {papers.length}편의 선행 연구 기반
                </span>
              </div>
              <p className="text-xs text-slate-500">
                선행 연구들의 한계와 미개척 영역을 6대 관점으로 규명하고, 학술지 게재 가능한 신규 연구주제를 도출합니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Step Selector Buttons */}
            <div className="flex bg-slate-200/70 p-1 rounded-lg text-xs font-medium">
              <button
                type="button"
                id="gap-tab-btn"
                onClick={() => setActiveStep('gaps')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeStep === 'gaps' ? 'bg-white text-emerald-800 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                1단계: Research Gap ({gaps.length})
              </button>
              <button
                type="button"
                id="topics-tab-btn"
                onClick={() => {
                  if (topics.length === 0 && !isLoadingTopics) {
                    handleGenerateTopics();
                  } else {
                    setActiveStep('topics');
                  }
                }}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                  activeStep === 'topics' ? 'bg-white text-emerald-800 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                2단계: 연구주제 제안 ({topics.length})
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Project Target Bar */}
        {projects.length > 0 && (
          <div className="px-6 py-2 bg-emerald-50/50 border-b border-emerald-100/70 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">연계 연구 프로젝트:</span>
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-white border border-emerald-200 rounded px-2.5 py-1 text-xs font-semibold text-emerald-950 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <span className="text-[11px] text-slate-500">
              * 마음에 드는 주제는 프로젝트 보관함에 원클릭으로 저장할 수 있습니다.
            </span>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/40">
          {error && (
            <div className="mb-4 bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center justify-between text-xs text-rose-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
              <button
                type="button"
                onClick={activeStep === 'gaps' ? handleAnalyzeGaps : handleGenerateTopics}
                className="font-semibold underline hover:text-rose-950"
              >
                재시도
              </button>
            </div>
          )}

          {activeStep === 'gaps' ? (
            /* STEP 1: Research Gaps Analysis */
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    선행 연구 기반 6대 관점 연구 공백(Research Gap)
                  </h3>
                  <p className="text-xs text-slate-500">
                    AI가 선행 논문들의 연구 대상, 방법론, 분석 변수 및 한계점을 교차 검증하여 규명한 공백입니다.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleAnalyzeGaps}
                    disabled={isLoadingGaps}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                  >
                    {isLoadingGaps ? '분석 중...' : '다시 분석'}
                  </button>
                  <button
                    type="button"
                    id="trigger-topics-btn"
                    onClick={handleGenerateTopics}
                    disabled={isLoadingGaps || gaps.length === 0}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    이 공백으로 연구주제 3~5개 제안받기 &rarr;
                  </button>
                </div>
              </div>

              {isLoadingGaps ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
                  <h4 className="font-bold text-slate-900 text-sm mb-1">
                    선행 논문들의 방법론, 변수 및 한계를 종합하여 Research Gap을 탐색 중입니다...
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    연구 대상의 공백, 지역적 소외, 변수 통제의 한계, 분석 방법론적 제약, 연구 기간 및 선행 연구 간 불일치를 교차 분석합니다.
                  </p>
                </div>
              ) : gaps.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <Compass className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 mb-3">도출된 Research Gap이 없습니다.</p>
                  <button
                    type="button"
                    onClick={handleAnalyzeGaps}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg"
                  >
                    공백 분석 시작하기
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {gaps.map((gap, idx) => {
                    const colorClass = categoryBadgeColors[gap.category] || 'bg-slate-100 text-slate-800 border-slate-200';
                    return (
                      <div
                        key={gap.id || idx}
                        className="bg-white rounded-xl border border-slate-200/90 hover:border-emerald-300 p-5 shadow-sm transition-all duration-200 flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md border ${colorClass}`}>
                              {gap.categoryLabel || gap.category}
                            </span>
                            {gap.severity === 'high' && (
                              <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                                높은 연구 필요성
                              </span>
                            )}
                          </div>

                          <h4 className="font-bold text-slate-900 text-sm mb-2 leading-snug">
                            {gap.title}
                          </h4>

                          <p className="text-xs text-slate-600 leading-relaxed mb-4">
                            {gap.description}
                          </p>
                        </div>

                        {/* Grounded Citation Box (신뢰성 강화) */}
                        <div className="bg-slate-50/80 rounded-lg p-2.5 border border-slate-200/60 mt-auto">
                          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-700 mb-1">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            <span>판단 근거 선행 논문</span>
                          </div>
                          <ul className="text-[11px] text-slate-600 space-y-1">
                            {gap.groundedPaperTitles.map((title, i) => (
                              <li key={i} className="line-clamp-1 italic text-slate-700">
                                &bull; {title}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            /* STEP 2: Research Topic Proposals */
            <div className="space-y-6 max-w-5xl mx-auto">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">
                    선행 연구 공백 기반 추천 연구주제 3~5선
                  </h3>
                  <p className="text-xs text-slate-500">
                    도출된 Research Gap을 메우고, 즉시 학위논문 연구계획서나 연구비 제안서로 발전시킬 수 있는 구체적 연구 과제입니다.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveStep('gaps')}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100"
                  >
                    &larr; Research Gap 보기
                  </button>
                  <button
                    type="button"
                    onClick={handleGenerateTopics}
                    disabled={isLoadingTopics}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    {isLoadingTopics ? '생성 중...' : '새로운 주제 제안받기'}
                  </button>
                </div>
              </div>

              {isLoadingTopics ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
                  <h4 className="font-bold text-slate-900 text-sm mb-1">
                    Research Gap을 해결할 독창적인 연구주제 3~5개를 기획 중입니다...
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    연구 제목, 연구 질문, 독립·종속·조절변수, 추천 분석 방법론 및 기존 연구와의 결정적 차별점을 구성하고 있습니다.
                  </p>
                </div>
              ) : topics.length === 0 ? (
                <div className="bg-white rounded-xl border border-slate-200 p-8 text-center">
                  <Lightbulb className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-600 mb-3">제안된 연구주제가 없습니다.</p>
                  <button
                    type="button"
                    onClick={handleGenerateTopics}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg"
                  >
                    연구주제 제안 생성하기
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {topics.map((topic, idx) => {
                    const isSaved = savedTopicIds.includes(topic.id);
                    const isCopied = copiedId === topic.id;

                    return (
                      <div
                        key={topic.id || idx}
                        className="bg-white rounded-xl border border-slate-200 hover:border-emerald-300 p-6 shadow-sm transition-all duration-200"
                      >
                        {/* Topic Header */}
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-start gap-3">
                            <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <div>
                              <h4 className="text-base font-bold text-slate-900 leading-snug">
                                {topic.title}
                              </h4>
                              <p className="text-xs font-semibold text-emerald-700 mt-1">
                                Q. {topic.researchQuestion}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleCopyTopic(topic)}
                              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium flex items-center gap-1 transition-colors"
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              {isCopied ? '복사됨' : '복사'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveTopic(topic)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                                isSaved
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm'
                              }`}
                            >
                              {isSaved ? <Check className="w-3.5 h-3.5" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                              {isSaved ? '프로젝트 저장됨' : '프로젝트에 저장'}
                            </button>
                          </div>
                        </div>

                        {/* Necessity */}
                        <p className="text-xs text-slate-700 leading-relaxed mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <strong className="text-slate-900 font-semibold">연구 필요성: </strong>
                          {topic.necessity}
                        </p>

                        {/* 4-Grid Variable / Method Spec */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs mb-4">
                          <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/60">
                            <span className="text-[11px] text-slate-500 block mb-0.5 font-medium">연구 대상</span>
                            <span className="font-semibold text-slate-900">{topic.studyTarget}</span>
                          </div>
                          <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/60">
                            <span className="text-[11px] text-slate-500 block mb-0.5 font-medium">독립변수</span>
                            <span className="font-semibold text-emerald-950">{topic.independentVariable}</span>
                          </div>
                          <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/60">
                            <span className="text-[11px] text-slate-500 block mb-0.5 font-medium">종속변수</span>
                            <span className="font-semibold text-emerald-950">{topic.dependentVariable}</span>
                          </div>
                          <div className="bg-slate-50/70 p-2.5 rounded-lg border border-slate-200/60">
                            <span className="text-[11px] text-slate-500 block mb-0.5 font-medium">추천 연구방법</span>
                            <span className="font-semibold text-slate-900">{topic.recommendedMethod}</span>
                          </div>
                        </div>

                        {/* Modulators & Novelty */}
                        <div className="space-y-2 text-xs">
                          {topic.mediatorOrModerator && (
                            <div className="flex items-start gap-2">
                              <span className="text-[11px] font-semibold text-slate-500 w-28 shrink-0">
                                조절/매개 변수:
                              </span>
                              <span className="text-slate-700 font-medium">
                                {topic.mediatorOrModerator}
                              </span>
                            </div>
                          )}
                          <div className="flex items-start gap-2 bg-purple-50/50 p-2.5 rounded-lg border border-purple-100">
                            <span className="text-[11px] font-bold text-purple-900 w-28 shrink-0 flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-purple-600" />
                              선행 연구 차별점:
                            </span>
                            <span className="text-purple-950 font-normal leading-relaxed">
                              {topic.noveltyAndDifference}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
