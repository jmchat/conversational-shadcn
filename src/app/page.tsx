"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { useCartStore } from '@/store/cartStore';
import { CategoryButtons } from '@/components/CategoryButtons';
import { Package, List, MessageSquare, X } from 'lucide-react';
import { Product } from '@/types/product';
import { productService } from '@/services/fakeStoreApi';
import { ChatInterface } from '@/components/ChatInterface';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Header } from "@/components/Header";
import Image from 'next/image';

interface Message {
  id: number;
  sender: "user" | "bot";
  message: string;
  content?: React.ReactNode;
}

const defaultButtons = [
  { id: 1, name: "Products", icon: "" },
  { id: 2, name: "Categories", icon: "" },
  { id: 3, name: "Support", icon: "" },
];

function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const addToCart = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Voorkomt dat de card click event wordt getriggerd
    addToCart(product);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Alleen de card click uitvoeren als er niet op de Add knop wordt geklikt
    const target = e.target as HTMLElement;
    if (!target.closest('button')) {
      onClick();
    }
  };

  return (
    <Card className="w-full cursor-pointer hover:shadow-lg transition-shadow" onClick={handleCardClick}>
      <CardHeader>
        <CardTitle className="text-lg">{product.name}</CardTitle>
        <CardDescription>${product.price}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="aspect-square relative mb-2 rounded-lg overflow-hidden">
          <Image
            src={product.imageUrl}
            alt={product.name}
            className="object-contain"
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
        <div className="flex justify-between items-start">
          <div>
            <p className={cn(
              "text-sm font-medium",
              product.status === "In Stock" ? "text-green-500" :
              product.status === "Low Stock" ? "text-yellow-500" :
              "text-red-500"
            )}>
              {product.status}
            </p>
            <div className="mt-2 flex items-center space-x-1">
              <span className="text-sm font-medium">Rating: {product.rating.rate}/5</span>
              <span className="text-sm text-muted-foreground">({product.rating.count} reviews)</span>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleAddToCart}
            className="shrink-0"
          >
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function ProductsDisplay({ category, searchFilters }: { 
  category?: string;
  searchFilters?: {
    productType?: string;
    search?: string;
    features?: string[];
    priceRange?: { min?: number; max?: number; }
  }
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [visibleProducts, setVisibleProducts] = useState<number>(8);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔄 Loading products with filters:', searchFilters);
        let fetchedProducts;
        if (searchFilters) {
          // Use filtered search when coming from chat
          fetchedProducts = await productService.getFilteredProducts({
            ...searchFilters,
            category
          });
        } else {
          // Use regular category-based search for normal browsing
          fetchedProducts = category 
            ? await productService.getProductsByCategory(category)
            : await productService.getProducts();
        }
        
        console.log('✅ Fetched products:', fetchedProducts);
        setProducts(fetchedProducts);
        setVisibleProducts(8);
      } catch (err) {
        setError('Failed to load products. Please try again later.');
        console.error('Error loading products:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [category, searchFilters]);

  const addToCart = useCartStore((state) => state.addItem);

  const loadMore = () => {
    setIsLoading(true);
    setTimeout(() => {
      setVisibleProducts(prev => Math.min(prev + 8, products.length));
      setIsLoading(false);
    }, 500);
  };

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {products.slice(0, visibleProducts).map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onClick={() => setSelectedProduct(product)}
          />
        ))}
      </div>
      
      {visibleProducts < products.length && (
        <div className="flex justify-center pt-4">
          <Button
            onClick={loadMore}
            disabled={isLoading}
            variant="outline"
          >
            {isLoading ? (
              <span className="flex items-center">
                Loading...
                <Loader2 className="ml-2 h-4 w-4 animate-spin" />
              </span>
            ) : (
              'Load More'
            )}
          </Button>
        </div>
      )}

      {selectedProduct && (
        <Sheet open={!!selectedProduct} onOpenChange={() => setSelectedProduct(null)}>
          <SheetContent side="right" className="w-full sm:max-w-[540px] p-0 sm:p-6 [&>button]:hidden">
            <div className="h-full overflow-y-auto">
              <SheetHeader className="sticky top-0 bg-background p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <SheetTitle>{selectedProduct.name}</SheetTitle>
                    <SheetDescription>
                      Detailed information about this product
                    </SheetDescription>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setSelectedProduct(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </SheetHeader>
              <div className="p-4 space-y-4">
                <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={selectedProduct.imageUrl}
                    alt={selectedProduct.name}
                    className="object-contain"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>
                <div className="space-y-2">
                  <p className="text-xl font-semibold">${selectedProduct.price}</p>
                  <p className="text-sm text-muted-foreground">{selectedProduct.description}</p>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Rating: {selectedProduct.rating.rate}/5</span>
                    <span className="text-sm text-muted-foreground">({selectedProduct.rating.count} reviews)</span>
                  </div>
                  <p className={cn(
                    "text-sm font-medium",
                    selectedProduct.status === "In Stock" ? "text-green-500" :
                    selectedProduct.status === "Low Stock" ? "text-yellow-500" :
                    "text-red-500"
                  )}>
                    {selectedProduct.status}
                  </p>
                </div>
              </div>
              <div className="sticky bottom-0 bg-background border-t">
                <div className="px-4 py-4 space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        addToCart(selectedProduct);
                        setSelectedProduct(null);
                      }}
                      className="w-full"
                    >
                      Add to Cart
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}

function Home() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showWelcomeDialog, setShowWelcomeDialog] = useState(() => {
    // Check localStorage alleen aan client-side
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hideWelcomeDialog') !== 'true';
    }
    return true;
  });

  const handleCloseWelcomeDialog = () => {
    setShowWelcomeDialog(false);
    localStorage.setItem('hideWelcomeDialog', 'true');
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      sender: "bot",
      message: "Welcome to TechShop! How can I help you today?",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchFilters, setSearchFilters] = useState<{
    productType?: string;
    search?: string;
    features?: string[];
    priceRange?: { min?: number; max?: number; }
  }>();
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleCategoryClick = useCallback(async (category: string) => {
    setSelectedCategory(category);
    setMessages((prevMessages) => [
      ...prevMessages,
      { 
        id: prevMessages.length + 1, 
        sender: "user", 
        message: `Show me products in ${category}` 
      },
      {
        id: prevMessages.length + 2,
        sender: "bot",
        message: `Here are the products in ${category}:`,
        content: <ProductsDisplay category={category} />
      },
    ]);
  }, []);

  const handleCategoriesClick = useCallback(async () => {
    try {
      const categories = await productService.getCategories();
      const categoryList = categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)).join('\n');
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: prevMessages.length + 1, sender: "user", message: "Show me the product categories" },
        { 
          id: prevMessages.length + 2, 
          sender: "bot", 
          message: `Here are our product categories:\n${categoryList}`,
          content: <CategoryButtons categories={categories} onCategoryClick={handleCategoryClick} />
        },
      ]);
    } catch (error) {
      console.error('Error fetching categories:', error);
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: prevMessages.length + 1, sender: "user", message: "Show me the product categories" },
        { 
          id: prevMessages.length + 2, 
          sender: "bot", 
          message: "Sorry, I couldn't fetch the categories at the moment. Please try again later." 
        },
      ]);
    }
  }, [handleCategoryClick]);

  const handleSupportClick = useCallback(() => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: prevMessages.length + 1, sender: "user", message: "I need support" },
      {
        id: prevMessages.length + 2,
        sender: "bot",
        message: "I'm here to help! What do you need assistance with?",
      },
    ]);
  }, []);

  const handleProductsClick = useCallback(() => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { id: prevMessages.length + 1, sender: "user", message: "Show me all products" },
      { 
        id: prevMessages.length + 2, 
        sender: "bot", 
        message: "Here are all our products:",
        content: <ProductsDisplay />
      },
    ]);
  }, []);

  const handleButtonClick = useCallback((buttonName: string) => {
    if (!isChatStarted) {
      setIsChatStarted(true);
    }
    
    switch (buttonName.toLowerCase()) {
      case "products":
        handleProductsClick();
        break;
      case "categories":
        handleCategoriesClick();
        break;
      case "support":
        handleSupportClick();
        break;
    }
  }, [isChatStarted, handleProductsClick, handleCategoriesClick, handleSupportClick]);

  useEffect(() => {
    const handleHeaderButtonClick = (event: CustomEvent) => {
      const buttonType = event.detail;
      handleButtonClick(buttonType);
    };

    window.addEventListener('headerButtonClick', handleHeaderButtonClick as EventListener);
    return () => {
      window.removeEventListener('headerButtonClick', handleHeaderButtonClick as EventListener);
    };
  }, [handleButtonClick]);

  useEffect(() => {
    if (!isChatStarted) {
      handleButtonClick("products");
    }
  }, [handleButtonClick, isChatStarted]);

  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100); // kleine vertraging om ProductsDisplay tijd te geven om te laden
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const timer = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timer);
  }, [messages, scrollToBottom]);

  const handleAction = useCallback(async (action: any) => {
    if (action.type === 'SHOW_PRODUCTS') {
      const { category, productType, search, features, priceRange } = action.parameters;
      setSelectedCategory(category);
      setSearchFilters({
        productType,
        search,
        features,
        priceRange
      });
    }
  }, []);

  const handleUserMessage = useCallback(async (message: string) => {
    const userMessage: Message = {
      id: messages.length + 1,
      sender: "user",
      message: message
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: messages.concat(userMessage).map((msg) => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.message
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const result = await response.json();
      
      const botResponse: Message = {
        id: messages.length + 2,
        sender: "bot",
        message: result.immediateResponse.message,
      };

      // Als er acties zijn, voeg dan de bijbehorende content toe
      if (result.actions && result.actions.length > 0) {
        const action = result.actions[0];
        switch (action.type) {
          case 'NO_ACTION':
            // Skip adding any content
            break;
          case 'SHOW_PRODUCTS':
            botResponse.content = <ProductsDisplay />;
            break;
          case 'SHOW_CATEGORIES':
            const categories = await productService.getCategories();
            botResponse.content = <CategoryButtons categories={categories} onCategoryClick={handleCategoryClick} />;
            break;
          // Voeg hier andere actie types toe indien nodig
        }
      }

      setMessages((prev) => [...prev, botResponse]);
    } catch (error) {
      console.error('Error:', error);
      const errorResponse: Message = {
        id: messages.length + 2,
        sender: "bot",
        message: "I apologize, but I'm having trouble processing your request. Could you please try again?",
      };
      setMessages((prev) => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  }, [messages, handleCategoryClick]);

  const handleInitialSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setIsChatStarted(true);
      handleUserMessage(inputValue);
      setInputValue("");
    }
  }, [inputValue, handleUserMessage]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isChatStarted) {
      setIsChatStarted(true);
    }
    if (inputValue.trim()) {
      handleUserMessage(inputValue);
    }
    setInputValue("");
  }, [isChatStarted, inputValue, handleUserMessage]);

  const handleSampleQuestion = useCallback((question: string) => {
    setInputValue(question);
    handleUserMessage(question);
  }, [handleUserMessage]);

  const startChat = useCallback(() => {
    setIsChatStarted(true);
  }, []);

  const sampleQuestions = [
    "What are the latest tech gadgets in stock?",
    "Show me the best deals on smartphones",
    "I'm looking for gaming accessories",
    "Help me find a laptop for work"
  ];

  return (
    <main className="container mx-auto p-4 min-h-[calc(100vh-3.5rem)] flex flex-col">
      <Dialog open={showWelcomeDialog} onOpenChange={handleCloseWelcomeDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Welcome to the Conversational Ecommerce DEMO</DialogTitle>
            <DialogDescription>
              Start exploring our AI-powered shopping experience
            </DialogDescription>
            <div className="space-y-4 pt-4 text-sm text-muted-foreground">
              <div>
                <p className="mb-2">Currently, you can:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Browse and search products using natural language</li>
                  <li>Navigate through product categories</li>
                  <li>Ask questions about products and features</li>
                  <li>Get instant support and assistance</li>
                  <li><del>Get personalized product recommendations</del> (coming soon)</li>
                </ul>
              </div>
              <p>
                We&apos;re constantly adding new features to enhance your shopping experience!
              </p>
            </div>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={handleCloseWelcomeDialog}>Get Started</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {!isChatStarted ? (
        <div className="flex-1 flex flex-col items-center justify-center space-y-8">
          <div className="max-w-2xl space-y-4 text-center">
            <h1 className="text-3xl font-bold">Welcome to TechShop Assistant</h1>
            <p className="text-muted-foreground">
              I&apos;m here to help you find the perfect products. How can I assist you today?
            </p>
          </div>
          
          {/* Background image and form container */}
          <div className="w-full max-w-3xl relative">
            {/* Background image */}
            <div 
              className="absolute inset-0 -z-10 rounded-xl overflow-hidden opacity-10"
              style={{
                backgroundImage: 'url("/tools-background.jpg")',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                filter: 'blur(2px)'
              }}
            />
            
            {/* Search form */}
            <div className="bg-background/80 backdrop-blur-sm rounded-xl p-6 space-y-6">
              <form onSubmit={handleSubmit} className="w-full flex space-x-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
                </Button>
              </form>

              {/* Sample questions */}
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">Or try one of these questions:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {sampleQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="justify-start text-left h-auto whitespace-normal"
                      onClick={() => handleSampleQuestion(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 overflow-y-auto py-4">
            <div className="container px-4 mx-auto">
              <div className="mx-auto space-y-4">
                {messages.map((message) => (
                  <div key={message.id}>
                    <div
                      className={cn("flex items-start space-x-2", {
                        "justify-end": message.sender === "user",
                      })}
                    >
                      <div
                        className={cn(
                          "rounded-lg px-4 py-2 max-w-full sm:max-w-[85%] break-words",
                          {
                            "bg-primary text-primary-foreground":
                              message.sender === "user",
                            "bg-muted": message.sender === "bot",
                          }
                        )}
                      >
                        <div className="whitespace-pre-wrap">{message.message}</div>
                        {message.content && (
                          <div className="mt-4 w-full">{message.content}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex items-center space-x-2">
                    <div className="bg-muted rounded-lg px-4 py-2">
                      <div className="flex space-x-2">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div ref={messagesEndRef} />
          </div>
          <div className="sticky bottom-0 bg-background pt-4">
            <div className="container px-4 mx-auto">
              <div className="max-w-3xl mx-auto">
                <form onSubmit={handleSubmit} className="flex space-x-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
                  </Button>
                </form>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

export default Home;
