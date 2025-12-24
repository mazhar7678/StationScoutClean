import React from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { Appbar, Button, Card, Text } from 'react-native-paper';

import { SupabaseClient } from '../../data/data_sources/supabase_client';

export default function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="StationScout" />
        <Appbar.Action icon="bookmark-outline" onPress={() => navigation.navigate('Bookmarks')} />
        <Appbar.Action icon="logout" onPress={() => SupabaseClient.signOut()} />
      </Appbar.Header>
      
      <View style={styles.content}>
        <Text variant="headlineMedium" style={styles.title}>
          Discover Events Near Train Stations
        </Text>
        <Text variant="bodyLarge" style={styles.subtitle}>
          Explore local events along your favourite railway lines across the UK
        </Text>

        <Card style={styles.card} onPress={() => navigation.navigate('TOC')}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              Start Exploring
            </Text>
            <Text variant="bodyMedium" style={styles.cardDescription}>
              Browse train operators and discover events near stations along their routes
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.card} onPress={() => navigation.navigate('Bookmarks')}>
          <Card.Content>
            <Text variant="titleLarge" style={styles.cardTitle}>
              My Saved Events
            </Text>
            <Text variant="bodyMedium" style={styles.cardDescription}>
              View your bookmarked events - accessible even offline
            </Text>
          </Card.Content>
        </Card>

        <View style={styles.featureList}>
          <Text variant="titleSmall" style={styles.featureTitle}>How it works:</Text>
          <Text variant="bodySmall" style={styles.featureItem}>1. Select a Train Operating Company</Text>
          <Text variant="bodySmall" style={styles.featureItem}>2. Choose a railway line to explore</Text>
          <Text variant="bodySmall" style={styles.featureItem}>3. Browse stations along the line</Text>
          <Text variant="bodySmall" style={styles.featureItem}>4. Discover events near each station</Text>
          <Text variant="bodySmall" style={styles.featureItem}>5. Bookmark events for your trip</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
  },
  card: {
    marginBottom: 16,
  },
  cardTitle: {
    marginBottom: 4,
  },
  cardDescription: {
    color: '#666',
  },
  featureList: {
    marginTop: 24,
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  featureTitle: {
    marginBottom: 12,
    fontWeight: 'bold',
  },
  featureItem: {
    marginBottom: 6,
    color: '#555',
  },
});
