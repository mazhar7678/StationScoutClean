import { useNavigation, useRoute } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import { EventRepository } from '@data/repositories/EventRepository';
import { ListItem } from '@presentation/components/ListItem';
import { DiscoveryStackParamList } from '@presentation/navigation/DiscoveryStack';
import { useWatermelonQuery } from '@presentation/hooks/useWatermelonQuery';

type RouteProps = NativeStackScreenProps<DiscoveryStackParamList, 'Lines'>;

const LineScreen = () => {
  const { params } = useRoute<RouteProps['route']>();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<DiscoveryStackParamList, 'Lines'>
    >();
  const database = useDatabase();
  const repository = useMemo(() => new EventRepository(database), [database]);
  const lines =
    useWatermelonQuery(
      () => repository.linesByOperator(params.operatorId),
      [repository, params.operatorId],
    ) ?? [];

  return (
    <FlatList
      data={lines}
      contentContainerStyle={styles.list}
      keyExtractor={item => item.id}
      renderItem={({ item }) => (
        <ListItem
          title={item.name}
          description={item.code ?? item.color ?? '—'}
          onPress={() =>
            navigation.navigate('Stations', {
              lineId: item.id,
              lineName: item.name,
            })
          }
        />
      )}
      ListEmptyComponent={
        <Text style={styles.empty} variant="bodyMedium">
          No lines found for this operator. Pull to refresh on the previous
          screen to sync data.
        </Text>
      }
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  empty: {
    marginTop: 32,
    textAlign: 'center',
  },
});

export default LineScreen;
