import { useId } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { COLORS } from '@/constants/colors';

type AuthButtonProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export default function AuthButton({
  title,
  icon,
  onPress,
  loading,
  disabled,
}: AuthButtonProps) {
  const gradientId = `authBtn${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      <View pointerEvents="none" style={styles.gradientLayer}>
        <Svg width="100%" height="100%">
          <Defs>
            <LinearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor="#7C3AED" />
              <Stop offset="0.5" stopColor={COLORS.primary} />
              <Stop offset="1" stopColor={COLORS.magenta} />
            </LinearGradient>
          </Defs>
          <Rect width="100%" height="100%" rx={14} fill={`url(#${gradientId})`} />
        </Svg>
      </View>
      {loading ? (
        <ActivityIndicator color={COLORS.textOnPrimary} />
      ) : (
        <View style={styles.row}>
          <Ionicons name={icon} size={20} color={COLORS.textOnPrimary} />
          <Text style={styles.label}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 6,
  },
  gradientLayer: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 14,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    zIndex: 1,
  },
  label: {
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '700',
    color: COLORS.textOnPrimary,
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.55,
  },
});
