import React, { useEffect, useRef, useState } from 'react';
import { TextInput, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { Symthink } from '../core/symthink.class';

interface TextEditorProps {
  item: Symthink;
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
  const [initialized, setInitialized] = useState(false);

  // Initialize with the correct text
  useEffect(() => {
    if (!initialized) {
      const txt = isTopItem ? item.getCurrentItemText?.(true) || '' : item.getSupportItemText?.() || '';
      console.log('Initializing text:', txt);
      setText(txt);
      setInitialized(true);
      focus();
    }
  }, [initialized]);

  const focus = () => {
    if (textInputRef.current) {
      textInputRef.current.focus();
    }
  };

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
    onTextChange?.(item, true);
  };

  const handleBlur = () => {
    let newVal = text.trim();
    
    // Simple capitalization as an example
    if (newVal.length > 0) {
      newVal = newVal.charAt(0).toUpperCase() + newVal.slice(1);
    }
    
    item.text = newVal;
    
    // Handle label extraction (simplified)
    if (item.text?.indexOf(':') !== -1) {
      const [label, content] = item.text.split(':');
      item.label = label ? label.trim() : undefined;
      item.text = (content || '').trim();
    } else {
      item.label = undefined;
    }
    
    setText(newVal);
    onTextChange?.(item, true);
  };

  const styles = StyleSheet.create({
    input: {
      height: height,
      color: colors.text,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 8,
      width: '100%',
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
      // onChangeText={handleTextChange}
      // onBlur={handleBlur}
      placeholder={placeholder}
      multiline={true}
      autoCapitalize="sentences"
      autoCorrect={false}
      {...platformProps}
    />
  );
}; 