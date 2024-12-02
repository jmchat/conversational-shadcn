import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { Message } from '@/lib/ai/types';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  console.log('🚀 API route called');
  try {
    const { messages } = await request.json();
    console.log('📨 Received messages:', JSON.stringify(messages, null, 2));

    const openAIMessages = [
      { 
        role: 'system', 
        content: `You are an AI shopping assistant for an e-commerce website. Your role is to:
          1. Understand user queries and determine their intent
          2. When users ask about specific product types (e.g., "televisions", "laptops"), use the SHOW_PRODUCTS action with appropriate productType parameter
          3. Extract relevant product attributes and preferences from user queries
          4. Provide helpful, concise responses
          5. Remember context and maintain conversation flow
          
          Examples:
          - If user asks "show me televisions", set productType: "television" in SHOW_PRODUCTS action
          - If user asks about specific features, include them in the search parameters
          - Always try to narrow down product selection based on user's query
          
          The only topics that should be answered are E-commerce related questions. 
          If the user asks about anything else, respond with "I'm sorry, I don't have an answer for that, but I can help you with questions related to this shopping website or our company."
          
          Topics:
          - Product search
          - Product query
          - Product advise
          - Return policy
          - Payment methods
          - Comparison between products`
      },
      ...messages
    ];
    console.log('📝 Prepared OpenAI messages:', JSON.stringify(openAIMessages, null, 2));

    const openAIConfig = {
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',  // Fallback naar gpt-4o-mini als env var niet bestaat
      messages: openAIMessages,
      functions: [{
        name: 'process_user_input',
        description: 'Process user input and determine intent, actions, and response',
        parameters: {
          type: 'object',
          properties: {
            intent: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['PRODUCT_SEARCH', 'PRODUCT_QUERY', 'GENERAL_QUERY', 'COMPARISON', 'CART_ACTION', 'GREETING', 'UNKNOWN'],
                },
                confidence: {
                  type: 'number',
                  minimum: 0,
                  maximum: 1,
                },
                entities: {
                  type: 'object',
                  properties: {
                    productType: { type: 'string' },
                    category: { type: 'string' },
                    features: { 
                      type: 'array',
                      items: { type: 'string' }
                    },
                    priceRange: {
                      type: 'object',
                      properties: {
                        min: { type: 'number' },
                        max: { type: 'number' }
                      }
                    }
                  },
                  additionalProperties: true
                },
              },
              required: ['type', 'confidence'],
            },
            actions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  type: {
                    type: 'string',
                    enum: [
                      'NO_ACTION',
                      'SHOW_PRODUCTS',
                      'SHOW_PRODUCT_DETAILS',
                      'UPDATE_CART',
                      'SHOW_CATEGORIES',
                      'SHOW_COMPARISON',
                      'UPDATE_UI'
                    ],
                  },
                  parameters: {
                    type: 'object',
                    additionalProperties: true,
                  },
                  priority: {
                    type: 'number',
                    minimum: 1,
                  },
                },
                required: ['type', 'parameters', 'priority'],
              },
            },
            immediateResponse: {
              type: 'object',
              properties: {
                message: {
                  type: 'string',
                },
                tone: {
                  type: 'string',
                  enum: ['informative', 'helpful', 'apologetic', 'enthusiastic'],
                },
                shouldBlock: {
                  type: 'boolean',
                },
              },
              required: ['message', 'tone', 'shouldBlock'],
            },
            context: {
              type: 'object',
              properties: {
                rememberedItems: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
                followUpSuggestions: {
                  type: 'array',
                  items: {
                    type: 'string',
                  },
                },
              },
            },
          },
          required: ['intent', 'actions', 'immediateResponse', 'context'],
        },
      }],
      function_call: { name: 'process_user_input' },
    };

    console.log('🔄 OpenAI API Call Configuration:', JSON.stringify(openAIConfig, null, 2));
    console.log('🔄 Calling OpenAI API...');
    
    const response = await openai.chat.completions.create(openAIConfig);
    console.log('🤖 OpenAI Response:', JSON.stringify(response, null, 2));

    const functionCall = response.choices[0].message.function_call;
    if (!functionCall) {
      throw new Error('No function call in response');
    }

    const result = JSON.parse(functionCall.arguments);
    
    // Merge intent entities into action parameters for SHOW_PRODUCTS
    if (result.actions && result.actions.length > 0) {
      result.actions = result.actions.map((action: any) => {
        if (action.type === 'SHOW_PRODUCTS' && result.intent.entities) {
          return {
            ...action,
            parameters: {
              ...action.parameters,
              ...result.intent.entities
            }
          };
        }
        return action;
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('❌ Error in chat API:', error);
    return NextResponse.json(
      {
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
      },
      { status: 500 }
    );
  }
}
