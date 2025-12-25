import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { SupabaseClient, AuthUser } from '../../data/data_sources/supabase_client';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import MapScreen from '../screens/MapScreen';
import TOCScreen from '../screens/discovery/TOCScreen';
import LineScreen from '../screens/discovery/LineScreen';
import StationListScreen from '../screens/discovery/StationListScreen';
import EventListScreen from '../screens/discovery/EventListScreen';
import EventDetailScreen from '../screens/discovery/EventDetailScreen';
import ErrorBoundary from '../components/ErrorBoundary';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [session, setSession] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    SupabaseClient.getSession().then(({ session }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { unsubscribe } = SupabaseClient.onAuthStateChange((user) => {
      setSession(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {session ? (
            <>
              <Stack.Screen name="Home" component={HomeScreen} />
              <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
              <Stack.Screen name="Map" component={MapScreen} />
              <Stack.Screen name="TOC" component={TOCScreen} />
              <Stack.Screen name="Lines" component={LineScreen} />
              <Stack.Screen name="Stations" component={StationListScreen} />
              <Stack.Screen name="Events" component={EventListScreen} />
              <Stack.Screen name="EventDetail" component={EventDetailScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="SignUp" component={SignUpScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </ErrorBoundary>
  );
}
