import React, { useState, useRef } from 'react';
import { PaperNote } from '../types';
import { ACADEMIC_PORTALS } from '../utils/academicSearch';
import {
  Sparkles,
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  FileCode,
  ArrowRight,
  BookOpen,
  ExternalLink,
  Tag
} from 'lucide-react';

interface AiExtractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (extractedData: Partial<PaperNote>) => void;
}

const HEALTH_POLICY_ABSTRACTS = [
  {
    name: '만성질환관리 정책',
    source: '보건행정학회지',
    title: '일차의료 만성질환관리 시범사업이 고혈압·당뇨병 환자의 건강 결과 및 의료비용에 미치는 영향 평가',
    text: `일차의료 만성질환관리 시범사업이 고혈압·당뇨병 환자의 건강 결과 및 의료비용에 미치는 영향 평가
저자: 김수경, 이태진, 박현아
게재지: 보건행정학회지 (2023)
DOI: https://doi.org/10.4332/KJHPA.2023.33.2.145

초록(Abstract):
초고령사회 진입과 함께 고혈압, 당뇨병 등 만성질환 유병률이 급증함에 따라 국가 보건재정 건전성과 국민 건강수명 연장을 위한 일차의료 중심의 포괄적 관리체계 구축이 시급한 정책 과제로 대두되었다. 본 연구는 국민건강보험공단 맞춤형 연구 DB 표본 코호트(2019-2022년)를 활용하여, '일차의료 만성질환관리 시범사업'에 등록된 고혈압·당뇨병 환자군과 비등록 대조군 간의 건강 행동 변화, 약물 복약순응도, 심뇌혈관질환 합병증 발생률 및 1인당 연간 외래·입원 의료비용 차이를 성향점수매칭(PSM)과 이중차분법(DID)을 결합하여 분석하였다. 분석 결과, 시범사업 참여군은 비참여군 대비 1년 차 적정 복약순응도(PDC ≥ 80%) 달성률이 14.8%p 유의하게 높았으며, 3년 누적 심뇌혈관질환 관련 급성 입원율은 21.3% 감소하였다. 또한 포괄평가 및 케어플랜 수립에 따른 초기 관리료 지출에도 불구하고, 입원 및 응급실 이용 억제 효과로 인해 1인당 연간 총진료비가 평균 284,000원 순절감되는 것으로 나타났다.`
  },
  {
    name: '지역사회 통합돌봄',
    source: '보건사회연구',
    title: '초고령사회 대응을 위한 지역사회 통합돌봄(커뮤니티 케어) 보건의료·요양 연계 모형 구축 및 실증 분석',
    text: `초고령사회 대응을 위한 지역사회 통합돌봄(커뮤니티 케어) 보건의료·요양 연계 모형 구축 및 실증 분석
저자: 정영호, 강희정, 고숙자
게재지: 보건사회연구 (2024)
DOI: https://doi.org/10.15709/hswr.2024.44.1.89

초록(Abstract):
시설 중심의 분절적 장기요양과 사회적 입원 문제를 극복하고 고령자가 살던 지역사회에서 존엄한 노후를 영위할 수 있도록 하는 '지역사회 통합돌봄(Community Care)'은 초고령사회의 핵심 보건복지 정책이다. 본 연구는 선도사업 16개 지자체에서 운영된 재택의료센터 및 통합돌봄 전달체계 데이터를 바탕으로, 보건의료·장기요양·지역사회 복지서비스 간 연계 경로를 질적 다면 면담(FGI)과 국민건강보험-노인장기요양보험 결합 DB를 통해 정량적으로 검증하였다. 분석 결과, 다학제 방문진료팀의 재택의료를 제공받은 고령 환자군은 일반 장기요양 재가 수급자군에 비해 요양병원 조기 입원율이 18.6% 낮았으며, 낙상 및 욕창 발생 위험이 27.4% 유의미하게 감소하였다. 지자체 전담인력의 부족과 방문진료 의사 확보의 지역 간 격차가 주요 정책적 병목으로 식별되었다.`
  },
  {
    name: '비대면 진료 안전성',
    source: '대한예방의학회지',
    title: '국내 비대면 진료(원격의료) 시범사업에 따른 의료 접근성 및 임상적 안전성 평가: 국민건강보험 청구자료 분석',
    text: `국내 비대면 진료(원격의료) 시범사업에 따른 의료 접근성 및 임상적 안전성 평가: 국민건강보험 청구자료 분석
저자: 박은철, 이상이, 장성인
게재지: 대한예방의학회지 (2023)
DOI: https://doi.org/10.3961/jpmph.2023.56.4.210

초록(Abstract):
코로나19 팬데믹을 계기로 한시적으로 허용된 이후 제도화 논의가 지속되고 있는 비대면 진료는 의료 접근성 개선과 임상 안전성 검증이라는 두 축이 충돌하고 있다. 본 연구는 2020년 2월부터 2022년 12월까지 발생한 국민건강보험 비대면 진료 청구자료 약 3,600만 건을 전수 분석하여, 도서·벽지 거주민의 만성질환 처방 지속률과 14일 이내 재방문율 및 합병증 발생 위험을 대면 진료군과 성향점수매칭으로 비교하였다. 분석 결과 비대면 진료 이용자의 81.2%가 의원급 일차의료기관을 이용하였으며, 동일 상병으로 인한 급성 합병증 및 응급실 방문 위험은 대면 진료군과 유의한 차이가 없어 만성질환 관리에 있어 대체적 안전성을 확인하였다.`
  }
];

