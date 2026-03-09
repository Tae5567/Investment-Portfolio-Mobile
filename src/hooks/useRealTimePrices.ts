import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAppDispatch } from './useAppDispatch';
import { useAppSelector } from './useAppSelector';
import { updatePrices } from '../store/slices/portfolioSlice';

const UPDATE_INTERVAL_MS = 5000; // Every 5 seconds

export function useRealTimePrices() {
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAppSelector((s) => s.auth);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>('active');

  const startUpdates = () => {
    if (intervalRef.current) return; // already running
    intervalRef.current = setInterval(() => {
      dispatch(updatePrices());
    }, UPDATE_INTERVAL_MS);
  };

  const stopUpdates = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  useEffect(() => {
    if (!isAuthenticated) return;

    // Start on mount
    startUpdates();

    // Pause when app goes to background (saves battery)
    const subscription = AppState.addEventListener('change', (nextState) => {
      appStateRef.current = nextState;
      if (nextState === 'active') {
        // Immediately update when user returns
        dispatch(updatePrices());
        startUpdates();
      } else {
        stopUpdates();
      }
    });

    return () => {
      stopUpdates();
      subscription.remove();
    };
  }, [isAuthenticated]);
}