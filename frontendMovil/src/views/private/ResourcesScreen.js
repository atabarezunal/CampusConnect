import React, { useCallback, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ArrowLeft, FileText, Link, Upload } from 'lucide-react-native';
import {
  AppText,
  Card,
  Chip,
  ErrorBanner,
  IconButton,
  Screen,
  SearchInput,
} from '../../components/ui';
import { useServiceData } from '../../hooks/useServiceData';
import { resourceService } from '../../services/resourceService';
import { colors, radius, spacing } from '../../theme/tokens';

const typeColors = {
  PDF: colors.dangerSoft,
  DOC: colors.infoSoft,
  PNG: colors.softBorder,
  Link: colors.successSoft,
};

export function ResourcesScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const loadResources = useCallback(() => resourceService.list(), []);
  const { data, error } = useServiceData(loadResources);
  const resources = useMemo(
    () =>
      data.filter((resource) =>
        `${resource.title} ${resource.type}`.toLowerCase().includes(query.toLowerCase())
      ),
    [data, query]
  );

  return (
    <Screen>
      <View style={styles.header}>
        <IconButton icon={ArrowLeft} onPress={() => navigation.goBack()} accessibilityLabel="Volver" />
        <AppText variant="title" style={styles.headerTitle}>
          Recursos
        </AppText>
        <IconButton icon={Upload} active accessibilityLabel="Subir recurso" />
      </View>

      <SearchInput value={query} onChangeText={setQuery} placeholder="Buscar recursos..." />

      <View style={styles.filterRow}>
        <Chip label="Todos" active />
        <Chip label="PDF" />
        <Chip label="Docs" />
        <Chip label="Links" />
      </View>

      <ErrorBanner message={error} />

      <View style={styles.grid}>
        {resources.map((resource) => {
          const Icon = resource.type === 'Link' ? Link : FileText;
          return (
            <Pressable key={resource.id} style={styles.resourcePressable}>
              <Card style={styles.resourceCard}>
                <View style={[styles.resourceIcon, { backgroundColor: typeColors[resource.type] || colors.softBorder }]}>
                  <Icon size={28} color={resource.type === 'PDF' ? colors.danger : colors.primary} />
                </View>
                <AppText variant="section" numberOfLines={2}>
                  {resource.title}
                </AppText>
                <View style={styles.resourceMeta}>
                  <AppText variant="caption" color={colors.muted}>
                    {resource.size}
                  </AppText>
                  <Chip label={resource.type} tone={resource.type === 'Link' ? 'success' : 'info'} />
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
    gap: spacing.md,
    marginBottom: spacing.lg,
  },
  headerTitle: {
    flex: 1,
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginVertical: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  resourcePressable: {
    width: '47.5%',
  },
  resourceCard: {
    minHeight: 166,
    gap: spacing.md,
  },
  resourceIcon: {
    width: '100%',
    aspectRatio: 1.35,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resourceMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
