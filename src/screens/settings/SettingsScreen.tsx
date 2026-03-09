import React from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Switch, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { toggleDarkMode, toggleHideBalances } from '../../store/slices/uiSlice';
import { logout } from '../../store/slices/authSlice';

interface SettingRowProps {
  icon: string;
  iconColor: string;
  label: string;
  sublabel?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  isDark: boolean;
}

function SettingRow({ icon, iconColor, label, sublabel, onPress, rightElement, isDark }: SettingRowProps) {
  const rowBg = isDark ? colors.bgCard : '#FFFFFF';
  const labelColor = isDark ? colors.textPrimary : '#1A1A2E';
  const subColor = isDark ? colors.textSecondary : '#666680';
  const borderColor = isDark ? colors.bgBorder : '#E8E8F0';

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: rowBg, borderBottomColor: borderColor }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[styles.rowIcon, { backgroundColor: iconColor + '20' }]}>
        <Ionicons name={icon as any} size={18} color={iconColor} />
      </View>
      <View style={styles.rowText}>
        <Text style={[styles.rowLabel, { color: labelColor }]}>{label}</Text>
        {sublabel && <Text style={[styles.rowSublabel, { color: subColor }]}>{sublabel}</Text>}
      </View>
      {rightElement ?? (
        onPress && <Ionicons name="chevron-forward" size={16} color={subColor} />
      )}
    </TouchableOpacity>
  );
}

function SectionHeader({ title, isDark }: { title: string; isDark: boolean }) {
  return (
    <Text style={[styles.sectionHeader, { color: isDark ? colors.textMuted : '#999' }]}>
      {title}
    </Text>
  );
}

