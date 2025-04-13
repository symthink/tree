import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface NavigationContextState {
  navigationStack: any[];
  currentItem: any | null;
  pushItem: (item: any) => void;
  popItem: () => void;
  replaceItem: (item: any) => void;
}

const NavigationContext = createContext<NavigationContextState | undefined>(undefined);

interface NavigationProviderProps {
  initialItem: any;
  children: ReactNode;
}

export const NavigationProvider: React.FC<NavigationProviderProps> = ({ 
  initialItem,
  children
}) => {
  const [navigationStack, setNavigationStack] = useState<any[]>([initialItem]);

  // Ensure initialItem is in the stack when it changes
  useEffect(() => {
    if (initialItem && (!navigationStack.length || navigationStack[0] !== initialItem)) {
      setNavigationStack([initialItem]);
    }
  }, [initialItem, navigationStack]);

  const currentItem = navigationStack[navigationStack.length - 1] || null;

  const pushItem = useCallback((item: any): Promise<void> => {
    return new Promise(resolve => {
      setNavigationStack(prev => {
        const newStack = [...prev, item];
        resolve();
        return newStack;
      });
    });
  }, []);

  const popItem = useCallback(() => {
    if (navigationStack.length > 1) {
      setNavigationStack(prev => prev.slice(0, -1));
    }
  }, [navigationStack.length]);

  const replaceItem = useCallback((item: any) => {
    setNavigationStack(prev => [...prev.slice(0, -1), item]);
  }, []);

  const value = {
    navigationStack,
    currentItem,
    pushItem,
    popItem,
    replaceItem
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): NavigationContextState => {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
}; 