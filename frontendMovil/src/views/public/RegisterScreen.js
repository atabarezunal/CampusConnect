import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { ArrowLeft, GraduationCap, Lock, Mail, School, UserRound } from 'lucide-react-native';
import { AppText, Button, ErrorBanner, IconButton, Input, Screen } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { colors, spacing } from '../../theme/tokens';

export function RegisterScreen({ navigation }) {
  const { signUp, authError } = useAuth();
  const [form, setForm] = useState({
    name: '',
    email: '',
    university: '',
    career: '',
    semester: '',
    password: '',
    passwordConfirmation: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));

  const handleSubmit = async () => {
    setError(null);

    if (form.password !== form.passwordConfirmation) {
      setError('Las contrasenas no coinciden.');
      return;
    }

    setLoading(true);
    try {
      await signUp({
        name: form.name,
        email: form.email,
        password: form.password,
        profile: {
          university: form.university,
          career: form.career,
          semester: form.semester,
        },
      });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <IconButton icon={ArrowLeft} onPress={() => navigation.goBack()} />
          <View style={styles.headerCopy}>
            <AppText variant="title">Crear cuenta</AppText>
            <AppText variant="caption" color={colors.secondary}>
              Completa tu informacion
            </AppText>
          </View>
        </View>

        <View style={styles.progress}>
          <View style={styles.progressActive} />
          <View style={styles.progressActive} />
          <View style={styles.progressIdle} />
        </View>
        <AppText variant="caption" color={colors.secondary} style={styles.step}>
          Paso 2 de 3
        </AppText>

        <View style={styles.form}>
          <ErrorBanner message={error || authError} />
          <Input
            label="Nombre completo"
            leftIcon={UserRound}
            value={form.name}
            onChangeText={(value) => update('name', value)}
            placeholder="Juan Carlos Perez"
            autoCapitalize="words"
          />
          <Input
            label="Correo institucional"
            leftIcon={Mail}
            value={form.email}
            onChangeText={(value) => update('email', value)}
            placeholder="jperez@universidad.edu"
            keyboardType="email-address"
          />
          <Input
            label="Universidad"
            leftIcon={School}
            value={form.university}
            onChangeText={(value) => update('university', value)}
            placeholder="Universidad Nacional"
            autoCapitalize="words"
          />
          <Input
            label="Carrera"
            leftIcon={GraduationCap}
            value={form.career}
            onChangeText={(value) => update('career', value)}
            placeholder="Ing. Sistemas"
            autoCapitalize="words"
          />
          <Input
            label="Semestre"
            value={form.semester}
            onChangeText={(value) => update('semester', value)}
            placeholder="6"
            keyboardType="number-pad"
          />
          <Input
            label="Contrasena"
            leftIcon={Lock}
            value={form.password}
            onChangeText={(value) => update('password', value)}
            placeholder="Minimo 6 caracteres"
            secureTextEntry
          />
          <Input
            label="Confirmar contrasena"
            leftIcon={Lock}
            value={form.passwordConfirmation}
            onChangeText={(value) => update('passwordConfirmation', value)}
            placeholder="Repite tu contrasena"
            secureTextEntry
          />
          <Button title="Continuar" onPress={handleSubmit} loading={loading} />
        </View>

        <View style={styles.footer}>
          <AppText variant="caption" color={colors.secondary}>
            Ya tienes cuenta?
          </AppText>
          <Pressable onPress={() => navigation.navigate('Login')}>
            <AppText variant="caption" color={colors.primary} style={styles.footerLink}>
              Inicia sesion
            </AppText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
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
  headerCopy: {
    flex: 1,
  },
  progress: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  progressActive: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  progressIdle: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.border,
  },
  step: {
    marginBottom: spacing.lg,
  },
  form: {
    gap: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  footerLink: {
    fontWeight: '800',
  },
});
