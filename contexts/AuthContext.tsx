import { getProfile, signIn, signUp } from '@/controller/apiController';
import { User } from '@/services/mockData';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, rememberCredentials?: boolean) => Promise<void>;
  register: (email: string, password: string, name: string, investmentKnowledge?: string, riskAppetite?: string) => Promise<void>;
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

  const loadUserSession = useCallback(async () => {
    try {
      const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const storedToken = await AsyncStorage.getItem('@auth_token');
      
      if (storedUser && storedToken) {
        try {
          // Verificar si el token sigue siendo válido obteniendo el perfil del backend
          const response = await getProfile(storedToken);
          
          if (response.success && response.data) {
            const userData = response.data.user;
            console.log('👤 Datos completos del usuario desde backend:', JSON.stringify(userData, null, 2));
            
            // Adaptar estructura del usuario desde el backend
            const adaptedUser: User = {
              id: userData.id,
              name: userData.name,
              email: userData.email,
              avatar: userData.avatar?.url || undefined,
              investmentKnowledge: userData.investmentKnowledge,
              riskAppetite: userData.riskAppetite,
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
        } catch (error: any) {
          // Solo hacer logout automático si es un error específico de autenticación
          // Los errores de JSON parse y servidor no deben causar logout
          const errorMessage = error?.message || '';
          const isRealAuthError = errorMessage.includes('401') || 
                                errorMessage.includes('403') || 
                                errorMessage.includes('Unauthorized') ||
                                (errorMessage.includes('Token inválido') && !errorMessage.includes('JSON'));
          
          if (isRealAuthError) {
            await AsyncStorage.removeItem(USER_STORAGE_KEY);
            await AsyncStorage.removeItem('@auth_token');
            setUser(null);
          } else {
            console.warn('Error del servidor al verificar sesión, manteniendo usuario logueado. Error:', errorMessage);
            // Mantener el usuario logueado - solo marcar como no loading
            // Si hay un usuario guardado localmente, mantenerlo
            if (storedUser) {
              const localUser = JSON.parse(storedUser);
              setUser(localUser);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading user session:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load user session on app start
  useEffect(() => {
    loadUserSession();
  }, [loadUserSession]);

  const saveUserSession = async (userData: User) => {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user session:', error);
    }
  };

  const saveCredentials = async (email: string, password: string) => {
    try {
      await AsyncStorage.setItem(CREDENTIALS_STORAGE_KEY, JSON.stringify({ email, password }));
    } catch (error) {
      console.error('Error saving credentials:', error);
    }
  };

  const getSavedCredentials = async (): Promise<{email: string; password: string} | null> => {
    try {
      const saved = await AsyncStorage.getItem(CREDENTIALS_STORAGE_KEY);
      const result = saved ? JSON.parse(saved) : null;
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
          await saveCredentials(email, password);
        } else {
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

  const register = async (email: string, password: string, name: string, investmentKnowledge?: string, riskAppetite?: string) => {
    try {
      setIsLoading(true);
      
      
      // Validaciones básicas antes de enviar
      if (!email || !password || !name) {
        throw new Error('Todos los campos son requeridos');
      }
      
      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }
      
      // Validar que el nombre solo contenga letras y espacios
      const nameRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      if (!nameRegex.test(name)) {
        throw new Error('El nombre solo puede contener letras y espacios');
      }
      
      // Validar email básico
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Por favor ingresa un email válido');
      }
      
      const requestData = {
        email,
        password,
        name,
        acceptTerms: true, // Siempre true cuando llega aquí
        ...(investmentKnowledge && { investmentKnowledge }),
        ...(riskAppetite && { riskAppetite })
      };
      
      // Usar la función signUp del backend real
      const response = await signUp(requestData);

      // El backend devuelve: { success: true, message: "...", data: { user: {...}, token: "..." } }
      if (response.success && response.data) {
        const userData = response.data.user;
        const token = response.data.token;
        console.log('👤 Datos del usuario recién registrado:', JSON.stringify(userData, null, 2));
        
        // Guardar token JWT
        await AsyncStorage.setItem('@auth_token', token);
        console.log('✅ Token guardado correctamente');
        
        console.log('👤 Adaptando estructura del usuario...');
        // Adaptar estructura del usuario para el frontend
        const adaptedUser: User = {
          id: userData.id,
          name: userData.name,
          email: userData.email,
          avatar: userData.avatar?.url || undefined, // URL de Cloudinary o undefined
          investmentKnowledge: userData.investmentKnowledge,
          riskAppetite: userData.riskAppetite,
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
