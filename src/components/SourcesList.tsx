import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';

interface SourcesListProps {
  sources: any[]; // Replace with proper type
  onSourceClick?: (source: any, index: number) => void;
}

export const SourcesList: React.FC<SourcesListProps> = ({ 
  sources = [],
  onSourceClick,
}) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      marginTop: 8,
    },
    header: {
      fontSize: 16,
      fontWeight: 'bold',
      color: colors.text,
      marginBottom: 8,
    },
    sourceItem: {
      padding: 8,
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 4,
      marginBottom: 4,
    },
    sourceText: {
      color: colors.text,
    },
    emptyText: {
      color: colors.secondary,
      fontStyle: 'italic',
    }
  });

  const handleSourcePress = (source: any, index: number) => {
    onSourceClick?.(source, index);
  };

  const renderSourceItem = ({ item, index }: { item: any, index: number }) => (
    <TouchableOpacity 
      style={styles.sourceItem}
      onPress={() => handleSourcePress(item, index)}
    >
      <Text style={styles.sourceText}>{item.title || item.url || 'Source ' + (index + 1)}</Text>
    </TouchableOpacity>
  );

  if (!sources.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Sources</Text>
      <FlatList
        data={sources}
        renderItem={renderSourceItem}
        keyExtractor={(item, index) => `${item.id || item.url || 'source'}-${index}`}
      />
    </View>
  );
}; 