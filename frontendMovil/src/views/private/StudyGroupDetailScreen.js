import React, { useCallback, useEffect, useState } from 'react';
import { InviteMemberModal } from '../../components/InviteMemberModal';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import {
  ArrowLeft,
  Crown,
  FileText,
  Image,
  Paperclip,
  Send,
  Shield,
  Trash2,
  User,
  UserPlus,
  UserMinus,
  UsersRound,
} from 'lucide-react-native';
import { limitToLast, onValue, query, ref } from 'firebase/database';

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
import { studyGroupService } from '../../services/studyGroupService';
import { chatService } from '../../services/chatService';
import { database } from '../../config/firebase';
import { colors, radius, spacing, typography } from '../../theme/tokens';

// ─── Metadatos de roles ───────────────────────────────────────────────────────
const ROLE_META = {
  LEADER:    { label: 'Líder',     Icon: Crown,  color: '#F59E0B' },
  MODERATOR: { label: 'Moderador', Icon: Shield, color: '#3B82F6' },
  MEMBER:    { label: 'Miembro',   Icon: User,   color: null },
};

const ASSIGNABLE_ROLES = ['MEMBER', 'MODERATOR'];
const TABS = ['Chat', 'Sesiones', 'Miembros'];

// ─────────────────────────────────────────────────────────────────────────────

