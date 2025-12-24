import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { SupabaseClient } from '../../data/data_sources/supabase_client';
import LoginScreen from '../screens/auth/LoginScreen';
import SignUpScreen from '../screens/auth/SignUpScreen';
import HomeScreen from '../screens/HomeScreen';
import BookmarksScreen from '../screens/BookmarksScreen';
import TOCScreen from '../screens/discovery/TOCScreen';
import LineScreen from '../screens/discovery/LineScreen';
import StationListScreen from '../screens/discovery/StationListScreen';
import EventListScreen from '../screens/discovery/EventListScreen';
import EventDetailScreen from '../screens/discovery/EventDetailScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    SupabaseClient.client.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = SupabaseClient.client.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session: Session | null) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {session ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Bookmarks" component={BookmarksScreen} />
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
  );
}
