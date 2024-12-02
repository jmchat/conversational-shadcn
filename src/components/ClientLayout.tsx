"use client";

import { NavigationProvider } from "@/contexts/NavigationContext";

export function ClientLayout({
  children
}: {
  children: React.ReactNode
}) {
  const handleButtonClick = (type: string) => {
    window.dispatchEvent(new CustomEvent('headerButtonClick', { detail: type }));
  };

  return (
    <NavigationProvider onButtonClick={handleButtonClick}>
      {children}
    </NavigationProvider>
  );
}
