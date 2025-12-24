import { useNavigation } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Appbar, Text } from 'react-native-paper';

import { database } from '../../data/data_sources/offline_database';
import { Bookmark, Event } from '../../data/db/models';
import { Card } from '../components/Card';

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

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Saved Events" />
      </Appbar.Header>
      <FlatList
        data={bookmarkedEvents}
        keyExtractor={item => item.bookmarkId}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card
            title={item.event.name}
            subtitle={item.event.venueName ?? item.event.venueAddress ?? '—'}
            onPress={() =>
              navigation.navigate('EventDetail', {
                eventId: item.event.id,
              })
            }
          />
        )}
        ListEmptyComponent={
          !loading ? (
            <View style={styles.emptyContainer}>
              <Text variant="titleMedium" style={styles.emptyTitle}>
                No Saved Events
              </Text>
              <Text variant="bodyMedium" style={styles.emptyText}>
                Bookmark events you're interested in and they'll appear here for easy access, even offline.
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  list: {
    padding: 16,
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingTop: 100,
  },
  emptyTitle: {
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
  },
});

export default BookmarksScreen;
