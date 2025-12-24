import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, Searchbar } from 'react-native-paper';

import { database } from '../../../data/data_sources/offline_database';
import { syncStations } from '../../../data/data_sources/SyncService';
import { Station } from '../../../data/db/models';
import { Card } from '../../components/Card';
import { GradientHeader } from '../../components/GradientHeader';
import { colors, spacing } from '../../theme/colors';

const StationListScreen = () => {
  const route = useRoute<any>();
  const { lineName } = route.params || {};
  const navigation = useNavigation<any>();
  const [stations, setStations] = useState<Station[]>([]);
  const [filteredStations, setFilteredStations] = useState<Station[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadStations = useCallback(async () => {
    try {
      const collection = database.get<Station>('stations');
      const records = await collection.query().fetch();
      const sortedRecords = records.sort((a, b) => a.name.localeCompare(b.name));
      setStations(sortedRecords);
      setFilteredStations(sortedRecords);
    } catch (e) {
      console.error('Error loading stations:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStations();

    const subscription = database.get<Station>('stations')
      .query()
      .observe()
      .subscribe((records) => {
        const sortedRecords = records.sort((a, b) => a.name.localeCompare(b.name));
        setStations(sortedRecords);
        if (!searchQuery) {
          setFilteredStations(sortedRecords);
        }
      });

    return () => subscription.unsubscribe();
  }, [loadStations, searchQuery]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredStations(stations);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredStations(stations.filter(station => 
        station.name.toLowerCase().includes(query) ||
        (station.code && station.code.toLowerCase().includes(query))
      ));
    }
  }, [searchQuery, stations]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await syncStations();
    await loadStations();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <GradientHeader
          title="All Stations"
          subtitle={lineName ? `Exploring ${lineName}` : 'Find events near stations'}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientHeader
        title="All Stations"
        subtitle={`${filteredStations.length} stations available`}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search stations..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
      </View>
      <FlatList
        data={filteredStations}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => (
          <Card
            title={item.name}
            subtitle={item.code || 'Station'}
            icon="map-marker"
            iconColor={colors.accent}
            onPress={() =>
              navigation.navigate('Events', {
                stationId: item.id,
                stationName: item.name,
                latitude: item.latitude,
                longitude: item.longitude,
              })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No Matching Stations' : 'No Stations Found'}
            </Text>
            <Text style={styles.emptyHint}>
              {searchQuery 
                ? 'Try a different search term.'
                : 'Pull down to refresh or check back later.'
              }
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  searchBar: {
    backgroundColor: colors.surface,
    elevation: 2,
  },
  searchInput: {
    fontSize: 14,
  },
  list: {
    padding: spacing.md,
    paddingTop: spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyHint: {
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

export default StationListScreen;
