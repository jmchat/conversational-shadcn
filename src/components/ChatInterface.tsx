"use client";

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { conversationManager } from '@/lib/ai/conversation-manager';
import { Message, Action } from '@/lib/ai/types';
import { Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
  onAction?: (action: Action) => void;
}

export function ChatInterface({ onAction }: ChatInterfaceProps) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input;
    setInput('');
    setIsLoading(true);

    // Add user message to UI immediately
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      // Process message through conversation manager
      const response = await conversationManager.processUserInput(userMessage);

      // Add AI response to UI
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.immediateResponse.message 
      }]);

      // Process actions if any
      if (response.actions && response.actions.length > 0 && onAction) {
        response.actions.forEach(action => onAction(action));
      }

    } catch (error) {
      console.error('Error processing message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your message. Please try again.' 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages display */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <Card key={index} className={`p-4 max-w-[80%] ${
            message.role === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'mr-auto'
          }`}>
            {message.content}
          </Card>
        ))}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about products or type your shopping needs..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send'}
          </Button>
        </div>
      </form>
    </div>
  );
}
