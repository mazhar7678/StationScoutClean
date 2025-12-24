import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet, Platform, Pressable, ScrollView } from 'react-native';
import { Text, ActivityIndicator, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { database } from '../../data/data_sources/offline_database';
import { Event } from '../../data/db/models';
import { GradientHeader } from '../components/GradientHeader';
import { Card } from '../components/Card';
import { colors, spacing, borderRadius } from '../theme/colors';

const MapScreen = () => {
  const navigation = useNavigation<any>();
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null);

  const regions = [
    { name: 'London', lat: 51.5074, lng: -0.1278, radius: 30 },
    { name: 'Manchester', lat: 53.4808, lng: -2.2426, radius: 25 },
    { name: 'Birmingham', lat: 52.4862, lng: -1.8904, radius: 25 },
    { name: 'Leeds', lat: 53.8008, lng: -1.5491, radius: 25 },
    { name: 'Glasgow', lat: 55.8642, lng: -4.2518, radius: 25 },
    { name: 'Edinburgh', lat: 55.9533, lng: -3.1883, radius: 25 },
    { name: 'Bristol', lat: 51.4545, lng: -2.5879, radius: 25 },
    { name: 'Liverpool', lat: 53.4084, lng: -2.9916, radius: 25 },
  ];

  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const loadEvents = useCallback(async () => {
    try {
      const collection = database.get<Event>('events');
      let records = await collection.query().fetch();
      records = records.filter(e => e.source === 'ticketmaster' && e.latitude && e.longitude);
      setEvents(records);
      setFilteredEvents(records.slice(0, 20));
    } catch (e) {
      console.error('Error loading events:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    let filtered = events;

    if (selectedRegion) {
      const region = regions.find(r => r.name === selectedRegion);
      if (region) {
        filtered = events.filter(e => {
          if (!e.latitude || !e.longitude) return false;
          const distance = haversineDistance(region.lat, region.lng, e.latitude, e.longitude);
          return distance <= region.radius;
        });
      }
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(e =>
        e.name.toLowerCase().includes(query) ||
        (e.venueName && e.venueName.toLowerCase().includes(query))
      );
    }

    setFilteredEvents(filtered.slice(0, 30));
  }, [searchQuery, selectedRegion, events]);

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
          title="Explore by Region"
          subtitle="Find events near you"
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
        title="Explore by Region"
        subtitle={selectedRegion ? `Events near ${selectedRegion}` : 'Select a region'}
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

      <View style={styles.regionsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.regionsList}>
          <Pressable
            style={[styles.regionChip, !selectedRegion && styles.regionChipActive]}
            onPress={() => setSelectedRegion(null)}
          >
            <MaterialCommunityIcons 
              name="earth" 
              size={16} 
              color={!selectedRegion ? '#fff' : colors.primary} 
            />
            <Text style={[styles.regionChipText, !selectedRegion && styles.regionChipTextActive]}>
              All UK
            </Text>
          </Pressable>
          {regions.map((region) => (
            <Pressable
              key={region.name}
              style={[styles.regionChip, selectedRegion === region.name && styles.regionChipActive]}
              onPress={() => setSelectedRegion(region.name)}
            >
              <MaterialCommunityIcons 
                name="map-marker" 
                size={16} 
                color={selectedRegion === region.name ? '#fff' : colors.primary} 
              />
              <Text style={[styles.regionChipText, selectedRegion === region.name && styles.regionChipTextActive]}>
                {region.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="calendar-star" size={20} color={colors.accent} />
          <Text style={styles.statText}>{filteredEvents.length} events</Text>
        </View>
        <View style={styles.stat}>
          <MaterialCommunityIcons name="map-marker-radius" size={20} color={colors.primary} />
          <Text style={styles.statText}>
            {selectedRegion ? `Within 25km of ${selectedRegion}` : 'All regions'}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.eventsList} contentContainerStyle={styles.eventsListContent}>
        {filteredEvents.length === 0 ? (
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="map-search-outline" size={48} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No Events Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'Try a different search term or region.'
                : 'Select a region to see nearby events.'}
            </Text>
          </View>
        ) : (
          filteredEvents.map((event) => (
            <Card
              key={event.id}
              title={event.name}
              subtitle={event.venueName || 'Event'}
              icon="calendar-star"
              iconColor={colors.accent}
              imageUrl={event.imageUrl}
              badge={formatDate(event.startDate) || undefined}
              badgeColor={colors.primary}
              onPress={() => navigation.navigate('EventDetail', { eventId: event.id })}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  regionsContainer: {
    paddingTop: spacing.md,
  },
  regionsList: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
  },
  regionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: colors.primary + '30',
    marginRight: spacing.sm,
  },
  regionChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  regionChipText: {
    color: colors.primary,
    fontWeight: '500',
    marginLeft: spacing.xs,
  },
  regionChipTextActive: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: spacing.xs,
    color: colors.textSecondary,
    fontSize: 13,
  },
  eventsList: {
    flex: 1,
  },
  eventsListContent: {
    padding: spacing.md,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

export default MapScreen;
