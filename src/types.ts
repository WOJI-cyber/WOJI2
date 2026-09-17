export type PaperStatus = 'to_read' | 'reading' | 'completed' | 'revisit';

export interface StructuredPaperAnalysis {
  oneLineSummary?: string; // 한 줄 요약
  researchBackground?: string; // 연구 배경
  researchObjective?: string; // 연구 목적
  researchQuestions?: string; // 연구 질문 또는 가설
  studyTarget?: string; // 연구 대상
  sampleSize?: string; // 표본 수
  researchDesign?: string; // 연구 설계 (예: 후향적 코호트, 무작위대조시험, 횡단적 설문)
  researchMethod?: string; // 연구 방법 (예: DID 이중차분법, PSM 성향점수매칭, 다중회귀분석)
  variables?: {
    independent?: string; // 독립변수
    dependent?: string; // 종속변수
    mediatorOrModerator?: string; // 조절 또는 매개 변수 (alias)
    mediatorsOrModerators?: string; // 조절 또는 매개 변수
    control?: string; // 통제변수
  };
  mainFindings?: string; // 주요 결과
  authorConclusion?: string; // 연구자의 결론
  authorLimitations?: string; // 저자가 직접 밝힌 한계 (논문 본문에 기술된 내용)
  aiLimitations?: string; // AI가 추가적으로 분석한 한계 (외적 타당도, 잠재적 교란변수 등 AI 비판적 추론)
  practicalImplications?: string; // 실무적 시사점
  implications?: string; // 시사점 (alias)
  futureResearchSuggestions?: string; // 후속 연구 가능성
  keyKeywords?: string[]; // 핵심 키워드 목록
}

export type StructuredAnalysis = StructuredPaperAnalysis;

export interface PaperNote {
  id: string;
  // Basic info
  title: string;
  authors: string;
  venue: string; // Journal / Conference
  year: string | number;
  doi: string; // DOI or arXiv URL
  pdfUrl?: string;
  category: string; // e.g., 보건의료정책, 임상의학, 인공지능/머신러닝
  tags: string[];
  status: PaperStatus;
  rating: number; // 0 to 5
  isFavorite: boolean;

  // New research metadata
  origin?: 'domestic' | 'international'; // 국내 / 해외
  isOpenAccess?: boolean; // 무료 원문 여부
  studyType?: string; // 연구 유형 (양적 연구, 질적 연구, 체계적 문헌고찰, 정책/실증 등)
  projectId?: string; // 소속 프로젝트 ID

  // Abstract & AI Summary
  abstract?: string; // 원문 초록 (Abstract)
  abstractSummary?: string; // AI 초록 요약 (Executive Summary)
  extractedKeywords?: string[]; // 추출된 핵심 키워드

  // AI Structured Breakdown (14 core dimensions)
  structuredAnalysis?: StructuredPaperAnalysis;

  // 5 Core Template Sections (Compatible with classic view)
  objective: string; // 연구 목적 (Objective): 문제 정의 및 연구 배경
  methodology: string; // 연구 방법 (Methodology): 데이터셋, 실험 설계, 알고리즘/이론
  results: string; // 연구 결과 (Results): 주요 발견, 주요 지표, 성능 비교
  limitations: string; // 한계점 (Limitations): 저자가 밝힌 한계 또는 실질적 한계
  myThoughts: string; // 내 생각 (My Thoughts): 시사점, 비판적 검토, 내 연구/프로젝트 적용 방안

  // Metadata
  bibtex?: string;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

export type TemplateSectionKey = 'objective' | 'methodology' | 'results' | 'limitations' | 'myThoughts';

export interface TemplateSectionMeta {
  key: TemplateSectionKey;
  title: string;
  shortTitle?: string; // 한국어 간결 표기 (예: '연구 목적', '연구 방법')
  iconName: string;
  description: string;
  guideQuestions: string[];
  placeholder: string;
}

export type SortField = 'updatedAt' | 'createdAt' | 'year' | 'title' | 'rating';
export type SortOrder = 'asc' | 'desc';

export interface FilterState {
  searchQuery: string;
  status: PaperStatus | 'all';
  selectedCategory: string | 'all';
  selectedTags: string[];
  sortBy: SortField;
  sortOrder: SortOrder;
  onlyFavorites: boolean;

  // Additional search filters
  origin: 'all' | 'domestic' | 'international'; // 국내 / 해외
  recent5Years: boolean; // 최근 5년 필터
  openAccessOnly: boolean; // 무료 원문 여부
  studyType: string | 'all'; // 연구 유형 필터
  selectedYear?: number | 'all'; // 특정 출판 연도
  yearFrom?: number; // 시작 연도
  yearTo?: number; // 종료 연도
  projectId?: string | 'all'; // 특정 연구 프로젝트
}

// Research Gap Item
export interface ResearchGapItem {
  id: string;
  category: 'subject' | 'region' | 'variable' | 'method' | 'period' | 'contradiction';
  categoryLabel: string; // 연구 대상의 공백, 연구 지역의 공백 등
  title: string;
  description: string;
  groundedPaperIds: string[]; // 근거 논문 ID 목록
  groundedPaperTitles: string[]; // 근거 논문 제목 목록
  severity?: 'high' | 'medium' | 'opportunity';
}

// Research Topic Proposal
export interface ResearchTopicProposal {
  id: string;
  title: string; // 연구 제목 예시
  researchQuestion: string; // 연구 질문
  necessity: string; // 연구 필요성
  studyTarget: string; // 연구 대상
  independentVariable: string; // 독립변수
  dependentVariable: string; // 종속변수
  mediatorOrModerator: string; // 가능한 조절 또는 매개 변수
  recommendedMethod: string; // 추천 연구방법
  noveltyAndDifference: string; // 기존 논문과의 차별점
  basedOnGaps?: string[]; // 기반한 연구 공백 제목들
  createdAt: string;
  isAdopted?: boolean;
}

// Paper Comparative Synthesis
export interface PaperComparisonSynthesis {
  commonFindings: string[]; // 논문들의 공통된 연구 결과
  divergentFindings: string[]; // 연구 결과가 서로 다른 부분 (이견/불일치)
  methodologicalDifferences: string[]; // 연구 방법의 차이
  commonLimitations: string[]; // 기존 연구의 공통 한계
  unexploredAreas: string[]; // 아직 충분히 연구되지 않은 영역
}

// Research Project
export interface ResearchProject {
  id: string;
  name: string; // 예: "지역사회 자살예방 및 정신건강 정책 연구"
  description?: string;
  createdAt: string;
  updatedAt: string;
  keyPaperIds: string[]; // 핵심 논문 (Star / Key Papers)
  researchNotes: string; // 연구 메모 (Markdown)
  researchGaps: ResearchGapItem[]; // 발견된 Research Gap 목록
  topicProposals: ResearchTopicProposal[]; // 연구주제 후보 목록
}
