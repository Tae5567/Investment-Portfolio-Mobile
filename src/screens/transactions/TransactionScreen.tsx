import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SectionList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAppSelector } from '../../hooks/useAppSelector';
import { getTheme } from '../../theme/getTheme';
import { MOCK_TRANSACTIONS } from '../../services/mockData';
import { Transaction, TransactionType } from '../../types';
import { formatNGN } from '../../utils/formatters';

type FilterType = 'all' | TransactionType;

const FILTERS: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'buy', label: 'Buy' },
  { key: 'sell', label: 'Sell' },
  { key: 'dividend', label: 'Dividend' },
];

const TYPE_CONFIG = {
  buy: { icon: 'arrow-down-circle', color: colors.gain, label: 'Buy' },
  sell: { icon: 'arrow-up-circle', color: colors.loss, label: 'Sell' },
  dividend: { icon: 'cash', color: colors.gold, label: 'Dividend' },
  rebalance: { icon: 'swap-horizontal', color: colors.primaryGlow, label: 'Rebalance' },
};

const STATUS_CONFIG = {
  completed: { color: colors.gain, label: 'Completed' },
  pending: { color: colors.warning, label: 'Pending' },
  processing: { color: colors.primaryGlow, label: 'Processing' },
  failed: { color: colors.loss, label: 'Failed' },
};

function TransactionItem({ item, theme }: { item: Transaction; theme: ReturnType<typeof getTheme> }) {
  const typeConf = TYPE_CONFIG[item.type];
  const statusConf = STATUS_CONFIG[item.status];
  const isCredit = item.type === 'sell' || item.type === 'dividend';

  return (
    <View style={[styles.txItem, { backgroundColor: theme.bgCard, borderColor: theme.bgBorder }]}>
      <View style={[styles.txIcon, { backgroundColor: typeConf.color + '20' }]}>
        <Ionicons name={typeConf.icon as any} size={22} color={typeConf.color} />
      </View>
      <View style={styles.txInfo}>
        <Text style={[styles.txName, { color: theme.textPrimary }]} numberOfLines={1}>{item.fundName}</Text>
        <View style={styles.txMeta}>
          <Text style={[styles.txType, { color: theme.textSecondary }]}>{typeConf.label}</Text>
          <View style={[styles.txDot, { backgroundColor: theme.textMuted }]} />
          <Text style={[styles.txRef, { color: theme.textMuted }]} numberOfLines={1}>{item.reference}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusConf.color + '20' }]}>
          <View style={[styles.statusDot, { backgroundColor: statusConf.color }]} />
          <Text style={[styles.statusText, { color: statusConf.color }]}>{statusConf.label}</Text>
        </View>
      </View>
      <View style={styles.txAmount}>
        <Text style={[styles.txAmountText, { color: isCredit ? colors.gain : theme.textPrimary }]}>
          {isCredit ? '+' : '-'}{formatNGN(item.totalAmount)}
        </Text>
        {item.units > 0 && (
          <Text style={[styles.txUnits, { color: theme.textMuted }]}>{item.units.toLocaleString()} units</Text>
        )}
      </View>
    </View>
  );
}

