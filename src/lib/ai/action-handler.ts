import { Action, ActionType } from './types';
import { productService } from '@/services/fakeStoreApi';
import { Product } from '@/types/product';

type ActionHandler<T = void> = (parameters: Record<string, any>) => Promise<T>;

export class ActionOrchestrator {
  private handlers: Map<ActionType, ActionHandler<any>>;

  constructor() {
    this.handlers = new Map();
    this.registerDefaultHandlers();
  }

  private registerDefaultHandlers() {
    this.handlers.set('SHOW_PRODUCTS', async (parameters) => {
      console.log('🔍 SHOW_PRODUCTS parameters:', parameters);
      const { category, limit, search, productType, features, priceRange } = parameters;
      
      // Use the new filtered products method
      console.log('🎯 Filtering with productType:', productType);
      return await productService.getFilteredProducts({
        category,
        limit,
        search,
        productType,
        features,
        priceRange
      });
    });

    this.handlers.set('SHOW_PRODUCT_DETAILS', async (parameters) => {
      const { productId } = parameters;
      return await productService.getProduct(productId);
    });

    this.handlers.set('UPDATE_CART', async (parameters) => {
      const { action, productId, quantity } = parameters;
      // Implementation for cart updates
      console.log('Updating cart:', { action, productId, quantity });
    });

    // Add more handlers as needed
  }

  registerHandler(type: ActionType, handler: ActionHandler<any>) {
    this.handlers.set(type, handler);
  }

  public async executeActions(actions: Action[]): Promise<void> {
    // Sort actions by priority if needed
    const sortedActions = [...actions].sort((a, b) => 
      (a.priority || 0) - (b.priority || 0)
    );

    // Execute actions in sequence
    for (const action of sortedActions) {
      try {
        await this.handleAction(action);
      } catch (error) {
        console.error(`Error executing action ${action.type}:`, error);
        throw error;
      }
    }
  }

  public async handleAction(action: Action): Promise<any> {
    const handler = this.handlers.get(action.type);
    if (!handler) {
      throw new Error(`No handler registered for action type: ${action.type}`);
    }
    return await handler(action.parameters || {});
  }
}

export const actionOrchestrator = new ActionOrchestrator();
