import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withDelay, withTiming,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { PortfolioHolding } from '../../types';
import { formatNGN, formatPercent } from '../../utils/formatters';
import { useAppSelector } from '../../hooks/useAppSelector';
import { getTheme } from '../../theme/getTheme';

interface Props {
  holding: PortfolioHolding;
  index: number;
  onPress: () => void;
}

export function HoldingRow({ holding, index, onPress }: Props) {
  const isDarkMode = useAppSelector((s) => s.ui.isDarkMode);
  const theme = getTheme(isDarkMode);

  const opacity = useSharedValue(0);
  const translateX = useSharedValue(-20);

  useEffect(() => {
    opacity.value = withDelay(index * 100, withTiming(1, { duration: 400 }));
    translateX.value = withDelay(index * 100, withTiming(0, { duration: 400 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateX: translateX.value }],
  }));

  const isGain = holding.unrealizedGain >= 0;

  return (
    <Animated.View style={animStyle}>
      <TouchableOpacity
        style={[styles.row, { backgroundColor: theme.bgCard, borderColor: theme.bgBorder }]}
        onPress={onPress}
        activeOpacity={0.7}
      >
        <View style={[styles.colorBar, { backgroundColor: holding.color }]} />

        <View style={styles.fundInfo}>
          <View style={styles.fundNameRow}>
            <Text style={[styles.fundName, { color: theme.textPrimary }]} numberOfLines={1}>
              {holding.shortName}
            </Text>
            <View style={[styles.riskBadge, { borderColor: holding.color + '60' }]}>
              <Text style={[styles.riskText, { color: holding.color }]}>
                {holding.riskLevel.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={[styles.units, { color: theme.textMuted }]}>
            {holding.unitsHeld.toLocaleString('en-NG')} units @ ₦{holding.currentNAV.toFixed(4)}
          </Text>
        </View>

        <View style={styles.values}>
          <Text style={[styles.currentValue, { color: theme.textPrimary }]}>
            {formatNGN(holding.currentValue)}
          </Text>
          <View style={styles.returnRow}>
            <Ionicons
              name={isGain ? 'arrow-up' : 'arrow-down'}
              size={12}
              color={isGain ? colors.gain : colors.loss}
            />
            <Text style={[styles.returnText, { color: isGain ? colors.gain : colors.loss }]}>
              {formatPercent(holding.unrealizedGainPercent)}
            </Text>
          </View>
        </View>

        <Ionicons name="chevron-forward" size={16} color={theme.textMuted} style={{ marginLeft: spacing.xs }} />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: borderRadius.md, marginBottom: spacing.sm,
    padding: spacing.md, borderWidth: 1, overflow: 'hidden',
  },
  colorBar: {
    width: 3, borderRadius: 2, marginRight: spacing.md,
    position: 'absolute', left: 0, top: 0, bottom: 0,
  },
  fundInfo: { flex: 1, paddingLeft: spacing.xs },
  fundNameRow: {
    flexDirection: 'row', alignItems: 'center',
    gap: spacing.sm, marginBottom: 4,
  },
  fundName: {
    fontSize: typography.size.md, fontWeight: typography.weight.semibold, flex: 1,
  },
  riskBadge: { borderWidth: 1, borderRadius: borderRadius.full, paddingHorizontal: 6, paddingVertical: 2 },
  riskText: { fontSize: 9, fontWeight: typography.weight.bold, letterSpacing: 0.5 },
  units: { fontSize: typography.size.xs },
  values: { alignItems: 'flex-end' },
  currentValue: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, marginBottom: 4 },
  returnRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  returnText: { fontSize: typography.size.sm, fontWeight: typography.weight.medium },
});