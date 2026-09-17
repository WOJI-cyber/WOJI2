import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

const app = express();
const PORT = 3000;

// Increase payload limit for PDF base64 handling
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));

// Lazy init for Gemini
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn("GEMINI_API_KEY is not set in environment.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// AI Paper Analysis & Abstract Summarization endpoint
app.post(["/api/analyze-paper", "/api/summarize-abstract"], async (req, res) => {
  try {
    const { text, pdfBase64, mode = "full" } = req.body;

    if (!text && !pdfBase64) {
      return res.status(400).json({ error: "논문 텍스트 또는 PDF 데이터를 입력해주세요." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "AI 서비스 연동 키(GEMINI_API_KEY)가 설정되지 않았습니다. 수동으로 템플릿을 작성하거나 API 키를 설정해주세요."
      });
    }

    const systemInstruction = `당신은 연구자와 대학원생을 위한 세계 최고 수준의 학술 논문 분석 보조 전문가(Academic Paper Research Assistant)입니다.
건강, 공중보건, 의료전달체계, 보건의료정책, 건강보험, 임상의학, 사회과학, 디지털 헬스케어 및 과학기술 전반의 학술 논문 초록 또는 전문을 정밀하게 분석하여, PaperNote 서비스의 핵심 구조화 스키마에 맞춰 JSON 형식으로 추출 및 요약하세요.

[매우 중요한 원칙]:
1. '논문 저자가 직접 밝힌 한계(authorLimitations)'와 'AI가 추가적으로 분석한 한계(aiLimitations)'를 반드시 엄격하게 분리하여 작성해야 합니다.
2. 저자가 명시하지 않은 한계를 저자의 주장인 것처럼 기술하지 말고, 방법론적 비판·잠재 교란변수·외적 타당도 제약 등 AI의 추론은 반드시 'aiLimitations'에만 기재하세요.
3. 'oneLineSummary'는 논문의 핵심 목적, 방법, 결과를 관통하는 명쾌하고 임팩트 있는 1문장 요약(한국어)입니다.

반드시 다음 JSON 스키마를 엄격히 준수하여 순수한 JSON 객체만 반환하세요:
{
  "title": "논문 제목 (원문 및 한국어 번역 병기)",
  "authors": "저자 목록 (예: 김수경, 이태진 등)",
  "venue": "게재 학회 또는 저널 (예: 보건행정학회지, Lancet, NEJM 등)",
  "year": "출판 또는 발표 연도 (예: 2024)",
  "doi": "DOI 또는 원문 URL",
  "category": "연구 분야 (예: 보건의료정책, 공중보건, 디지털헬스케어, 임상의학 등)",
  "origin": "domestic" 또는 "international",
  "isOpenAccess": true 또는 false,
  "studyType": "연구 유형 (예: 양적 연구, 질적 연구, 체계적 문헌고찰/메타분석, 정책/실증평가, 혼합 연구)",
  "abstractSummary": "초록의 핵심 요약문 (3~4문장의 명쾌한 요약)",
  "keywords": ["핵심키워드1", "핵심키워드2", "핵심키워드3", "핵심키워드4", "핵심키워드5"],
  "tags": ["핵심키워드1", "핵심키워드2", "핵심키워드3", "핵심키워드4", "핵심키워드5"],
  
  "structuredAnalysis": {
    "oneLineSummary": "연구 목적-방법-결과를 한 줄로 관통하는 핵심 요약",
    "researchBackground": "연구가 태동하게 된 정책적·학술적 배경 및 문제의식",
    "researchObjective": "연구의 최종 목적 및 해결하고자 하는 과제",
    "researchQuestions": "연구 질문 또는 핵심 연구 가설",
    "studyTarget": "연구 대상 집단 (예: 고혈압·당뇨병 외래 환자, 65세 이상 독거노인)",
    "sampleSize": "표본 수 및 데이터 기간 (예: N=358,410명, 2019-2022년)",
    "researchDesign": "연구 설계 (예: 후향적 코호트 연구, 준실험 설계, 무작위대조시험, 횡단적 설문)",
    "researchMethod": "연구 방법 및 계량 분석 기법 (예: 이중차분법(DID), 성향점수매칭(PSM), 다층 다중회귀분석)",
    "variables": {
      "independent": "독립변수 (예: 일차의료 만성질환관리 시범사업 참여 여부)",
      "dependent": "종속변수 (예: 약물 복약순응도(PDC), 급성 합병증 입원율, 1인당 연간 진료비)",
      "mediatorsOrModerators": "조절 또는 매개 변수 (예: 환자 교육 횟수, 케어플랜 수립 여부)",
      "control": "주요 통제변수 (예: 연령, 성별, 소득분위, 찰슨동반질환지수(CCI))"
    },
    "mainFindings": "정량적 수치와 함께 정리된 핵심 연구 결과",
    "authorConclusion": "연구자가 도달한 핵심 결론",
    "authorLimitations": "논문 본문에서 저자가 직접 명시한 한계 (데이터 한계, 추적 관찰 기간 등)",
    "aiLimitations": "[AI 심층 비판적 분석] 원문에 기재되지 않았으나 AI가 방법론, 통계 모형, 교란변수 통제 및 일반화 가능성 관점에서 도출한 한계점",
    "practicalImplications": "보건의료 현장, 임상, 국가 정책 담당자에게 주는 실무적 시사점",
    "futureResearchSuggestions": "본 연구를 디딤돌 삼아 진행할 수 있는 후속 연구 제안"
  },

  "objective": "## 연구 배경 및 해결하려는 문제\\n- 연구 배경\\n- 선행 연구의 한계\\n- 본 연구의 목표 및 가설",
  "methodology": "## 연구 방법 및 분석 설계\\n- 데이터 및 표본\\n- 분석 모형\\n- 변수 설정",
  "results": "## 주요 연구 결과 및 발견\\n- 주요 가설 검증 결과\\n- 정량적 효과 및 통계치",
  "limitations": "## 연구의 한계점\\n- 저자가 밝힌 한계\\n- AI 추가 분석 한계",
  "myThoughts": "## 시사점 및 후속 연구 아이디어\\n- 정책/임상 실무 시사점\\n- 차기 연구 주제 제안"
}`;

    let response;
    if (pdfBase64) {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                inlineData: {
                  mimeType: "application/pdf",
                  data: pdfBase64,
                },
              },
              {
                text: `${systemInstruction}\n\n위 첨부된 논문 PDF를 분석하여 JSON 형식으로 결과를 출력해주세요.`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });
    } else {
      response = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `${systemInstruction}\n\n[입력된 논문 텍스트/초록]:\n${text}\n\n위 내용을 분석하여 JSON 형식으로 출력해주세요.`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
        },
      });
    }

    const responseText = response.text || "{}";
    try {
      const parsed = JSON.parse(responseText);
      return res.json({ success: true, data: parsed });
    } catch (parseErr) {
      console.error("Failed to parse Gemini JSON:", parseErr, responseText);
      // Fallback regex matching if markdown code fences were added
      const jsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        const cleaned = JSON.parse(jsonMatch[1]);
        return res.json({ success: true, data: cleaned });
      }
      return res.status(500).json({ error: "AI 응답을 JSON으로 파싱하는데 실패했습니다." });
    }
  } catch (err: any) {
    console.error("Error in /api/analyze-paper:", err);
    return res.status(500).json({
      error: err?.message || "논문 분석 중 오류가 발생했습니다."
    });
  }
});

