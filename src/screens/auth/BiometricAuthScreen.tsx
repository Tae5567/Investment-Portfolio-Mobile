import React, { useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Haptics from 'expo-haptics';
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withRepeat, withTiming,
  withSequence, Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { loginSuccess, setLoading } from '../../store/slices/authSlice';
import { useAppSelector } from '../../hooks/useAppSelector';

export default function BiometricAuthScreen() {
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector((s) => s.auth);

  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const ringScale = useSharedValue(1);
  const translateY = useSharedValue(40);

  useEffect(() => {
    // Fade-in entrance animation
    opacity.value = withTiming(1, { duration: 800 });
    translateY.value = withSpring(0, { damping: 15 });

    // Pulsing ring animation
    ringScale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: 1500, easing: Easing.out(Easing.ease) }),
        withTiming(1, { duration: 1500, easing: Easing.in(Easing.ease) })
      ),
      -1, // infinite
      true
    );
  }, []);

  const containerStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
    opacity: 2 - ringScale.value, // Fades as it grows
  }));

  const buttonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const authenticate = async () => {
    try {
      dispatch(setLoading(true));
      scale.value = withSpring(0.9, {}, () => {
        scale.value = withSpring(1);
      });

      // Check hardware capability
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (!hasHardware || !isEnrolled) {
        // Fall through to PIN / mock auth for simulator
        await simulateAuth();
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Authenticate to access your portfolio',
        fallbackLabel: 'Use PIN',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (result.success) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        dispatch(loginSuccess());
      } else {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert('Authentication failed', 'Please try again.');
      }
    } catch (error) {
      console.error('Auth error:', error);
      await simulateAuth(); // Fallback for simulator
    } finally {
      dispatch(setLoading(false));
    }
  };

  // For running in Expo Go / simulator without biometrics
  const simulateAuth = async () => {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    dispatch(loginSuccess());
  };

  return (
    <LinearGradient
      colors={['#070D1A', '#0A1628', '#0F1B2D']}
      style={styles.container}
    >
      {/* Background decorative elements */}
      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <Animated.View style={[styles.content, containerStyle]}>
        {/* Logo/Brand */}
        <View style={styles.brand}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>S</Text>
          </View>
          <Text style={styles.brandName}>Stanbic IBTC</Text>
          <Text style={styles.brandSub}>Asset Management</Text>
        </View>

        {/* Biometric button with animated rings */}
        <View style={styles.biometricArea}>
          <Animated.View style={[styles.ring, ringStyle]} />
          <Animated.View style={[styles.ring, styles.ring2, ringStyle]} />

          <Animated.View style={buttonStyle}>
            <TouchableOpacity
              style={styles.biometricButton}
              onPress={authenticate}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={colors.primary} size="large" />
              ) : (
                <Ionicons name="finger-print" size={52} color={colors.primaryGlow} />
              )}
            </TouchableOpacity>
          </Animated.View>
        </View>

        <Text style={styles.instruction}>
          {isLoading ? 'Verifying...' : 'Touch to authenticate'}
        </Text>
        <Text style={styles.subInstruction}>
          Use Face ID, Touch ID, or your device PIN
        </Text>

        {/* Demo shortcut for simulator */}
        <TouchableOpacity
          style={styles.demoButton}
          onPress={simulateAuth}
        >
          <Text style={styles.demoText}>Demo: Skip Auth →</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Footer */}
      <Text style={styles.footer}>
        Protected by 256-bit encryption · NDIC insured
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bgCircle1: {
    position: 'absolute',
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: colors.primaryGlow,
    opacity: 0.04,
    top: -100,
    right: -100,
  },
  bgCircle2: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.gain,
    opacity: 0.04,
    bottom: -50,
    left: -80,
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
  },
  brand: {
    alignItems: 'center',
    marginBottom: spacing.xxl * 1.5,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primaryGlow,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 12,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  brandName: {
    fontSize: typography.size.xl,
    fontWeight: typography.weight.bold,
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  brandSub: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    marginTop: 2,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  biometricArea: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 160,
    height: 160,
    marginBottom: spacing.xl,
  },
  ring: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: colors.primaryGlow,
    opacity: 0.3,
  },
  ring2: {
    width: 120,
    height: 120,
    borderRadius: 60,
    opacity: 0.2,
  },
  biometricButton: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.bgBorder,
    shadowColor: colors.primaryGlow,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  instruction: {
    fontSize: typography.size.lg,
    fontWeight: typography.weight.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  subInstruction: {
    fontSize: typography.size.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  demoButton: {
    marginTop: spacing.xl,
    padding: spacing.md,
  },
  demoText: {
    fontSize: typography.size.sm,
    color: colors.primaryGlow,
    fontWeight: typography.weight.medium,
  },
  footer: {
    position: 'absolute',
    bottom: spacing.xl,
    fontSize: typography.size.xs,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
});