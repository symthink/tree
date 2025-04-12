import React, { createContext, useContext, useState, ReactNode } from 'react';

export type ThemeType = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  text: string;
  link: string;
  selected: string;
  primary: string;
  secondary: string;
  border: string;
}

export interface ThemeContextType {
  theme: ThemeType;
  colors: ThemeColors;
  toggleTheme: () => void;
}

const themes: Record<ThemeType, ThemeColors> = {
  light: {
    background: '#FFFFFF',
    text: '#333333',
    link: '#0000FF',
    selected: '#E5E5E5',
    primary: '#4A90E2',
    secondary: '#5AC8FA',
    border: '#E5E5E5',
  },
  dark: {
    background: '#1A1A1A',
    text: '#F5F5F5',
    link: '#0000FF',
    selected: '#444444',
    primary: '#5AC8FA',
    secondary: '#4A90E2',
    border: '#444444',
  },
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeType;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = 'light',
}) => {
  const [theme, setTheme] = useState<ThemeType>(initialTheme);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const value = {
    theme,
    colors: themes[theme],
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 