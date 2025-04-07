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
import { Loader2, Stars, Sparkles, Laptop, Smartphone, Gamepad, Camera, MessageSquare } from "lucide-react";
import { useCartStore } from '@/store/cartStore';
import { CategoryButtons } from '@/components/CategoryButtons';
import { Package, List, MessageSquare as MessageSquareIcon, X } from 'lucide-react';
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
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Voorkomt dat de card click event wordt getriggerd
    addItem(product);
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
        <CardTitle className="text-lg">{product.title}</CardTitle>
        <CardDescription>${product.price}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="aspect-square relative mb-2 rounded-lg overflow-hidden">
          <Image
            src={product.image}
            alt={product.title}
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
    category?: string;
    search?: string;
    priceRange?: { min?: number; max?: number; }
  }
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [visibleProducts, setVisibleProducts] = useState<number>(8);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        let fetchedProducts: Product[];
        
        if (searchFilters) {
          fetchedProducts = await productService.searchProducts(searchFilters);
        } else if (category) {
          fetchedProducts = await productService.getProductsByCategory(category);
        } else {
          fetchedProducts = await productService.getProducts();
        }
        
        setProducts(fetchedProducts);
        setVisibleProducts(8);
      } catch (error) {
        setError('Failed to load products. Please try again later.');
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category, searchFilters]);

  const { addItem } = useCartStore();

  const loadMore = () => {
    setLoading(true);
    setTimeout(() => {
      setVisibleProducts(prev => Math.min(prev + 8, products.length));
      setLoading(false);
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
            disabled={loading}
            variant="outline"
          >
            {loading ? (
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
          <SheetContent className="w-[90%] sm:max-w-2xl h-full overflow-y-auto">
            <div className="h-full flex flex-col">
              <SheetHeader className="sticky top-0 bg-background p-4 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <SheetTitle>{selectedProduct.title}</SheetTitle>
                    <SheetDescription>
                      Detailed information about this product
                    </SheetDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setSelectedProduct(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </SheetHeader>

              <div className="p-4 space-y-4">
                <div className="aspect-square relative rounded-lg overflow-hidden bg-muted">
                  <Image
                    src={selectedProduct.image}
                    alt={selectedProduct.title}
                    className="object-contain"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Description</h3>
                    <p className="text-muted-foreground">{selectedProduct.description}</p>
                  </div>

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">Price</p>
                      <p className="text-muted-foreground">${selectedProduct.price}</p>
                    </div>
                    <div>
                      <p className="font-medium">Status</p>
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

                  <div>
                    <h3 className="font-medium">Rating</h3>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Stars
                            key={i}
                            className={cn(
                              "h-4 w-4",
                              i < Math.floor(selectedProduct.rating.rate)
                                ? "text-yellow-400 fill-yellow-400"
                                : "text-gray-300"
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({selectedProduct.rating.count} reviews)
                      </span>
                    </div>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => {
                      addItem(selectedProduct);
                      setSelectedProduct(null);
                    }}
                  >
                    Add to Cart
                  </Button>
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
      message: "Welcome to TechShop! How can I help you today? You can browse our products, view categories, or ask for support.",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [searchFilters, setSearchFilters] = useState<{
    category?: string;
    search?: string;
    priceRange?: { min?: number; max?: number; }
  }>();
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const { addItem } = useCartStore();

  const handleProductClick = useCallback((product: Product) => {
    setSelectedProduct(product);
  }, []);

  // Fetch categories and featured products on mount
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const cats = await productService.getCategories();
        setCategories(cats);
        
        const prods = await productService.getProducts();
        setFeaturedProducts(prods.slice(0, 4));
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    
    fetchInitialData();
  }, []);

  const handleCategoryClick = useCallback(async (category: string) => {
    setSelectedCategory(category);
    setSearchFilters({
      category,
      search: undefined,
      priceRange: undefined
    });
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
      // const categoryList = categories.map(cat => cat.charAt(0).toUpperCase() + cat.slice(1)).join('\n');
      setMessages((prevMessages) => [
        ...prevMessages,
        { id: prevMessages.length + 1, sender: "user", message: "Show me the product categories" },
        { 
          id: prevMessages.length + 2, 
          sender: "bot", 
          message: `Here are our product categories:`,
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
        category,
        search,
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
  }, []);

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
    <main className="h-[calc(100vh-3.5rem)] flex flex-col relative bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-64 h-64 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      {/* Content container */}
      <div className="container mx-auto p-4 relative flex flex-col">
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
              <div className="flex items-center justify-center mb-4">
                <Stars className="w-10 h-10 text-blue-500 mr-2" />
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
                  Welcome to TechShop Assistant
                </h1>
                <Sparkles className="w-10 h-10 text-purple-500 ml-2" />
              </div>
              <p className="text-gray-600 text-xl">
                Your personal AI shopping guide for finding the perfect tech products
              </p>
            </div>
            
            {/* Category cards */}
            <div className="grid grid-cols-4 gap-4 w-full max-w-4xl mb-8">
              {categories.map((category, index) => {
                const icons = {
                  laptops: Laptop,
                  phones: Smartphone,
                  gaming: Gamepad,
                  cameras: Camera
                };
                const colors = {
                  laptops: "bg-blue-100",
                  phones: "bg-purple-100",
                  gaming: "bg-pink-100",
                  cameras: "bg-green-100"
                };
                
                const Icon = icons[category as keyof typeof icons] || Package;
                const color = colors[category as keyof typeof colors] || "bg-gray-100";
                
                return (
                  <Card 
                    key={category}
                    className={`${color} hover:shadow-lg transition-shadow cursor-pointer`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    <CardContent className="flex flex-col items-center justify-center p-6">
                      <Icon className="w-8 h-8 mb-2" />
                      <span className="font-medium capitalize">{category}</span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
            
            {/* Chat interface */}
            <Card className="w-full max-w-4xl bg-white/80 backdrop-blur-lg shadow-xl rounded-xl p-6 mb-8">
              <CardContent>
                <form onSubmit={handleInitialSubmit} className="flex items-center gap-4 mb-6">
                  <div className="relative flex-1">
                    <Input 
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      placeholder="Ask me anything about tech products..." 
                      className="pl-10 pr-4 py-3 rounded-full border-2 border-blue-100 focus:border-blue-500 transition-colors"
                    />
                    <MessageSquare className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  </div>
                  <Button type="submit" className="bg-blue-600 hover:bg-blue-700 rounded-full px-6 py-3 text-white">
                    Send
                  </Button>
                </form>

                <div className="grid grid-cols-2 gap-4">
                  {sampleQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="bg-white hover:bg-gray-50 text-left p-4 rounded-lg border-2 border-gray-200 transition-all hover:scale-102 hover:shadow-md"
                      onClick={() => handleSampleQuestion(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Trust indicators */}
            <div className="grid grid-cols-3 gap-6 w-full max-w-4xl">
              {[
                { icon: Stars, title: "Smart AI", desc: "Personalized recommendations", color: "blue" },
                { icon: MessageSquare, title: "24/7 Help", desc: "Always here to assist", color: "green" },
                { icon: Sparkles, title: "Easy Shopping", desc: "Seamless experience", color: "purple" }
              ].map(({ icon: Icon, title, desc, color }, index) => (
                <Card key={index} className="bg-white/80 backdrop-blur-lg hover:shadow-lg transition-all">
                  <CardContent className="p-6 text-center">
                    <div className={`bg-${color}-100 p-3 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 text-${color}-600`} />
                    </div>
                    <h3 className="font-semibold mb-1">{title}</h3>
                    <p className="text-sm text-gray-600">{desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Featured Products */}
            <div className="w-full max-w-4xl mt-8">
              <Card className="bg-white/80 backdrop-blur-lg">
                <CardHeader>
                  <CardTitle>Featured Products</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    {featuredProducts.length > 0 ? (
                      featuredProducts.map((product) => (
                        <div 
                          key={product.id} 
                          className="group cursor-pointer"
                          onClick={() => handleProductClick(product)}
                        >
                          <div className="aspect-square rounded-lg overflow-hidden bg-white">
                            <Image
                              src={product.image}
                              alt={product.title}
                              width={200}
                              height={200}
                              className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform"
                            />
                          </div>
                          <div className="mt-2">
                            <p className="text-sm font-medium truncate">{product.title}</p>
                            <p className="text-sm text-muted-foreground">${product.price}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      // Loading state
                      Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                          <div className="bg-gray-200 w-full aspect-square rounded-lg animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <div className="container mx-auto px-4">
                <div className="space-y-4 py-4">
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
            <div className="sticky bottom-0 w-full bg-white border-t">
              <form onSubmit={handleSubmit} className="container mx-auto py-4 px-4">
                <div className="flex space-x-2">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default Home;
