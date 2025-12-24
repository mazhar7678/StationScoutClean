import { useNavigation } from '@react-navigation/native';
import React, { useMemo } from 'react';
import { FlatList, RefreshControl, StyleSheet } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useDatabase } from '@nozbe/watermelondb/hooks';

import { EventRepository } from '@data/repositories/EventRepository';
import { useSyncService } from '@presentation/hooks/useSyncService';
import { useWatermelonQuery } from '@presentation/hooks/useWatermelonQuery';
import { Card } from '@presentation/components/Card';
import { DiscoveryStackParamList } from '@presentation/navigation/DiscoveryStack';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

const TOCScreen = () => {
  const navigation =
    useNavigation<NativeStackNavigationProp<DiscoveryStackParamList, 'TOC'>>();
  const database = useDatabase();
  const repository = useMemo(() => new EventRepository(database), [database]);
  const operators =
    useWatermelonQuery(() => repository.operatorsQuery(), [repository]) ?? [];
  const syncQuery = useSyncService();

  return (
    <FlatList
      contentContainerStyle={styles.list}
      data={operators}
      keyExtractor={item => item.id}
      refreshControl={
        <RefreshControl
          refreshing={syncQuery.isFetching}
          onRefresh={() => syncQuery.refetch()}
        />
      }
      ListHeaderComponent={
        <>
          <Text variant="titleLarge" style={styles.header}>
            Pick a Train Operating Company
          </Text>
          {syncQuery.isFetching ? (
            <ActivityIndicator style={styles.loading} />
          ) : null}
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
        !syncQuery.isFetching ? (
          <Text style={styles.empty} variant="bodyMedium">
            No operators cached yet. Pull to sync with Supabase.
          </Text>
        ) : null
      }
    />
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
