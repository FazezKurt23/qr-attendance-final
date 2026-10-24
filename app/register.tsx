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
import { signUp } from '@/lib/auth';
import { supabaseConfigError } from '@/lib/supabase';

type FocusedField = 'fullName' | 'email' | 'password' | 'confirm' | null;

export default function RegisterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [focused, setFocused] = useState<FocusedField>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    setError(null);

    if (supabaseConfigError) {
      setError(supabaseConfigError);
      return;
    }

    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setError('All fields are required.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    try {
      const { data, error: authError } = await signUp(email.trim(), password, {
        full_name: fullName.trim(),
        role,
      });

      if (authError) {
        setError(authError.message);
      } else if (data.session) {
        router.replace('/(tabs)');
      } else {
        setSuccess(true);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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
              <Text style={styles.title}>Create account</Text>
              <Text style={styles.subtitle}>
                Register to start recording attendance
              </Text>

              {success ? (
                <View style={styles.successContainer}>
                  <Text style={styles.successTitle}>Check your email!</Text>
                  <Text style={styles.successText}>
                    We sent a confirmation link to {email}. Click the link to
                    verify your account, then come back and sign in.
                  </Text>
                  <Link href="/login" style={styles.footerLink}>
                    Back to Sign In
                  </Link>
                </View>
              ) : (
                <>
                  <Text style={styles.label}>Full Name</Text>
                  <TextInput
                    style={[
                      styles.input,
                      focused === 'fullName' && styles.inputFocused,
                    ]}
                    value={fullName}
                    onChangeText={setFullName}
                    onFocus={() => setFocused('fullName')}
                    onBlur={() => setFocused(null)}
                    placeholder="Juan Dela Cruz"
                    placeholderTextColor={COLORS.muted}
                    editable={!loading}
                  />

                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={[
                      styles.input,
                      focused === 'email' && styles.inputFocused,
                    ]}
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
                      placeholder="At least 6 characters"
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

                  <Text style={styles.label}>Confirm Password</Text>
                  <View
                    style={[
                      styles.passwordWrap,
                      focused === 'confirm' && styles.inputFocused,
                    ]}
                  >
                    <TextInput
                      style={styles.passwordInput}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      onFocus={() => setFocused('confirm')}
                      onBlur={() => setFocused(null)}
                      placeholder="Re-enter your password"
                      placeholderTextColor={COLORS.muted}
                      secureTextEntry={!showConfirm}
                      editable={!loading}
                    />
                    <Pressable
                      onPress={() => setShowConfirm((v) => !v)}
                      hitSlop={10}
                      accessibilityLabel={
                        showConfirm ? 'Hide password' : 'Show password'
                      }
                    >
                      <Ionicons
                        name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={COLORS.muted}
                      />
                    </Pressable>
                  </View>

                  <Text style={styles.label}>I am a...</Text>
                  <View style={styles.roleRow}>
                    <Pressable
                      style={[
                        styles.roleChip,
                        role === 'student' && styles.roleChipActive,
                      ]}
                      onPress={() => setRole('student')}
                    >
                      <Text
                        style={[
                          styles.roleChipText,
                          role === 'student' && styles.roleChipTextActive,
                        ]}
                      >
                        Student
                      </Text>
                    </Pressable>
                    <Pressable
                      style={[
                        styles.roleChip,
                        role === 'teacher' && styles.roleChipActive,
                      ]}
                      onPress={() => setRole('teacher')}
                    >
                      <Text
                        style={[
                          styles.roleChipText,
                          role === 'teacher' && styles.roleChipTextActive,
                        ]}
                      >
                        Teacher
                      </Text>
                    </Pressable>
                  </View>

                  {error && <Text style={styles.error}>{error}</Text>}

                  <View style={styles.buttonWrap}>
                    <AuthButton
                      title="Sign Up"
                      icon="person-add-outline"
                      onPress={handleRegister}
                      loading={loading}
                    />
                  </View>
                </>
              )}
            </View>

            {!success && (
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Already have an account?{' '}
                </Text>
                <Link href="/login" style={styles.footerLink}>
                  Sign In
                </Link>
              </View>
            )}
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
  roleRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 2,
  },
  roleChip: {
    flex: 1,
    backgroundColor: '#0E0B1A',
    borderRadius: 13,
    borderWidth: 1,
    borderColor: '#2B2344',
    paddingVertical: 13,
    alignItems: 'center',
  },
  roleChipActive: {
    borderColor: COLORS.primary,
    backgroundColor: '#8B5CF622',
  },
  roleChipText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  roleChipTextActive: {
    fontWeight: '700',
    color: COLORS.textPrimary,
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
  successContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 18,
    backgroundColor: '#0E0B1A',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#8B5CF655',
  },
  successTitle: {
    fontSize: 18,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  successText: {
    fontSize: 14,
    lineHeight: 20,
    fontFamily: 'Inter_400Regular',
    color: COLORS.textSecondary,
    marginBottom: 16,
    textAlign: 'center',
  },
});
