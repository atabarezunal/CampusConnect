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

const FILTERS = ['Todos', 'En Progreso', 'Completados'];

export function ProjectsScreen({ navigation }) {
  const [query,        setQuery]        = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');

  const loadProjects = useCallback((token) => projectService.list(token), []);
  const { data: projects, error, isLoading } = useServiceData(loadProjects);

  const filtered = useMemo(() => {
    if (!projects) return [];
    return projects.filter((p) => {
      // Filtro de texto
      const matchesQuery = `${p.title || ''} ${p.description || ''}`
        .toLowerCase()
        .includes(query.toLowerCase());

      // Filtro de estado usando el progreso que ya viene del backend
      const progress = p.progress ?? 0;
      const matchesFilter =
        activeFilter === 'Todos'       ? true :
        activeFilter === 'Completados' ? progress === 100 :
        activeFilter === 'En Progreso' ? progress < 100 :
        true;

      return matchesQuery && matchesFilter;
    });
  }, [projects, query, activeFilter]);

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

      <View style={styles.searchRow}>
        <View style={styles.searchWrap}>
          <SearchInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar proyectos..."
          />
        </View>
      </View>

      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
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
          const progress = project.progress ?? 0;
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
                    <AppText variant="caption" color={colors.secondary} numberOfLines={1}>
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
                  <View
                    style={[
                      styles.progressFill,
                      { width: progress > 0 ? `${progress}%` : '2%' },
                    ]}
                  />
                </View>

                <View style={styles.metaRow}>
                  <AppText variant="caption" color={colors.muted}>
                    {project.task_done ?? 0}/{project.task_total ?? 0} tareas completadas
                  </AppText>
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
  searchWrap: { flex: 1 },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  list: { gap: spacing.md },
  projectCard: { gap: spacing.md },
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
  bold: { fontWeight: '800' },
});