import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import {
  Bell,
  CalendarDays,
  FileText,
  FolderKanban,
  SlidersHorizontal,
  UserRound,
  UsersRound,
} from 'lucide-react-native';
import {
  AppText,
  Card,
  EmptyState,
  ErrorBanner,
  IconButton,
  Screen,
  SearchInput,
  SectionHeader,
} from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useServiceData } from '../../hooks/useServiceData';
import { studyGroupService } from '../../services/studyGroupService';
import { projectService } from '../../services/projectService';
import { notificationService } from '../../services/notificationService';
import { groups as fallbackGroups, projects as fallbackProjects } from '../../services/mockData';
import { colors, radius, spacing } from '../../theme/tokens';

const shortcuts = [
  { label: 'Grupos', icon: UsersRound, target: 'StudyGroups', tone: colors.infoSoft },
  { label: 'Proyectos', icon: FolderKanban, target: 'Projects', tone: colors.mintSoft },
  { label: 'Recursos', icon: FileText, target: 'Resources', tone: colors.warningSoft },
  { label: 'Eventos', icon: CalendarDays, target: 'Notifications', tone: colors.lilacSoft },
];

export function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [query, setQuery] = useState('');
  const loadGroups = useCallback((token) => studyGroupService.list(token), []);
  const loadProjects = useCallback((token) => projectService.list(token), []);
  const loadNotifications = useCallback((token) => notificationService.listMine(token), []);
  const groupsState = useServiceData(loadGroups);
  const projectsState = useServiceData(loadProjects);
  const notificationsState = useServiceData(loadNotifications);

  const displayGroups = groupsState.error ? fallbackGroups : groupsState.data;
  const displayProjects = projectsState.error ? fallbackProjects : projectsState.data;

  const filteredGroups = useMemo(
    () =>
      displayGroups.filter((group) =>
        `${group.name || ''} ${group.id_subject || ''}`.toLowerCase().includes(query.toLowerCase())
      ),
    [displayGroups, query]
  );

  const firstName = user?.name?.split(' ')[0] || 'Estudiante';

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <AppText variant="caption" color={colors.secondary}>
            Buenos dias
          </AppText>
          <AppText variant="title">{firstName}</AppText>
        </View>
        <IconButton
          icon={Bell}
          onPress={() => navigation.navigate('Notifications')}
          accessibilityLabel="Notificaciones"
        />
        <Pressable style={styles.avatar} onPress={() => navigation.navigate('Profile')}>
          <AppText variant="section">{getInitials(user?.name)}</AppText>
        </Pressable>
      </View>

      <View style={styles.searchRow}>
        <SearchInput value={query} onChangeText={setQuery} placeholder="Buscar grupos, proyectos..." />
      </View>

      <ErrorBanner message={groupsState.error || projectsState.error || notificationsState.error} />

      <View style={styles.shortcuts}>
        {shortcuts.map((shortcut) => {
          const ShortcutIcon = shortcut.icon;
          return (
            <Pressable
              key={shortcut.label}
              onPress={() => navigation.navigate(shortcut.target)}
              style={({ pressed }) => [styles.shortcut, pressed ? styles.pressed : null]}
            >
              <View style={[styles.shortcutIcon, { backgroundColor: shortcut.tone }]}>
                <ShortcutIcon size={20} color={colors.primary} />
              </View>
              <AppText variant="caption" numberOfLines={1}>
                {shortcut.label}
              </AppText>
            </Pressable>
          );
        })}
      </View>

      <SectionHeader title="Mis Grupos" action="Ver todos" onAction={() => navigation.navigate('StudyGroups')} />
      {filteredGroups.length ? (
        <View style={styles.horizontalList}>
          {filteredGroups.slice(0, 2).map((group) => (
            <Pressable
              key={group.id || group.groupId || group.name}
              style={styles.wideCardPressable}
              onPress={() => navigation.navigate('StudyGroupDetail', { group })}
            >
              <Card style={styles.groupCard}>
                <View style={styles.cardArt}>
                  <UsersRound size={24} color={colors.primary} />
                </View>
                <AppText variant="section" numberOfLines={2}>
                  {group.name}
                </AppText>
                <AppText variant="caption" color={colors.secondary} numberOfLines={1}>
                  {group.id_subject || 'Materia'}
                </AppText>
                <AppText variant="caption" color={colors.muted}>
                  12 miembros
                </AppText>
              </Card>
            </Pressable>
          ))}
        </View>
      ) : (
        <EmptyState title="Sin grupos" body="Crea o acepta una invitacion para empezar." />
      )}

      <SectionHeader title="Proyectos activos" action="Ver todos" onAction={() => navigation.navigate('Projects')} />
      {displayProjects.slice(0, 2).map((project) => {
      const progress = project.progress ?? 0;
      return (
        <Pressable
          key={project.id_project || project.id || project.title}
          onPress={() => navigation.navigate('ProjectDetail', { project })}
        >
          <Card style={styles.projectCard}>
            <View style={styles.projectIcon}>
              <FolderKanban size={20} color={colors.primary} />
            </View>
            <View style={styles.projectCopy}>
              <AppText variant="section" numberOfLines={2}>
                {project.title}
              </AppText>
              <AppText variant="caption" color={colors.secondary} numberOfLines={1}>
                {project.description}
              </AppText>
              {/* Mini barra de progreso */}
              <View style={styles.miniTrack}>
                <View
                  style={[
                    styles.miniFill,
                    { width: progress > 0 ? `${progress}%` : '2%' },
                  ]}
                />
              </View>
            </View>
            <AppText variant="caption" color={colors.primary} style={styles.percent}>
              {progress}%
            </AppText>
          </Card>
        </Pressable>
      );
    })}
    </Screen>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  headerCopy: {
    flex: 1,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  shortcuts: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  shortcut: {
    flex: 1,
    alignItems: 'center',
    gap: spacing.xs,
  },
  shortcutIcon: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  horizontalList: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  wideCardPressable: {
    flex: 1,
  },
  groupCard: {
    minHeight: 150,
    gap: spacing.sm,
  },
  cardArt: {
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.infoSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  projectIcon: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.infoSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectCopy: {
    flex: 1,
    minWidth: 0,
  },
  percent: {
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.8,
  },
  miniTrack: {
  height: 4,
  backgroundColor: colors.border,
  borderRadius: radius.full,
  marginTop: spacing.xs,
  },
  miniFill: {
    height: 4,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
});
