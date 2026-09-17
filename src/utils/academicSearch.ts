export interface AcademicPortal {
  id: 'riss' | 'kiss' | 'dbpia' | 'kci';
  name: string;
  fullName: string;
  badge: string;
  color: string;
  bgColor: string;
  borderColor: string;
  description: string;
  searchUrl: (query: string) => string;
  homeUrl: string;
}

export const ACADEMIC_PORTALS: AcademicPortal[] = [
  {
    id: 'riss',
    name: 'RISS',
    fullName: '한국교육학술정보원 학술연구정보서비스',
    badge: '학위·학술지 종합',
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    description: '국내 석박사 학위논문, KCI 및 해외 학술지 통합 원문 검색',
    searchUrl: (q: string) => `https://www.riss.kr/search/Search.do?colName=all&query=${encodeURIComponent(q)}`,
    homeUrl: 'https://www.riss.kr',
  },
  {
    id: 'kiss',
    name: 'KISS',
    fullName: '한국학술정보 학술 데이터베이스',
    badge: '학회지·전문DB',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: '의학, 보건학, 정책학 등 주요 학회 발표논문 및 학술지 원문 검색',
    searchUrl: (q: string) => `https://kiss.kstudy.com/search/list?query=${encodeURIComponent(q)}`,
    homeUrl: 'https://kiss.kstudy.com',
  },
  {
    id: 'dbpia',
    name: 'DBpia',
    fullName: '디비피아 학술논문 포털',
    badge: '국내 대표 학술지',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    description: '보건의료, 의학, 사회과학 등 국내 4,000여 개 저널 원문 제공',
    searchUrl: (q: string) => `https://www.dbpia.co.kr/search/topSearch?searchOption=all&query=${encodeURIComponent(q)}`,
    homeUrl: 'https://www.dbpia.co.kr',
  },
  {
    id: 'kci',
    name: 'KCI',
    fullName: '한국학술지인용색인 (Korea Citation Index)',
    badge: '연구재단 공식 등재',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: '한국연구재단(NRF) 공인 KCI 등재(후보) 논문 및 피인용 지수 검색',
    searchUrl: (q: string) => `https://www.kci.go.kr/kciportal/po/search/poArtiSearList.kci?query=${encodeURIComponent(q)}`,
    homeUrl: 'https://www.kci.go.kr',
  },
];
