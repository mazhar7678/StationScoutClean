import { useNavigation, useRoute } from '@react-navigation/native';
import { Q } from '@nozbe/watermelondb';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { database } from '../../../data/data_sources/offline_database';
import { RailwayLine } from '../../../data/db/models';
import { Card } from '../../components/Card';
import { GradientHeader } from '../../components/GradientHeader';
import { colors, spacing } from '../../theme/colors';

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
      <FlatList
        data={lines}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
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
            <Text style={styles.emptyTitle}>No Lines Found</Text>
            <Text style={styles.emptyHint}>
              No railway lines are available for this operator yet.
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

export default LineScreen;
