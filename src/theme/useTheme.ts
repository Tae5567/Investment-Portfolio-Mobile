import { useAppSelector } from '../hooks/useAppSelector';
import { colors } from './index';

export function useTheme() {
  const isDarkMode = useAppSelector((s) => s.ui.isDarkMode);

  const theme = {
    isDarkMode,
    bg: isDarkMode ? colors.bgDeep : '#F2F2F7',
    bgCard: isDarkMode ? colors.bgCard : '#FFFFFF',
    bgElevated: isDarkMode ? colors.bgElevated : '#F8F8FC',
    bgBorder: isDarkMode ? colors.bgBorder : '#E0E0EC',
    textPrimary: isDarkMode ? colors.textPrimary : '#0A0A1A',
    textSecondary: isDarkMode ? colors.textSecondary : '#555570',
    textMuted: isDarkMode ? colors.textMuted : '#9999B0',
  };

  return theme;
}