import { getProfile, signIn, signUp } from '@/controller/apiController';
import { User } from '@/services/mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberCredentials?: boolean) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  getSavedCredentials: () => Promise<{email: string; password: string} | null>;
  clearSavedCredentials: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USER_STORAGE_KEY = '@user_session';
const CREDENTIALS_STORAGE_KEY = '@saved_credentials';

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load user session on app start
  useEffect(() => {
    loadUserSession();
  }, []);

  const loadUserSession = async () => {
    try {
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const storedToken = await AsyncStorage.getItem('@auth_token');
      
      if (storedUser && storedToken) {
        try {
          // Verificar si el token sigue siendo válido obteniendo el perfil del backend
          const response = await getProfile(storedToken);
          
          if (response.success && response.data) {
            const userData = response.data.user;
            
            // Adaptar estructura del usuario desde el backend
            const adaptedUser: User = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              avatar: userData.avatar?.url || undefined,
              preferences: userData.preferences || {
                favoriteStocks: [],
                watchlist: [],
                notifications: true,
                theme: 'system'
              },
              createdAt: userData.createdAt || new Date().toISOString(),
              lastLogin: userData.lastLogin || new Date().toISOString()
            };
            
            setUser(adaptedUser);
            await saveUserSession(adaptedUser);
          } else {
            // Token inválido - limpiar datos
            throw new Error('Token inválido');
          }
        } catch {
          console.log('Token inválido o expirado, limpiando sesión');
          await AsyncStorage.removeItem(USER_STORAGE_KEY);
          await AsyncStorage.removeItem('@auth_token');
          setUser(null);
        }
      }
    } catch (error) {
      console.error('Error loading user session:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUserSession = async (userData: User) => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user session:', error);
    }
  };

  const saveCredentials = async (email: string, password: string) => {
    try {
      console.log('Attempting to save credentials for:', email);
      await AsyncStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify({ email, password }));
      console.log('Credentials saved successfully');
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  };

  const getSavedCredentials = async (): Promise<{email: string; password: string} | null> => {
    try {
      console.log('Attempting to get saved credentials');
      const saved = await AsyncStorage.getItem(CREDENTIALS_STORAGE_KEY);
      const result = saved ? JSON.parse(saved) : null;
      console.log('Retrieved credentials:', result ? 'Found' : 'Not found');
      return result;
    } catch (error) {
      console.error('Error getting saved credentials:', error);
      return null;
    }
  };

  const clearSavedCredentials = async () => {
    try {
      await AsyncStorage.removeItem(CREDENTIALS_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing saved credentials:', error);
    }
  };

  const login = async (email: string, password: string, rememberCredentials: boolean = false) => {
    try {
      setIsLoading(true);
      console.log('Login called with rememberCredentials:', rememberCredentials);
      
      // Usar la función signIn del backend real
      const response = await signIn({ email, password });

      // El backend devuelve: { success: true, message: "...", data: { user: {...}, token: "..." } }
      if (response.success && response.data) {
        const userData = response.data.user;
        const token = response.data.token;
        
        // Guardar token JWT
        await AsyncStorage.setItem('@auth_token', token);
        
        // Adaptar estructura del usuario para el frontend
        const adaptedUser: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar?.url || undefined,
          preferences: userData.preferences || {
            favoriteStocks: [],
            watchlist: [],
            notifications: true,
            theme: 'system'
          },
          createdAt: userData.createdAt || new Date().toISOString(),
          lastLogin: userData.lastLogin || new Date().toISOString()
        };
        
        setUser(adaptedUser);
        await saveUserSession(adaptedUser);
        
        if (rememberCredentials) {
          console.log('Saving credentials for:', email);
          await saveCredentials(email, password);
        } else {
          console.log('Clearing saved credentials');
          await clearSavedCredentials();
        }
      } else {
        throw new Error(response.message || 'Error en el login');
      }
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      setIsLoading(true);
      
      // Usar la función signUp del backend real
      const response = await signUp({
        email,
        password,
        name,
        acceptTerms: true // Siempre true cuando llega aquí
      });

      // El backend devuelve: { success: true, message: "...", data: { user: {...}, token: "..." } }
      if (response.success && response.data) {
        const userData = response.data.user;
        const token = response.data.token;
        
        // Guardar token JWT
        await AsyncStorage.setItem('@auth_token', token);
        
        // Adaptar estructura del usuario para el frontend
        const adaptedUser: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar?.url || undefined, // URL de Cloudinary o undefined
          preferences: userData.preferences || {
            favoriteStocks: [],
            watchlist: [],
            notifications: true,
            theme: 'system'
          },
          createdAt: userData.createdAt || new Date().toISOString(),
          lastLogin: userData.lastLogin || new Date().toISOString()
        };
        
        setUser(adaptedUser);
        await saveUserSession(adaptedUser);
      } else {
        throw new Error(response.message || 'Error en el registro');
      }
    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // First set user to null to immediately update UI
      setUser(null);
      // Then clear storage (incluyendo token JWT)
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await AsyncStorage.removeItem('@auth_token');
      // Also clear saved credentials when logging out
      await clearSavedCredentials();
    } catch (error) {
      console.error('Error during logout:', error);
      // Even if storage fails, we want to clear the user state
      setUser(null);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;
    
    try {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      await saveUserSession(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated,
        login,
        register,
        logout,
        updateUser,
        getSavedCredentials,
        clearSavedCredentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