// In-editor section AI assistant (Phase 3 refinement feature)
app.post("/api/ai-assist", async (req, res) => {
  try {
    const { sectionTitle, paperTitle, paperContext, currentContent, prompt } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY가 설정되지 않았습니다."
      });
    }

    const promptText = `당신은 학술 연구 논문 리뷰 작성을 돕는 전문 연구 멘토입니다.
논문 제목: "${paperTitle || '미상'}"
작성 중인 템플릿 섹션: "${sectionTitle}"
논문 관련 문맥 정보: ${paperContext || '없음'}
현재 작성된 내용:
${currentContent || '(아직 작성되지 않음)'}

사용자 요청:
${prompt || '이 섹션의 내용을 논문 리뷰 가이드라인에 맞게 체계적이고 깊이 있는 Markdown 형식으로 초안을 작성하거나 보완해주세요.'}

요구사항:
- 가독성이 좋은 Markdown 형식(글머리 기호, 굵은 글씨 등)으로 작성하세요.
- 불필요한 서론/결론 인사말 없이, 해당 섹션의 본문 내용만 깔끔하게 출력하세요.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptText,
    });

    return res.json({
      success: true,
      result: response.text || "",
    });
  } catch (err: any) {
    console.error("Error in /api/ai-assist:", err);
    return res.status(500).json({ error: err?.message || "AI 보조 생성 중 오류가 발생했습니다." });
  }
});

// 6. Multi-Paper Comparison Synthesis Endpoint
app.post("/api/compare-papers", async (req, res) => {
  try {
    const { papers } = req.body;
    if (!Array.isArray(papers) || papers.length < 2) {
      return res.status(400).json({ error: "비교를 위해 최소 2편 이상의 논문을 선택해주세요." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: "GEMINI_API_KEY가 설정되지 않았습니다." });
    }

    const papersSummaryText = papers.map((p, idx) => {
      const s = p.structuredAnalysis || {};
      return `[논문 ${idx + 1}]
