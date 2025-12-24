import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';

import { database } from '../../../data/data_sources/offline_database';
import { EventRepository } from '../../../data/repositories/EventRepository';
import { ListItem } from '../../components/ListItem';
import { useWatermelonQuery } from '../../hooks/useWatermelonQuery';

const LineScreen = () => {
  const route = useRoute<any>();
  const { operatorId, operatorName } = route.params || {};
  const navigation = useNavigation<any>();
  const repository = useMemo(() => new EventRepository(database), []);
  const lines = useWatermelonQuery(
    () => repository.linesByOperator(operatorId),
    [repository, operatorId]
  ) ?? [];

  return (
    <View style={{ flex: 1 }}>
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
          <Text style={styles.empty} variant="bodyMedium">
            No lines found for this operator.
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

export default LineScreen;
