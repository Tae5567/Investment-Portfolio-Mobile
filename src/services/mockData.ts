//mock backend data for development and testing purposes

import { Fund, Portfolio, PortfolioHolding, Transaction, PricePoint, TimeRange } from '../types';
import { colors } from '../theme';

// Mock Funds 
export const MOCK_FUNDS: Fund[] = [
  {
    id: 'SIBTC-MMF',
    name: 'Stanbic IBTC Money Market Fund',
    shortName: 'Money Market',
    ticker: 'SIMMF',
    assetClass: 'money_market',
    currentNAV: 1.0412,
    previousNAV: 1.0408,
    unitsHeld: 4800000,
    purchasePrice: 1.0,
    inceptionDate: '2008-03-15',
    currency: 'NGN',
    riskLevel: 'low',
    managementFee: 1.0,
    minimumInvestment: 5000,
    description: 'Invests in short-term, high-quality money market instruments. Capital preservation focused.',
    color: colors.chart2,
  },
  {
    id: 'SIBTC-EF',
    name: 'Stanbic IBTC Equity Fund',
    shortName: 'Equity Fund',
    ticker: 'SIEF',
    assetClass: 'mutual_fund',
    currentNAV: 43.82,
    previousNAV: 42.95,
    unitsHeld: 115000,
    purchasePrice: 38.50,
    inceptionDate: '2004-06-01',
    currency: 'NGN',
    riskLevel: 'high',
    managementFee: 2.0,
    minimumInvestment: 10000,
    description: 'Primarily invests in Nigerian equities listed on the NGX. Long-term capital growth.',
    color: colors.chart1,
  },
  {
    id: 'SIBTC-BF',
    name: 'Stanbic IBTC Bond Fund',
    shortName: 'Bond Fund',
    ticker: 'SIBF',
    assetClass: 'bond',
    currentNAV: 22.14,
    previousNAV: 22.08,
    unitsHeld: 230000,
    purchasePrice: 19.80,
    inceptionDate: '2010-11-20',
    currency: 'NGN',
    riskLevel: 'moderate',
    managementFee: 1.5,
    minimumInvestment: 5000,
    description: 'Invests in FGN bonds, corporate bonds, and other fixed income securities.',
    color: colors.chart3,
  },
  {
    id: 'SIBTC-ETF',
    name: 'Stanbic IBTC ETF 30',
    shortName: 'ETF 30',
    ticker: 'SETF30',
    assetClass: 'etf',
    currentNAV: 156.40,
    previousNAV: 154.20,
    unitsHeld: 8500,
    purchasePrice: 130.00,
    inceptionDate: '2012-04-10',
    currency: 'NGN',
    riskLevel: 'high',
    managementFee: 0.5,
    minimumInvestment: 100,
    description: 'Tracks the top 30 companies on the NGX by market capitalization.',
    color: colors.chart5,
  },
];

//  Build Portfolio from Funds 
export function buildPortfolio(): Portfolio {
  const holdings: PortfolioHolding[] = MOCK_FUNDS.map((fund) => {
    const currentValue = fund.currentNAV * fund.unitsHeld;
    const costBasis = fund.purchasePrice * fund.unitsHeld;
    const unrealizedGain = currentValue - costBasis;
    const unrealizedGainPercent = (unrealizedGain / costBasis) * 100;
    const dayChange = (fund.currentNAV - fund.previousNAV) * fund.unitsHeld;
    const dayChangePercent = ((fund.currentNAV - fund.previousNAV) / fund.previousNAV) * 100;

    return {
      ...fund,
      currentValue,
      costBasis,
      unrealizedGain,
      unrealizedGainPercent,
      allocationPercent: 0, // calculated below
      dayChange,
      dayChangePercent,
    };
  });

  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.costBasis, 0);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = (totalGain / totalCost) * 100;
  const dayChange = holdings.reduce((sum, h) => sum + h.dayChange, 0);
  const dayChangePercent = (dayChange / (totalValue - dayChange)) * 100;

  // Set allocation percentages
  holdings.forEach((h) => {
    h.allocationPercent = (h.currentValue / totalValue) * 100;
  });

  return {
    totalValue,
    totalCost,
    totalGain,
    totalGainPercent,
    dayChange,
    dayChangePercent,
    holdings,
    lastUpdated: new Date(),
  };
}

// Generate Chart Data 
export function generatePriceHistory(
  basePrice: number,
  days: number,
  volatility: number = 0.015,
  trend: number = 0.0003
): PricePoint[] {
  const points: PricePoint[] = [];
  let price = basePrice * 0.75; // Start lower to show growth
  const now = new Date();

  for (let i = days; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    // Random walk with upward trend
    const change = price * (trend + (Math.random() - 0.48) * volatility);
    price = Math.max(price + change, basePrice * 0.5);

    points.push({
      date: date.toISOString().split('T')[0],
      value: parseFloat(price.toFixed(4)),
    });
  }

  // Ensure last point matches current NAV
  points[points.length - 1].value = basePrice;
  return points;
}

export function getChartData(fundId: string, range: TimeRange): PricePoint[] {
  const fund = MOCK_FUNDS.find((f) => f.id === fundId);
  if (!fund) return [];

  const daysMap: Record<TimeRange, number> = {
    '1W': 7, '1M': 30, '3M': 90, '6M': 180,
    '1Y': 365, '3Y': 1095, 'ALL': 1825,
  };

  return generatePriceHistory(fund.currentNAV, daysMap[range]);
}

// Mock Transactions 
export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN001',
    fundId: 'SIBTC-EF',
    fundName: 'Stanbic IBTC Equity Fund',
    type: 'buy',
    status: 'completed',
    units: 2500,
    pricePerUnit: 41.20,
    totalAmount: 103000,
    fee: 515,
    date: '2024-11-28',
    reference: 'SIB2024112801',
  },
  {
    id: 'TXN002',
    fundId: 'SIBTC-MMF',
    fundName: 'Stanbic IBTC Money Market Fund',
    type: 'buy',
    status: 'completed',
    units: 500000,
    pricePerUnit: 1.0395,
    totalAmount: 519750,
    fee: 0,
    date: '2024-11-20',
    reference: 'SIB2024112002',
  },
  {
    id: 'TXN003',
    fundId: 'SIBTC-BF',
    fundName: 'Stanbic IBTC Bond Fund',
    type: 'dividend',
    status: 'completed',
    units: 0,
    pricePerUnit: 0,
    totalAmount: 18500,
    fee: 0,
    date: '2024-11-15',
    reference: 'SIB2024111503',
  },
  {
    id: 'TXN004',
    fundId: 'SIBTC-ETF',
    fundName: 'Stanbic IBTC ETF 30',
    type: 'buy',
    status: 'pending',
    units: 500,
    pricePerUnit: 156.40,
    totalAmount: 78200,
    fee: 391,
    date: '2024-12-01',
    reference: 'SIB2024120104',
  },
];