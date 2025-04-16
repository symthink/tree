import React, { useEffect, useRef, useCallback } from 'react';
import { Animated, View, StyleSheet, Text } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { globalStyles } from '../theme/globalStyles';
import { Icon } from './Icon';

interface SharedElementBackProps {
  targetRect?: DOMRect;
  item?: any; // The target item to animate to
  onAnimationComplete?: () => void;
}

export const SharedElementBack: React.FC<SharedElementBackProps> = ({
  targetRect,
  item,
  onAnimationComplete,
}) => {
  const { colors } = useTheme();
  const translateY = useRef(new Animated.Value(0)).current;
  const isAnimating = useRef(false);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  const startAnimation = useCallback(() => {
    if (!targetRect || isAnimating.current) return;

    isAnimating.current = true;
    translateY.setValue(0); // Start at top (0)

    // Clear any existing animation
    if (animationRef.current) {
      animationRef.current.stop();
    }

    const timeoutId = setTimeout(() => {
      animationRef.current = Animated.timing(translateY, {
        toValue: targetRect.y,
        duration: 400,
        useNativeDriver: true,
      });

      animationRef.current.start(({ finished }) => {
        if (finished) {
          isAnimating.current = false;
          onAnimationComplete?.();
        }
      });
    }, 50);

    return () => {
      clearTimeout(timeoutId);
      if (animationRef.current) {
        animationRef.current.stop();
      }
      isAnimating.current = false;
    };
  }, [targetRect, translateY, onAnimationComplete]);

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

  if (!targetRect || !item) {
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
        <View style={{ flex: 1 }}>
          {item.label && <Text style={globalStyles.label}>{item.label}</Text>}
          <Text style={styles.text}>{item.text || "Add supporting idea..."}</Text>
        </View>
      </View>
    </Animated.View>
  );
}; 