import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, TextInput, View, KeyboardAvoidingView, ScrollView, Platform } from 'react-native'; // [1] Añadidos componentes para teclado y scroll
import { ArrowLeft, FileText, Image, MoreHorizontal, Paperclip, Send, UsersRound } from 'lucide-react-native';
import { ref, query, limitToLast, onValue } from 'firebase/database';

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

export function StudyGroupDetailScreen({ navigation, route }) {
  const { accessToken, user } = useAuth();
  const group = route.params?.group || {};
  const groupId = group.id || group.groupId;

  const [sessionTitle, setSessionTitle] = useState('');
  const [chatText, setChatText] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [lastMessage, setLastMessage] = useState(null);

  const loadSessions = useCallback(
    (token) => (groupId ? studyGroupService.getSessions(groupId, token) : []),
    [groupId]
  );
  const { data: sessions, error, refetch } = useServiceData(loadSessions, [groupId]);

  useEffect(() => {
    if (!groupId) return;

    const messagesRef = ref(database, `messages/${groupId}`);
    const lastMessageQuery = query(messagesRef, limitToLast(1));

    const unsubscribe = onValue(lastMessageQuery, (snapshot) => {
      if (!snapshot.exists()) {
        setLastMessage(null);
        return;
      }
      
      const data = snapshot.val();
      const msgArray = Object.values(data);
      if (msgArray.length > 0) {
        setLastMessage(msgArray[0]); // [2] Corregido: Tomar el primer índice del arreglo devuelto
      }
    });

    return () => unsubscribe();
  }, [groupId]);

  const handleSendChatMessage = async () => {
    if (!chatText.trim() || !groupId || sendingChat) return;

    try {
      setSendingChat(true);
      await chatService.sendMessage(
        groupId,
        {
          text: chatText,
          sender_name: user.name,
        },
        accessToken
      );
      setChatText('');
    } catch (err) {
      console.log('Error enviando mensaje desde detalle:', err);
    } finally {
      setSendingChat(false);
    }
  };

  const createSession = async () => {
    if (!sessionTitle.trim() || !groupId) return;
    await studyGroupService.createSession(groupId, { title: sessionTitle, date: new Date().toISOString() }, accessToken);
    setSessionTitle('');
    refetch();
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((n) => n[0]) // [3] Corregido: Extraer la primera letra de cada palabra
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <Screen scroll={false}>
      {/* KeyboardAvoidingView levanta toda la interfaz al abrir el teclado */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* ScrollView permite deslizar el contenido superior si el teclado ocupa espacio */}
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
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
                groupId: groupId,
            })
          }/>

          <View style={styles.tabs}>
            <Chip label="Chat" active />
            <Chip label="Recursos" />
            <Chip label="Miembros" />
          </View>

          <ErrorBanner message={error} />

          <View style={styles.messages}>
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
              <View style={styles.noMessagesContainer}>
                <AppText variant="caption" color={colors.muted}>
                  No hay mensajes aún
                </AppText>
              </View>
            )}
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
        </ScrollView>

        {/* El ChatBar se queda fuera de la ScrollView para permanecer fijo en la parte inferior */}
        <View style={styles.chatBar}>
          <IconButton icon={Paperclip} accessibilityLabel="Adjuntar" />
          <IconButton icon={Image} accessibilityLabel="Imagen" />
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
            onPress={handleSendChatMessage}
            accessibilityLabel="Enviar" 
          />
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.md, // Espacio para que el contenido no quede pegado al chatBar
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
  messages: {
    gap: spacing.md,
    marginVertical: spacing.sm,
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
  noMessagesContainer: {
    padding: spacing.md,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
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
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background, // Evita transparencias al subir
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