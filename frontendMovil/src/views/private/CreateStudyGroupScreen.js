import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ArrowLeft, BookOpen, Camera, Hash, X } from 'lucide-react-native';
import { AppText, Button, ErrorBanner, IconButton, Input, Screen } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { studyGroupService } from '../../services/studyGroupService';
import { colors, radius, spacing } from '../../theme/tokens';

export function CreateStudyGroupScreen({ navigation }) {
  const { accessToken } = useAuth();
  const [form, setForm] = useState({
    name: '',
    id_subject: '',
    description: '',
    max_members: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      await studyGroupService.create(
        {
          name: form.name,
          id_subject: form.id_subject,
          description: form.description,
          max_members: form.max_members ? Number(form.max_members) : undefined,
        },
        accessToken
      );
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
          Crear Grupo
        </AppText>
        <IconButton icon={ArrowLeft} onPress={() => navigation.goBack()} accessibilityLabel="Volver" />
      </View>

      <View style={styles.photoBox}>
        <Camera size={24} color={colors.muted} />
        <AppText variant="caption" color={colors.muted}>
          Agregar foto
        </AppText>
      </View>

      <View style={styles.form}>
        <ErrorBanner message={error} />
        <Input
          label="Nombre del grupo"
          leftIcon={BookOpen}
          value={form.name}
          onChangeText={(value) => update('name', value)}
          placeholder="Ej: Estudio Calculo III"
          autoCapitalize="words"
        />
        <Input
          label="Materia"
          leftIcon={Hash}
          value={form.id_subject}
          onChangeText={(value) => update('id_subject', value)}
          placeholder="Calculo Diferencial"
          autoCapitalize="words"
        />
        <Input
          label="Descripcion"
          value={form.description}
          onChangeText={(value) => update('description', value)}
          placeholder="Describe el objetivo del grupo..."
          multiline
          style={styles.textArea}
        />
        <Input
          label="Maximo de personas"
          value={form.max_members}
          onChangeText={(value) => update('max_members', value)}
          placeholder="12"
          keyboardType="number-pad"
        />
        <Button title="Crear Grupo" onPress={handleSubmit} loading={loading} />
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
  photoBox: {
    width: 96,
    height: 96,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  form: {
    gap: spacing.md,
  },
  textArea: {
    minHeight: 92,
    alignItems: 'flex-start',
    paddingTop: spacing.sm,
  },
});