- 제목: ${p.title}
- 저자 및 연도: ${p.authors} (${p.year})
- 저널/출처: ${p.venue}
- 연구 목적: ${s.researchObjective || p.objective || '미상'}
- 연구 대상/표본: ${s.studyTarget || '미상'} / ${s.sampleSize || '미상'}
- 연구 설계 및 방법: ${s.researchDesign || '미상'} / ${s.researchMethod || p.methodology || '미상'}
- 독립/종속 변수: 독립(${s.variables?.independent || '미상'}), 종속(${s.variables?.dependent || '미상'})
- 주요 결과: ${s.mainFindings || p.results || '미상'}
- 저자 명시 한계: ${s.authorLimitations || p.limitations || '미상'}
- AI 분석 한계: ${s.aiLimitations || '미상'}`;
    }).join("\n\n");

    const prompt = `당신은 메타분석 및 체계적 문헌고찰에 정통한 시니어 연구방법론 교수입니다.
다음 ${papers.length}편의 학술 논문 데이터를 정밀 비교 대조하여, 아래 항목을 순수한 JSON 형식으로 작성해주세요:

1. commonFindings: 논문들의 공통된 연구 결과 (3~4개 문자열 배열)
2. divergentFindings: 연구 결과가 서로 다른 부분 또는 효과 크기/방향의 이견 (2~4개 문자열 배열)
3. methodologicalDifferences: 연구 설계, 표본 추출, 통계 분석 기법 간의 핵심 차이점 (2~4개 문자열 배열)
4. commonLimitations: 기존 연구들이 공통적으로 지닌 한계점 (자료원, 종단 추적, 일반화 등) (2~4개 문자열 배열)
5. unexploredAreas: 논문들을 종합했을 때 아직 충분히 연구되지 않은 미개척 영역 (2~4개 문자열 배열)

반드시 다음 JSON 규격으로만 출력하세요:
{
  "commonFindings": ["..."],
  "divergentFindings": ["..."],
  "methodologicalDifferences": ["..."],
  "commonLimitations": ["..."],
  "unexploredAreas": ["..."]
}

[비교할 논문 데이터]:
${papersSummaryText}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error("Error in /api/compare-papers:", err);
    return res.status(500).json({ error: err?.message || "논문 비교 분석 중 오류가 발생했습니다." });
  }
});

