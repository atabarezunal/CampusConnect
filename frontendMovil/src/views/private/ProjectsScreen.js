import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { FolderKanban, MessageSquare, Paperclip, Plus, SlidersHorizontal } from 'lucide-react-native';
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
import { colors, radius, spacing } from '../../theme/tokens';

const STATUS_LABELS = {
  completed: 'Completado',
  done:      'Completado',
  in_progress: 'En Progreso',
  pending:   'Pendiente',
};

function getProjectProgress(tasks = []) {
  if (!tasks.length) return 0;
  const done = tasks.filter(
    (t) => t.status === 'completed' || t.status === 'done'
  ).length;
  return Math.round((done / tasks.length) * 100);
}

export function ProjectsScreen({ navigation }) {
  const [query,      setQuery]      = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');

  const loadProjects = useCallback((token) => projectService.list(token), []);
  const { data: projects, error, isLoading } = useServiceData(loadProjects);

  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) =>
      `${p.title || ''} ${p.description || ''}`
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [projects, query]);

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

      {/* Barra de búsqueda compacta */}
      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <SearchInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar proyectos..."
          />
        </View>
        <IconButton icon={SlidersHorizontal} accessibilityLabel="Filtros" />
      </View>

      <View style={styles.filterRow}>
        {['Todos', 'En Progreso', 'Completados'].map((f) => (
          <Pressable key={f} onPress={() => setActiveFilter(f)}>
            <Chip label={f} active={activeFilter === f} />
          </Pressable>
        ))}
      </View>

      <ErrorBanner message={error} />

      {!filtered.length && !isLoading ? (
        <EmptyState
          title="No hay proyectos"
          body="Crea un proyecto para organizar tareas y equipo."
        />
      ) : null}

      <View style={styles.list}>
        {filtered.map((project) => {
          const progress = getProjectProgress(project.tasks ?? []);
          return (
            <Pressable
              key={project.id_project ?? project.id}
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
                      {project.description}
                    </AppText>
                  </View>
                  <Chip
                    label={progress === 100 ? 'Completado' : 'En Progreso'}
                    tone={progress === 100 ? 'success' : 'info'}
                  />
                </View>

                <View style={styles.progressHeader}>
                  <AppText variant="caption" color={colors.secondary}>
                    Progreso
                  </AppText>
                  <AppText variant="caption" color={colors.primary} style={styles.bold}>
                    {progress}%
                  </AppText>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>

                <View style={styles.metaRow}>
                  <View style={styles.metaItem}>
                    <MessageSquare size={14} color={colors.muted} />
                    <AppText variant="caption" color={colors.secondary}>
                      Chat
                    </AppText>
                  </View>
                  <View style={styles.metaItem}>
                    <Paperclip size={14} color={colors.muted} />
                    <AppText variant="caption" color={colors.secondary}>
                      Archivos
                    </AppText>
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        })}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchWrap: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
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
    gap: 2,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radius.full,
  },
  progressFill: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.md,
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