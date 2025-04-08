import React, { useState, useRef, useEffect, createRef, useCallback } from 'react';
import { View, Animated, StyleSheet, TouchableOpacity, Text, Platform, Dimensions, Pressable } from 'react-native';
import { CardContainer } from './CardContainer';
import { ISymthinkDocument, StateEnum, SymthinkDocument } from '../core/symthink.class';
import { Subject } from 'rxjs';
import { useTheme } from '../theme/ThemeContext';
import { NavigationProvider, useNavigation } from '../navigation/NavigationContext';

interface SymthinkTreeProps {
  initialData: ISymthinkDocument;
  canEdit?: boolean;
  canGoBack?: boolean;
  onBackComplete?: () => void;
}

interface NavigationItem {
  data: any;
  position: Animated.ValueXY;
  opacity: Animated.Value;
  scale: Animated.Value;
  zIndex: number;
  itemRef?: React.RefObject<View>;
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
  console.log('CardDeckNavigator rendering');
  
  const { colors } = useTheme();
  const { width, height } = Dimensions.get('window');
  const { navigationStack: contextStack, currentItem, pushItem, popItem, isAnimating, setAnimating } = useNavigation();
  
  console.log('Navigation context:', { 
    stackLength: contextStack.length, 
    currentItem: currentItem?.text || 'No current item',
    isAnimating 
  });
  
  const animatedItems = useRef<Map<string, NavigationItem>>(new Map());
  const [animatedItemsVersion, setAnimatedItemsVersion] = useState(0);
  const notifyRef = useRef<Subject<string>>(new Subject<string>());
  const selectedItemRef = useRef<any>(null);
  const selectedItemPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const sharedElementOpacity = useRef(new Animated.Value(0)).current;
  const sharedElementPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const sharedElementScale = useRef(new Animated.Value(1)).current;

  // Initialize or update animated items when the navigation stack changes
  useEffect(() => {
    console.log('Navigation stack changed, updating animated items');
    
    // Create a new map that exactly matches the contextStack
    const newAnimatedItems = new Map();
    
    contextStack.forEach((item, index) => {
      const id = item.id || `item-${index}`;
      console.log(`Processing stack item ${index}:`, item.text || 'No text');
      
      // Reuse existing animated values if possible to prevent animation jumps
      const existingItem = animatedItems.current.get(id);
      
      if (existingItem) {
        // Update the data but keep the animated values
        newAnimatedItems.set(id, {
          ...existingItem,
          data: item,
          zIndex: index + 1,
        });
      } else {
        // Create new animated values for the item
        newAnimatedItems.set(id, {
          data: item,
          position: new Animated.ValueXY(index === 0 ? { x: 0, y: 0 } : { x: width, y: 0 }),
          opacity: new Animated.Value(index === 0 ? 1 : 0),
          scale: new Animated.Value(1),
          zIndex: index + 1,
          itemRef: createRef<View>(),
        });
      }
    });
    
    // Update the ref value and increment the version to trigger a re-render
    animatedItems.current = newAnimatedItems;
    setAnimatedItemsVersion(v => v + 1);
  }, [contextStack, width]);

  // Initialize animated items on mount
  useEffect(() => {
    if (contextStack.length > 0 && animatedItems.current.size === 0) {
      const newAnimatedItems = new Map();
      contextStack.forEach((item, index) => {
        const id = item.id || `item-${index}`;
        newAnimatedItems.set(id, {
          data: item,
          position: new Animated.ValueXY(index === 0 ? { x: 0, y: 0 } : { x: width, y: 0 }),
          opacity: new Animated.Value(index === 0 ? 1 : 0),
          scale: new Animated.Value(1),
          zIndex: index + 1,
          itemRef: createRef<View>(),
        });
      });
      // Update state instead of ref
      animatedItems.current = newAnimatedItems;
      setAnimatedItemsVersion(v => v + 1);
    }
  }, []);

  // Clean up the subject when component unmounts
  useEffect(() => {
    return () => {
      notifyRef.current.complete();
    };
  }, []);

