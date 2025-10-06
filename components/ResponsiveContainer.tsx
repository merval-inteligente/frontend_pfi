import React from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, View, ViewStyle } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ResponsiveContainerProps {
  children: React.ReactNode;
  style?: ViewStyle;
  scrollable?: boolean;
  maxWidth?: number;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ 
  children, 
  style,
  scrollable = false,
  maxWidth = 1200
}) => {
  const IS_WEB = Platform.OS === 'web';
  const IS_DESKTOP = SCREEN_WIDTH >= 1024;
  
  const containerStyle: ViewStyle[] = [
    styles.container,
    ...(IS_WEB && IS_DESKTOP ? [{
      maxWidth,
      alignSelf: 'center' as const,
      width: '100%' as const,
    }] : []),
    ...(style ? [style] : [])
  ];

  if (scrollable) {
    return (
      <ScrollView style={containerStyle} contentContainerStyle={styles.scrollContent}>
        {children}
      </ScrollView>
    );
  }

  return <View style={containerStyle}>{children}</View>;
};

// Hook para obtener padding responsivo
export const useResponsivePadding = () => {
  const IS_DESKTOP = SCREEN_WIDTH >= 1024;
  const IS_TABLET = SCREEN_WIDTH >= 768 && SCREEN_WIDTH < 1024;
  
  return {
    horizontal: IS_DESKTOP ? 32 : IS_TABLET ? 24 : 16,
    vertical: IS_DESKTOP ? 24 : IS_TABLET ? 20 : 16,
    small: IS_DESKTOP ? 12 : IS_TABLET ? 10 : 8,
    large: IS_DESKTOP ? 48 : IS_TABLET ? 40 : 32,
  };
};

// Hook para web styles
export const useWebStyles = () => {
  const IS_WEB = Platform.OS === 'web';
  
  return {
    cursor: IS_WEB ? 'pointer' : undefined,
    userSelect: IS_WEB ? 'none' : undefined,
    transition: IS_WEB ? 'all 0.2s ease' : undefined,
    outlineStyle: IS_WEB ? 'none' : undefined,
  };
};

// Hook para safe area en web
export const useSafeAreaPadding = () => {
  const IS_WEB = Platform.OS === 'web';
  
  return {
    paddingTop: IS_WEB ? 0 : undefined, // En web, no usar SafeArea padding automático
  };
};

// Helper para obtener padding superior correcto
export const getHeaderPaddingTop = () => {
  const IS_WEB = Platform.OS === 'web';
  return IS_WEB ? 16 : 70; // Web: 16px normal, Mobile: 70px (SafeArea + status bar)
};

// Helper para obtener padding inferior para evitar que la tab bar tape el contenido
export const getBottomPaddingForTabBar = () => {
  const IS_WEB = Platform.OS === 'web';
  if (IS_WEB) {
    return 80; // 60px tab bar + 20px extra spacing
  }
  // Mobile: solo un pequeño espaciado ya que SafeArea maneja el padding de la tab bar
  return Platform.OS === 'ios' ? 20 : 24; // iOS: 20px, Android: 24px
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
  },
});

// Constantes útiles
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1440,
};

export const MAX_WIDTHS = {
  content: 1200,
  text: 800,
  narrow: 600,
};

export const isDesktop = () => SCREEN_WIDTH >= BREAKPOINTS.desktop;
export const isTablet = () => SCREEN_WIDTH >= BREAKPOINTS.tablet && SCREEN_WIDTH < BREAKPOINTS.desktop;
export const isMobile = () => SCREEN_WIDTH < BREAKPOINTS.tablet;
export const isWeb = () => Platform.OS === 'web';
