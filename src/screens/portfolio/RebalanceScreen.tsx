import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAppSelector } from '../../hooks/useAppSelector';
import { getTheme } from '../../theme/getTheme';
import { formatNGN } from '../../utils/formatters';

interface AllocationState {
  id: string;
  name: string;
  color: string;
  currentPercent: number;
  targetPercent: number;
  currentValue: number;
}

export default function RebalanceScreen({ navigation }: any) {
  const { portfolio } = useAppSelector((s) => s.portfolio);
  const isDarkMode = useAppSelector((s) => s.ui.isDarkMode);
  const theme = getTheme(isDarkMode);

  const [allocations, setAllocations] = useState<AllocationState[]>(
    portfolio?.holdings.map((h) => ({
      id: h.id,
      name: h.shortName,
      color: h.color,
      currentPercent: h.allocationPercent,
      targetPercent: h.allocationPercent,
      currentValue: h.currentValue,
    })) ?? []
  );

  const totalTarget = allocations.reduce((s, a) => s + a.targetPercent, 0);
  const isValid = Math.abs(totalTarget - 100) < 0.5;
  const totalValue = portfolio?.totalValue ?? 0;
  const totalRemaining = 100 - totalTarget;

  const updateAllocation = useCallback((id: string, newValue: number) => {
    setAllocations((prev) => prev.map((a) => a.id === id ? { ...a, targetPercent: newValue } : a));
  }, []);

  const resetToCurrent = () => {
    setAllocations((prev) => prev.map((a) => ({ ...a, targetPercent: a.currentPercent })));
  };

  const applyEqualWeight = () => {
    const equal = 100 / allocations.length;
    setAllocations((prev) => prev.map((a) => ({ ...a, targetPercent: parseFloat(equal.toFixed(1)) })));
  };

  const handleConfirm = async () => {
    if (!isValid) return;
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      'Rebalance Order Submitted',
      'Your portfolio rebalancing is being processed. Trades will settle within T+2 business days.',
      [{ text: 'Done', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Rebalance Portfolio</Text>
        <TouchableOpacity onPress={resetToCurrent}>
          <Text style={styles.resetText}>Reset</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={[styles.infoCard, { backgroundColor: colors.primaryGlow + '15', borderColor: colors.primaryGlow + '30' }]}>
          <Ionicons name="information-circle-outline" size={18} color={colors.primaryGlow} />
          <Text style={[styles.infoText, { color: theme.textSecondary }]}>
            Adjust sliders to set your target allocation. All sliders must sum to 100%.
          </Text>
        </View>

        <View style={[
          styles.totalCard,
          { backgroundColor: theme.bgCard, borderColor: isValid ? colors.gain : Math.abs(totalRemaining) < 5 ? colors.warning : colors.loss },
        ]}>
          <Text style={[styles.totalLabel, { color: theme.textSecondary }]}>Total Allocation</Text>
          <Text style={[styles.totalValue, { color: isValid ? colors.gain : colors.loss }]}>
            {totalTarget.toFixed(1)}%
          </Text>
          {!isValid && (
            <Text style={[styles.totalHint, { color: totalRemaining > 0 ? colors.warning : colors.loss }]}>
              {totalRemaining > 0
                ? `${totalRemaining.toFixed(1)}% remaining to allocate`
                : `${Math.abs(totalRemaining).toFixed(1)}% over-allocated`}
            </Text>
          )}
        </View>

        <View style={styles.presets}>
          <TouchableOpacity
            style={[styles.presetBtn, { backgroundColor: theme.bgCard, borderColor: theme.bgBorder }]}
            onPress={applyEqualWeight}
          >
            <Ionicons name="grid-outline" size={14} color={colors.primaryGlow} />
            <Text style={[styles.presetBtnText, { color: colors.primaryGlow }]}>Equal Weight</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.presetBtn, { backgroundColor: theme.bgCard, borderColor: theme.bgBorder }]}
            onPress={resetToCurrent}
          >
            <Ionicons name="refresh-outline" size={14} color={theme.textSecondary} />
            <Text style={[styles.presetBtnText, { color: theme.textSecondary }]}>Current Weights</Text>
          </TouchableOpacity>
        </View>

        {allocations.map((alloc) => {
          const targetValue = (alloc.targetPercent / 100) * totalValue;
          const diff = targetValue - alloc.currentValue;
          const action = diff > 500 ? 'Buy' : diff < -500 ? 'Sell' : 'Hold';
          const actionColor = action === 'Buy' ? colors.gain : action === 'Sell' ? colors.loss : theme.textMuted;

          return (
            <View key={alloc.id} style={[styles.allocationCard, { backgroundColor: theme.bgCard, borderColor: theme.bgBorder }]}>
              <View style={styles.allocHeader}>
                <View style={[styles.allocDot, { backgroundColor: alloc.color }]} />
                <Text style={[styles.allocName, { color: theme.textPrimary }]}>{alloc.name}</Text>
                <View style={[styles.actionBadge, { backgroundColor: actionColor + '20' }]}>
                  <Text style={[styles.actionText, { color: actionColor }]}>{action}</Text>
                </View>
              </View>

              <View style={styles.comparison}>
                <View style={styles.compareItem}>
                  <Text style={[styles.compareLabel, { color: theme.textMuted }]}>Current</Text>
                  <Text style={[styles.compareValue, { color: theme.textPrimary }]}>
                    {alloc.currentPercent.toFixed(1)}%
                  </Text>
                  <Text style={[styles.compareAmount, { color: theme.textSecondary }]}>
                    {formatNGN(alloc.currentValue)}
                  </Text>
                </View>
                <Ionicons name="arrow-forward" size={16} color={theme.textMuted} />
                <View style={[styles.compareItem, { alignItems: 'flex-end' }]}>
                  <Text style={[styles.compareLabel, { color: theme.textMuted }]}>Target</Text>
                  <Text style={[styles.compareValue, { color: alloc.color }]}>
                    {alloc.targetPercent.toFixed(1)}%
                  </Text>
                  <Text style={[styles.compareAmount, { color: theme.textSecondary }]}>
                    {formatNGN(targetValue)}
                  </Text>
                </View>
              </View>

              <View style={[styles.barContainer, { backgroundColor: theme.bgElevated }]}>
                <View style={[styles.barCurrent, { width: `${alloc.currentPercent}%`, backgroundColor: alloc.color + '40' }]} />
                <View style={[styles.barTarget, { width: `${alloc.targetPercent}%`, backgroundColor: alloc.color }]} />
              </View>

              <Slider
                style={styles.slider}
                minimumValue={0}
                maximumValue={100}
                step={0.5}
                value={alloc.targetPercent}
                onValueChange={(val) => updateAllocation(alloc.id, val)}
                minimumTrackTintColor={alloc.color}
                maximumTrackTintColor={theme.bgBorder}
                thumbTintColor={alloc.color}
              />

              {Math.abs(diff) > 500 && (
                <Text style={[styles.tradeEstimate, { color: actionColor }]}>
                  Estimated {action.toLowerCase()}: {formatNGN(Math.abs(diff))}
                </Text>
              )}
            </View>
          );
        })}

        <View style={{ height: 120 }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.bg, borderTopColor: theme.bgBorder }]}>
        <TouchableOpacity
          style={[styles.confirmBtn, !isValid && styles.confirmBtnDisabled]}
          onPress={handleConfirm}
          disabled={!isValid}
        >
          <Ionicons name="checkmark-circle" size={20} color="#FFF" />
          <Text style={styles.confirmBtnText}>
            {isValid ? 'Confirm Rebalance' : `Allocate ${Math.abs(totalRemaining).toFixed(1)}% more`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.sm,
  },
  title: { fontSize: typography.size.lg, fontWeight: typography.weight.bold },
  resetText: { fontSize: typography.size.sm, color: colors.primaryGlow, fontWeight: typography.weight.medium },
  scroll: { flex: 1, paddingHorizontal: spacing.lg },
  infoCard: {
    flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-start',
    borderRadius: borderRadius.md, padding: spacing.md,
    marginBottom: spacing.md, borderWidth: 1,
  },
  infoText: { flex: 1, fontSize: typography.size.sm, lineHeight: 20 },
  totalCard: {
    alignItems: 'center', borderRadius: borderRadius.xl,
    padding: spacing.lg, marginBottom: spacing.md, borderWidth: 2,
  },
  totalLabel: { fontSize: typography.size.sm, marginBottom: spacing.xs },
  totalValue: { fontSize: typography.size.xxxl, fontWeight: typography.weight.heavy },
  totalHint: { fontSize: typography.size.sm, marginTop: spacing.xs },
  presets: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md },
  presetBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: spacing.xs, paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full, borderWidth: 1,
  },
  presetBtnText: { fontSize: typography.size.xs, fontWeight: typography.weight.medium },
  allocationCard: {
    borderRadius: borderRadius.xl, padding: spacing.lg,
    marginBottom: spacing.md, borderWidth: 1,
  },
  allocHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  allocDot: { width: 12, height: 12, borderRadius: 6 },
  allocName: { flex: 1, fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  actionBadge: { paddingVertical: 3, paddingHorizontal: spacing.sm, borderRadius: borderRadius.full },
  actionText: { fontSize: typography.size.xs, fontWeight: typography.weight.bold },
  comparison: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: spacing.md,
  },
  compareItem: { alignItems: 'flex-start' },
  compareLabel: { fontSize: typography.size.xs, marginBottom: 2 },
  compareValue: { fontSize: typography.size.xl, fontWeight: typography.weight.heavy },
  compareAmount: { fontSize: typography.size.xs },
  barContainer: { height: 6, borderRadius: 3, marginBottom: spacing.sm, overflow: 'hidden' },
  barCurrent: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 3 },
  barTarget: { position: 'absolute', left: 0, top: 0, bottom: 0, borderRadius: 3, opacity: 0.8 },
  slider: { height: 40, marginHorizontal: -spacing.sm },
  tradeEstimate: { fontSize: typography.size.xs, fontWeight: typography.weight.semibold, textAlign: 'center' },
  footer: {
    paddingHorizontal: spacing.lg, paddingBottom: spacing.xl,
    paddingTop: spacing.md, borderTopWidth: 1,
  },
  confirmBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, backgroundColor: colors.primaryGlow,
    paddingVertical: spacing.md, borderRadius: borderRadius.full,
  },
  confirmBtnDisabled: { opacity: 0.4 },
  confirmBtnText: { fontSize: typography.size.md, fontWeight: typography.weight.bold, color: '#FFF' },
});