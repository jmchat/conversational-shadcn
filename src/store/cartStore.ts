import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Cart, CartStore } from '@/types/cart';
import { Product } from '@/types/product';

const initialCart: Cart = {
  items: [],
  total: 0,
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: initialCart,
      itemCount: 0,
      isOpen: false,

      setIsOpen: (open: boolean) => set({ isOpen: open }),

      addItem: (product: Product, quantity: number = 1) => {
        const { cart } = get();
        const existingItem = cart.items.find(item => item.product.id === product.id);

        if (existingItem) {
          const updatedItems = cart.items.map(item =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
          set({
            cart: {
              items: updatedItems,
              total: calculateTotal(updatedItems),
            },
            itemCount: calculateItemCount(updatedItems),
            isOpen: true, // Open cart when adding items
          });
        } else {
          const updatedItems = [...cart.items, { product, quantity }];
          set({
            cart: {
              items: updatedItems,
              total: calculateTotal(updatedItems),
            },
            itemCount: calculateItemCount(updatedItems),
            isOpen: true, // Open cart when adding items
          });
        }
      },

      removeItem: (productId: number) => {
        const { cart } = get();
        const updatedItems = cart.items.filter(item => item.product.id !== productId);
        set({
          cart: {
            items: updatedItems,
            total: calculateTotal(updatedItems),
          },
          itemCount: calculateItemCount(updatedItems),
        });
      },

      updateQuantity: (productId: number, quantity: number) => {
        const { cart } = get();
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        const updatedItems = cart.items.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        );

        set({
          cart: {
            items: updatedItems,
            total: calculateTotal(updatedItems),
          },
          itemCount: calculateItemCount(updatedItems),
        });
      },

      clearCart: () => {
        set({
          cart: initialCart,
          itemCount: 0,
          isOpen: false, // Close cart when clearing
        });
      },
    }),
    {
      name: 'shopping-cart',
    }
  )
);

// Helper functions
function calculateTotal(items: Cart['items']): number {
  return Number(items.reduce((total, item) => total + (item.product.price * item.quantity), 0).toFixed(2));
}

function calculateItemCount(items: Cart['items']): number {
  return items.reduce((count, item) => count + item.quantity, 0);
}
