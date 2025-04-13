import React, { useEffect, useRef, useCallback } from 'react';
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
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);

  const startAnimation = useCallback(() => {
    if (!initialRect || isAnimating.current) return;
    
    isAnimating.current = true;
    translateY.setValue(initialRect.y);

    const timeoutId = setTimeout(() => {
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        isAnimating.current = false;
        onAnimationComplete?.();
      });
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      translateY.stopAnimation();
      isAnimating.current = false;
    };
  }, [initialRect, translateY, onAnimationComplete]);

  useEffect(() => {
    return startAnimation();
  }, [startAnimation]);

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
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateY },
          ],
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