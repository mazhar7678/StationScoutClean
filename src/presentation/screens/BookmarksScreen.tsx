import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState, useCallback } from 'react';
import { FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { Text, ActivityIndicator, Searchbar } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { database } from '../../data/data_sources/offline_database';
import { Bookmark, Event } from '../../data/db/models';
import { Card } from '../components/Card';
import { GradientHeader } from '../components/GradientHeader';
import { colors, spacing } from '../theme/colors';

type BookmarkedEvent = {
  bookmarkId: string;
  event: Event;
};

const BookmarksScreen = () => {
  const navigation = useNavigation<any>();
  const [bookmarkedEvents, setBookmarkedEvents] = useState<BookmarkedEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<BookmarkedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const loadBookmarks = useCallback(async () => {
    try {
      const bookmarks = await database.get<Bookmark>('bookmarks').query().fetch();
      const events: BookmarkedEvent[] = [];
      
      for (const bookmark of bookmarks) {
        try {
          const event = await database.get<Event>('events').find(bookmark.eventId);
          events.push({ bookmarkId: bookmark.id, event });
        } catch (e) {
          // Event may have been removed
        }
      }
      
      setBookmarkedEvents(events);
      setFilteredEvents(events);
    } catch (e) {
      console.error('Error loading bookmarks:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', loadBookmarks);
    loadBookmarks();
    
    return unsubscribe;
  }, [navigation, loadBookmarks]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredEvents(bookmarkedEvents);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredEvents(bookmarkedEvents.filter(item => 
        item.event.name.toLowerCase().includes(query) ||
        (item.event.venueName && item.event.venueName.toLowerCase().includes(query))
      ));
    }
  }, [searchQuery, bookmarkedEvents]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadBookmarks();
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

  if (loading) {
    return (
      <View style={styles.container}>
        <GradientHeader
          title="Saved Events"
          subtitle="Your bookmarked events"
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
        title="Saved Events"
        subtitle={`${filteredEvents.length} event${filteredEvents.length !== 1 ? 's' : ''} saved`}
        onBack={() => navigation.goBack()}
      />
      {bookmarkedEvents.length > 0 && (
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search saved events..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={styles.searchBar}
            inputStyle={styles.searchInput}
          />
        </View>
      )}
      <FlatList
        data={filteredEvents}
        keyExtractor={item => item.bookmarkId}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        renderItem={({ item }) => (
          <Card
            title={item.event.name}
            subtitle={item.event.venueName ?? item.event.venueAddress ?? 'Event'}
            icon="bookmark"
            iconColor={colors.accent}
            imageUrl={item.event.imageUrl}
            badge={formatDate(item.event.startDate) || undefined}
            badgeColor={colors.primary}
            onPress={() =>
              navigation.navigate('EventDetail', {
                eventId: item.event.id,
              })
            }
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIcon}>
              <MaterialCommunityIcons name="bookmark-outline" size={48} color={colors.textMuted} />
            </View>
            <Text style={styles.emptyTitle}>
              {searchQuery ? 'No Matching Events' : 'No Saved Events'}
            </Text>
            <Text style={styles.emptyText}>
              {searchQuery 
                ? 'Try a different search term.'
                : 'Bookmark events you\'re interested in and they\'ll appear here for easy access, even offline.'
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
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingTop: 80,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textSecondary,
    lineHeight: 22,
  },
});

export default BookmarksScreen;
