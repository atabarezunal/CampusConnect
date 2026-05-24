import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import {
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Crown,
  FileText,
  FolderKanban,
  Plus,
  Shield,
  Trash2,
  User,
  UserMinus,
  UserPlus,
  UsersRound,
  X,
} from 'lucide-react-native';
import {
  AppText,
  Button,
  Card,
  Chip,
  ErrorBanner,
  IconButton,
  Screen,
} from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useServiceData } from '../../hooks/useServiceData';
import { projectService } from '../../services/projectService';
import { colors, radius, spacing, typography } from '../../theme/tokens';

// ─── Roles ────────────────────────────────────────────────────────────────────
const ROLE_META = {
  OWNER:       { label: 'Owner',       Icon: Crown,  color: '#F59E0B' },
  MANAGER:     { label: 'Manager',     Icon: Shield, color: '#3B82F6' },
  CONTRIBUTOR: { label: 'Contributor', Icon: User,   color: null      },
};
const ASSIGNABLE_ROLES = ['MANAGER', 'CONTRIBUTOR'];
const TABS = ['Tareas', 'Miembros'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
const DONE_STATUSES = ['completed', 'done'];
const isDone = (status) => DONE_STATUSES.includes(String(status).toLowerCase());

const getInitials = (name = '') =>
  (name || '??').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

// ─────────────────────────────────────────────────────────────────────────────

export function ProjectDetailScreen({ navigation, route }) {
  const { accessToken, user } = useAuth();
  const project   = route.params?.project ?? {};
  const projectId = project.id_project ?? project.id;

  const [activeTab,    setActiveTab]    = useState('Tareas');
  const [taskTitle,    setTaskTitle]    = useState('');
  const [addingTask,   setAddingTask]   = useState(false);
  const [togglingId,   setTogglingId]   = useState(null);

  // Miembros
  const [members,         setMembers]         = useState([]);
  const [loadingMembers,  setLoadingMembers]  = useState(false);
  const [myRole,          setMyRole]          = useState(null);
  const [inviteVisible,   setInviteVisible]   = useState(false);

  // ── Tareas ─────────────────────────────────────────────────────────────────
  const loadTasks = useCallback(
    (token) => (projectId ? projectService.getTasks(projectId, token) : []),
    [projectId]
  );
  const { data: tasks, error: tasksError, refetch } = useServiceData(loadTasks, [projectId]);

  const progress = useMemo(() => {
    if (!tasks.length) return 0;
    const done = tasks.filter((t) => isDone(t.status)).length;
    return Math.round((done / tasks.length) * 100);
  }, [tasks]);

  // ── Miembros ───────────────────────────────────────────────────────────────
  const fetchMembers = useCallback(async () => {
    if (!projectId || !accessToken) return;
    setLoadingMembers(true);
    try {
      const data = await projectService.getMembers(projectId, accessToken);
      setMembers(data);
      const me = data.find((m) => String(m.user_id) === String(user?.id));
      setMyRole(me?.role ?? null);
    } catch (e) {
      console.warn('Error cargando miembros:', e);
    } finally {
      setLoadingMembers(false);
    }
  }, [projectId, accessToken, user?.id]);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const isOwner   = myRole === 'OWNER';
  const canManage = myRole === 'OWNER' || myRole === 'MANAGER';

  // ── Crear tarea ────────────────────────────────────────────────────────────
  const handleAddTask = async () => {
    if (!taskTitle.trim() || !projectId) return;
    setAddingTask(true);
    try {
      await projectService.createTask(
        { id_project: projectId, title: taskTitle, status: 'pending' },
        accessToken
      );
      setTaskTitle('');
      refetch();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setAddingTask(false);
    }
  };

  // ── Marcar / desmarcar tarea ───────────────────────────────────────────────
  const handleToggleTask = async (task) => {
    if (togglingId) return;
    const next = isDone(task.status) ? 'pending' : 'completed';
    setTogglingId(task.id_task);
    try {
      await projectService.updateTaskStatus(task.id_task, next, accessToken);
      refetch();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setTogglingId(null);
    }
  };

  // ── Eliminar proyecto ──────────────────────────────────────────────────────
  const handleDeleteProject = () => {
    Alert.alert(
      'Eliminar proyecto',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await projectService.remove(projectId, accessToken);
              navigation.goBack();
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  // ── Eliminar miembro ───────────────────────────────────────────────────────
  const handleRemoveMember = (member) => {
    Alert.alert(
      'Eliminar miembro',
      `¿Eliminar a ${member.name} del proyecto?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await projectService.removeMember(projectId, member.user_id, accessToken);
              await fetchMembers();
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  // ── Render: Tareas ─────────────────────────────────────────────────────────
  const renderTasks = () => (
    <View style={styles.tabContent}>
      <ErrorBanner message={tasksError} />

      {tasks.length === 0 ? (
        <View style={styles.emptyBox}>
          <AppText variant="caption" color={colors.muted}>
            Sin tareas aún
          </AppText>
        </View>
      ) : (
        tasks.map((task) => {
          const done       = isDone(task.status);
          const isToggling = togglingId === task.id_task;
          return (
            <Card key={task.id_task} style={styles.taskCard}>
              <Pressable
                onPress={() => handleToggleTask(task)}
                disabled={!!togglingId}
                style={styles.checkbox}
              >
                {isToggling ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : done ? (
                  <CheckCircle2 size={22} color={colors.primary} />
                ) : (
                  <Circle size={22} color={colors.border} />
                )}
              </Pressable>
              <View style={styles.taskCopy}>
                <AppText
                  variant="caption"
                  style={done && styles.taskDone}
                  numberOfLines={2}
                >
                  {task.title}
                </AppText>
                <Chip
                  label={done ? 'Completada' : 'Pendiente'}
                  tone={done ? 'success' : 'info'}
                />
              </View>
            </Card>
          );
        })
      )}

      {/* Nueva tarea */}
      <Card style={styles.addTaskCard}>
        <FileText size={18} color={colors.primary} />
        <TextInput
          value={taskTitle}
          onChangeText={setTaskTitle}
          placeholder="Nueva tarea..."
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <IconButton
          icon={Plus}
          active={!!taskTitle.trim() && !addingTask}
          onPress={handleAddTask}
          accessibilityLabel="Agregar tarea"
        />
      </Card>
    </View>
  );

  // ── Render: Miembros ───────────────────────────────────────────────────────
  const renderMembers = () => (
    <View style={styles.tabContent}>
      {canManage && (
        <Pressable
          onPress={() => setInviteVisible(true)}
          style={styles.inviteRow}
        >
          <UserPlus size={16} color={colors.primary} />
          <AppText variant="section" color={colors.primary}>
            Añadir miembro
          </AppText>
        </Pressable>
      )}

      {loadingMembers ? (
        <View style={styles.emptyBox}>
          <AppText variant="caption" color={colors.muted}>Cargando…</AppText>
        </View>
      ) : (
        members.map((member) => {
          const meta    = ROLE_META[member.role] ?? ROLE_META.CONTRIBUTOR;
          const RoleIcon = meta.Icon;
          const isSelf  = String(member.user_id) === String(user?.id);
          return (
            <Card key={member.user_id} style={styles.memberRow}>
              <View style={styles.memberAvatar}>
                <AppText variant="caption">{getInitials(member.name)}</AppText>
              </View>
              <View style={styles.memberInfo}>
                <AppText variant="section">
                  {member.name}{isSelf ? ' (tú)' : ''}
                </AppText>
                <AppText variant="caption" color={colors.muted}>{member.email}</AppText>
                <View style={styles.roleChip}>
                  <RoleIcon size={12} color={meta.color ?? colors.secondary} />
                  <AppText variant="caption" color={meta.color ?? colors.secondary}>
                    {' '}{meta.label}
                  </AppText>
                </View>
              </View>
              {canManage && !isSelf && member.role !== 'OWNER' && (
                <Pressable
                  onPress={() => handleRemoveMember(member)}
                  style={styles.actionBtn}
                >
                  <UserMinus size={16} color="#EF4444" />
                </Pressable>
              )}
            </Card>
          );
        })
      )}

      {/* Modal invitar */}
      <ProjectInviteModal
        visible={inviteVisible}
        projectId={projectId}
        accessToken={accessToken}
        onClose={() => setInviteVisible(false)}
        onInvited={fetchMembers}
      />
    </View>
  );

  // ── Render principal ───────────────────────────────────────────────────────
  return (
    <Screen>
      <View style={styles.header}>
        <IconButton icon={ArrowLeft} onPress={() => navigation.goBack()} accessibilityLabel="Volver" />
        <AppText variant="section" style={styles.headerTitle}>
          {project.title ?? 'Proyecto'}
        </AppText>
        {isOwner && (
          <IconButton icon={Trash2} onPress={handleDeleteProject} accessibilityLabel="Eliminar proyecto" />
        )}
      </View>

      {/* Hero */}
      <View style={styles.projectIntro}>
        <View style={styles.projectIcon}>
          <FolderKanban size={22} color={colors.primary} />
        </View>
        <View style={styles.projectCopy}>
          <AppText variant="section">{project.title ?? 'Proyecto'}</AppText>
          <AppText variant="caption" color={colors.secondary}>
            {members.length} miembro{members.length !== 1 ? 's' : ''}
            {myRole ? ` · ${ROLE_META[myRole]?.label ?? myRole}` : ''}
          </AppText>
        </View>
      </View>

      {/* Progreso */}
      <View style={styles.progressHeader}>
        <AppText variant="caption" color={colors.secondary}>Progreso general</AppText>
        <AppText variant="section">{progress}%</AppText>
      </View>
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: progress ? `${progress}%` : '2%' }]} />
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <Pressable key={tab} onPress={() => setActiveTab(tab)}>
            <Chip label={tab} active={activeTab === tab} />
          </Pressable>
        ))}
      </View>

      {activeTab === 'Tareas'   && renderTasks()}
      {activeTab === 'Miembros' && renderMembers()}
    </Screen>
  );
}

// ─── Modal invitar miembro ────────────────────────────────────────────────────
function ProjectInviteModal({ visible, projectId, accessToken, onClose, onInvited }) {
  const [query,      setQuery]      = useState('');
  const [results,    setResults]    = useState([]);
  const [searching,  setSearching]  = useState(false);
  const [addedIds,   setAddedIds]   = useState(new Set());
  const [adding,     setAdding]     = useState(null);
  const [role,       setRole]       = useState('CONTRIBUTOR');
  const debounceRef = React.useRef(null);

  useEffect(() => {
    if (!visible) { setQuery(''); setResults([]); setAddedIds(new Set()); }
  }, [visible]);

  const handleSearch = (text) => {
    setQuery(text);
    clearTimeout(debounceRef.current);
    if (text.trim().length < 2) return setResults([]);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await projectService.searchUsers(text.trim(), accessToken);
        setResults(data ?? []);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 400);
  };

  const handleAdd = async (u) => {
    if (addedIds.has(u.id) || adding) return;
    setAdding(u.id);
    try {
      await projectService.addMember(
        { id_project: projectId, user_id: u.id, role },
        accessToken
      );
      setAddedIds((prev) => new Set([...prev, u.id]));
      onInvited?.();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setAdding(null);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={mStyles.overlay} onPress={onClose}>
          <Pressable style={mStyles.sheet} onPress={(e) => e.stopPropagation()}>

            <View style={mStyles.handle} />

            <View style={mStyles.header}>
              <AppText variant="section">Añadir miembro</AppText>
              <IconButton icon={X} onPress={onClose} accessibilityLabel="Cerrar" />
            </View>

            <View style={mStyles.roleRow}>
              {ASSIGNABLE_ROLES.map((r) => (
                <Pressable key={r} onPress={() => setRole(r)}>
                  <Chip label={ROLE_META[r].label} active={role === r} />
                </Pressable>
              ))}
            </View>

            <View style={mStyles.searchRow}>
              <TextInput
                value={query}
                onChangeText={handleSearch}
                placeholder="Buscar por nombre o correo…"
                placeholderTextColor={colors.muted}
                style={mStyles.searchInput}
                autoFocus
                autoCapitalize="none"
                returnKeyType="search"
              />
              {searching && <ActivityIndicator size="small" color={colors.primary} />}
            </View>

            {/* ScrollView con keyboardShouldPersistTaps para que los botones funcionen */}
            <ScrollView
              style={{ maxHeight: 260 }}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {results.map((u) => {
                const added   = addedIds.has(u.id);
                const loading = adding === u.id;
                return (
                  <Card key={u.id} style={[mStyles.resultRow, { marginBottom: spacing.sm }]}>
                    <View style={mStyles.avatar}>
                      <AppText variant="caption">{getInitials(u.name)}</AppText>
                    </View>
                    <View style={mStyles.userInfo}>
                      <AppText variant="section">{u.name}</AppText>
                      <AppText variant="caption" color={colors.muted}>{u.email}</AppText>
                    </View>
                    {added ? (
                      <View style={mStyles.addedBadge}>
                        <AppText variant="caption" color="#10B981">Añadido</AppText>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => handleAdd(u)}
                        disabled={!!adding}
                        style={[mStyles.addBtn, !!adding && mStyles.addBtnDisabled]}
                      >
                        {loading
                          ? <ActivityIndicator size="small" color="#fff" />
                          : <UserPlus size={16} color="#fff" />
                        }
                      </Pressable>
                    )}
                  </Card>
                );
              })}
              {query.trim().length >= 2 && !searching && results.length === 0 && (
                <View style={mStyles.emptyBox}>
                  <AppText variant="caption" color={colors.muted}>Sin resultados</AppText>
                </View>
              )}
              {query.trim().length < 2 && (
                <AppText variant="caption" color={colors.muted} style={mStyles.hint}>
                  Escribe al menos 2 caracteres
                </AppText>
              )}
            </ScrollView>

          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

// ─── Estilos pantalla ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  headerTitle: { flex: 1, textAlign: 'center' },
  projectIntro: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  projectIcon: {
    width: 54, height: 54,
    borderRadius: radius.md,
    backgroundColor: colors.infoSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  projectCopy: { flex: 1, minWidth: 0, gap: 2 },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: radius.full,
    marginBottom: spacing.lg,
  },
  progressFill: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  tabs: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg },
  tabContent: { gap: spacing.md },
  emptyBox: {
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  checkbox: { paddingTop: 2 },
  taskCopy: { flex: 1, gap: spacing.sm },
  taskDone: { textDecorationLine: 'line-through', opacity: 0.5 },
  addTaskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    fontFamily: typography.family,
    color: colors.text,
    minHeight: 40,
  },
  inviteRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed',
    justifyContent: 'center',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  memberAvatar: {
    width: 42, height: 42,
    borderRadius: radius.full,
    backgroundColor: colors.infoSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  memberInfo: { flex: 1, gap: 2 },
  roleChip: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  actionBtn: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

// ─── Estilos modal ────────────────────────────────────────────────────────────
const mStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    minHeight: 320,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  roleRow: { flexDirection: 'row', gap: spacing.sm },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.softBorder,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
  },
  searchInput: {
    flex: 1,
    minHeight: 44,
    color: colors.text,
    fontFamily: typography.family,
  },
  resultList: { gap: spacing.sm },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 40, height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.infoSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  userInfo: { flex: 1, gap: 2 },
  addBtn: {
    width: 36, height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  addBtnDisabled: { opacity: 0.5 },
  addedBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: '#10B981',
  },
  handle: {
    width: 40, height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.xs,
  },
  emptyBox: { padding: spacing.md, alignItems: 'center' },
  hint: { textAlign: 'center', marginTop: spacing.sm },
});