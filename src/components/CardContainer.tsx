import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { CardItem } from './CardItem';
import { SupportList } from './SupportList';
import { SourcesList } from './SourcesList';
import { Subject } from 'rxjs';
import { StateEnum } from '../core/symthink.class';

interface CardContainerProps {
  data: any; // Replace with proper type when migrating core classes
  canEdit?: boolean;
  notify?: Subject<string>;
  domrect?: DOMRect;
  onItemAction?: (action: { action: string; value: any; domrect?: DOMRect; pointerEvent?: any }) => void;
  onDocAction?: (action: { action: string; value: any }) => void;
}

export const CardContainer: React.FC<CardContainerProps> = ({
  data,
  canEdit = false,
  notify,
  domrect,
  onItemAction,
  onDocAction,
}) => {
  const { colors } = useTheme();
  const [checkboxHidden, setCheckboxHidden] = useState(true);
  const [change, setChange] = useState(false);
  
  const contentRef = useRef<ScrollView>(null);
  const listRef = useRef<View>(null);
  const [sourceList, setSourceList] = useState<any[]>([]);
  const [parentDoc, setParentDoc] = useState<any>(null);

  useEffect(() => {
    if (notify) {
      // Handle notification subscription
      const subscription = notify.subscribe((a: string) => onNotificationReceived(a));
      return () => subscription.unsubscribe();
    }
  }, [notify]);

  useEffect(() => {
    if (data) {
      const root = data.getRoot();
      setParentDoc(root);
      
      // Subscribe to state changes
      const stateSubscription = root.state$.subscribe(onStateChange);

      // Set up other subscriptions
      let selectSubscription: any;
      let modSubscription: any;
      let logSubscription: any;

      if (data.select$) {
        selectSubscription = data.select$.subscribe(onItemSelectionChange);
      }
      
      if (data.mod$) {
        modSubscription = data.mod$.subscribe(() => {
          setSourceList(data.getShowableSources());
          setChange(prev => !prev);
        });
      }
      
      setSourceList(data.getShowableSources());
      
      if (data.getRoot().log$) {  
        logSubscription = data.getRoot().log$.subscribe((a: { action: string, ts: number }) => {
          if (a.action === 'ADD_SOURCE') {
            setSourceList(data.getShowableSources());
            setChange(prev => !prev);
          }
        });
      }

      // Cleanup subscriptions
      return () => {
        stateSubscription?.unsubscribe();
        selectSubscription?.unsubscribe();
        modSubscription?.unsubscribe();
        logSubscription?.unsubscribe();
      };
    }
  }, [data]);

  // Equivalent to componentDidLoad in StencilJS
  useEffect(() => {
    console.log('CardContainer loaded', domrect);
    console.log('Card container data:', data);
    console.log('Card container data.support:', data?.support);
    console.log('Card container hasKids():', data?.hasKids?.());
    
    if (domrect) {
      // Animation would be handled differently in React Native
      // This is a placeholder for animation logic
      // Could use Animated API for React Native
    }
  }, []);

  // Equivalent to componentDidRender in StencilJS
  useEffect(() => {
    // Setup for textarea logic would go here
    // React Native doesn't have direct DOM access, so would need to be adapted
    
    // Subscribe to support items' selection changes
    if (data?.support?.length) {
      const subscriptions = data.support.map((item: any) => 
        item.select$.subscribe(onItemSelectionChange)
      );
      
      return () => {
        subscriptions.forEach((sub: any) => sub.unsubscribe());
      };
    }
  }, [data?.support, change]);

  const onItemSelectionChange = (selected: boolean) => {
    if (selected) {
      parentDoc.state$.next(StateEnum.Editing);
    } else {
      parentDoc.state$.next(StateEnum.Viewing);
    }
    setChange(prev => !prev);
  };

  const onStateChange = (state: string) => {
    console.log('onStateChange', state);
    // Closing sliding items would be handled differently in React Native
    setChange(prev => !prev);
  };

  const onNotificationReceived = async (a: string) => {
    // Handle closing sliding items
    switch (a) {
      case 'external-mod':
        setChange(prev => !prev);
        break;
      default:
        break;
    }
  };

  const modified = (percDiff?: number) => {
    setChange(prev => !prev);
    onDocAction?.({ action: 'modified', value: percDiff || null });
  };

  // Event Handlers for child components
  const handleMainItemClick = (item: any, event: any) => {
    event.stopPropagation();
    
    if (parentDoc.state$.getValue() !== StateEnum.Viewing) {
      return;
    }
    
    item.select$.next(true);
    if (!data.isRoot && !canEdit) {
      onDocAction?.({
        action: 'go-back',
        value: item,
      });
    }
  };

  const handleMainItemOptionsClick = (item: any, event: any) => {
    if (event) {
      event.stopPropagation();
      event.preventDefault();
    }
    
    onItemAction?.({
      action: 'item-opts-clicked',
      value: item,
      pointerEvent: event,
    });
  };

  const handleMainItemExpandClick = (item: any) => {
    onItemAction?.({ action: 'edit-full', value: item });
  };

  const handleSupportItemClick = (item: any, event: any, itemDomrect?: DOMRect) => {
    console.log('handleSupportItemClick', item.url, parentDoc.state$.getValue(), item.isKidEnabled());
    if (item.url) {
      onItemAction?.({ action: 'subcription-clicked', value: item.url });
    } else if (parentDoc.state$.getValue() === StateEnum.Viewing) {
      if (item.isKidEnabled()) {
        parentDoc.deselect();
        onItemAction?.({
          action: 'support-clicked',
          value: item,
          domrect: itemDomrect,
        });
      } else {
        item.select$.next(true);
      }
    }
  };

  const isTouchDevice = () => {
    if (typeof window !== 'undefined') {
      return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    }
    return false;
  };

  const isVoting = parentDoc?.state$?.getValue() === StateEnum.Voting;
  const isRanking = parentDoc?.state$?.getValue() === StateEnum.Ranking;
  const showMoreOptions = canEdit;
  const reOrderDisabled = data?.getRoot()?.state$?.getValue() !== StateEnum.Ranking;

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background || '#ffffff',
      minHeight: 300, // Ensure the container has a minimum height
      padding: 16,
    },
    item: {
      // marginBottom: 8,
      padding: 12,
    },
    text: {
      color: colors.text,
    },
    title: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colors.primary,
    },
  });

  const handleKeyAction = (key: string, type?: string) => {
    // Handle key actions like Enter key press
    console.log('Key action:', key, type);
  };

  // Render methods would go here
  // These would need to be implemented with React Native components
  const renderTopItem = () => {
    if (!data) return null;
    
    return (
      <CardItem
        item={data}
        canEdit={canEdit}
        parentDoc={parentDoc}
        sourceNumbers={[]}
        onItemClick={handleMainItemClick}
        onOptionsClick={handleMainItemOptionsClick}
        onExpandClick={handleMainItemExpandClick}
        onTextChange={() => modified()}
        onKeyAction={handleKeyAction}
      />
    );
  };

  const renderSupportItems = () => {
    if (!data?.hasKids?.()) return null;
    
    return (
      <SupportList
        items={data.support || []}
        canEdit={canEdit}
        parentDoc={parentDoc}
        onItemClick={handleSupportItemClick}
        onTextChange={() => modified()}
        onKeyAction={handleKeyAction}
      />
    );
  };

  const renderSources = () => {
    if (!sourceList?.length) return null;
    
    return (
      <SourcesList
        sources={sourceList || []}
        onSourceClick={(src, idx) => {
          onItemAction?.({
            action: 'source-clicked',
            value: { src, idx }
          });
        }}
      />
    );
  };

  return (
    <View style={styles.container}>
        {renderTopItem()}
        {renderSupportItems()}
        {renderSources()}
    </View>
  );
}; 