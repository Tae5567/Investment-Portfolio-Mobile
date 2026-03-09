// Portfolio slice for managing portfolio state in the Redux store

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PortfolioState, Portfolio, Fund } from '../../types';
import { buildPortfolio } from '../../services/mockData';

const initialState: PortfolioState = {
  portfolio: null,
  selectedFund: null,
  isLoading: false,
  error: null,
  lastUpdated: null,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    loadPortfolio: (state) => {
      state.portfolio = buildPortfolio();
      state.isLoading = false;
      state.lastUpdated = new Date().toISOString();
    },
    setSelectedFund: (state, action: PayloadAction<Fund | null>) => {
      state.selectedFund = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    // Simulate real-time price update
    updatePrices: (state) => {
      if (!state.portfolio) return;
      state.portfolio.holdings = state.portfolio.holdings.map((holding) => {
        const fluctuation = (Math.random() - 0.499) * 0.002;
        const newNAV = holding.currentNAV * (1 + fluctuation);
        const newValue = newNAV * holding.unitsHeld;
        const dayChange = newValue - holding.costBasis;
        return {
          ...holding,
          currentNAV: parseFloat(newNAV.toFixed(4)),
          currentValue: newValue,
          dayChange: newValue - holding.currentValue,
        };
      });
      // Recalculate totals
      const totalValue = state.portfolio.holdings.reduce((s, h) => s + h.currentValue, 0);
      state.portfolio.totalValue = totalValue;
      state.portfolio.dayChange = totalValue - state.portfolio.totalCost - state.portfolio.totalGain;
      state.lastUpdated = new Date().toISOString();
    },
  },
});

export const { loadPortfolio, setSelectedFund, setLoading, updatePrices } = portfolioSlice.actions;
export default portfolioSlice.reducer;