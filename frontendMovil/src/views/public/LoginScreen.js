import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { BookOpen, Eye, GitBranch, Lock, Mail } from 'lucide-react-native';
import { AppText, Button, ErrorBanner, Input, Screen } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { colors, radius, spacing } from '../../theme/tokens';

export function LoginScreen({ navigation }) {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secure, setSecure] = useState(true);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);

    try {
      await signIn({ email, password });
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.logo}>
          <BookOpen size={34} color={colors.inverseText} />
        </View>
        <AppText variant="title" style={styles.center}>
          Bienvenido
        </AppText>
        <AppText color={colors.secondary} style={styles.subtitle}>
          Inicia sesion para continuar
        </AppText>

        <View style={styles.form}>
          <ErrorBanner message={error} />
          <Input
            label="Correo electronico"
            leftIcon={Mail}
            value={email}
            onChangeText={setEmail}
            placeholder="estudiante@universidad.edu"
            keyboardType="email-address"
          />
          <View>
            <Input
              label="Contrasena"
              leftIcon={Lock}
              value={password}
              onChangeText={setPassword}
              placeholder="********"
              secureTextEntry={secure}
            />
            <Pressable onPress={() => setSecure((value) => !value)} style={styles.eyeToggle}>
              <Eye size={18} color={colors.muted} />
            </Pressable>
          </View>
          <Pressable onPress={() => navigation.navigate('ResetPassword')} style={styles.forgot}>
            <AppText variant="caption" color={colors.secondary}>
              Olvidaste tu contrasena?
            </AppText>
          </Pressable>
          <Button title="Iniciar Sesion" onPress={handleSubmit} loading={loading} />
        </View>

        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <AppText variant="caption" color={colors.muted}>
            O continua con
          </AppText>
          <View style={styles.divider} />
        </View>

        <View style={styles.socialRow}>
          <Pressable style={styles.socialButton}>
            <AppText variant="section" color={colors.info}>
              G
            </AppText>
            <AppText variant="caption">Google</AppText>
          </Pressable>
          <Pressable style={styles.socialButton}>
            <GitBranch size={18} color={colors.primary} />
            <AppText variant="caption">GitHub</AppText>
          </Pressable>
        </View>

        <View style={styles.footer}>
          <AppText variant="caption" color={colors.secondary}>
            No tienes cuenta?
          </AppText>
          <Pressable onPress={() => navigation.navigate('Register')}>
            <AppText variant="caption" color={colors.primary} style={styles.footerLink}>
              Registrate
            </AppText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  center: {
    textAlign: 'center',
  },
  subtitle: {
    textAlign: 'center',
    marginTop: spacing.xs,
    marginBottom: spacing['2xl'],
  },
  form: {
    gap: spacing.md,
  },
  forgot: {
    alignItems: 'flex-end',
  },
  eyeToggle: {
    position: 'absolute',
    right: spacing.md,
    bottom: 12,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginVertical: spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border,
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialButton: {
    minHeight: 44,
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
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
