import { Book, AiChatMessage, WritingInsight } from '../types/book';
import { GeminiAiProvider } from './ai/GeminiAiProvider';

export const defaultAiProvider = new GeminiAiProvider();

export async function sendBookChatMessage(
  apiKey: string,
  book: Book,
  userMessage: string,
  chatHistory: AiChatMessage[],
  selectedQuote?: string
): Promise<string> {
  return defaultAiProvider.sendMessage(apiKey, book, userMessage, chatHistory, selectedQuote);
}

export async function extractWritingInsightFromDiscussion(
  apiKey: string,
  book: Book,
  contextText: string
): Promise<Partial<WritingInsight>> {
  return defaultAiProvider.extractWritingInsight(apiKey, book, contextText);
}
