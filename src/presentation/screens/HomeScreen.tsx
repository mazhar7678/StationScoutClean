// src/presentation/screens/HomeScreen.tsx

import React from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { ActivityIndicator, Appbar, Card, Text } from 'react-native-paper';

// ** THIS IS THE FINAL, CORRECT IMPORT **
// We import the HOC from its own package
import withObservables from '@nozbe/with-observables';

// All other imports are correct
import { database } from '../../data/data_sources/offline_database';
import { SupabaseClient } from '../../data/data_sources/supabase_client';
import { syncEvents } from '../../data/data_sources/SyncService';

const EventCard = ({ event, navigation }: { event: any, navigation: any }) => (
  <Card
    onPress={() => navigation.navigate('EventDetails', { eventId: event.id })}
    style={styles.card}
  >
    <Card.Title
      title={event.name}
      subtitle={event.venueName}
      titleNumberOfLines={2}
    />
    <Card.Content>
      {event.startDate && <Text variant="bodyMedium">Date: {new Date(event.startDate).toLocaleString()}</Text>}
    </Card.Content>
  </Card>
);

// This is the list component that will receive the 'events' prop from the HOC
const EventList = ({ events, navigation }: { events: any[], navigation: any }) => (
  <FlatList
    data={events}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => <EventCard event={item} navigation={navigation} />}
    contentContainerStyle={styles.list}
  />
);

// We enhance the EventList component by wrapping it with withObservables
const EnhancedEventList = withObservables(
  [], // Dependencies
  () => ({
    // This function returns the data we want to observe
    events: database.get('events').query().observe(),
  })
)(EventList);


export default function HomeScreen({ navigation }: { navigation: any }) {
  const [isSyncing, setIsSyncing] = React.useState(true);

  React.useEffect(() => {
    const runSync = async () => {
      setIsSyncing(true);
      await syncEvents();
      setIsSyncing(false);
    };
    runSync();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="StationScout Events" />
        <Appbar.Action icon="logout" onPress={() => SupabaseClient.signOut()} />
      </Appbar.Header>
      {isSyncing ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator animating={true} size="large" />
          <Text style={styles.loaderText}>Syncing Events...</Text>
        </View>
      ) : (
        // We render the enhanced component
        <EnhancedEventList navigation={navigation} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loaderText: { marginTop: 10 },
  list: { paddingVertical: 8 },
  card: { marginVertical: 6, marginHorizontal: 16 },
});