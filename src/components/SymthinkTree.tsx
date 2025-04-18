import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Animated, StyleSheet, Text, Dimensions, Pressable } from 'react-native';
import { CardContainer } from './CardContainer';
import { ISymthinkDocument, StateEnum, Symthink, SymthinkDocument } from '../core/symthink.class';
import { useTheme } from '../theme/ThemeContext';
import { NavigationProvider, useNavigation } from '../core/NavigationContext';
import { useCardAnimation, NavigationItem } from '../hooks/useCardAnimation';
import { globalStyles } from '../theme/globalStyles';
import { IconPreloader } from './IconPreloader';
import { SharedElement } from './SharedElement';
import { useAnimation } from '../core/AnimationContext';
import { AnimationProvider } from '../core/AnimationContext';
import { globalStor } from '../core/simpleGlobalStore';
import { SharedElementBack } from './SharedElementBack';
import { useAnimationStore } from '../store/AnimationStore';
import { SymthinkTreeEvent, SymthinkTreeEventAction, useSymthinkTreeEvent } from '../store/SymthinkTreeEvent';
import { useToolbarAction, ToolbarAction, ToolbarActionType } from '../store/ToolbarAction';
import { ClientAppEventType } from '../store/ClientAppEvent';
import { useUIState } from '../store/UIStateStore';

interface ItemAction {
  action: string;
  value: SymthinkDocument;
  domrect?: DOMRect;
  pointerEvent?: any;
}

interface DocAction {
  action: string;
  value: SymthinkDocument;
}

interface SymthinkTreeProps {
  initialData: ISymthinkDocument;
  onBackComplete?: () => void;
  onTreeEvent?: (event: SymthinkTreeEventAction) => void;
  onClientAction?: (action: ToolbarActionType) => void;
}

export const SymthinkTree: React.FC<SymthinkTreeProps> = ({
  initialData,
  onTreeEvent,
}) => {
  const [doc] = useState<SymthinkDocument>(() => {
    const std = new SymthinkDocument(initialData.id);
    std.load(initialData);
    std.state$.next(StateEnum.Viewing);
    return std;
  });    

  const { setAction } = useToolbarAction();
  const notifySymthinkTree = useSymthinkTreeEvent(state => state.notify);
  const subscribe = useSymthinkTreeEvent(state => state.subscribe);

  // Handle outgoing tree events
  useEffect(() => {
    if (onTreeEvent) {
      const unsubscribe = useSymthinkTreeEvent.subscribe(
        (state) => {
          if (state.currentEvent) {
            onTreeEvent(state.currentEvent);
          }
        }
      );
      return () => unsubscribe();
    }
  }, [onTreeEvent]);

  // Subscribe to ToolbarAction events
  useToolbarAction.subscribe((state) => {
    console.log('ToolbarAction', state);
    if (state.currentAction === ToolbarAction.EDIT_CARD) {
      useUIState.getState().setEditing(true);
    }
  });

  // Watch for SymthinkTreeEvent changes
  const currentEvent = useSymthinkTreeEvent(state => state.currentEvent);
  React.useEffect(() => {
    console.log('currentEvent', currentEvent);
    // if (currentEvent?.action === SymthinkTreeEvent.EDITITEM) {
    //   useUIState.getState().setEditing(true, currentEvent.value?.id);
    // } else if (currentEvent?.action === SymthinkTreeEvent.MODIFIED) {
    //   // Handle any modifications that might affect UI state
    //   console.log('Tree modified:', currentEvent);
    // }
  }, [currentEvent]);

  return (
    <AnimationProvider>
      <NavigationProvider initialItem={doc}>
        <CardDeckNavigator 
        />
      </NavigationProvider>
    </AnimationProvider>
  );
};