  const measureSelectedItem = (domrect?: DOMRect): Promise<{ x: number; y: number; width: number; height: number }> => {
    return new Promise((resolve) => {
      if (domrect) {
        // Use the provided DOMRect if available (web platform)
        resolve({
          x: domrect.x,
          y: domrect.y,
          width: domrect.width,
          height: domrect.height
        });
      } else {
        // Default position if measurement fails
        resolve({ x: 0, y: 100, width: width, height: 50 });
      }
    });
  };

  const handleItemAction = async (action: { 
    action: string; 
    value: any; 
    domrect?: DOMRect; 
    pointerEvent?: any 
  }) => {
    console.log('Item action:', action.action, isAnimating, action.domrect);
    if (action.action === 'support-clicked' && !isAnimating) {
      const supportItem = action.value;
      
      console.log('Support clicked, stack length:', contextStack.length);
      console.log('Animated items:', Array.from(animatedItems.current.keys()));
      
      // Set animating state to prevent multiple clicks
      setAnimating(true);
      
      // Find the current card before we push the new one
      const currentCardId = contextStack[contextStack.length - 1]?.id || `item-${contextStack.length - 1}`;
      console.log('Looking for card with ID:', currentCardId);
      
      const currentCard = animatedItems.current.get(currentCardId);
      console.log('Found card:', currentCard ? 'yes' : 'no');
      
      if (!currentCard) {
        console.error('Could not find current card for animation');
        setAnimating(false);
        return;
      }
      
      // Add a debug listener to the animation value to log changes
      const debugXListener = currentCard.position.x.addListener(({ value }) => {
        console.log('Current animation X value:', value);
      });
      
      // First, push the new item to the stack
      await pushItem(supportItem);
      
      // Get the new card that was just added
      const newCardId = supportItem.id || `item-${contextStack.length - 1}`;
      const newCard = animatedItems.current.get(newCardId);
      
      if (!newCard) {
        console.error('Could not find new card for animation');
        setAnimating(false);
        return;
      }
      
      // Set initial position for new card (off screen to the right)
      newCard.position.setValue({ x: width, y: 0 });
      newCard.opacity.setValue(0);
      
      // Start both animations in parallel
      Animated.parallel([
        // Slide current card left
        Animated.timing(currentCard.position, {
          toValue: { x: -width, y: 0 },
          duration: 500,
          useNativeDriver: Platform.OS !== 'web',
        }),
        // Slide new card in from right
        Animated.timing(newCard.position, {
          toValue: { x: 0, y: 0 },
          duration: 500,
          useNativeDriver: Platform.OS !== 'web',
        }),
        // Fade in new card
        Animated.timing(newCard.opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: Platform.OS !== 'web',
        })
      ]).start((result) => {
        console.log('Slide animation completed, success:', result.finished);
        
        // Remove the debug listener
        currentCard.position.x.removeListener(debugXListener);
        setAnimating(false);
      });
    }
  };

  const navigateBack = useCallback(() => {
    if (contextStack.length <= 1 || isAnimating) {
      console.log('Cannot navigate back:', { stackLength: contextStack.length, isAnimating });
      return;
    }
    
    setAnimating(true);

    // Get animated values for current and previous cards
    const stack = Array.from(animatedItems.current.values());
    const currentCard = stack[stack.length - 1]; // Current top card
    const previousCard = stack[stack.length - 2]; // Previous card to return to

    if (!currentCard || !previousCard) {
      console.warn('Unable to find cards for back navigation, stack length:', stack.length);
      setAnimating(false);
      return;
    }

    // First phase: Fade out current card to the right
    const currentCardAnimations = [
      Animated.timing(currentCard.position, {
        toValue: { x: width, y: 0 },
        duration: 250,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(currentCard.opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ];

    // Second phase: Bring back the previous card from the left
    const previousCardAnimations = [
      Animated.timing(previousCard.position, {
        toValue: { x: 0, y: 0 },
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }),
      Animated.timing(previousCard.opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: Platform.OS !== 'web',
      }),
    ];

    // Run the animations
    Animated.sequence([
      Animated.parallel(currentCardAnimations),
      Animated.parallel(previousCardAnimations),
    ]).start(() => {
      console.log('Back navigation animation complete');
      // Remove the item from navigation context after animation completes
      popItem();
      setAnimating(false);
      onBackComplete?.();
    });
  }, [contextStack.length, isAnimating, setAnimating, popItem, animatedItems, width, onBackComplete]);

  // Add effect to handle canGoBack prop
  useEffect(() => {
    if (canGoBack && !isAnimating && contextStack.length > 1) {
      navigateBack();
    }
  }, [canGoBack, isAnimating, navigateBack, contextStack.length]);

  const handleDocAction = (action: { action: string; value: any }) => {
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
    // If we have no animated items but have a context stack, initialize them
    if (animatedItems.current.size === 0 && contextStack.length > 0) {
      const newAnimatedItems = new Map();
      contextStack.forEach((item, index) => {
        const id = item.id || `item-${index}`;
        newAnimatedItems.set(id, {
          data: item,
          position: new Animated.ValueXY(index === 0 ? { x: 0, y: 0 } : { x: width, y: 0 }),
          opacity: new Animated.Value(index === 0 ? 1 : 0),
          scale: new Animated.Value(1),
          zIndex: index + 1,
          itemRef: createRef<View>(),
        });
      });
      // Update state instead of ref in the next render cycle
      animatedItems.current = newAnimatedItems;
      setAnimatedItemsVersion(v => v + 1);
    }

    // Create a sorted array of animated items based on the navigation stack
    const visibleItems = contextStack.map((item, index) => {
      const id = item.id || `item-${index}`;
      const animItem = animatedItems.current.get(id);
      
      if (!animItem) {
        console.warn(`Could not find animated item for ${id}, trying to create it`);
        // Create it on the fly if missing
        const newItem = {
          data: item,
          position: new Animated.ValueXY(index === 0 ? { x: 0, y: 0 } : { x: width, y: 0 }),
          opacity: new Animated.Value(index === 0 ? 1 : 0),
          scale: new Animated.Value(1),
          zIndex: index + 1,
          itemRef: createRef<View>(),
        };
        animatedItems.current.set(id, newItem);
        return newItem;
      }
      
      return animItem;
    }).filter((item): item is NavigationItem => item !== undefined);
    
    console.log(`Rendering ${visibleItems.length} visible items`);
    return visibleItems;
  }, [contextStack, width, animatedItemsVersion]);

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

  // Let's add a logging function to help debug the render process
  useEffect(() => {
    console.log('Rendered CardDeckNavigator with', visibleItems.length, 'visible items');
    visibleItems.forEach((item, i) => {
      console.log(`- Item ${i}: id=${item.data?.id}, zIndex=${item.zIndex}, has ref=${!!item.itemRef}`);
    });
  }, [visibleItems]);

  // Add a debug effect to monitor navigation state
  useEffect(() => {
    console.log('Navigation state changed:', {
      stackLength: contextStack.length,
      currentItem: currentItem?.text,
      isAnimating,
      canEdit
    });
  }, [contextStack, currentItem, isAnimating, canEdit]);

  return (
    <View style={styles.container}>
      {renderBackButton()}
      {renderSharedElement()}
      
      {visibleItems.map((item, index) => (
        <Animated.View
          key={`card-${index}-${item.data?.id || index}`}
          ref={item.itemRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: colors.background,
            zIndex: item.zIndex,
            opacity: item.opacity,
            transform: [
              { translateX: item.position.x },
              { translateY: item.position.y },
              { scale: item.scale }
            ],
          }}
        >
          <CardContainer
            data={item.data}
            canEdit={canEdit}
            notify={notifyRef.current}
            onItemAction={handleItemAction}
            onDocAction={handleDocAction}
          />
        </Animated.View>
      ))}
    </View>
  );
}; 