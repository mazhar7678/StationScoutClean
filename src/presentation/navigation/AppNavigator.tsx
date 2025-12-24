// src/presentation/navigation/AppNavigator.tsx

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthChangeEvent, Session } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';

import { SupabaseClient } from '../../data/data_sources/supabase_client';
import LoginScreen from '../screens/auth/LoginScreen';
import EventDetailsScreen from '../screens/discovery/EventDetailScreen';
import HomeScreen from '../screens/HomeScreen';

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
            <Stack.Screen name="EventDetails" component={EventDetailsScreen} />
          </>
        ) : (
          // ** THIS IS THE FIX **
          // The component prop should be the component itself, not a function that returns it.
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}