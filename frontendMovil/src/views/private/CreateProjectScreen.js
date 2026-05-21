import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ArrowLeft, FileText, FolderKanban, X } from 'lucide-react-native';
import { AppText, Button, ErrorBanner, IconButton, Input, Screen } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { projectService } from '../../services/projectService';
import { spacing } from '../../theme/tokens';

export function CreateProjectScreen({ navigation }) {
  const { accessToken } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      await projectService.create({ title, description }, accessToken);
      navigation.goBack();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <IconButton icon={X} onPress={() => navigation.goBack()} accessibilityLabel="Cerrar" />
        <AppText variant="section" style={styles.headerTitle}>
          Crear Proyecto
        </AppText>
        <IconButton icon={ArrowLeft} onPress={() => navigation.goBack()} accessibilityLabel="Volver" />
      </View>

      <View style={styles.form}>
        <ErrorBanner message={error} />
        <Input
          label="Titulo"
          leftIcon={FolderKanban}
          value={title}
          onChangeText={setTitle}
          placeholder="Ej: App Movil Inventario"
          autoCapitalize="words"
        />
        <Input
          label="Descripcion"
          leftIcon={FileText}
          value={description}
          onChangeText={setDescription}
          placeholder="Objetivo del proyecto..."
          multiline
          style={styles.textArea}
        />
        <Button title="Crear Proyecto" onPress={handleSubmit} loading={loading} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  headerTitle: {
    flex: 1,
    textAlign: 'center',
  },
  form: {
    gap: spacing.md,
  },
  textArea: {
    minHeight: 110,
    alignItems: 'flex-start',
    paddingTop: spacing.sm,
  },
});
