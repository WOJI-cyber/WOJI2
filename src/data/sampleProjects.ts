import { ResearchProject } from '../types';

export const SAMPLE_PROJECTS: ResearchProject[] = [
  {
    id: 'project-chronic-care',
    name: '일차의료 만성질환관리 및 건강보험 재정 연구',
    description: '초고령사회 대비 동네의원 중심 만성질환(고혈압·당뇨) 포괄 관리와 건강보험 재정 건전성 평가 및 차기 지불제도 혁신 연구',
    createdAt: '2026-03-01T00:00:00.000Z',
    updatedAt: '2026-03-16T10:00:00.000Z',
    keyPaperIds: ['sample-chronic-care-2023'],
    researchNotes: `## 연구 진행 메모
- **주요 가설**: 일차의료 만성질환관리는 단기적 관리료 수가 투입에도 불구하고, ACSC 입원 및 합병증을 억제하여 3~5년 누적 순재정 절감을 이끌어냄.
- **주목할 변수**: 환자 복약순응도(PDC), 케어플랜 이행률, 당화혈색소(HbA1c) 검사 수치, 건강보험 청구액.
- **연구 질문 아이디어**: 농어촌 취약지역에서의 ICT 기반 비대면 모니터링 수가 결합 시 임상 효과성의 격차는 어떻게 나타나는가?`,
    researchGaps: [
      {
        id: 'gap-chronic-1',
        category: 'region',
        categoryLabel: '연구 지역의 공백',
        title: '대도시 중심 의원 표본 편중과 농어촌 의료취약지 실증 데이터 부족',
        description: '기존 시범사업 평가는 주로 수도권 및 광역시 의원급에 집중되어, 의사 1인당 관할 면적이 넓고 고령화율이 30%를 상회하는 군 단위 농어촌 보건의료 취약지에서의 순응도 및 효과 분석이 결여되어 있음.',
        groundedPaperIds: ['sample-chronic-care-2023'],
        groundedPaperTitles: ['일차의료 만성질환관리 시범사업이 고혈압·당뇨병 환자의 건강 결과 및 의료비용에 미치는 영향 평가'],
        severity: 'high'
      },
      {
        id: 'gap-chronic-2',
        category: 'variable',
        categoryLabel: '연구 변수의 공백',
        title: '환자 자기효능감 및 디지털 헬스케어 리터러시 변수 미반영',
        description: '건강보험 청구자료의 한계로 인해 환자의 자가 혈압/혈당 측정 빈도, 모바일 앱 활용 능력, 식습관 및 운동 등 환자 주도적 생활습관 조절 변수가 통제되지 못함.',
        groundedPaperIds: ['sample-chronic-care-2023'],
        groundedPaperTitles: ['일차의료 만성질환관리 시범사업이 고혈압·당뇨병 환자의 건강 결과 및 의료비용에 미치는 영향 평가'],
        severity: 'medium'
      }
    ],
    topicProposals: [
      {
        id: 'topic-chronic-1',
        title: '의료취약지 일차의료 만성질환관리 시범사업에서 ICT 비대면 케어플랜이 고령 환자의 건강수명 및 회피가능 입원율에 미치는 장기 효과 분석',
        researchQuestion: '농어촌 취약지역 고혈압·당뇨 고령 환자에게 제공된 ICT 비대면 케어플랜이 대도시 환자군과 비교하여 합병증 억제와 총진료비에 미치는 영향은 차별적인가?',
        necessity: '초고령사회 도래와 함께 지방 소멸 및 필수의료 붕괴 위기 속에서 농어촌 지역의 일차의료 공백을 메우기 위한 정책적 실증 근거가 절실함.',
        studyTarget: '군 단위 농어촌 거주 만 65세 이상 고혈압·당뇨 복합질환자 (표본 코호트 N=50,000명)',
        independentVariable: 'ICT 비대면 모니터링 결합 만성질환관리 참여 여부 및 지속 기간',
        dependentVariable: '외래민감성질환(ACSC) 급성 입원율, 1인당 연간 건강보험 급여비용',
        mediatorOrModerator: '디지털 헬스 리터러시 및 방문간호사 케어코디네이터 상담 횟수',
        recommendedMethod: '국민건강보험공단 맞춤형 코호트 데이터 기반 이중차분법(DID) 및 삼중차분법(Triple Differences)',
        noveltyAndDifference: '선행 연구가 대도시 위주의 단기 3년 분석에 머문 것과 달리, 지리적 접근도(농어촌)와 비대면 ICT 모니터링 변수를 결합하여 5개년 장기 패널을 추적함.',
        basedOnGaps: ['대도시 중심 의원 표본 편중과 농어촌 의료취약지 실증 데이터 부족'],
        createdAt: '2026-03-10T14:30:00.000Z'
      }
    ]
  },
  {
    id: 'project-suicide-prevention',
    name: '지역사회 자살예방 및 정신건강 정책 연구',
    description: 'OECD 최고 수준의 노인 및 청년 자살률 대응을 위한 지역사회 정신건강 안전망, 고위험군 조기 발굴 및 다학제 개입 실증 연구',
    createdAt: '2026-03-08T00:00:00.000Z',
    updatedAt: '2026-03-16T11:00:00.000Z',
    keyPaperIds: ['sample-community-care-2024'],
    researchNotes: `## 연구 프로젝트 방향
- 자살 시도자 사후관리 사업의 응급실 연계율 및 지자체 정신건강복지센터 재방문율 추적.
- 고립·은둔 청년 및 독거노인의 사회적 처방(Social Prescribing) 효과 검증.
- 복지-보건의료 데이터 결합(단전·단수·체납 빅데이터와 자살 고위험군 예측)의 정확도 평가.`,
    researchGaps: [
      {
        id: 'gap-suicide-1',
        category: 'subject',
        categoryLabel: '연구 대상의 공백',
        title: '청년층 고립·은둔 자살위험군과 75세 이상 후기 고령자 자살위기 개입의 분절',
        description: '자살예방 정책 연구가 일반 성인 위주로 설계되어, 최근 급증하는 청년층 고립 은둔 고위험군과 신체적 복합만성질환을 동반한 후기 고령자의 자살 충동 메커니즘을 구별하여 규명하지 못함.',
        groundedPaperIds: ['sample-community-care-2024'],
        groundedPaperTitles: ['초고령사회 대응을 위한 지역사회 통합돌봄(커뮤니티 케어) 보건의료·요양 연계 모형 구축 및 실증 분석'],
        severity: 'high'
      }
    ],
    topicProposals: [
      {
        id: 'topic-suicide-1',
        title: '지역사회 복지-보건 빅데이터 연계망을 통한 독거 고령자 자살위험 조기 예측 및 다학제 방문케어의 예방 효과',
        researchQuestion: '단전·단수 등 위기 징후 데이터와 일차의료 방문진료가 결합된 자살 고위험군 선별 체계가 실제 고령자 자살 시도율을 낮추는가?',
        necessity: '시설 수용이 아닌 지역사회 중심 예방 안전망 구축의 법제화에 따른 실증 정책 근거 마련.',
        studyTarget: '지자체 자살예방센터 등록 65세 이상 독거노인 (N=12,000명)',
        independentVariable: '다학제 자살위기 방문 개입 프로그램 참여 여부',
        dependentVariable: '우울 점수(GDS), 자살 충동 척도, 2개년 자살 시도 발생률',
        mediatorOrModerator: '지역사회 사회적 연결망 크기 및 방문간호 빈도',
        recommendedMethod: '혼합 연구방법론 (성향점수매칭 후향 코호트 + 심층 질적 면담 FGI)',
        noveltyAndDifference: '보건의료 청구자료와 지자체 복지 사각지대 발굴 시스템을 연계하여 조기 선별의 예측 타당도와 개입 효과를 동시 검증.',
        basedOnGaps: ['청년층 고립·은둔 자살위험군과 75세 이상 후기 고령자 자살위기 개입의 분절'],
        createdAt: '2026-03-12T09:00:00.000Z'
      }
    ]
  },
  {
    id: 'project-telehealth-eval',
    name: '비대면 진료 및 디지털 헬스케어 제도화 평가',
    description: '국내 비대면 진료 시범사업의 임상 안전성, 의료 접근성 및 건강보험 수가체계 적정성 평가 연구',
    createdAt: '2026-03-05T00:00:00.000Z',
    updatedAt: '2026-03-15T15:00:00.000Z',
    keyPaperIds: ['sample-telemedicine-2023'],
    researchNotes: `## 핵심 연구 메모
- 비대면 진료 허용 이후 초진 vs 재진 환자의 안전성 지표(14일 이내 재방문, 오진 및 약물 이상반응).
- 도서벽지 거주민의 의료이용 장벽 해소 수준과 의원급 의료기관의 경영적 수용성.`,
    researchGaps: [
      {
        id: 'gap-telehealth-1',
        category: 'method',
        categoryLabel: '연구 방법의 공백',
        title: '청구자료 기반 횡단 분석의 한계와 실시간 임상 바이탈 데이터 연계 부재',
        description: '기존 연구는 사후 건강보험 청구자료에만 의존하여 진료 당시 환자의 주관적 증상, 문진의 질(충실도), 의사의 비대면 진단 신뢰도 등 임상 과정 지표를 직접 포착하지 못함.',
        groundedPaperIds: ['sample-telemedicine-2023'],
        groundedPaperTitles: ['국내 비대면 진료(원격의료) 시범사업에 따른 의료 접근성 및 임상적 안전성 평가: 국민건강보험 청구자료 분석'],
        severity: 'high'
      }
    ],
    topicProposals: [
      {
        id: 'topic-telehealth-1',
        title: '도서·벽지 만성질환자의 비대면 진료 지속 이용이 3차 병원 외래 쏠림 완화 및 약물 유해사건에 미치는 준실험적 평가',
        researchQuestion: '지리적 의료취약지 주민의 의원급 비대면 진료 접근성 확보가 불필요한 대형병원 이동을 억제하고 임상 안전성을 담보하는가?',
        necessity: '비대면 진료 법제화 논의에서 가장 첨예하게 대립하는 임상 안전성과 대형병원 쏠림 우려에 대한 객관적 실증 해답 필요.',
        studyTarget: '행정안전부 지정 도서·벽지 거주민 중 만성질환 복약 환자 (N=45,000명)',
        independentVariable: '비대면 진료 이용 횟수 및 의원급 지속관리 여부',
        dependentVariable: '상급종합병원 외래 방문율, 약물 유해반응(ADE) 발생률, 이동 시간 및 교통비 절감액',
        mediatorOrModerator: '지역 내 약국 접근성 및 연령별 스마트폰 활용 역량',
        recommendedMethod: '성향점수 가중치(IPTW)를 적용한 이중차분모형 및 조절효과 분석',
        noveltyAndDifference: '전국 단위 단순 빈도 분석을 넘어 취약지 주민의 실제 의료이용 이동 경로(GIS 결합)와 임상 안전성을 다면 입증.',
        basedOnGaps: ['청구자료 기반 횡단 분석의 한계와 실시간 임상 바이탈 데이터 연계 부재'],
        createdAt: '2026-03-14T16:20:00.000Z'
      }
    ]
  }
];
