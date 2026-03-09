import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  TextInput, Alert, ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, spacing, typography, borderRadius } from '../../theme';
import { useAppSelector } from '../../hooks/useAppSelector';
import { getTheme } from '../../theme/getTheme';
import { MOCK_FUNDS } from '../../services/mockData';
import { Fund } from '../../types';
import { formatNGN } from '../../utils/formatters';

export default function TradeScreen({ navigation, route }: any) {
  const mode: 'buy' | 'sell' = route.params?.mode ?? 'buy';
  const { portfolio } = useAppSelector((s) => s.portfolio);
  const isDarkMode = useAppSelector((s) => s.ui.isDarkMode);
  const theme = getTheme(isDarkMode);

  const [selectedFund, setSelectedFund] = useState<Fund | null>(null);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<1 | 2 | 3>(1);

  const isBuy = mode === 'buy';
  const funds = isBuy ? MOCK_FUNDS : (portfolio?.holdings ?? []);

  const estimatedUnits = selectedFund && amount
    ? parseFloat(amount.replace(/,/g, '')) / selectedFund.currentNAV
    : 0;
  const fee = selectedFund && amount
    ? parseFloat(amount.replace(/,/g, '')) * 0.005
    : 0;

  const handleConfirm = async () => {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert(
      `${isBuy ? 'Buy' : 'Sell'} Order Placed`,
      `Your ${isBuy ? 'purchase' : 'sale'} of ${formatNGN(parseFloat(amount))} of ${selectedFund?.shortName} is being processed.\n\nReference: SIB${Date.now().toString().slice(-8)}`,
      [{ text: 'Done', onPress: () => navigation.goBack() }]
    );
  };

  const presetAmounts = [5000, 10000, 50000, 100000, 500000];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]} edges={['top', 'bottom']}>
      {/* Header — fixed back button */}
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: theme.bgCard, borderColor: theme.bgBorder }]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{isBuy ? 'Buy Fund' : 'Sell Fund'}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Step indicator */}
      <View style={[styles.steps, { borderBottomColor: theme.bgBorder }]}>
        {(['Select Fund', 'Amount', 'Confirm'] as const).map((label, i) => (
          <View key={label} style={styles.stepItem}>
            <View style={[
              styles.stepDot,
              { backgroundColor: theme.bgCard, borderColor: theme.bgBorder },
              step > i + 1 && { backgroundColor: colors.gain, borderColor: colors.gain },
              step === i + 1 && { backgroundColor: colors.primaryGlow, borderColor: colors.primaryGlow },
            ]}>
              {step > i + 1
                ? <Ionicons name="checkmark" size={12} color="#FFF" />
                : <Text style={[styles.stepNum, { color: step === i + 1 ? '#FFF' : theme.textSecondary }]}>{i + 1}</Text>
              }
            </View>
            <Text style={[styles.stepLabel, { color: step === i + 1 ? colors.primaryGlow : theme.textMuted }]}>
              {label}
            </Text>
          </View>
        ))}
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

          {/* Step 1 */}
          {step === 1 && (
            <View>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                {isBuy ? 'Choose a fund to invest in' : 'Choose a fund to sell'}
              </Text>
              {funds.map((fund: any) => (
                <TouchableOpacity
                  key={fund.id}
                  style={[
                    styles.fundOption,
                    { backgroundColor: theme.bgCard, borderColor: selectedFund?.id === fund.id ? colors.primaryGlow : theme.bgBorder },
                  ]}
                  onPress={async () => {
                    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setSelectedFund(fund);
                  }}
                >
                  <View style={[styles.fundColorDot, { backgroundColor: fund.color }]} />
                  <View style={styles.fundOptionInfo}>
                    <Text style={[styles.fundOptionName, { color: theme.textPrimary }]}>{fund.name}</Text>
                    <Text style={[styles.fundOptionNAV, { color: theme.textSecondary }]}>
                      NAV: ₦{fund.currentNAV.toFixed(4)}
                    </Text>
                    <Text style={[styles.fundOptionMin, { color: theme.textMuted }]}>
                      Min. investment: {formatNGN(fund.minimumInvestment)}
                    </Text>
                  </View>
                  {selectedFund?.id === fund.id && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primaryGlow} />
                  )}
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[styles.primaryButton, !selectedFund && styles.primaryButtonDisabled]}
                onPress={() => selectedFund && setStep(2)}
                disabled={!selectedFund}
              >
                <Text style={styles.primaryButtonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <View>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>
                How much to {isBuy ? 'invest' : 'sell'}?
              </Text>
              <View style={[styles.selectedFundBadge, { backgroundColor: theme.bgCard, borderColor: theme.bgBorder }]}>
                <View style={[styles.fundColorDot, { backgroundColor: selectedFund?.color }]} />
                <Text style={[styles.selectedFundName, { color: theme.textPrimary }]}>{selectedFund?.shortName}</Text>
                <Text style={[styles.selectedFundNAV, { color: theme.textSecondary }]}>
                  @ ₦{selectedFund?.currentNAV.toFixed(4)}
                </Text>
              </View>

              <View style={[styles.inputContainer, { backgroundColor: theme.bgCard, borderColor: colors.primaryGlow }]}>
                <Text style={[styles.currencySymbol, { color: theme.textSecondary }]}>₦</Text>
                <TextInput
                  style={[styles.amountInput, { color: theme.textPrimary }]}
                  value={amount}
                  onChangeText={(t) => setAmount(t.replace(/[^0-9.]/g, ''))}
                  placeholder="0.00"
                  placeholderTextColor={theme.textMuted}
                  keyboardType="numeric"
                  autoFocus
                />
              </View>

              <View style={styles.presets}>
                {presetAmounts.map((preset) => (
                  <TouchableOpacity
                    key={preset}
                    style={[
                      styles.presetChip,
                      { backgroundColor: theme.bgCard, borderColor: amount === String(preset) ? colors.primaryGlow : theme.bgBorder },
                      amount === String(preset) && { backgroundColor: colors.primaryGlow + '20' },
                    ]}
                    onPress={() => setAmount(String(preset))}
                  >
                    <Text style={[styles.presetText, { color: amount === String(preset) ? colors.primaryGlow : theme.textSecondary }]}>
                      {formatNGN(preset)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {amount && parseFloat(amount) > 0 && (
                <View style={[styles.estimate, { backgroundColor: theme.bgCard, borderColor: theme.bgBorder }]}>
                  <View style={styles.estimateRow}>
                    <Text style={[styles.estimateLabel, { color: theme.textSecondary }]}>Estimated units</Text>
                    <Text style={[styles.estimateValue, { color: theme.textPrimary }]}>
                      {estimatedUnits.toLocaleString('en-NG', { maximumFractionDigits: 2 })}
                    </Text>
                  </View>
                  <View style={styles.estimateRow}>
                    <Text style={[styles.estimateLabel, { color: theme.textSecondary }]}>Transaction fee (0.5%)</Text>
                    <Text style={[styles.estimateValue, { color: theme.textPrimary }]}>{formatNGN(fee)}</Text>
                  </View>
                  <View style={[styles.estimateRow, styles.estimateTotal, { borderTopColor: theme.bgBorder }]}>
                    <Text style={[styles.estimateTotalLabel, { color: theme.textPrimary }]}>
                      Total {isBuy ? 'debit' : 'credit'}
                    </Text>
                    <Text style={styles.estimateTotalValue}>
                      {formatNGN(parseFloat(amount) + (isBuy ? fee : -fee))}
                    </Text>
                  </View>
                </View>
              )}

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.secondaryButton, { backgroundColor: theme.bgCard, borderColor: theme.bgBorder }]}
                  onPress={() => setStep(1)}
                >
                  <Text style={[styles.secondaryButtonText, { color: theme.textSecondary }]}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryButton, { flex: 1 }, !amount && styles.primaryButtonDisabled]}
                  onPress={() => amount && setStep(3)}
                  disabled={!amount}
                >
                  <Text style={styles.primaryButtonText}>Review Order</Text>
                  <Ionicons name="arrow-forward" size={18} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <View>
              <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Review your order</Text>
              <View style={[styles.orderSummary, { backgroundColor: theme.bgCard, borderColor: theme.bgBorder }]}>
                <View style={styles.orderRow}>
                  <Text style={[styles.orderLabel, { color: theme.textSecondary }]}>Type</Text>
                  <View style={[styles.typeBadge, { backgroundColor: isBuy ? colors.gainSubtle : colors.lossSubtle }]}>
                    <Text style={[styles.typeText, { color: isBuy ? colors.gain : colors.loss }]}>
                      {isBuy ? 'BUY' : 'SELL'}
                    </Text>
                  </View>
                </View>
                {[
                  { label: 'Fund', value: selectedFund?.name ?? '' },
                  { label: 'Amount', value: formatNGN(parseFloat(amount)) },
                  { label: 'Est. Units', value: `${estimatedUnits.toFixed(2)} units` },
                  { label: 'NAV Price', value: `₦${selectedFund?.currentNAV.toFixed(4)}` },
                  { label: 'Transaction Fee', value: formatNGN(fee) },
                ].map(({ label, value }) => (
                  <View key={label} style={styles.orderRow}>
                    <Text style={[styles.orderLabel, { color: theme.textSecondary }]}>{label}</Text>
                    <Text style={[styles.orderValue, { color: theme.textPrimary }]}>{value}</Text>
                  </View>
                ))}
                <View style={[styles.orderRow, { borderTopWidth: 1, borderTopColor: theme.bgBorder, paddingTop: spacing.md, marginTop: spacing.sm }]}>
                  <Text style={[styles.orderTotalLabel, { color: theme.textPrimary }]}>
                    Total {isBuy ? 'Debit' : 'Credit'}
                  </Text>
                  <Text style={styles.orderTotalValue}>
                    {formatNGN(parseFloat(amount) + (isBuy ? fee : -fee))}
                  </Text>
                </View>
              </View>

              <Text style={[styles.disclaimer, { color: theme.textMuted }]}>
                Orders are processed at the next available NAV. Settlement takes T+2 business days.
              </Text>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={[styles.secondaryButton, { backgroundColor: theme.bgCard, borderColor: theme.bgBorder }]}
                  onPress={() => setStep(2)}
                >
                  <Text style={[styles.secondaryButtonText, { color: theme.textSecondary }]}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryButton, { flex: 1, backgroundColor: isBuy ? colors.gain : colors.loss }]}
                  onPress={handleConfirm}
                >
                  <Text style={styles.primaryButtonText}>Confirm {isBuy ? 'Buy' : 'Sell'}</Text>
                  <Ionicons name="lock-closed" size={16} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingBottom: spacing.md,
  },
  // Fixed: proper circle back button consistent across app
  backBtn: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  title: { fontSize: typography.size.lg, fontWeight: typography.weight.bold },
  steps: {
    flexDirection: 'row', justifyContent: 'center', gap: spacing.xl,
    paddingVertical: spacing.md, borderBottomWidth: 1, marginBottom: spacing.lg,
  },
  stepItem: { alignItems: 'center', gap: spacing.xs },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center', borderWidth: 1,
  },
  stepNum: { fontSize: typography.size.sm, fontWeight: typography.weight.bold },
  stepLabel: { fontSize: typography.size.xs },
  content: { flex: 1, paddingHorizontal: spacing.lg },
  sectionTitle: { fontSize: typography.size.lg, fontWeight: typography.weight.semibold, marginBottom: spacing.md },
  fundOption: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md,
    borderRadius: borderRadius.md, padding: spacing.md,
    marginBottom: spacing.sm, borderWidth: 1.5,
  },
  fundColorDot: { width: 12, height: 12, borderRadius: 6 },
  fundOptionInfo: { flex: 1 },
  fundOptionName: { fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  fundOptionNAV: { fontSize: typography.size.sm, marginTop: 2 },
  fundOptionMin: { fontSize: typography.size.xs, marginTop: 2 },
  primaryButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    gap: spacing.sm, backgroundColor: colors.primaryGlow,
    borderRadius: borderRadius.full, paddingVertical: spacing.md, marginTop: spacing.lg,
  },
  primaryButtonDisabled: { opacity: 0.4 },
  primaryButtonText: { fontSize: typography.size.md, fontWeight: typography.weight.bold, color: '#FFF' },
  secondaryButton: {
    paddingVertical: spacing.md, paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.full, borderWidth: 1,
  },
  secondaryButtonText: { fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  buttonRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  selectedFundBadge: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    padding: spacing.md, borderRadius: borderRadius.md,
    marginBottom: spacing.lg, borderWidth: 1,
  },
  selectedFundName: { fontSize: typography.size.md, fontWeight: typography.weight.semibold, flex: 1 },
  selectedFundNAV: { fontSize: typography.size.sm },
  inputContainer: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: borderRadius.lg, paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md, borderWidth: 1.5, marginBottom: spacing.md,
  },
  currencySymbol: { fontSize: 28, fontWeight: typography.weight.bold, marginRight: spacing.sm },
  amountInput: { flex: 1, fontSize: 32, fontWeight: typography.weight.heavy },
  presets: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.lg },
  presetChip: { paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderRadius: borderRadius.full, borderWidth: 1 },
  presetText: { fontSize: typography.size.sm },
  estimate: { borderRadius: borderRadius.md, padding: spacing.md, borderWidth: 1, gap: spacing.sm },
  estimateRow: { flexDirection: 'row', justifyContent: 'space-between' },
  estimateLabel: { fontSize: typography.size.sm },
  estimateValue: { fontSize: typography.size.sm, fontWeight: typography.weight.medium },
  estimateTotal: { borderTopWidth: 1, paddingTop: spacing.sm, marginTop: spacing.xs },
  estimateTotalLabel: { fontSize: typography.size.md, fontWeight: typography.weight.semibold },
  estimateTotalValue: { fontSize: typography.size.md, fontWeight: typography.weight.bold, color: colors.primaryGlow },
  orderSummary: { borderRadius: borderRadius.xl, padding: spacing.lg, borderWidth: 1, gap: spacing.md },
  orderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderLabel: { fontSize: typography.size.sm },
  orderValue: { fontSize: typography.size.sm, fontWeight: typography.weight.semibold, flex: 1, textAlign: 'right' },
  orderTotalLabel: { fontSize: typography.size.md, fontWeight: typography.weight.bold },
  orderTotalValue: { fontSize: typography.size.xl, fontWeight: typography.weight.heavy, color: colors.primaryGlow },
  typeBadge: { paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: borderRadius.full },
  typeText: { fontSize: typography.size.xs, fontWeight: typography.weight.heavy, letterSpacing: 0.5 },
  disclaimer: { fontSize: typography.size.xs, lineHeight: 18, marginTop: spacing.md, textAlign: 'center' },
});