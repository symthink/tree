import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { TextEditor } from './TextEditor';

interface SupportItemProps {
  item: any; // Replace with proper type
  canEdit?: boolean;
  parentDoc?: any; // Replace with proper type
  onItemClick?: (item: any, event: any) => void;
  onTextChange?: (item: any, isModified: boolean) => void;
  onKeyAction?: (key: string, type?: string) => void;
}

export const SupportItem: React.FC<SupportItemProps> = ({
  item,
  canEdit = false,
  parentDoc,
  onItemClick,
  onTextChange,
  onKeyAction,
}) => {
  const { colors } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  
  const isEditable = !!(item.selected && canEdit);

  const handleClick = (e: any) => {
    if (onItemClick) {
      onItemClick(item, e);
    }
  };

  const handleTextChange = (item: any, isModified: boolean) => {
    if (onTextChange) {
      onTextChange(item, isModified);
    }
  };

  const handleKeyAction = (key: string, type?: string) => {
    if (onKeyAction) {
      onKeyAction(key, type);
    }
  };

  // Handle hover events for web only
  const hoverProps = Platform.OS === 'web' ? {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  } : {};

  const styles = StyleSheet.create({
    container: {
      borderRadius: 4,
      borderWidth: 1,
      borderColor: colors.border,
      padding: 8,
      marginVertical: 4,
      backgroundColor: item.selected ? '#e8f4ff' : colors.background,
    },
    hovered: {
      backgroundColor: '#f5f5f5',
    },
    text: {
      color: colors.text,
      fontSize: 14,
    },
    placeholder: {
      color: '#888888',
      fontSize: 14,
      fontStyle: 'italic',
    }
  });
  
  return (
    <TouchableOpacity
      style={[
        styles.container,
        isHovered && canEdit && !item.selected ? styles.hovered : null
      ]}
      onPress={handleClick}
      {...hoverProps}
    >
      {isEditable ? (
        <TextEditor
          item={item}
          height={40}
          isTopItem={false}
          placeholder="Add supporting idea..."
          onTextChange={handleTextChange}
          onKeyAction={handleKeyAction}
        />
      ) : (
        <Text style={item.text ? styles.text : styles.placeholder}>
          {item.text || "Add supporting idea..."}
        </Text>
      )}
    </TouchableOpacity>
  );
}; 