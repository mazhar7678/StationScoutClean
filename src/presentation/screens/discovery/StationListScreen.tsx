import { useNavigation, useRoute } from '@react-navigation/native';
import { Q } from '@nozbe/watermelondb';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';

import { database } from '../../../data/data_sources/offline_database';
import { Station } from '../../../data/db/models';
import { ListItem } from '../../components/ListItem';

const StationListScreen = () => {
  const route = useRoute<any>();
  const { lineId, lineName } = route.params || {};
  const navigation = useNavigation<any>();
  const [stations, setStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStations = async () => {
      try {
        const collection = database.get<Station>('stations');
        const records = await collection.query().fetch();
        setStations(records);
      } catch (e) {
        console.error('Error loading stations:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadStations();

    const subscription = database.get<Station>('stations')
      .query()
      .observe()
      .subscribe((records) => {
        setStations(records);
      });

    return () => subscription.unsubscribe();
  }, [lineId]);

  return (
    <View style={styles.container}>
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
              })
            }
          />
        )}
        ListEmptyComponent={
          !isLoading ? (
            <Text style={styles.empty} variant="bodyMedium">
              No stations found for this line.
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
  header: {
    marginBottom: 16,
    color: '#333',
  },
  empty: {
    marginTop: 32,
    textAlign: 'center',
    color: '#666',
  },
});

export default StationListScreen;
