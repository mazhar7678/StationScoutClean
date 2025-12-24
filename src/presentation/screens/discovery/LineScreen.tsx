import { useNavigation, useRoute } from '@react-navigation/native';
import { Q } from '@nozbe/watermelondb';
import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, Searchbar } from 'react-native-paper';

import { database } from '../../../data/data_sources/offline_database';
import { syncLines } from '../../../data/data_sources/SyncService';
import { RailwayLine } from '../../../data/db/models';
import { Card } from '../../components/Card';
import { GradientHeader } from '../../components/GradientHeader';
import { colors, spacing } from '../../theme/colors';

const LineScreen = () => {
  const route = useRoute<any>();
  const { operatorId, operatorName } = route.params || {};
  const navigation = useNavigation<any>();
  const [lines, setLines] = useState<RailwayLine[]>([]);
  const [filteredLines, setFilteredLines] = useState<RailwayLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadLines = useCallback(async () => {
    try {
      const collection = database.get<RailwayLine>('railway_lines');
      const records = await collection.query(Q.where('operator_id', operatorId)).fetch();
      setLines(records);
      setFilteredLines(records);
    } catch (e) {
      console.error('Error loading lines:', e);
    } finally {
      setIsLoading(false);
    }
  }, [operatorId]);

  useEffect(() => {
    loadLines();

    const subscription = database.get<RailwayLine>('railway_lines')
      .query(Q.where('operator_id', operatorId))
      .observe()
      .subscribe((records) => {
        setLines(records);
        if (!searchQuery) {
          setFilteredLines(records);
        }
      });

    return () => subscription.unsubscribe();
  }, [operatorId, loadLines, searchQuery]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredLines(lines);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredLines(lines.filter(line => 
        line.name.toLowerCase().includes(query) ||
        (line.code && line.code.toLowerCase().includes(query))
      ));
    }
  }, [searchQuery, lines]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await syncLines();
    await loadLines();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <GradientHeader
          title="Railway Lines"
          subtitle={operatorName || 'Select a line'}
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
        title="Railway Lines"
        subtitle={operatorName || 'Select a line'}
        onBack={() => navigation.goBack()}
      />
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search lines..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
      </View>
      <FlatList
        data={filteredLines}
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
            subtitle={item.code || 'Railway Line'}
            icon="subway-variant"
            iconColor={item.color || colors.accent}
            onPress={() =>
              navigation.navigate('Stations', {
                lineId: item.id,
                lineName: item.name,
                operatorId: operatorId,
              })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No Matching Lines' : 'No Lines Found'}
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

export default LineScreen;
