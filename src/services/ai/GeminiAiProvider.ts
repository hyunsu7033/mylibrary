import { Book, AiChatMessage, WritingInsight } from '../../types/book';
import { IAiDiscussionProvider } from './types';

const GEMINI_API_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

/**
 * Google Gemini 2.5 Flash 기반 AI 프로바이더 구현체
 */
export class GeminiAiProvider implements IAiDiscussionProvider {
  readonly providerName = 'Google Gemini 2.5 Flash';

  async sendMessage(
    apiKey: string,
    book: Book,
    userMessage: string,
    chatHistory: AiChatMessage[],
    selectedQuote?: string
  ): Promise<string> {
    if (!apiKey) {
      throw new Error('Gemini API 키가 설정되지 않았습니다. [설정]에서 API 키를 입력해주세요.');
    }

    const notesContext = (book.notes || [])
      .map(
        (n) =>
          `[메모 ${n.page ? n.page + 'p' : ''}] 인용: "${n.quote || '없음'}" / 생각: "${n.thought}" ${
            n.latex ? '/ 수식: ' + n.latex : ''
          }`
      )
      .join('\n');

    const insightsContext = (book.writingInsights || [])
      .map((i) => `[집필아이디어] ${i.title}: ${i.concept} (내적용: ${i.myApplication})`)
      .join('\n');

    const systemInstruction = `당신은 최고 수준의 학술 연구 파트너이자 저술 조력자(Scholar AI & Co-Author)입니다.
현재 사용자는 다음 책을 읽으며 심층적인 독서 기록을 남기고, 향후 자신이 직접 학술/전문 서적을 집필하기 위한 영감과 레퍼런스를 정리하고 있습니다.

[도서 정보]
- 제목: ${book.title}
- 저자: ${book.author}
- 분야/카테고리: ${book.category}
- 책 소개: ${book.description}

[독자가 남긴 메모 및 관찰]
${notesContext || '아직 기록된 메모가 없습니다.'}

[현재까지 축적된 집필 아이디어]
${insightsContext || '없음'}

[핵심 지침]
1. 수학·공학·과학 개념에 대해 깊이 있는 논리, 직관적 해석, 그리고 엄밀한 수식 증명을 제시하세요.
2. 모든 수식은 반드시 LaTeX 문법으로 작성하세요.
   - 인라인 수식은 \`$수식$\` 형식 (예: \`$E = mc^2$\`, \`$\\nabla \\times \\mathbf{B} = \\mu_0 \\mathbf{J}$\`)
   - 블록 수식은 \`$$수식$$\` 형식 (예: \`$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$\`)
3. 단순 요약을 넘어, 질문자의 질문에 대해:
   - 본서의 핵심 주장과 논리적 근거
   - 수학적/공학적 모델링과의 연결고리
   - 질문자가 '자신의 책을 쓸 때' 독창적으로 인용하거나 확장할 수 있는 관점(Author's Perspective)을 제안하세요.
4. 명확하고 격조 높은 학술적 한국어로 답변하세요.`;

    const contents: any[] = [];
    contents.push({
      role: 'user',
      parts: [{ text: `[도서 컨텍스트 및 역할 지침]\n${systemInstruction}\n\n이제 대화를 시작합니다.` }],
    });
    contents.push({
      role: 'model',
      parts: [
        {
          text: `이해했습니다. 《${book.title}》의 내용을 바탕으로 수학적 엄밀함과 창의적인 집필 관점을 결합하여 심층적인 토론을 진행하겠습니다.`,
        },
      ],
    });

    const recentHistory = (chatHistory || []).slice(-6);
    for (const msg of recentHistory) {
      contents.push({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      });
    }

    let currentPrompt = userMessage;
    if (selectedQuote) {
      currentPrompt = `[참고 인용 구절]: "${selectedQuote}"\n\n[질문/논점]: ${userMessage}`;
    }

    contents.push({
      role: 'user',
      parts: [{ text: currentPrompt }],
    });

    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `API 요청 실패 (Status: ${response.status})`);
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!replyText) {
      throw new Error('응답을 생성하지 못했습니다.');
    }

    return replyText;
  }

  async extractWritingInsight(
    apiKey: string,
    book: Book,
    contextText: string
  ): Promise<Partial<WritingInsight>> {
    if (!apiKey) {
      throw new Error('Gemini API 키가 필요합니다.');
    }

    const prompt = `당신은 전문 서적 기획자입니다.
다음은 도서 《${book.title}》과 관련된 독서 대화 또는 메모 내용입니다:

"""
${contextText}
"""

위 내용에서 저자가 향후 자신의 책을 집필할 때 활용할 수 있는 핵심 인사이트를 추출하여 반드시 아래 JSON 형식으로만 응답하세요:
{
  "title": "간결하고 명확한 소제목",
  "concept": "핵심 학술/공학 개념 (1~2문장)",
  "summary": "개념 요약 및 의미 (2~3문장)",
  "latexFormula": "관련 LaTeX 수식 (없으면 빈 문자열, 예: \\\\nabla \\\\cdot \\\\mathbf{E} = \\\\frac{\\\\rho}{\\\\varepsilon_0})",
  "myApplication": "내가 쓸 책에 어떻게 적용할 것인가? (집필 아이디어)",
  "tags": ["태그1", "태그2"]
}`;

    const response = await fetch(`${GEMINI_API_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      throw new Error('인사이트 생성 요청 실패');
    }

    const data = await response.json();
    const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
    try {
      return JSON.parse(rawJson);
    } catch (err) {
      return {
        title: '새로운 집필 아이디어',
        concept: '책 내용 기반 인사이트',
        summary: contextText.slice(0, 150),
        myApplication: '집필 도서 챕터에 활용',
        tags: ['독서인사이트'],
      };
    }
  }
}
