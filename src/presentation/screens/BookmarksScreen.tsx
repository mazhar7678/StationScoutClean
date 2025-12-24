import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBookmarks = async () => {
      try {
        const bookmarks = await database.get<Bookmark>('bookmarks').query().fetch();
        const events: BookmarkedEvent[] = [];
        
        for (const bookmark of bookmarks) {
          try {
            const event = await database.get<Event>('events').find(bookmark.eventId);
            events.push({ bookmarkId: bookmark.id, event });
          } catch (e) {
            console.log('Event not found for bookmark:', bookmark.eventId);
          }
        }
        
        setBookmarkedEvents(events);
      } catch (e) {
        console.error('Error loading bookmarks:', e);
      } finally {
        setLoading(false);
      }
    };
    
    const unsubscribe = navigation.addListener('focus', loadBookmarks);
    loadBookmarks();
    
    return unsubscribe;
  }, [navigation]);

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
        subtitle={`${bookmarkedEvents.length} event${bookmarkedEvents.length !== 1 ? 's' : ''} saved`}
        onBack={() => navigation.goBack()}
      />
      <FlatList
        data={bookmarkedEvents}
        keyExtractor={item => item.bookmarkId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card
            title={item.event.name}
            subtitle={item.event.venueName ?? item.event.venueAddress ?? 'Event'}
            icon="bookmark"
            iconColor={colors.accent}
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
            <Text style={styles.emptyTitle}>No Saved Events</Text>
            <Text style={styles.emptyText}>
              Bookmark events you're interested in and they'll appear here for easy access, even offline.
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