// 7. Research Gap Discovery Endpoint
app.post("/api/analyze-research-gap", async (req, res) => {
  try {
    const { papers, projectContext } = req.body;
    if (!Array.isArray(papers) || papers.length === 0) {
      return res.status(400).json({ error: "Research Gap을 도출할 논문을 1편 이상 전달해주세요." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: "GEMINI_API_KEY가 설정되지 않았습니다." });
    }

    const papersSummaryText = papers.map((p, idx) => {
      const s = p.structuredAnalysis || {};
      return `[논문 ${idx + 1}: ID=${p.id}]
- 제목: ${p.title}
- 저자/출판연도: ${p.authors} (${p.year})
- 분야/학술지: ${p.category} / ${p.venue}
- 대상 및 표본: ${s.studyTarget || '미상'} (${s.sampleSize || '미상'})
- 연구 설계 및 방법: ${s.researchDesign || '미상'}, ${s.researchMethod || p.methodology || '미상'}
- 주요 변수: 독립(${s.variables?.independent || '미상'}), 종속(${s.variables?.dependent || '미상'}), 매개/조절(${s.variables?.mediatorsOrModerators || '없음'})
- 주요 발견: ${s.mainFindings || p.results || '미상'}
- 저자 한계: ${s.authorLimitations || p.limitations || '미상'}
- AI 분석 한계: ${s.aiLimitations || '미상'}`;
    }).join("\n\n");

    const prompt = `당신은 혁신적인 박사학위 논문 주제 및 국가 R&D 연구 과제를 기획하는 연구 디렉터입니다.
제공된 선행 연구 논문군을 바탕으로 연구 공백(Research Gap)을 철저히 발굴하세요.

반드시 다음 6개 관점(Category)을 고루 탐색하여 4~6개의 Research Gap 항목을 도출하세요:
1. "subject" (연구 대상의 공백): 특정 연령층, 취약계층, 성별, 복합질환군 등의 배제
2. "region" (연구 지역의 공백): 대도시 중심 연구로 인한 농어촌/지방 소외, 특정 의료전달체계의 한계
3. "variable" (연구 변수의 공백): 심리사회적 요인, 디지털 리터러시, 의료진과의 상호작용 등 미고려 변수
4. "method" (연구 방법의 공백): 단면 연구 위주로 인한 인과성 부족, 질적 연구 부재, 기계학습/혼합방법론 미적용
5. "period" (연구 기간의 공백): 단기 효과만 관찰되고 3~5년 이상 장기 추적 또는 정책 변경 이후 데이터 부재
6. "contradiction" (기존 연구 결과의 불일치): 선행 연구들 간에 효과 크기나 방향성이 상충되어 추가 규명이 필요한 영역

각 Research Gap마다 판단의 근거가 된 논문의 제목(groundedPaperTitles)과 논문 ID(groundedPaperIds)를 반드시 매핑하세요.

출력 JSON 형식:
{
  "gaps": [
    {
      "id": "gap-1",
      "category": "subject | region | variable | method | period | contradiction",
      "categoryLabel": "연구 대상의 공백",
      "title": "공백의 핵심 제목",
      "description": "구체적인 공백 설명 및 왜 이것이 중요한 학술적 문제인지 설명",
      "groundedPaperIds": ["paper-1", ...],
      "groundedPaperTitles": ["논문 제목 ..."],
      "severity": "high | medium | opportunity"
    }
  ]
}

[프로젝트 컨텍스트]: ${projectContext || '보건의료 및 사회정책 연구'}
[분석할 논문 목록]:
${papersSummaryText}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: parsed.gaps || [] });
  } catch (err: any) {
    console.error("Error in /api/analyze-research-gap:", err);
    return res.status(500).json({ error: err?.message || "Research Gap 분석 중 오류가 발생했습니다." });
  }
});

// 8. Research Topic Recommendation Endpoint
app.post("/api/generate-research-topics", async (req, res) => {
  try {
    const { gaps, papers, projectContext } = req.body;
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: "GEMINI_API_KEY가 설정되지 않았습니다." });
    }

    const gapsContext = Array.isArray(gaps) && gaps.length > 0
      ? gaps.map((g: any, i: number) => `[Gap ${i + 1}] (${g.categoryLabel}) ${g.title}: ${g.description}`).join("\n")
      : "제시된 선행 논문들의 한계 및 미개척 영역 전반";

    const papersContext = Array.isArray(papers)
      ? papers.map((p: any) => `- ${p.title} (${p.authors}, ${p.year})`).join("\n")
      : "선행 연구 문헌군";

    const prompt = `당신은 정상급 학술지(SSCI, SCIE, KCI 우수등재지) 게재를 목표로 하는 신진 연구자들을 지도하는 학술 멘토입니다.
위에서 식별된 Research Gap(연구 공백)과 선행 연구들을 토대로, **즉시 학위논문이나 연구비 수주 계획서로 발전시킬 수 있는 3~5개의 정밀하고 독창적인 연구주제**를 제안해주세요.

각 연구주제마다 다음 항목을 빠짐없이 채워 순수 JSON으로 응답하세요:
{
  "topics": [
    {
      "id": "topic-1",
      "title": "연구 제목 예시 (학술 논문 형식의 완성된 국문 제목)",
      "researchQuestion": "핵심 연구 질문 (예: ~가 ~에 미치는 영향에서 ~의 매개효과는 어떠한가?)",
      "necessity": "연구의 필요성 및 학술적/사회적 배경",
      "studyTarget": "구체적인 연구 대상 (모집단 및 표본 설정)",
      "independentVariable": "독립변수 (예: 일차의료 만성질환관리 지속 참여도)",
      "dependentVariable": "종속변수 (예: 5개년 건강수명 및 회피가능 입원율)",
      "mediatorOrModerator": "가능한 조절 또는 매개 변수 (예: 디지털 헬스케어 활용 역량, 환자-의사 라포)",
      "recommendedMethod": "추천 연구방법 및 통계 기법 (예: 건보공단 맞춤형 코호트 이중차분법, 구조방정식 모형)",
      "noveltyAndDifference": "기존 선행 논문들과의 결정적 차별점 (어떤 Gap을 어떻게 메우는지)",
      "basedOnGaps": ["참고한 Research Gap 제목들"]
    }
  ]
}

[프로젝트 배경/주제]: ${projectContext || '지역사회 보건의료 및 헬스케어 정책 연구'}
[식별된 Research Gap]:
${gapsContext}

[선행 논문군]:
${papersContext}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: parsed.topics || [] });
  } catch (err: any) {
    console.error("Error in /api/generate-research-topics:", err);
    return res.status(500).json({ error: err?.message || "연구주제 추천 중 오류가 발생했습니다." });
  }
});