const CardDeckNavigator: React.FC = () => {
  const { colors } = useTheme();
  const { width } = Dimensions.get('window');
  const { navigationStack: contextStack, currentItem, pushItem, popItem } = useNavigation();
  const { state: animationState, queueAnimation, startAnimation, completeAnimation, cancelAnimation } = useAnimation();
  const notifySharedElFwdAnimDone = useAnimationStore((state: { notifySharedElFwdAnimDone: () => void }) => state.notifySharedElFwdAnimDone);
  const subscribe = useSymthinkTreeEvent(state => state.subscribe);
  
  // Replace useRef with useState for animated items
  const [animatedItems, setAnimatedItems] = useState<Map<string, NavigationItem>>(new Map());
  const selectedItemRef = useRef<any>(null);
  const selectedItemPosition = useRef<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });
  const [showSharedElement, setShowSharedElement] = useState(false);
  const [showSharedElementBack, setShowSharedElementBack] = useState(false);
  const previousItemRef = useRef<any>(null);

  const { createAnimationValues, animateCardTransition, animateBackTransition, debugState, getDebugStyle } = useCardAnimation(width, {
    onAnimationStart: () => {
      startAnimation('card-transition');
    },
    onAnimationEnd: () => {
      completeAnimation();
    },
    onAnimationCancel: () => {
      cancelAnimation();
    },
  });

  // Ensure animatedItems is in sync with contextStack
  useEffect(() => {
    const newAnimatedItems = new Map(animatedItems);
    let hasChanges = false;

    // Add any missing items from contextStack
    contextStack.forEach((item, index) => {
      const id = item.id || `item-${index}`;
      if (!newAnimatedItems.has(id)) {
        newAnimatedItems.set(id, {
          data: item,
          animation: createAnimationValues(index)
        });
        hasChanges = true;
      }
    });

    // Remove items that are no longer in contextStack
    Array.from(newAnimatedItems.keys()).forEach(id => {
      if (!contextStack.some(item => (item.id || `item-${contextStack.indexOf(item)}`) === id)) {
        newAnimatedItems.delete(id);
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setAnimatedItems(newAnimatedItems);
    }
  }, [contextStack, createAnimationValues]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelAnimation();
      setAnimatedItems(new Map());
    };
  }, [cancelAnimation]);

  // Memoize the visible items computation
  const visibleItems = useMemo(() => {
    return contextStack.map((item, index) => {
      const id = item.id || `item-${index}`;
      const animItem = animatedItems.get(id);
      
      if (!animItem) {
        return {
          data: item as Symthink,
          animation: createAnimationValues(index),
        };
      }
      
      return {
        ...animItem,
        animation: {
          ...animItem.animation,
          zIndex: index + 1,
        },
      };
    });
  }, [contextStack, animatedItems, createAnimationValues]);

  // Memoize the handleItemAction callback
  const handleItemAction = useCallback(async (action: ItemAction) => {
    if (action.action === 'support-clicked' && animationState.state !== 'ANIMATING') {
      const supportItem = action.value;
      
      // Set up shared element animation
      if (action.domrect) {
        selectedItemRef.current = supportItem;
        selectedItemPosition.current = {
          x: action.domrect.x,
          y: action.domrect.y,
          width: action.domrect.width,
          height: action.domrect.height
        };
        // Store the DOMRect for back navigation
        globalStor.pushNavigationRect(action.domrect);
        setShowSharedElement(true);
      }
      
      const currentCardId = contextStack[contextStack.length - 1]?.id || `item-${contextStack.length - 1}`;
      const currentCard = animatedItems.get(currentCardId);
      
      if (!currentCard) {
        console.warn('Could not find current card for animation');
        setShowSharedElement(false);
        return;
      }
      
      // Queue the animation before pushing to stack
      queueAnimation('card-transition');
      
      // Initialize the new card in the animation map before pushing to stack
      const newCardId = supportItem.id || `item-${contextStack.length}`;
      const newCard: NavigationItem = {
        data: supportItem,
        animation: createAnimationValues(contextStack.length),
      };
      
      // Update the state with the new card
      setAnimatedItems(prev => {
        const newMap = new Map(prev);
        newMap.set(newCardId, newCard);
        return newMap;
      });
      
      // Now push the item to the stack
      await pushItem(supportItem);
      
      animateCardTransition(currentCard, newCard, () => {
        setShowSharedElement(false);
      });
    }
  }, [contextStack, animatedItems, animationState.state, pushItem, queueAnimation, createAnimationValues, animateCardTransition]);

  // Memoize the navigateBack callback
  const navigateBack = useCallback(() => {
    if (contextStack.length <= 1 || animationState.state !== 'IDLE') {
      console.warn('Back navigation blocked:', {
        reason: contextStack.length <= 1 ? 'stack too small' : `animation state is ${animationState.state}`
      });
      return;
    }

    const targetRect = globalStor.popNavigationRect();
    if (!targetRect) {
      console.warn('No stored position found for back navigation');
      return;
    }
    
    startAnimation('back-transition');

    const currentCardId = contextStack[contextStack.length - 1]?.id || `item-${contextStack.length - 1}`;
    const previousCardId = contextStack[contextStack.length - 2]?.id || `item-${contextStack.length - 2}`;
    
    const currentCard = animatedItems.get(currentCardId);
    const previousCard = animatedItems.get(previousCardId);

    if (!currentCard || !previousCard) {
      console.warn('Unable to find cards for back navigation');
      cancelAnimation();
      return;
    }

    // Store refs for shared element and target rect
    previousItemRef.current = currentCard.data; // Use current card's data for shared element
    selectedItemPosition.current = {
      x: targetRect.x,
      y: targetRect.y,
      width: targetRect.width,
      height: targetRect.height
    };

    // Set the animating item id
    useAnimationStore.getState().setAnimatingItemId(currentCard.data.id);

    // Update z-index for proper layering during animation
    setAnimatedItems(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(currentCardId);
      const previous = newMap.get(previousCardId);
      
      if (current && previous) {
        newMap.set(currentCardId, {
          ...current,
          animation: {
            ...current.animation,
            zIndex: 2
          }
        });
        newMap.set(previousCardId, {
          ...previous,
          animation: {
            ...previous.animation,
            zIndex: 1
          }
        });
      }
      
      return newMap;
    });

    // Start both animations in parallel
    setShowSharedElementBack(true);
    animateBackTransition(currentCard, previousCard, () => {
      // Remove the current card from animatedItems after animation
      setAnimatedItems(prev => {
        const newMap = new Map(prev);
        newMap.delete(currentCardId);
        return newMap;
      });
      
      // Pop the item from the navigation stack after animation
      popItem();
      
      // Ensure animation state is reset to IDLE
      cancelAnimation();
      startAnimation('IDLE');
      completeAnimation();
    });

  }, [contextStack.length, animationState.state, startAnimation, popItem, animatedItems, animateBackTransition, cancelAnimation, completeAnimation]);

  // Handle back navigation events
  useEffect(() => {
    const unsubscribe = subscribe((event) => {
      if (event.action === SymthinkTreeEvent.GO_BACK && animationState.state !== 'ANIMATING' && contextStack.length > 1) {
        navigateBack();
      }
    });
    return () => unsubscribe();
  }, [subscribe, animationState.state, contextStack.length, navigateBack]);

  // Memoize the render function
  const renderCards = useCallback(() => {
    return visibleItems.map((item, index) => {
      const itemId = item.data?.id || `item-${index}`;
      const debugStyle = getDebugStyle(debugState[itemId] || 'IDLE');
      
      return (
        <Animated.View
          key={`card-${index}-${itemId}`}
          ref={item.animation.itemRef}
          style={[
            {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: colors.background,
              zIndex: item.animation.zIndex,
              opacity: item.animation.opacity,
              transform: [
                { translateX: item.animation.position.x },
                { translateY: item.animation.position.y },
                { scale: item.animation.scale }
              ],
            },
            debugStyle
          ]}
        >
          <CardContainer
            data={item.data}
            onItemAction={handleItemAction}
          />
        </Animated.View>
      );
    });
  }, [visibleItems, debugState, getDebugStyle, colors.background, handleItemAction]);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background || '#ffffff',
      height: '100%',
      position: 'relative', // Add this to ensure proper positioning context
    },
    backButton: {
      padding: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
    },
    backButtonText: {
      fontWeight: 'bold',
      fontSize: 16,
    },
    sharedElement: {
      position: 'absolute',
      zIndex: 2000,
      padding: 10,
      borderRadius: 4,
      backgroundColor: colors.background,
      maxWidth: width * 0.8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
      elevation: 5,
      flexDirection: 'row',
      alignItems: 'center',
    },
    sharedElementText: {
      ...globalStyles.text,
      flex: 1,
    },
  });

  return (
    <View style={styles.container}>
      <IconPreloader />
      {renderCards()}
      {showSharedElement && (
        <SharedElement
          initialRect={new DOMRect(
            selectedItemPosition.current.x,
            selectedItemPosition.current.y,
            selectedItemPosition.current.width,
            selectedItemPosition.current.height
          )}
          item={selectedItemRef.current}
          onAnimationComplete={() => {
            notifySharedElFwdAnimDone();
            setShowSharedElement(false);
          }}
        />
      )}
      {showSharedElementBack && (
        <SharedElementBack
          targetRect={new DOMRect(
            selectedItemPosition.current.x,
            selectedItemPosition.current.y,
            selectedItemPosition.current.width,
            selectedItemPosition.current.height
          )}
          item={previousItemRef.current}
          onAnimationComplete={() => {
            setShowSharedElementBack(false);
            // Clear the animating item id
            useAnimationStore.getState().setAnimatingItemId(null);
          }}
        />
      )}
    </View>
  );
}; 