export default function SettingsScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { isDarkMode, hideBalances } = useAppSelector((s) => s.ui);
  const { user, biometricEnabled } = useAppSelector((s) => s.auth);

  const bg = isDarkMode ? colors.bgDeep : '#F2F2F7';
  const cardBg = isDarkMode ? colors.bgCard : '#FFFFFF';
  const titleColor = isDarkMode ? colors.textPrimary : '#1A1A2E';
  const subtitleColor = isDarkMode ? colors.textSecondary : '#666680';
  const borderColor = isDarkMode ? colors.bgBorder : '#E8E8F0';

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => dispatch(logout()),
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bg }]} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: cardBg, borderColor }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={titleColor} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: titleColor }]}>Settings</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile card */}
        <LinearGradient
          colors={isDarkMode
            ? ['#0A2140', '#0F2D55']
            : ['#003B7A', '#0055B3']}
          style={styles.profileCard}
        >
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{user?.avatarInitials}</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{user?.name}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <View style={styles.kycBadge}>
              <Ionicons name="shield-checkmark" size={12} color={colors.gain} />
              <Text style={styles.kycText}>KYC Verified</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.editButton}>
            <Ionicons name="pencil-outline" size={16} color="rgba(255,255,255,0.7)" />
          </TouchableOpacity>
        </LinearGradient>

        {/* Account info */}
        <View style={[styles.infoStrip, { backgroundColor: cardBg, borderColor }]}>
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: subtitleColor }]}>Account No.</Text>
            <Text style={[styles.infoValue, { color: titleColor }]}>{user?.accountNumber}</Text>
          </View>
          <View style={[styles.infoDivider, { backgroundColor: borderColor }]} />
          <View style={styles.infoItem}>
            <Text style={[styles.infoLabel, { color: subtitleColor }]}>Phone</Text>
            <Text style={[styles.infoValue, { color: titleColor }]}>{user?.phone}</Text>
          </View>
        </View>

        {/* Appearance */}
        <SectionHeader title="APPEARANCE" isDark={isDarkMode} />
        <View style={[styles.section, { borderColor }]}>
          <SettingRow
            icon="moon-outline"
            iconColor={colors.chart5}
            label="Dark Mode"
            sublabel="Easier on the eyes at night"
            isDark={isDarkMode}
            rightElement={
              <Switch
                value={isDarkMode}
                onValueChange={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  dispatch(toggleDarkMode());
                }}
                trackColor={{ false: '#ccc', true: colors.primaryGlow }}
                thumbColor="#FFF"
              />
            }
          />
          <SettingRow
            icon="eye-off-outline"
            iconColor={colors.chart3}
            label="Hide Balances"
            sublabel="Masks all monetary values"
            isDark={isDarkMode}
            rightElement={
              <Switch
                value={hideBalances}
                onValueChange={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  dispatch(toggleHideBalances());
                }}
                trackColor={{ false: '#ccc', true: colors.primaryGlow }}
                thumbColor="#FFF"
              />
            }
          />
        </View>

        {/* Security */}
        <SectionHeader title="SECURITY" isDark={isDarkMode} />
        <View style={[styles.section, { borderColor }]}>
          <SettingRow
            icon="finger-print-outline"
            iconColor={colors.gain}
            label="Biometric Authentication"
            sublabel="Face ID / Touch ID"
            isDark={isDarkMode}
            rightElement={
              <Switch
                value={biometricEnabled}
                onValueChange={() => {}}
                trackColor={{ false: '#ccc', true: colors.primaryGlow }}
                thumbColor="#FFF"
              />
            }
          />
          <SettingRow
            icon="key-outline"
            iconColor={colors.chart3}
            label="Change PIN"
            isDark={isDarkMode}
            onPress={() => Alert.alert('Change PIN', 'This would open the PIN change flow.')}
          />
          <SettingRow
            icon="lock-closed-outline"
            iconColor={colors.primaryGlow}
            label="Two-Factor Authentication"
            sublabel="Extra layer of security"
            isDark={isDarkMode}
            onPress={() => {}}
          />
        </View>

        {/* Notifications */}
        <SectionHeader title="NOTIFICATIONS" isDark={isDarkMode} />
        <View style={[styles.section, { borderColor }]}>
          <SettingRow
            icon="notifications-outline"
            iconColor={colors.chart1}
            label="Push Notifications"
            sublabel="Trade confirmations, market alerts"
            isDark={isDarkMode}
            rightElement={<Switch value={true} onValueChange={() => {}} trackColor={{ false: '#ccc', true: colors.primaryGlow }} thumbColor="#FFF" />}
          />
          <SettingRow
            icon="mail-outline"
            iconColor={colors.chart6}
            label="Email Reports"
            sublabel="Monthly portfolio statements"
            isDark={isDarkMode}
            rightElement={<Switch value={true} onValueChange={() => {}} trackColor={{ false: '#ccc', true: colors.primaryGlow }} thumbColor="#FFF" />}
          />
        </View>

        {/* Support */}
        <SectionHeader title="SUPPORT" isDark={isDarkMode} />
        <View style={[styles.section, { borderColor }]}>
          <SettingRow
            icon="help-circle-outline"
            iconColor={colors.chart2}
            label="Help Center"
            isDark={isDarkMode}
            onPress={() => {}}
          />
          <SettingRow
            icon="document-text-outline"
            iconColor={colors.textSecondary}
            label="Terms & Conditions"
            isDark={isDarkMode}
            onPress={() => {}}
          />
          <SettingRow
            icon="shield-outline"
            iconColor={colors.textSecondary}
            label="Privacy Policy"
            isDark={isDarkMode}
            onPress={() => {}}
          />
          <SettingRow
            icon="information-circle-outline"
            iconColor={colors.textSecondary}
            label="App Version"
            sublabel="1.0.0 (Build 1)"
            isDark={isDarkMode}
          />
        </View>

        {/* Sign out */}
        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: colors.lossSubtle, borderColor: colors.loss + '40' }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.loss} />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[styles.footer, { color: subtitleColor }]}>
          Stanbic IBTC Asset Management Ltd.{'\n'}
          RC 462,572 · Licensed by SEC Nigeria
        </Text>

        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.md,
  },
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  title: { fontSize: typography.size.lg, fontWeight: typography.weight.bold },
  profileCard: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    marginHorizontal: spacing.lg, borderRadius: borderRadius.xl,
    padding: spacing.lg, marginBottom: spacing.md,
  },
  profileAvatar: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)',
  },
  profileAvatarText: { fontSize: typography.size.xl, fontWeight: typography.weight.heavy, color: '#FFF' },
  profileInfo: { flex: 1 },
  profileName: { fontSize: typography.size.lg, fontWeight: typography.weight.bold, color: '#FFF' },
  profileEmail: { fontSize: typography.size.sm, color: 'rgba(255,255,255,0.7)', marginTop: 2 },
  kycBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    marginTop: spacing.xs, alignSelf: 'flex-start',
    backgroundColor: colors.gainSubtle, paddingVertical: 3, paddingHorizontal: 8,
    borderRadius: borderRadius.full,
  },
  kycText: { fontSize: 10, color: colors.gain, fontWeight: typography.weight.bold },
  editButton: { padding: spacing.sm },
  infoStrip: {
    flexDirection: 'row', marginHorizontal: spacing.lg, marginBottom: spacing.md,
    borderRadius: borderRadius.lg, padding: spacing.md,
    borderWidth: 1,
  },
  infoItem: { flex: 1, alignItems: 'center' },
  infoLabel: { fontSize: typography.size.xs, marginBottom: 3 },
  infoValue: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  infoDivider: { width: 1, marginVertical: spacing.xs },
  sectionHeader: {
    fontSize: typography.size.xs, fontWeight: typography.weight.bold,
    letterSpacing: 1.2, textTransform: 'uppercase',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.xs,
    marginTop: spacing.sm,
  },
  section: {
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    borderRadius: borderRadius.xl, overflow: 'hidden',
    borderWidth: 1,
  },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    padding: spacing.md, borderBottomWidth: 1,
  },
  rowIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  rowText: { flex: 1 },
  rowLabel: { fontSize: typography.size.md, fontWeight: typography.weight.medium },
  rowSublabel: { fontSize: typography.size.xs, marginTop: 2 },
  logoutButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, marginHorizontal: spacing.lg, borderRadius: borderRadius.full,
    paddingVertical: spacing.md, borderWidth: 1, marginBottom: spacing.md,
  },
  logoutText: { fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.loss },
  footer: { fontSize: typography.size.xs, textAlign: 'center', lineHeight: 18, paddingHorizontal: spacing.lg },
});