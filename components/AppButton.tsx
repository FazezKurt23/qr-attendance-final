import { useId } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';
import { COLORS } from '@/constants/colors';

type AppButtonProps = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  theme?: 'primary';
  onPress: () => void;
  disabled?: boolean;
};

export default function AppButton({
  title,
  icon,
  theme,
  onPress,
  disabled,
}: AppButtonProps) {
  const isPrimary = theme === 'primary';
  const gradientId = `appBtn${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.buttonInner,
        isPrimary ? styles.primaryFill : styles.secondaryFill,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      {isPrimary ? (
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
      ) : null}
      <View style={styles.row}>
        <Ionicons
          name={icon}
          size={20}
          color={isPrimary ? COLORS.textOnPrimary : COLORS.textPrimary}
        />
        <Text style={[styles.label, isPrimary && styles.labelPrimary]}>
          {title}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  buttonInner: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  primaryFill: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 6,
  },
  secondaryFill: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  labelPrimary: {
    fontWeight: '700',
    color: COLORS.textOnPrimary,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
