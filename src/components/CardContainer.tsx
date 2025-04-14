import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { CardItem } from './CardItem';
import { SupportList } from './SupportList';
import { SourcesList } from './SourcesList';
import { StateEnum, Symthink } from '../core/symthink.class';
import { useNotificationStore } from '../store/notificationStore';

interface CardContainerProps {
  data: Symthink;
  canEdit?: boolean;
  onItemAction?: (action: { action: string; value: any; domrect?: DOMRect; pointerEvent?: any }) => void;
  onDocAction?: (action: { action: string; value: any }) => void;
}

export const CardContainer: React.FC<CardContainerProps> = ({
  data,
  canEdit = false,
  onItemAction,
  onDocAction,
}) => {
  const { colors } = useTheme();
  const [change, setChange] = useState(false);
  const subscribe = useNotificationStore(state => state.subscribe);
  
  const [sourceList, setSourceList] = useState<any[]>([]);
  const [parentDoc, setParentDoc] = useState<any>(null);
  const [showTopItem, setShowTopItem] = useState(!data.parent); // default false, unless is root

  useEffect(() => {
    const unsubscribe = subscribe((a: string) => onNotificationReceived(a));
    return () => {
      unsubscribe();
    };
  }, [subscribe]);

  useEffect(() => {
    if (!data) return;

    const root = data.getRoot();
    setParentDoc(root); // NOTE: this is likely a mistake. fix later
    // Subscribe to state changes
    const stateSubscription = root.state$.subscribe((state: StateEnum) => onStateChange(state));

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
    
    if (root?.log$) {  
      logSubscription = root.log$.subscribe((a: { action: number, ts: number }) => {
        if (a.action === 1) { // Assuming 1 represents 'ADD_SOURCE', should use enum later
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
  }, [data]);

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
    if (!parentDoc) return;
    if (selected) {
      parentDoc.state$.next(StateEnum.Editing);
    } else {
      parentDoc.state$.next(StateEnum.Viewing);
    }
    setChange(prev => !prev);
  };

  const onStateChange = (state: StateEnum) => {
    // console.log('onStateChange', state);
    setChange(prev => !prev);
  };

  const onNotificationReceived = async (a: string) => {
    // Handle closing sliding items
    switch (a) {
      case 'external-mod':
        setChange(prev => !prev);
        break;
      case 'animation-done':
        setShowTopItem(true);
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

  const mainItemEditFullClick = (item: any) => {
    onItemAction?.({ action: 'edit-full', value: item });
  };

  const handleSupportItemClick = (item: any, event: any, itemDomrect?: DOMRect) => {
    // console.log('Support item clicked:', item, itemDomrect);
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
      padding: 0,
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
    // console.log('Key action:', key, type);
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
        onExpandClick={mainItemEditFullClick}
        onTextChange={modified}
        onKeyAction={handleKeyAction}
        showBackButton={!data.isRoot && !canEdit}
        visible={showTopItem}
      />
    );
  };

  const renderSupportItems = () => {
    if (!data?.hasKids?.()) return null;
    
    return (
      <SupportList
        items={data.support || []}
        canEdit={canEdit}
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
    <View style={styles.container} testID="card-container">
        {renderTopItem()}
        {renderSupportItems()}
        {renderSources()}
    </View>
  );
}; 