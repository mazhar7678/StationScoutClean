import { useRoute } from '@react-navigation/native';
import React, { useMemo, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Linking } from 'react-native';
import { Appbar, Button, Card, Chip, Text, IconButton } from 'react-native-paper';

import { database } from '../../../data/data_sources/offline_database';
import { Event, Bookmark } from '../../../data/db/models';

const EventDetailScreen = ({ navigation }: { navigation: any }) => {
  const route = useRoute<any>();
  const { eventId } = route.params || {};
  const [event, setEvent] = useState<Event | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);

  useEffect(() => {
    const loadEvent = async () => {
      try {
        const eventRecord = await database.get<Event>('events').find(eventId);
        setEvent(eventRecord);
        
        const bookmarks = await database.get<Bookmark>('bookmarks')
          .query()
          .fetch();
        const bookmarked = bookmarks.some(b => b.eventId === eventId);
        setIsBookmarked(bookmarked);
      } catch (e) {
        console.error('Error loading event:', e);
      }
    };
    loadEvent();
  }, [eventId]);

  const handleBookmark = async () => {
    try {
      if (isBookmarked) {
        const bookmarks = await database.get<Bookmark>('bookmarks').query().fetch();
        const bookmark = bookmarks.find(b => b.eventId === eventId);
        if (bookmark) {
          await database.write(async () => {
            await bookmark.destroyPermanently();
          });
        }
        setIsBookmarked(false);
      } else {
        await database.write(async () => {
          await database.get<Bookmark>('bookmarks').create((record: Bookmark) => {
            record.eventId = eventId;
          });
        });
        setIsBookmarked(true);
      }
    } catch (e) {
      console.error('Error toggling bookmark:', e);
    }
  };

  const handleOpenUrl = () => {
    if (event?.url) {
      Linking.openURL(event.url);
    }
  };

  if (!event) {
    return (
      <View style={styles.container}>
        <Appbar.Header>
          <Appbar.BackAction onPress={() => navigation.goBack()} />
          <Appbar.Content title="Loading..." />
        </Appbar.Header>
        <View style={styles.loadingContainer}>
          <Text>Loading event details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title="Event Details" />
        <Appbar.Action
          icon={isBookmarked ? 'bookmark' : 'bookmark-outline'}
          onPress={handleBookmark}
        />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Text variant="headlineMedium" style={styles.title}>
              {event.name}
            </Text>
            
            {event.startDate && (
              <Chip icon="calendar" style={styles.chip}>
                {new Date(event.startDate).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Chip>
            )}

            {event.venueName && (
              <View style={styles.section}>
                <Text variant="titleSmall" style={styles.label}>Venue</Text>
                <Text variant="bodyLarge">{event.venueName}</Text>
              </View>
            )}

            {event.venueAddress && (
              <View style={styles.section}>
                <Text variant="titleSmall" style={styles.label}>Address</Text>
                <Text variant="bodyMedium">{event.venueAddress}</Text>
              </View>
            )}

            {event.source && (
              <View style={styles.section}>
                <Text variant="titleSmall" style={styles.label}>Source</Text>
                <Text variant="bodySmall" style={styles.source}>{event.source}</Text>
              </View>
            )}
          </Card.Content>
        </Card>

        {event.url && (
          <Button
            mode="contained"
            onPress={handleOpenUrl}
            style={styles.button}
            icon="open-in-new"
          >
            View Event Website
          </Button>
        )}

        <Button
          mode={isBookmarked ? 'outlined' : 'contained-tonal'}
          onPress={handleBookmark}
          style={styles.button}
          icon={isBookmarked ? 'bookmark-remove' : 'bookmark-plus'}
        >
          {isBookmarked ? 'Remove Bookmark' : 'Save to Bookmarks'}
        </Button>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 16,
  },
  chip: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  section: {
    marginTop: 16,
  },
  label: {
    color: '#666',
    marginBottom: 4,
  },
  source: {
    color: '#999',
  },
  button: {
    marginBottom: 12,
  },
});

export default EventDetailScreen;
