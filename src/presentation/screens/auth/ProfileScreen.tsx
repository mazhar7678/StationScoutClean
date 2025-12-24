import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Divider,
  SegmentedButtons,
  Text,
} from 'react-native-paper';

import { SecureAuthStorage } from '@data/data_sources/secure_auth_storage';
import { SupabaseClient } from '@data/data_sources/supabase_client';

import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';

const ProfileScreen = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [hasStoredCredentials, setHasStoredCredentials] = useState(false);

  useEffect(() => {
    let isMounted = true;

    SupabaseClient.client.auth.getSession().then(({ data }) => {
      if (isMounted) {
        setSession(data.session);
      }
    });

    SecureAuthStorage.hasCredentials().then(result => {
      if (isMounted) {
        setHasStoredCredentials(result);
      }
    });

    const {
      data: authListener,
    }: { data: { subscription: { unsubscribe: () => void } } } =
      SupabaseClient.client.auth.onAuthStateChange(
        (_event: AuthChangeEvent, nextSession) => {
          setSession(nextSession);
        },
      );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await SupabaseClient.signOut();
    await SecureAuthStorage.clear();
    setSession(null);
    setHasStoredCredentials(false);
  };

  const handleClearBiometrics = async () => {
    await SecureAuthStorage.clear();
    setHasStoredCredentials(false);
  };

  if (!session) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text variant="headlineSmall" style={styles.title}>
          Welcome to StationScout
        </Text>
        <SegmentedButtons
          value={mode}
          onValueChange={value => setMode(value as 'login' | 'signup')}
          buttons={[
            { value: 'login', label: 'Login' },
            { value: 'signup', label: 'Sign Up' },
          ]}
          style={styles.segmented}
        />
        {mode === 'login' ? <LoginScreen /> : <SignUpScreen />}
        {hasStoredCredentials ? (
          <Button mode="text" onPress={handleClearBiometrics}>
            Remove stored biometric credentials
          </Button>
        ) : null}
      </ScrollView>
    );
  }

  const email = session.user.email ?? 'Unknown user';
  const lastSignIn = session.user.last_sign_in_at
    ? new Date(session.user.last_sign_in_at).toLocaleString()
    : '—';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileHeader}>
        <Avatar.Text
          size={72}
          label={email.charAt(0).toUpperCase()}
          style={styles.avatar}
        />
        <Text variant="titleLarge">{email}</Text>
        <Text variant="bodyMedium" style={styles.metadata}>
          Last sign-in: {lastSignIn}
        </Text>
      </View>
      <Divider style={styles.divider} />
      <Button mode="contained" onPress={handleLogout} style={styles.button}>
        Sign out
      </Button>
      {hasStoredCredentials ? (
        <Button mode="outlined" onPress={handleClearBiometrics}>
          Remove stored biometric credentials
        </Button>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
  },
  segmented: {
    marginBottom: 24,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    marginBottom: 12,
  },
  metadata: {
    marginTop: 4,
    color: '#555',
  },
  divider: {
    marginVertical: 24,
  },
  button: {
    marginBottom: 12,
  },
});

export default ProfileScreen;
