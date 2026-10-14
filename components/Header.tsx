import { StyleSheet, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { COLORS } from '@/constants/colors';

type HeaderProps = {
  title: string;
  size?: number;
};

export default function Header({ title, size = 84 }: HeaderProps) {
  const radius = size / 2;
  return (
    <View style={styles.container}>
      <View style={[styles.logoCircle, { width: size, height: size, borderRadius: radius }]}>
        <Image
          source={require('@/assets/images/icon.png')}
          style={{ width: size - 8, height: size - 8, borderRadius: radius - 4 }}
          contentFit="cover"
        />
      </View>
      <Text style={styles.title}>{title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  logoCircle: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 3,
    overflow: 'hidden',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    fontFamily: 'SpaceGrotesk_700Bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
  },
});
