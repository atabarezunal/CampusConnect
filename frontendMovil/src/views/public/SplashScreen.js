import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { BookOpen } from 'lucide-react-native';
import { AppText, Screen } from '../../components/ui';
import { colors, radius, spacing } from '../../theme/tokens';

export function SplashScreen({ navigation }) {
  useEffect(() => {
    const timer = setTimeout(() => navigation.replace('Login'), 1100);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <Screen scroll={false} contentStyle={styles.container}>
      <View style={styles.logo}>
        <BookOpen size={48} color={colors.inverseText} strokeWidth={2.2} />
      </View>
      <AppText variant="hero" style={styles.title}>
        CampusConnect
      </AppText>
      <AppText color={colors.secondary}>Conecta. Colabora. Aprende.</AppText>
      <View style={styles.dots}>
        <View style={[styles.dot, styles.activeDot]} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
      <AppText variant="caption" color={colors.muted} style={styles.version}>
        v1.0.0
      </AppText>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing['2xl'],
  },
  logo: {
    width: 88,
    height: 88,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  title: {
    marginBottom: spacing.sm,
  },
  dots: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing['2xl'],
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
    backgroundColor: colors.border,
  },
  activeDot: {
    backgroundColor: colors.muted,
  },
  version: {
    position: 'absolute',
    bottom: spacing['2xl'],
  },
});
