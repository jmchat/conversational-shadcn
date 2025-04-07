"use client";

import React from 'react';
import { ShoppingCart, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useCartStore } from "../store/cartStore";
import { useNavigation } from "@/contexts/NavigationContext";
import { Cart } from "./Cart";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  const { itemCount, setIsOpen } = useCartStore();
  const { onButtonClick } = useNavigation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigationButtons = [
    { label: "Products", onClick: () => onButtonClick?.("Products") },
    { label: "Categories", onClick: () => onButtonClick?.("Categories") },
    { label: "Support", onClick: () => onButtonClick?.("Support") },
  ];

  return (
    <header className={cn("border-b bg-background", className)}>
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Link 
            href="/" 
            className="flex items-center space-x-2 mr-8"
            onClick={() => window.location.href = '/'}
          >
            <span className="font-bold">TechShop</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-4 items-center">
            {navigationButtons.map((button) => (
              <Button
                key={button.label}
                variant="ghost"
                onClick={button.onClick}
              >
                {button.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Cart and Mobile Menu */}
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="icon"
            className="relative"
            onClick={() => setIsOpen(true)}
          >
            <ShoppingCart className="h-5 w-5" />
            {itemCount > 0 && (
              <span className="absolute -right-1 -top-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Button>

          {/* Mobile Menu */}
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[240px] sm:w-[300px]">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col space-y-2 mt-4">
                {navigationButtons.map((button) => (
                  <Button
                    key={button.label}
                    variant="ghost"
                    className="justify-start"
                    onClick={() => {
                      button.onClick();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    {button.label}
                  </Button>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Cart />
      </div>
    </header>
  );
}