export default function TransactionsScreen({ navigation }: any) {
  const isDarkMode = useAppSelector((s) => s.ui.isDarkMode);
  const theme = getTheme(isDarkMode);
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filtered = useMemo(() =>
    activeFilter === 'all'
      ? MOCK_TRANSACTIONS
      : MOCK_TRANSACTIONS.filter((t) => t.type === activeFilter),
    [activeFilter]
  );

  const sections = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    filtered.forEach((tx) => {
      const monthKey = format(parseISO(tx.date), 'MMMM yyyy');
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(tx);
    });
    return Object.entries(groups).map(([title, data]) => ({ title, data }));
  }, [filtered]);

  const totalDebit = filtered.filter((t) => t.type === 'buy').reduce((s, t) => s + t.totalAmount, 0);
  const totalCredit = filtered.filter((t) => t.type === 'sell' || t.type === 'dividend').reduce((s, t) => s + t.totalAmount, 0);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.canGoBack() && navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.textPrimary }]}>Transaction History</Text>
        <TouchableOpacity>
          <Ionicons name="download-outline" size={22} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.summary, { backgroundColor: theme.bgCard, borderColor: theme.bgBorder }]}>
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Total Invested</Text>
          <Text style={[styles.summaryValue, { color: colors.loss }]}>-{formatNGN(totalDebit)}</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: theme.bgBorder }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Total Received</Text>
          <Text style={[styles.summaryValue, { color: colors.gain }]}>+{formatNGN(totalCredit)}</Text>
        </View>
        <View style={[styles.summaryDivider, { backgroundColor: theme.bgBorder }]} />
        <View style={styles.summaryItem}>
          <Text style={[styles.summaryLabel, { color: theme.textMuted }]}>Transactions</Text>
          <Text style={[styles.summaryValue, { color: theme.textPrimary }]}>{filtered.length}</Text>
        </View>
      </View>

      <View style={styles.filters}>
        {FILTERS.map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[
              styles.filterChip,
              { backgroundColor: theme.bgCard, borderColor: theme.bgBorder },
              activeFilter === key && { backgroundColor: colors.primaryGlow, borderColor: colors.primaryGlow },
            ]}
            onPress={() => setActiveFilter(key)}
          >
            <Text style={[styles.filterText, { color: activeFilter === key ? '#FFF' : theme.textSecondary }]}>
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <TransactionItem item={item} theme={theme} />}
        renderSectionHeader={({ section: { title } }) => (
          <View style={[styles.sectionHeader, { backgroundColor: theme.bg }]}>
            <Text style={[styles.sectionHeaderText, { color: theme.textMuted }]}>{title}</Text>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="receipt-outline" size={48} color={theme.textMuted} />
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>No transactions found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.md,
  },
  title: { fontSize: typography.size.lg, fontWeight: typography.weight.bold },
  summary: {
    flexDirection: 'row', marginHorizontal: spacing.lg, marginBottom: spacing.md,
    borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryLabel: { fontSize: typography.size.xs, marginBottom: 4 },
  summaryValue: { fontSize: typography.size.sm, fontWeight: typography.weight.bold },
  summaryDivider: { width: 1, marginVertical: spacing.xs },
  filters: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, marginBottom: spacing.md },
  filterChip: {
    paddingVertical: spacing.xs, paddingHorizontal: spacing.md,
    borderRadius: borderRadius.full, borderWidth: 1,
  },
  filterText: { fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  sectionHeader: { paddingVertical: spacing.sm },
  sectionHeaderText: {
    fontSize: typography.size.xs, fontWeight: typography.weight.bold,
    letterSpacing: 1, textTransform: 'uppercase',
  },
  txItem: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    borderRadius: borderRadius.md, padding: spacing.md,
    marginBottom: spacing.sm, borderWidth: 1,
  },
  txIcon: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  txInfo: { flex: 1 },
  txName: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, marginBottom: 3 },
  txMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, marginBottom: 5 },
  txType: { fontSize: typography.size.xs },
  txDot: { width: 3, height: 3, borderRadius: 1.5 },
  txRef: { fontSize: typography.size.xs, flex: 1 },
  statusBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4, alignSelf: 'flex-start',
    paddingVertical: 3, paddingHorizontal: 7, borderRadius: borderRadius.full,
  },
  statusDot: { width: 5, height: 5, borderRadius: 2.5 },
  statusText: { fontSize: 10, fontWeight: typography.weight.bold },
  txAmount: { alignItems: 'flex-end' },
  txAmountText: { fontSize: typography.size.sm, fontWeight: typography.weight.bold },
  txUnits: { fontSize: typography.size.xs, marginTop: 3 },
  empty: { alignItems: 'center', paddingTop: spacing.xxl, gap: spacing.md },
  emptyText: { fontSize: typography.size.md },
});