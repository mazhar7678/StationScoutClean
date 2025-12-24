import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { database } from '../../../data/data_sources/offline_database';
import { Station } from '../../../data/db/models';
import { Card } from '../../components/Card';
import { GradientHeader } from '../../components/GradientHeader';
import { colors, spacing } from '../../theme/colors';

const StationListScreen = () => {
  const route = useRoute<any>();
  const { lineName } = route.params || {};
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
  }, []);

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
        subtitle={`${stations.length} stations available`}
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={stations}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
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
            <Text style={styles.emptyTitle}>No Stations Found</Text>
            <Text style={styles.emptyHint}>
              Stations will appear here after syncing data.
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
  list: {
    padding: spacing.md,
    paddingTop: spacing.lg,
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
