import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { Portfolio } from '../../types';
import { formatNGN, formatPercent, formatChange } from '../../utils/formatters';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { toggleHideBalances } from '../../store/slices/uiSlice';

interface Props {
  portfolio: Portfolio;
}

export function PortfolioCard({ portfolio }: Props) {
  const dispatch = useAppDispatch();
  const { hideBalances } = useAppSelector((s) => s.ui);
  const isGain = portfolio.dayChange >= 0;
  const masked = '₦ ••••••';

  const handleToggleBalance = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    dispatch(toggleHideBalances());
  };

  return (
    <LinearGradient
      colors={['#0A2140', '#0F2D55', '#0A1628']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.card}
    >
      <View style={styles.header}>
        <Text style={styles.label}>TOTAL PORTFOLIO VALUE</Text>
        <TouchableOpacity
          onPress={handleToggleBalance}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={hideBalances ? 'eye-off-outline' : 'eye-outline'}
            size={18}
            color="rgba(255,255,255,0.6)"
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.totalValue}>
        {hideBalances ? masked : formatNGN(portfolio.totalValue)}
      </Text>

      <View style={styles.dayChangeRow}>
        <View style={[styles.changeBadge, { backgroundColor: isGain ? colors.gainSubtle : colors.lossSubtle }]}>
          <Ionicons
            name={isGain ? 'trending-up' : 'trending-down'}
            size={14}
            color={isGain ? colors.gain : colors.loss}
          />
          <Text style={[styles.changeText, { color: isGain ? colors.gain : colors.loss }]}>
            {hideBalances ? '••••' : `${formatChange(portfolio.dayChange)} (${formatPercent(portfolio.dayChangePercent)})`}
          </Text>
        </View>
        <Text style={styles.todayLabel}>Today</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Total Return</Text>
          <Text style={[styles.statValue, { color: portfolio.totalGain >= 0 ? colors.gain : colors.loss }]}>
            {hideBalances ? '••••' : formatChange(portfolio.totalGain)}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Return %</Text>
          <Text style={[styles.statValue, { color: portfolio.totalGain >= 0 ? colors.gain : colors.loss }]}>
            {hideBalances ? '••••' : formatPercent(portfolio.totalGainPercent)}
          </Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.stat}>
          <Text style={styles.statLabel}>Cost Basis</Text>
          <Text style={styles.statValue}>
            {hideBalances ? '••••' : formatNGN(portfolio.totalCost)}
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}

// PortfolioCard intentionally always uses dark gradient in both modes
const styles = StyleSheet.create({
  card: {
    borderRadius: borderRadius.xl, padding: spacing.lg,
    marginHorizontal: spacing.md, overflow: 'hidden',
    borderWidth: 1, borderColor: '#1A3050',
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: spacing.sm,
  },
  label: {
    fontSize: typography.size.xs, color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.2, fontWeight: typography.weight.medium,
  },
  totalValue: {
    fontSize: typography.size.display, fontWeight: typography.weight.heavy,
    color: '#FFFFFF', letterSpacing: -1, marginBottom: spacing.sm,
  },
  dayChangeRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg,
  },
  changeBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 4, paddingHorizontal: spacing.sm, borderRadius: borderRadius.full,
  },
  changeText: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  todayLabel: { fontSize: typography.size.xs, color: 'rgba(255,255,255,0.4)' },
  divider: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: spacing.md },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  stat: { flex: 1, alignItems: 'center' },
  statLabel: { fontSize: typography.size.xs, color: 'rgba(255,255,255,0.5)', marginBottom: 4 },
  statValue: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, color: '#FFFFFF' },
  statDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.1)' },
});