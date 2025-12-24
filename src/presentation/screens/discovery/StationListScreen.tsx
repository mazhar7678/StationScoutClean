import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';

import { database } from '../../../data/data_sources/offline_database';
import { EventRepository } from '../../../data/repositories/EventRepository';
import { ListItem } from '../../components/ListItem';
import { useWatermelonQuery } from '../../hooks/useWatermelonQuery';

const StationListScreen = () => {
  const route = useRoute<any>();
  const { lineId, lineName } = route.params || {};
  const navigation = useNavigation<any>();
  const repository = useMemo(() => new EventRepository(database), []);
  const stations = useWatermelonQuery(
    () => repository.stationsByLine(lineId),
    [repository, lineId]
  ) ?? [];

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={lineName || 'Stations'} />
      </Appbar.Header>
      <FlatList
        data={stations}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <Text variant="titleMedium" style={styles.header}>
            Select a Station
          </Text>
        }
        renderItem={({ item }) => (
          <ListItem
            title={item.name}
            description={item.code ?? '—'}
            onPress={() =>
              navigation.navigate('Events', {
                stationId: item.id,
                stationName: item.name,
                stationLat: item.latitude,
                stationLon: item.longitude,
              })
            }
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty} variant="bodyMedium">
            No stations found for this line.
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  header: {
    marginBottom: 16,
  },
  empty: {
    marginTop: 32,
    textAlign: 'center',
  },
});

export default StationListScreen;
