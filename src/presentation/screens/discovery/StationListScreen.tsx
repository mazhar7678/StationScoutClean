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

type RouteProps = NativeStackScreenProps<DiscoveryStackParamList, 'Stations'>;

const StationListScreen = () => {
  const { params } = useRoute<RouteProps['route']>();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<DiscoveryStackParamList, 'Stations'>
    >();
  const database = useDatabase();
  const repository = useMemo(() => new EventRepository(database), [database]);
  const stations =
    useWatermelonQuery(
      () => repository.stationsByLine(params.lineId),
      [repository, params.lineId],
    ) ?? [];

  return (
    <FlatList
      data={stations}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <ListItem
          title={item.name}
          description={item.code ?? '—'}
          onPress={() =>
            navigation.navigate('Events', {
              stationId: item.id,
              stationName: item.name,
            })
          }
        />
      )}
      ListEmptyComponent={
        <Text style={styles.empty} variant="bodyMedium">
          No stations available locally for this line.
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

export default StationListScreen;
