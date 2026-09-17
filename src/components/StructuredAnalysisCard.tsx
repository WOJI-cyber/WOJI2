import React, { useState } from 'react';
import { PaperNote, StructuredAnalysis } from '../types';
import {
  Sparkles,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Target,
  Users,
  Database,
  Layers,
  FlaskConical,
  GitCommit,
  TrendingUp,
  FileQuestion,
  HelpCircle,
  Lightbulb,
  Compass,
  Tag,
  Quote,
  ShieldCheck,
  Edit2,
  Check,
  RotateCcw
} from 'lucide-react';

interface StructuredAnalysisCardProps {
  paper: PaperNote;
  onUpdateAnalysis: (analysis: StructuredAnalysis) => void;
}

export const StructuredAnalysisCard: React.FC<StructuredAnalysisCardProps> = ({
  paper,
  onUpdateAnalysis,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedAnalysis, setEditedAnalysis] = useState<StructuredAnalysis>(
    paper.structuredAnalysis || {}
  );

  const analysis = paper.structuredAnalysis;

  const handleRunAnalysis = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze-abstract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: paper.title,
          abstract: paper.abstract || `${paper.title}. ${paper.authors}. ${paper.venue}. ${paper.objective} ${paper.methodology} ${paper.results}`,
          venue: paper.venue,
          year: paper.year,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || '논문 구조화 분석에 실패했습니다.');
      }

      if (data.data?.structuredAnalysis) {
        onUpdateAnalysis(data.data.structuredAnalysis);
        setEditedAnalysis(data.data.structuredAnalysis);
      }
    } catch (err: any) {
      console.error('Structured analysis error:', err);
      setError(err.message || 'AI 구조화 분석 도중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEdit = () => {
    onUpdateAnalysis(editedAnalysis);
    setIsEditing(false);
  };

  return (
    <div 
      id="structured-analysis-card"
      className="bg-white rounded-2xl border border-emerald-200/90 shadow-sm overflow-hidden transition-all"
    >
      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-b border-emerald-100 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <span>AI 논문 심층 구조화 분석 (14개 핵심 항목)</span>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                AI 분석 엔진
              </span>
            </h3>
            <p className="text-[11px] text-slate-500">
              연구 목적·대상·변수·결과 및 저자 명시 한계와 AI 분석 한계를 엄격히 구분하여 구조화합니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {analysis && !isEditing && (
            <button
              type="button"
              onClick={() => {
                setEditedAnalysis(analysis);
                setIsEditing(true);
              }}
              className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-1 transition-colors"
            >
              <Edit2 className="w-3.5 h-3.5" />
              직접 수정
            </button>
          )}

          {isEditing && (
            <button
              type="button"
              onClick={handleSaveEdit}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1 shadow-xs transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              수정 완료
            </button>
          )}

          <button
            type="button"
            id="run-structured-analysis-btn"
            onClick={handleRunAnalysis}
            disabled={isLoading}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-lg flex items-center gap-1.5 shadow-sm transition-all"
          >
            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-300" />}
            <span>{analysis ? 'AI 구조화 다시 분석' : 'AI 구조화 분석 실행'}</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="m-6 mb-0 p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Body Content */}
      <div className="p-6 space-y-5">
        {!analysis && !isLoading ? (
          <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200 space-y-2">
            <Sparkles className="w-8 h-8 text-emerald-500 mx-auto" />
            <h4 className="font-semibold text-slate-800 text-sm">아직 구조화 분석이 실행되지 않았습니다</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              상단의 [AI 구조화 분석 실행] 버튼을 누르면 논문의 목적, 표본, 방법론, 독립/종속변수, 저자 한계와 AI 분석 한계를 자동으로 추출합니다.
            </p>
          </div>
        ) : isLoading ? (
          <div className="text-center py-12 space-y-3">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <h4 className="font-bold text-slate-900 text-sm">논문 핵심 14대 속성을 정밀 분석 중입니다...</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              저자가 본문에서 명시한 한계와 AI가 방법론적으로 추론한 공백을 분리 추출하고 있습니다.
            </p>
          </div>
        ) : (
          <>
            {/* 1. One-Line Summary & Keywords */}
            <div className="bg-gradient-to-r from-emerald-50/80 to-teal-50/50 p-4 rounded-xl border border-emerald-100 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                <Quote className="w-4 h-4 text-emerald-600" />
                <span>논문 핵심 한 줄 요약 (One-Line Summary)</span>
              </div>
              {isEditing ? (
                <textarea
                  value={editedAnalysis.oneLineSummary || ''}
                  onChange={(e) => setEditedAnalysis({ ...editedAnalysis, oneLineSummary: e.target.value })}
                  rows={2}
                  className="w-full p-2.5 text-xs bg-white border border-emerald-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              ) : (
                <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                  &ldquo;{analysis?.oneLineSummary || '한 줄 요약 정보가 없습니다.'}&rdquo;
                </p>
              )}

              {/* Keywords */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] font-semibold text-emerald-800 mr-1 flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  핵심 키워드:
                </span>
                {(analysis?.keyKeywords || []).map((kw, i) => (
                  <span
                    key={i}
                    className="text-[11px] font-medium bg-white text-emerald-800 px-2 py-0.5 rounded-md border border-emerald-200"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            {/* 2. Research Target, Design, Sample Size Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* 연구 목적 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Target className="w-3.5 h-3.5 text-emerald-600" />
                  연구 목적
                </span>
                {isEditing ? (
                  <textarea
                    value={editedAnalysis.researchObjective || ''}
                    onChange={(e) => setEditedAnalysis({ ...editedAnalysis, researchObjective: e.target.value })}
                    rows={2}
                    className="w-full p-1.5 text-xs bg-white border rounded"
                  />
                ) : (
                  <p className="text-slate-900 font-medium leading-relaxed line-clamp-3">
                    {analysis?.researchObjective || '-'}
                  </p>
                )}
              </div>

              {/* 연구 대상 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  연구 대상
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedAnalysis.studyTarget || ''}
                    onChange={(e) => setEditedAnalysis({ ...editedAnalysis, studyTarget: e.target.value })}
                    className="w-full p-1.5 text-xs bg-white border rounded"
                  />
                ) : (
                  <p className="text-slate-900 font-medium leading-relaxed line-clamp-3">
                    {analysis?.studyTarget || '-'}
                  </p>
                )}
              </div>

              {/* 표본 크기 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <Database className="w-3.5 h-3.5 text-emerald-600" />
                  표본 크기 및 기간
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedAnalysis.sampleSize || ''}
                    onChange={(e) => setEditedAnalysis({ ...editedAnalysis, sampleSize: e.target.value })}
                    className="w-full p-1.5 text-xs bg-white border rounded"
                  />
                ) : (
                  <p className="text-slate-900 font-medium leading-relaxed line-clamp-3">
                    {analysis?.sampleSize || '-'}
                  </p>
                )}
              </div>

              {/* 연구 설계 및 방법론 */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1">
                <span className="text-[11px] font-bold text-slate-500 flex items-center gap-1">
                  <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
                  연구 설계 및 방법론
                </span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedAnalysis.researchDesign || ''}
                    onChange={(e) => setEditedAnalysis({ ...editedAnalysis, researchDesign: e.target.value })}
                    className="w-full p-1.5 text-xs bg-white border rounded"
                  />
                ) : (
                  <p className="text-slate-900 font-medium leading-relaxed line-clamp-3">
                    {analysis?.researchDesign || '-'} · {analysis?.researchMethod || ''}
                  </p>
                )}
              </div>
            </div>

            {/* 3. Variables & Findings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* 독립변수 & 종속변수 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <GitCommit className="w-4 h-4 text-emerald-600" />
                  변수 구성 (Variables)
                </h4>
                <div className="space-y-2">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">독립변수 (원인 / 처치)</span>
                    <p className="text-slate-900 font-medium">
                      {analysis?.variables?.independent || '-'}
                    </p>
                  </div>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
                    <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">종속변수 (결과)</span>
                    <p className="text-slate-900 font-medium">
                      {analysis?.variables?.dependent || '-'}
                    </p>
                  </div>
                  {analysis?.variables?.mediatorOrModerator && (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/70">
                      <span className="text-[11px] font-semibold text-slate-500 block mb-0.5">조절 및 매개변수</span>
                      <p className="text-slate-800">
                        {analysis.variables.mediatorOrModerator}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 주요 연구 결과 */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5 flex flex-col">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  주요 연구 결과 (Main Findings)
                </h4>
                <div className="flex-1 bg-white p-3 rounded-lg border border-slate-200/70 leading-relaxed text-slate-800 overflow-y-auto max-h-48">
                  {analysis?.mainFindings || '-'}
                </div>
              </div>
            </div>

            {/* 4. CRITICAL MANDATE: Visual Separation of Limitations */}
            {/* 저자가 밝힌 한계점 VS AI가 분석한 한계점 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card A: 저자가 직접 밝힌 한계점 */}
              <div className="bg-amber-50/40 rounded-xl border-2 border-amber-300/80 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-700" />
                    저자가 밝힌 한계점 (Author-Stated)
                  </span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                    논문 본문 명시
                  </span>
                </div>
                <p className="text-[11px] text-amber-800/80 leading-snug">
                  * 본 논문 저자가 논문 말미의 '연구의 한계점' 절에서 스스로 인정한 공식 제약사항입니다.
                </p>
                <div className="bg-white/95 p-3 rounded-lg border border-amber-200 text-xs text-slate-800 leading-relaxed min-h-[90px]">
                  {analysis?.authorLimitations || '저자가 별도로 명시한 한계점이 기록되지 않았습니다.'}
                </div>
              </div>

              {/* Card B: AI가 분석한 한계점 */}
              <div className="bg-purple-50/40 rounded-xl border-2 border-purple-300/80 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    AI가 분석한 한계점 (AI-Inferred)
                  </span>
                  <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-2 py-0.5 rounded-full border border-purple-200">
                    AI 추론 · 제3자 분석
                  </span>
                </div>
                <p className="text-[11px] text-purple-800/80 leading-snug">
                  * 저자가 명시하지 않은 방법론적 제약, 표본 편향, 외적 타당도 한계를 AI가 비판적으로 도출한 결과입니다.
                </p>
                <div className="bg-white/95 p-3 rounded-lg border border-purple-200 text-xs text-purple-950 leading-relaxed min-h-[90px]">
                  {analysis?.aiLimitations || 'AI 분석 한계점 정보가 없습니다.'}
                </div>
              </div>
            </div>

            {/* 5. Implications & Future Research Suggestions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  연구의 학술적·정책적 시사점 (Implications)
                </h4>
                <p className="bg-white p-3 rounded-lg border border-slate-200/70 leading-relaxed text-slate-800">
                  {analysis?.implications || '-'}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h4 className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  후속 연구를 위한 제안 (Future Research Suggestions)
                </h4>
                <p className="bg-white p-3 rounded-lg border border-slate-200/70 leading-relaxed text-slate-800">
                  {analysis?.futureResearchSuggestions || '-'}
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
