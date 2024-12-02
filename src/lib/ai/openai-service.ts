import { AIResponse, Message } from './types';

export class OpenAIService {
  private model = process.env.OPENAI_MODEL || 'gpt-4o-mini';  // Fallback naar gpt-4o als env var niet bestaat

  async processMessage(messages: Message[]): Promise<AIResponse> {
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from chat API');
      }

      return await response.json();
    } catch (error) {
      console.error('Error processing message:', error);
      return this.getFallbackResponse();
    }
  }

  private getFallbackResponse(): AIResponse {
    return {
      intent: {
        type: 'UNKNOWN',
        confidence: 0,
      },
      actions: [],
      immediateResponse: {
        message: "Sorry, I'm having trouble processing your request. Could you please try again?",
        tone: 'apologetic',
        shouldBlock: false,
      },
      context: {},
    };
  }
}

export const openAIService = new OpenAIService();
