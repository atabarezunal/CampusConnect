import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  Bell,
  FolderKanban,
  Home,
  UserRound,
  UsersRound,
} from 'lucide-react-native';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useAuth } from '../hooks/useAuth';
import { colors, typography } from '../theme/tokens';
import { SplashScreen } from '../views/public/SplashScreen';
import { LoginScreen } from '../views/public/LoginScreen';
import { RegisterScreen } from '../views/public/RegisterScreen';
import { ResetPasswordScreen } from '../views/public/ResetPasswordScreen';
import { HomeScreen } from '../views/private/HomeScreen';
import { StudyGroupsScreen } from '../views/private/StudyGroupsScreen';
import { StudyGroupDetailScreen } from '../views/private/StudyGroupDetailScreen';
import { CreateStudyGroupScreen } from '../views/private/CreateStudyGroupScreen';
import { ProjectsScreen } from '../views/private/ProjectsScreen';
import { ProjectDetailScreen } from '../views/private/ProjectDetailScreen';
import { CreateProjectScreen } from '../views/private/CreateProjectScreen';
import { ResourcesScreen } from '../views/private/ResourcesScreen';
import { NotificationsScreen } from '../views/private/NotificationsScreen';
import { ProfileScreen } from '../views/private/ProfileScreen';

const RootStack = createNativeStackNavigator();
const PublicStack = createNativeStackNavigator();
const PrivateStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function PublicNavigator() {
  return (
    <PublicStack.Navigator screenOptions={{ headerShown: false }}>
      <PublicStack.Screen name="Splash" component={SplashScreen} />
      <PublicStack.Screen name="Login" component={LoginScreen} />
      <PublicStack.Screen name="Register" component={RegisterScreen} />
      <PublicStack.Screen name="ResetPassword" component={ResetPasswordScreen} />
    </PublicStack.Navigator>
  );
}

const tabIcon = (Icon) =>
  function IconRenderer({ color, size }) {
    return <Icon color={color} size={size} strokeWidth={2.2} />;
  };

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: styles.tabLabel,
        tabBarStyle: styles.tabBar,
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Inicio', tabBarIcon: tabIcon(Home) }}
      />
      <Tab.Screen
        name="StudyGroups"
        component={StudyGroupsScreen}
        options={{ title: 'Grupos', tabBarIcon: tabIcon(UsersRound) }}
      />
      <Tab.Screen
        name="Projects"
        component={ProjectsScreen}
        options={{ title: 'Proyectos', tabBarIcon: tabIcon(FolderKanban) }}
      />
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: 'Alertas', tabBarIcon: tabIcon(Bell) }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Perfil', tabBarIcon: tabIcon(UserRound) }}
      />
    </Tab.Navigator>
  );
}

function PrivateNavigator() {
  return (
    <PrivateStack.Navigator screenOptions={{ headerShown: false }}>
      <PrivateStack.Screen name="MainTabs" component={MainTabs} />
      <PrivateStack.Screen name="StudyGroupDetail" component={StudyGroupDetailScreen} />
      <PrivateStack.Screen name="CreateStudyGroup" component={CreateStudyGroupScreen} />
      <PrivateStack.Screen name="ProjectDetail" component={ProjectDetailScreen} />
      <PrivateStack.Screen name="CreateProject" component={CreateProjectScreen} />
      <PrivateStack.Screen name="Resources" component={ResourcesScreen} />
    </PrivateStack.Navigator>
  );
}

function BootScreen() {
  return (
    <View style={styles.boot}>
      <ActivityIndicator color={colors.primary} />
    </View>
  );
}

export function AppNavigator() {
  const { isAuthenticated, isBooting } = useAuth();

  if (isBooting) {
    return <BootScreen />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <RootStack.Screen name="Private" component={PrivateNavigator} />
        ) : (
          <RootStack.Screen name="Public" component={PublicNavigator} />
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  boot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  tabBar: {
    minHeight: 70,
    paddingTop: 8,
    paddingBottom: 10,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  tabLabel: {
    fontFamily: typography.family,
    fontSize: typography.sizes.xs,
    fontWeight: '700',
  },
});
