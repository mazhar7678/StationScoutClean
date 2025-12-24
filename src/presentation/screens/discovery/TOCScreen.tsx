import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Text } from 'react-native-paper';

import { database } from '../../../data/data_sources/offline_database';
import { syncAll } from '../../../data/data_sources/SyncService';
import { EventRepository } from '../../../data/repositories/EventRepository';
import { useWatermelonQuery } from '../../hooks/useWatermelonQuery';
import { Card } from '../../components/Card';

const TOCScreen = () => {
  const navigation = useNavigation<any>();
  const repository = useMemo(() => new EventRepository(database), []);
  const operators = useWatermelonQuery(() => repository.operatorsQuery(), [repository]) ?? [];
  const [isSyncing, setIsSyncing] = React.useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncAll();
    setIsSyncing(false);
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Train Operators" />
        <Appbar.Action icon="refresh" onPress={handleSync} />
      </Appbar.Header>
      <FlatList
        contentContainerStyle={styles.list}
        data={operators}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl refreshing={isSyncing} onRefresh={handleSync} />
        }
        ListHeaderComponent={
          <>
            <Text variant="titleLarge" style={styles.header}>
              Pick a Train Operating Company
            </Text>
            {isSyncing ? <ActivityIndicator style={styles.loading} /> : null}
          </>
        }
        renderItem={({ item }) => (
          <Card
            title={item.name}
            subtitle={item.country ?? '—'}
            onPress={() =>
              navigation.navigate('Lines', {
                operatorId: item.id,
                operatorName: item.name,
              })
            }
          />
        )}
        ListEmptyComponent={
          !isSyncing ? (
            <Text style={styles.empty} variant="bodyMedium">
              No operators found. Pull down to sync data from the server.
            </Text>
          ) : null
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
  loading: {
    marginBottom: 16,
  },
  empty: {
    textAlign: 'center',
    marginTop: 32,
  },
});

export default TOCScreen;
