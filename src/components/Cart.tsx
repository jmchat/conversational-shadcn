import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCartStore } from "../store/cartStore";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function Cart({ open, onOpenChange }: CartProps) {
  const { cart, removeItem, updateQuantity, clearCart } = useCartStore();

  if (cart.items.length === 0) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="right" className="w-full sm:w-[440px]">
          <SheetHeader>
            <SheetTitle>Shopping Cart</SheetTitle>
            <SheetDescription>
              Your selected items and shopping cart details
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col items-center justify-center h-[80vh] space-y-4">
            <p className="text-muted-foreground">Your cart is empty</p>
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Continue Shopping
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[440px] flex flex-col">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
          <SheetDescription>
            Your selected items and shopping cart details
          </SheetDescription>
        </SheetHeader>
        <div className="flex-1 flex flex-col justify-between">
          <div className="flex-1 overflow-auto py-6">
            {cart.items.map((item) => (
              <div
                key={item.product.id}
                className="flex items-center space-x-4 mb-6 last:mb-0"
              >
                <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted">
                  <img
                    src={item.product.imageUrl}
                    alt={item.product.name}
                    className="object-cover w-full h-full"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium truncate">
                    {item.product.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    ${item.product.price}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="text-sm w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="text-sm font-medium">
                  ${(item.product.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-auto border-t pt-6 pb-6">
            <div className="flex justify-between mb-4">
              <span className="text-sm font-medium">Subtotal</span>
              <span className="text-sm font-medium">${cart.total.toFixed(2)}</span>
            </div>
            <div className="space-y-3">
              <Button className="w-full" size="lg">
                Checkout
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={clearCart}
              >
                Clear Cart
              </Button>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
