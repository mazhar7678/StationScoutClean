import { useNavigation, useRoute } from '@react-navigation/native';
import { Q } from '@nozbe/watermelondb';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';

import { database } from '../../../data/data_sources/offline_database';
import { Event } from '../../../data/db/models';
import { Card } from '../../components/Card';

const EventListScreen = () => {
  const route = useRoute<any>();
  const { stationId, stationName } = route.params || {};
  const navigation = useNavigation<any>();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const collection = database.get<Event>('events');
        const records = await collection.query(Q.where('station_id', stationId)).fetch();
        setEvents(records);
      } catch (e) {
        console.error('Error loading events:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();

    const subscription = database.get<Event>('events')
      .query(Q.where('station_id', stationId))
      .observe()
      .subscribe((records) => {
        setEvents(records);
      });

    return () => subscription.unsubscribe();
  }, [stationId]);

  return (
    <View style={styles.container}>
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
          !isLoading ? (
            <Text style={styles.empty} variant="bodyMedium">
              No events found near this station.
            </Text>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
  },
  empty: {
    marginTop: 32,
    textAlign: 'center',
    color: '#666',
  },
});

export default EventListScreen;
