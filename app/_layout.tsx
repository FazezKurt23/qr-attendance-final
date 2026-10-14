import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  useFonts,
  SpaceGrotesk_700Bold,
  SpaceGrotesk_500Medium,
} from '@expo-google-fonts/space-grotesk';
import { Inter_400Regular, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/lib/auth';

export const FONTS = {
  display: 'SpaceGrotesk_700Bold',
  medium: 'SpaceGrotesk_500Medium',
  body: 'Inter_400Regular',
  semibold: 'Inter_600SemiBold',
} as const;

export default function RootLayout() {
  const { session, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const [fontsLoaded] = useFonts({
    SpaceGrotesk_700Bold,
    SpaceGrotesk_500Medium,
    Inter_400Regular,
    Inter_600SemiBold,
  });

  useEffect(() => {
    if (loading) return;

    const path = segments?.[0];
    const inAuthGroup = path === 'login' || path === 'register';
    const inTabsGroup = path === '(tabs)';

    if (!session && inTabsGroup) {
      router.replace('/login');
    } else if (session && inAuthGroup) {
      router.replace('/(tabs)');
    } else if (!segments?.length && !session) {
      // Fresh open with no route — go straight to login, never tabs
      router.replace('/login');
    }
  }, [session, loading, segments]);

  if (loading || !fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }} initialRouteName="login">
      <Stack.Screen name="index" />
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
