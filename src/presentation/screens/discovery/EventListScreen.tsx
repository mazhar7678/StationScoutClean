import { useNavigation, useRoute } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Text, Searchbar } from 'react-native-paper';

import { database } from '../../../data/data_sources/offline_database';
import { syncEvents } from '../../../data/data_sources/SyncService';
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
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadEvents = useCallback(async () => {
    try {
      const collection = database.get<Event>('events');
      let records = await collection.query().fetch();
      
      records = records.filter(e => e.source === 'ticketmaster');
      
      if (latitude && longitude) {
        const stationLat = parseFloat(latitude);
        const stationLon = parseFloat(longitude);
        
        const eventsWithDistance = records
          .filter(e => e.latitude && e.longitude)
          .map(e => ({
            event: e,
            distance: haversineDistance(stationLat, stationLon, e.latitude!, e.longitude!),
          }))
          .filter(e => e.distance <= 50)
          .sort((a, b) => a.distance - b.distance);
        
        if (eventsWithDistance.length > 0) {
          records = eventsWithDistance.map(e => e.event);
        } else {
          records = records.slice(0, 50);
        }
      } else {
        records = records.slice(0, 50);
      }
      
      setEvents(records);
      setFilteredEvents(records);
    } catch (e) {
      console.error('Error loading events:', e);
    } finally {
      setIsLoading(false);
    }
  }, [stationId, latitude, longitude]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEvents(events);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredEvents(events.filter(event => 
        event.name.toLowerCase().includes(query) ||
        (event.venueName && event.venueName.toLowerCase().includes(query))
      ));
    }
  }, [searchQuery, events]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await syncEvents();
    await loadEvents();
    setIsRefreshing(false);
  };

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
      <View style={styles.searchContainer}>
        <Searchbar
          placeholder="Search events..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
      </View>
      <FlatList
        data={filteredEvents}
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
            subtitle={item.venueName || item.venueAddress || 'Event'}
            icon="calendar-star"
            iconColor={colors.accent}
            imageUrl={item.imageUrl}
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
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No Matching Events' : 'No Events Found'}
            </Text>
            <Text style={styles.emptyHint}>
              {searchQuery 
                ? 'Try a different search term.'
                : latitude && longitude 
                  ? 'No events found within 50km of this station.'
                  : 'Pull down to refresh or try a different station.'
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

export default EventListScreen;
