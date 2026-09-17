import { TemplateSectionMeta } from '../types';

export const TEMPLATE_SECTIONS: TemplateSectionMeta[] = [
  {
    key: 'objective',
    title: '1. 연구 목적 (Objective)',
    shortTitle: '연구 목적',
    iconName: 'Target',
    description: '이 논문이 해결하고자 하는 문제 및 연구 배경',
    guideQuestions: [
      '기존 연구들의 한계점 및 미해결 문제는 무엇인가?',
      '본 논문이 해결하려는 핵심 연구 질문(Research Question)은 무엇인가?',
      '왜 이 문제를 해결하는 것이 중요한가?'
    ],
    placeholder: `## 연구 배경 및 동기\n- 기존 방식의 병목: 기존 순환 신경망(RNN/LSTM)은 순차적 계산 특성상 병렬화가 어렵고 긴 시퀀스에서 정보 손실이 발생함.\n\n## 핵심 연구 목적\n- 재귀(Recurrence) 구조를 완전히 배제하고 오직 Attention 메커니즘만으로 시퀀스-투-시퀀스 변환 모델을 구축.\n- 학습 시간 대폭 단축 및 긴 문맥(Long-range dependency) 처리 성능 향상.`
  },
  {
    key: 'methodology',
    title: '2. 연구 방법 (Methodology)',
    shortTitle: '연구 방법',
    iconName: 'Cpu',
    description: '데이터셋, 실험 설계, 적용 알고리즘 및 이론',
    guideQuestions: [
      '제안하는 핵심 아키텍처나 알고리즘의 원리는 무엇인가?',
      '사용한 데이터셋과 실험 환경(하드웨어, 하이퍼파라미터)은 어떠한가?',
      '비교 대상이 된 Baseline 모델과 평가 지표는 무엇인가?'
    ],
    placeholder: `## 핵심 아키텍처\n- **Scaled Dot-Product Attention**: $\\text{Attention}(Q, K, V) = \\text{softmax}\\left(\\frac{QK^T}{\\sqrt{d_k}}\\right)V$\n- **Multi-Head Attention**: $h=8$개 헤드를 병렬로 학습하여 다양한 표현 공간의 정보를 포착.\n- **Positional Encoding**: Sinusoidal 함수를 이용해 시퀀스 위치 정보 주입.\n\n## 실험 세팅\n- 데이터: WMT 2014 English-to-German (4.5M pairs), English-to-French (36M pairs)\n- 하드웨어: 8 NVIDIA P100 GPUs, Adam Optimizer (Noam learning rate schedule)`
  },
  {
    key: 'results',
    title: '3. 연구 결과 (Results)',
    shortTitle: '연구 결과',
    iconName: 'TrendingUp',
    description: '주요 발견, 핵심 지표, 기존 SOTA와의 성능 비교',
    guideQuestions: [
      '주요 정량적 지표(Accuracy, BLEU, F1, latency 등) 결과는 어떠한가?',
      'Ablation Study를 통해 증명된 각 구성 요소의 기여도는?',
      '정성적 결과나 흥미로운 사례가 있는가?'
    ],
    placeholder: `## 주요 성과 (BLEU Score)\n- **WMT 2014 EN-DE**: 28.4 BLEU 달성 (기존 최고 모델 대비 +2.0 향상, SOTA 경신)\n- **WMT 2014 EN-FR**: 41.8 BLEU 달성 (기존 앙상블 모델보다 우수하면서 학습 비용은 1/4 수준)\n\n## Ablation Study\n- Attention 헤드 개수 $h$가 8일 때 최적의 성능\n- Key/Value 차원 감소 시 성능 저하 확인\n- Positional Encoding 유무에 따른 성능 차이 미미하나 학습 외 시퀀스 확장에 필수적임.`
  },
  {
    key: 'limitations',
    title: '4. 한계점 (Limitations)',
    shortTitle: '한계점',
    iconName: 'AlertTriangle',
    description: '저자가 밝힌 한계 또는 실질적 적용 시의 한계',
    guideQuestions: [
      '저자가 명시적으로 언급한 한계점(Limitations)은 무엇인가?',
      '실제 환경 도입 시 예상되는 계산량, 메모리, 레이턴시 병목은?',
      '데이터 편향 또는 일반화 가능성의 제약은?'
    ],
    placeholder: `## 계산 복잡도 및 메모리 한계\n- Self-Attention의 시퀀스 길이 $n$에 대한 계산 및 메모리 복잡도가 $O(n^2)$이므로, 초장문 텍스트(수만 토큰) 처리에 구조적 한계 존재.\n\n## 연산 자원 요구량\n- 대규모 어휘 사전 및 임베딩 파라미터로 인해 메모리 점유율이 높음.\n\n## 검증 영역 한계\n- 본 연구는 기계 번역과 구문 분석에 집중되었으며, 비텍스트 멀티모달 도메인으로의 확장은 후속 연구로 남김.`
  },
  {
    key: 'myThoughts',
    title: '5. 내 생각 & 아이디어 (My Thoughts)',
    shortTitle: '내 생각 & 시사점',
    iconName: 'Lightbulb',
    description: '시사점, 비판적 검토, 내 연구 및 프로젝트 적용 방안',
    guideQuestions: [
      '이 논문을 읽고 얻은 가장 큰 인사이트(Takeaway)는 무엇인가?',
      '방법론 중 동의하기 어렵거나 의문이 드는 점은?',
      '내 현재 연구 주제나 실무 프로젝트에 어떻게 적용/변형할 수 있을까?'
    ],
    placeholder: `## 핵심 시사점 (Key Takeaways)\n- 순차적 처리(Recurrence)가 시퀀스 모델링의 필수 요소가 아님을 패러다임 전환으로 증명함.\n- Attention 가중치 시각화를 통해 모델의 해석 가능성(Interpretability)이 대폭 향상됨.\n\n## 내 연구 적용 아이디어\n- **현재 진행 중인 프로젝트 적용**: 시계열 센서 이상 감지 모델에서 LSTM 백본을 경량 Transformer 인코더로 교체해 볼 것.\n- $O(n^2)$ 병목을 해결하기 위해 최근 제안되는 Linear Attention이나 Sparse Attention 계열(FlashAttention)과 결합하는 아이디어 탐색 필요.`
  }
];
