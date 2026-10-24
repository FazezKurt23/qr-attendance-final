import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';

import AppButton from '@/components/AppButton';
import { COLORS } from '@/constants/colors';
import { useAuth, signOut } from '@/lib/auth';
import { getProfile, updateProfile, type Profile } from '@/lib/profiles';

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [draftName, setDraftName] = useState('');
  const [draftStudentId, setDraftStudentId] = useState('');
  const [draftCourse, setDraftCourse] = useState('');
  const [draftYearSection, setDraftYearSection] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    const p = await getProfile(user.id);
    setProfile(p);
    setDraftName(p?.full_name ?? '');
    setDraftStudentId(p?.student_id ?? '');
    setDraftCourse(p?.course ?? '');
    setDraftYearSection(p?.year_section ?? '');
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );

  const handleSaveName = async () => {
    if (!user) return;
    setSaving(true);
    const isStudent = profile?.role === 'student';
    const { error } = await updateProfile(user.id, {
      full_name: draftName.trim(),
      // Student-only fields: dili apilon kung teacher/admin.
      ...(isStudent
        ? {
            student_id: draftStudentId.trim() || null,
            course: draftCourse.trim() || null,
            year_section: draftYearSection.trim() || null,
          }
        : {}),
    });
    setSaving(false);
    if (error) {
      Alert.alert('Error', error);
    } else {
      // Re-read from the cloud so the screen always shows the saved value,
      // even for accounts whose profile row did not exist before.
      await loadProfile();
      setEditing(false);
    }
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      router.replace('/login');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to sign out.');
    } finally {
      setSigningOut(false);
    }
  };

  const initials = (() => {
    const name = (profile?.full_name ?? '').trim();
    if (name) {
      const parts = name.split(/\s+/);
      if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    const email = (user?.email ?? profile?.email ?? '').trim();
    if (email) return email.slice(0, 2).toUpperCase();
    return '?';
  })();

  const avatarColors =
    profile?.role === 'admin'
      ? { bg: COLORS.warning, shadow: '#FBBF24', text: '#0B0813' }
      : profile?.role === 'teacher'
        ? { bg: COLORS.primary, shadow: '#8B5CF6', text: '#FFFFFF' }
        : { bg: COLORS.accent, shadow: '#06B6D4', text: '#0B0813' };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Profile</Text>

      <View style={styles.avatarSection}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: avatarColors.bg, shadowColor: avatarColors.shadow },
          ]}
        >
          <Text style={[styles.avatarText, { color: avatarColors.text }]}>
            {initials}
          </Text>
        </View>
        <Text style={styles.avatarName} numberOfLines={1}>
          {profile?.full_name || user?.email?.split('@')[0] || 'Set up your profile'}
        </Text>
        <Text style={styles.avatarEmail} numberOfLines={1}>
          {user?.email ?? profile?.email ?? ''}
        </Text>
      </View>
      {profile?.role === 'teacher' ? (
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>Teacher</Text>
        </View>
      ) : profile?.role === 'admin' ? (
        <View style={[styles.roleBadge, styles.roleBadgeAdmin]}>
          <Text style={styles.roleBadgeText}>Admin</Text>
        </View>
      ) : (
        <View style={[styles.roleBadge, styles.roleBadgeStudent]}>
          <Text style={styles.roleBadgeTextDark}>Student</Text>
        </View>
      )}

      <View style={styles.infoCard}>
        <Text style={styles.label}>Name</Text>
        {editing ? (
          <View style={{ gap: 10 }}>
            <View>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={styles.nameInput}
                value={draftName}
                onChangeText={setDraftName}
                placeholder="Your name"
                placeholderTextColor="#9AA0B4"
                selectionColor={COLORS.accent}
                editable={!saving}
              />
            </View>
            {profile?.role === 'student' && (
              <>
                <View>
                  <Text style={styles.label}>Student ID</Text>
                  <TextInput
                    style={styles.nameInput}
                    value={draftStudentId}
                    onChangeText={setDraftStudentId}
                    placeholder="Student ID (e.g. 2021-00001)"
                    placeholderTextColor="#9AA0B4"
                    selectionColor={COLORS.accent}
                    editable={!saving}
                  />
                </View>
                <View>
                  <Text style={styles.label}>Course</Text>
                  <TextInput
                    style={styles.nameInput}
                    value={draftCourse}
                    onChangeText={setDraftCourse}
                    placeholder="Course (e.g. BSIT)"
                    placeholderTextColor="#9AA0B4"
                    selectionColor={COLORS.accent}
                    editable={!saving}
                  />
                </View>
                <View>
                  <Text style={styles.label}>Year & Section</Text>
                  <TextInput
                    style={styles.nameInput}
                    value={draftYearSection}
                    onChangeText={setDraftYearSection}
                    placeholder="Year & Section (e.g. 3-A)"
                    placeholderTextColor="#9AA0B4"
                    selectionColor={COLORS.accent}
                    editable={!saving}
                  />
                </View>
              </>
            )}
            <View style={styles.nameEditRow}>
              <Pressable
                style={[styles.saveButton, { backgroundColor: 'transparent' }]}
                onPress={() => setEditing(false)}
                disabled={saving}
              >
                <Text style={[styles.saveText, { color: COLORS.textSecondary }]}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.saveButton}
                onPress={handleSaveName}
                disabled={saving}
              >
                <Text style={styles.saveText}>
                  {saving ? 'Saving...' : 'Save'}
                </Text>
              </Pressable>
            </View>
          </View>
        ) : (
          <Pressable onPress={() => setEditing(true)} style={styles.nameRow}>
            <Text style={styles.value}>
              {profile?.full_name || 'Tap to add your name'}
            </Text>
            <Text style={styles.editHint}>Edit</Text>
          </Pressable>
        )}
        {!editing && profile?.role === 'student' && (
          <>
            <Text style={styles.label}>Student ID</Text>
            <Text style={styles.value}>{profile?.student_id || '—'}</Text>
            <Text style={styles.label}>Course</Text>
            <Text style={styles.value}>{profile?.course || '—'}</Text>
            <Text style={styles.label}>Year & Section</Text>
            <Text style={styles.value}>{profile?.year_section || '—'}</Text>
          </>
        )}

        <Text style={styles.label}>Email</Text>
        <Text style={styles.value}>{user?.email ?? profile?.email}</Text>

        <Text style={styles.label}>User ID</Text>
        <Text style={styles.valueSmall}>{user?.id}</Text>
      </View>

      {saving && (
        <ActivityIndicator color={COLORS.primary} style={{ marginBottom: 8 }} />
      )}

      <AppButton
        title="Sign Out"
        icon="log-out-outline"
        onPress={handleSignOut}
        disabled={signingOut}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 16,
    gap: 4,
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF22',
    marginBottom: 8,
  },
  avatarText: {
    fontSize: 30,
    fontWeight: '800',
  },
  avatarName: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'SpaceGrotesk_700Bold',
    color: COLORS.textPrimary,
  },
  avatarEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  roleBadge: {
    alignSelf: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginBottom: 16,
  },
  roleBadgeStudent: {
    backgroundColor: COLORS.accent,
    shadowColor: '#06B6D4',
  },
  roleBadgeAdmin: {
    backgroundColor: COLORS.warning,
    shadowColor: '#FBBF24',
  },
  roleBadgeText: {
    color: COLORS.textOnPrimary,
    fontWeight: '700',
    fontSize: 13,
  },
  roleBadgeTextDark: {
    color: '#0B0813',
    fontWeight: '700',
    fontSize: 13,
  },
  infoCard: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    marginBottom: 24,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
    marginTop: 8,
  },
  value: {
    fontSize: 15,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  valueSmall: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  editHint: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.accent,
  },
  nameEditRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  nameInput: {
    width: '100%',
    backgroundColor: '#221A38',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: '#FFFFFF',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  saveText: {
    color: COLORS.textOnPrimary,
    fontWeight: '700',
    fontSize: 14,
  },
});
