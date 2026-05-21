import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Search } from 'lucide-react-native';
import { colors, radius, shadows, spacing, typography } from '../theme/tokens';

export function Screen({ children, scroll = true, style, contentStyle }) {
  const content = <View style={[styles.content, contentStyle]}>{children}</View>;

  return (
    <SafeAreaView style={[styles.safeArea, style]} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

export function AppText({ children, variant = 'body', color = colors.text, style, numberOfLines }) {
  return (
    <Text numberOfLines={numberOfLines} style={[styles.text, styles[variant], { color }, style]}>
      {children}
    </Text>
  );
}

export function Button({ title, onPress, variant = 'primary', loading, disabled, icon: Icon }) {
  const isPrimary = variant === 'primary';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.button,
        isPrimary ? styles.primaryButton : styles.secondaryButton,
        (disabled || loading) && styles.disabled,
        pressed && !disabled ? styles.pressed : null,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? colors.inverseText : colors.primary} />
      ) : (
        <>
          {Icon ? <Icon size={18} color={isPrimary ? colors.inverseText : colors.primary} /> : null}
          <AppText
            variant="body"
            color={isPrimary ? colors.inverseText : colors.primary}
            style={styles.buttonLabel}
          >
            {title}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

export function IconButton({ icon: Icon, onPress, accessibilityLabel, active }) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        active ? styles.activeIconButton : null,
        pressed ? styles.pressed : null,
      ]}
    >
      <Icon size={20} color={active ? colors.inverseText : colors.primary} strokeWidth={2.2} />
    </Pressable>
  );
}

export function Input({ label, leftIcon: Icon, style, ...props }) {
  return (
    <View style={styles.inputGroup}>
      {label ? <AppText variant="label">{label}</AppText> : null}
      <View style={[styles.inputShell, style]}>
        {Icon ? <Icon size={18} color={colors.muted} /> : null}
        <TextInput
          placeholderTextColor={colors.muted}
          style={styles.input}
          autoCapitalize="none"
          {...props}
        />
      </View>
    </View>
  );
}

export function SearchInput({ value, onChangeText, placeholder = 'Buscar...' }) {
  return (
    <View style={styles.searchShell}>
      <Search size={18} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={styles.searchInput}
      />
    </View>
  );
}

export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Chip({ label, active, tone = 'neutral', style }) {
  const toneStyle = tone === 'info' ? styles.infoChip : tone === 'success' ? styles.successChip : null;

  return (
    <View style={[styles.chip, toneStyle, active ? styles.activeChip : null, style]}>
      <AppText variant="caption" color={active ? colors.inverseText : colors.secondary}>
        {label}
      </AppText>
    </View>
  );
}

export function SectionHeader({ title, action, onAction }) {
  return (
    <View style={styles.sectionHeader}>
      <AppText variant="section">{title}</AppText>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <AppText variant="caption" color={colors.secondary}>
            {action}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

export function ErrorBanner({ message }) {
  if (!message) return null;

  return (
    <View style={styles.errorBanner}>
      <AppText variant="caption" color={colors.danger}>
        {message}
      </AppText>
    </View>
  );
}

export function EmptyState({ title, body }) {
  return (
    <View style={styles.empty}>
      <AppText variant="section">{title}</AppText>
      {body ? (
        <AppText variant="caption" color={colors.secondary} style={styles.emptyBody}>
          {body}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  text: {
    fontFamily: typography.family,
    letterSpacing: 0,
  },
  hero: {
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 34,
  },
  title: {
    fontSize: typography.sizes['2xl'],
    fontWeight: '800',
    lineHeight: 26,
  },
  section: {
    fontSize: typography.sizes.base,
    fontWeight: '800',
    lineHeight: 20,
  },
  body: {
    fontSize: typography.sizes.base,
    lineHeight: 21,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: '700',
    lineHeight: 18,
  },
  caption: {
    fontSize: typography.sizes.sm,
    lineHeight: 17,
  },
  button: {
    minHeight: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
  },
  primaryButton: {
    backgroundColor: colors.primary,
  },
  secondaryButton: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
  },
  buttonLabel: {
    fontWeight: '800',
  },
  disabled: {
    opacity: 0.55,
  },
  pressed: {
    opacity: 0.8,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeIconButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  inputGroup: {
    gap: spacing.xs,
  },
  inputShell: {
    minHeight: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: typography.sizes.base,
    fontFamily: typography.family,
    minWidth: 0,
  },
  searchShell: {
    minHeight: 44,
    borderRadius: radius.md,
    backgroundColor: colors.softBorder,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: typography.sizes.base,
    fontFamily: typography.family,
    minWidth: 0,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderColor: colors.softBorder,
    borderWidth: 1,
    padding: spacing.md,
    ...shadows.card,
  },
  chip: {
    minHeight: 32,
    paddingHorizontal: spacing.md,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.softBorder,
  },
  activeChip: {
    backgroundColor: colors.primary,
  },
  infoChip: {
    backgroundColor: colors.infoSoft,
  },
  successChip: {
    backgroundColor: colors.successSoft,
  },
  sectionHeader: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  errorBanner: {
    backgroundColor: colors.dangerSoft,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  empty: {
    minHeight: 120,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emptyBody: {
    marginTop: spacing.xs,
    textAlign: 'center',
  },
});
