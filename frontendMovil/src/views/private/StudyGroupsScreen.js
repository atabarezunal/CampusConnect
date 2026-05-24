import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Plus, SlidersHorizontal, UsersRound } from 'lucide-react-native';
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
import { studyGroupService } from '../../services/studyGroupService';
import { groups as fallbackGroups } from '../../services/mockData';
import { colors, radius, spacing } from '../../theme/tokens';

export function StudyGroupsScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const loadGroups = useCallback((token) => studyGroupService.list(token), []);
  const { data, error, isLoading } = useServiceData(loadGroups);
  const displayGroups = error ? fallbackGroups : data;
  const filteredGroups = useMemo(
    () =>
      displayGroups.filter((group) =>
        `${group.name || ''} ${group.id_subject || ''} ${group.description || ''}`
          .toLowerCase()
          .includes(query.toLowerCase())
      ),
    [displayGroups, query]
  );

  return (
    <Screen>
      <View style={styles.header}>
        <AppText variant="title">Grupos de Estudio</AppText>
        <IconButton
          icon={Plus}
          active
          accessibilityLabel="Crear grupo"
          onPress={() => navigation.navigate('CreateStudyGroup')}
        />
      </View>

      <View style={styles.searchRow}>
        <SearchInput value={query} onChangeText={setQuery} placeholder="Buscar grupos..." />
      </View>

      <ErrorBanner message={error} />

      {!filteredGroups.length && !isLoading ? (
        <EmptyState title="No hay grupos" body="Crea un grupo o revisa tus invitaciones." />
      ) : null}

      <View style={styles.list}>
        {filteredGroups.map((group) => (
          <Pressable
            key={group.id || group.groupId || group.name}
            onPress={() => navigation.navigate('StudyGroupDetail', { group })}
          >
            <Card style={styles.groupCard}>
              <View style={styles.groupIcon}>
                <UsersRound size={24} color={colors.primary} />
              </View>
              <View style={styles.groupCopy}>
                <AppText variant="section" numberOfLines={2}>
                  {group.name}
                </AppText>
                <AppText variant="caption" color={colors.secondary} numberOfLines={1}>
                  {group.id_subject || 'Materia'}
                </AppText>
                <AppText variant="caption" color={colors.muted} numberOfLines={2}>
                  {group.description || 'Grupo de estudio activo.'}
                </AppText>
                <View style={styles.metaRow}>
                  <AppText variant="caption" color={colors.secondary}>
                    12 miembros
                  </AppText>
                  <Chip label="Unido" tone="success" />
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
  searchRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  list: {
    gap: spacing.md,
    marginTop: spacing.md,
  },
  groupCard: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  groupIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.infoSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  groupCopy: {
    flex: 1,
    minWidth: 0,
    gap: spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
});
