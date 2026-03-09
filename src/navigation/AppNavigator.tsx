import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

import { useAppSelector } from '../hooks/useAppSelector';
import { colors, borderRadius } from '../theme';
import { getTheme } from '../theme/getTheme';

import BiometricAuthScreen from '../screens/auth/BiometricAuthScreen';
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import TradeScreen from '../screens/trade/TradeScreen';
import CalculatorScreen from '../screens/calculator/CalculatorScreen';
import TransactionsScreen from '../screens/transactions/TransactionScreen';
import FundDetailScreen from '../screens/portfolio/FundDetailScreen';
import RebalanceScreen from '../screens/portfolio/RebalanceScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  const isDarkMode = useAppSelector((s) => s.ui.isDarkMode);
  const theme = getTheme(isDarkMode);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: isDarkMode ? 'transparent' : 'rgba(255,255,255,0.95)',
          borderTopWidth: 1,
          borderTopColor: theme.bgBorder,
          elevation: 0,
          height: Platform.OS === 'ios' ? 85 : 65,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarBackground: () =>
          isDarkMode ? (
            <BlurView
              tint="dark"
              intensity={80}
              style={[
                StyleSheet.absoluteFill,
                {
                  borderTopWidth: 1,
                  borderTopColor: colors.bgBorder,
                  overflow: 'hidden',
                },
              ]}
            />
          ) : null,
        tabBarActiveTintColor: colors.primaryGlow,
        tabBarInactiveTintColor: isDarkMode ? colors.textMuted : '#999',
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '600',
        },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, { active: string; inactive: string }> = {
            Dashboard: { active: 'grid', inactive: 'grid-outline' },
            Calculator: { active: 'calculator', inactive: 'calculator-outline' },
            Transactions: { active: 'receipt', inactive: 'receipt-outline' },
          };
          const icon = icons[route.name];
          const name = (focused ? icon?.active : icon?.inactive) ?? 'ellipse';
          return <Ionicons name={name as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Calculator" component={CalculatorScreen} />
      <Tab.Screen name="Transactions" component={TransactionsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated } = useAppSelector((s) => s.auth);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="Auth" component={BiometricAuthScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="Trade" component={TradeScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="FundDetail" component={FundDetailScreen} />
            <Stack.Screen name="Rebalance" component={RebalanceScreen} options={{ presentation: 'modal' }} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}