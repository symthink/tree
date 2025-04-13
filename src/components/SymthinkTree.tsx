import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { View, Animated, StyleSheet, Text, Dimensions, Pressable } from 'react-native';
import { CardContainer } from './CardContainer';
import { ISymthinkDocument, StateEnum, SymthinkDocument } from '../core/symthink.class';
import { Subject } from 'rxjs';
import { useTheme } from '../theme/ThemeContext';
import { NavigationProvider, useNavigation } from '../navigation/NavigationContext';
import { useCardAnimation, NavigationItem } from '../hooks/useCardAnimation';
import { globalStyles } from '../theme/globalStyles';
import { Icon } from './Icon';
import { IconPreloader } from './IconPreloader';
import { SharedElement } from './SharedElement';
import { useAnimation } from '../animation/AnimationContext';

interface SymthinkTreeProps {
  initialData: ISymthinkDocument;
  canEdit?: boolean;
  canGoBack?: boolean;
  onBackComplete?: () => void;
}

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

export const SymthinkTree: React.FC<SymthinkTreeProps> = ({
  initialData,
  canEdit = false,
  canGoBack = false,
  onBackComplete,
}) => {
  const [doc] = useState<SymthinkDocument>(() => {
    const std = new SymthinkDocument();
    std.load(initialData);
    std.state$.next(StateEnum.Viewing);
    return std;
  });    

  return (
    <NavigationProvider initialItem={doc}>
      <CardDeckNavigator 
        canEdit={canEdit} 
        canGoBack={canGoBack}
        onBackComplete={onBackComplete}
      />
    </NavigationProvider>
  );
};

interface CardDeckNavigatorProps {
  canEdit?: boolean;
  canGoBack?: boolean;
  onBackComplete?: () => void;
}

const CardDeckNavigator: React.FC<CardDeckNavigatorProps> = ({
  canEdit = false,
  canGoBack = false,
  onBackComplete,
}) => {
  const { colors } = useTheme();
  const { width } = Dimensions.get('window');
  const { navigationStack: contextStack, currentItem, pushItem, popItem } = useNavigation();
  const { state: animationState, dispatch: animationDispatch } = useAnimation();
  
  // Replace useRef with useState for animated items
  const [animatedItems, setAnimatedItems] = useState<Map<string, NavigationItem>>(new Map());
  const notifyRef = useRef<Subject<string>>(new Subject<string>());
  const selectedItemRef = useRef<any>(null);
  const selectedItemPosition = useRef<{ x: number; y: number; width: number; height: number }>({ x: 0, y: 0, width: 0, height: 0 });
  const [showSharedElement, setShowSharedElement] = useState(false);

  const { createAnimationValues, animateCardTransition, animateBackTransition, debugState, getDebugStyle } = useCardAnimation(width, {
    onAnimationStart: () => {
      animationDispatch({ type: 'START_ANIMATION' });
    },
    onAnimationEnd: () => {
      animationDispatch({ type: 'COMPLETE_ANIMATION' });
    },
    onAnimationCancel: () => {
      animationDispatch({ type: 'CANCEL_ANIMATION' });
    },
  });

  // Memoize the visible items computation
  const visibleItems = useMemo(() => {
    return contextStack.map((item, index) => {
      const id = item.id || `item-${index}`;
      const animItem = animatedItems.get(id);
      
      if (!animItem) {
        return {
          data: item,
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

  // Update animated items when visible items change
  useEffect(() => {
    const newAnimatedItems = new Map();
    visibleItems.forEach((item, index) => {
      const id = item.data.id || `item-${index}`;
      newAnimatedItems.set(id, item);
    });
    
    // Only update if there are actual changes
    const currentKeys = Array.from(animatedItems.keys());
    const newKeys = Array.from(newAnimatedItems.keys());
    
    if (currentKeys.length !== newKeys.length || 
        !currentKeys.every(key => newAnimatedItems.has(key)) ||
        !newKeys.every(key => animatedItems.has(key))) {
      setAnimatedItems(newAnimatedItems);
    }
  }, [visibleItems, animatedItems]);

  // Clean up the subject when component unmounts
  useEffect(() => {
    return () => {
      notifyRef.current.complete();
    };
  }, []);

  const handleItemAction = useCallback((action: ItemAction) => {
    if (action.action === 'support-clicked' && animationState.state === 'IDLE') {
      const item = action.value;
      selectedItemRef.current = item;
      selectedItemPosition.current = action.domrect || { x: 0, y: 0, width: 0, height: 0 };
      setShowSharedElement(true);
      
      const currentCardId = contextStack[contextStack.length - 1]?.id || `item-${contextStack.length - 1}`;
      const currentCard = animatedItems.get(currentCardId);
      
      if (!currentCard) {
        console.error('Could not find current card for animation');
        return;
      }
      
      // Initialize the new card in the animation map before pushing to stack
      const newCardId = item.id || `item-${contextStack.length}`;
      const newCard: NavigationItem = {
        data: item,
        animation: createAnimationValues(contextStack.length),
      };
      
      // Update the state with the new card
      setAnimatedItems(prev => {
        const newMap = new Map(prev);
        newMap.set(newCardId, newCard);
        return newMap;
      });
      
      // Now push the item to the stack and handle the animation
      void (async () => {
        try {
          await pushItem(item);
          animateCardTransition(currentCard, newCard, () => {
            animationDispatch({ type: 'COMPLETE_ANIMATION' });
            setShowSharedElement(false);
          });
        } catch (error) {
          console.error('Error during navigation:', error);
          animationDispatch({ type: 'CANCEL_ANIMATION' });
          setShowSharedElement(false);
        }
      })();
    }
  }, [pushItem, contextStack, animatedItems, createAnimationValues, animateCardTransition, animationState.state]);

  const handleDocAction = useCallback((action: DocAction) => {
    if (action.action === 'go-back') {
      if (contextStack.length <= 1 || animationState.state === 'ANIMATING') {
        return;
      }

      const stack = Array.from(animatedItems.values());
      const currentCard = stack[stack.length - 1];
      const previousCard = stack[stack.length - 2];

      if (!currentCard || !previousCard) {
        console.warn('Unable to find cards for back navigation');
        return;
      }

      animationDispatch({ type: 'START_ANIMATION' });
      animateBackTransition(currentCard, previousCard, () => {
        popItem();
        animationDispatch({ type: 'COMPLETE_ANIMATION' });
        if (onBackComplete) {
          onBackComplete();
        }
      });
    }
  }, [contextStack.length, animationState.state, popItem, onBackComplete, animatedItems, animateBackTransition]);

  const navigateBack = useCallback(() => {
    if (canGoBack && animationState.state === 'IDLE' && contextStack.length > 1) {
      handleDocAction({ action: 'go-back', value: currentItem });
    }
  }, [canGoBack, animationState.state, handleDocAction, contextStack.length, currentItem]);

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

  // If we have no visible items, render a fallback card container with the current item
  if (visibleItems.length === 0) {
    // console.log('No visible items, rendering fallback with initialData');
    return (
      <View style={styles.container}>
        <Text>No visible items</Text>
      </View>
    );
  }
  return (
    <View style={styles.container}>
      <IconPreloader />
      {/* {renderBackButton()}
      {renderSharedElement()} */}
      
      {visibleItems.map((item, index) => {
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
              canEdit={canEdit}
              notify={notifyRef.current}
              onItemAction={handleItemAction}
              onDocAction={handleDocAction}
            />
          </Animated.View>
        );
      })}

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
            setShowSharedElement(false);
          }}
        />
      )}
    </View>
  );
}; 