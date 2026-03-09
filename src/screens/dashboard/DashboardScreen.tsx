import React, { useEffect, useCallback } from 'react';
import {
  ScrollView, View, Text, StyleSheet,
  RefreshControl, TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withTiming, withDelay,
} from 'react-native-reanimated';

import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { loadPortfolio, updatePrices } from '../../store/slices/portfolioSlice';
import { PortfolioCard } from '../../components/cards/PortfolioCard';
import { AllocationChart } from '../../components/charts/AllocationChart';
import { HoldingRow } from '../../components/cards/HoldingRow';
import { getTheme } from '../../theme/getTheme';

export default function DashboardScreen({ navigation }: any) {
  const dispatch = useAppDispatch();
  const { portfolio, isLoading, lastUpdated } = useAppSelector((s) => s.portfolio);
  const { user } = useAppSelector((s) => s.auth);
  const isDarkMode = useAppSelector((s) => s.ui.isDarkMode);
  const theme = getTheme(isDarkMode);

  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    dispatch(loadPortfolio());
    headerOpacity.value = withTiming(1, { duration: 600 });
    contentOpacity.value = withDelay(300, withTiming(1, { duration: 600 }));

    const interval = setInterval(() => {
      dispatch(updatePrices());
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOpacity.value }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));

  const onRefresh = useCallback(() => {
    dispatch(loadPortfolio());
  }, []);

  if (!portfolio) return null;

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name.split(' ')[0] ?? 'Investor';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={colors.primaryGlow}
          />
        }
      >
        {/* Header */}
        <Animated.View style={[styles.header, headerStyle]}>
          <View>
            <Text style={[styles.greeting, { color: theme.textSecondary }]}>{greeting},</Text>
            <Text style={[styles.userName, { color: theme.textPrimary }]}>{firstName} 👋</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.iconButton, { backgroundColor: theme.bgCard, borderColor: theme.bgBorder }]}
              onPress={() => {}}
            >
              <Ionicons name="notifications-outline" size={22} color={theme.textSecondary} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.avatar}
              onPress={() => navigation.navigate('Settings')}
            >
              <Text style={styles.avatarText}>{user?.avatarInitials}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View style={contentStyle}>
          {/* Portfolio Value Card */}
          <PortfolioCard portfolio={portfolio} />

          {/* Live indicator */}
          <View style={styles.liveRow}>
            <View style={styles.liveDot} />
            <Text style={[styles.liveText, { color: theme.textMuted }]}>
              Live · Updated {lastUpdated
                ? new Date(lastUpdated).toLocaleTimeString('en-NG', {
                    hour: '2-digit', minute: '2-digit', second: '2-digit',
                  })
                : '—'}
            </Text>
          </View>

          {/* Asset Allocation */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Asset Allocation</Text>
            <AllocationChart holdings={portfolio.holdings} />
          </View>

          {/* Holdings */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Holdings</Text>
              <Text style={[styles.holdingsCount, { color: theme.textSecondary }]}>
                {portfolio.holdings.length} funds
              </Text>
            </View>
            {portfolio.holdings.map((holding, index) => (
              <HoldingRow
                key={holding.id}
                holding={holding}
                index={index}
                onPress={() => navigation.navigate('FundDetail', { fundId: holding.id })}
              />
            ))}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Quick Actions</Text>
            <View style={styles.quickActions}>
              {[
                { icon: 'add-circle-outline', label: 'Buy Fund', screen: 'Trade', params: { mode: 'buy' } },
                { icon: 'remove-circle-outline', label: 'Sell Fund', screen: 'Trade', params: { mode: 'sell' } },
                { icon: 'swap-horizontal-outline', label: 'Rebalance', screen: 'Rebalance', params: {} },
                { icon: 'calculator-outline', label: 'Calculator', screen: 'Calculator', params: {} },
              ].map((action) => (
                <TouchableOpacity
                  key={action.label}
                  style={styles.quickActionItem}
                  onPress={() => navigation.navigate(action.screen, action.params)}
                >
                  <View style={[styles.quickActionIcon, { backgroundColor: theme.bgCard, borderColor: theme.bgBorder }]}>
                    <Ionicons name={action.icon as any} size={24} color={colors.primaryGlow} />
                  </View>
                  <Text style={[styles.quickActionLabel, { color: theme.textSecondary }]}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={{ height: spacing.xxl }} />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.md,
  },
  greeting: { fontSize: typography.size.sm },
  userName: { fontSize: typography.size.xl, fontWeight: typography.weight.bold },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconButton: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  notifDot: {
    position: 'absolute', top: 8, right: 8,
    width: 8, height: 8, borderRadius: 4,
    backgroundColor: colors.loss, borderWidth: 1.5, borderColor: colors.bgDeep,
  },
  avatar: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { fontSize: typography.size.sm, fontWeight: typography.weight.bold, color: '#FFFFFF' },
  liveRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.xs, paddingVertical: spacing.sm,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.gain },
  liveText: { fontSize: typography.size.xs },
  section: { paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  sectionHeader: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.size.lg, fontWeight: typography.weight.semibold,
    marginBottom: spacing.md,
  },
  holdingsCount: { fontSize: typography.size.sm },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between' },
  quickActionItem: { alignItems: 'center', gap: spacing.xs },
  quickActionIcon: {
    width: 60, height: 60, borderRadius: borderRadius.md,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  quickActionLabel: { fontSize: typography.size.xs, textAlign: 'center' },
});