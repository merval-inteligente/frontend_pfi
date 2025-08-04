import { getUserFavorites } from '@/controller/apiController';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

interface PreferencesSyncContextType {
  userFavorites: string[];
  refreshFavorites: () => Promise<void>;
  updateFavorites: (newFavorites: string[]) => void;
  isLoading: boolean;
}

const PreferencesSyncContext = createContext<PreferencesSyncContextType | undefined>(undefined);

interface PreferencesSyncProviderProps {
  children: ReactNode;
}

export const PreferencesSyncProvider: React.FC<PreferencesSyncProviderProps> = ({ children }) => {
  const [userFavorites, setUserFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  // Limpiar favoritos cuando el usuario no esté autenticado
  useEffect(() => {
    if (!isAuthenticated) {
      setUserFavorites([]);
    }
  }, [isAuthenticated]);

  const refreshFavorites = useCallback(async () => {
    // Solo ejecutar si está autenticado
    if (!isAuthenticated) {
      console.log('Usuario no autenticado, limpiando favoritos');
      setUserFavorites([]);
      return;
    }

    setIsLoading(true);
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      if (!token) {
        console.warn('No hay token disponible');
        setUserFavorites([]);
        return;
      }

      const favoritesResponse = await getUserFavorites(token);
      const favorites = favoritesResponse.favorites?.favoriteStocks || [];
      console.log('📋 Favoritos actualizados:', favorites);
      setUserFavorites(favorites);
    } catch (error) {
      console.error('Error refreshing favorites:', error);
      // No limpiar favoritos en caso de error, mantener los existentes
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Cargar favoritos automáticamente cuando el usuario se autentica
  useEffect(() => {
    if (isAuthenticated) {
      console.log('✅ Usuario autenticado, cargando favoritos...');
      refreshFavorites();
    }
  }, [isAuthenticated, refreshFavorites]);

  const updateFavorites = useCallback((newFavorites: string[]) => {
    setUserFavorites(newFavorites);
  }, []);

  const value: PreferencesSyncContextType = {
    userFavorites,
    refreshFavorites,
    updateFavorites,
    isLoading,
  };

  return (
    <PreferencesSyncContext.Provider value={value}>
      {children}
    </PreferencesSyncContext.Provider>
  );
};

export const usePreferencesSync = (): PreferencesSyncContextType => {
  const context = useContext(PreferencesSyncContext);
  if (context === undefined) {
    throw new Error('usePreferencesSync must be used within a PreferencesSyncProvider');
  }
  return context;
};
