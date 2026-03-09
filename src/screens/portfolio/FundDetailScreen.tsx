import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VictoryChart, VictoryLine, VictoryArea, VictoryAxis } from 'victory-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, withDelay } from 'react-native-reanimated';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAppSelector } from '../../hooks/useAppSelector';
import { getTheme } from '../../theme/getTheme';
import { getChartData } from '../../services/mockData';
import { TimeRange, PricePoint } from '../../types';
import { formatNGN, formatPercent, formatChange } from '../../utils/formatters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CHART_WIDTH = SCREEN_WIDTH - spacing.lg * 2;
const TIME_RANGES: TimeRange[] = ['1W', '1M', '3M', '6M', '1Y', '3Y', 'ALL'];

export default function FundDetailScreen({ navigation, route }: any) {
  const { fundId } = route.params;
  const { portfolio } = useAppSelector((s) => s.portfolio);
  const isDarkMode = useAppSelector((s) => s.ui.isDarkMode);
  const theme = getTheme(isDarkMode);
  const holding = portfolio?.holdings.find((h) => h.id === fundId);

  const [selectedRange, setSelectedRange] = useState<TimeRange>('1M');
  const [chartData, setChartData] = useState<PricePoint[]>([]);
  const [benchmarkData, setBenchmarkData] = useState<PricePoint[]>([]);
  const [showBenchmark, setShowBenchmark] = useState(false);

  const headerOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(0);

  useEffect(() => {
    headerOpacity.value = withTiming(1, { duration: 500 });
    contentOpacity.value = withDelay(200, withTiming(1, { duration: 500 }));
  }, []);

  useEffect(() => {
    if (!holding) return;
    const data = getChartData(holding.id, selectedRange);
    setChartData(data);
    const benchmark = getChartData(holding.id, selectedRange).map((p) => ({
      ...p,
      value: p.value * (0.85 + Math.random() * 0.1),
    }));
    setBenchmarkData(benchmark);
  }, [selectedRange, holding]);

  const headerStyle = useAnimatedStyle(() => ({ opacity: headerOpacity.value }));
  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));

  if (!holding) return null;

  const isGain = holding.unrealizedGain >= 0;
  const isDayGain = holding.dayChange >= 0;

  const chartReturn = chartData.length > 1
    ? ((chartData[chartData.length - 1].value - chartData[0].value) / chartData[0].value) * 100
    : 0;
  const benchmarkReturn = benchmarkData.length > 1
    ? ((benchmarkData[benchmarkData.length - 1].value - benchmarkData[0].value) / benchmarkData[0].value) * 100
    : 0;

  const normalizeData = (data: PricePoint[]) => {
    if (data.length === 0) return [];
    const base = data[0].value;
    return data.map((p, i) => ({ x: i, y: ((p.value - base) / base) * 100 }));
  };

  const normalFund = normalizeData(chartData);
  const normalBench = normalizeData(benchmarkData);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <Animated.View style={[styles.header, headerStyle]}>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: theme.bgCard, borderColor: theme.bgBorder }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={22} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <View style={[styles.fundDot, { backgroundColor: holding.color }]} />
          <Text style={[styles.headerTitle, { color: theme.textPrimary }]}>{holding.shortName}</Text>
        </View>
        <TouchableOpacity style={[styles.backButton, { backgroundColor: theme.bgCard, borderColor: theme.bgBorder }]}>
          <Ionicons name="share-outline" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
      </Animated.View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Animated.View style={contentStyle}>
          {/* Hero */}
          <LinearGradient colors={[holding.color + '20', 'transparent']} style={styles.heroSection}>
            <Text style={[styles.navLabel, { color: theme.textMuted }]}>NET ASSET VALUE</Text>
            <Text style={[styles.navValue, { color: theme.textPrimary }]}>₦{holding.currentNAV.toFixed(4)}</Text>
            <View style={styles.dayChangeRow}>
              <View style={[styles.changePill, { backgroundColor: isDayGain ? colors.gainSubtle : colors.lossSubtle }]}>
                <Ionicons name={isDayGain ? 'trending-up' : 'trending-down'} size={14} color={isDayGain ? colors.gain : colors.loss} />
                <Text style={[styles.changePillText, { color: isDayGain ? colors.gain : colors.loss }]}>
                  {formatChange(holding.dayChange)} ({formatPercent(holding.dayChangePercent)}) today
                </Text>
              </View>
            </View>
          </LinearGradient>

          {/* Position card */}
          <View style={[styles.positionCard, { backgroundColor: theme.bgCard, borderColor: theme.bgBorder }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Your Position</Text>
            <View style={styles.positionGrid}>
              {[
                { label: 'Market Value', value: formatNGN(holding.currentValue) },
                { label: 'Units Held', value: holding.unitsHeld.toLocaleString('en-NG') },
                { label: 'Avg. Cost', value: `₦${holding.purchasePrice.toFixed(4)}` },
                { label: 'Unrealized P&L', value: formatChange(holding.unrealizedGain), color: isGain ? colors.gain : colors.loss },
                { label: 'Return', value: formatPercent(holding.unrealizedGainPercent), color: isGain ? colors.gain : colors.loss },
                { label: 'Allocation', value: `${holding.allocationPercent.toFixed(1)}%` },
              ].map(({ label, value, color }) => (
                <View key={label} style={styles.positionItem}>
                  <Text style={[styles.positionLabel, { color: theme.textMuted }]}>{label}</Text>
                  <Text style={[styles.positionValue, { color: color ?? theme.textPrimary }]}>{value}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Chart section */}
          <View style={[styles.chartSection, { backgroundColor: theme.bgCard, borderColor: theme.bgBorder }]}>
            <View style={styles.chartHeader}>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Performance</Text>
              <TouchableOpacity
                style={[styles.benchmarkToggle, { borderColor: showBenchmark ? colors.primaryGlow : theme.bgBorder, backgroundColor: showBenchmark ? colors.primaryGlow + '15' : 'transparent' }]}
                onPress={async () => {
                  await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  setShowBenchmark(!showBenchmark);
                }}
              >
                <Ionicons name="bar-chart-outline" size={14} color={showBenchmark ? colors.primaryGlow : theme.textSecondary} />
                <Text style={[styles.benchmarkToggleText, { color: showBenchmark ? colors.primaryGlow : theme.textSecondary }]}>
                  vs Benchmark
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.rangeSelector}>
              {TIME_RANGES.map((range) => (
                <TouchableOpacity
                  key={range}
                  style={[styles.rangeChip, { backgroundColor: selectedRange === range ? colors.primaryGlow : theme.bgElevated }]}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedRange(range);
                  }}
                >
                  <Text style={[styles.rangeChipText, { color: selectedRange === range ? '#FFF' : theme.textMuted }]}>
                    {range}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.returnSummary}>
              <View style={styles.returnItem}>
                <View style={[styles.returnDot, { backgroundColor: holding.color }]} />
                <Text style={[styles.returnLabel, { color: theme.textSecondary }]}>{holding.shortName}</Text>
                <Text style={[styles.returnValue, { color: chartReturn >= 0 ? colors.gain : colors.loss }]}>
                  {formatPercent(chartReturn)}
                </Text>
              </View>
              {showBenchmark && (
                <View style={styles.returnItem}>
                  <View style={[styles.returnDot, { backgroundColor: theme.textMuted }]} />
                  <Text style={[styles.returnLabel, { color: theme.textSecondary }]}>NSE All-Share</Text>
                  <Text style={[styles.returnValue, { color: benchmarkReturn >= 0 ? colors.gain : colors.loss }]}>
                    {formatPercent(benchmarkReturn)}
                  </Text>
                </View>
              )}
            </View>

            {normalFund.length > 0 && (
              <VictoryChart width={CHART_WIDTH} height={200} padding={{ top: 10, bottom: 30, left: 45, right: 15 }}>
                <VictoryAxis
                  style={{
                    axis: { stroke: theme.bgBorder },
                    tickLabels: { fill: 'transparent' },
                    grid: { stroke: 'transparent' },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  tickFormat={(t: number) => `${t > 0 ? '+' : ''}${t.toFixed(0)}%`}
                  style={{
                    axis: { stroke: theme.bgBorder },
                    tickLabels: { fill: theme.textMuted, fontSize: 9 },
                    grid: { stroke: theme.bgBorder, strokeOpacity: 0.4 },
                  }}
                />
                <VictoryArea
                  data={normalFund}
                  style={{ data: { fill: holding.color + '25', stroke: holding.color, strokeWidth: 2.5 } }}
                  animate={{ duration: 400 }}
                />
                {showBenchmark && (
                  <VictoryLine
                    data={normalBench}
                    style={{ data: { stroke: theme.textMuted, strokeWidth: 1.5, strokeDasharray: '4,4' } }}
                    animate={{ duration: 400 }}
                  />
                )}
              </VictoryChart>
            )}
          </View>

          {/* Fund details */}
          <View style={[styles.infoCard, { backgroundColor: theme.bgCard, borderColor: theme.bgBorder }]}>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Fund Details</Text>
            {[
              { label: 'Asset Class', value: holding.assetClass.replace('_', ' ').toUpperCase() },
              { label: 'Risk Level', value: holding.riskLevel.toUpperCase() },
              { label: 'Management Fee', value: `${holding.managementFee}% p.a.` },
              { label: 'Min. Investment', value: formatNGN(holding.minimumInvestment) },
              { label: 'Currency', value: holding.currency },
              { label: 'Inception Date', value: new Date(holding.inceptionDate).toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) },
            ].map(({ label, value }) => (
              <View key={label} style={[styles.infoRow, { borderBottomColor: theme.bgBorder }]}>
                <Text style={[styles.infoLabel, { color: theme.textSecondary }]}>{label}</Text>
                <Text style={[styles.infoValue, { color: theme.textPrimary }]}>{value}</Text>
              </View>
            ))}
            <Text style={[styles.description, { color: theme.textSecondary }]}>{holding.description}</Text>
          </View>

          <View style={{ height: 120 }} />
        </Animated.View>
      </ScrollView>

      {/* Sticky Buy/Sell */}
      <View style={[styles.stickyActions, { backgroundColor: theme.bg, borderTopColor: theme.bgBorder }]}>
        <TouchableOpacity
          style={[styles.actionButton, styles.sellButton]}
          onPress={() => navigation.navigate('Trade', { mode: 'sell', fundId: holding.id })}
        >
          <Ionicons name="remove-circle-outline" size={18} color={colors.loss} />
          <Text style={[styles.actionButtonText, { color: colors.loss }]}>Sell</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.buyButton]}
          onPress={() => navigation.navigate('Trade', { mode: 'buy', fundId: holding.id })}
        >
          <Ionicons name="add-circle-outline" size={18} color="#FFF" />
          <Text style={[styles.actionButtonText, { color: '#FFF' }]}>Buy More</Text>
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
  backButton: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  fundDot: { width: 10, height: 10, borderRadius: 5 },
  headerTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.bold },
  heroSection: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  navLabel: { fontSize: typography.size.xs, letterSpacing: 1.2, marginBottom: spacing.xs },
  navValue: { fontSize: typography.size.xxxl, fontWeight: typography.weight.heavy, letterSpacing: -0.5 },
  dayChangeRow: { marginTop: spacing.sm },
  changePill: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    paddingVertical: 5, paddingHorizontal: spacing.sm, borderRadius: borderRadius.full,
  },
  changePillText: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  positionCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1,
  },
  sectionTitle: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, marginBottom: spacing.md },
  positionGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  positionItem: { width: '30%' },
  positionLabel: { fontSize: typography.size.xs, marginBottom: 3 },
  positionValue: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  chartSection: {
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1,
  },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  benchmarkToggle: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingVertical: 5, paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.full, borderWidth: 1,
  },
  benchmarkToggleText: { fontSize: typography.size.xs },
  rangeSelector: { flexDirection: 'row', gap: spacing.xs, marginBottom: spacing.md },
  rangeChip: { flex: 1, alignItems: 'center', paddingVertical: 6, borderRadius: borderRadius.sm },
  rangeChipText: { fontSize: typography.size.xs, fontWeight: typography.weight.semibold },
  returnSummary: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.sm },
  returnItem: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  returnDot: { width: 8, height: 8, borderRadius: 4 },
  returnLabel: { fontSize: typography.size.xs },
  returnValue: { fontSize: typography.size.xs, fontWeight: typography.weight.bold },
  infoCard: {
    marginHorizontal: spacing.lg, marginBottom: spacing.md,
    borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingVertical: spacing.sm, borderBottomWidth: 1,
  },
  infoLabel: { fontSize: typography.size.sm },
  infoValue: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold },
  description: { fontSize: typography.size.sm, lineHeight: 20, marginTop: spacing.md },
  stickyActions: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    flexDirection: 'row', gap: spacing.md,
    paddingHorizontal: spacing.lg, paddingBottom: spacing.xl,
    paddingTop: spacing.md, borderTopWidth: 1,
  },
  actionButton: {
    flex: 1, flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: spacing.sm,
    paddingVertical: spacing.md, borderRadius: borderRadius.full,
  },
  sellButton: { backgroundColor: colors.lossSubtle, borderWidth: 1, borderColor: colors.loss + '60' },
  buyButton: { backgroundColor: colors.primaryGlow },
  actionButtonText: { fontSize: typography.size.md, fontWeight: typography.weight.bold },
});