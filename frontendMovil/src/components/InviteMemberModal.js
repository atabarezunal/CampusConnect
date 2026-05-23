import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { UserPlus, X } from 'lucide-react-native';
import { AppText, Card, IconButton } from '../components/ui';
// Servicios y tema
import { studyGroupService } from '../services/studyGroupService';
import { colors, radius, spacing, typography } from '../theme/tokens';

export function InviteMemberModal({ visible, groupId, accessToken, onClose }) {
  const [query,       setQuery]       = useState('');
  const [results,     setResults]     = useState([]);
  const [searching,   setSearching]   = useState(false);
  const [invitedIds,  setInvitedIds]  = useState(new Set());
  const [inviting,    setInviting]    = useState(null); // userId en proceso
  const debounceRef = useRef(null);

  // Limpiar al cerrar
  useEffect(() => {
    if (!visible) {
      setQuery('');
      setResults([]);
      setInvitedIds(new Set());
    }
  }, [visible]);

  // Búsqueda con debounce de 400ms
  const handleChangeText = useCallback((text) => {
    setQuery(text);
    clearTimeout(debounceRef.current);

    if (text.trim().length < 2) {
      setResults([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const data = await studyGroupService.searchUsers(text.trim(), accessToken);
        setResults(data ?? []);
      } catch (e) {
        console.warn('Error buscando usuarios:', e);
        setResults([]);
      } finally {
        setSearching(false);
      }
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
      console.warn('Error invitando usuario:', e);
    } finally {
      setInviting(null);
    }
  };

  const getInitials = (name = '') =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      {/* Overlay: toca fuera para cerrar */}
      <Pressable style={styles.overlay} onPress={() => { Keyboard.dismiss(); onClose(); }}>
        {/* El Card detiene la propagación para no cerrar al tocar dentro */}
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>

          {/* Header */}
          <View style={styles.header}>
            <AppText variant="section">Invitar miembro</AppText>
            <IconButton icon={X} onPress={onClose} accessibilityLabel="Cerrar" />
          </View>

          {/* Barra de búsqueda */}
          <View style={styles.searchRow}>
            <TextInput
              value={query}
              onChangeText={handleChangeText}
              placeholder="Buscar por nombre o correo…"
              placeholderTextColor={colors.muted}
              style={styles.searchInput}
              autoFocus
              autoCapitalize="none"
            />
            {searching && (
              <ActivityIndicator
                size="small"
                color={colors.primary}
                style={styles.spinner}
              />
            )}
          </View>

          {/* Sugerencias */}
          {results.length === 0 && query.trim().length >= 2 && !searching ? (
            <View style={styles.emptyBox}>
              <AppText variant="caption" color={colors.muted}>
                Sin resultados para "{query}"
              </AppText>
            </View>
          ) : (
            <View style={styles.resultList}>
              {results.map((u) => {
                const alreadyInvited = invitedIds.has(u.id);
                const isInviting     = inviting === u.id;

                return (
                  <Card key={u.id} style={styles.resultRow}>
                    {/* Avatar */}
                    <View style={styles.avatar}>
                      <AppText variant="caption">{getInitials(u.name)}</AppText>
                    </View>

                    {/* Info */}
                    <View style={styles.userInfo}>
                      <AppText variant="section">{u.name}</AppText>
                      <AppText variant="caption" color={colors.muted}>{u.email}</AppText>
                    </View>

                    {/* Botón invitar */}
                    {alreadyInvited ? (
                      <View style={styles.invitedBadge}>
                        <AppText variant="caption" color={colors.success ?? '#10B981'}>
                          Enviada
                        </AppText>
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
            </View>
          )}

          {/* Hint inicial */}
          {query.trim().length < 2 && (
            <AppText variant="caption" color={colors.muted} style={styles.hint}>
              Escribe al menos 2 caracteres para buscar
            </AppText>
          )}

        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
    // Altura mínima para que no se vea muy pequeño con pocos resultados
    minHeight: 300,
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
  spinner: {
    marginLeft: spacing.sm,
  },
  resultList: {
    gap: spacing.sm,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.infoSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    flex: 1,
    gap: 2,
  },
  inviteBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inviteBtnDisabled: {
    opacity: 0.5,
  },
  invitedBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.success ?? '#10B981',
  },
  emptyBox: {
    padding: spacing.md,
    alignItems: 'center',
  },
  hint: {
    textAlign: 'center',
    marginTop: spacing.sm,
  },
});