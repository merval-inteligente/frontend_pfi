import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { usePreferencesSync } from '@/contexts/PreferencesSyncContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getNews, getStocks } from '@/controller/apiController';
import { MarketData, MarketService, NewsItem as MockNewsItem, NewsService, Stock, StockService } from '@/services/mockData';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Image } from 'expo-image';
import { router, useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Interfaz para noticias del backend
interface BackendNewsItem {
  _id: string;
  titulo: string;
  resumen: string;
  contenido: string;
  empresas_merval: string[];
  fecha_scrapeo: string;
  fecha_publicacion_raw?: string;
  url: string;
}

const StockItem = ({ stock }: { stock: Stock }) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  
  // Determinar color del sentimiento basado en el cambio porcentual
  const getSentimentColor = () => {
    if (stock.percentageChange > 0) return '#10b981'; // Verde para positivo
    if (stock.percentageChange < 0) return '#ef4444'; // Rojo para negativo
    return colors.subtitle; // Gris neutral
  };
  
  const getSentimentText = () => {
    if (stock.percentageChange > 0) return 'Positivo';
    if (stock.percentageChange < 0) return 'Negativo';
    return 'Neutral';
  };
  
  const handlePress = () => {
    router.push({
      pathname: './stock-detail' as any,
      params: {
        symbol: stock.symbol,
        name: stock.name,
        value: stock.currentPrice.toString(),
      }
    });
  };
  
  return (
    <TouchableOpacity 
      style={[styles.stockItem, { backgroundColor: colors.background }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.stockInfo}>
        <View style={styles.stockHeader}>
          <View style={[styles.stockIcon, { backgroundColor: colors.success }]}>
            <Text style={[styles.stockIconText, { color: colorScheme === 'dark' ? '#131612' : '#ffffff' }]}>
              {stock.symbol.substring(0, 2)}
            </Text>
          </View>
          <View style={styles.stockDetails}>
            <Text style={[styles.stockName, { color: colors.text }]}>{stock.name}</Text>
            <Text style={[styles.stockSymbol, { color: colors.subtitle }]}>{stock.symbol}</Text>
          </View>
        </View>
      </View>
      <View style={styles.stockProgress}>
        <View style={styles.stockProgressInfo}>
          <View style={[styles.progressBarContainer, { backgroundColor: colorScheme === 'dark' ? '#434f40' : '#e9ecef' }]}>
            <View style={[styles.progressBar, { 
              width: `${Math.abs(stock.percentageChange) * 10}%`, 
              backgroundColor: getSentimentColor() 
            }]} />
          </View>
          <Text style={[styles.sentimentLabel, { color: getSentimentColor() }]}>
            {getSentimentText()}
          </Text>
        </View>
        <Text style={[styles.stockValue, { color: colors.text }]}>${stock.currentPrice}</Text>
      </View>
      <View style={styles.stockArrow}>
        <Ionicons name="chevron-forward" size={20} color={colors.subtitle} />
      </View>
    </TouchableOpacity>
  );
};

const NewsCard = ({ 
  news, 
  isBackendNews = false, 
  isExpanded = false, 
  onToggleExpand 
}: { 
  news: MockNewsItem | BackendNewsItem, 
  isBackendNews?: boolean,
  isExpanded?: boolean,
  onToggleExpand?: () => void
}) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  
  // Si es noticia del backend, convertir formato
  if (isBackendNews) {
    const backendNews = news as BackendNewsItem;
    
    const formatTimeAgo = (dateString: string) => {
      const date = new Date(dateString);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Ahora';
      if (diffInHours < 24) return `${diffInHours}h`;
      return `${Math.floor(diffInHours / 24)}d`;
    };

    const getCategoryIcon = () => {
      // Determinar categoría basada en empresas MERVAL
      if (backendNews.empresas_merval && backendNews.empresas_merval.length > 0) {
        return 'business-outline';
      }
      return 'newspaper-outline';
    };

    const getCategoryColor = () => {
      if (backendNews.empresas_merval && backendNews.empresas_merval.length > 0) {
        return '#4A9EFF'; // Azul para empresas
      }
      return colors.tint;
    };
    
    return (
      <TouchableOpacity 
        style={[styles.newsItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
        onPress={() => {
          // Aquí puedes agregar navegación a detalle de noticia
          
        }}
        activeOpacity={0.7}
      >
        <View style={styles.newsHeader}>
          <View style={[styles.newsCategoryIcon, { backgroundColor: getCategoryColor() + '15' }]}>
            <Ionicons 
              name={getCategoryIcon() as any} 
              size={16} 
              color={getCategoryColor()} 
            />
          </View>
          <Text style={[styles.newsTimestamp, { color: colors.subtitle }]}>
            {formatTimeAgo(backendNews.fecha_scrapeo)}
          </Text>
          {backendNews.empresas_merval && backendNews.empresas_merval.length > 0 && (
            <View style={[styles.relatedStock, { backgroundColor: colors.tint + '15' }]}>
              <Text style={[styles.relatedStockText, { color: colors.tint }]}>
                {backendNews.empresas_merval[0]}
              </Text>
            </View>
          )}
        </View>
        <Text style={[styles.newsTitle, { color: colors.text }]}>
          {backendNews.titulo}
        </Text>
        <TouchableOpacity onPress={onToggleExpand} activeOpacity={0.7}>
          <Text style={[styles.newsSummary, { color: colors.subtitle }]}>
            {(() => {
              const content = backendNews.resumen || backendNews.contenido;
              if (isExpanded) {
                return content;
              } else {
                return content.length > 150 ? content.substring(0, 150) + '...' : content;
              }
            })()}
          </Text>
          {((backendNews.resumen || backendNews.contenido).length > 150) && (
            <Text style={[styles.expandText, { color: colors.tint }]}>
              {isExpanded ? 'Ver menos' : 'Ver más'}
            </Text>
          )}
        </TouchableOpacity>
        <View style={styles.newsFooter}>
          <View style={[styles.newsImpact, { backgroundColor: '#64748b' + '15' }]}>
            <Ionicons 
              name="newspaper-outline" 
              size={12} 
              color="#64748b" 
            />
            <Text style={[styles.newsImpactText, { color: '#64748b' }]}>
              MERVAL
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Lógica original para noticias mock
  const mockNews = news as MockNewsItem;
  
  const getCategoryIcon = (category: MockNewsItem['category']) => {
    switch (category) {
      case 'market': return 'trending-up-outline';
      case 'company': return 'business-outline';
      case 'economic': return 'stats-chart-outline';
      case 'energy': return 'flash-outline';
      case 'politics': return 'newspaper-outline';
      default: return 'newspaper-outline';
    }
  };

  const getCategoryColor = (category: MockNewsItem['category']) => {
    switch (category) {
      case 'market': return '#8CD279';
      case 'company': return '#4A9EFF';
      case 'economic': return '#FF6B6B';
      case 'energy': return '#FFD93D';
      case 'politics': return '#9C88FF';
      default: return colors.tint;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Ahora';
    if (diffInHours < 24) return `${diffInHours}h`;
    return `${Math.floor(diffInHours / 24)}d`;
  };
  
  return (
    <View style={[styles.newsItem, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.newsHeader}>
        <View style={[styles.newsCategoryIcon, { backgroundColor: getCategoryColor(mockNews.category) + '15' }]}>
          <Ionicons 
            name={getCategoryIcon(mockNews.category) as any} 
            size={16} 
            color={getCategoryColor(mockNews.category)} 
          />
        </View>
        <Text style={[styles.newsTimestamp, { color: colors.subtitle }]}>{formatTimeAgo(mockNews.publishedAt)}</Text>
        {mockNews.relatedStocks.length > 0 && (
          <View style={[styles.relatedStock, { backgroundColor: colors.tint + '15' }]}>
            <Text style={[styles.relatedStockText, { color: colors.tint }]}>{mockNews.relatedStocks[0]}</Text>
          </View>
        )}
      </View>
      <Text style={[styles.newsTitle, { color: colors.text }]}>{mockNews.title}</Text>
      <TouchableOpacity onPress={onToggleExpand} activeOpacity={0.7}>
        <Text style={[styles.newsSummary, { color: colors.subtitle }]}>
          {isExpanded ? mockNews.summary : (mockNews.summary.length > 150 ? mockNews.summary.substring(0, 150) + '...' : mockNews.summary)}
        </Text>
        {mockNews.summary.length > 150 && (
          <Text style={[styles.expandText, { color: colors.tint }]}>
            {isExpanded ? 'Ver menos' : 'Ver más'}
          </Text>
        )}
      </TouchableOpacity>
      <View style={styles.newsFooter}>
        <View style={[styles.newsImpact, { backgroundColor: mockNews.sentiment === 'positive' ? '#10b981' + '15' : mockNews.sentiment === 'negative' ? '#ef4444' + '15' : '#64748b' + '15' }]}>
          <Ionicons 
            name={mockNews.sentiment === 'positive' ? 'trending-up' : mockNews.sentiment === 'negative' ? 'trending-down' : 'remove'} 
            size={12} 
            color={mockNews.sentiment === 'positive' ? '#10b981' : mockNews.sentiment === 'negative' ? '#ef4444' : '#64748b'} 
          />
          <Text style={[styles.newsImpactText, { color: mockNews.sentiment === 'positive' ? '#10b981' : mockNews.sentiment === 'negative' ? '#ef4444' : '#64748b' }]}>
            {mockNews.sentiment === 'positive' ? 'Positivo' : mockNews.sentiment === 'negative' ? 'Negativo' : 'Neutral'}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default function HomeScreen() {
  const { colorScheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const { userFavorites, refreshFavorites } = usePreferencesSync();
  const colors = Colors[colorScheme];
  
  const [userStocks, setUserStocks] = useState<Stock[]>([]);
  const [news, setNews] = useState<(MockNewsItem | BackendNewsItem)[]>([]);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showAllStocks, setShowAllStocks] = useState(false);
  const [showAllNews, setShowAllNews] = useState(false);
  const [newsSource, setNewsSource] = useState<'backend' | 'mock'>('backend');
  const [lastNewsLoad, setLastNewsLoad] = useState<number>(0);
  const [expandedNews, setExpandedNews] = useState<Set<string>>(new Set());

  // Función para alternar expansión de una noticia
  const toggleNewsExpansion = (newsId: string) => {
    setExpandedNews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(newsId)) {
        newSet.delete(newsId);
      } else {
        newSet.add(newsId);
      }
      return newSet;
    });
  };

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

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Load user's favorite stocks
      if (isAuthenticated && userFavorites.length > 0) {
        try {
          const token = await getStoredToken();
          if (token) {
            // Obtener todos los stocks desde el backend
            const stocksResponse = await getStocks(token);
            
            // Filtrar solo los stocks que están en favoritos
            const favoriteStocks = stocksResponse.stocks
              .filter((stock: any) => userFavorites.includes(stock.symbol))
              .map((stock: any) => ({
                id: stock.symbol,
                symbol: stock.symbol,
                name: stock.name,
                sector: stock.sector,
                currentPrice: Math.floor(Math.random() * 1000) + 100,
                percentageChange: (Math.random() - 0.5) * 10,
              }));
            
            setUserStocks(favoriteStocks);
            
            // 🕐 Delay para evitar rate limiting
            await new Promise(resolve => setTimeout(resolve, 1500));
            
          } else {
            throw new Error('No token available');
          }
        } catch (error) {
          console.error('Error loading backend stocks:', error);
          // Fallback a datos mock
          if (user?.preferences.favoriteStocks) {
            const stocks = await StockService.getUserStocks(user.preferences.favoriteStocks);
            setUserStocks(stocks);
          } else {
            setUserStocks([]);
          }
        }
      } else {
        // Usuario no autenticado o sin favoritos, usar datos mock
        if (user?.preferences.favoriteStocks) {
          const stocks = await StockService.getUserStocks(user.preferences.favoriteStocks);
          setUserStocks(stocks);
        } else {
          setUserStocks([]);
        }
      }
      
      // Load news from backend with caching
      const now = Date.now();
      const CACHE_DURATION = 2 * 60 * 1000; // 2 minutos
      
      if (isAuthenticated && (now - lastNewsLoad > CACHE_DURATION)) {
        try {
          const token = await getStoredToken();
          if (token) {
            const newsResponse = await getNews(token, 1, 5, 'fecha_scrapeo', 'desc');
            
            if (newsResponse.success && newsResponse.data?.news) {
              setNews(newsResponse.data.news);
              setNewsSource('backend');
              setLastNewsLoad(now);
            } else {
              throw new Error(newsResponse.error || 'Error obteniendo noticias del backend');
            }
          } else {
            throw new Error('No token available');
          }
        } catch (error) {
          console.error('Error loading backend news, using fallback:', error);
          // Fallback a datos mock
          const newsData = await NewsService.getNews(5);
          setNews(newsData);
          setNewsSource('mock');
        }
      } else if (isAuthenticated) {
        // Cache válido, no hacer nada
      } else {
        // Usuario no autenticado, usar datos mock
        const newsData = await NewsService.getNews(5);
        setNews(newsData);
        setNewsSource('mock');
      }
      
      // Load market data
      const market = await MarketService.getMarketData();
      setMarketData(market);
      
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user, userFavorites, lastNewsLoad]);

  // Cargar datos inicial cuando el usuario esté autenticado  
  useEffect(() => {
    if (isAuthenticated && user) {
      loadData();
    } else if (!isAuthenticated) {
      // Limpiar datos cuando no esté autenticado
      setUserStocks([]);
      setNews([]);
    }
  }, [user, isAuthenticated, loadData]);

  // Recargar stocks cuando cambien los favoritos
  useEffect(() => {
    if (isAuthenticated && userFavorites && userFavorites.length > 0) {
      const reloadStockData = async () => {
        try {
          // Intentar cargar desde backend primero
          const token = await getStoredToken();
          if (token) {
            try {
              const stocksResponse = await getStocks(token);
              const favoriteStocks = stocksResponse.stocks
                .filter((stock: any) => userFavorites.includes(stock.symbol))
                .map((stock: any) => ({
                  id: stock.symbol,
                  symbol: stock.symbol,
                  name: stock.name,
                  sector: stock.sector,
                  currentPrice: Math.floor(Math.random() * 1000) + 100,
                  percentageChange: (Math.random() - 0.5) * 10,
                }));
              
              setUserStocks(favoriteStocks);
              return;
            } catch (error) {
              console.error('Error loading stocks from backend:', error);
            }
          }
          
          // Fallback a datos mock
          const stocks = await StockService.getUserStocks(userFavorites);
          setUserStocks(stocks);
        } catch (error) {
          console.error('Error loading user stocks:', error);
        }
      };
      reloadStockData();
    } else if (userFavorites && userFavorites.length === 0) {
      setUserStocks([]);
    }
  }, [userFavorites, isAuthenticated]);

  // Refrescar favoritos cuando la pantalla recibe foco
  useFocusEffect(
    useCallback(() => {
      refreshFavorites().catch(error => {
        console.error('Error refreshing favorites on focus:', error);
      });
    }, [refreshFavorites])
  );
  
  const displayedStocks = showAllStocks ? userStocks : userStocks.slice(0, 3);
  const displayedNews = showAllNews ? news : news.slice(0, 2);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('es-AR').format(num);
  };

  const formatPercentage = (num: number) => {
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Cargando datos del mercado...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Inicio</Text>
        </View>

        {/* Greeting */}
        <Text style={[styles.greeting, { color: colors.text }]}>
          ¡Hola {user?.name || 'Usuario'}! ¿Cómo anda el mercado hoy?
        </Text>

        {/* MERVAL Card */}
        <View style={styles.mervalContainer}>
          <ImageBackground
            source={{
              uri: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
            }}
            style={styles.mervalBackground}
            imageStyle={styles.mervalBackgroundImage}
          >
            <View style={styles.mervalOverlay}>
              <Text style={styles.mervalText}>
                MERVAL: {marketData ? formatNumber(marketData.mervalIndex.value) : '1.567.234'} 
                {marketData ? ` (${formatPercentage(marketData.mervalIndex.percentageChange)})` : ' (+2,34%)'} 📈
              </Text>
            </View>
          </ImageBackground>
        </View>

        {/* News Section */}
        <View style={styles.exploreSectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Noticias</Text>
        </View>
        
        {displayedNews.map((newsItem, index) => {
          const newsId = newsSource === 'backend' ? (newsItem as BackendNewsItem)._id || `news-${index}` : (newsItem as MockNewsItem).id;
          return (
            <View key={newsId} style={{ paddingHorizontal: 16 }}>
              <NewsCard 
                news={newsItem} 
                isBackendNews={newsSource === 'backend'} 
                isExpanded={expandedNews.has(newsId)}
                onToggleExpand={() => toggleNewsExpansion(newsId)}
              />
            </View>
          );
        })}
        
        {news.length > 2 && (
          <View style={{ paddingHorizontal: 16 }}>
            <TouchableOpacity 
              style={[styles.showMoreButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
              onPress={() => setShowAllNews(!showAllNews)}
            >
              <Text style={[styles.showMoreText, { color: colors.text }]}>
                {showAllNews ? `Ver menos` : `Ver ${news.length - 2} noticias más`}
              </Text>
              <Ionicons 
                name={showAllNews ? "chevron-up" : "chevron-down"} 
                size={16} 
                color={colors.text} 
              />
            </TouchableOpacity>
          </View>
        )}

        {/* Stocks Section */}
        <View style={styles.exploreSectionHeader}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Mis Preferencias</Text>
          <TouchableOpacity 
            style={[styles.editPreferencesButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
            onPress={() => router.push('/(tabs)/preferences')}
          >
            <Ionicons name="settings-outline" size={16} color={colors.text} />
            <Text style={[styles.editPreferencesText, { color: colors.text }]}>Editar</Text>
          </TouchableOpacity>
        </View>
        
        {displayedStocks.length > 0 ? (
          <>
            {displayedStocks.map((stock) => (
              <StockItem key={stock.id} stock={stock} />
            ))}
            
            {userStocks.length > 3 && (
              <TouchableOpacity 
                style={[styles.showMoreButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                onPress={() => setShowAllStocks(!showAllStocks)}
              >
                <Text style={[styles.showMoreText, { color: colors.text }]}>
                  {showAllStocks ? `Ver menos` : `Ver ${userStocks.length - 3} más`}
                </Text>
                <Ionicons 
                  name={showAllStocks ? "chevron-up" : "chevron-down"} 
                  size={16} 
                  color={colors.text} 
                />
              </TouchableOpacity>
            )}
          </>
        ) : (
          <View style={[styles.emptyState, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Ionicons name="star-outline" size={48} color={colors.subtitle} />
            <Text style={[styles.emptyStateTitle, { color: colors.text }]}>No tienes preferencias</Text>
            <Text style={[styles.emptyStateText, { color: colors.subtitle }]}>
              Agrega acciones a tus preferencias para verlas aquí
            </Text>
            <TouchableOpacity 
              style={[styles.addPreferencesButton, { backgroundColor: colors.tint }]}
              onPress={() => router.push('/(tabs)/preferences')}
            >
              <Text style={styles.addPreferencesText}>Agregar Preferencias</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Market Sentiment */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Sentimiento del Mercado</Text>
        <View style={styles.sentimentContainer}>
          <View style={styles.sentimentTextContainer}>
            <Text style={[styles.sentimentTitle, { color: colors.text }]}>
              {marketData?.mervalIndex.percentageChange && marketData.mervalIndex.percentageChange > 0 ? 'Optimista' : 'Cauteloso'}
            </Text>
            <Text style={[styles.sentimentDescription, { color: colors.subtitle }]}>
              {marketData?.mervalIndex.percentageChange && marketData.mervalIndex.percentageChange > 0 
                ? 'El mercado muestra una tendencia positiva generalizada.'
                : 'El mercado presenta volatilidad, mantente informado.'
              }
            </Text>
          </View>
          <View style={styles.sentimentImageContainer}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
              }}
              style={styles.sentimentImage}
              contentFit="cover"
            />
          </View>
        </View>

        {/* Chat Button */}
        <View style={styles.chatButtonContainer}>
          <TouchableOpacity 
            style={[styles.chatButton, { backgroundColor: colors.success }]}
            onPress={() => router.push('/chat')}
          >
            <Ionicons name="chatbubbles-outline" size={24} color={colorScheme === 'dark' ? '#131612' : '#ffffff'} />
            <Text style={[styles.chatButtonText, { color: colorScheme === 'dark' ? '#131612' : '#ffffff' }]}>Preguntale a Guía MERVAL</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 70,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 16,
    lineHeight: 32,
  },
  mervalContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  mervalBackground: {
    height: 132,
    justifyContent: 'flex-end',
  },
  mervalBackgroundImage: {
    borderRadius: 12,
  },
  mervalOverlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: 16,
    borderRadius: 12,
  },
  mervalText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingBottom: 8,
  },
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 72,
  },
  stockInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stockHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  stockIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  stockIconText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  stockDetails: {
    flex: 1,
  },
  stockName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  stockSymbol: {
    fontSize: 14,
  },
  stockProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stockProgressInfo: {
    alignItems: 'center',
    gap: 4,
  },
  progressBarContainer: {
    width: 88,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 2,
  },
  sentimentLabel: {
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  stockValue: {
    fontSize: 14,
    fontWeight: '500',
    minWidth: 44,
    textAlign: 'right',
  },
  stockArrow: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  emptyState: {
    marginHorizontal: 16,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  addPreferencesButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addPreferencesText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  sentimentContainer: {
    flexDirection: 'row',
    marginHorizontal: 16,
    gap: 16,
    marginBottom: 16,
  },
  sentimentTextContainer: {
    flex: 2,
    gap: 4,
  },
  sentimentTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  sentimentDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  sentimentImageContainer: {
    flex: 1,
  },
  sentimentImage: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 12,
  },
  chatButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    alignItems: 'flex-end',
  },
  chatButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 28,
    gap: 12,
  },
  chatButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 20,
  },
  // Estilos para headers de sección
  exploreSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  exploreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  editPreferencesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    gap: 4,
  },
  editPreferencesText: {
    fontSize: 12,
    fontWeight: '500',
  },
  
  // News styles
  newsItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  newsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  newsCategoryIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsTimestamp: {
    fontSize: 12,
    fontWeight: '500',
  },
  relatedStock: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 'auto',
  },
  relatedStockText: {
    fontSize: 10,
    fontWeight: '600',
  },
  newsTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 22,
  },
  newsSummary: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 10,
  },
  expandText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
    textAlign: 'right',
  },
  newsFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  newsImpact: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  newsImpactText: {
    fontSize: 12,
    fontWeight: '600',
  },
  
  // Show more button styles
  showMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  showMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
});
