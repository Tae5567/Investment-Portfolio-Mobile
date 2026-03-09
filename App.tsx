import 'react-native-gesture-handler'; 
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

import { store } from './src/store';
import AppNavigator from './src/navigation/AppNavigator';
import { useRealTimePrices } from './src/hooks/useRealTimePrices';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000, // 30 seconds
      retry: 2,
    },
  },
});

export default function App() {
  return (
    // GestureHandlerRootView is required for react-native-gesture-handler
    <GestureHandlerRootView style={styles.root}>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="light" />
          <AppNavigator />
        </QueryClientProvider>
      </Provider>
    </GestureHandlerRootView>
  );
}

function AppWithRealTimePrices() {
  useRealTimePrices(); // runs silently, powers all screens
  return <AppWithRealTimePrices />;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});