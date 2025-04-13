import { Animated, View, Dimensions } from 'react-native';
import { createRef, useCallback, useState, useRef, useEffect } from 'react';
import { ANIMATION_CONFIG } from '../constants/animation';
import { shouldEnableAnimations } from '../utils/performance';
import { debug, DEBUG_COLORS, getDebugStyle, measurePerformance } from '../utils/debug';

export interface AnimationState {
  position: Animated.ValueXY;
  opacity: Animated.Value;
  scale: Animated.Value;
  zIndex: number;
  itemRef: React.RefObject<View>;
  debugState?: keyof typeof DEBUG_COLORS;
}

export interface NavigationItem {
  data: any;
  animation: AnimationState;
}

export interface AnimationHandlers {
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
  onAnimationCancel?: () => void;
}

export const useCardAnimation = (width: number, handlers?: AnimationHandlers) => {
  const [debugState, setDebugState] = useState<Record<string, keyof typeof DEBUG_COLORS>>({});
  const animationValuesRef = useRef<Map<string, AnimationState>>(new Map());

  const createAnimationValues = useCallback((index: number = 0): AnimationState => {
    const id = `item-${index}`;
    
    // Check if we already have animation values for this index
    const existingValues = animationValuesRef.current.get(id);
    if (existingValues) {
      return existingValues;
    }
    
    // Create new animation values
    const state: AnimationState = {
      position: new Animated.ValueXY(index === 0 ? { x: 0, y: 0 } : { x: width, y: 0 }),
      // opacity: new Animated.Value(index === 0 ? 1 : 0),
      opacity: new Animated.Value(1),
      scale: new Animated.Value(1),
      zIndex: index + 1,
      itemRef: createRef<View>(),
      debugState: 'IDLE',
    };

    // Store the new values
    animationValuesRef.current.set(id, state);
    setDebugState(prev => ({ ...prev, [id]: 'IDLE' }));
    
    return state;
  }, [width]);

  // Clean up animation values when component unmounts
  useEffect(() => {
    return () => {
      animationValuesRef.current.clear();
    };
  }, []);

  const createSlideAnimation = useCallback((
    animation: AnimationState,
    toValue: { x: number; y: number },
    config: typeof ANIMATION_CONFIG.FORWARD | typeof ANIMATION_CONFIG.BACK = ANIMATION_CONFIG.FORWARD
  ) => {
    if (!shouldEnableAnimations()) {
      debug('Skipping slide animation (disabled)', { toValue });
      animation.position.setValue(toValue);
      return { start: (callback?: () => void) => callback?.() } as Animated.CompositeAnimation;
    }

    debug('Creating slide animation', { toValue, config });
    return Animated.timing(animation.position, {
      toValue,
      duration: config.DURATION,
      easing: config.EASING,
      useNativeDriver: true,
    });
  }, []);

  const createFadeAnimation = useCallback((
    animation: AnimationState,
    toValue: number,
    config: typeof ANIMATION_CONFIG.FORWARD | typeof ANIMATION_CONFIG.BACK = ANIMATION_CONFIG.FORWARD
  ) => {
    if (!shouldEnableAnimations()) {
      debug('Skipping fade animation (disabled)', { toValue });
      animation.opacity.setValue(toValue);
      return { start: (callback?: () => void) => callback?.() } as Animated.CompositeAnimation;
    }

    debug('Creating fade animation', { toValue, config });
    return Animated.timing(animation.opacity, {
      toValue,
      duration: config.DURATION,
      easing: config.EASING,
      useNativeDriver: true,
    });
  }, []);

  const animateCardTransition = useCallback((
    currentCard: NavigationItem,
    newCard: NavigationItem,
    onComplete?: () => void
  ) => {
    return measurePerformance(async () => {
      // Set initial position for new card (off screen to the right)
      newCard.animation.position.setValue({ x: width, y: 0 });
      newCard.animation.opacity.setValue(0);
      
      // Set outgoing card's opacity immediately
      currentCard.animation.opacity.setValue(0.5);
      
      if (!shouldEnableAnimations()) {
        debug('Skipping card transition (disabled)');
        currentCard.animation.position.setValue({ x: -width, y: 0 });
        newCard.animation.position.setValue({ x: 0, y: 0 });
        newCard.animation.opacity.setValue(1);
        handlers?.onAnimationStart?.();
        handlers?.onAnimationEnd?.();
        onComplete?.();
        return;
      }
      
      debug('Starting card transition', {
        currentCard: currentCard.data?.id,
        newCard: newCard.data?.id,
      });

      handlers?.onAnimationStart?.();
      setDebugState(prev => ({
        ...prev,
        [currentCard.data?.id]: 'ANIMATING',
        [newCard.data?.id]: 'ANIMATING',
      }));
      
      // Start both animations in parallel
      Animated.parallel([
        createSlideAnimation(currentCard.animation, { x: -width, y: 0 }, ANIMATION_CONFIG.FORWARD),
        createSlideAnimation(newCard.animation, { x: 0, y: 0 }, ANIMATION_CONFIG.FORWARD),
        createFadeAnimation(newCard.animation, 1, ANIMATION_CONFIG.FORWARD) // Only fade in the new card
      ]).start((result) => {
        debug('Card transition completed', { success: result.finished });
        if (result.finished) {
          setDebugState(prev => ({
            ...prev,
            [currentCard.data?.id]: 'COMPLETED',
            [newCard.data?.id]: 'COMPLETED',
          }));
          handlers?.onAnimationEnd?.();
        } else {
          setDebugState(prev => ({
            ...prev,
            [currentCard.data?.id]: 'CANCELLED',
            [newCard.data?.id]: 'CANCELLED',
          }));
          handlers?.onAnimationCancel?.();
        }
        onComplete?.();
      });
    }, 'animateCardTransition');
  }, [width, createSlideAnimation, createFadeAnimation, handlers]);

  const animateBackTransition = useCallback((
    currentCard: NavigationItem,
    previousCard: NavigationItem,
    onComplete?: () => void
  ) => {
    return measurePerformance(async () => {
      if (!shouldEnableAnimations()) {
        debug('Skipping back transition (disabled)');
        currentCard.animation.position.setValue({ x: width, y: 0 });
        currentCard.animation.opacity.setValue(0);
        previousCard.animation.position.setValue({ x: 0, y: 0 });
        previousCard.animation.opacity.setValue(1);
        handlers?.onAnimationStart?.();
        handlers?.onAnimationEnd?.();
        onComplete?.();
        return;
      }

      debug('Starting back transition', {
        currentCard: currentCard.data?.id,
        previousCard: previousCard.data?.id,
      });

      handlers?.onAnimationStart?.();
      setDebugState(prev => ({
        ...prev,
        [currentCard.data?.id]: 'ANIMATING',
        [previousCard.data?.id]: 'ANIMATING',
      }));

      // First phase: Fade out current card to the right
      const currentCardAnimations = [
        createSlideAnimation(currentCard.animation, { x: width, y: 0 }, ANIMATION_CONFIG.BACK),
        createFadeAnimation(currentCard.animation, 0, ANIMATION_CONFIG.BACK)
      ];

      // Second phase: Bring back the previous card from the left
      const previousCardAnimations = [
        createSlideAnimation(previousCard.animation, { x: 0, y: 0 }, ANIMATION_CONFIG.BACK),
        createFadeAnimation(previousCard.animation, 1, ANIMATION_CONFIG.BACK)
      ];

      // Run the animations
      Animated.sequence([
        Animated.parallel(currentCardAnimations),
        Animated.parallel(previousCardAnimations),
      ]).start((result) => {
        debug('Back transition completed', { success: result.finished });
        if (result.finished) {
          setDebugState(prev => ({
            ...prev,
            [currentCard.data?.id]: 'COMPLETED',
            [previousCard.data?.id]: 'COMPLETED',
          }));
          handlers?.onAnimationEnd?.();
        } else {
          setDebugState(prev => ({
            ...prev,
            [currentCard.data?.id]: 'CANCELLED',
            [previousCard.data?.id]: 'CANCELLED',
          }));
          handlers?.onAnimationCancel?.();
        }
        onComplete?.();
      });
    }, 'animateBackTransition');
  }, [createSlideAnimation, createFadeAnimation, handlers]);

  return {
    createAnimationValues,
    animateCardTransition,
    animateBackTransition,
    debugState,
    getDebugStyle,
  };
}; 