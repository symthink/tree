import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { SupportItem } from './SupportItem';
import { Symthink } from '../core/symthink.class';

interface SupportListProps {
  items: any[]; // Replace with proper type
  canEdit?: boolean;
  onItemClick?: (item: any, event: any, domrect?: DOMRect) => void;
  onTextChange?: (item: any, isModified: boolean) => void;
  onKeyAction?: (key: string, type?: string) => void;
}

export const SupportList: React.FC<SupportListProps> = ({
  items = [],
  canEdit = false,
  onItemClick,
  onTextChange,
  onKeyAction,
}) => {
  const { colors } = useTheme();
  
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

  const renderItem = ({ item }: { item: any }) => (
    <SupportItem
      item={item}
      canEdit={canEdit}
      onItemClick={onItemClick}
      onTextChange={onTextChange}
      onKeyAction={onKeyAction}
    />
  );

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