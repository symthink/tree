import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface ItemOptionsProps {
  item: any; // Replace with proper type when migrating core classes
  onOptionsClick?: (item: any, event: any) => void;
}

export const ItemOptions: React.FC<ItemOptionsProps> = ({ item, onOptionsClick }) => {
  const { colors } = useTheme();

  const handleOptionsClick = (evt: any) => {
    if (evt) {
      evt.stopPropagation();
      evt.preventDefault();
    }
    onOptionsClick?.(item, evt);
  };

  const styles = StyleSheet.create({
    button: {
      backgroundColor: colors.primary,
      borderRadius: 4,
      padding: 8,
      justifyContent: 'center',
      alignItems: 'center',
    },
    text: {
      color: '#ffffff',
      fontSize: 16,
    },
  });

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleOptionsClick}
    >
      <Text style={styles.text}>⋯</Text>
    </TouchableOpacity>
  );
}; 