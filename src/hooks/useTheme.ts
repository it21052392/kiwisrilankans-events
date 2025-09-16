import { theme } from '../config/theme';

export const useTheme = () => {
  return theme;
};

// Helper functions for easy theme access
export const getColor = (colorPath: string) => {
  const keys = colorPath.split('.');
  let value: any = theme.colors;
  
  for (const key of keys) {
    value = value?.[key];
  }
  
  return value || theme.colors.primary[500];
};

export const getSpacing = (size: keyof typeof theme.spacing) => {
  return theme.spacing[size];
};

export const getFontSize = (size: keyof typeof theme.typography.fontSize) => {
  return theme.typography.fontSize[size];
};

export const getBorderRadius = (size: keyof typeof theme.borderRadius) => {
  return theme.borderRadius[size];
};

export const getBoxShadow = (size: keyof typeof theme.boxShadow) => {
  return theme.boxShadow[size];
};

export const getZIndex = (level: keyof typeof theme.zIndex) => {
  return theme.zIndex[level];
};
