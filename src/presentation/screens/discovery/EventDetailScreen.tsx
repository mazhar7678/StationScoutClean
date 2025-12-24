import { useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View, Linking, Pressable, Image, Share, Platform } from 'react-native';
import { Text, ActivityIndicator } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import { database } from '../../../data/data_sources/offline_database';
import { Event, Bookmark } from '../../../data/db/models';
import { GradientHeader } from '../../components/GradientHeader';
import { colors, spacing, borderRadius } from '../../theme/colors';

const EventDetailScreen = ({ navigation }: { navigation: any }) => {
  const route = useRoute<any>();
  const { eventId } = route.params || {};
  const [event, setEvent] = useState<Event | null>(null);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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
      } finally {
        setIsLoading(false);
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

  const handleShare = async () => {
    if (!event) return;
    
    try {
      const message = [
        `Check out this event: ${event.name}`,
        event.startDate ? `Date: ${formatDate(event.startDate)}` : '',
        event.venueName ? `Venue: ${event.venueName}` : '',
        event.url ? `\nBook tickets: ${event.url}` : '',
        '\nFound via StationScout'
      ].filter(Boolean).join('\n');

      await Share.share({
        message,
        title: event.name,
        url: event.url || undefined,
      });
    } catch (e) {
      console.error('Error sharing:', e);
    }
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return 'Date TBC';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return 'Date TBC';
    }
  };

  if (isLoading || !event) {
    return (
      <View style={styles.container}>
        <GradientHeader
          title="Event Details"
          onBack={() => navigation.goBack()}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading event details...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <GradientHeader
        title="Event Details"
        onBack={() => navigation.goBack()}
        onAction={handleBookmark}
        actionIcon={isBookmarked ? 'bookmark' : 'bookmark-outline'}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {event.imageUrl && (
          <Image 
            source={{ uri: event.imageUrl }} 
            style={styles.eventImage}
            resizeMode="cover"
          />
        )}
        <View style={styles.card}>
          <Text style={styles.eventName}>{event.name}</Text>
          
          <View style={styles.infoRow}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="calendar" size={20} color={colors.accent} />
            </View>
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Date</Text>
              <Text style={styles.infoValue}>{formatDate(event.startDate)}</Text>
            </View>
          </View>

          {event.venueName && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="map-marker" size={20} color={colors.accent} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Venue</Text>
                <Text style={styles.infoValue}>{event.venueName}</Text>
              </View>
            </View>
          )}

          {event.venueAddress && (
            <View style={styles.infoRow}>
              <View style={styles.iconContainer}>
                <MaterialCommunityIcons name="home" size={20} color={colors.accent} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Address</Text>
                <Text style={styles.infoValue}>{event.venueAddress}</Text>
              </View>
            </View>
          )}

          <View style={styles.sourceContainer}>
            <MaterialCommunityIcons name="ticket-confirmation" size={16} color={colors.textMuted} />
            <Text style={styles.sourceText}>Powered by Ticketmaster</Text>
          </View>
        </View>

        <View style={styles.actions}>
          {event.url && (
            <Pressable style={styles.primaryButton} onPress={handleOpenUrl}>
              <MaterialCommunityIcons name="ticket" size={20} color="#fff" />
              <Text style={styles.primaryButtonText}>Get Tickets</Text>
            </Pressable>
          )}

          <View style={styles.actionRow}>
            <Pressable 
              style={[styles.actionButton, isBookmarked && styles.bookmarkedButton]} 
              onPress={handleBookmark}
            >
              <MaterialCommunityIcons 
                name={isBookmarked ? 'bookmark-remove' : 'bookmark-plus'} 
                size={20} 
                color={isBookmarked ? colors.error : colors.primary} 
              />
              <Text style={[styles.actionButtonText, isBookmarked && styles.bookmarkedText]}>
                {isBookmarked ? 'Remove' : 'Save'}
              </Text>
            </Pressable>

            <Pressable style={styles.actionButton} onPress={handleShare}>
              <MaterialCommunityIcons name="share-variant" size={20} color={colors.primary} />
              <Text style={styles.actionButtonText}>Share</Text>
            </Pressable>
          </View>
        </View>
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
  loadingText: {
    marginTop: spacing.md,
    color: colors.textSecondary,
  },
  content: {
    padding: spacing.md,
  },
  eventImage: {
    width: '100%',
    height: 220,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.md,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: colors.primary,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  eventName: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.lg,
    lineHeight: 32,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.accent + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
  },
  sourceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  sourceText: {
    fontSize: 12,
    color: colors.textMuted,
    marginLeft: spacing.xs,
  },
  actions: {
    marginTop: spacing.sm,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accent,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
    marginLeft: spacing.sm,
  },
  actionRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  bookmarkedButton: {
    borderColor: colors.error + '50',
    backgroundColor: colors.error + '08',
  },
  actionButtonText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 14,
    marginLeft: spacing.xs,
  },
  bookmarkedText: {
    color: colors.error,
  },
});

export default EventDetailScreen;
