import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, TextInput, View } from 'react-native';
import { ArrowLeft, FileText, Image, MoreHorizontal, Paperclip, Send, UsersRound } from 'lucide-react-native';
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
import { colors, radius, spacing, typography } from '../../theme/tokens';

export function StudyGroupDetailScreen({ navigation, route }) {
  const { accessToken } = useAuth();
  const group = route.params?.group || {};
  const groupId = group.id || group.groupId;
  const [sessionTitle, setSessionTitle] = useState('');
  const loadSessions = useCallback(
    (token) => (groupId ? studyGroupService.getSessions(groupId, token) : []),
    [groupId]
  );
  const { data: sessions, error, refetch } = useServiceData(loadSessions, [groupId]);

  const messages = useMemo(
    () => [
      {
        id: 'm1',
        author: 'Maria Lopez',
        initials: 'ML',
        text: 'Hola a todos! Ya subi el resumen del capitulo en recursos.',
        time: '10:30 AM',
      },
    ],
    []
  );

  const createSession = async () => {
    if (!sessionTitle.trim() || !groupId) return;
    await studyGroupService.createSession(groupId, { title: sessionTitle, date: new Date().toISOString() }, accessToken);
    setSessionTitle('');
    refetch();
  };

  return (
    <Screen>
      <View style={styles.topBar}>
        <IconButton icon={ArrowLeft} onPress={() => navigation.goBack()} accessibilityLabel="Volver" />
        <IconButton icon={MoreHorizontal} accessibilityLabel="Mas opciones" />
      </View>

      <View style={styles.heroArt}>
        <UsersRound size={28} color={colors.primary} />
      </View>

      <AppText variant="title">{group.name || 'Grupo de estudio'}</AppText>
      <AppText variant="caption" color={colors.secondary} style={styles.subject}>
        {group.id_subject || 'Materia'} - 6to Semestre
      </AppText>

      <View style={styles.metaRow}>
        <Chip label="12 miembros" />
        <Chip label="Mar y Jue" />
      </View>

      <Button title="Abrir Chat" onPress={() =>
        navigation.navigate('Chat', {
            groupId: group.id,
        })
      }/>

      <View style={styles.tabs}>
        <Chip label="Chat" active />
        <Chip label="Recursos" />
        <Chip label="Miembros" />
      </View>

      <ErrorBanner message={error} />

      <View style={styles.messages}>
        {messages.map((message) => (
          <View key={message.id} style={styles.messageRow}>
            <View style={styles.messageAvatar}>
              <AppText variant="caption">{message.initials}</AppText>
            </View>
            <View style={styles.messageBubble}>
              <AppText variant="caption" color={colors.secondary}>
                {message.author}
              </AppText>
              <AppText variant="caption">{message.text}</AppText>
              <AppText variant="caption" color={colors.muted}>
                {message.time}
              </AppText>
            </View>
          </View>
        ))}
      </View>

      <Card style={styles.sessionComposer}>
        <View style={styles.sessionHeader}>
          <FileText size={18} color={colors.primary} />
          <AppText variant="section">Sesiones</AppText>
          <AppText variant="caption" color={colors.secondary}>
            {sessions.length}
          </AppText>
        </View>
        <View style={styles.composerRow}>
          <TextInput
            value={sessionTitle}
            onChangeText={setSessionTitle}
            placeholder="Nueva sesion..."
            placeholderTextColor={colors.muted}
            style={styles.messageInput}
          />
          <IconButton icon={Send} active onPress={createSession} accessibilityLabel="Crear sesion" />
        </View>
      </Card>

      <View style={styles.chatBar}>
        <IconButton icon={Paperclip} accessibilityLabel="Adjuntar" />
        <IconButton icon={Image} accessibilityLabel="Imagen" />
        <View style={styles.chatInput}>
          <AppText variant="caption" color={colors.muted}>
            Escribe un mensaje...
          </AppText>
        </View>
        <IconButton icon={Send} active accessibilityLabel="Enviar" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  messages: {
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
  sessionComposer: {
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  sessionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  composerRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  messageInput: {
    flex: 1,
    minHeight: 42,
    borderRadius: radius.full,
    backgroundColor: colors.softBorder,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontFamily: typography.family,
  },
  chatBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  chatInput: {
    flex: 1,
    minHeight: 42,
    borderRadius: radius.full,
    backgroundColor: colors.softBorder,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
  },
});
