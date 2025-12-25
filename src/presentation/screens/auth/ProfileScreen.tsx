import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Divider,
  SegmentedButtons,
  Text,
} from 'react-native-paper';

import { SupabaseClient, AuthUser } from '../../../data/data_sources/supabase_client';

import LoginScreen from './LoginScreen';
import SignUpScreen from './SignUpScreen';

const ProfileScreen = () => {
  const [session, setSession] = useState<AuthUser | null>(null);
  const [mode, setMode] = useState<'login' | 'signup'>('login');

  useEffect(() => {
    let isMounted = true;

    SupabaseClient.getSession().then(({ session }) => {
      if (isMounted) {
        setSession(session);
      }
    });

    const { unsubscribe } = SupabaseClient.onAuthStateChange((user) => {
      if (isMounted) {
        setSession(user);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await SupabaseClient.signOut();
    setSession(null);
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
      </ScrollView>
    );
  }

  const email = session.email ?? 'Unknown user';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.profileHeader}>
        <Avatar.Text
          size={72}
          label={email.charAt(0).toUpperCase()}
          style={styles.avatar}
        />
        <Text variant="titleLarge">{email}</Text>
      </View>
      <Divider style={styles.divider} />
      <Button mode="contained" onPress={handleLogout} style={styles.button}>
        Sign out
      </Button>
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
