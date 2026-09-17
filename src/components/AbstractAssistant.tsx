import React, { useState, useRef } from 'react';
import { PaperNote } from '../types';
import { ACADEMIC_PORTALS } from '../utils/academicSearch';
import {
  Sparkles,
  Upload,
  FileText,
  Tag,
  Check,
  Plus,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  RefreshCw
} from 'lucide-react';

interface AbstractAssistantProps {
  paper: PaperNote;
  onApplyData: (data: Partial<PaperNote>) => void;
  onClose?: () => void;
  defaultExpanded?: boolean;
}

// Representative Health, Public Health, Healthcare, and Health Policy Sample Abstracts
const HEALTH_POLICY_SAMPLES = [
  {
    name: '만성질환관리 정책 (보건행정학회지)',
    title: '일차의료 만성질환관리 시범사업이 고혈압·당뇨병 환자의 건강 결과 및 의료비용에 미치는 영향 평가',
    abstract: `초고령사회 진입과 함께 고혈압, 당뇨병 등 만성질환 유병률이 급증함에 따라 국가 보건재정 건전성과 국민 건강수명 연장을 위한 일차의료 중심의 포괄적 관리체계 구축이 시급한 정책 과제로 대두되었다. 본 연구는 국민건강보험공단 맞춤형 연구 DB 표본 코호트(2019-2022년)를 활용하여, '일차의료 만성질환관리 시범사업'에 등록된 고혈압·당뇨병 환자군과 비등록 대조군 간의 건강 행동 변화, 약물 복약순응도, 심뇌혈관질환 합병증 발생률 및 1인당 연간 외래·입원 의료비용 차이를 성향점수매칭(PSM)과 이중차분법(DID)을 결합하여 분석하였다. 분석 결과, 시범사업 참여군은 비참여군 대비 1년 차 적정 복약순응도(PDC ≥ 80%) 달성률이 14.8%p 유의하게 높았으며, 3년 누적 심뇌혈관질환 관련 급성 입원율은 21.3% 감소하였다. 또한 포괄평가 및 케어플랜 수립에 따른 초기 관리료 지출에도 불구하고, 입원 및 응급실 이용 억제 효과로 인해 1인당 연간 총진료비가 평균 284,000원 순절감되는 것으로 나타났다.`
  },
  {
    name: '지역사회 통합돌봄 (보건사회연구)',
    title: '초고령사회 대응을 위한 지역사회 통합돌봄(커뮤니티 케어) 보건의료·요양 연계 모형 구축 및 실증 분석',
    abstract: `시설 중심의 분절적 장기요양과 사회적 입원 문제를 극복하고 고령자가 살던 지역사회에서 존엄한 노후를 영위할 수 있도록 하는 '지역사회 통합돌봄(Community Care)'은 초고령사회의 핵심 보건복지 정책이다. 본 연구는 선도사업 16개 지자체에서 운영된 재택의료센터 및 통합돌봄 전달체계 데이터를 바탕으로, 보건의료·장기요양·지역사회 복지서비스 간 연계 경로를 질적 다면 면담(FGI)과 국민건강보험-노인장기요양보험 결합 DB를 통해 정량적으로 검증하였다. 분석 결과, 다학제 방문진료팀(의사, 간호사, 사회복지사)의 월 1회 이상 재택의료와 방문간호를 제공받은 고령 환자군은 일반 장기요양 재가 수급자군에 비해 요양병원 조기 입원율이 18.6% 낮았으며, 낙상 및 욕창 발생 위험이 27.4% 유의미하게 감소하였다. 그러나 지자체 전담인력의 부족, 방문진료 의사 확보의 지역 간 격차, 의료전달체계와 복지행정 간의 데이터 공유 단절이 주요 정책적 병목으로 식별되었다.`
  },
  {
    name: '비대면 진료 평가 (대한예방의학회지)',
    title: '국내 비대면 진료(원격의료) 시범사업에 따른 의료 접근성 및 임상적 안전성 평가: 국민건강보험 청구자료 분석',
    abstract: `코로나19 팬데믹을 계기로 한시적으로 허용된 이후 제도화 논의가 지속되고 있는 비대면 진료(원격의료)는 의료 접근성 개선이라는 편익과 오진 및 대형병원 쏠림이라는 우려가 첨예하게 대립하고 있다. 본 연구는 2020년 2월부터 2022년 12월까지 발생한 국민건강보험 비대면 진료 청구자료 약 3,600만 건을 전수 분석하여, 진료 과목별 이용 행태, 도서·벽지 및 이동약자의 의료 접근성 변화, 그리고 대면 진료 대조군과의 동일 상병 14일 이내 재방문율 및 처방 변경률을 비교 분석하였다. 분석 결과, 비대면 진료 이용자의 81.2%가 의원급 일차의료기관을 이용하였으며, 도서·벽지 의료취약지 거주 환자의 만성질환 진료 주기 준수율이 32.4% 개선되었다. 동일 상병으로 인한 14일 이내 합병증 발생률 및 응급실 방문율은 대면 진료군과 통계적으로 유의한 차이가 없었으며, 처방 의약품의 일치율 역시 91.5%로 안정적 수준을 유지하였다.`
  }
];

