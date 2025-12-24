// src/presentation/screens/auth/LoginScreen.tsx

import { NativeStackScreenProps } from '@react-navigation/native-stack'; // Import the type
import React, { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { Button, Text, TextInput, Title } from 'react-native-paper';

import { SupabaseClient } from '@/data/data_sources/supabase_client';

// Define the type for your navigation stack's parameters if you have them.
// For now, an empty object is fine.
type RootStackParamList = {}; 

// Use the imported type to correctly type the component props
type Props = NativeStackScreenProps<RootStackParamList>;

export default function LoginScreen({ navigation }: Props) { // Use the Props type here
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await SupabaseClient.signIn({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Login Failed', error.message);
    }
  };

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    const { error } = await SupabaseClient.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);

    if (error) {
      Alert.alert('Sign Up Failed', error.message);
    } else {
      Alert.alert('Success', 'Account created! Please check your email for a confirmation link.');
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>Welcome to StationScout</Title>
      <Text style={styles.subtitle}>Sign in to discover amazing events</Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button 
        mode="contained"
        onPress={handleLogin}
        disabled={loading}
        loading={loading}
        style={styles.button}
      >
        Sign In
      </Button>

      <Button 
        onPress={handleSignUp}
        disabled={loading}
        style={styles.button}
      >
        Create Account
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    marginBottom: 15,
  },
  button: {
    marginTop: 10,
  },
});