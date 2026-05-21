import React, { useCallback } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Bell, Camera, ChevronRight, GraduationCap, LogOut, Settings } from 'lucide-react-native';
import {
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  IconButton,
  Screen,
} from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useServiceData } from '../../hooks/useServiceData';
import { userService } from '../../services/userService';
import { colors, radius, spacing } from '../../theme/tokens';

export function ProfileScreen() {
  const { user, accessToken, signOut } = useAuth();
  const loadProfile = useCallback(
    (token) => (user?.id ? userService.getProfile(user.id, token) : []),
    [user?.id]
  );
  const { data, error } = useServiceData(loadProfile, [user?.id]);
  const profile = data[0];

  return (
    <Screen>
      <View style={styles.settingsRow}>
        <View />
        <IconButton icon={Settings} accessibilityLabel="Configuracion" />
      </View>

      <View style={styles.profileHead}>
        <View style={styles.avatar}>
          <AppText variant="title">{getInitials(user?.name)}</AppText>
          <View style={styles.cameraBadge}>
            <Camera size={14} color={colors.inverseText} />
          </View>
        </View>
        <AppText variant="title" style={styles.center}>
          {user?.name || 'Campus Connect'}
        </AppText>
        <AppText variant="caption" color={colors.secondary} style={styles.center}>
          {user?.email || 'estudiante@universidad.edu'}
        </AppText>
      </View>

      <View style={styles.stats}>
        <Stat value="5" label="Grupos" />
        <Stat value="8" label="Proyectos" />
        <Stat value="24" label="Recursos" />
      </View>

      <ErrorBanner message={error} />

      {profile ? (
        <Card style={styles.profileCard}>
          <GraduationCap size={20} color={colors.primary} />
          <View style={styles.profileCopy}>
            <AppText variant="section">Carrera</AppText>
            <AppText variant="caption" color={colors.secondary}>
              {profile.career} - Semestre {profile.semester}
            </AppText>
          </View>
          <ChevronRight size={18} color={colors.muted} />
        </Card>
      ) : (
        <EmptyState title="Perfil academico" body="Completa tu carrera y semestre al registrarte." />
      )}

      <AppText variant="section" style={styles.section}>
        Preferencias
      </AppText>
      <Preference icon={Bell} title="Notificaciones" />
      <Preference icon={Settings} title="Privacidad" />

      <View style={styles.logout}>
        <Button title="Cerrar Sesion" icon={LogOut} variant="secondary" onPress={signOut} />
      </View>
    </Screen>
  );
}

function Stat({ value, label }) {
  return (
    <View style={styles.stat}>
      <AppText variant="title">{value}</AppText>
      <AppText variant="caption" color={colors.secondary}>
        {label}
      </AppText>
    </View>
  );
}

function Preference({ icon: Icon, title }) {
  return (
    <Pressable>
      <Card style={styles.preference}>
        <View style={styles.preferenceIcon}>
          <Icon size={18} color={colors.primary} />
        </View>
        <AppText variant="section" style={styles.preferenceTitle}>
          {title}
        </AppText>
        <ChevronRight size={18} color={colors.muted} />
      </Card>
    </Pressable>
  );
}

function getInitials(name = 'Campus Connect') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

const styles = StyleSheet.create({
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  profileHead: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  cameraBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  center: {
    textAlign: 'center',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['2xl'],
    marginBottom: spacing.xl,
  },
  stat: {
    alignItems: 'center',
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  profileCopy: {
    flex: 1,
    minWidth: 0,
  },
  section: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  preference: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  preferenceIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.softBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferenceTitle: {
    flex: 1,
  },
  logout: {
    marginTop: spacing.lg,
  },
});
