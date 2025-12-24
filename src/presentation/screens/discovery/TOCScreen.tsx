import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Text } from 'react-native-paper';

import { database } from '../../../data/data_sources/offline_database';
import { syncAll } from '../../../data/data_sources/SyncService';
import { TrainOperator } from '../../../data/db/models';
import { Card } from '../../components/Card';

const TOCScreen = () => {
  const navigation = useNavigation<any>();
  const [operators, setOperators] = useState<TrainOperator[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadOperators = async () => {
    try {
      const collection = database.get<TrainOperator>('train_operators');
      const records = await collection.query().fetch();
      setOperators(records);
    } catch (e) {
      console.error('Error loading operators:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOperators();
    const subscription = database.get<TrainOperator>('train_operators')
      .query()
      .observe()
      .subscribe((records) => {
        setOperators(records);
      });
    return () => subscription.unsubscribe();
  }, []);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncAll();
    setIsSyncing(false);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1 }}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Train Operators" />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>Loading operators...</Text>
        </View>
      </View>
    );
  }

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
            <View style={styles.emptyContainer}>
              <Text style={styles.empty} variant="bodyMedium">
                No operators found.
              </Text>
              <Text style={styles.emptyHint} variant="bodySmall">
                Tap the refresh icon or pull down to sync data from the server.
              </Text>
            </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 32,
  },
  empty: {
    textAlign: 'center',
  },
  emptyHint: {
    textAlign: 'center',
    marginTop: 8,
    color: '#666',
  },
});

export default TOCScreen;
