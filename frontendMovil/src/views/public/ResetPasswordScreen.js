import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { ArrowLeft, Lock, Mail } from 'lucide-react-native';
import { AppText, Button, ErrorBanner, IconButton, Input, Screen } from '../../components/ui';
import { authService } from '../../services/authService';
import { colors, spacing } from '../../theme/tokens';

export function ResetPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const response = await authService.resetPassword({
        email,
        password,
        password_confirmation: confirmation,
      });
      setMessage(response?.message || 'Contrasena actualizada.');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen contentStyle={styles.container}>
      <View style={styles.header}>
        <IconButton icon={ArrowLeft} onPress={() => navigation.goBack()} />
        <View style={styles.headerCopy}>
          <AppText variant="title">Recuperar acceso</AppText>
          <AppText variant="caption" color={colors.secondary}>
            Actualiza tu contrasena
          </AppText>
        </View>
      </View>

      <View style={styles.form}>
        <ErrorBanner message={error} />
        {message ? (
          <View style={styles.success}>
            <AppText variant="caption" color={colors.success}>
              {message}
            </AppText>
          </View>
        ) : null}
        <Input
          label="Correo electronico"
          leftIcon={Mail}
          value={email}
          onChangeText={setEmail}
          placeholder="estudiante@universidad.edu"
          keyboardType="email-address"
        />
        <Input
          label="Nueva contrasena"
          leftIcon={Lock}
          value={password}
          onChangeText={setPassword}
          placeholder="Minimo 6 caracteres"
          secureTextEntry
        />
        <Input
          label="Confirmar contrasena"
          leftIcon={Lock}
          value={confirmation}
          onChangeText={setConfirmation}
          placeholder="Repite tu contrasena"
          secureTextEntry
        />
        <Button title="Guardar contrasena" onPress={handleSubmit} loading={loading} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing['2xl'],
  },
  headerCopy: {
    flex: 1,
  },
  form: {
    gap: spacing.md,
  },
  success: {
    padding: spacing.md,
    borderRadius: 8,
    backgroundColor: colors.successSoft,
    borderColor: '#bbf7d0',
    borderWidth: 1,
  },
});
