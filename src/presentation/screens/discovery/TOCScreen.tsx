import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { database } from '../../../data/data_sources/offline_database';
import { syncAll } from '../../../data/data_sources/SyncService';
import { TrainOperator } from '../../../data/db/models';
import { Card } from '../../components/Card';
import { GradientHeader } from '../../components/GradientHeader';
import { colors, spacing } from '../../theme/colors';

const operatorIcons: Record<string, string> = {
  'SWR': 'train',
  'GWR': 'train-variant',
  'LNER': 'train',
  'AWC': 'train',
  'XC': 'swap-horizontal',
  'EMR': 'train',
  'SE': 'train',
  'TL': 'train-car',
  'GTR': 'train',
  'NR': 'train',
  'TPE': 'train',
  'SR': 'train',
  'C2C': 'train-car',
  'LO': 'subway',
  'NTL': 'train',
  'GA': 'train',
  'HT': 'train',
  'TfW': 'train',
  'MR': 'tram',
  'ES': 'train',
  'default': 'train',
};

const getOperatorIcon = (code: string | null): string => {
  if (!code) return operatorIcons.default;
  return operatorIcons[code] || operatorIcons.default;
};

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
      <View style={styles.container}>
        <GradientHeader
          title="Train Operators"
          subtitle="Discover events along your route"
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading operators...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Train Operators"
        subtitle="Discover events along your route"
        onBack={() => navigation.goBack()}
        onAction={handleSync}
        actionIcon="refresh"
      />
      <FlatList
        contentContainerStyle={styles.list}
        data={operators}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl 
            refreshing={isSyncing} 
            onRefresh={handleSync}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          isSyncing ? (
            <View style={styles.syncingBanner}>
              <ActivityIndicator size="small" color={colors.accent} />
              <Text style={styles.syncingText}>Syncing data...</Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <Card
            title={item.name}
            subtitle={item.country ?? 'UK Train Operator'}
            icon={getOperatorIcon(item.country) as any}
            iconColor={colors.primary}
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
              <Text style={styles.emptyTitle}>No Operators Found</Text>
              <Text style={styles.emptyHint}>
                Pull down or tap the refresh icon to sync data from the server.
              </Text>
            </View>
          ) : null
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
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
  syncingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary + '10',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  syncingText: {
    marginLeft: spacing.sm,
    color: colors.primary,
    fontWeight: '500',
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

export default TOCScreen;
