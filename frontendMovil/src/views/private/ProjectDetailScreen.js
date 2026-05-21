import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ArrowLeft, CheckCircle2, FileText, FolderKanban, Plus, UsersRound } from 'lucide-react-native';
import {
  AppText,
  Card,
  Chip,
  ErrorBanner,
  IconButton,
  Screen,
} from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useServiceData } from '../../hooks/useServiceData';
import { projectService } from '../../services/projectService';
import { tasks as fallbackTasks } from '../../services/mockData';
import { colors, radius, spacing, typography } from '../../theme/tokens';

export function ProjectDetailScreen({ navigation, route }) {
  const { accessToken } = useAuth();
  const project = route.params?.project || {};
  const projectId = project.id_project || project.id;
  const [taskTitle, setTaskTitle] = useState('');
  const loadTasks = useCallback((token) => (projectId ? projectService.getTasks(projectId, token) : []), [projectId]);
  const { data, error, refetch } = useServiceData(loadTasks, [projectId]);
  const displayTasks = error ? fallbackTasks : data;

  const progress = useMemo(() => {
    if (!displayTasks.length) return 0;
    const done = displayTasks.filter((task) => `${task.status}`.toLowerCase().includes('complet')).length;
    return Math.round((done / displayTasks.length) * 100);
  }, [displayTasks]);

  const addTask = async () => {
    if (!taskTitle.trim() || !projectId) return;
    await projectService.createTask(
      {
        id_project: projectId,
        title: taskTitle,
        status: 'Por Hacer',
      },
      accessToken
    );
    setTaskTitle('');
    refetch();
  };

  return (
    <Screen>
      <View style={styles.header}>
        <IconButton icon={ArrowLeft} onPress={() => navigation.goBack()} accessibilityLabel="Volver" />
        <AppText variant="section" style={styles.headerTitle}>
          Detalle del Proyecto
        </AppText>
        <IconButton icon={UsersRound} accessibilityLabel="Equipo" />
      </View>

      <View style={styles.projectIntro}>
        <View style={styles.projectIcon}>
          <FolderKanban size={22} color={colors.primary} />
        </View>
        <View style={styles.projectCopy}>
          <AppText variant="section" numberOfLines={2}>
            {project.title || 'Proyecto'}
          </AppText>
          <AppText variant="caption" color={colors.secondary}>
            Base de Datos - 4 miembros
          </AppText>
        </View>
      </View>

      <View style={styles.progressHeader}>
        <AppText variant="caption" color={colors.secondary}>
          Progreso general
        </AppText>
        <AppText variant="section">{progress}%</AppText>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${progress || 8}%` }]} />
      </View>

      <View style={styles.tabs}>
        <Chip label="Tareas" active />
        <Chip label="Archivos" />
        <Chip label="Equipo" />
      </View>

      <ErrorBanner message={error} />

      <View style={styles.taskGroup}>
        <View style={styles.taskHeading}>
          <CheckCircle2 size={18} color={colors.info} />
          <AppText variant="section">En Progreso</AppText>
          <Chip label={`${displayTasks.length}`} />
        </View>
        {displayTasks.map((task) => (
          <Card key={task.id_task || task.id || task.title} style={styles.taskCard}>
            <View style={styles.checkbox} />
            <View style={styles.taskCopy}>
              <AppText variant="caption" numberOfLines={2}>
                {task.title}
              </AppText>
              <View style={styles.tagRow}>
                <Chip label={task.status || 'Por Hacer'} tone="info" />
                <Chip label="Media" tone="success" />
              </View>
            </View>
          </Card>
        ))}
      </View>

      <Card style={styles.addTaskCard}>
        <FileText size={18} color={colors.primary} />
        <TextInput
          value={taskTitle}
          onChangeText={setTaskTitle}
          placeholder="Nueva tarea..."
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <IconButton icon={Plus} active onPress={addTask} accessibilityLabel="Agregar tarea" />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  projectIntro: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  projectIcon: {
    width: 54,
    height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.infoSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  projectCopy: {
    flex: 1,
    minWidth: 0,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
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
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.lg,
  },
  taskGroup: {
    gap: spacing.md,
  },
  taskHeading: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  taskCard: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.xs,
  },
  taskCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.sm,
  },
  tagRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  addTaskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  input: {
    flex: 1,
    fontFamily: typography.family,
    color: colors.text,
    minWidth: 0,
  },
});
