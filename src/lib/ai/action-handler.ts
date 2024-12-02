import { Action, ActionType } from './types';
import { productService } from '@/services/fakeStoreApi';

type ActionHandler = (parameters: Record<string, any>) => Promise<void>;

export class ActionOrchestrator {
  private handlers: Map<ActionType, ActionHandler>;

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
      const filtered = await productService.getFilteredProducts({
        category,
        productType,
        search,
        features,
        priceRange
      });

      console.log('📦 Filtered products:', filtered);

      // Apply limit if specified
      const limitedResults = limit ? filtered.slice(0, limit) : filtered;

      // Here we'll need to integrate with the UI to actually show the products
      console.log('Showing filtered products:', limitedResults);
      return limitedResults;
    });

    this.handlers.set('SHOW_PRODUCT_DETAILS', async (parameters) => {
      const { productId } = parameters;
      const product = await productService.getProduct(productId);
      // Implementation for showing product details
      console.log('Showing product details:', product);
    });

    this.handlers.set('UPDATE_CART', async (parameters) => {
      const { action, productId, quantity } = parameters;
      // Implementation for cart updates
      console.log('Updating cart:', { action, productId, quantity });
    });

    // Add more handlers as needed
  }

  registerHandler(type: ActionType, handler: ActionHandler) {
    this.handlers.set(type, handler);
  }

  async executeAction(action: Action): Promise<void> {
    const handler = this.handlers.get(action.type);
    if (!handler) {
      console.warn(`No handler registered for action type: ${action.type}`);
      return;
    }

    try {
      await handler(action.parameters);
    } catch (error) {
      console.error(`Error executing action ${action.type}:`, error);
      throw error;
    }
  }

  async executeActions(actions: Action[]): Promise<void> {
    // Sort actions by priority
    const sortedActions = [...actions].sort((a, b) => a.priority - b.priority);

    for (const action of sortedActions) {
      await this.executeAction(action);
    }
  }
}

export const actionOrchestrator = new ActionOrchestrator();
