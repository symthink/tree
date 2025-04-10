import React, { useState, useRef, useEffect, createRef, useCallback } from 'react';
import { View, Animated, StyleSheet, TouchableOpacity, Text, Platform, Dimensions, Pressable } from 'react-native';
import { CardContainer } from './CardContainer';
import { ISymthinkDocument, StateEnum, SymthinkDocument } from '../core/symthink.class';
import { Subject } from 'rxjs';
import { useTheme } from '../theme/ThemeContext';
import { NavigationProvider, useNavigation } from '../navigation/NavigationContext';
import { useCardAnimation, NavigationItem, AnimationHandlers } from '../hooks/useCardAnimation';

interface SymthinkTreeProps {
  initialData: ISymthinkDocument;
  canEdit?: boolean;
  canGoBack?: boolean;
  onBackComplete?: () => void;
}

// Animation state interfaces
interface AnimationValues {
  position: Animated.ValueXY;
  opacity: Animated.Value;
  scale: Animated.Value;
}

interface AnimationState extends AnimationValues {
  zIndex: number;
  itemRef: React.RefObject<View>;
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
  const { navigationStack: contextStack, currentItem, pushItem, popItem, isAnimating, setAnimating } = useNavigation();
  
  // Replace useRef with useState for animated items
  const [animatedItems, setAnimatedItems] = useState<Map<string, NavigationItem>>(new Map());
  const notifyRef = useRef<Subject<string>>(new Subject<string>());
  const selectedItemRef = useRef<any>(null);
  const selectedItemPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const sharedElementOpacity = useRef(new Animated.Value(0)).current;
  const sharedElementPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const sharedElementScale = useRef(new Animated.Value(1)).current;

  const animationHandlers: AnimationHandlers = {
    onAnimationStart: () => {
      console.log('Animation started');
      // You could add loading indicators or disable interactions here
    },
    onAnimationEnd: () => {
      console.log('Animation completed successfully');
      // You could re-enable interactions or hide loading indicators here
    },
    onAnimationCancel: () => {
      console.log('Animation was cancelled');
      // You could handle cleanup or error states here
    },
  };

  const { createAnimationValues, animateCardTransition, animateBackTransition, debugState, getDebugStyle } = useCardAnimation(width, animationHandlers);

  // Update the effect to use setAnimatedItems
  useEffect(() => {
    const newAnimatedItems = new Map();
    
    contextStack.forEach((item, index) => {
      const id = item.id || `item-${index}`;
      
      // Reuse existing animated values if possible to prevent animation jumps
      const existingItem = animatedItems.get(id);
      
      if (existingItem) {
        // Update the data but keep the animated values
        newAnimatedItems.set(id, {
          ...existingItem,
          data: item,
          animation: {
            ...existingItem.animation,
            zIndex: index + 1,
          },
        });
      } else {
        // Create new animated values for the item
        newAnimatedItems.set(id, {
          data: item,
          animation: createAnimationValues(index),
        });
      }
    });
    
    setAnimatedItems(newAnimatedItems);
  }, [contextStack, width, createAnimationValues]);

  // Clean up the subject when component unmounts
  useEffect(() => {
    return () => {
      notifyRef.current.complete();
    };
  }, []);

