import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface ItemIconProps {
  type?: string;
  size?: 'small' | 'medium' | 'large';
}

export const ItemIcon: React.FC<ItemIconProps> = ({
  type = 'default',
  size = 'medium',
}) => {
  const { colors } = useTheme();

  // Map icon size to pixel values
  const sizeMap = {
    small: 16,
    medium: 24,
    large: 32,
  };

  // Map item types to icons
  // This would be expanded to match the actual item types used
  const getIcon = (type: string) => {
    switch (type) {
      case 'question':
        return '?';
      case 'answer':
        return 'A';
      case 'event':
        return 'E';
      case 'idea':
        return 'I';
      case 'claim':
        return 'C';
      case 'evidence':
        return 'Ev';
      case 'objection':
        return 'O';
      default:
        return '•';
    }
  };

  // Map item types to colors
  // This would be expanded to match the actual styling used
  const getColor = (type: string) => {
    switch (type) {
      case 'question':
        return '#007bff';
      case 'answer':
        return '#28a745';
      case 'event':
        return '#dc3545';
      case 'idea':
        return '#ffc107';
      case 'claim':
        return '#6610f2';
      case 'evidence':
        return '#20c997';
      case 'objection':
        return '#fd7e14';
      default:
        return colors.primary;
    }
  };

  const styles = StyleSheet.create({
    container: {
      width: sizeMap[size],
      height: sizeMap[size],
      borderRadius: sizeMap[size] / 2,
      backgroundColor: getColor(type),
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: '#ffffff',
      fontSize: sizeMap[size] / 2,
      fontWeight: 'bold',
    },
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{getIcon(type)}</Text>
    </View>
  );
}; 