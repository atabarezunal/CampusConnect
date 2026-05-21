import React, { useCallback } from 'react';
import { StyleSheet, View } from 'react-native';
import { Bell, Check, X } from 'lucide-react-native';
import { AppText, Button, Card, EmptyState, ErrorBanner, IconButton, Screen } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useServiceData } from '../../hooks/useServiceData';
import { notificationService } from '../../services/notificationService';
import { studyGroupService } from '../../services/studyGroupService';
import { notifications as fallbackNotifications } from '../../services/mockData';
import { colors, radius, spacing } from '../../theme/tokens';

export function NotificationsScreen() {
  const { accessToken } = useAuth();
  const loadNotifications = useCallback((token) => notificationService.listMine(token), []);
  const loadInvitations = useCallback((token) => studyGroupService.getInvitations(token), []);
  const notificationState = useServiceData(loadNotifications);
  const invitationState = useServiceData(loadInvitations);
  const notifications = notificationState.error ? fallbackNotifications : notificationState.data;

  const respond = async (invitationId, accepted) => {
    if (accepted) {
      await studyGroupService.acceptInvitation(invitationId, accessToken);
    } else {
      await studyGroupService.rejectInvitation(invitationId, accessToken);
    }
    invitationState.refetch();
    notificationState.refetch();
  };

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="title">Notificaciones</AppText>
        <View style={styles.iconBadge}>
          <Bell size={22} color={colors.primary} />
        </View>
      </View>

      <ErrorBanner message={notificationState.error || invitationState.error} />

      <AppText variant="section" style={styles.section}>
        Invitaciones
      </AppText>
      {invitationState.data.length ? (
        <View style={styles.list}>
          {invitationState.data.map((invite) => (
            <Card key={invite.id} style={styles.invitationCard}>
              <View style={styles.invitationCopy}>
                <AppText variant="section">Invitacion pendiente</AppText>
                <AppText variant="caption" color={colors.secondary}>
                  Grupo: {invite.groupId}
                </AppText>
              </View>
              <View style={styles.actions}>
                <IconButton icon={X} onPress={() => respond(invite.id, false)} accessibilityLabel="Rechazar" />
                <IconButton icon={Check} active onPress={() => respond(invite.id, true)} accessibilityLabel="Aceptar" />
              </View>
            </Card>
          ))}
        </View>
      ) : (
        <EmptyState title="Sin invitaciones" body="Cuando te inviten a un grupo aparecera aqui." />
      )}

      <AppText variant="section" style={styles.section}>
        Actividad
      </AppText>
      <View style={styles.list}>
        {notifications.map((notification) => (
          <Card key={notification.id} style={styles.notificationCard}>
            <View style={styles.dot} />
            <View style={styles.notificationCopy}>
              <AppText variant="caption" numberOfLines={3}>
                {notification.message}
              </AppText>
              <AppText variant="caption" color={colors.muted}>
                {formatDate(notification.date)}
              </AppText>
            </View>
          </Card>
        ))}
      </View>
      {!notifications.length ? <Button title="Actualizar" onPress={notificationState.refetch} /> : null}
    </Screen>
  );
}

function formatDate(value) {
  if (!value) return 'Reciente';
  return new Date(value).toLocaleDateString();
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  iconBadge: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.softBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  invitationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  invitationCopy: {
    flex: 1,
    minWidth: 0,
  },
  actions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  notificationCard: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: radius.full,
    backgroundColor: colors.info,
    marginTop: spacing.xs,
  },
  notificationCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
});
