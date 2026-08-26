import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { messages, bookContext, userApiKey, userName = '독서가' } = await req.json();

    const apiKey = userApiKey || process.env.GEMINI_API_KEY;

    // 1. If API Key is available, call Gemini
    if (apiKey) {
      const genAI = new GoogleGenerativeAI(apiKey);
      
      const systemInstruction = `
너는 '1인 1도서관 프로젝트'의 전속 1:1 독서 코치 '루카(Luca)'이다.
대화 상대인 독서가의 이름은 '${userName}'이다.

[도서 컨텍스트]
- 제목: ${bookContext?.title || '미지정도서'}
- 저자: ${bookContext?.author || '미상'}
- 줄거리 및 내용: ${bookContext?.summary || '도서 정보 참조'}

[역할 및 태도 가이드라인]
1. 단순한 앵무새가 아니라 책의 핵심 사건, 등장인물의 내면 갈등, 복선, 철학적 주제를 꿰뚫고 있는 지적이고 따뜻한 독서 멘토 역할을 수행하라.
2. 독서가의 생각과 질문을 적극적으로 칭찬하고 경청하며, "만약 나라면?", "왜 그 인물은 그런 선택을 했을까?"와 같은 깊은 생각 확장 질문(티키타카)을 자연스럽게 건네라.
3. 친근하면서도 다정한 어투('~했어', '~해보자!', '~인 것 같아')를 사용하라.
4. 문학적 감수성과 지적 호기심을 한껏 북돋아주어 독서가가 책의 깊은 울림을 깨닫도록 도와라.
`;

      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction,
      });

      const contents = messages.map((m: any) => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: m.content }]
      }));

      const result = await model.generateContent({
        contents,
      });

      const responseText = result.response.text();

      return NextResponse.json({
        reply: responseText || '이야기를 나누는 중에 잠시 생각이 깊어졌어. 다시 한 번 물어봐줘! ✨',
        isSimulated: false,
      });
    }

    // 2. Smart Simulation Fallback (If no API key yet)
    const latestUserMsg = messages[messages.length - 1]?.content || '';
    const bookTitle = bookContext?.title || '이 책';

    let simulatedReply = '';
    if (latestUserMsg.includes('심리') || latestUserMsg.includes('마음') || latestUserMsg.includes('선택')) {
      simulatedReply = `정말 예리한 관찰이야, ${userName}! 💡 《${bookTitle}》에서 주인공의 그 선택은 겉보기엔 무모해 보였을지 몰라도, 마음 깊은 곳의 상처와 진정한 용기가 충돌하던 결정적인 순간이었어. 너라면 그 상황에서 어떤 선택을 내렸을 것 같니?`;
    } else if (latestUserMsg.includes('교훈') || latestUserMsg.includes('의미') || latestUserMsg.includes('주제')) {
      simulatedReply = `《${bookTitle}》이 우리에게 주는 가장 큰 울림은 "진정한 성장은 홀로 서는 것이 아니라, 서로의 약점을 품어줄 때 비로소 완성된다"는 점이야. 책을 읽으면서 너에게 가장 따뜻하게 와닿았던 문장이나 장면은 무엇이었어? ✨`;
    } else if (latestUserMsg.includes('만약') || latestUserMsg.includes('나라면')) {
      simulatedReply = `우와, ${userName}의 그 상상력은 정말 흥미진진하다! 🌟 주인공이 그 길을 택했다면 이야기의 결말이 완전히 달라졌을지도 몰라. 그 인물도 네가 내민 따뜻한 손길을 바랐을 거야.`;
    } else {
      simulatedReply = `좋은 질문이야, ${userName}! 📖 《${bookTitle}》의 그 장면은 인물들의 숨겨진 진심이 드러나는 아주 중요한 대목이야. 이 책을 읽으면서 네 마음에 가장 깊은 파도를 일으킨 부분에 대해 더 자세히 이야기해줄래?`;
    }

    return NextResponse.json({
      reply: simulatedReply,
      isSimulated: true,
    });

  } catch (error: any) {
    console.error('AI Chat Error:', error);
    return NextResponse.json({
      reply: '통신 중에 잠시 지연이 발생했어. 다시 한 번 질문해줘! ✨',
      isSimulated: true,
    });
  }
}
