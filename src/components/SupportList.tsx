import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { SupportItem } from './SupportItem';
import { Symthink } from '../core/symthink.class';
import { useAnimationStore } from '../store/AnimationStore';
import { useToolbarAction, ToolbarAction } from '../store/ToolbarAction';
import { useSymthinkTreeEvent, SymthinkTreeEvent } from '../store/SymthinkTreeEvent';

interface SupportListProps {
  items: Symthink[];
  onItemClick?: (item: any, event: any, domrect?: DOMRect) => void;
  onTextChange?: (item: any, isModified: boolean) => void;
  onKeyAction?: (key: string, type?: string) => void;
  getSourceNumbers?: (itemId: string) => number[];
}

// Temporary placeholder for DraggableSupportItem
const DraggableSupportItem: React.FC<{
  item: Symthink;
  index: number;
  onDragEnd: (fromIndex: number, toIndex: number) => void;
}> = ({ item, index, onDragEnd }) => {
  return (
    <View>
      <Text>{item.id}</Text>
    </View>
  );
};

export const SupportList: React.FC<SupportListProps> = ({
  items,
  onItemClick,
  onTextChange,
  onKeyAction,
  getSourceNumbers,
}) => {
  const { colors } = useTheme();
  const animatingItemId = useAnimationStore(state => state.animatingItemId);
  const { currentAction, actionData } = useToolbarAction();
  const notifySymthinkTree = useSymthinkTreeEvent(state => state.notify);

  // Handle reordering state
  const isReordering = currentAction === ToolbarAction.REORDER;

  const styles = StyleSheet.create({
    container: {
      marginTop: 0,
    },
    header: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    emptyContainer: {
      padding: 8,
      alignItems: 'center',
    },
    emptyText: {
      color: colors.secondary,
      fontStyle: 'italic',
    }
  });

  const renderItem = ({ item, index }: { item: Symthink, index: number }) => {
    if (isReordering) {
      return (
        <DraggableSupportItem 
          item={item}
          index={index}
          onDragEnd={(fromIndex: number, toIndex: number) => {
            // Notify about reorder completion
            notifySymthinkTree({
              action: SymthinkTreeEvent.MODIFIED,
              value: { fromIndex, toIndex }
            });
          }}
        />
      );
    }

    return (
      <SupportItem 
        item={item}
        onItemClick={onItemClick}
        onTextChange={onTextChange}
        onKeyAction={onKeyAction}
        index={index}
        sourceNumbers={getSourceNumbers?.(item.id)}
        hide={item.id === animatingItemId}
      />
    );
  };

  if (!items || items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No supporting ideas yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={items}
        renderItem={renderItem}
        keyExtractor={(item) => item.id || Math.random().toString()}
      />
    </View>
  );
}; 