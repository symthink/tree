// This file ensures that React Native Web is properly set up for the demo
// It will be imported in the main.tsx file

// Import React Native Web components
import 'react-native-web';

// Polyfill for Platform.OS === 'web' checks
if (typeof globalThis !== 'undefined') {
  if (!globalThis.navigator) {
    (globalThis as any).navigator = { product: 'ReactNative' };
  }

  // Setup for React Native Web
  if (typeof window !== 'undefined') {
    if (!window.hasOwnProperty('ReactNativeWebView')) {
      (window as any).ReactNativeWebView = null;
    }
  }
} 