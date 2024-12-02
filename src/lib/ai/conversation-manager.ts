import { ConversationState, Message, AIResponse } from './types';
import { openAIService } from './openai-service';
import { actionOrchestrator } from './action-handler';

export class ConversationManager {
  private state: ConversationState;

  constructor() {
    this.state = {
      messages: [],
      context: {},
    };
  }

  private addMessage(message: Message) {
    this.state.messages.push(message);
    // Keep conversation history manageable
    if (this.state.messages.length > 10) {
      this.state.messages = this.state.messages.slice(-10);
    }
  }

  async processUserInput(userInput: string): Promise<AIResponse> {
    // Add user message to history
    this.addMessage({
      role: 'user',
      content: userInput,
    });

    // Get AI response
    const aiResponse = await openAIService.processMessage(this.state.messages);

    // Add AI response to history
    this.addMessage({
      role: 'assistant',
      content: aiResponse.immediateResponse.message,
    });

    // Update conversation context
    this.state.context = {
      ...this.state.context,
      ...aiResponse.context,
    };

    // Execute actions
    if (!aiResponse.immediateResponse.shouldBlock) {
      // Execute actions asynchronously if we don't need to wait
      actionOrchestrator.executeActions(aiResponse.actions).catch(console.error);
    } else {
      // Wait for actions to complete if needed
      await actionOrchestrator.executeActions(aiResponse.actions);
    }

    return aiResponse;
  }

  getConversationState(): ConversationState {
    return this.state;
  }

  clearConversation() {
    this.state = {
      messages: [],
      context: {},
    };
  }
}

export const conversationManager = new ConversationManager();
