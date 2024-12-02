export type IntentType = 
  | 'PRODUCT_SEARCH'
  | 'PRODUCT_QUERY'
  | 'GENERAL_QUERY'
  | 'COMPARISON'
  | 'CART_ACTION'
  | 'GREETING'
  | 'ERROR'
  | 'UNKNOWN';

export type ActionType =
  | 'SHOW_PRODUCTS'
  | 'SHOW_PRODUCT_DETAILS'
  | 'UPDATE_CART'
  | 'SHOW_CATEGORIES'
  | 'SHOW_COMPARISON'
  | 'UPDATE_UI';

export interface Intent {
  type: IntentType;
  confidence: number;
  entities?: Record<string, any>;
}

export interface Action {
  type: ActionType;
  parameters: Record<string, any>;
  priority: number;
}

export interface ImmediateResponse {
  message: string;
  tone: 'informative' | 'helpful' | 'apologetic' | 'enthusiastic';
  shouldBlock: boolean;
}

export interface ConversationContext {
  rememberedItems?: string[];
  followUpSuggestions?: string[];
}

export interface AIResponse {
  intent: Intent;
  actions: Action[];
  immediateResponse: ImmediateResponse;
  context: ConversationContext;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ConversationState {
  messages: Message[];
  context: ConversationContext;
}