  const handleItemAction = async (action: ItemAction) => {
    if (action.action === 'support-clicked' && !isAnimating) {
      const supportItem = action.value;
      setAnimating(true);
      
      const currentCardId = contextStack[contextStack.length - 1]?.id || `item-${contextStack.length - 1}`;
      const currentCard = animatedItems.get(currentCardId);
      
      if (!currentCard) {
        console.error('Could not find current card for animation');
        setAnimating(false);
        return;
      }
      
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
        setAnimating(false);
      });
    }
  };

  const navigateBack = useCallback(() => {
    if (contextStack.length <= 1 || isAnimating) {
      return;
    }
    
    setAnimating(true);

    const stack = Array.from(animatedItems.values());
    const currentCard = stack[stack.length - 1];
    const previousCard = stack[stack.length - 2];

    if (!currentCard || !previousCard) {
      console.warn('Unable to find cards for back navigation');
      setAnimating(false);
      return;
    }

    // Clean up the current card after animation
    const currentCardId = contextStack[contextStack.length - 1]?.id || `item-${contextStack.length - 1}`;

    animateBackTransition(currentCard, previousCard, () => {
      // Remove the item from navigation context after animation completes
      popItem();
      
      // Clean up the animated item
      setAnimatedItems(prev => {
        const newMap = new Map(prev);
        newMap.delete(currentCardId);
        return newMap;
      });
      
      setAnimating(false);
      onBackComplete?.();
    });
  }, [contextStack.length, isAnimating, setAnimating, popItem, width, onBackComplete, animatedItems, animateBackTransition]);

  // Add effect to handle canGoBack prop
  useEffect(() => {
    if (canGoBack && !isAnimating && contextStack.length > 1) {
      navigateBack();
    }
  }, [canGoBack, isAnimating, navigateBack, contextStack.length]);

  const handleDocAction = (action: DocAction) => {
    console.log('Doc action:', action);
    if (action.action === 'go-back') {
      navigateBack();
    }
  };

  const renderBackButton = () => {
    // Only show built-in back button if:
    // 1. We're in not edit mode
    // 2. We have more than one item in the stack
    // 3. The current item has a parent (meaning it's not the root)
    const shouldShowBack = !canEdit && 
      contextStack.length > 1 && 
      currentItem && 
      currentItem.parent !== null;
    
    console.log('Back button conditions:', {
      canEdit,
      stackLength: contextStack.length,
      hasCurrentItem: !!currentItem,
      hasParent: currentItem?.parent !== null,
      shouldShowBack
    });
    
    if (!shouldShowBack) return null;

    return (
      <Pressable
        style={[
          styles.backButton, 
          { 
            marginTop: 16,
            position: 'absolute',
            top: 0,
            left: 16,
            zIndex: 1000, // Ensure it's above the cards
          }
        ]}
        onPress={navigateBack}
        disabled={isAnimating}
      >
        <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
      </Pressable>
    );
  };

  const renderSharedElement = () => {
    // Only render the shared element during transitions
    if (!selectedItemRef.current) return null;

    return (
      <Animated.View
        style={[
          styles.sharedElement,
          {
            opacity: sharedElementOpacity,
            transform: [
              { translateX: sharedElementPosition.x },
              { translateY: sharedElementPosition.y },
              { scale: sharedElementScale },
            ],
          },
        ]}
      >
        <Text numberOfLines={1} style={styles.sharedElementText}>
          {selectedItemRef.current.text || "Supporting idea"}
        </Text>
      </Animated.View>
    );
  };

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
      backgroundColor: colors.primary,
      maxWidth: width * 0.8,
    },
    sharedElementText: {
      color: 'white',
      fontWeight: 'bold',
    },
  });

  const getVisibleItems = useCallback(() => {
    // Create a sorted array of animated items based on the navigation stack
    return contextStack.map((item, index) => {
      const id = item.id || `item-${index}`;
      let animItem = animatedItems.get(id);
      
      // Create a new NavigationItem if one doesn't exist
      if (!animItem) {
        const newItem: NavigationItem = {
          data: item,
          animation: createAnimationValues(index),
        };
        animItem = newItem;
        // Update the state with the new item
        setAnimatedItems(prev => {
          const newMap = new Map(prev);
          newMap.set(id, newItem);
          return newMap;
        });
      } else {
        // Update the zIndex of existing items
        animItem.animation.zIndex = index + 1;
      }
      
      return animItem;
    });
  }, [contextStack, width, animatedItems, createAnimationValues]);

  const visibleItems = getVisibleItems();
  
  // If we have no visible items, render a fallback card container with the current item
  if (visibleItems.length === 0) {
    console.log('No visible items, rendering fallback with initialData');
    return (
      <View style={styles.container}>
        <Text>No visible items</Text>
        {/* <CardContainer
          data={currentItem || contextStack[0]}
          canEdit={canEdit}
          notify={notifyRef.current}
          onItemAction={handleItemAction}
          onDocAction={handleDocAction}
        /> */}
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderBackButton()}
      {renderSharedElement()}
      
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
    </View>
  );
}; 