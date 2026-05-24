import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  StyleSheet,
  View,
  ActivityIndicator,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker    from 'expo-image-picker';
import {
  ArrowLeft, FileText, Image, Link, Upload,
} from 'lucide-react-native';
import {
  AppText, Card, Chip, ErrorBanner, IconButton, Screen, SearchInput,
} from '../../components/ui';
import { useAuth }         from '../../hooks/useAuth';
import { resourceService } from '../../services/resourceService';
import { colors, radius, spacing } from '../../theme/tokens';

const TYPE_COLORS = {
  PDF:   colors.dangerSoft  ?? '#FEE2E2',
  DOC:   colors.infoSoft    ?? '#DBEAFE',
  PNG:   colors.softBorder  ?? '#F1F5F9',
  IMG:   colors.mintSoft    ?? '#D1FAE5',
  FILE:  colors.softBorder  ?? '#F1F5F9',
  VIDEO: colors.warningSoft ?? '#FEF3C7',
};

const FILTERS = ['Todos', 'PDF', 'DOC', 'IMG'];

export function ResourcesScreen({ navigation }) {
  const { user } = useAuth();
  const [query,        setQuery]        = useState('');
  const [activeFilter, setActiveFilter] = useState('Todos');
  const [resources,    setResources]    = useState([]);
  const [uploading,    setUploading]    = useState(false);
  const [uploadPct,    setUploadPct]    = useState(0);
  const [error,        setError]        = useState(null);

  // Suscripción en tiempo real
  useEffect(() => {
    // Si no hay usuario cargado aún, no intentamos hacer la suscripción
    if (!user?.id) return; 

    // Pasamos el user.id al servicio
    const unsub = resourceService.subscribe(user.id, (items) => setResources(items));
    
    return () => unsub();
  }, [user?.id]);

  const filtered = useMemo(() => resources.filter((r) => {
    const matchQuery  = `${r.title} ${r.type}`.toLowerCase().includes(query.toLowerCase());
    const matchFilter = activeFilter === 'Todos' || r.type === activeFilter;
    return matchQuery && matchFilter;
  }), [resources, query, activeFilter]);

  // ── Subir archivo ─────────────────────────────────────────────────────────
  const handleUpload = () => {
    Alert.alert('Subir recurso', 'Elige el tipo', [
      {
        text: 'Documento (PDF, DOC…)',
        onPress: async () => {
          const result = await DocumentPicker.getDocumentAsync({
            copyToCacheDirectory: true,
          });
          if (result.canceled) return;
          const file = result.assets[0];
          await doUpload(file.uri, file.name, file.size);
        },
      },
      {
        text: 'Imagen de galería',
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) return Alert.alert('Permiso denegado');
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            quality: 0.8,
          });
          if (result.canceled) return;
          const asset    = result.assets[0];
          const fileName = asset.uri.split('/').pop();
          await doUpload(asset.uri, fileName, asset.fileSize ?? 0);
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  const doUpload = async (uri, name, size) => {
    setUploading(true);
    setUploadPct(0);
    setError(null);
    try {
      await resourceService.upload(uri, name, size, user?.id, setUploadPct);
    } catch (e) {
      setError('Error al subir el archivo. Intenta de nuevo.');
      console.warn(e);
    } finally {
      setUploading(false);
      setUploadPct(0);
    }
  };

  const handleOpen = (resource) => {
    if (resource.url) Linking.openURL(resource.url);
  };

  const getIcon = (type) => {
    if (type === 'IMG')  return Image;
    if (type === 'Link') return Link;
    return FileText;
  };

  return (
    <Screen>
      {/* Header + búsqueda en una sola fila */}
      <View style={styles.header}>
        <IconButton
          icon={ArrowLeft}
          onPress={() => navigation.goBack()}
          accessibilityLabel="Volver"
        />
        <View style={styles.searchWrap}>
          <SearchInput
            value={query}
            onChangeText={setQuery}
            placeholder="Buscar recursos..."
          />
        </View>
        <IconButton
          icon={Upload}
          active
          onPress={handleUpload}
          accessibilityLabel="Subir recurso"
        />
      </View>

      {/* Filtros */}
      <View style={styles.filterRow}>
        {FILTERS.map((f) => (
          <Pressable key={f} onPress={() => setActiveFilter(f)}>
            <Chip label={f} active={activeFilter === f} />
          </Pressable>
        ))}
      </View>

      <ErrorBanner message={error} />

      {/* Barra de progreso de subida */}
      {uploading && (
        <View style={styles.uploadBanner}>
          <ActivityIndicator size="small" color={colors.primary} />
          <AppText variant="caption" color={colors.primary}>
            Subiendo… {uploadPct}%
          </AppText>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${uploadPct}%` }]} />
          </View>
        </View>
      )}

      {/* Grid */}
      {filtered.length === 0 && !uploading ? (
        <View style={styles.emptyBox}>
          <AppText variant="caption" color={colors.muted}>
            No hay recursos aún. Sube el primero.
          </AppText>
        </View>
      ) : (
        <View style={styles.grid}>
          {filtered.map((resource) => {
            const Icon = getIcon(resource.type);
            return (
              <Pressable
                key={resource.id}
                style={styles.resourcePressable}
                onPress={() => handleOpen(resource)}
              >
                <Card style={styles.resourceCard}>
                  <View style={[
                    styles.resourceIcon,
                    { backgroundColor: TYPE_COLORS[resource.type] ?? TYPE_COLORS.FILE }
                  ]}>
                    <Icon
                      size={28}
                      color={resource.type === 'PDF' ? '#EF4444' : colors.primary}
                    />
                  </View>
                  <AppText variant="section" numberOfLines={2}>
                    {resource.title}
                  </AppText>
                  <View style={styles.resourceMeta}>
                    <AppText variant="caption" color={colors.muted}>
                      {resource.size}
                    </AppText>
                    <Chip
                      label={resource.type}
                      tone={resource.type === 'PDF' ? 'danger' : 'info'}
                    />
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  searchWrap: {
    flex: 1,            
  },

  uploadBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.infoSoft ?? '#DBEAFE',
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  progressTrack: {
    flex: 1,
    height: 6,
    backgroundColor: colors.border,
    borderRadius: radius.full,
  },
  progressFill: {
    height: 6,
    backgroundColor: colors.primary,
    borderRadius: radius.full,
  },
  emptyBox: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
  },
  resourcePressable: { width: '47.5%' },
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