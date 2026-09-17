import React, { useState, useEffect } from 'react';
import { PaperNote, PaperComparisonSynthesis } from '../types';
import { X, Sparkles, Loader2, CheckCircle2, AlertTriangle, Layers, HelpCircle, GitCompare, Download, Check, Copy } from 'lucide-react';

interface PaperCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPapers: PaperNote[];
  onTriggerGapAnalysis?: () => void;
}

export const PaperCompareModal: React.FC<PaperCompareModalProps> = ({
  isOpen,
  onClose,
  selectedPapers,
  onTriggerGapAnalysis
}) => {
  const [synthesis, setSynthesis] = useState<PaperComparisonSynthesis | null>(null);
  const [isLoadingSynthesis, setIsLoadingSynthesis] = useState<boolean>(false);
  const [synthesisError, setSynthesisError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'table' | 'synthesis'>('table');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && selectedPapers.length >= 2 && !synthesis && !isLoadingSynthesis) {
      handleGenerateSynthesis();
    }
  }, [isOpen, selectedPapers]);

  if (!isOpen) return null;

  const handleGenerateSynthesis = async () => {
    setIsLoadingSynthesis(true);
    setSynthesisError(null);
    try {
      const res = await fetch('/api/compare-papers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ papers: selectedPapers }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '비교 분석에 실패했습니다.');
      }
      setSynthesis(data.data);
    } catch (err: any) {
      console.error('Synthesis error:', err);
      setSynthesisError(err.message || 'AI 종합 분석 중 오류가 발생했습니다.');
    } finally {
      setIsLoadingSynthesis(false);
    }
  };

  const handleCopyMarkdown = () => {
    let md = `# 논문 다자 비교 분석 (${selectedPapers.length}편)\n\n`;
    md += `## 1. 핵심 속성 비교표\n\n`;
    md += `| 항목 | ${selectedPapers.map(p => p.title.slice(0, 20) + '...').join(' | ')} |\n`;
    md += `| --- | ${selectedPapers.map(() => '---').join(' | ')} |\n`;
    
    const rows = [
      { label: '저자 및 연도', get: (p: PaperNote) => `${p.authors} (${p.year})` },
      { label: '연구 목적', get: (p: PaperNote) => p.structuredAnalysis?.researchObjective || p.objective || '-' },
      { label: '연구 대상', get: (p: PaperNote) => p.structuredAnalysis?.studyTarget || '-' },
      { label: '표본 크기', get: (p: PaperNote) => p.structuredAnalysis?.sampleSize || '-' },
      { label: '연구 설계', get: (p: PaperNote) => p.structuredAnalysis?.researchDesign || '-' },
      { label: '연구 방법', get: (p: PaperNote) => p.structuredAnalysis?.researchMethod || p.methodology || '-' },
      { label: '독립변수', get: (p: PaperNote) => p.structuredAnalysis?.variables?.independent || '-' },
      { label: '종속변수', get: (p: PaperNote) => p.structuredAnalysis?.variables?.dependent || '-' },
      { label: '주요 결과', get: (p: PaperNote) => p.structuredAnalysis?.mainFindings || p.results || '-' },
      { label: '저자 한계', get: (p: PaperNote) => p.structuredAnalysis?.authorLimitations || p.limitations || '-' },
      { label: 'AI 분석 한계', get: (p: PaperNote) => p.structuredAnalysis?.aiLimitations || '-' },
    ];

    rows.forEach(r => {
      md += `| **${r.label}** | ${selectedPapers.map(p => (r.get(p) || '-').replace(/\n/g, ' ')).join(' | ')} |\n`;
    });

    if (synthesis) {
      md += `\n## 2. AI 종합 비교 분석\n\n`;
      md += `### 공통된 연구 결과\n${synthesis.commonFindings.map(item => `- ${item}`).join('\n')}\n\n`;
      md += `### 결과의 불일치 및 이견\n${synthesis.divergentFindings.map(item => `- ${item}`).join('\n')}\n\n`;
      md += `### 연구 방법론 차이점\n${synthesis.methodologicalDifferences.map(item => `- ${item}`).join('\n')}\n\n`;
      md += `### 선행 연구의 공통 한계\n${synthesis.commonLimitations.map(item => `- ${item}`).join('\n')}\n\n`;
      md += `### 아직 충분히 연구되지 않은 영역 (Unexplored Territory)\n${synthesis.unexploredAreas.map(item => `- ${item}`).join('\n')}\n`;
    }

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        id="paper-compare-modal-container"
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-7xl h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <GitCompare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">선택 논문 심층 비교 & AI 종합 분석</h2>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {selectedPapers.length}편 비교 중
                </span>
              </div>
              <p className="text-xs text-slate-500">
                선행 연구들의 대상·방법·변수·결과를 매트릭스로 비교하고, 공통점과 연구 공백을 도출합니다.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View Tabs */}
            <div className="flex bg-slate-200/70 p-1 rounded-lg text-xs font-medium mr-2">
              <button
                type="button"
                onClick={() => setActiveTab('table')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  activeTab === 'table' ? 'bg-white text-emerald-800 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                비교 매트릭스 표
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('synthesis')}
                className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 ${
                  activeTab === 'synthesis' ? 'bg-white text-emerald-800 shadow-sm font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                AI 종합 분석
              </button>
            </div>

            {/* Markdown Copy */}
            <button
              type="button"
              id="copy-compare-markdown-btn"
              onClick={handleCopyMarkdown}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-medium transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              {copied ? '복사됨!' : '비교표 복사'}
            </button>

            {/* Gap Analysis Trigger */}
            {onTriggerGapAnalysis && (
              <button
                type="button"
                id="compare-to-gap-btn"
                onClick={() => {
                  onClose();
                  onTriggerGapAnalysis();
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold shadow-sm transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Research Gap 찾기
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          {activeTab === 'table' ? (
            <div className="space-y-6">
              {/* Comparison Table */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-100/90 text-slate-700 font-bold border-b border-slate-200">
                      <th className="p-3.5 w-36 min-w-[140px] bg-slate-100 sticky left-0 z-10 border-r border-slate-200">
                        비교 분석 항목
                      </th>
                      {selectedPapers.map((paper, idx) => (
                        <th key={paper.id} className="p-3.5 min-w-[280px] max-w-[360px] border-r border-slate-200 last:border-r-0">
                          <div className="flex items-center gap-1.5 text-emerald-800 mb-1">
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold flex items-center justify-center shrink-0">
                              {idx + 1}
                            </span>
                            <span className="truncate font-semibold">{paper.category || '연구'}</span>
                          </div>
                          <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 mb-1">
                            {paper.title}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-normal">
                            {paper.authors} ({paper.year}) · {paper.venue}
                          </p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {/* 1. 연구 목적 */}
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-3.5 font-semibold text-slate-900 bg-slate-50/80 sticky left-0 z-10 border-r border-slate-200">
                        연구 목적
                      </td>
                      {selectedPapers.map(p => (
                        <td key={p.id} className="p-3.5 border-r border-slate-100 last:border-r-0 leading-relaxed align-top">
                          {p.structuredAnalysis?.researchObjective || p.objective ? (
                            <p className="line-clamp-4">
                              {(p.structuredAnalysis?.researchObjective || p.objective || '').replace(/[#*`-]/g, '').trim()}
                            </p>
                          ) : (
                            <span className="text-slate-400 italic">미입력</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* 2. 연구 대상 */}
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-3.5 font-semibold text-slate-900 bg-slate-50/80 sticky left-0 z-10 border-r border-slate-200">
                        연구 대상
                      </td>
                      {selectedPapers.map(p => (
                        <td key={p.id} className="p-3.5 border-r border-slate-100 last:border-r-0 leading-relaxed align-top font-medium text-slate-800">
                          {p.structuredAnalysis?.studyTarget || <span className="text-slate-400 font-normal italic">미입력</span>}
                        </td>
                      ))}
                    </tr>

                    {/* 3. 표본 크기 */}
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-3.5 font-semibold text-slate-900 bg-slate-50/80 sticky left-0 z-10 border-r border-slate-200">
                        표본 크기 및 기간
                      </td>
                      {selectedPapers.map(p => (
                        <td key={p.id} className="p-3.5 border-r border-slate-100 last:border-r-0 leading-relaxed align-top text-emerald-800 font-medium">
                          {p.structuredAnalysis?.sampleSize || <span className="text-slate-400 font-normal italic">미입력</span>}
                        </td>
                      ))}
                    </tr>

                    {/* 4. 연구 설계 */}
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-3.5 font-semibold text-slate-900 bg-slate-50/80 sticky left-0 z-10 border-r border-slate-200">
                        연구 설계
                      </td>
                      {selectedPapers.map(p => (
                        <td key={p.id} className="p-3.5 border-r border-slate-100 last:border-r-0 leading-relaxed align-top">
                          <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-800 font-medium text-[11px]">
                            {p.structuredAnalysis?.researchDesign || p.studyType || '미지정'}
                          </span>
                        </td>
                      ))}
                    </tr>

                    {/* 5. 연구 방법 */}
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-3.5 font-semibold text-slate-900 bg-slate-50/80 sticky left-0 z-10 border-r border-slate-200">
                        연구 방법 및 통계
                      </td>
                      {selectedPapers.map(p => (
                        <td key={p.id} className="p-3.5 border-r border-slate-100 last:border-r-0 leading-relaxed align-top">
                          {p.structuredAnalysis?.researchMethod || p.methodology ? (
                            <p className="line-clamp-3">
                              {(p.structuredAnalysis?.researchMethod || p.methodology || '').replace(/[#*`-]/g, '').trim()}
                            </p>
                          ) : (
                            <span className="text-slate-400 italic">미입력</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* 6. 독립변수 */}
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-3.5 font-semibold text-slate-900 bg-slate-50/80 sticky left-0 z-10 border-r border-slate-200">
                        독립변수 (원인)
                      </td>
                      {selectedPapers.map(p => (
                        <td key={p.id} className="p-3.5 border-r border-slate-100 last:border-r-0 leading-relaxed align-top text-slate-800">
                          {p.structuredAnalysis?.variables?.independent || <span className="text-slate-400 italic">미입력</span>}
                        </td>
                      ))}
                    </tr>

                    {/* 7. 종속변수 */}
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-3.5 font-semibold text-slate-900 bg-slate-50/80 sticky left-0 z-10 border-r border-slate-200">
                        종속변수 (결과)
                      </td>
                      {selectedPapers.map(p => (
                        <td key={p.id} className="p-3.5 border-r border-slate-100 last:border-r-0 leading-relaxed align-top text-slate-800">
                          {p.structuredAnalysis?.variables?.dependent || <span className="text-slate-400 italic">미입력</span>}
                        </td>
                      ))}
                    </tr>

                    {/* 8. 주요 결과 */}
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-3.5 font-semibold text-slate-900 bg-slate-50/80 sticky left-0 z-10 border-r border-slate-200">
                        주요 연구 결과
                      </td>
                      {selectedPapers.map(p => (
                        <td key={p.id} className="p-3.5 border-r border-slate-100 last:border-r-0 leading-relaxed align-top">
                          {p.structuredAnalysis?.mainFindings || p.results ? (
                            <p className="line-clamp-4">
                              {(p.structuredAnalysis?.mainFindings || p.results || '').replace(/[#*`-]/g, '').trim()}
                            </p>
                          ) : (
                            <span className="text-slate-400 italic">미입력</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* 9. 저자 명시 한계점 */}
                    <tr className="hover:bg-slate-50/70">
                      <td className="p-3.5 font-semibold text-slate-900 bg-slate-50/80 sticky left-0 z-10 border-r border-slate-200">
                        저자가 밝힌 한계
                      </td>
                      {selectedPapers.map(p => (
                        <td key={p.id} className="p-3.5 border-r border-slate-100 last:border-r-0 leading-relaxed align-top text-slate-600">
                          {p.structuredAnalysis?.authorLimitations || p.limitations ? (
                            <p className="line-clamp-4">
                              {(p.structuredAnalysis?.authorLimitations || p.limitations || '').replace(/[#*`-]/g, '').trim()}
                            </p>
                          ) : (
                            <span className="text-slate-400 italic">미입력</span>
                          )}
                        </td>
                      ))}
                    </tr>

                    {/* 10. AI가 분석한 한계 */}
                    <tr className="hover:bg-purple-50/30 bg-purple-50/10">
                      <td className="p-3.5 font-semibold text-purple-900 bg-purple-50/60 sticky left-0 z-10 border-r border-purple-200">
                        <div className="flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-purple-600" />
                          <span>AI 분석 한계</span>
                        </div>
                      </td>
                      {selectedPapers.map(p => (
                        <td key={p.id} className="p-3.5 border-r border-purple-100 last:border-r-0 leading-relaxed align-top text-slate-700">
                          {p.structuredAnalysis?.aiLimitations ? (
                            <p className="line-clamp-4 text-purple-950">
                              {p.structuredAnalysis.aiLimitations}
                            </p>
                          ) : (
                            <span className="text-slate-400 italic">상세 페이지에서 AI 분석 실행 필요</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Bottom Quick Synthesis Preview */}
              {synthesis && (
                <div className="bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-white rounded-xl border border-emerald-200/80 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-emerald-600" />
                      <h3 className="font-bold text-slate-900 text-sm">AI 종합 비교 인사이트 요약</h3>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('synthesis')}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-800"
                    >
                      전체 5대 비교 영역 보기 &rarr;
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="bg-white/90 p-3 rounded-lg border border-emerald-100">
                      <h5 className="font-semibold text-emerald-800 mb-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        공통된 연구 결과
                      </h5>
                      <ul className="space-y-1 text-slate-700 list-disc list-inside">
                        {synthesis.commonFindings.slice(0, 2).map((item, i) => (
                          <li key={i} className="line-clamp-2">{item}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white/90 p-3 rounded-lg border border-purple-100">
                      <h5 className="font-semibold text-purple-800 mb-1.5 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        아직 충분히 연구되지 않은 미개척 영역
                      </h5>
                      <ul className="space-y-1 text-slate-700 list-disc list-inside">
                        {synthesis.unexploredAreas.slice(0, 2).map((item, i) => (
                          <li key={i} className="line-clamp-2">{item}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Tab: Full AI Synthesis View */
            <div className="max-w-4xl mx-auto space-y-5">
              {isLoadingSynthesis ? (
                <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
                  <h4 className="font-bold text-slate-900 text-base mb-1">
                    선택된 {selectedPapers.length}편의 논문을 AI가 정밀 종합 분석 중입니다...
                  </h4>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    공통된 발견, 상충되는 결과, 방법론적 차이, 선행 연구들의 한계 및 미개척 연구 영역을 추출하고 있습니다.
                  </p>
                </div>
              ) : synthesisError ? (
                <div className="bg-rose-50 rounded-xl border border-rose-200 p-6 text-center">
                  <AlertTriangle className="w-8 h-8 text-rose-600 mx-auto mb-2" />
                  <h4 className="font-bold text-rose-900 mb-1">AI 분석 생성 실패</h4>
                  <p className="text-xs text-rose-700 mb-4">{synthesisError}</p>
                  <button
                    type="button"
                    onClick={handleGenerateSynthesis}
                    className="px-4 py-2 bg-rose-600 text-white text-xs font-semibold rounded-lg hover:bg-rose-700 transition-colors"
                  >
                    다시 시도하기
                  </button>
                </div>
              ) : synthesis ? (
                <div className="space-y-4">
                  {/* 1. 공통된 연구 결과 */}
                  <div className="bg-white rounded-xl border border-emerald-200/80 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-emerald-800 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <h4>1. 논문들의 공통된 연구 결과 (Common Findings)</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {synthesis.commonFindings.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-emerald-50/50 p-2.5 rounded-lg border border-emerald-100/60">
                          <span className="w-4 h-4 rounded-full bg-emerald-200 text-emerald-900 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 2. 연구 결과의 불일치 및 이견 */}
                  <div className="bg-white rounded-xl border border-amber-200/80 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-amber-900 font-bold text-sm">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <h4>2. 연구 결과가 서로 다른 부분 (Divergent Findings & Conflicts)</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {synthesis.divergentFindings.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-amber-50/50 p-2.5 rounded-lg border border-amber-100/60">
                          <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 3. 연구 방법의 차이 */}
                  <div className="bg-white rounded-xl border border-teal-200/80 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-teal-950 font-bold text-sm">
                      <Layers className="w-4 h-4 text-teal-600" />
                      <h4>3. 연구 방법 및 통계적 설계의 핵심 차이 (Methodological Differences)</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {synthesis.methodologicalDifferences.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-teal-50/50 p-2.5 rounded-lg border border-teal-100/60">
                          <span className="w-4 h-4 rounded-full bg-teal-200 text-teal-950 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 4. 기존 연구의 공통 한계 */}
                  <div className="bg-white rounded-xl border border-rose-200/80 p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3 text-rose-900 font-bold text-sm">
                      <HelpCircle className="w-4 h-4 text-rose-600" />
                      <h4>4. 기존 선행 연구들의 공통 한계 (Common Limitations)</h4>
                    </div>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {synthesis.commonLimitations.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-rose-50/50 p-2.5 rounded-lg border border-rose-100/60">
                          <span className="w-4 h-4 rounded-full bg-rose-200 text-rose-900 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* 5. 미개척 연구 영역 */}
                  <div className="bg-gradient-to-br from-purple-50 to-emerald-50/40 rounded-xl border-2 border-purple-300 p-5 shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2 text-purple-950 font-bold text-sm">
                        <Sparkles className="w-5 h-5 text-purple-600" />
                        <h4>5. 아직 충분히 연구되지 않은 영역 (Unexplored Research Territory)</h4>
                      </div>
                      <span className="text-[11px] font-semibold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                        차기 연구주제 발굴 단초
                      </span>
                    </div>
                    <ul className="space-y-2 text-xs text-purple-950 mb-4">
                      {synthesis.unexploredAreas.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-white/90 p-3 rounded-lg border border-purple-200 shadow-xs">
                          <span className="w-4 h-4 rounded-full bg-purple-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="leading-relaxed font-medium">{item}</span>
                        </li>
                      ))}
                    </ul>

                    {onTriggerGapAnalysis && (
                      <div className="pt-2 flex justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            onClose();
                            onTriggerGapAnalysis();
                          }}
                          className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors shadow-sm flex items-center gap-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          이 미개척 영역을 바탕으로 Research Gap & 연구주제 도출하기 &rarr;
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
