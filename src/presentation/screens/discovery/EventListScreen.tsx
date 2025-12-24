import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';

import { database } from '../../../data/data_sources/offline_database';
import { EventRepository } from '../../../data/repositories/EventRepository';
import { Card } from '../../components/Card';
import { useWatermelonQuery } from '../../hooks/useWatermelonQuery';

const EventListScreen = () => {
  const route = useRoute<any>();
  const { stationId, stationName } = route.params || {};
  const navigation = useNavigation<any>();
  const repository = useMemo(() => new EventRepository(database), []);
  const events = useWatermelonQuery(
    () => repository.eventsByStation(stationId),
    [repository, stationId]
  ) ?? [];

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={`Events near ${stationName}`} />
      </Appbar.Header>
      <FlatList
        data={events}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card
            title={item.name}
            subtitle={item.venueName ?? item.venueAddress ?? '—'}
            onPress={() =>
              navigation.navigate('EventDetail', {
                eventId: item.id,
              })
            }
          />
        )}
        ListEmptyComponent={
          <Text style={styles.empty} variant="bodyMedium">
            No events found near this station.
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
  empty: {
    marginTop: 32,
    textAlign: 'center',
  },
});

export default EventListScreen;
