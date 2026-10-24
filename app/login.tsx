import { useState } from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Pressable,
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppBackground from '@/components/AppBackground';
import AuthBrand from '@/components/AuthBrand';
import AuthButton from '@/components/AuthButton';
import { COLORS } from '@/constants/colors';
import { signIn } from '@/lib/auth';
import { supabaseConfigError } from '@/lib/supabase';

type FocusedField = 'email' | 'password' | null;

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState<FocusedField>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    if (supabaseConfigError) {
      setError(supabaseConfigError);
      return;
    }
    setLoading(true);

    try {
      const { error: authError } = await signIn(email.trim(), password);

      if (authError) {
        setError(authError.message);
      } else {
        router.replace('/(tabs)');
      }
    } catch (err: any) {
      setError(err?.message || 'Unexpected error');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    setError(null);
    setNotice(
      'Password reset is not set up yet. Please contact your teacher or administrator.'
    );
  };

  return (
    <View style={styles.container}>
      <AppBackground />
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              {
                paddingTop: insets.top + 28,
                paddingBottom: insets.bottom + 28,
              },
            ]}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <AuthBrand />

            <View style={styles.card}>
              <Text style={styles.title}>Welcome back</Text>
              <Text style={styles.subtitle}>
                Sign in to record your attendance
              </Text>

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, focused === 'email' && styles.inputFocused]}
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                placeholder="you@school.edu"
                placeholderTextColor={COLORS.muted}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
              />

              <Text style={styles.label}>Password</Text>
              <View
                style={[
                  styles.passwordWrap,
                  focused === 'password' && styles.inputFocused,
                ]}
              >
                <TextInput
                  style={styles.passwordInput}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocused('password')}
                  onBlur={() => setFocused(null)}
                  placeholder="Enter your password"
                  placeholderTextColor={COLORS.muted}
                  secureTextEntry={!showPassword}
                  editable={!loading}
                />
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={10}
                  accessibilityLabel={
                    showPassword ? 'Hide password' : 'Show password'
                  }
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={COLORS.muted}
                  />
                </Pressable>
              </View>

              <Pressable
                style={styles.forgotButton}
                onPress={handleForgotPassword}
                hitSlop={6}
              >
                <Text style={styles.forgotText}>Forgot password?</Text>
              </Pressable>

              {notice && <Text style={styles.notice}>{notice}</Text>}
              {error && <Text style={styles.error}>{error}</Text>}

              <View style={styles.buttonWrap}>
                <AuthButton
                  title="Sign In"
                  icon="log-in-outline"
                  onPress={handleLogin}
                  loading={loading}
                />
              </View>
            </View>

            <View style={styles.footer}>
              <Text style={styles.footerText}>
                Don&apos;t have an account?{' '}
              </Text>
              <Link href="/register" style={styles.footerLink}>
                Sign Up
              </Link>
            </View>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    width: '100%',
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    marginTop: 28,
    padding: 22,
    borderRadius: 26,
    backgroundColor: 'rgba(19, 14, 32, 0.9)',
    borderWidth: 1,
    borderColor: '#FFFFFF14',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.45,
    shadowRadius: 30,
    elevation: 10,
  },
  title: {
    fontSize: 27,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 6,
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  label: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    color: '#E5E7F0',
  },
  input: {
    backgroundColor: '#0E0B1A',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#2B2344',
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: COLORS.textPrimary,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    backgroundColor: '#130D26',
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0E0B1A',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#2B2344',
    paddingLeft: 14,
    paddingRight: 14,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
    color: COLORS.textPrimary,
  },
  forgotButton: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  forgotText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    color: COLORS.accent,
  },
  notice: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
    color: COLORS.textSecondary,
  },
  error: {
    marginTop: 12,
    fontSize: 13,
    lineHeight: 18,
    fontFamily: 'Inter_400Regular',
    color: COLORS.danger,
  },
  buttonWrap: {
    marginTop: 22,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 26,
    marginBottom: 12,
  },
  footerText: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    color: COLORS.textSecondary,
  },
  footerLink: {
    fontSize: 14,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '700',
    color: COLORS.accent,
  },
});
