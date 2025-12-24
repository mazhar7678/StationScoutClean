import { useNavigation, useRoute } from '@react-navigation/native';
import { Q } from '@nozbe/watermelondb';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';

import { database } from '../../../data/data_sources/offline_database';
import { Event } from '../../../data/db/models';
import { Card } from '../../components/Card';
import { GradientHeader } from '../../components/GradientHeader';
import { colors, spacing } from '../../theme/colors';

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const EventListScreen = () => {
  const route = useRoute<any>();
  const { stationId, stationName, latitude, longitude } = route.params || {};
  const navigation = useNavigation<any>();
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadEvents = async () => {
      try {
        const collection = database.get<Event>('events');
        let records = await collection.query().fetch();
        
        const sources = [...new Set(records.map(e => e.source))];
        console.log('[EventList] All sources in database:', sources);
        console.log('[EventList] Total events before filter:', records.length);
        
        records = records.filter(e => e.source === 'ticketmaster');
        
        console.log('[EventList] Ticketmaster events:', records.length);
        console.log('[EventList] Station coords:', { latitude, longitude, stationName });
        
        const eventsWithCoords = records.filter(e => e.latitude && e.longitude);
        console.log('[EventList] Events with coordinates:', eventsWithCoords.length);
        
        if (eventsWithCoords.length > 0) {
          console.log('[EventList] Sample event coords:', {
            name: eventsWithCoords[0].name,
            lat: eventsWithCoords[0].latitude,
            lng: eventsWithCoords[0].longitude
          });
        }
        
        if (latitude && longitude && eventsWithCoords.length > 0) {
          const stationLat = parseFloat(latitude);
          const stationLon = parseFloat(longitude);
          
          console.log('[EventList] Parsed station coords:', { stationLat, stationLon });
          
          const eventsWithDistance = records
            .filter(e => e.latitude && e.longitude)
            .map(e => ({
              event: e,
              distance: haversineDistance(stationLat, stationLon, e.latitude!, e.longitude!),
            }))
            .filter(e => e.distance <= 50)
            .sort((a, b) => a.distance - b.distance);
          
          console.log('[EventList] Events within 50km:', eventsWithDistance.length);
          
          if (eventsWithDistance.length > 0) {
            records = eventsWithDistance.map(e => e.event);
          } else {
            console.log('[EventList] No nearby events, showing first 50 by name');
            records = records.slice(0, 50);
          }
        } else {
          console.log('[EventList] No geo filtering, showing first 50 events');
          records = records.slice(0, 50);
        }
        
        setEvents(records);
      } catch (e) {
        console.error('Error loading events:', e);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, [stationId, latitude, longitude]);

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });
    } catch {
      return '';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <GradientHeader
          title="Events"
          subtitle={stationName ? `Near ${stationName}` : 'Discover local events'}
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
        title="Events"
        subtitle={stationName ? `Near ${stationName}` : 'Discover local events'}
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={events}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card
            title={item.name}
            subtitle={item.venueName || item.venueAddress || 'Event'}
            icon="calendar-star"
            iconColor={colors.accent}
            badge={formatDate(item.startDate) || undefined}
            badgeColor={colors.primary}
            onPress={() =>
              navigation.navigate('EventDetail', {
                eventId: item.id,
              })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>No Events Found</Text>
            <Text style={styles.emptyHint}>
              {latitude && longitude 
                ? 'No events found within 50km of this station.'
                : 'Try selecting a different station to find nearby events.'
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

export default EventListScreen;
