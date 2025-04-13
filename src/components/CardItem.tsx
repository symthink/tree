import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

// Import the components
import { ExpandButton } from './ExpandButton';
import { ItemOptions } from './ItemOptions';
import { TextEditor } from './TextEditor';
import { globalStyles } from '../theme/globalStyles';
import { Icon } from './Icon';

interface CardItemProps {
  item: any; // Replace with proper type when migrating core classes
  canEdit?: boolean;
  parentDoc: any; // Replace with proper type
  sourceNumbers?: number[];
  onItemClick?: (item: any, event: any) => void;
  onOptionsClick?: (item: any, event: any) => void;
  onExpandClick?: (item: any) => void;
  onTextChange?: (item: any, isModified: boolean) => void;
  onKeyAction?: (key: string, type?: string) => void;
  showBackButton?: boolean;
  visible?: boolean;
}

export const CardItem: React.FC<CardItemProps> = ({
  item,
  canEdit = false,
  parentDoc,
  sourceNumbers = [],
  onItemClick,
  onOptionsClick,
  onExpandClick,
  onTextChange,
  onKeyAction,
  showBackButton = false,
  visible = true,
}) => {
  const { colors } = useTheme();
  const [change, setChange] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isVoting = parentDoc?.state$?.getValue() === 'Voting';
  const isEditable = !!(item.selected && canEdit);
  const isViewing = parentDoc?.state$?.getValue() === 'Viewing';

  const renderLabel = (txt?: string) => {
    if (!txt) return null;
    let label;
    if (/^[^:]+:/.test(txt)) {
      let parts = txt.split(':');
      label = parts.shift();
      txt = parts.join(':').trim();
    }
    return (
      <>
        {!!label && <Text style={styles.boldText}>{label}:</Text>}
        <Text style={styles.text}> {txt}</Text>
      </>
    );
  };

  const textPlaceholder = () => {
    return item?.type ? 
      // Would need to adapt CardRules implementation
      // This is a placeholder for that logic
      'Enter text here...' : 
      '';
  };

  const handleItemClick = (e: any) => {
    
    item.select$.next(true);
    onItemClick?.(item, e);
  };

  const handleTextChange = (item: any, isModified: boolean) => {
    onTextChange?.(item, isModified);
    setChange(prev => !prev);
  };

  const handleKeyAction = (key: string, type?: string) => {
    onKeyAction?.(key, type);
  };

  const handleOptionsClick = (e: any) => {
    onOptionsClick?.(item, e);
  };

  const handleExpandClick = () => {
    onExpandClick?.(item);
  };

  // Handle hover events for web only
  const hoverProps = Platform.OS === 'web' ? {
    onMouseEnter: () => setIsHovered(true),
    onMouseLeave: () => setIsHovered(false),
  } : {};

  const styles = StyleSheet.create({
    container: {
      ...globalStyles.listItemRow,
      backgroundColor: colors.background,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      opacity: visible ? 1 : 0,
    },
    hovered: {
      backgroundColor: '#f5f5f5',
    },
    text: {
      ...globalStyles.text,
    },
    boldText: {
      fontWeight: 'bold',
      color: colors.text,
    },
    title: {
      fontWeight: 'bold',
      marginBottom: 2,
      textTransform: 'capitalize'
    },
    placeholder: {
      color: '#888888',
    },
    subscript: {
      fontSize: 12,
      color: colors.secondary,
      marginTop: 4,
      flexDirection: 'row',
      alignItems: 'center',
    },
    editorContainer: {
      flex: 1,
    },
    buttonsContainer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
    },
    backButtonContainer: {
      ...globalStyles.listItemIconContainer,
      margin: 'auto',
      marginRight: 4,
      marginLeft: -4,
    },
    contentContainer: {
      flex: 1,
    },
  });

  // Debug logging
  // console.log('CardItem debug:', {
  //   showBackButton,
  //   isViewing,
  //   isEditable,
  //   state: parentDoc?.state$?.getValue(),
  //   isRoot: item?.isRoot,
  //   canEdit
  // });

  return (
    <TouchableOpacity
      style={[
        styles.container, 
        isHovered && canEdit && !item.selected ? styles.hovered : null
      ]}
      onPress={handleItemClick}
      {...hoverProps}
    >
      {isEditable ? (
        <View style={styles.editorContainer}>
          <TextEditor
            item={item}
            height={50}
            isTopItem={true}
            placeholder={textPlaceholder()}
            onTextChange={handleTextChange}
            onKeyAction={handleKeyAction}
          />
          <View style={styles.buttonsContainer}>
            <ExpandButton onExpandClick={handleExpandClick} />
          </View>
        </View>
      ) : (
        <>
          {showBackButton && (
            <View style={styles.backButtonContainer}>
              <Icon name="chevron-left" size={26} color={colors.link} />
            </View>
          )}
          {!showBackButton && (
            <View style={globalStyles.listItemIconContainer}>
              <Text>&nbsp;</Text>
            </View>
          )}

          <View style={styles.contentContainer}>
            {item.label && <Text style={globalStyles.label}>{item.label}</Text>}
            <Text style={item.hasItemText() ? styles.text : styles.placeholder}>
              {item.getCurrentItemText() || textPlaceholder()}
            </Text>
            {item.isEvent && (
              <Text style={styles.text}>
                <Text style={styles.boldText}>Date:</Text> {item.eventDate?.toLocaleString()}
              </Text>
            )}
            {!!sourceNumbers.length && (
              <View style={styles.subscript}>
                <Text>Bookmark Icon</Text>
                <Text style={styles.text}>{sourceNumbers.join(',')}</Text>
              </View>
            )}
          </View>
        </>
      )}
    </TouchableOpacity>
  );
}; 