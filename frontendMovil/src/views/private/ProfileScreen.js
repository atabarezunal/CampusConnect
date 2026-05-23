import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Bell,
  Camera,
  ChevronRight,
  GraduationCap,
  LogOut,
  Plus,
  Settings,
  Trash2,
  X,
} from 'lucide-react-native';
import {
  AppText,
  Button,
  Card,
  EmptyState,
  ErrorBanner,
  IconButton,
  Screen,
} from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { useServiceData } from '../../hooks/useServiceData';
import { userService } from '../../services/userService';
import { studyGroupService } from '../../services/studyGroupService';
import { projectService } from '../../services/projectService';
import { colors, radius, spacing, typography } from '../../theme/tokens';

const AVATAR_KEY = 'user_avatar_uri';

// ─────────────────────────────────────────────────────────────────────────────

export function ProfileScreen({ navigation }) {
  const { user, accessToken, signOut } = useAuth();

  // ── Avatar ────────────────────────────────────────────────────────────────
  const [avatarUri, setAvatarUri] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem(AVATAR_KEY).then((uri) => {
      if (uri) setAvatarUri(uri);
    });
  }, []);

  const handlePickAvatar = () => {
    Alert.alert('Foto de perfil', 'Elige una opción', [
      {
        text: 'Cámara',
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (!perm.granted) return Alert.alert('Permiso denegado');
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          if (!result.canceled) {
            const uri = result.assets[0].uri;
            setAvatarUri(uri);
            await AsyncStorage.setItem(AVATAR_KEY, uri);
          }
        },
      },
      {
        text: 'Galería',
        onPress: async () => {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) return Alert.alert('Permiso denegado');
          const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.7,
          });
          if (!result.canceled) {
            const uri = result.assets[0].uri;
            setAvatarUri(uri);
            await AsyncStorage.setItem(AVATAR_KEY, uri);
          }
        },
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  };

  // ── Perfil ────────────────────────────────────────────────────────────────
  const loadProfile = useCallback(
    (token) => (user?.id ? userService.getProfile(user.id, token) : null),
    [user?.id]
  );
  const { data: profileData, error: profileError, refetch: refetchProfile } =
    useServiceData(loadProfile, [user?.id]);
  const profile = Array.isArray(profileData) ? profileData[0] : profileData;

  // ── Skills del usuario ────────────────────────────────────────────────────
  const loadSkills = useCallback(
    (token) => (user?.id ? userService.getUserSkills(user.id, token) : []),
    [user?.id]
  );
  const { data: userSkills, refetch: refetchSkills } = useServiceData(loadSkills, [user?.id]);

  // ── Stats reales ──────────────────────────────────────────────────────────
  const loadGroups   = useCallback((token) => studyGroupService.list(token), []);
  const loadProjects = useCallback((token) => projectService.list(token), []);
  const { data: groups }   = useServiceData(loadGroups);
  const { data: projects } = useServiceData(loadProjects);

  // ── Modales ───────────────────────────────────────────────────────────────
  const [careerModalVisible,   setCareerModalVisible]   = useState(false);
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  // ─────────────────────────────────────────────────────────────────────────
  const handleNotifications = () => navigation.navigate('Notifications');

  const handleDeleteAccount = () => {
    Alert.alert(
      'Eliminar cuenta',
      'Esta acción es irreversible. ¿Deseas continuar?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.deleteAccount(accessToken);
              signOut();
            } catch (e) {
              Alert.alert('Error', e.message);
            }
          },
        },
      ]
    );
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <Screen>
      {/* Top bar */}
      <View style={styles.settingsRow}>
        <View />
        <IconButton
          icon={Settings}
          onPress={() => setSettingsModalVisible(true)}
          accessibilityLabel="Configuración"
        />
      </View>

      {/* Avatar */}
      <View style={styles.profileHead}>
        <Pressable onPress={handlePickAvatar} style={styles.avatarWrap}>
          {avatarUri ? (
            // eslint-disable-next-line react-native/no-inline-styles
            <View style={[styles.avatar, { overflow: 'hidden' }]}>
              {/* expo-image or Image */}
              <AvatarImage uri={avatarUri} initials={getInitials(user?.name)} />
            </View>
          ) : (
            <View style={styles.avatar}>
              <AppText variant="title">{getInitials(user?.name)}</AppText>
            </View>
          )}
          <View style={styles.cameraBadge}>
            <Camera size={14} color={colors.inverseText ?? '#fff'} />
          </View>
        </Pressable>

        <AppText variant="title" style={styles.center}>{user?.name ?? 'Campus Connect'}</AppText>
        <AppText variant="caption" color={colors.secondary} style={styles.center}>
          {user?.email ?? 'estudiante@universidad.edu'}
        </AppText>
      </View>

      {/* Stats reales */}
      <View style={styles.stats}>
        <Stat value={String(groups?.length ?? 0)}   label="Grupos"    />
        <Stat value={String(projects?.length ?? 0)} label="Proyectos" />
        <Stat value="0"                              label="Recursos"  />
      </View>

      <ErrorBanner message={profileError} />

      {/* Carrera */}
      {profile ? (
        <Pressable onPress={() => setCareerModalVisible(true)}>
          <Card style={styles.profileCard}>
            <GraduationCap size={20} color={colors.primary} />
            <View style={styles.profileCopy}>
              <AppText variant="section">Carrera</AppText>
              <AppText variant="caption" color={colors.secondary}>
                {profile.career} · Semestre {profile.semester}
              </AppText>
              {userSkills?.length > 0 && (
                <View style={styles.skillsRow}>
                  {userSkills.slice(0, 3).map((us, i) => (
                    <View key={i} style={styles.skillBadge}>
                      <AppText variant="caption" color={colors.primary}>
                        {us.skill?.name ?? us.skill}
                      </AppText>
                    </View>
                  ))}
                  {userSkills.length > 3 && (
                    <AppText variant="caption" color={colors.muted}>
                      +{userSkills.length - 3}
                    </AppText>
                  )}
                </View>
              )}
            </View>
            <ChevronRight size={18} color={colors.muted} />
          </Card>
        </Pressable>
      ) : (
        <Pressable onPress={() => setCareerModalVisible(true)}>
          <EmptyState
            title="Perfil académico"
            body="Toca aquí para completar tu carrera y semestre."
          />
        </Pressable>
      )}

      {/* Preferencias */}
      <AppText variant="section" style={styles.section}>Preferencias</AppText>
      <Preference icon={Bell}     title="Notificaciones" onPress={handleNotifications} />
      <Preference icon={Settings} title="Privacidad"     onPress={() => {}} />

      {/* Logout */}
      <View style={styles.logout}>
        <Button title="Cerrar Sesión" icon={LogOut} variant="secondary" onPress={signOut} />
      </View>

      {/* ── Modal carrera + skills ────────────────────────────────────────── */}
      <CareerModal
        visible={careerModalVisible}
        profile={profile}
        userSkills={userSkills ?? []}
        userId={user?.id}
        accessToken={accessToken}
        onClose={() => setCareerModalVisible(false)}
        onSaved={() => { refetchProfile(); refetchSkills(); }}
      />

      {/* ── Modal configuración ───────────────────────────────────────────── */}
      <SettingsModal
        visible={settingsModalVisible}
        onClose={() => setSettingsModalVisible(false)}
        onLogout={signOut}
        onDeleteAccount={handleDeleteAccount}
      />
    </Screen>
  );
}

