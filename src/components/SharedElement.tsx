import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Dimensions, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { ANIMATION_CONFIG } from '../constants/animation';
import { globalStyles } from '../theme/globalStyles';
import { Icon } from './Icon';

interface SharedElementProps {
  initialRect?: DOMRect;
  item?: any; // The clicked support item
  onAnimationComplete?: () => void;
}

export const SharedElement: React.FC<SharedElementProps> = ({
  initialRect,
  item,
  onAnimationComplete,
}) => {
  console.log('SharedElement render:', { initialRect, item });

  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(0)).current;
  // const position = useRef(new Animated.ValueXY()).current;
  // const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    console.log('SharedElement useEffect:', { initialRect });
    if (!initialRect) throw new Error('initialRect is required');

    // Set position immediately without animation
    translateY.setValue(initialRect.y);

    // Start animation after a short delay to ensure the element is mounted
    const timeoutId = setTimeout(() => {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        onAnimationComplete?.();
      });
    }, 50);

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      translateY.stopAnimation();
    };
  }, [initialRect, onAnimationComplete]);


  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      width: '100%',
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      zIndex: 2000,
      pointerEvents: 'none',
      left: 0,
      top: 0,
    },
    backButtonContainer: {
      ...globalStyles.listItemIconContainer,
      margin: 'auto',
      marginRight: 4,
      marginLeft: -4,
    },
    content: {
      ...globalStyles.listItemRow,
      height: '100%', // Ensure content fills the height
    },
    bullet: {
      ...globalStyles.listItemIcon,
      color: colors.link,
    },
    text: {
      ...globalStyles.text,
      flex: 1,
    },
  });

  if (!initialRect || !item) {
    console.log('SharedElement not rendering:', { initialRect, item });
    return null;
  }

  console.log('SharedElement dimensions:', {
    width: initialRect.width,
    height: initialRect.height,
    x: initialRect.x,
    y: initialRect.y
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            // { translateX: position.x },
            { translateY },
          ],
          // opacity,
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.backButtonContainer}>
          <Icon name="chevron-left" size={26} color={colors.link} />
        </View>
        <Text style={styles.text}>{item.text || "Add supporting idea..."}</Text>
      </View>
    </Animated.View>
  );
}; 