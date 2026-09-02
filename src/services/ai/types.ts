import { Book, AiChatMessage, WritingInsight } from '../../types/book';

/**
 * OCP & DIP 준수: AI 토론 및 인사이트 추출 프로바이더 인터페이스
 */
export interface IAiDiscussionProvider {
  readonly providerName: string;

  sendMessage(
    apiKey: string,
    book: Book,
    userMessage: string,
    chatHistory: AiChatMessage[],
    selectedQuote?: string
  ): Promise<string>;

  extractWritingInsight(
    apiKey: string,
    book: Book,
    contextText: string
  ): Promise<Partial<WritingInsight>>;
}
