import { colors } from './index';

export function getTheme(isDarkMode: boolean) {
  return {
    isDarkMode,
    bg: isDarkMode ? colors.bgDeep : '#F2F2F7',
    bgCard: isDarkMode ? colors.bgCard : '#FFFFFF',
    bgElevated: isDarkMode ? colors.bgElevated : '#F0F0F8',
    bgBorder: isDarkMode ? colors.bgBorder : '#E0E0EC',
    textPrimary: isDarkMode ? colors.textPrimary : '#0A0A1A',
    textSecondary: isDarkMode ? colors.textSecondary : '#555570',
    textMuted: isDarkMode ? colors.textMuted : '#9999B0',
  };
}

// Keep useTheme as a convenience hook
import { useAppSelector } from '../hooks/useAppSelector';
export function useTheme() {
  const isDarkMode = useAppSelector((s) => s.ui.isDarkMode);
  return getTheme(isDarkMode);
}