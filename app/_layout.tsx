import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import 'react-native-reanimated';

import { CustomSplashScreen } from '@/components/CustomSplashScreen';
import { AuthProvider } from '@/contexts/AuthContext';
import { PreferencesSyncProvider } from '@/contexts/PreferencesSyncContext';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';

function RootLayoutContent() {
  const { colorScheme } = useTheme();
  
  // Apply web-specific body styles
  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const body = document.body;
      const html = document.documentElement;
      
      // Remove default margins and set full height
      body.style.margin = '0';
      body.style.padding = '0';
      body.style.width = '100%';
      body.style.height = '100vh';
      body.style.overflow = 'hidden';
      body.style.position = 'fixed';
      
      html.style.margin = '0';
      html.style.padding = '0';
      html.style.width = '100%';
      html.style.height = '100vh';
      html.style.overflow = 'hidden';
      
      // Disable text selection on web for better app-like feel
      body.style.userSelect = 'none';
      body.style.webkitUserSelect = 'none';
      
      // Smooth scrolling
      html.style.scrollBehavior = 'smooth';
      
      // Prevent pull-to-refresh on mobile web
      body.style.overscrollBehavior = 'none';
    }
  }, []);
  
  return (
    <NavigationThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="welcome" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="forgot-password" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="personal-info" options={{ headerShown: false }} />
        <Stack.Screen name="security" options={{ headerShown: false }} />
        <Stack.Screen name="alerts-config" options={{ headerShown: false }} />
        <Stack.Screen name="investment-strategy" options={{ headerShown: false }} />
        <Stack.Screen name="help-center" options={{ headerShown: false }} />
        <Stack.Screen name="stock-detail" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });
  
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = useCallback(() => {
    setShowSplash(false);
  }, []);

  if (!loaded) {
    // Async font loading only occurs in development.
    return null;
  }

  if (showSplash) {
    return <CustomSplashScreen onFinish={handleSplashFinish} />;
  }

  return (
    <ThemeProvider>
      <AuthProvider>
        <PreferencesSyncProvider>
          <RootLayoutContent />
        </PreferencesSyncProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