export const AiExtractModal: React.FC<AiExtractModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'text' | 'pdf'>('text');
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfBase64, setPdfBase64] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [extractedResult, setExtractedResult] = useState<Partial<PaperNote> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileDrop = (file: File) => {
    if (file.type !== 'application/pdf') {
      setErrorMsg('PDF 파일만 업로드할 수 있습니다.');
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

  const handleAnalyze = async () => {
    setErrorMsg(null);
    if (activeTab === 'text' && !inputText.trim()) {
      setErrorMsg('논문 제목, 초록 또는 본문 텍스트를 입력해주세요.');
      return;
    }
    if (activeTab === 'pdf' && !pdfBase64) {
      setErrorMsg('PDF 파일을 선택해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      const res = await fetch('/api/analyze-paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: activeTab === 'text' ? inputText : undefined,
          pdfBase64: activeTab === 'pdf' ? pdfBase64 : undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || '논문 분석에 실패했습니다.');
      }

      if (json.success && json.data) {
        const data = json.data;
        const keywordsList = Array.isArray(data.keywords)
          ? data.keywords
          : Array.isArray(data.tags)
          ? data.tags
          : [];

        setExtractedResult({
          ...data,
          abstract: activeTab === 'text' ? inputText : undefined,
          abstractSummary: data.abstractSummary,
          extractedKeywords: keywordsList,
          tags: Array.isArray(data.tags) && data.tags.length > 0 ? data.tags : keywordsList,
        });
      } else {
        throw new Error('데이터 형식이 올바르지 않습니다.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || '오류가 발생했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApply = () => {
    if (!extractedResult) return;
    onSuccess(extractedResult);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full p-6 space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                AI 논문 초록 요약 & 키워드 자동 추출
              </h3>
              <p className="text-xs text-slate-500">
                PDF 파일 또는 초록 텍스트를 입력하면 핵심 요약, 추천 키워드 및 5대 템플릿 초안을 제안합니다.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Academic Search Portal Shortcuts (RISS, KISS, DBpia, KCI) */}
        {!extractedResult && (
          <div className="bg-emerald-50/60 border border-emerald-100 rounded-xl p-3 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-emerald-950 font-medium">
              <BookOpen className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>논문 검색 참고 사이트:</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {ACADEMIC_PORTALS.map(portal => (
                <a
                  key={portal.id}
                  href={portal.homeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold border transition-colors shadow-2xs ${portal.bgColor} ${portal.color} ${portal.borderColor} hover:brightness-95`}
                  title={`${portal.fullName} 열기`}
                >
                  <span>{portal.name}</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Tab Selection: Text vs PDF */}
        {!extractedResult && (
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2 text-xs">
            <button
              type="button"
              onClick={() => setActiveTab('text')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'text'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              초록 텍스트 직접 입력
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pdf')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors flex items-center gap-1.5 ${
                activeTab === 'pdf'
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              PDF 파일 업로드
            </button>
          </div>
        )}

        {/* Body content before result */}
        {!extractedResult && (
          <div className="space-y-4">
            {activeTab === 'text' ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600">
                  <label htmlFor="textarea-paper-input-abstract" className="font-semibold text-slate-800">
                    논문 초록(Abstract) 또는 본문 텍스트:
                  </label>
                  <div className="flex items-center gap-1 flex-wrap">
                    <span className="text-[11px] text-slate-500">예시 불러오기:</span>
                    {HEALTH_POLICY_ABSTRACTS.map((sample, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setInputText(sample.text)}
                        className="text-[10px] text-emerald-800 hover:bg-emerald-100 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium transition-colors"
                        title={sample.title}
                      >
                        {sample.name}
                      </button>
                    ))}
                  </div>
                </div>
                <textarea
                  id="textarea-paper-input-abstract"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  rows={8}
                  placeholder="RISS, KISS, DBpia, KCI 또는 논문에서 초록(Abstract)을 복사하여 붙여넣으세요..."
                  className="w-full p-3 text-xs font-sans bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white resize-y shadow-2xs leading-relaxed"
                />
              </div>
            ) : (
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file) handleFileDrop(file);
                }}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/30 rounded-2xl p-8 text-center cursor-pointer transition-colors"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileDrop(file);
                  }}
                  className="hidden"
                />
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                {selectedFile ? (
                  <div className="text-slate-800">
                    <p className="font-semibold text-sm text-emerald-800">{selectedFile.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB - 다른 파일을 선택하려면 클릭
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      PDF 논문 파일을 여기에 드래그하거나 클릭하여 업로드
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Gemini Multimodal AI가 PDF 첫 페이지 및 초록을 자동 분석합니다.
                    </p>
                  </div>
                )}
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        )}

        {/* Extracted Preview View */}
        {extractedResult && (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>논문 초록 분석 및 핵심 키워드 추천이 완료되었습니다!</span>
            </div>

            {/* Abstract Executive Summary Card */}
            {extractedResult.abstractSummary && (
              <div className="bg-emerald-50/70 border border-emerald-200 p-3.5 rounded-xl space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-950">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>초록 핵심 요약 (Executive Summary)</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-sans bg-white p-2.5 rounded-lg border border-emerald-100">
                  {extractedResult.abstractSummary}
                </p>
              </div>
            )}

            {/* Extracted Keywords Card */}
            {((extractedResult.extractedKeywords && extractedResult.extractedKeywords.length > 0) ||
              (extractedResult.tags && extractedResult.tags.length > 0)) && (
              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Tag className="w-3.5 h-3.5 text-emerald-600" />
                  <span>추천 핵심 학술 키워드</span>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {(extractedResult.extractedKeywords || extractedResult.tags || []).map((t, idx) => (
                    <span
                      key={idx}
                      className="bg-emerald-50 text-emerald-800 font-medium px-2 py-0.5 rounded-md border border-emerald-200 text-xs shadow-2xs"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Basic metadata */}
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
              <div>
                <span className="font-semibold text-slate-500">논문 제목:</span>{' '}
                <strong className="text-slate-900 text-sm">{extractedResult.title}</strong>
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-700">
                <div>
                  <span className="font-semibold text-slate-500">저자:</span> {extractedResult.authors}
                </div>
                <div>
                  <span className="font-semibold text-slate-500">게재지/연도:</span> {extractedResult.venue} ({extractedResult.year})
                </div>
              </div>
              <div>
                <span className="font-semibold text-slate-500">분야:</span>{' '}
                <span className="text-emerald-800 font-medium">{extractedResult.category || '보건의료정책'}</span>
              </div>
            </div>

            {/* Quick Preview of the 5 Sections */}
            <div className="space-y-2 text-xs">
              <div className="font-bold text-slate-800">5대 표준 섹션 초안 미리보기:</div>
              {[
                { label: '1. 연구 목적 (Objective)', val: extractedResult.objective },
                { label: '2. 연구 방법 (Methodology)', val: extractedResult.methodology },
                { label: '3. 연구 결과 (Results)', val: extractedResult.results },
                { label: '4. 한계점 (Limitations)', val: extractedResult.limitations },
                { label: '5. 시사점 및 내 생각 (My Thoughts)', val: extractedResult.myThoughts },
              ].map((item, idx) => (
                <div key={idx} className="p-2.5 bg-white border border-slate-200 rounded-lg">
                  <div className="font-semibold text-emerald-950 mb-1">{item.label}</div>
                  <p className="text-slate-600 line-clamp-2 text-[11px] leading-relaxed">
                    {item.val?.replace(/[#*`$-]/g, '').trim()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="border-t border-slate-100 pt-3 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            취소
          </button>

          {!extractedResult ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleAnalyze}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Gemini AI 초록 분석 및 키워드 추출 중...
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  AI 분석 실행하기
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setExtractedResult(null)}
                className="px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                다시 분석
              </button>
              <button
                type="button"
                onClick={handleApply}
                className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <span>이 추천 내용으로 새 노트 작성</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