// ─── Avatar con imagen ────────────────────────────────────────────────────────
function AvatarImage({ uri, initials }) {
  const [error, setError] = useState(false);
  if (error) {
    return <AppText variant="title">{initials}</AppText>;
  }
  // React Native Image
  const { Image } = require('react-native');
  return (
    <Image
      source={{ uri }}
      style={{ width: 82, height: 82, borderRadius: 41 }}
      onError={() => setError(true)}
    />
  );
}

// ─── Modal carrera ────────────────────────────────────────────────────────────
function CareerModal({ visible, profile, userSkills, userId, accessToken, onClose, onSaved }) {
  const [semester,    setSemester]    = useState('');
  const [saving,      setSaving]      = useState(false);

  // Skills
  const [allSkills,   setAllSkills]   = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [experience,  setExperience]  = useState('1');
  const [assigning,   setAssigning]   = useState(false);
  const [creatingSkill, setCreatingSkill] = useState(false);
  const [selectedSkill, setSelectedSkill] = useState(null);

  useEffect(() => {
    if (!visible) return;
    setSemester(String(profile?.semester ?? ''));
    // Cargar todas las skills disponibles
    userService.getSkills(accessToken)
      .then(setAllSkills)
      .catch(() => {});
  }, [visible, profile, accessToken]);

  const handleSaveSemester = async () => {
    if (!semester.trim() || !userId) return;
    setSaving(true);
    try {
      await userService.updateProfile(userId, { semester: parseInt(semester) }, accessToken);
      onSaved();
      Alert.alert('¡Listo!', 'Semestre actualizado.');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateSkill = async () => {
    if (!newSkillName.trim()) return;
    setCreatingSkill(true);
    try {
      const created = await userService.createSkill({ name: newSkillName.trim() }, accessToken);
      setAllSkills((prev) => [...prev, created]);
      setSelectedSkill(created);
      setNewSkillName('');
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setCreatingSkill(false);
    }
  };

  const handleAssignSkill = async () => {
    if (!selectedSkill || !profile?.profile_id) return;
    setAssigning(true);
    try {
      await userService.assignSkill({
        profile_id: profile.profile_id,
        skill_id:   selectedSkill.id_skill,
        experience: parseInt(experience) || 1,
      }, accessToken);
      onSaved();
      setSelectedSkill(null);
      Alert.alert('¡Listo!', `Skill "${selectedSkill.name}" añadida.`);
    } catch (e) {
      Alert.alert('Error', e.message);
    } finally {
      setAssigning(false);
    }
  };

  const assignedIds = new Set(userSkills.map((us) => us.skill?.id_skill ?? us.skill?.id));
  const availableSkills = allSkills.filter((s) => !assignedIds.has(s.id_skill));

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={mStyles.overlay} onPress={onClose}>
        <Pressable style={mStyles.sheet} onPress={(e) => e.stopPropagation()}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={mStyles.header}>
              <AppText variant="section">Perfil académico</AppText>
              <IconButton icon={X} onPress={onClose} accessibilityLabel="Cerrar" />
            </View>

            {/* Semestre */}
            <AppText variant="caption" color={colors.secondary} style={mStyles.label}>
              Semestre actual
            </AppText>
            <View style={mStyles.row}>
              <TextInput
                value={semester}
                onChangeText={setSemester}
                placeholder="Ej: 5"
                placeholderTextColor={colors.muted}
                keyboardType="number-pad"
                style={mStyles.input}
              />
              <Pressable
                onPress={handleSaveSemester}
                disabled={saving}
                style={mStyles.saveBtn}
              >
                {saving
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <AppText variant="caption" color="#fff">Guardar</AppText>
                }
              </Pressable>
            </View>

            {/* Skills asignadas */}
            <AppText variant="caption" color={colors.secondary} style={mStyles.label}>
              Mis skills
            </AppText>
            {userSkills.length === 0 ? (
              <AppText variant="caption" color={colors.muted} style={mStyles.hint}>
                Aún no tienes skills asignadas
              </AppText>
            ) : (
              <View style={mStyles.skillsWrap}>
                {userSkills.map((us, i) => (
                  <View key={i} style={mStyles.skillChip}>
                    <AppText variant="caption" color={colors.primary}>
                      {us.skill?.name ?? us.skill}
                    </AppText>
                    <AppText variant="caption" color={colors.muted}>
                      {' '}· Exp {us.experience}
                    </AppText>
                  </View>
                ))}
              </View>
            )}

            {/* Añadir skill existente */}
            <AppText variant="caption" color={colors.secondary} style={mStyles.label}>
              Añadir skill
            </AppText>
            {availableSkills.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={mStyles.scrollRow}>
                {availableSkills.map((s) => (
                  <Pressable
                    key={s.id_skill}
                    onPress={() => setSelectedSkill(s)}
                    style={[
                      mStyles.skillOption,
                      selectedSkill?.id_skill === s.id_skill && mStyles.skillOptionActive,
                    ]}
                  >
                    <AppText
                      variant="caption"
                      color={selectedSkill?.id_skill === s.id_skill ? '#fff' : colors.text}
                    >
                      {s.name}
                    </AppText>
                  </Pressable>
                ))}
              </ScrollView>
            ) : (
              <AppText variant="caption" color={colors.muted} style={mStyles.hint}>
                No hay más skills disponibles
              </AppText>
            )}

            {selectedSkill && (
              <View style={mStyles.row}>
                <TextInput
                  value={experience}
                  onChangeText={setExperience}
                  placeholder="Experiencia (años)"
                  placeholderTextColor={colors.muted}
                  keyboardType="number-pad"
                  style={[mStyles.input, { flex: 1 }]}
                />
                <Pressable
                  onPress={handleAssignSkill}
                  disabled={assigning}
                  style={mStyles.saveBtn}
                >
                  {assigning
                    ? <ActivityIndicator size="small" color="#fff" />
                    : <AppText variant="caption" color="#fff">Añadir</AppText>
                  }
                </Pressable>
              </View>
            )}

            {/* Crear skill nueva */}
            <AppText variant="caption" color={colors.secondary} style={mStyles.label}>
              Crear nueva skill
            </AppText>
            <View style={mStyles.row}>
              <TextInput
                value={newSkillName}
                onChangeText={setNewSkillName}
                placeholder="Nombre de la skill..."
                placeholderTextColor={colors.muted}
                style={mStyles.input}
              />
              <Pressable
                onPress={handleCreateSkill}
                disabled={creatingSkill || !newSkillName.trim()}
                style={mStyles.saveBtn}
              >
                {creatingSkill
                  ? <ActivityIndicator size="small" color="#fff" />
                  : <Plus size={16} color="#fff" />
                }
              </Pressable>
            </View>

          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Modal configuración ──────────────────────────────────────────────────────
function SettingsModal({ visible, onClose, onLogout, onDeleteAccount }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={mStyles.overlay} onPress={onClose}>
        <Pressable style={mStyles.settingsSheet} onPress={(e) => e.stopPropagation()}>
          <View style={mStyles.header}>
            <AppText variant="section">Configuración</AppText>
            <IconButton icon={X} onPress={onClose} accessibilityLabel="Cerrar" />
          </View>

          <Pressable
            onPress={() => { onClose(); setTimeout(onLogout, 300); }}
            style={mStyles.settingsOption}
          >
            <LogOut size={20} color={colors.text} />
            <AppText variant="section">Cerrar sesión</AppText>
          </Pressable>

          <View style={mStyles.divider} />

          <Pressable
            onPress={() => { onClose(); setTimeout(onDeleteAccount, 300); }}
            style={mStyles.settingsOption}
          >
            <Trash2 size={20} color="#EF4444" />
            <AppText variant="section" color="#EF4444">Eliminar cuenta</AppText>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────
function Stat({ value, label }) {
  return (
    <View style={styles.stat}>
      <AppText variant="title">{value}</AppText>
      <AppText variant="caption" color={colors.secondary}>{label}</AppText>
    </View>
  );
}

function Preference({ icon: Icon, title, onPress }) {
  return (
    <Pressable onPress={onPress}>
      <Card style={styles.preference}>
        <View style={styles.preferenceIcon}>
          <Icon size={18} color={colors.primary} />
        </View>
        <AppText variant="section" style={styles.preferenceTitle}>{title}</AppText>
        <ChevronRight size={18} color={colors.muted} />
      </Card>
    </Pressable>
  );
}

function getInitials(name = 'Campus Connect') {
  return name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
}

// ─── Estilos pantalla ─────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  profileHead: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatarWrap: {
    marginBottom: spacing.md,
    position: 'relative',
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: radius.full,
    backgroundColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraBadge: {
    position: 'absolute',
    right: 2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  center: { textAlign: 'center' },
  stats: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing['2xl'],
    marginBottom: spacing.xl,
  },
  stat: { alignItems: 'center' },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  profileCopy: { flex: 1, minWidth: 0, gap: spacing.xs },
  skillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  skillBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.full,
    backgroundColor: colors.infoSoft,
  },
  section: {
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  preference: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  preferenceIcon: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.softBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  preferenceTitle: { flex: 1 },
  logout: { marginTop: spacing.lg },
});

// ─── Estilos modales ──────────────────────────────────────────────────────────
const mStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    maxHeight: '85%',
  },
  settingsSheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  label: {
    marginBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  hint: {
    textAlign: 'center',
    paddingVertical: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: colors.softBorder,
    paddingHorizontal: spacing.md,
    color: colors.text,
    fontFamily: typography.family,
  },
  saveBtn: {
    height: 44,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skillsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  skillChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.infoSoft,
  },
  scrollRow: { marginBottom: spacing.sm },
  skillOption: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.softBorder,
    marginRight: spacing.sm,
  },
  skillOptionActive: {
    backgroundColor: colors.primary,
  },
  settingsOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
});