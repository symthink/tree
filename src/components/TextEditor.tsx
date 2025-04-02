import React, { useEffect, useRef, useState } from 'react';
import { TextInput, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface TextEditorProps {
  item: any; // Replace with proper type when migrating core classes
  placeholder?: string;
  height?: number;
  isTopItem?: boolean;
  onTextChange?: (item: any, isModified: boolean) => void;
  onKeyAction?: (key: string, type?: string) => void;
}

export const TextEditor: React.FC<TextEditorProps> = ({
  item,
  placeholder = '',
  height = 50,
  isTopItem = false,
  onTextChange,
  onKeyAction,
}) => {
  const { colors } = useTheme();
  const textInputRef = useRef<TextInput>(null);
  const [text, setText] = useState('');

  // Initialize with the correct text
  useEffect(() => {
    setText(isTopItem ? item.getCurrentItemText?.(true) || '' : item.getSupportItemText?.() || '');
  }, [item, isTopItem]);

  const focus = () => {
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  };

  useEffect(() => {
    // Auto-focus the input when component mounts
    focus();
  }, []);

  const onKeyUp = (evt: any) => {
    if (evt.key === 'Enter') {
      evt.stopPropagation();
      evt.preventDefault();
      onKeyAction?.('Enter', isTopItem ? 'top' : undefined);
    }
  };

  const handleTextChange = (newText: string) => {
    setText(newText);
    item.text = newText;
    
    // This is a simplification - in a real implementation we would need to 
    // handle the sympunk regex and card rules logic from the original component
    onTextChange?.(item, true);
  };

  const handleBlur = () => {
    let newVal = text.trim();
    
    // This is a placeholder for the sympunk and text processing logic
    // In a real implementation, we would need to migrate the logic from the original component
    
    // Simple capitalization as an example
    if (newVal.length > 0) {
      newVal = newVal.charAt(0).toUpperCase() + newVal.slice(1);
    }
    
    item.text = newVal;
    
    // Handle label extraction (simplified)
    if (item.text?.indexOf(':') !== -1) {
      const [label, content] = item.text.split(':');
      item.label = label ? label.trim() : null;
      item.text = (content || '').trim();
    } else {
      item.label = null;
    }
    
    setText(newVal);
    onTextChange?.(item, true);
  };

  const styles = StyleSheet.create({
    input: {
      height: height,
      color: colors.text,
      borderWidth: 0,
      padding: 8,
      fontSize: 16,
      textAlignVertical: 'top',
    },
  });

  // Platform-specific props
  const platformProps = Platform.select({
    web: {
      onKeyUp,
      spellCheck: true,
      maxLength: 280,
    },
    default: {
      maxLength: 280,
    },
  });

  return (
    <TextInput
      ref={textInputRef}
      style={styles.input}
      value={text}
      onChangeText={handleTextChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      multiline={true}
      autoCapitalize="sentences"
      autoCorrect={false}
      {...platformProps}
    />
  );
}; 