import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VictoryChart, VictoryArea, VictoryAxis } from 'victory-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAppSelector } from '../../hooks/useAppSelector';
import { getTheme } from '../../theme/getTheme';
import { formatNGN } from '../../utils/formatters';

const SCREEN_WIDTH = Dimensions.get('window').width;
const CHART_WIDTH = SCREEN_WIDTH - spacing.lg * 4; // accounts for outer + inner padding

function calculateInvestment(monthly: number, years: number, annualReturn: number, inflation: number) {
  const monthlyRate = annualReturn / 100 / 12;
  const months = years * 12;
  const totalInvested = monthly * months;
  const projectedValue = monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
  const totalReturn = projectedValue - totalInvested;
  const inflationAdjustedValue = projectedValue / Math.pow(1 + inflation / 100, years);
  const yearlyBreakdown = Array.from({ length: years }, (_, i) => {
    const m = (i + 1) * 12;
    const value = monthly * ((Math.pow(1 + monthlyRate, m) - 1) / monthlyRate) * (1 + monthlyRate);
    return { year: i + 1, value, invested: monthly * m };
  });
  return { totalInvested, projectedValue, totalReturn, inflationAdjustedValue, yearlyBreakdown };
}

export default function CalculatorScreen({ navigation }: any) {
  const isDarkMode = useAppSelector((s) => s.ui.isDarkMode);
  const theme = getTheme(isDarkMode);

  const [monthly, setMonthly] = useState('50000');
  const [years, setYears] = useState('10');
  const [returnRate, setReturnRate] = useState('18');
  const [inflation, setInflation] = useState('18');

  const result = useMemo(() => {
    const m = parseFloat(monthly) || 0;
    const y = parseFloat(years) || 1;
    const r = parseFloat(returnRate) || 10;
    const inf = parseFloat(inflation) || 18;
    if (m <= 0 || y <= 0) return null;
    return calculateInvestment(m, y, r, inf);
  }, [monthly, years, returnRate, inflation]);

  const InputField = ({ label, value, onChangeText, suffix }: {
    label: string; value: string; onChangeText: (t: string) => void; suffix?: string;
  }) => (
    <View style={styles.inputGroup}>
      <Text style={[styles.inputLabel, { color: theme.textSecondary }]}>{label}</Text>
      <View style={[styles.inputRow, { backgroundColor: theme.bgElevated, borderColor: theme.bgBorder }]}>
        {!suffix?.includes('%') && !suffix?.includes('year') && (
          <Text style={[styles.inputPrefix, { color: theme.textSecondary }]}>₦</Text>
        )}
        <TextInput
          style={[styles.input, { color: theme.textPrimary }]}
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholderTextColor={theme.textMuted}
        />
        {suffix && <Text style={[styles.inputSuffix, { color: theme.textSecondary }]}>{suffix}</Text>}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.bgCard, borderColor: theme.bgBorder }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Investment Calculator</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.bgBorder }]}>
          <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Your Plan</Text>
          <InputField label="Monthly Investment" value={monthly} onChangeText={setMonthly} />
          <InputField label="Investment Period" value={years} onChangeText={setYears} suffix=" years" />
          <InputField label="Expected Annual Return" value={returnRate} onChangeText={setReturnRate} suffix="%" />
          <InputField label="Expected Inflation Rate" value={inflation} onChangeText={setInflation} suffix="%" />
        </View>

        {result && (
          <>
            <View style={[styles.resultsCard, { backgroundColor: theme.bgCard, borderColor: colors.primaryGlow + '40' }]}>
              <View style={styles.mainResult}>
                <Text style={[styles.mainResultLabel, { color: theme.textSecondary }]}>Projected Value</Text>
                <Text style={[styles.mainResultValue, { color: theme.textPrimary }]}>
                  {formatNGN(result.projectedValue)}
                </Text>
                <Text style={[styles.mainResultSub, { color: theme.textMuted }]}>
                  Real value (inflation-adjusted): {formatNGN(result.inflationAdjustedValue)}
                </Text>
              </View>

              <View style={styles.statsGrid}>
                {[
                  { label: 'Total Invested', value: formatNGN(result.totalInvested), color: undefined },
                  { label: 'Total Returns', value: `+${formatNGN(result.totalReturn)}`, color: colors.gain },
                  { label: 'Growth Multiple', value: `${(result.projectedValue / result.totalInvested).toFixed(1)}x`, color: colors.primaryGlow },
                  { label: 'Return on Investment', value: `+${((result.totalReturn / result.totalInvested) * 100).toFixed(0)}%`, color: colors.gain },
                ].map(({ label, value, color }) => (
                  <View key={label} style={[styles.statBox, { backgroundColor: theme.bgElevated }]}>
                    <Text style={[styles.statBoxLabel, { color: theme.textMuted }]}>{label}</Text>
                    <Text style={[styles.statBoxValue, { color: color ?? theme.textPrimary }]}>{value}</Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Chart — fully contained */}
            <View style={[styles.chartCard, { backgroundColor: theme.bgCard, borderColor: theme.bgBorder }]}>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Growth Over Time</Text>
              <View style={styles.chartWrapper}>
                <VictoryChart
                  width={CHART_WIDTH}
                  height={200}
                  padding={{ top: 10, bottom: 35, left: 58, right: 10 }}
                >
                  <VictoryAxis
                    tickFormat={(t: number) => `Yr ${t}`}
                    style={{
                      axis: { stroke: theme.bgBorder },
                      tickLabels: { fill: theme.textMuted, fontSize: 10 },
                      grid: { stroke: 'transparent' },
                    }}
                  />
                  <VictoryAxis
                    dependentAxis
                    tickFormat={(t: number) => `₦${(t / 1_000_000).toFixed(0)}M`}
                    style={{
                      axis: { stroke: theme.bgBorder },
                      tickLabels: { fill: theme.textMuted, fontSize: 9 },
                      grid: { stroke: theme.bgBorder, strokeOpacity: 0.5 },
                    }}
                  />
                  <VictoryArea
                    data={result.yearlyBreakdown.map((d) => ({ x: d.year, y: d.invested }))}
                    style={{ data: { fill: colors.chart3 + '40', stroke: colors.chart3, strokeWidth: 2 } }}
                  />
                  <VictoryArea
                    data={result.yearlyBreakdown.map((d) => ({ x: d.year, y: d.value }))}
                    style={{ data: { fill: colors.primaryGlow + '30', stroke: colors.primaryGlow, strokeWidth: 2.5 } }}
                  />
                </VictoryChart>
              </View>

              <View style={styles.chartLegend}>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.primaryGlow }]} />
                  <Text style={[styles.legendText, { color: theme.textSecondary }]}>Projected Value</Text>
                </View>
                <View style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: colors.chart3 }]} />
                  <Text style={[styles.legendText, { color: theme.textSecondary }]}>Total Invested</Text>
                </View>
              </View>
            </View>

            <View style={[styles.card, { backgroundColor: theme.bgCard, borderColor: theme.bgBorder }]}>
              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>Milestones</Text>
              {result.yearlyBreakdown
                .filter((_, i) => (i + 1) % Math.max(1, Math.floor(result.yearlyBreakdown.length / 5)) === 0)
                .map((d) => (
                  <View key={d.year} style={styles.milestone}>
                    <View style={styles.milestoneYear}>
                      <Text style={[styles.milestoneYearText, { color: theme.textSecondary }]}>Yr {d.year}</Text>
                    </View>
                    <View style={[styles.milestoneBar, { backgroundColor: theme.bgElevated }]}>
                      <View style={[styles.milestoneProgress, { width: `${(d.value / result.projectedValue) * 100}%` }]} />
                    </View>
                    <Text style={[styles.milestoneValue, { color: theme.textPrimary }]}>{formatNGN(d.value)}</Text>
                  </View>
                ))}
            </View>
          </>
        )}
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
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1,
  },
  title: { fontSize: typography.size.lg, fontWeight: typography.weight.bold },
  scrollContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  card: { borderRadius: borderRadius.xl, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1 },
  cardTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.semibold, marginBottom: spacing.md },
  inputGroup: { marginBottom: spacing.md },
  inputLabel: { fontSize: typography.size.sm, marginBottom: spacing.xs },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: borderRadius.md, paddingHorizontal: spacing.md, borderWidth: 1,
  },
  inputPrefix: { fontSize: typography.size.md, marginRight: spacing.xs },
  input: { flex: 1, paddingVertical: spacing.md, fontSize: typography.size.lg, fontWeight: typography.weight.semibold },
  inputSuffix: { fontSize: typography.size.md },
  resultsCard: { borderRadius: borderRadius.xl, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1 },
  mainResult: { alignItems: 'center', paddingBottom: spacing.lg, marginBottom: spacing.lg },
  mainResultLabel: { fontSize: typography.size.sm, letterSpacing: 1, textTransform: 'uppercase' },
  mainResultValue: { fontSize: typography.size.display, fontWeight: typography.weight.heavy, marginVertical: spacing.sm, letterSpacing: -1 },
  mainResultSub: { fontSize: typography.size.xs, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  statBox: { flex: 1, minWidth: '45%', borderRadius: borderRadius.md, padding: spacing.md },
  statBoxLabel: { fontSize: typography.size.xs, marginBottom: spacing.xs },
  statBoxValue: { fontSize: typography.size.md, fontWeight: typography.weight.bold },
  chartCard: { borderRadius: borderRadius.xl, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, overflow: 'hidden' },
  // wrap chart in a View that clips overflow
  chartWrapper: { alignItems: 'center', overflow: 'hidden' },
  chartLegend: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg, marginTop: spacing.sm },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: typography.size.xs },
  milestone: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md },
  milestoneYear: { width: 50 },
  milestoneYearText: { fontSize: typography.size.sm },
  milestoneBar: { flex: 1, height: 4, borderRadius: 2 },
  milestoneProgress: { height: '100%', backgroundColor: colors.primaryGlow, borderRadius: 2 },
  milestoneValue: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, width: 80, textAlign: 'right' },
});