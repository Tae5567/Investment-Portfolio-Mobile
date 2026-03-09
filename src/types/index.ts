// Authentication
export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  accountNumber: string;
  kycStatus: 'verified' | 'pending' | 'rejected';
  avatarInitials: string;
}

// Portfolio
export type AssetClass = 'mutual_fund' | 'money_market' | 'stock' | 'bond' | 'etf';

export interface Fund {
  id: string;
  name: string;
  shortName: string;
  ticker: string;
  assetClass: AssetClass;
  currentNAV: number;       // Net Asset Value per unit in NGN
  previousNAV: number;
  unitsHeld: number;
  purchasePrice: number;    // Average cost per unit
  inceptionDate: string;
  currency: 'NGN' | 'USD';
  riskLevel: 'low' | 'moderate' | 'high';
  managementFee: number;    // Annual %, e.g. 1.5
  minimumInvestment: number;
  description: string;
  color: string;            // For charts
}

export interface PortfolioHolding extends Fund {
  currentValue: number;     // currentNAV * unitsHeld
  costBasis: number;        // purchasePrice * unitsHeld
  unrealizedGain: number;   // currentValue - costBasis
  unrealizedGainPercent: number;
  allocationPercent: number; // % of total portfolio
  dayChange: number;
  dayChangePercent: number;
}

export interface Portfolio {
  totalValue: number;
  totalCost: number;
  totalGain: number;
  totalGainPercent: number;
  dayChange: number;
  dayChangePercent: number;
  holdings: PortfolioHolding[];
  lastUpdated: Date;
}

// Charts / Performance
export interface PricePoint {
  date: string;
  value: number;
}

export type TimeRange = '1W' | '1M' | '3M' | '6M' | '1Y' | '3Y' | 'ALL';

export interface FundPerformance {
  fundId: string;
  range: TimeRange;
  data: PricePoint[];
  benchmarkData?: PricePoint[]; // e.g., NSE All-Share Index
  returnPercent: number;
  benchmarkReturnPercent?: number;
}

// Transactions 
export type TransactionType = 'buy' | 'sell' | 'dividend' | 'rebalance';
export type TransactionStatus = 'completed' | 'pending' | 'failed' | 'processing';

export interface Transaction {
  id: string;
  fundId: string;
  fundName: string;
  type: TransactionType;
  status: TransactionStatus;
  units: number;
  pricePerUnit: number;
  totalAmount: number;
  fee: number;
  date: string;
  reference: string;
}

// Investment Calculator 
export interface CalculatorInput {
  monthlyAmount: number;
  years: number;
  expectedReturn: number;   // Annual %, e.g. 12
  inflationRate: number;    // Annual %, e.g. 18 (Nigeria)
}

export interface CalculatorResult {
  totalInvested: number;
  projectedValue: number;
  totalReturn: number;
  returnPercent: number;
  inflationAdjustedValue: number;
  yearlyBreakdown: {
    year: number;
    value: number;
    invested: number;
  }[];
}

// Redux Store 
export interface RootState {
  auth: AuthState;
  portfolio: PortfolioState;
  ui: UIState;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  biometricEnabled: boolean;
  isLoading: boolean;
}

export interface PortfolioState {
  portfolio: Portfolio | null;
  selectedFund: Fund | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

export interface UIState {
  isDarkMode: boolean;
  hideBalances: boolean;
}