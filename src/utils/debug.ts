import { Platform, ViewStyle } from 'react-native';

// Enable debug mode in development
export const DEBUG_MODE = process.env.NODE_ENV === 'development';

// Debug colors for different animation states
export const DEBUG_COLORS = {
  ANIMATING: '#FFA500', // Orange
  COMPLETED: '#00FF00', // Green
  CANCELLED: '#FF0000', // Red
  IDLE: '#808080',     // Gray
} as const;

// Debug logging with different levels
export const DebugLevel = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
} as const;

type DebugLevel = typeof DebugLevel[keyof typeof DebugLevel];

interface DebugOptions {
  level?: DebugLevel;
  component?: string;
  timestamp?: boolean;
}

// Enhanced debug logging
export const debug = (message: string, data?: any, options: DebugOptions = {}) => {
  if (!DEBUG_MODE) return;

  const { level = DebugLevel.INFO, component = 'Animation', timestamp = true } = options;
  const time = timestamp ? `[${new Date().toISOString()}]` : '';
  const prefix = `[${component}]${time}[${level}]`;

  const logData = data ? `\nData: ${JSON.stringify(data, null, 2)}` : '';

  switch (level) {
    case DebugLevel.ERROR:
      console.error(`${prefix} ${message}${logData}`);
      break;
    case DebugLevel.WARN:
      console.warn(`${prefix} ${message}${logData}`);
      break;
    default:
      // console.log(`${prefix} ${message}${logData}`);
  }
};

// Debug visualization helper
export const getDebugStyle = (state: keyof typeof DEBUG_COLORS): ViewStyle => {
  if (!DEBUG_MODE) return {};

  return {
    borderWidth: 2,
    borderColor: DEBUG_COLORS[state],
    borderStyle: 'dashed' as const,
  };
};

// Performance monitoring
export const measurePerformance = async <T>(
  operation: () => Promise<T>,
  name: string
): Promise<T> => {
  if (!DEBUG_MODE) return operation();

  const start = performance.now();
  const result = await operation();
  const end = performance.now();
  
  debug(`Performance: ${name}`, {
    duration: `${(end - start).toFixed(2)}ms`,
    platform: Platform.OS,
  });

  return result;
}; 