// Quick DOI / Academic URL Resolver
app.post("/api/resolve-doi", async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier || typeof identifier !== 'string') {
      return res.status(400).json({ error: "DOI 또는 논문 URL을 입력해주세요." });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({ error: "GEMINI_API_KEY가 설정되지 않았습니다." });
    }

    const prompt = `당신은 학술 메타데이터 분석기입니다.
사용자가 입력한 DOI 또는 학술 URL/텍스트 식별자: "${identifier.trim()}"

이 식별자에 해당하는 논문의 메타데이터와 개요를 추론 또는 분석하여 다음 JSON 스키마로 반환하세요:
{
  "title": "논문 제목",
  "authors": "저자 목록",
  "venue": "학술지 또는 학회",
  "year": "출판연도 (숫자)",
  "doi": "${identifier.trim()}",
  "category": "보건의료정책 등 학술 분야",
  "origin": "domestic 또는 international",
  "studyType": "양적 연구 / 질적 연구 등",
  "abstractSummary": "논문의 핵심 내용 요약 (2~3문장)"
}

만약 정확한 학술 논문 정보를 알 수 없다면 입력된 정보에서 최선의 논문 메타데이터 초안을 구성하여 반환하세요.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    const parsed = JSON.parse(response.text || "{}");
    return res.json({ success: true, data: parsed });
  } catch (err: any) {
    console.error("Error in /api/resolve-doi:", err);
    return res.status(500).json({ error: err?.message || "DOI 식별 처리 중 오류가 발생했습니다." });
  }
});

// Vite middleware / Static server
async function start() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PaperNote server running on http://localhost:${PORT}`);
  });
}

start();
