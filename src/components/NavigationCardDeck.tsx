import React, { useState, useRef, useEffect, createRef, useCallback } from 'react';
import { View, Animated, StyleSheet, TouchableOpacity, Text, Platform, Dimensions } from 'react-native';
import { CardContainer } from './CardContainer';
import { SymthinkDocument } from '../core/symthink';
import { Subject } from 'rxjs';
import { useTheme } from '../theme/ThemeContext';
import { NavigationProvider, useNavigation } from '../navigation/NavigationContext';

interface NavigationCardDeckProps {
  initialData: SymthinkDocument;
  canEdit?: boolean;
}

interface NavigationItem {
  data: any;
  position: Animated.ValueXY;
  opacity: Animated.Value;
  scale: Animated.Value;
  zIndex: number;
  itemRef?: React.RefObject<View>;
}

export const NavigationCardDeck: React.FC<NavigationCardDeckProps> = ({
  initialData,
  canEdit = false,
}) => {
  console.log('NavigationCardDeck initializing with data:', initialData);
  
  return (
    <NavigationProvider initialItem={initialData}>
      <CardDeckNavigator canEdit={canEdit} />
    </NavigationProvider>
  );
};

interface CardDeckNavigatorProps {
  canEdit?: boolean;
}

const CardDeckNavigator: React.FC<CardDeckNavigatorProps> = ({
  canEdit = false
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
  
  // Create and maintain animated values for each navigation item
  const [animatedItems, setAnimatedItems] = useState<Map<string, NavigationItem>>(new Map());
  
  const notifyRef = useRef<Subject<string>>(new Subject<string>());
  const selectedItemRef = useRef<any>(null);
  const selectedItemPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const sharedElementOpacity = useRef(new Animated.Value(0)).current;
  const sharedElementPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const sharedElementScale = useRef(new Animated.Value(1)).current;

  // Initialize or update animated items when the navigation stack changes
  useEffect(() => {
    console.log('Navigation stack changed, updating animated items');
    
    // Create or get animated values for each item in the stack
    const newAnimatedItems = new Map(animatedItems);
    
    contextStack.forEach((item, index) => {
      const id = item.id || `item-${index}`;
      console.log(`Processing stack item ${index}:`, item.text || 'No text');
      
      if (!newAnimatedItems.has(id)) {
        // Create new animated values for this item
        console.log(`Creating new animated values for item ${id}`);
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
    
    setAnimatedItems(newAnimatedItems);
  }, [contextStack, width]);

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
    console.log('Item action:', action);
    if (action.action === 'support-clicked' && !isAnimating) {
      const supportItem = action.value;
      selectedItemRef.current = supportItem;
      
      // Get the position of the tapped item for shared element animation
      const itemMeasurements = await measureSelectedItem(action.domrect);
      selectedItemPosition.current = {
        x: itemMeasurements.x,
        y: itemMeasurements.y
      };
      
      // Set up the shared element position
      sharedElementPosition.setValue({
        x: itemMeasurements.x,
        y: itemMeasurements.y
      });
      
      // First add the item to the navigation stack
      pushItem(supportItem);
      
      // Then start the transition animation
      navigateForward(supportItem, itemMeasurements);
    }
  };

  const navigateForward = useCallback((item: any, itemMeasurements: { x: number; y: number; width: number; height: number }) => {
    setAnimating(true);

    // Get animated values for current and new cards
    const stack = Array.from(animatedItems.values());
    const currentCard = stack[stack.length - 2]; // Previous top card
    const newCard = stack[stack.length - 1]; // New top card

    if (!currentCard || !newCard) {
      console.warn('Unable to find cards for animation, stack length:', stack.length);
      setAnimating(false);
      return;
    }

    // Show the shared element during transition
    sharedElementOpacity.setValue(1);

    // First phase: Animate current card sliding left
    const currentCardSlideLeft = [
      Animated.timing(currentCard.position, {
        toValue: { x: -width, y: 0 },
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(currentCard.opacity, {
        toValue: 0.5,
        duration: 250,
        useNativeDriver: true,
      }),
    ];

    // Second phase: Move shared element to top of new card
    const moveSharedElement = [
      // Move the shared element to the top of the screen
      Animated.timing(sharedElementPosition, {
        toValue: { x: 20, y: 20 },
        duration: 300,
        useNativeDriver: true,
      }),
      // Scale the shared element if needed
      Animated.timing(sharedElementScale, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ];

    // Third phase: Fade in the new card and hide shared element
    const fadeInNewCard = [
      // Slide the new card in from the right
      Animated.timing(newCard.position, {
        toValue: { x: 0, y: 0 },
        duration: 300,
        useNativeDriver: true,
      }),
      // Fade in the new card
      Animated.timing(newCard.opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      // Fade out the shared element as the new card completes its entrance
      Animated.timing(sharedElementOpacity, {
        toValue: 0,
        duration: 200,
        delay: 150,
        useNativeDriver: true,
      }),
    ];

    // Run all animations in sequence
    Animated.sequence([
      Animated.parallel(currentCardSlideLeft),
      Animated.parallel(moveSharedElement),
      Animated.parallel(fadeInNewCard),
    ]).start(() => {
      setAnimating(false);
    });
  }, [animatedItems, setAnimating, width, sharedElementOpacity, sharedElementPosition, sharedElementScale]);

  const navigateBack = useCallback(() => {
    if (contextStack.length <= 1 || isAnimating) return;
    
    setAnimating(true);

    // Get animated values for current and previous cards
    const stack = Array.from(animatedItems.values());
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
        useNativeDriver: true,
      }),
      Animated.timing(currentCard.opacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ];

    // Second phase: Bring back the previous card from the left
    const previousCardAnimations = [
      Animated.timing(previousCard.position, {
        toValue: { x: 0, y: 0 },
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(previousCard.opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ];

    // Run the animations
    Animated.sequence([
      Animated.parallel(currentCardAnimations),
      Animated.parallel(previousCardAnimations),
    ]).start(() => {
      // Remove the item from navigation context after animation completes
      popItem();
      setAnimating(false);
    });
  }, [contextStack.length, isAnimating, setAnimating, popItem, animatedItems, width]);

  const handleDocAction = (action: { action: string; value: any }) => {
    console.log('Doc action:', action);
    if (action.action === 'go-back') {
      navigateBack();
    }
  };

  const renderBackButton = () => {
    if (contextStack.length <= 1) return null;

    return (
      <TouchableOpacity
        style={styles.backButton}
        onPress={navigateBack}
        disabled={isAnimating}
      >
        <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
      </TouchableOpacity>
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
      position: 'relative',
      backgroundColor: colors.background || '#ffffff',
      overflow: 'hidden',
      minHeight: 400,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: colors.border || '#e0e0e0',
    },
    cardContainer: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      backgroundColor: colors.background || '#ffffff',
    },
    backButton: {
      position: 'absolute',
      top: 10,
      left: 10,
      zIndex: 1000,
      padding: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
    const visibleItems = contextStack.map((item, index) => {
      const id = item.id || `item-${index}`;
      return animatedItems.get(id);
    }).filter((item): item is NavigationItem => item !== undefined);
    
    console.log(`Rendering ${visibleItems.length} visible items`);
    return visibleItems;
  }, [contextStack, animatedItems]);

  const visibleItems = getVisibleItems();
  
  // If we have no visible items, render a fallback card container with the current item
  if (visibleItems.length === 0) {
    console.log('No visible items, rendering fallback with initialData');
    return (
      <View style={styles.container}>
        <CardContainer
          data={currentItem || contextStack[0]}
          canEdit={canEdit}
          notify={notifyRef.current}
          onItemAction={handleItemAction}
          onDocAction={handleDocAction}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderBackButton()}
      {renderSharedElement()}
      
      {visibleItems.map((item, index) => (
        <Animated.View
          key={`card-${index}-${item.data?.id || index}`}
          ref={item.itemRef}
          style={[
            styles.cardContainer,
            {
              zIndex: item.zIndex,
              transform: [
                { translateX: item.position.x },
                { translateY: item.position.y },
                { scale: item.scale },
              ],
              opacity: item.opacity,
            },
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
      ))}
    </View>
  );
}; 