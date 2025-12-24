import { useNavigation, useRoute } from '@react-navigation/native';
import type {
  NativeStackNavigationProp,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { useDatabase } from '@nozbe/watermelondb/hooks';
import React, { useMemo } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Chip, Text } from 'react-native-paper';

import { EventRepository } from '@data/repositories/EventRepository';
import { ListItem } from '@presentation/components/ListItem';
import { DiscoveryStackParamList } from '@presentation/navigation/DiscoveryStack';
import { useWatermelonQuery } from '@presentation/hooks/useWatermelonQuery';

type RouteProps = NativeStackScreenProps<DiscoveryStackParamList, 'Events'>;

const severityColorMap: Record<string, string> = {
  critical: '#C62828',
  high: '#E65100',
  medium: '#F9A825',
  low: '#2E7D32',
};

const EventListScreen = () => {
  const { params } = useRoute<RouteProps['route']>();
  const navigation =
    useNavigation<
      NativeStackNavigationProp<DiscoveryStackParamList, 'Events'>
    >();
  const database = useDatabase();
  const repository = useMemo(() => new EventRepository(database), [database]);
  const events =
    useWatermelonQuery(
      () => repository.eventsByStation(params.stationId),
      [repository, params.stationId],
    ) ?? [];

  return (
    <FlatList
      data={events}
      keyExtractor={item => item.id}
      contentContainerStyle={styles.list}
      renderItem={({ item }) => (
        <ListItem
          title={item.title}
          description={item.description ?? item.status}
          onPress={() =>
            navigation.navigate('EventDetail', {
              eventId: item.id,
            })
          }
          right={
            <Chip
              style={[
                styles.chip,
                {
                  backgroundColor: severityColorMap[item.severity] ?? '#e0e0e0',
                },
              ]}
              textStyle={styles.chipText}
            >
              {item.severity.toUpperCase()}
            </Chip>
          }
        />
      )}
      ListEmptyComponent={
        <Text style={styles.empty} variant="bodyMedium">
          No events logged for this station.
        </Text>
      }
    />
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
  },
  chip: {
    alignSelf: 'flex-start',
  },
  chipText: {
    color: '#fff',
  },
  empty: {
    marginTop: 32,
    textAlign: 'center',
  },
});

export default EventListScreen;
