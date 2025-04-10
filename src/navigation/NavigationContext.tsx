import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';

interface NavigationContextState {
  navigationStack: any[];
  currentItem: any | null;
  isAnimating: boolean;
  pushItem: (item: any) => void;
  popItem: () => void;
  replaceItem: (item: any) => void;
  setAnimating: (isAnimating: boolean) => void;
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
  console.log('NavigationProvider initializing with item:', initialItem);
  
  const [navigationStack, setNavigationStack] = useState<any[]>([initialItem]);
  const [isAnimating, setIsAnimating] = useState(false);

  // Ensure initialItem is in the stack when it changes
  useEffect(() => {
    console.log('initialItem changed, updating stack');
    if (initialItem && (!navigationStack.length || navigationStack[0] !== initialItem)) {
      setNavigationStack([initialItem]);
    }
  }, [initialItem, navigationStack]);

  const currentItem = navigationStack[navigationStack.length - 1] || null;

  const pushItem = useCallback((item: any): Promise<void> => {
    console.log('Pushing item to navigation stack:', item);
    return new Promise(resolve => {
      setNavigationStack(prev => {
        const newStack = [...prev, item];
        resolve();
        return newStack;
      });
    });
  }, []);

  const popItem = useCallback(() => {
    console.log('Popping item from navigation stack');
    if (navigationStack.length > 1) {
      setNavigationStack(prev => prev.slice(0, -1));
    }
  }, [navigationStack.length]);

  const replaceItem = useCallback((item: any) => {
    console.log('Replacing current item in navigation stack');
    setNavigationStack(prev => [...prev.slice(0, -1), item]);
  }, []);

  const setAnimating = useCallback((animating: boolean) => {
    setIsAnimating(animating);
  }, []);

  const value = {
    navigationStack,
    currentItem,
    isAnimating,
    pushItem,
    popItem,
    replaceItem,
    setAnimating
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