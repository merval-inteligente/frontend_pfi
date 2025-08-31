import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { usePreferencesSync } from '@/contexts/PreferencesSyncContext';
import { useTheme } from '@/contexts/ThemeContext';
import { addSectorToFavorites, addStockToFavorites, getSectors, getStocks, getUserFavorites, removeFavoriteSector, removeFavoriteStock } from '@/controller/apiController';
import { getDefaultUserPreferences } from '@/services/mockup';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface StockItem {
  symbol: string;
  name: string;
  sector: string;
  isSelected: boolean;
}

interface SectorItem {
  name: string;
  isSelected: boolean;
}

export default function PreferencesScreen() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const { updateFavorites: originalUpdateFavorites } = usePreferencesSync();
  const colors = Colors[colorScheme];

  // Crear versión estable de updateFavorites para evitar re-renders
  const updateFavorites = useCallback((favorites: string[]) => {
    originalUpdateFavorites(favorites);
  }, [originalUpdateFavorites]);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'sectors' | 'stocks'>('sectors');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isLoadingRef = useRef(false); // Usar ref en lugar de estado para evitar ciclos
  
  const userProfile = getDefaultUserPreferences();

  const [sectors, setSectors] = useState<SectorItem[]>([]);
  const [stocks, setStocks] = useState<StockItem[]>([]);

  // Función para obtener el token almacenado
  const getStoredToken = async (): Promise<string | null> => {
    try {
      const token = await AsyncStorage.getItem('@auth_token');
      return token;
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  };

  // Cargar datos desde el backend
  useEffect(() => {
    const loadData = async () => {
      // Prevenir llamadas duplicadas usando ref
        if (isLoadingRef.current) {
          return;
        }      try {
        isLoadingRef.current = true;
        setLoading(true);
        setError(null);

        if (isAuthenticated) {
          // Usuario autenticado: cargar desde backend
          
          // Obtener token almacenado
          const token = await getStoredToken();
          if (!token) {
            throw new Error('Token no disponible');
          }

          // Agregar delay para evitar rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));

          const [sectorsResponse, stocksResponse, favoritesResponse] = await Promise.all([
            getSectors(token),
            getStocks(token),
            getUserFavorites(token).catch(error => {
              // Si getUserFavorites falla, continúar con datos vacíos
              console.warn('⚠️ Error obteniendo favoritos, usando datos vacíos:', error);
              return { favorites: { favoriteStocks: [] }, message: 'Error obteniendo favoritos' };
            })
          ]);

          // Extraer lista de símbolos favoritos - la estructura real es favorites.favoriteStocks
          const userFavoritesSymbols = favoritesResponse.favorites?.favoriteStocks || [];
          updateFavorites(userFavoritesSymbols);

          // Primero mapear los stocks para poder calcular qué sectores están en uso
          const stocksData = stocksResponse.stocks.map((stock: any) => ({
            symbol: stock.symbol,
            name: stock.name,
            sector: stock.sector,
            isSelected: userFavoritesSymbols.includes(stock.symbol) // Usar datos frescos de la API
          }));

          // Calcular qué sectores tienen al menos una acción favorita
          const sectorsWithFavorites = new Set(
            stocksData
              .filter((stock: StockItem) => stock.isSelected)
              .map((stock: StockItem) => stock.sector)
          );

          // Transformar los datos del backend al formato esperado por la UI
          const sectorsData = sectorsResponse.sectors.map((sector: any) => ({
            name: sector.name,
            isSelected: sectorsWithFavorites.has(sector.name), // Marcar como seleccionado si tiene favoritos
            count: sector.count || 0
          }));

          setSectors(sectorsData);
          setStocks(stocksData);
        } else {
          // Usuario no autenticado: mostrar mensaje de que necesita autenticarse
          throw new Error('Se requiere autenticación para ver las preferencias');
        }
      } catch (error) {
        console.error('❌ Error cargando datos:', error);
        
        // Mostrar error al usuario
        setError('Error al cargar los datos del servidor. Por favor, verifica tu conexión e intenta nuevamente.');
        
        // Mantener arrays vacíos en caso de error
        setSectors([]);
        setStocks([]);
      } finally {
        setLoading(false);
        isLoadingRef.current = false;
      }
    };

    loadData();
  }, [isAuthenticated, updateFavorites]); // Mantener updateFavorites pero usar ref para loading

  // Función helper para recalcular sectores seleccionados basado en stocks
  const recalculateSectorsFromStocks = (updatedStocks: StockItem[]) => {
    const sectorsWithFavorites = new Set(
      updatedStocks
        .filter(stock => stock.isSelected)
        .map(stock => stock.sector)
    );

    setSectors(prev => prev.map(sector => ({
      ...sector,
      isSelected: sectorsWithFavorites.has(sector.name)
    })));
  };

  const handleRemoveStock = async (stock: StockItem) => {
    Alert.alert(
      'Eliminar de Favoritos',
      `¿Deseas eliminar ${stock.name} (${stock.symbol}) de tus favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getStoredToken();
              if (!token) {
                Alert.alert('Error', 'Token no disponible. Por favor, inicia sesión nuevamente.');
                return;
              }

              const result = await removeFavoriteStock(token, stock.symbol);
              
              if (result.status === 200) {
                // Actualizar favoritos locales
                updateFavorites(result.data.preferences.favoriteStocks);
                
                // Actualizar estado de stocks
                const updatedStocks = stocks.map(s => ({
                  ...s,
                  isSelected: result.data.preferences.favoriteStocks.includes(s.symbol)
                }));
                setStocks(updatedStocks);
                
                // Recalcular sectores basado en los stocks actualizados
                recalculateSectorsFromStocks(updatedStocks);
                
                Alert.alert(
                  'Éxito',
                  `${stock.name} (${stock.symbol}) eliminado de tus favoritos`
                );
              }
            } catch (error) {
              console.error('Error eliminando stock de favoritos:', error);
              Alert.alert(
                'Error',
                'Hubo un problema al eliminar de favoritos. Por favor, intenta nuevamente.'
              );
            }
          }
        }
      ]
    );
  };

  const handleRemoveSector = async (sector: SectorItem) => {
    Alert.alert(
      'Eliminar Sector de Favoritos',
      `¿Deseas eliminar todas las acciones del sector ${sector.name} de tus favoritos?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Eliminar', 
          style: 'destructive',
          onPress: async () => {
            try {
              const token = await getStoredToken();
              if (!token) {
                Alert.alert('Error', 'Token no disponible. Por favor, inicia sesión nuevamente.');
                return;
              }

              const result = await removeFavoriteSector(token, sector.name);
              
              if (result.status === 200) {
                // Actualizar favoritos locales
                updateFavorites(result.data.preferences.favoriteStocks);
                
                // Actualizar estado de los stocks para reflejar los favoritos eliminados
                const updatedStocks = stocks.map(stock => ({
                  ...stock,
                  isSelected: result.data.preferences.favoriteStocks.includes(stock.symbol)
                }));
                setStocks(updatedStocks);
                
                // Recalcular sectores basado en los stocks actualizados
                recalculateSectorsFromStocks(updatedStocks);
                
                Alert.alert(
                  'Éxito',
                  `Sector ${sector.name} eliminado de tus favoritos. Se eliminaron ${result.data.removedSymbols?.length || 0} acciones.`
                );
              }
            } catch (error) {
              console.error('Error eliminando sector de favoritos:', error);
              Alert.alert(
                'Error',
                'Hubo un problema al eliminar el sector de favoritos. Por favor, intenta nuevamente.'
              );
            }
          }
        }
      ]
    );
  };

  const handleAddToPreferences = async (item: SectorItem | StockItem, type: 'sector' | 'stock') => {
    const isAlreadySelected = item.isSelected;
    const action = isAlreadySelected ? 'quitar de' : 'agregar a';
    const actionText = isAlreadySelected ? 'Quitar' : 'Agregar';
    const itemName = type === 'sector' ? item.name : `${(item as StockItem).name} (${(item as StockItem).symbol})`;
    
    // Ahora redirigimos a las funciones específicas de eliminación
    if (isAlreadySelected) {
      if (type === 'sector') {
        handleRemoveSector(item as SectorItem);
      } else {
        handleRemoveStock(item as StockItem);
      }
      return;
    }
    
    Alert.alert(
      `${actionText} Preferencias`,
      `¿Deseas ${action} tus preferencias ${itemName}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: actionText, 
          onPress: async () => {
            try {
              // Obtener token
              const token = await getStoredToken();
              if (!token) {
                Alert.alert('Error', 'Token no disponible. Por favor, inicia sesión nuevamente.');
                return;
              }

              if (type === 'sector') {
                // Agregar sector completo
                const result = await addSectorToFavorites(item.name, token);
                
                if (result.success) {
                  // Actualizar favoritos locales
                  updateFavorites(result.favorites);
                  
                  // Actualizar estado de los stocks para reflejar los nuevos favoritos
                  const updatedStocks = stocks.map(stock => ({
                    ...stock,
                    isSelected: result.favorites.includes(stock.symbol)
                  }));
                  setStocks(updatedStocks);
                  
                  // Recalcular sectores basado en los stocks actualizados
                  recalculateSectorsFromStocks(updatedStocks);
                  
                  Alert.alert(
                    'Éxito',
                    `Sector ${item.name} agregado a tus favoritos. Se agregaron ${result.addedSymbols?.length || 0} acciones.`
                  );
                }
              } else {
                // Agregar acción específica
                const stock = item as StockItem;
                const result = await addStockToFavorites(stock.symbol, token);
                
                if (result.success) {
                  // Actualizar favoritos locales
                  updateFavorites(result.favorites);
                  
                  // Actualizar estado de stocks
                  const updatedStocks = stocks.map(s => 
                    s.symbol === stock.symbol 
                      ? { ...s, isSelected: true }
                      : { ...s, isSelected: result.favorites.includes(s.symbol) }
                  );
                  setStocks(updatedStocks);
                  
                  // Recalcular sectores basado en los stocks actualizados
                  recalculateSectorsFromStocks(updatedStocks);
                  
                  Alert.alert(
                    'Éxito',
                    `${stock.name} (${stock.symbol}) agregado a tus favoritos`
                  );
                } else if (result.alreadyExists) {
                  Alert.alert('Información', result.message);
                }
              }
            } catch (error) {
              console.error('Error agregando a favoritos:', error);
              Alert.alert(
                'Error',
                'Hubo un problema al agregar a favoritos. Por favor, intenta nuevamente.'
              );
            }
          }
        }
      ]
    );
  };

  const getFilteredItems = () => {
    if (activeTab === 'sectors') {
      return sectors.filter(sector => 
        sector.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      return stocks.filter(stock =>
        stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        stock.symbol.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
  };

  const renderItem = (item: SectorItem | StockItem) => {
    const isStock = 'symbol' in item;
    const isSelected = item.isSelected;

    // Función para obtener colores de botones
    const getButtonColors = () => {
      if (isSelected) {
        return {
          backgroundColor: '#fef2f2',
          borderColor: '#ef4444',
          textColor: '#ef4444',
          iconColor: '#ef4444'
        };
      } else {
        return {
          backgroundColor: colors.tint,
          borderColor: colors.tint,
          textColor: '#ffffff',
          iconColor: '#ffffff'
        };
      }
    };

    // Obtener icono para sectores
    const getSectorIcon = (sectorName: string) => {
      switch (sectorName) {
        case 'Tecnología': return 'laptop-outline';
        case 'Energía': return 'flash-outline';
        case 'Finanzas': return 'card-outline';
        case 'Materiales': return 'hammer-outline';
        case 'Alimentos': return 'restaurant-outline';
        case 'Telecomunicaciones': return 'call-outline';
        case 'Retail': return 'storefront-outline';
        case 'Salud': return 'medical-outline';
        default: return 'business-outline';
      }
    };
    
    return (
      <View
        key={isStock ? (item as StockItem).symbol : item.name}
        style={[
          styles.itemCard, 
          { 
            backgroundColor: colors.card,
            borderColor: colors.cardBorder,
            shadowColor: colorScheme === 'dark' ? '#000' : '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: colorScheme === 'dark' ? 0.3 : 0.1,
            shadowRadius: 3,
            elevation: 2,
          }
        ]}
      >
        <View style={styles.itemInfo}>
          <View style={styles.itemHeader}>
            <View style={styles.itemTitleContainer}>
              {!isStock && (
                <View style={[styles.sectorIconContainer, { backgroundColor: colors.tint + '15' }]}>
                  <Ionicons 
                    name={getSectorIcon(item.name) as any} 
                    size={18} 
                    color={colors.tint} 
                  />
                </View>
              )}
              <View style={styles.itemTextContainer}>
                <Text style={[styles.itemName, { color: colors.text }]}>
                  {isStock ? (item as StockItem).symbol : item.name}
                </Text>
                {isStock && (
                  <Text style={[styles.itemSubtitle, { color: colors.text }]}>
                    {(item as StockItem).name}
                  </Text>
                )}
              </View>
            </View>
          </View>
          
          {isStock && (
            <Text style={[styles.itemSector, { color: colors.subtitle }]}>
              <Ionicons name="business-outline" size={12} color={colors.subtitle} />
              {' '}{(item as StockItem).sector}
            </Text>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.preferenceButton,
            {
              backgroundColor: getButtonColors().backgroundColor,
              borderColor: getButtonColors().borderColor,
              borderWidth: isSelected ? 1 : 0,
            }
          ]}
          onPress={() => handleAddToPreferences(item, isStock ? 'stock' : 'sector')}
        >
          <Ionicons 
            name={isSelected ? 'remove-outline' : 'add-outline'} 
            size={16} 
            color={getButtonColors().iconColor} 
          />
          <Text style={[
            styles.preferenceButtonText,
            { color: getButtonColors().textColor }
          ]}>
            {isSelected ? 'Quitar' : 'Agregar'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Mis Preferencias</Text>
      </View>

      {/* Profile Section */}
      <View style={[styles.profileSection, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={styles.profileHeader}>
          <View style={[styles.profileIconContainer, { backgroundColor: colors.tint + '15' }]}>
            <Ionicons name="person-outline" size={20} color={colors.tint} />
          </View>
          <Text style={[styles.profileTitle, { color: colors.text }]}>Tu Perfil de Inversión</Text>
        </View>
        <View style={styles.profileContent}>
          <View style={styles.profileRow}>
            <View style={styles.profileItem}>
              <Ionicons name="school-outline" size={16} color={colors.subtitle} />
              <Text style={[styles.profileLabel, { color: colors.subtitle }]}>Conocimiento</Text>
            </View>
            <Text style={[styles.profileValue, { color: colors.text }]}>{userProfile.investmentKnowledge}</Text>
          </View>
          <View style={styles.profileRow}>
            <View style={styles.profileItem}>
              <Ionicons name="trending-up-outline" size={16} color={colors.subtitle} />
              <Text style={[styles.profileLabel, { color: colors.subtitle }]}>Apetito de riesgo</Text>
            </View>
            <Text style={[styles.profileValue, { color: colors.text }]}>{userProfile.riskAppetite}</Text>
          </View>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={[styles.searchIconContainer, { backgroundColor: colors.tint + '15' }]}>
          <Ionicons name="search" size={18} color={colors.tint} />
        </View>
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={`Buscar ${activeTab === 'sectors' ? 'sectores' : 'acciones'}...`}
          placeholderTextColor={colors.subtitle}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity 
            style={styles.clearButton}
            onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close-circle" size={20} color={colors.subtitle} />
          </TouchableOpacity>
        )}
      </View>

      {/* Tabs */}
      <View style={[styles.tabContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'sectors' && { backgroundColor: colors.tint },
            activeTab === 'sectors' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('sectors')}
        >
          <Ionicons 
            name="grid-outline" 
            size={16} 
            color={activeTab === 'sectors' ? '#ffffff' : colors.text} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'sectors' ? '#ffffff' : colors.text }
          ]}>
            Sectores ({sectors.filter(s => s.isSelected).length})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === 'stocks' && { backgroundColor: colors.tint },
            activeTab === 'stocks' && styles.activeTab,
          ]}
          onPress={() => setActiveTab('stocks')}
        >
          <Ionicons 
            name="trending-up-outline" 
            size={16} 
            color={activeTab === 'stocks' ? '#ffffff' : colors.text} 
          />
          <Text style={[
            styles.tabText,
            { color: activeTab === 'stocks' ? '#ffffff' : colors.text }
          ]}>
            Acciones ({stocks.filter(s => s.isSelected).length})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.loadingState}>
            <Ionicons name="hourglass-outline" size={48} color={colors.subtitle} />
            <Text style={[styles.loadingText, { color: colors.subtitle }]}>
              Cargando datos...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorState}>
            <Ionicons name="alert-circle-outline" size={48} color="#ef4444" />
            <Text style={[styles.errorText, { color: "#ef4444" }]}>
              {error}
            </Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: colors.tint }]}
              onPress={() => {
                setError(null);
                // Recargar datos
                const loadData = async () => {
                  try {
                    setLoading(true);
                    
                    if (isAuthenticated) {
                      // Usuario autenticado: cargar desde backend
                      const token = await getStoredToken();
                      if (!token) {
                        throw new Error('Token no disponible');
                      }

                      const [sectorsResponse, stocksResponse, favoritesResponse] = await Promise.all([
                        getSectors(token),
                        getStocks(token),
                        getUserFavorites(token)
                      ]);

                      // Extraer lista de símbolos favoritos - la estructura real es favorites.favoriteStocks
                      const userFavoritesSymbols = favoritesResponse.favorites?.favoriteStocks || [];
                      updateFavorites(userFavoritesSymbols);

                      // Primero mapear los stocks para poder calcular qué sectores están en uso
                      const stocksData = stocksResponse.stocks.map((stock: any) => ({
                        symbol: stock.symbol,
                        name: stock.name,
                        sector: stock.sector,
                        isSelected: userFavoritesSymbols.includes(stock.symbol) // Usar datos frescos de la API
                      }));

                      // Calcular qué sectores tienen al menos una acción favorita
                      const sectorsWithFavorites = new Set(
                        stocksData
                          .filter((stock: StockItem) => stock.isSelected)
                          .map((stock: StockItem) => stock.sector)
                      );

                      const sectorsData = sectorsResponse.sectors.map((sector: any) => ({
                        name: sector.name,
                        isSelected: sectorsWithFavorites.has(sector.name), // Marcar como seleccionado si tiene favoritos
                        count: sector.count || 0
                      }));

                      setSectors(sectorsData);
                      setStocks(stocksData);
                    } else {
                      // Usuario no autenticado: mostrar mensaje de que necesita autenticarse
                      throw new Error('Se requiere autenticación para ver las preferencias');
                    }
                  } catch (error) {
                    console.error('Error cargando datos:', error);
                    
                    // Mostrar error al usuario
                    setError('Error al cargar los datos del servidor. Por favor, verifica tu conexión e intenta nuevamente.');
                    
                    // Mantener arrays vacíos en caso de error
                    setSectors([]);
                    setStocks([]);
                  } finally {
                    setLoading(false);
                  }
                };
                loadData();
              }}
            >
              <Ionicons name="refresh-outline" size={16} color="#ffffff" />
              <Text style={styles.retryButtonText}>Reintentar</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {getFilteredItems().map(item => renderItem(item))}
            
            {getFilteredItems().length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="search" size={48} color={colors.subtitle} />
                <Text style={[styles.emptyStateText, { color: colors.subtitle }]}>
                  No se encontraron {activeTab === 'sectors' ? 'sectores' : 'acciones'} que coincidan con tu búsqueda
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 70,
    paddingBottom: 16,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileSection: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  profileTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  profileContent: {
    gap: 12,
  },
  profileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  profileLabel: {
    fontSize: 14,
  },
  profileValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  searchIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    borderWidth: 1,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  activeTab: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  resultsText: {
    fontSize: 14,
    fontWeight: '500',
  },
  selectedText: {
    fontSize: 12,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  itemCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  itemTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectorIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  itemTextContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
  },
  selectedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  selectedBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  itemSubtitle: {
    fontSize: 13,
    marginTop: 2,
    fontWeight: '500',
  },
  itemSector: {
    fontSize: 12,
    marginTop: 4,
    flexDirection: 'row',
    alignItems: 'center',
  },
  preferenceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 4,
  },
  preferenceButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  loadingState: {
    alignItems: 'center',
    paddingVertical: 64,
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  errorState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    marginBottom: 24,
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