export const AbstractAssistant: React.FC<AbstractAssistantProps> = ({
  paper,
  onApplyData,
  onClose,
  defaultExpanded = true,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [inputMode, setInputMode] = useState<'text' | 'pdf'>('text');
  const [abstractText, setAbstractText] = useState(paper.abstract || '');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Suggestion Result State
  const [suggestion, setSuggestion] = useState<{
    abstractSummary?: string;
    keywords?: string[];
    title?: string;
    authors?: string;
    venue?: string;
    year?: string | number;
    doi?: string;
    category?: string;
    objective?: string;
    methodology?: string;
    results?: string;
    limitations?: string;
    myThoughts?: string;
  } | null>(() => {
    if (paper.abstractSummary || (paper.extractedKeywords && paper.extractedKeywords.length > 0)) {
      return {
        abstractSummary: paper.abstractSummary,
        keywords: paper.extractedKeywords || paper.tags,
        title: paper.title,
        authors: paper.authors,
        venue: paper.venue,
        year: paper.year,
        category: paper.category,
      };
    }
    return null;
  });

  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [previewTab, setPreviewTab] = useState<'summary' | 'template'>('summary');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (file: File) => {
    if (file.type !== 'application/pdf') {
      setErrorMsg('PDF 문서 파일만 업로드할 수 있습니다.');
      return;
    }
    setSelectedFile(file);
    setErrorMsg(null);

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(',')[1];
      setPdfBase64(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAiAnalysis = async () => {
    setErrorMsg(null);
    if (inputMode === 'text' && !abstractText.trim()) {
      setErrorMsg('분석할 논문 초록(Abstract) 또는 본문 텍스트를 입력해주세요.');
      return;
    }
    if (inputMode === 'pdf' && !pdfBase64) {
      setErrorMsg('분석할 논문 PDF 파일을 선택해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/summarize-abstract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputMode === 'text' ? abstractText : undefined,
          pdfBase64: inputMode === 'pdf' ? pdfBase64 : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || '초록 요약 및 키워드 추출에 실패했습니다.');
      }

      if (json.success && json.data) {
        const data = json.data;
        const keywordsList = Array.isArray(data.keywords)
          ? data.keywords
          : Array.isArray(data.tags)
          ? data.tags
          : [];

        setSuggestion({
          abstractSummary: data.abstractSummary,
          keywords: keywordsList,
          title: data.title,
          authors: data.authors,
          venue: data.venue,
          year: data.year,
          doi: data.doi,
          category: data.category || '보건의료정책',
          objective: data.objective,
          methodology: data.methodology,
          results: data.results,
          limitations: data.limitations,
          myThoughts: data.myThoughts,
        });

        setSelectedKeywords(keywordsList);
      } else {
        throw new Error('올바른 응답 데이터를 받지 못했습니다.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'AI 분석 중 오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle individual keyword selection
  const toggleKeyword = (kw: string) => {
    if (selectedKeywords.includes(kw)) {
      setSelectedKeywords(prev => prev.filter(k => k !== kw));
    } else {
      setSelectedKeywords(prev => [...prev, kw]);
    }
  };

  // Add all suggested keywords to paper tags immediately
  const handleApplyKeywordsToTags = () => {
    if (!suggestion?.keywords) return;
    const existing = new Set(paper.tags);
    selectedKeywords.forEach(k => existing.add(k));
    onApplyData({
      tags: Array.from(existing),
      extractedKeywords: suggestion.keywords,
    });
  };

  // Apply full AI suggested note
  const handleApplyFullNote = () => {
    if (!suggestion) return;

    const mergedTags = Array.from(
      new Set([...paper.tags, ...(selectedKeywords.length > 0 ? selectedKeywords : suggestion.keywords || [])])
    );

    const updatePayload: Partial<PaperNote> = {
      abstract: abstractText || paper.abstract,
      abstractSummary: suggestion.abstractSummary || paper.abstractSummary,
      extractedKeywords: suggestion.keywords || paper.extractedKeywords,
      tags: mergedTags,
      title: (!paper.title || paper.title.trim() === '') ? (suggestion.title || paper.title) : paper.title,
      authors: (!paper.authors || paper.authors.trim() === '') ? (suggestion.authors || paper.authors) : paper.authors,
      venue: (!paper.venue || paper.venue.trim() === '') ? (suggestion.venue || paper.venue) : paper.venue,
      year: (!paper.year || paper.year === new Date().getFullYear()) ? (suggestion.year || paper.year) : paper.year,
      category: (!paper.category || paper.category === '기타') ? (suggestion.category || '보건의료정책') : paper.category,
      objective: suggestion.objective || paper.objective,
      methodology: suggestion.methodology || paper.methodology,
      results: suggestion.results || paper.results,
      limitations: suggestion.limitations || paper.limitations,
      myThoughts: suggestion.myThoughts || paper.myThoughts,
    };

    if (suggestion.doi && !paper.doi) {
      updatePayload.doi = suggestion.doi;
    }

    onApplyData(updatePayload);
    setIsExpanded(false);
  };

  return (
    <div className="bg-linear-to-br from-emerald-50/90 via-teal-50/50 to-white rounded-2xl border-2 border-emerald-200/80 shadow-md p-5 transition-all">
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                AI 논문 초록 요약 & 핵심 키워드 자동 추천
              </h3>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                Gemini 3.8
              </span>
            </div>
            <p className="text-xs text-slate-600">
              논문 초록(Abstract) 또는 PDF를 입력하면 <span className="font-semibold text-emerald-950">핵심 요약문</span>과 <span className="font-semibold text-emerald-950">추천 키워드</span> 및 5대 템플릿 초안을 자동으로 구성해 제안합니다.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-white hover:bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            {isExpanded ? (
              <>
                <span>패널 접기</span>
                <ChevronUp className="w-4 h-4" />
              </>
            ) : (
              <>
                <span>AI 도우미 열기</span>
                <ChevronDown className="w-4 h-4" />
              </>
            )}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg"
              title="닫기"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Expanded Body */}
      {isExpanded && (
        <div className="mt-5 pt-4 border-t border-emerald-100/80 space-y-5">
          {/* Academic Portal Quick Reference Bar (RISS, KISS, DBpia, KCI) */}
          <div className="bg-white/80 border border-emerald-100 rounded-xl p-3 text-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 text-slate-700 font-medium">
              <BookOpen className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>논문 검색 참고 사이트:</span>
              <span className="text-slate-500 text-[11px] hidden sm:inline">원하는 논문의 초록을 바로 찾아 복사해오실 수 있습니다.</span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {ACADEMIC_PORTALS.map(portal => (
                <a
                  key={portal.id}
                  href={paper.title ? portal.searchUrl(paper.title) : portal.homeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border transition-colors shadow-2xs ${portal.bgColor} ${portal.color} ${portal.borderColor} hover:brightness-95`}
                  title={`${portal.fullName} - ${portal.description}`}
                >
                  <span>{portal.name}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                </a>
              ))}
            </div>
          </div>

          {/* Input Mode Selector & Sample Presets */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs text-xs">
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                  inputMode === 'text'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                초록 텍스트 직접 입력
              </button>
              <button
                type="button"
                onClick={() => setInputMode('pdf')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                  inputMode === 'pdf'
                    ? 'bg-emerald-600 text-white font-bold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                논문 PDF 파일 업로드
              </button>
            </div>

            {/* Health / Healthcare Policy Sample Abstract Presets */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <span className="text-slate-500 font-medium text-[11px]">💡 보건·의료·정책 예시:</span>
              {HEALTH_POLICY_SAMPLES.map((sample, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setInputMode('text');
                    setAbstractText(sample.abstract);
                    setErrorMsg(null);
                  }}
                  className="px-2 py-1 bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[11px] font-medium transition-colors shadow-2xs"
                  title={sample.title}
                >
                  {sample.name}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form Box */}
          {inputMode === 'text' ? (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                논문 초록(Abstract) 또는 본문 발췌
              </label>
              <textarea
                value={abstractText}
                onChange={(e) => setAbstractText(e.target.value)}
                rows={5}
                placeholder="RISS, KISS, DBpia, KCI 또는 논문 PDF에서 초록(Abstract) 전문을 복사하여 여기에 붙여넣으세요..."
                className="w-full p-3 text-xs text-slate-800 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-sans leading-relaxed shadow-2xs"
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-700">
                논문 PDF 파일 첨부
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-200 hover:border-emerald-400 bg-white/80 hover:bg-white rounded-xl p-6 text-center cursor-pointer transition-colors"
              >
                <Upload className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-800">
                  {selectedFile ? selectedFile.name : '클릭하여 논문 PDF 파일을 선택하거나 드래그 앤 드롭하세요'}
                </p>
                <p className="text-[11px] text-slate-500 mt-1">
                  PDF 텍스트 및 초록을 자동 인식하여 요약 및 키워드를 추출합니다.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Button */}
          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] text-slate-500">
              * Gemini AI가 초록을 정밀 분석하여 학술 키워드 및 5대 템플릿 초안을 생성합니다.
            </div>
            <button
              type="button"
              onClick={handleRunAiAnalysis}
              disabled={isLoading}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>초록 분석 및 키워드 추출 중...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>AI 초록 요약 및 키워드 추출 실행</span>
                </>
              )}
            </button>
          </div>

          {/* Suggestions Output Panel */}
          {suggestion && (
            <div className="mt-6 pt-5 border-t border-emerald-200/70 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-900">
                    AI 분석 결과 제안 (Suggestions)
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleApplyFullNote}
                    className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>새 노트에 전체 적용</span>
                  </button>
                </div>
              </div>

              {/* 1. Suggested Keywords Section */}
              {suggestion.keywords && suggestion.keywords.length > 0 && (
                <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-2xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" />
                      <span>추천 핵심 키워드 ({suggestion.keywords.length}개)</span>
                      <span className="text-[11px] font-normal text-slate-500">
                        (클릭하여 태그 선택 / 해제)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyKeywordsToTags}
                      className="text-xs font-semibold text-emerald-800 hover:text-emerald-950 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-md flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      선택된 키워드 태그로 즉시 등록
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {suggestion.keywords.map((kw, idx) => {
                      const isSelected = selectedKeywords.includes(kw);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => toggleKeyword(kw)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300'
                          }`}
                        >
                          {isSelected ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Plus className="w-3 h-3 text-slate-400" />
                          )}
                          <span>#{kw}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 2. Abstract Executive Summary */}
              {suggestion.abstractSummary && (
                <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5 text-emerald-600" />
                      초록 핵심 요약문 (Executive Summary)
                    </span>
                    <button
                      type="button"
                      onClick={() => onApplyData({ abstractSummary: suggestion.abstractSummary })}
                      className="text-[11px] font-medium text-emerald-700 hover:text-emerald-900 hover:underline"
                    >
                      요약문만 저장
                    </button>
                  </div>
                  <p className="text-xs text-slate-800 bg-slate-50 p-3 rounded-lg leading-relaxed border border-slate-200 font-sans">
                    {suggestion.abstractSummary}
                  </p>
                </div>
              )}

              {/* 3. 5-Section Template Preview Tabs */}
              <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="text-xs font-bold text-slate-900">
                    5대 표준 섹션 초안 미리보기
                  </span>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span>분야: <strong className="text-emerald-800">{suggestion.category || '보건의료정책'}</strong></span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-emerald-950 block">1. 연구 목적 (Objective)</span>
                    <p className="text-[11px] text-slate-600 line-clamp-3">
                      {suggestion.objective || '작성 대기 중'}
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-emerald-950 block">2. 연구 방법 (Methodology)</span>
                    <p className="text-[11px] text-slate-600 line-clamp-3">
                      {suggestion.methodology || '작성 대기 중'}
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-emerald-950 block">3. 연구 결과 (Results)</span>
                    <p className="text-[11px] text-slate-600 line-clamp-3">
                      {suggestion.results || '작성 대기 중'}
                    </p>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="font-bold text-emerald-950 block">4. 한계점 (Limitations)</span>
                    <p className="text-[11px] text-slate-600 line-clamp-3">
                      {suggestion.limitations || '작성 대기 중'}
                    </p>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    type="button"
                    onClick={handleApplyFullNote}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  >
                    <span>이 추천 내용으로 노트 채우기</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
