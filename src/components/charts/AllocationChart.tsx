import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { VictoryPie } from 'victory-native';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { PortfolioHolding } from '../../types';
import { formatNGN, formatPercent } from '../../utils/formatters';
import { useAppSelector } from '../../hooks/useAppSelector';
import { getTheme } from '../../theme/getTheme';

interface Props {
  holdings: PortfolioHolding[];
}

export function AllocationChart({ holdings }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const isDarkMode = useAppSelector((s) => s.ui.isDarkMode);
  const theme = getTheme(isDarkMode);

  const selectedHolding = holdings.find((h) => h.id === selected);
  const totalValue = holdings.reduce((s, h) => s + h.currentValue, 0);

  const chartData = holdings.map((h) => ({
    x: h.shortName,
    y: h.allocationPercent,
    id: h.id,
    color: h.color,
  }));

  return (
    <View style={[styles.container, { backgroundColor: theme.bgCard, borderColor: theme.bgBorder }]}>
      {/* Pie Chart */}
      <View style={styles.chartContainer}>
        <VictoryPie
          data={chartData}
          width={200}
          height={200}
          innerRadius={60}
          padAngle={2}
          style={{
            data: {
              fill: ({ datum }: any) => datum.color,
              opacity: ({ datum }: any) =>
                selected === null || datum.id === selected ? 1 : 0.4,
            },
          }}
          events={[{
            target: 'data',
            eventHandlers: {
              onPress: () => ({
                target: 'data',
                mutation: ({ datum }: any) => {
                  setSelected(selected === datum.id ? null : datum.id);
                },
              }),
            },
          }]}
          labels={() => null}
        />

        {/* Center label */}
        <View style={styles.centerLabel}>
          {selectedHolding ? (
            <>
              <Text style={[styles.centerValue, { color: theme.textPrimary }]}>
                {formatPercent(selectedHolding.allocationPercent).replace('+', '')}
              </Text>
              <Text style={[styles.centerName, { color: theme.textSecondary }]} numberOfLines={2}>
                {selectedHolding.shortName}
              </Text>
            </>
          ) : (
            <>
              <Text style={[styles.centerAmount, { color: theme.textPrimary }]}>
                {formatNGN(totalValue)}
              </Text>
              <Text style={[styles.centerSubtitle, { color: theme.textMuted }]}>Portfolio</Text>
            </>
          )}
        </View>
      </View>

      {/* Legend — fixed to prevent ETF text overflow */}
      <View style={styles.legend}>
        {holdings.map((h) => (
          <TouchableOpacity
            key={h.id}
            style={[
              styles.legendItem,
              selected === h.id && { backgroundColor: theme.bgElevated },
            ]}
            onPress={() => setSelected(selected === h.id ? null : h.id)}
          >
            <View style={[styles.legendDot, { backgroundColor: h.color, flexShrink: 0 }]} />
            <View style={styles.legendTextRow}>
              <Text
                style={[styles.legendName, { color: theme.textSecondary }]}
                numberOfLines={1}
                ellipsizeMode="tail"
              >
                {h.shortName}
              </Text>
              <Text style={[styles.legendValue, { color: theme.textPrimary }]}>
                {formatPercent(h.allocationPercent).replace('+', '')}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: borderRadius.xl, padding: spacing.md,
    borderWidth: 1, flexDirection: 'row', alignItems: 'center',
  },
  chartContainer: { alignItems: 'center', justifyContent: 'center' },
  centerLabel: {
    position: 'absolute', alignItems: 'center', width: 110,
  },
  centerAmount: {
    fontSize: typography.size.sm, fontWeight: typography.weight.bold, textAlign: 'center',
  },
  centerValue: {
    fontSize: typography.size.xl, fontWeight: typography.weight.heavy,
  },
  centerName: {
    fontSize: typography.size.xs, textAlign: 'center', marginTop: 2,
  },
  centerSubtitle: {
    fontSize: typography.size.xs, marginTop: 2,
  },
  legend: {
    flex: 1, paddingLeft: spacing.sm, gap: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row', alignItems: 'center',
    gap: spacing.xs, padding: spacing.xs, borderRadius: borderRadius.sm,
  },
  legendDot: {
    width: 10, height: 10, borderRadius: 5,
  },
  legendTextRow: {
    flex: 1, flexDirection: 'row',
    justifyContent: 'space-between', alignItems: 'center',
    overflow: 'hidden',
  },
  legendName: {
    fontSize: typography.size.xs, flex: 1, marginRight: 4,
  },
  legendValue: {
    fontSize: typography.size.xs, fontWeight: typography.weight.semibold, flexShrink: 0,
  },
});