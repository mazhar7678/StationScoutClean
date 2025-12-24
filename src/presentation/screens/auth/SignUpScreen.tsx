import { useMutation } from '@tanstack/react-query';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Text, TextInput } from 'react-native-paper';

import { SupabaseClient } from '../../../data/data_sources/supabase_client';

const SignUpScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const signUpMutation = useMutation({
    mutationFn: async () => {
      const { error } = await SupabaseClient.signUp({
        email,
        password,
        options: {
          data: { display_name: displayName },
        },
      });

      if (error) {
        throw error;
      }
    },
    onError: err => {
      setSuccessMessage('');
      setErrorMessage(err instanceof Error ? err.message : 'Sign up failed');
    },
    onSuccess: () => {
      setErrorMessage('');
      setSuccessMessage('Check your inbox to confirm your email.');
      setEmail('');
      setPassword('');
      setDisplayName('');
    },
  });

  const handleSubmit = () => {
    signUpMutation.mutate();
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Create an account
      </Text>
      <TextInput
        label="Display name"
        value={displayName}
        onChangeText={setDisplayName}
        style={styles.input}
      />
      <TextInput
        label="Email"
        value={email}
        autoCapitalize="none"
        keyboardType="email-address"
        onChangeText={setEmail}
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={password}
        secureTextEntry
        onChangeText={setPassword}
        style={styles.input}
      />
      {errorMessage ? (
        <Text style={styles.error} variant="bodySmall">
          {errorMessage}
        </Text>
      ) : null}
      {successMessage ? (
        <Text style={styles.success} variant="bodySmall">
          {successMessage}
        </Text>
      ) : null}
      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={signUpMutation.isPending}
      >
        Sign Up
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  error: {
    color: '#b3261e',
    marginBottom: 12,
  },
  success: {
    color: '#0d6f02',
    marginBottom: 12,
  },
});

export default SignUpScreen;
