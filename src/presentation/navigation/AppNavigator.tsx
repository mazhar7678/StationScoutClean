import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { Session } from '@supabase/supabase-js';

import { getSession, onAuthStateChange } from '../../data/data_sources/supabase_client';
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
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('[AppNavigator] Initializing auth state...');
    
    getSession().then((sess) => {
      console.log('[AppNavigator] Initial session:', sess ? 'logged in' : 'not logged in');
      setSession(sess);
      setLoading(false);
    });

    const { unsubscribe } = onAuthStateChange((event, sess) => {
      console.log('[AppNavigator] Auth state changed:', event, sess ? 'has session' : 'no session');
      setSession(sess);
      setLoading(false);
    });

    return () => {
      console.log('[AppNavigator] Cleaning up auth listener');
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  console.log('[AppNavigator] Rendering with session:', session ? 'logged in' : 'not logged in');

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
