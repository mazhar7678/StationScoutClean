import React, { useState } from 'react';
import { 
  Alert, 
  StyleSheet, 
  View, 
  Platform, 
  Pressable,
  Text as RNText,
  TextInput as RNTextInput,
} from 'react-native';

import { signInWithPassword, signUp } from '../../../data/data_sources/supabase_client';

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
    console.log('[LoginScreen] handleLogin called');
    
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    console.log('[LoginScreen] Calling signInWithPassword...');
    
    try {
      const { session, error } = await signInWithPassword(email.trim(), password);
      
      console.log('[LoginScreen] signInWithPassword returned:', { hasSession: !!session, error });
      setLoading(false);
      
      if (error) {
        Alert.alert('Login Failed', error);
        return;
      }
      
      if (session) {
        console.log('[LoginScreen] Login successful, navigation should happen automatically');
      } else {
        Alert.alert('Login Issue', 'No session was created. Please try again.');
      }
    } catch (e: any) {
      setLoading(false);
      console.log('[LoginScreen] Exception:', e?.message);
      Alert.alert('Login Error', e?.message || 'Unknown error');
    }
  };

  const handleSignUp = async () => {
    console.log('[LoginScreen] handleSignUp called');
    
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    console.log('[LoginScreen] Calling signUp...');
    
    try {
      const { error } = await signUp(email.trim(), password);
      
      console.log('[LoginScreen] signUp returned:', { error });
      setLoading(false);
      
      if (error) {
        Alert.alert('Sign Up Failed', error);
      } else {
        Alert.alert('Success', 'Account created! Please check your email for a confirmation link.');
      }
    } catch (e: any) {
      setLoading(false);
      console.log('[LoginScreen] Exception:', e?.message);
      Alert.alert('Sign Up Error', e?.message || 'Unknown error');
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
          disabled={loading}
          style={({ pressed }) => [
            styles.primaryButton,
            pressed && { opacity: 0.7 },
            loading && { opacity: 0.5 }
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
          disabled={loading}
          style={({ pressed }) => [
            styles.secondaryButton,
            pressed && { opacity: 0.7 },
            loading && { opacity: 0.5 }
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
