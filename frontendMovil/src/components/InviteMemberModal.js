import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { UserPlus, X } from 'lucide-react-native';
import { AppText, Card, IconButton } from './ui';
import { studyGroupService } from '../services/studyGroupService';
import { colors, radius, spacing, typography } from '../theme/tokens';

export function InviteMemberModal({ visible, groupId, accessToken, onClose }) {
  const [query,      setQuery]      = useState('');
  const [results,    setResults]    = useState([]);
  const [searching,  setSearching]  = useState(false);
  const [invitedIds, setInvitedIds] = useState(new Set());
  const [inviting,   setInviting]   = useState(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!visible) { setQuery(''); setResults([]); setInvitedIds(new Set()); }
  }, [visible]);

  const handleChangeText = useCallback((text) => {
    setQuery(text);
    clearTimeout(debounceRef.current);
    if (text.trim().length < 2) return setResults([]);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await studyGroupService.searchUsers(text.trim(), accessToken);
        setResults(data ?? []);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 400);
  }, [accessToken]);

  const handleInvite = async (targetUser) => {
    if (invitedIds.has(targetUser.id) || inviting) return;
    setInviting(targetUser.id);
    try {
      await studyGroupService.inviteUser(
        { groupId, invitedUserId: targetUser.id },
        accessToken
      );
      setInvitedIds((prev) => new Set([...prev, targetUser.id]));
    } catch (e) {
      console.warn('Error invitando:', e);
    } finally { setInviting(null); }
  };

  const getInitials = (name = '') =>
    (name || '??').split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* ── KeyboardAvoidingView wrapping todo el modal ── */}
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <Pressable style={styles.overlay} onPress={() => { Keyboard.dismiss(); onClose(); }}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>

            <View style={styles.handle} />

            <View style={styles.header}>
              <AppText variant="section">Invitar miembro</AppText>
              <IconButton icon={X} onPress={onClose} accessibilityLabel="Cerrar" />
            </View>

            {/* Búsqueda */}
            <View style={styles.searchRow}>
              <TextInput
                value={query}
                onChangeText={handleChangeText}
                placeholder="Buscar por nombre o correo…"
                placeholderTextColor={colors.muted}
                style={styles.searchInput}
                autoFocus
                autoCapitalize="none"
                returnKeyType="search"
              />
              {searching && <ActivityIndicator size="small" color={colors.primary} style={styles.spinner} />}
            </View>

            {/* Resultados en ScrollView para que no queden tapados */}
            <ScrollView
              style={styles.resultScroll}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {results.map((u) => {
                const alreadyInvited = invitedIds.has(u.id);
                const isInviting     = inviting === u.id;
                return (
                  <Card key={u.id} style={styles.resultRow}>
                    <View style={styles.avatar}>
                      <AppText variant="caption">{getInitials(u.name)}</AppText>
                    </View>
                    <View style={styles.userInfo}>
                      <AppText variant="section">{u.name}</AppText>
                      <AppText variant="caption" color={colors.muted}>{u.email}</AppText>
                    </View>
                    {alreadyInvited ? (
                      <View style={styles.sentBadge}>
                        <AppText variant="caption" color="#10B981">Enviada</AppText>
                      </View>
                    ) : (
                      <Pressable
                        onPress={() => handleInvite(u)}
                        disabled={!!inviting}
                        style={[styles.inviteBtn, !!inviting && styles.inviteBtnDisabled]}
                      >
                        {isInviting
                          ? <ActivityIndicator size="small" color="#fff" />
                          : <UserPlus size={16} color="#fff" />
                        }
                      </Pressable>
                    )}
                  </Card>
                );
              })}
              {query.trim().length >= 2 && !searching && results.length === 0 && (
                <View style={styles.emptyBox}>
                  <AppText variant="caption" color={colors.muted}>Sin resultados para "{query}"</AppText>
                </View>
              )}
              {query.trim().length < 2 && (
                <AppText variant="caption" color={colors.muted} style={styles.hint}>
                  Escribe al menos 2 caracteres para buscar
                </AppText>
              )}
            </ScrollView>

          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
    paddingBottom: spacing.xl,
    gap: spacing.md,
    maxHeight: '80%',          // nunca cubre toda la pantalla
  },
  handle: {
    width: 40, height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
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
  spinner: { marginLeft: spacing.sm },
  resultScroll: { flexGrow: 0 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.sm },
  avatar: {
    width: 40, height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.infoSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  userInfo: { flex: 1, gap: 2 },
  inviteBtn: {
    width: 36, height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center',
  },
  inviteBtnDisabled: { opacity: 0.5 },
  sentBadge: {
    paddingHorizontal: spacing.sm, paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1, borderColor: '#10B981',
  },
  emptyBox: { padding: spacing.md, alignItems: 'center' },
  hint: { textAlign: 'center', marginTop: spacing.sm },
});