export function StudyGroupDetailScreen({ navigation, route }) {
  const { accessToken, user } = useAuth();
  const group   = route.params?.group ?? {};
  const groupId = group.id ?? group.groupId;

  // ── Tabs ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('Chat');

  // ── Chat ──────────────────────────────────────────────────────────────────
  const [chatText,    setChatText]    = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  // ── Sesiones ──────────────────────────────────────────────────────────────
  const [sessionTopic,   setSessionTopic]   = useState('');
  const [sessionDate,    setSessionDate]    = useState('');
  const [savingSession,  setSavingSession]  = useState(false);

  // ── Miembros ──────────────────────────────────────────────────────────────
  const [members,        setMembers]        = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [myRole,         setMyRole]         = useState(null);
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  // ── Sesiones via hook ─────────────────────────────────────────────────────
  const loadSessions = useCallback(
    (token) => (groupId ? studyGroupService.getSessions(groupId, token) : []),
    [groupId]
  );
  const { data: sessions, error: sessionsError, refetch } = useServiceData(loadSessions, [groupId]);

  // ── Último mensaje en tiempo real ─────────────────────────────────────────
  useEffect(() => {
    if (!groupId) return;
    const q = query(ref(database, `messages/${groupId}`), limitToLast(1));
    return onValue(q, (snap) => {
      if (!snap.exists()) return setLastMessage(null);
      const vals = Object.values(snap.val());
      setLastMessage(vals[0] ?? null);
    });
  }, [groupId]);

  // ── Cargar miembros ───────────────────────────────────────────────────────
  const fetchMembers = useCallback(async () => {
    if (!groupId || !accessToken) return;
    setLoadingMembers(true);
    try {
      const data = await studyGroupService.getMembers(groupId, accessToken);
      setMembers(data);
      const me = data.find((m) => String(m.userId) === String(user?.id));
      setMyRole(me?.role ?? null);
    } catch (e) {
      console.warn('Error cargando miembros:', e);
    } finally {
      setLoadingMembers(false);
    }
  }, [groupId, accessToken, user?.id]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const isLeader = myRole === 'LEADER';

  // ── Enviar mensaje ────────────────────────────────────────────────────────
  const handleSendChat = async () => {
    if (!chatText.trim() || !groupId || sendingChat) return;
    setSendingChat(true);
    try {
      await chatService.sendMessage(
        groupId,
        { text: chatText, sender_name: user?.name },
        accessToken
      );
      setChatText('');
    } catch (e) {
      console.warn('Error enviando mensaje:', e);
    } finally {
      setSendingChat(false);
    }
  };

  // ── Crear sesión ──────────────────────────────────────────────────────────
  const handleCreateSession = async () => {
    if (!sessionTopic.trim() || !groupId) return;
    setSavingSession(true);
    try {
      await studyGroupService.createSession(
        groupId,
        { topic: sessionTopic, date: sessionDate || new Date().toISOString() },
        accessToken
      );
      setSessionTopic('');
      setSessionDate('');
      refetch();
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSavingSession(false);
    }
  };

  // ── Asignar rol ───────────────────────────────────────────────────────────
  const [rolePickerMember, setRolePickerMember] = useState(null); // nuevo estado

  const handleAssignRole = (member) => {
    if (!isLeader) return;
    setRolePickerMember(member); // abre el picker inline en vez de Alert
  };
  const confirmAssignRole = async (role) => {
    const member = rolePickerMember;
    setRolePickerMember(null);
    if (!member) return;
    try {
      await studyGroupService.assignRole(
        { groupId, targetUserId: String(member.userId), role },
        accessToken
      );
      await fetchMembers();
    } catch (e) {
      Alert.alert('Error', e.message);
    }
  };

  // ── Expulsar miembro ──────────────────────────────────────────────────────
  const handleRemoveMember = (member) => {
    Alert.alert(
      'Expulsar miembro',
      `¿Expulsar a ${member.name} del grupo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Expulsar',
          style: 'destructive',
          onPress: async () => {
            try {
              await studyGroupService.removeMember(groupId, member.userId, accessToken);
              await fetchMembers();
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  // ── Eliminar grupo ────────────────────────────────────────────────────────
  const handleDeleteGroup = () => {
    Alert.alert(
      'Eliminar grupo',
      '¿Estás seguro? Esta acción no se puede deshacer.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await studyGroupService.deleteGroup(groupId, accessToken);
              navigation.goBack();
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const getInitials = (name = '') =>
    (name || '??')
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

  const formatTime = (iso) => {
    try {
      return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // ── Render: tab Chat ──────────────────────────────────────────────────────
  const renderChat = () => (
    <View style={styles.tabContent}>
      {lastMessage ? (
        <View style={styles.messageRow}>
          <View style={styles.messageAvatar}>
            <AppText variant="caption">{getInitials(lastMessage.sender_name)}</AppText>
          </View>
          <View style={styles.messageBubble}>
            <AppText variant="caption" color={colors.secondary}>
              {lastMessage.sender_name}
            </AppText>
            <AppText variant="caption">{lastMessage.text}</AppText>
            <AppText variant="caption" color={colors.muted}>
              {formatTime(lastMessage.created_at)}
            </AppText>
          </View>
        </View>
      ) : (
        <View style={styles.emptyBox}>
          <AppText variant="caption" color={colors.muted}>
            No hay mensajes aún
          </AppText>
        </View>
      )}

      <Button
        title="Abrir Chat completo"
        onPress={() => navigation.navigate('Chat', { groupId })}
      />
    </View>
  );

  // ── Render: tab Sesiones ──────────────────────────────────────────────────
  const renderSessions = () => (
    <View style={styles.tabContent}>
      <ErrorBanner message={sessionsError} />

      {sessions.length === 0 ? (
        <View style={styles.emptyBox}>
          <AppText variant="caption" color={colors.muted}>
            Sin sesiones registradas
          </AppText>
        </View>
      ) : (
        sessions.map((s) => (
          <Card key={s.id} style={styles.sessionItem}>
            <AppText variant="section">{s.topic ?? s.title ?? 'Sesión'}</AppText>
            <AppText variant="caption" color={colors.secondary}>
              {s.date ? new Date(s.date).toLocaleDateString() : ''}
            </AppText>
          </Card>
        ))
      )}

      <Card style={styles.sessionComposer}>
        <View style={styles.sessionHeader}>
          <FileText size={18} color={colors.primary} />
          <AppText variant="section">Nueva sesión</AppText>
        </View>
        <TextInput
          value={sessionTopic}
          onChangeText={setSessionTopic}
          placeholder="Tema de la sesión..."
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <TextInput
          value={sessionDate}
          onChangeText={setSessionDate}
          placeholder="Fecha (YYYY-MM-DD) — opcional"
          placeholderTextColor={colors.muted}
          style={styles.input}
        />
        <Button
          title={savingSession ? 'Guardando…' : 'Crear sesión'}
          onPress={handleCreateSession}
          disabled={savingSession || !sessionTopic.trim()}
        />
      </Card>
    </View>
  );

  // ── Render: tab Miembros ──────────────────────────────────────────────────
  const renderMembers = () => (
    <View style={styles.tabContent}>
      {/* Botón invitar — solo líder */}
      {isLeader && (
      <Pressable
        onPress={() => setInviteModalVisible(true)}
        style={styles.inviteRow}
      >
        <UserPlus size={16} color={colors.primary} />
        <AppText variant="section" color={colors.primary}>
          Invitar persona
        </AppText>
      </Pressable>
      )}
      {loadingMembers ? (
        <View style={styles.emptyBox}>
          <AppText variant="caption" color={colors.muted}>
            Cargando miembros…
          </AppText>
        </View>
      ) : members.length === 0 ? (
        <View style={styles.emptyBox}>
          <AppText variant="caption" color={colors.muted}>
            Sin miembros
          </AppText>
        </View>
      ) : (
        members.map((member) => {
          const meta    = ROLE_META[member.role] ?? ROLE_META.MEMBER;
          const RoleIcon = meta.Icon;
          const isSelf  = String(member.userId) === String(user?.id);

          return (
            <Card key={member.userId} style={styles.memberRow}>
              {/* Avatar */}
              <View style={styles.memberAvatar}>
                <AppText variant="caption">{getInitials(member.name)}</AppText>
              </View>

              {/* Info */}
              <View style={styles.memberInfo}>
                <AppText variant="section">
                  {member.name}{isSelf ? ' (tú)' : ''}
                </AppText>
                <AppText variant="caption" color={colors.muted}>
                  {member.email}
                </AppText>
                <View style={styles.roleChip}>
                  <RoleIcon
                    size={12}
                    color={meta.color ?? colors.secondary}
                  />
                  <AppText
                    variant="caption"
                    color={meta.color ?? colors.secondary}
                  >
                    {' '}{meta.label}
                  </AppText>
                </View>
              </View>

              {/* Acciones del líder (no sobre sí mismo) */}
              {isLeader && !isSelf && (
                <View style={styles.memberActions}>
                  <Pressable
                    onPress={() => handleAssignRole(member)}
                    style={styles.actionBtn}
                  >
                    <Shield size={16} color="#3B82F6" />
                  </Pressable>
                  <Pressable
                    onPress={() => handleRemoveMember(member)}
                    style={styles.actionBtn}
                  >
                    <UserMinus size={16} color="#EF4444" />
                  </Pressable>
                </View>
              )}
            </Card>
          );
        })
      )}
      {/* Modal */}
      <InviteMemberModal
        visible={inviteModalVisible}
        groupId={groupId}
        accessToken={accessToken}
        onClose={() => setInviteModalVisible(false)}
      />
      {/* Picker de rol */}
      {rolePickerMember && (
        <View style={styles.rolePicker}>
          <AppText variant="section" style={{ marginBottom: spacing.sm }}>
            Rol para {rolePickerMember.name}
          </AppText>
          {ASSIGNABLE_ROLES.map((r) => {
            const meta = ROLE_META[r];
            const RoleIcon = meta.Icon;
            return (
              <Pressable
                key={r}
                onPress={() => confirmAssignRole(r)}
                style={styles.roleOption}
              >
                <RoleIcon size={16} color={meta.color ?? colors.secondary} />
                <AppText variant="section" color={meta.color ?? colors.secondary}>
                  {meta.label}
                </AppText>
              </Pressable>
            );
          })}
          <Pressable
            onPress={() => setRolePickerMember(null)}
            style={[styles.roleOption, { borderTopWidth: 1, borderTopColor: colors.border }]}
          >
            <AppText variant="caption" color={colors.muted}>Cancelar</AppText>
          </Pressable>
        </View>
      )}
    </View>
  );

  // ── Render principal ──────────────────────────────────────────────────────
  return (
    <Screen scroll={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Top bar */}
          <View style={styles.topBar}>
            <IconButton
              icon={ArrowLeft}
              onPress={() => navigation.goBack()}
              accessibilityLabel="Volver"
            />
            {isLeader && (
              <IconButton
                icon={Trash2}
                onPress={handleDeleteGroup}
                accessibilityLabel="Eliminar grupo"
              />
            )}
          </View>

          {/* Hero */}
          <View style={styles.heroArt}>
            <UsersRound size={28} color={colors.primary} />
          </View>
          <AppText variant="title">{group.name ?? 'Grupo de estudio'}</AppText>
          <AppText variant="caption" color={colors.secondary} style={styles.subject}>
            {group.id_subject ?? 'Materia'}
          </AppText>

          {/* Chips de info */}
          <View style={styles.metaRow}>
            <Chip label={`${members.length} miembros`} />
            {myRole && (
              <Chip
                label={ROLE_META[myRole]?.label ?? myRole}
                tone="info"
              />
            )}
          </View>

          {/* Tabs */}
          <View style={styles.tabs}>
            {TABS.map((tab) => (
              <Pressable key={tab} onPress={() => setActiveTab(tab)}>
                <Chip label={tab} active={activeTab === tab} />
              </Pressable>
            ))}
          </View>

          {/* Contenido activo */}
          {activeTab === 'Chat'     && renderChat()}
          {activeTab === 'Sesiones' && renderSessions()}
          {activeTab === 'Miembros' && renderMembers()}
        </ScrollView>

        {/* Barra de chat fija, solo visible en tab Chat */}
        {activeTab === 'Chat' && (
          <View style={styles.chatBar}>
            <TextInput
              value={chatText}
              onChangeText={setChatText}
              placeholder="Escribe un mensaje..."
              placeholderTextColor={colors.muted}
              style={styles.chatInput}
            />
            <IconButton
              icon={Send}
              active={chatText.trim().length > 0 && !sendingChat}
              onPress={handleSendChat}
              accessibilityLabel="Enviar"
            />
          </View>
        )}
      </KeyboardAvoidingView>
    </Screen>
  );
}

// ─── Estilos ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.md,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  heroArt: {
    width: 58,
    height: 58,
    borderRadius: radius.md,
    backgroundColor: colors.infoSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  subject: {
    marginTop: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  tabs: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.lg,
  },

  // ── Chat ──────────────────────────────────────────────────────────────────
  tabContent: {
    gap: spacing.md,
  },
  messageRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  emptyBox: {
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // ── Sesiones ──────────────────────────────────────────────────────────────
  sessionItem: {
    gap: spacing.xs,
  },
  sessionComposer: {
    gap: spacing.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    minHeight: 42,
    borderRadius: radius.md,
    backgroundColor: colors.softBorder,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontFamily: typography.family,
  },

  // ── Miembros ──────────────────────────────────────────────────────────────
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  memberAvatar: {
    width: 42,
    height: 42,
    borderRadius: radius.full,
    backgroundColor: colors.infoSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  memberInfo: {
    flex: 1,
    gap: 2,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  memberActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionBtn: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
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
  rolePicker: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
  },

  // ── Chat bar ──────────────────────────────────────────────────────────────
  chatBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  chatInput: {
    flex: 1,
    minHeight: 42,
    borderRadius: radius.full,
    backgroundColor: colors.softBorder,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontFamily: typography.family,
  },
});