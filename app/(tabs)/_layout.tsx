import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AppBackground from '@/components/AppBackground';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/lib/auth';
import { getProfile, type Role } from '@/lib/profiles';

function ScanFab({ onPress }: { onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.fabWrap}>
      <View style={styles.fab}>
        <Ionicons name="qr-code-outline" size={28} color="#fff" />
      </View>
    </Pressable>
  );
}

export default function TabLayout() {
  const { user } = useAuth();
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    let active = true;
    if (!user) {
      setRole(null);
      return;
    }
    getProfile(user.id).then((profile) => {
      if (active) setRole(profile?.role ?? 'student');
    });
    return () => {
      active = false;
    };
  }, [user]);

  const canManage = role === 'teacher' || role === 'admin';
  const isAdmin = role === 'admin';
  const scanHidden = role !== null && role !== 'student';

  return (
    <View style={styles.root}>
      <AppBackground />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: COLORS.accent,
          tabBarInactiveTintColor: COLORS.muted,
          sceneStyle: { backgroundColor: 'transparent' },
          headerShadowVisible: false,
          tabBarStyle: {
            backgroundColor: 'rgba(14, 10, 26, 0.96)',
            borderTopColor: COLORS.border,
            borderTopWidth: 1,
            height: 62,
            paddingBottom: 8,
            paddingTop: 6,
          },
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
          headerStyle: {
            backgroundColor: 'transparent',
          },
          headerTintColor: COLORS.textPrimary,
          headerTitleStyle: {
            fontWeight: '700',
            fontFamily: 'SpaceGrotesk_700Bold',
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="scan"
          options={{
            title: 'Scan',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="qr-code-outline" size={size} color={color} />
            ),
            tabBarButton: (props: any) => {
              if (scanHidden) return null;
              return <ScanFab onPress={props.onPress} />;
            },
            // Tangtangon ang slot mismo para walay dakong bakante sa teacher/admin.
            tabBarItemStyle: scanHidden ? { display: 'none' } : undefined,
            tabBarLabel: () => null,
          }}
        />
        <Tabs.Screen
          name="history"
          options={{
            title: 'History',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="time-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="teacher"
          options={{
            title: 'Events',
            href: canManage || role === null ? undefined : null,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="clipboard-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="admin"
          options={{
            title: 'Admin',
            // Admins only.
            href: isAdmin || role === null ? undefined : null,
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="shield-checkmark-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  fabWrap: { top: -22, alignItems: 'center', justifyContent: 'center' },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#0E0A1A',
  },
});
