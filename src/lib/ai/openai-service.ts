import { AIResponse, Message } from './types';

const RATE_LIMIT_RETRY_DELAY = 60 * 1000; // 1 minute delay
const MAX_RETRIES = 3;

async function withRateLimitRetry<T>(operation: () => Promise<T>): Promise<T> {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      if (error?.message?.includes('rate limit') && attempt < MAX_RETRIES) {
        console.log(`Rate limit hit, attempt ${attempt}/${MAX_RETRIES}. Waiting ${RATE_LIMIT_RETRY_DELAY/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_RETRY_DELAY));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max retries exceeded for rate limit');
}

export class OpenAIService {
  private model = process.env.OPENAI_MODEL || 'gpt-4';  // Fallback naar gpt-4 als env var niet bestaat

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
        const errorData = await response.json();
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please try again in a minute.');
        }
        throw new Error(errorData.error || 'Failed to get response from chat API');
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
        type: 'ERROR',
        confidence: 1,
      },
      actions: [],
      immediateResponse: {
        message: "I apologize, but I'm having trouble processing your request right now. Please try again in a moment.",
        tone: 'apologetic',
        shouldBlock: false,
      },
      context: {},
    };
  }
}

export const openAIService = new OpenAIService();
