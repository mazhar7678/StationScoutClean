import React, { useState, useCallback } from 'react';
import { 
  Alert, 
  StyleSheet, 
  View, 
  Platform, 
  Pressable,
  Text as RNText,
  TextInput as RNTextInput,
} from 'react-native';

import { SupabaseClient } from '../../../data/data_sources/supabase_client';

const colors = {
  primary: '#1E3A5F',
  primaryLight: '#2C5282',
  accent: '#F97316',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#1E293B',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  border: '#E2E8F0',
};

type Props = {
  navigation?: any;
};

export default function LoginScreen({ navigation }: Props) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    
    try {
      const result = await SupabaseClient.signIn({
        email: email.trim(),
        password,
      });
      
      setLoading(false);
      
      // Show exactly what we got back for debugging
      if (result.error) {
        Alert.alert('Login Failed', result.error.message || 'Unknown error');
        return;
      }
      
      if (result.data?.session) {
        // Navigation happens automatically via AppNavigator's auth state listener
        // No need to navigate manually - just show success
        Alert.alert('Success', 'Logged in! App will navigate automatically.');
        return;
      }
      
      // Show the raw result for debugging
      Alert.alert('Unexpected Response', JSON.stringify(result).substring(0, 200));
    } catch (e: any) {
      setLoading(false);
      const errMsg = e?.message || String(e);
      Alert.alert('Login Error', errMsg.substring(0, 200));
    }
  };

  const handleSignUp = async () => {
    console.log('[SignUp] Button pressed');
    
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
      <View style={styles.header}>
        <RNText style={styles.appName}>StationScout</RNText>
        <RNText style={styles.tagline}>Discover events along your journey</RNText>
      </View>

      <View style={styles.formContainer}>
        <RNText style={styles.welcomeText}>Welcome back</RNText>
        
        <RNTextInput
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
          placeholderTextColor={colors.textMuted}
        />

        <RNTextInput
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          style={styles.input}
          placeholderTextColor={colors.textMuted}
        />

        <Pressable
          onPress={handleLogin}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && { opacity: 0.7 }
          ]}
          android_ripple={{ color: 'rgba(255,255,255,0.3)' }}
        >
          <RNText style={styles.primaryButtonText}>
            {loading ? 'Signing In...' : 'Sign In'}
          </RNText>
        </Pressable>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <RNText style={styles.dividerText}>or</RNText>
          <View style={styles.dividerLine} />
        </View>

        <Pressable
          onPress={handleSignUp}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && { opacity: 0.7 }
          ]}
          android_ripple={{ color: 'rgba(30,58,95,0.1)' }}
        >
          <RNText style={styles.secondaryButtonText}>Create New Account</RNText>
        </Pressable>
      </View>

      <View style={styles.footer}>
        <RNText style={styles.footerText}>
          By signing in, you agree to our Terms of Service
        </RNText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.primary,
    paddingTop: Platform.OS === 'ios' ? 60 : 50,
    paddingBottom: 40,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
  formContainer: {
    flex: 1,
    padding: 24,
    paddingTop: 32,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    fontSize: 16,
    color: colors.text,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    marginTop: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  dividerText: {
    paddingHorizontal: 16,
    color: colors.textMuted,
    fontSize: 14,
  },
  secondaryButton: {
    borderRadius: 12,
    borderColor: colors.border,
    borderWidth: 1,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
    backgroundColor: 'transparent',
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    padding: 24,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
