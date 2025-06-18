import React, { memo, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  ListRenderItem,
  ViewToken,
} from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface OptimizedListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T) => string;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListEmptyComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  refreshing?: boolean;
  onRefresh?: () => void;
  initialNumToRender?: number;
  maxToRenderPerBatch?: number;
  windowSize?: number;
  removeClippedSubviews?: boolean;
  onViewableItemsChanged?: (info: {
    viewableItems: ViewToken[];
    changed: ViewToken[];
  }) => void;
}

const MemoizedItem = memo(
  <T extends any>({
    item,
    renderItem,
  }: {
    item: T;
    renderItem: ListRenderItem<T>;
  }) => {
    return renderItem({ item, index: 0, separators: {} as any });
  }
);

const LoadingFooter = () => {
  const { theme } = useTheme();
  return (
    <View style={styles.loadingFooter}>
      <ActivityIndicator color={theme.colors.primary} />
    </View>
  );
};

const OptimizedList = <T extends any>({
  data,
  renderItem,
  keyExtractor,
  onEndReached,
  onEndReachedThreshold = 0.5,
  ListEmptyComponent,
  ListHeaderComponent,
  ListFooterComponent,
  refreshing,
  onRefresh,
  initialNumToRender = 10,
  maxToRenderPerBatch = 10,
  windowSize = 21,
  removeClippedSubviews = true,
  onViewableItemsChanged,
}: OptimizedListProps<T>) => {
  const { theme } = useTheme();

  const memoizedRenderItem = useCallback<ListRenderItem<T>>(
    ({ item }) => (
      <MemoizedItem item={item} renderItem={renderItem} />
    ),
    [renderItem]
  );

  const memoizedKeyExtractor = useCallback(
    (item: T) => keyExtractor(item),
    [keyExtractor]
  );

  const memoizedOnEndReached = useCallback(() => {
    if (onEndReached) {
      onEndReached();
    }
  }, [onEndReached]);

  const memoizedOnRefresh = useCallback(() => {
    if (onRefresh) {
      onRefresh();
    }
  }, [onRefresh]);

  const memoizedOnViewableItemsChanged = useCallback(
    (info: { viewableItems: ViewToken[]; changed: ViewToken[] }) => {
      if (onViewableItemsChanged) {
        onViewableItemsChanged(info);
      }
    },
    [onViewableItemsChanged]
  );

  const viewabilityConfig = useMemo(
    () => ({
      itemVisiblePercentThreshold: 50,
    }),
    []
  );

  return (
    <FlatList
      data={data}
      renderItem={memoizedRenderItem}
      keyExtractor={memoizedKeyExtractor}
      onEndReached={memoizedOnEndReached}
      onEndReachedThreshold={onEndReachedThreshold}
      ListEmptyComponent={ListEmptyComponent}
      ListHeaderComponent={ListHeaderComponent}
      ListFooterComponent={
        <>
          {ListFooterComponent}
          {refreshing && <LoadingFooter />}
        </>
      }
      refreshing={refreshing}
      onRefresh={memoizedOnRefresh}
      initialNumToRender={initialNumToRender}
      maxToRenderPerBatch={maxToRenderPerBatch}
      windowSize={windowSize}
      removeClippedSubviews={removeClippedSubviews}
      onViewableItemsChanged={memoizedOnViewableItemsChanged}
      viewabilityConfig={viewabilityConfig}
      contentContainerStyle={[
        styles.contentContainer,
        { backgroundColor: theme.colors.background },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  loadingFooter: {
    padding: 16,
    alignItems: 'center',
  },
});

export default memo(OptimizedList); 