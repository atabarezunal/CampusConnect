import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { FolderKanban, MessageSquare, Paperclip, Plus } from 'lucide-react-native';
import {
  AppText,
  Card,
  Chip,
  EmptyState,
  ErrorBanner,
  IconButton,
  Screen,
  SearchInput,
} from '../../components/ui';
import { useServiceData } from '../../hooks/useServiceData';
import { projectService } from '../../services/projectService';
import { projects as fallbackProjects } from '../../services/mockData';
import { colors, radius, spacing } from '../../theme/tokens';

export function ProjectsScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const loadProjects = useCallback((token) => projectService.list(token), []);
  const { data, error, isLoading } = useServiceData(loadProjects);
  const displayProjects = error ? fallbackProjects : data;
  const filteredProjects = useMemo(
    () =>
      displayProjects.filter((project) =>
        `${project.title || ''} ${project.description || ''}`.toLowerCase().includes(query.toLowerCase())
      ),
    [displayProjects, query]
  );

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="title">Proyectos</AppText>
        <IconButton
          icon={Plus}
          active
          onPress={() => navigation.navigate('CreateProject')}
          accessibilityLabel="Crear proyecto"
        />
      </View>

      <SearchInput value={query} onChangeText={setQuery} placeholder="Buscar proyectos..." />

      <View style={styles.filterRow}>
        <Chip label="Todos" active />
        <Chip label="En Progreso" />
        <Chip label="Completados" />
      </View>

      <ErrorBanner message={error} />

      {!filteredProjects.length && !isLoading ? (
        <EmptyState title="No hay proyectos" body="Crea un proyecto para organizar tareas y equipo." />
      ) : null}

      <View style={styles.list}>
        {filteredProjects.map((project) => (
          <Pressable
            key={project.id_project || project.id || project.title}
            onPress={() => navigation.navigate('ProjectDetail', { project })}
          >
            <Card style={styles.projectCard}>
              <View style={styles.projectHeader}>
                <View style={styles.projectIcon}>
                  <FolderKanban size={22} color={colors.primary} />
                </View>
                <View style={styles.projectTitle}>
                  <AppText variant="section" numberOfLines={2}>
                    {project.title}
                  </AppText>
                  <AppText variant="caption" color={colors.secondary}>
                    Base de Datos
                  </AppText>
                </View>
                <Chip label="En Progreso" tone="info" />
              </View>
              <AppText variant="caption" color={colors.secondary} numberOfLines={2}>
                {project.description}
              </AppText>
              <View style={styles.progressHeader}>
                <AppText variant="caption" color={colors.secondary}>
                  Progreso
                </AppText>
                <AppText variant="caption" color={colors.primary} style={styles.bold}>
                  65%
                </AppText>
              </View>
              <View style={styles.progressTrack}>
                <View style={styles.progressFill} />
              </View>
              <View style={styles.metaRow}>
                <View style={styles.avatarStack}>
                  <View style={styles.avatarDot} />
                  <View style={styles.avatarDot} />
                  <View style={styles.avatarDot} />
                </View>
                <View style={styles.metaItem}>
                  <MessageSquare size={14} color={colors.muted} />
                  <AppText variant="caption" color={colors.secondary}>
                    12
                  </AppText>
                </View>
                <View style={styles.metaItem}>
                  <Paperclip size={14} color={colors.muted} />
                  <AppText variant="caption" color={colors.secondary}>
                    8
                  </AppText>
                </View>
              </View>
            </Card>
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  list: {
    gap: spacing.md,
  },
  projectCard: {
    gap: spacing.md,
  },
  projectHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  projectIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.infoSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectTitle: {
    flex: 1,
    minWidth: 0,
  },
  progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radius.full,
  },
  progressFill: {
    width: '65%',
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatarStack: {
    flex: 1,
    flexDirection: 'row',
  },
  avatarDot: {
    width: 24,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    marginRight: -6,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  bold: {
    fontWeight: '800',
  },
});
