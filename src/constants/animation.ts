import { Easing } from 'react-native';

export const ANIMATION_CONFIG = {
  FORWARD: {
    DURATION: 500,
    EASING: Easing.inOut(Easing.ease),
  },
  BACK: {
    DURATION: 300,
    EASING: Easing.inOut(Easing.ease),
  },
  SHARED_ELEMENT: {
    DURATION: 250,
    EASING: Easing.inOut(Easing.ease),
  },
} as const;

export type AnimationConfig = typeof ANIMATION_CONFIG; 