import { useEffect, useState } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';

import AppButton from '@/components/AppButton';
import { COLORS } from '@/constants/colors';
import { useAuth } from '@/lib/auth';
import { getProfile, type Role } from '@/lib/profiles';
import { registerAttendance } from '@/lib/attendance';

export default function ScanScreen() {
  const { user } = useAuth();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);
  const [lastData, setLastData] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [profileName, setProfileName] = useState<string | null>(null);
  const [profileRole, setProfileRole] = useState<Role | null>(null);
  const [identityLoading, setIdentityLoading] = useState(true);
  const [manualCode, setManualCode] = useState('');
  const [busy, setBusy] = useState(false);

  const [eventTitle, setEventTitle] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    if (!user) {
      setProfileName(null);
      setProfileRole(null);
      setIdentityLoading(false);
      return;
    }
    setIdentityLoading(true);
    getProfile(user.id).then((profile) => {
      if (!active) return;
      setProfileName(profile?.full_name ?? null);
      setProfileRole(profile?.role ?? null);
      setIdentityLoading(false);
    });
    return () => {
      active = false;
    };
  }, [user]);

  if (!permission) {
    return <View style={styles.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Camera Access Needed</Text>
        <Text style={styles.subtitle}>
          We need camera access to scan attendance QR codes.
        </Text>
        <AppButton
          theme="primary"
          title="Grant Permission"
          icon="camera-outline"
          onPress={requestPermission}
        />
      </View>
    );
  }

  const submitPayload = (data: string) => {
    if (!user) {
      setMessage('Please log in first. Attendance needs an account.');
      setSuccess(false);
      return;
    }
    if (identityLoading) {
      setMessage('Checking your account... please tap Scan Again.');
      setSuccess(false);
      return;
    }
    if (profileRole === 'teacher' || profileRole === 'admin') {
      setMessage(
        'Teachers/admins cannot record attendance. Log in with a student account to scan.'
      );
      setSuccess(false);
      return;
    }
    setBusy(true);
    registerAttendance(data, user.id).then((result) => {
      setBusy(false);
      setMessage(result.message);
      setSuccess(result.success);
      setEventTitle(result.eventTitle ?? null);
      if (result.success) {
        try {
          Vibration.vibrate(80);
        } catch {}
      } else {
        try {
          Vibration.vibrate([0, 60, 60, 60]);
        } catch {}
      }
    });
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);
    setLastData(data);
    setEventTitle(null);
    submitPayload(data);
  };

  const handleManualSubmit = () => {
    if (!manualCode.trim() || busy) return;
    const code = manualCode.trim().toUpperCase();
    setScanned(true);
    setLastData(code);
    setEventTitle(null);
    submitPayload(code);
  };

  const resetScan = () => {
    setScanned(false);
    setMessage(null);
    setLastData(null);
    setEventTitle(null);
  };

  const identityLabel = identityLoading
    ? 'Checking account...'
    : (profileName ?? user?.email ?? 'Not logged in');

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        enableTorch={torch}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      />
      <Pressable
        style={styles.torchBtn}
        onPress={() => setTorch((t) => !t)}
        accessibilityLabel="Toggle flashlight"
      >
        <Ionicons
          name={torch ? 'flashlight' : 'flashlight-outline'}
          size={22}
          color={torch ? '#0B0813' : '#FFFFFF'}
        />
      </Pressable>
      <View style={styles.viewfinderWrap} pointerEvents="none">
        <View style={styles.frame}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBR]} />
          {!scanned ? (
            <View style={styles.scanLine} />
          ) : null}
        </View>
        <Text style={styles.frameHint}>Align QR inside the frame</Text>
      </View>
      <View style={styles.overlay}>
        <View style={styles.identityBar}>
          <View style={styles.identityAvatar}>
            <Text style={styles.identityAvatarText}>
              {(profileName ?? user?.email ?? '?').trim().slice(0, 1).toUpperCase()}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.identityLabel}>Scanning as</Text>
            <Text style={styles.identityName} numberOfLines={1}>
              {identityLabel}
            </Text>
          </View>
        </View>
        {message ? (
          <View style={[styles.card, success ? styles.cardOk : styles.cardFail]}>
            <View style={[styles.iconCircle, success ? styles.iconOk : styles.iconFail]}>
              <Ionicons
                name={success ? 'checkmark' : 'alert'}
                size={34}
                color="#fff"
              />
            </View>
            <Text style={styles.resultTitle}>{success ? 'Attendance recorded!' : 'Scan failed'}</Text>
            {eventTitle ? (
              <Text style={styles.eventTitle} numberOfLines={2}>{eventTitle}</Text>
            ) : null}
            <Text style={[styles.message, success ? styles.ok : styles.fail]}>
              {message}
            </Text>
            <AppButton
              theme="primary"
              title="Scan Again"
              icon="refresh-outline"
              onPress={resetScan}
            />
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.hint}>
              Point the camera at an event QR code
            </Text>
            <View style={styles.manualRow}>
              <TextInput
                style={styles.manualInput}
                value={manualCode}
                onChangeText={setManualCode}
                placeholder="Or type event code (EVT-...)"
                placeholderTextColor={COLORS.muted}
                autoCapitalize="characters"
                editable={!busy}
                onSubmitEditing={handleManualSubmit}
              />
              <Pressable
                style={[styles.goBtn, (!manualCode.trim() || busy) && styles.goBtnDisabled]}
                onPress={handleManualSubmit}
                disabled={!manualCode.trim() || busy}
              >
                <Text style={styles.goText}>{busy ? '...' : 'Go'}</Text>
              </Pressable>
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingHorizontal: 24,
    justifyContent: 'center',
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginBottom: 16,
  },
  camera: {
    flex: 1,
  },
  torchBtn: {
    position: 'absolute',
    top: 56,
    right: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff33',
    borderWidth: 1,
    borderColor: '#ffffff55',
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    gap: 10,
  },
  identityBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.card,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  identityAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  identityAvatarText: { fontSize: 16, fontWeight: '800', color: '#0B0813' },
  identityLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  identityName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 16,
    gap: 10,
  },
  cardOk: { borderColor: '#34D39988' },
  cardFail: { borderColor: '#F8717188' },
  iconCircle: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  iconOk: { backgroundColor: COLORS.success },
  iconFail: { backgroundColor: COLORS.danger },
  resultTitle: { fontSize: 18, fontWeight: '800', color: COLORS.textPrimary, textAlign: 'center' },
  eventTitle: { fontSize: 15, fontWeight: '700', color: COLORS.accent, textAlign: 'center' },
  hint: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  viewfinderWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  frame: { width: 250, height: 250, position: 'relative' },
  corner: { position: 'absolute', width: 44, height: 44, borderColor: '#fff', borderRadius: 4 },
  cornerTL: { top: 0, left: 0, borderTopWidth: 5, borderLeftWidth: 5, borderTopLeftRadius: 16 },
  cornerTR: { top: 0, right: 0, borderTopWidth: 5, borderRightWidth: 5, borderTopRightRadius: 16 },
  cornerBL: { bottom: 0, left: 0, borderBottomWidth: 5, borderLeftWidth: 5, borderBottomLeftRadius: 16 },
  cornerBR: { bottom: 0, right: 0, borderBottomWidth: 5, borderRightWidth: 5, borderBottomRightRadius: 16 },
  scanLine: { position: 'absolute', left: 12, right: 12, top: '50%', height: 2, backgroundColor: COLORS.accent, opacity: 0.9 },
  frameHint: { marginTop: 14, color: '#FFFFFFCC', fontSize: 13, fontWeight: '600' },
  manualRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
  },
  manualInput: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: COLORS.textPrimary,
    fontSize: 14,
  },
  goBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  goBtnDisabled: {
    opacity: 0.5,
  },
  goText: {
    color: COLORS.textOnPrimary,
    fontWeight: '700',
  },
  message: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
  ok: {
    color: COLORS.success,
  },
  fail: {
    color: COLORS.danger,
  },
  raw: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
});
