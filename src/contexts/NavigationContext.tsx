"use client";

import { createContext, useContext } from "react";

type NavigationContextType = {
  onButtonClick?: (type: string) => void;
};

const NavigationContext = createContext<NavigationContextType>({});

export function NavigationProvider({
  children,
  onButtonClick,
}: {
  children: React.ReactNode;
  onButtonClick?: (type: string) => void;
}) {
  return (
    <NavigationContext.Provider value={{ onButtonClick }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  return useContext(NavigationContext);
}
