import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, findNodeHandle, UIManager } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { TextEditor } from './TextEditor';
import { globalStyles } from '../theme/globalStyles';
import { Bullets, Symthink } from '../core/symthink.class';
import { Icon } from './Icon';

interface SupportItemProps {
  item: Symthink; // Replace with proper type
  canEdit?: boolean;
  onItemClick?: (item: any, event: any, domrect?: DOMRect) => void;
  onTextChange?: (item: any, isModified: boolean) => void;
  onKeyAction?: (key: string, type?: string) => void;
  index?: number; // Add index prop
  sourceNumbers?: number[];
}

export const SupportItem: React.FC<SupportItemProps> = ({
  item,
  canEdit = false,
  onItemClick,
  onTextChange,
  onKeyAction,
  index = 0, // Default to 0 if not provided
  sourceNumbers,
}) => {
  const { colors } = useTheme();
  const [isHovered, setIsHovered] = useState(false);
  const itemRef = useRef<TouchableOpacity>(null);

  const isEditable = !!(item.selected && canEdit);
  const hasChildSupports = item.support && item.support.length > 0;

  const handleClick = (e: any) => {
    if (onItemClick) {
      if (Platform.OS === 'web') {
        // For web, we need to account for scroll position and container offsets
        const rect = e.target.getBoundingClientRect();
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

        // Get the container's position to calculate relative coordinates
        const container = e.target.closest('[data-testid="card-container"]');
        const containerRect = container?.getBoundingClientRect();

        const relativeRect = new DOMRect(
          rect.x - (containerRect?.x || 0),
          rect.y - (containerRect?.y || 0),
          rect.width,
          rect.height
        );

        onItemClick(item, e, relativeRect);
      } else {
        // For native, we need to measure the view
        if (itemRef.current) {
          const node = findNodeHandle(itemRef.current);
          if (node) {
            UIManager.measure(node, (x, y, width, height, pageX, pageY) => {
              // Get the container's position
              UIManager.measureInWindow(node, (winX, winY, winWidth, winHeight) => {
                const relativeRect = new DOMRect(
                  pageX - winX,
                  pageY - winY,
                  width,
                  height
                );
                onItemClick(item, e, relativeRect);
              });
            });
          } else {
            onItemClick(item, e);
          }
        } else {
          onItemClick(item, e);
        }
      }
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
      ...globalStyles.listItemRow,
      backgroundColor: colors.background,
    },
    hovered: {
      backgroundColor: '#f5f5f5',
    },
    bulletWithKids: {
      ...globalStyles.listItemIcon,
      color: colors.link,
    },
    bulletNoKids: {
      ...globalStyles.listItemIcon,
      color: colors.text,
      opacity: 0.5,
    },
    numbersWithKids: {
      ...globalStyles.listItemIcon,
      color: colors.link,
      fontSize: 14,
      fontWeight: 'bold',
    },
    numbersNoKids: {
      ...globalStyles.listItemIcon,
      color: colors.text,
      opacity: 0.5,
      fontSize: 14,
      fontWeight: 'bold',
    },
    text: {
      ...globalStyles.text,
      flex: 1,
    },
    placeholder: {
      color: '#888888',
      fontSize: 14,
      fontStyle: 'italic',
      flex: 1,
    },
    subscript: {
      ...globalStyles.text,
      fontSize: 10,
      flexDirection: 'row',
      // alignItems: 'flex-end',
      justifyContent: 'flex-end',
    },
  });

  const renderBullet = () => {
    if (item.parent?.numeric) {
      return hasChildSupports ? (
        <Text style={styles.numbersWithKids}>
          {index + 1}
        </Text>
      ) : (
        <Text style={styles.numbersNoKids}>
          {index + 1}
        </Text>
      );
    } else {
      return hasChildSupports ? (
        <Text style={styles.bulletWithKids}>
          &#9679;
        </Text>
      ) : (
        <Text style={styles.bulletNoKids}>
          &#9679;
        </Text>
      );
    }
  };

  const renderItemText = () => {
    if (item.text && item.text?.indexOf(':') !== -1) {
      const [label, txt] = item.text.split(':');
      item.text = txt?.trim() || '';
      item.label = label?.trim() || '';
    }
    if (item.label?.length) {
      item.label = item.label.charAt(0).toUpperCase() + item.label.slice(1);
    }
    let txt = item.label ? item.label + ': ' + item.text?.trim() : item.text?.trim();
    let label;
    if (/^[^:]+:/.test(txt)) {
      let parts = txt.split(':');
      label = parts.shift();
      txt = parts.join(':').trim();
    }
    return [
      !!label && <Text style={globalStyles.label}>{label}:</Text>,
      ' ' + txt,
    ];
  }

  return (
    <TouchableOpacity
      ref={itemRef}
      style={[
        styles.container,
      ]}
      onPress={handleClick}
      {...hoverProps}
    >
      <View style={[globalStyles.listItemIconContainer, { justifyContent: 'flex-start' }]}>
        {renderBullet()}
      </View>

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
        <View style={{ flex: 1 }}>
          <Text style={item.text ? styles.text : styles.placeholder}>
            {renderItemText() || "Add supporting idea..."}
          </Text>
          {!!sourceNumbers?.length && (
            <View style={styles.subscript}>
              <Icon name="bookmark" size={16} color={colors.text} />
              <Text>{sourceNumbers.join(',')}</Text>
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
}; 