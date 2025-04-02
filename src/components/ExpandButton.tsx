import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface ExpandButtonProps {
  onExpandClick?: () => void;
}

export const ExpandButton: React.FC<ExpandButtonProps> = ({ onExpandClick }) => {
  const { colors } = useTheme();

  const handleClick = () => {
    onExpandClick?.();
  };

  const styles = StyleSheet.create({
    button: {
      height: 40,
      backgroundColor: '#e8e8e8',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 8,
    },
    text: {
      color: '#000000',
      fontSize: 16,
    },
  });

  return (
    <TouchableOpacity
      style={styles.button}
      onPress={handleClick}
    >
      <Text style={styles.text}>⤢</Text>
    </TouchableOpacity>
  );
}; 