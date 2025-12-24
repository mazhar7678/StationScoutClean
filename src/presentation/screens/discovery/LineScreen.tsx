import { useNavigation, useRoute } from '@react-navigation/native';
import { Q } from '@nozbe/watermelondb';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';

import { database } from '../../../data/data_sources/offline_database';
import { RailwayLine } from '../../../data/db/models';
import { ListItem } from '../../components/ListItem';

const LineScreen = () => {
  const route = useRoute<any>();
  const { operatorId, operatorName } = route.params || {};
  const navigation = useNavigation<any>();
  const [lines, setLines] = useState<RailwayLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLines = async () => {
      try {
        const collection = database.get<RailwayLine>('railway_lines');
        const records = await collection.query(Q.where('operator_id', operatorId)).fetch();
        setLines(records);
      } catch (e) {
        console.error('Error loading lines:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadLines();

    const subscription = database.get<RailwayLine>('railway_lines')
      .query(Q.where('operator_id', operatorId))
      .observe()
      .subscribe((records) => {
        setLines(records);
      });

    return () => subscription.unsubscribe();
  }, [operatorId]);

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={operatorName || 'Railway Lines'} />
      </Appbar.Header>
      <FlatList
        data={lines}
        contentContainerStyle={styles.list}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <Text variant="titleMedium" style={styles.header}>
            Select a Railway Line
          </Text>
        }
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
          !isLoading ? (
            <Text style={styles.empty} variant="bodyMedium">
              No lines found for this operator.
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

export default LineScreen;
