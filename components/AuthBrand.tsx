import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, LinearGradient, Rect, Stop } from 'react-native-svg';

import { COLORS } from '@/constants/colors';

export default function AuthBrand() {
  return (
    <View style={styles.container}>
      <View style={styles.logoGlow} />
      <View style={styles.logo}>
        <Svg width={80} height={80} style={StyleSheet.absoluteFill}>
          <Defs>
            <LinearGradient id="authLogoGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0" stopColor={COLORS.primary} />
              <Stop offset="1" stopColor={COLORS.accent} />
            </LinearGradient>
          </Defs>
          <Rect
            x={0.75}
            y={0.75}
            width={78.5}
            height={78.5}
            rx={21}
            fill="#0D091B"
            stroke="url(#authLogoGrad)"
            strokeWidth={1.5}
          />
        </Svg>
        <Ionicons name="qr-code" size={40} color={COLORS.accent} />
      </View>
      <Text style={styles.brand}>QR ATTENDANCE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoGlow: {
    position: 'absolute',
    top: -6,
    width: 112,
    height: 112,
    borderRadius: 56,
    backgroundColor: '#8B5CF626',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 24,
    elevation: 8,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    marginTop: 14,
    fontSize: 12,
    letterSpacing: 4,
    fontFamily: 'Inter_600SemiBold',
    fontWeight: '700',
    color: COLORS.accent,
    textTransform: 'uppercase',
  },
});
