import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { globalStyles } from '../theme/globalStyles';
import { Cite } from '@citation-js/core';
import '@citation-js/plugin-csl';
import { CitationStyleLang, SourceListItem } from '../core/symthink.class';
import ParsedText from 'react-native-parsed-text';
import { OutgoingMsgActionEnum, useOutgoingActionStore } from '../store/notificationStore';

interface SourcesListProps {
  sources: SourceListItem[];
}

export const SourcesList: React.FC<SourcesListProps> = ({ 
  sources = [],
}) => {
  const { colors } = useTheme();
  const notifyConsumingApp = useOutgoingActionStore(state => state.notify);

  const formatCitation = (source: CitationStyleLang) => {
    try {
      return (new Cite(source)).format('bibliography', {
        format: 'text',
        template: 'apa',
        lang: 'en-US',
      });
    } catch (error) {
      console.error('Error formatting citation:', error);
      return source.title || source.URL || 'Source';
    }
  };

  const styles = StyleSheet.create({
    container: {
      marginTop: 8,
    },
    sourceItem: {
      flexDirection: 'row',
      padding: 8,
      borderBottomWidth: 1,
      borderColor: colors.border,
      marginBottom: 4,
    },
    numberContainer: {
      width: 20,
      marginRight: 0,
      alignItems: 'center',
    },
    numberText: {
      ...globalStyles.text,
      fontSize: 12,
      lineHeight: 16,
      color: colors.text,
    },
    contentContainer: {
      flex: 1,
    },
    sourceText: {
      ...globalStyles.text,
      fontSize: 12,
      lineHeight: 16,
    },
    linkText: {
      ...globalStyles.text,
      fontSize: 14,
      lineHeight: 20,
      color: colors.primary,
    },
    emptyText: {
      color: colors.secondary,
      fontStyle: 'italic',
    },
    border: {
      borderTopWidth: 1,
      borderTopColor: colors.text,
      marginTop: 20,
      marginBottom: 10,
      marginHorizontal: 'auto',
      width: 130,
      opacity: 0.8,
    },
    section: {
      textAlign: 'center',
      width: 22,
      backgroundColor: colors.background,
      marginTop: -16,
      marginBottom: 0,
      color: colors.text,
      marginHorizontal: 'auto',
      lineHeight: 24,
      fontSize: 18,
      fontFamily: globalStyles.fontFam.fontFamily,
    }
  });

  const handleSourcePress = (source: CitationStyleLang, index: number) => {
    if (source.URL) {
      notifyConsumingApp({
        action: OutgoingMsgActionEnum.OPEN,
        value: source.URL,
      });
    }
  };

  const renderUrlText = (matchingString: string, matches: string[]) => {
    // Only process URLs with http/https protocol
    if (!matchingString.match(/^https?:\/\//)) {
      return '';
    }
    
    // Remove protocol (http:// or https://)
    const withoutProtocol = matchingString.replace(/^https?:\/\//, '');
    
    // Split by slashes and get domain and last part
    const parts = withoutProtocol.split('/');
    const domain = parts[0];
    const lastPart = parts[parts.length - 1].replace(/\.html$/, '');
    
    // Build truncated URL
    let truncated = domain;
    if (lastPart && lastPart !== domain) {
      truncated += '/../' + lastPart;
    }
    
    // Truncate if too long
    const maxLength = 40;
    if (truncated.length > maxLength) {
      truncated = truncated.substring(0, maxLength) + '…';
    }
    
    return '\n' + truncated;
  };

  const renderSourceItem = ({ item, index }: { item: SourceListItem, index: number }) => (
    <TouchableOpacity 
      style={styles.sourceItem}
      onPress={() => handleSourcePress(item.src, index)}
    >
      <View style={styles.numberContainer}>
        <Text style={styles.numberText}>{index + 1}.</Text>
      </View>
      <View style={styles.contentContainer}>
        <ParsedText
          style={styles.sourceText}
          parse={[{type: 'url', style: styles.linkText, renderText: renderUrlText}]}
        >
          {formatCitation(item.src)}
        </ParsedText>
      </View>
    </TouchableOpacity>
  );

  if (!sources.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.border}>
        <Text style={styles.section}>§</Text>
      </View>
      <FlatList
        data={sources}
        renderItem={renderSourceItem}
        keyExtractor={(item) => `${item.id}-${item.index}`}
      />
    </View>
  );
}; 