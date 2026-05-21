import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from './src/context/AuthContext';
import { AppNavigator } from './src/navigation/AppNavigator';
import { colors } from './src/theme/tokens';

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="dark" backgroundColor={colors.background} />
      <AppNavigator />
    </AuthProvider>
  );
}
