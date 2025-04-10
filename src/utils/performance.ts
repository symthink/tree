import { Platform } from 'react-native';

// Check if the device is considered low-end based on memory and CPU
export const isLowEndDevice = (): boolean => {
  if (Platform.OS === 'web') {
    // For web, we can check navigator.hardwareConcurrency
    const hardwareConcurrency = (navigator as any).hardwareConcurrency || 4;
    return hardwareConcurrency <= 2;
  }

  // For mobile, we'll use a simple heuristic based on platform
  return Platform.OS === 'android' && Platform.Version < 24; // Android 7.0 and below
};

// Check if reduced motion is enabled in system preferences
export const isReducedMotionEnabled = (): boolean => {
  if (Platform.OS === 'web') {
    // Check for reduced motion preference in browsers
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    return mediaQuery.matches;
  }

  // For React Native, we'll need to implement platform-specific checks
  // This is a placeholder - you might want to use a native module for this
  return false;
};

// Check if animations should be enabled based on device capabilities
export const shouldEnableAnimations = (): boolean => {
  return !isLowEndDevice() && !isReducedMotionEnabled();
}; 