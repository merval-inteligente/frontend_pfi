import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getStockPrice, getStocks, getStockTechnical } from '@/controller/apiController';
import { ExtendedStock, generateMockChartData, getExtendedStock } from '@/services/mockup';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

export default function StockDetailScreen() {
  const router = useRouter();
  const { symbol } = useLocalSearchParams();
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const colors = Colors[colorScheme];
  
  // 🎯 PERSONALIZACIÓN: Verificar si mostrar análisis técnico avanzado
  const shouldShowAdvancedMetrics = () => {
    const knowledge = (user?.investmentKnowledge || 'intermedio').toLowerCase();
    return knowledge === 'avanzado' || knowledge === 'intermedio';
  };
  
  const [stock, setStock] = useState<ExtendedStock | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [additionalStats, setAdditionalStats] = useState<{
    high?: number;
    low?: number;
    open?: number;
    previousClose?: number;
  }>({});
  const [technicalData, setTechnicalData] = useState<{
    rsi?: number;
    rsiSignal?: string;
    sma50?: number;
    sma200?: number;
    support1?: number;
    resistance1?: number;
  }>({});
  const [expandedIndicator, setExpandedIndicator] = useState<string | null>(null);

  useEffect(() => {
    loadStockData();
  }, [symbol]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStockData = async () => {
    try {
      if (typeof symbol === 'string') {
        // 🔄 PASO 1: Intentar obtener datos del backend PRIMERO
        let backendStockData: any = null;
        let priceData: any = null;
        
        try {
          const token = await AsyncStorage.getItem('@auth_token');
          
          if (token) {
            // Obtener la lista de stocks del backend para obtener nombre y sector
            const stocksResponse = await getStocks(token);
            
            if (stocksResponse && stocksResponse.stocks) {
              backendStockData = stocksResponse.stocks.find(
                (s: any) => s.symbol === symbol || s.symbol === symbol.toUpperCase()
              );
              
              // Stock encontrado o no en backend
            }
            
            // Obtener precio real del backend
            priceData = await getStockPrice(symbol);
            
            if (priceData.success && priceData.data) {
              // Guardar estadísticas adicionales
              setAdditionalStats({
                high: priceData.data.high,
                low: priceData.data.low,
                open: priceData.data.open,
                previousClose: priceData.data.previousClose
              });
            }
            
            // 📊 Obtener análisis técnico (RSI, SMA, soporte/resistencia)
            const technicalAnalysis = await getStockTechnical(symbol);
            
            if (technicalAnalysis.success && technicalAnalysis.data) {
              setTechnicalData({
                rsi: technicalAnalysis.data.indicators?.rsi,
                rsiSignal: technicalAnalysis.data.indicators?.rsiSignal,
                sma50: technicalAnalysis.data.movingAverages?.sma50,
                sma200: technicalAnalysis.data.movingAverages?.sma200,
                support1: technicalAnalysis.data.support?.level1,
                resistance1: technicalAnalysis.data.resistance?.level1
              });
            }
          }
        } catch (backendError) {
          // Error obteniendo datos del backend
        }
        
        // 🔄 PASO 2: Intentar obtener datos mock como complemento
        const mockStockData = getExtendedStock(symbol);
        
        // 🔄 PASO 3: Combinar datos del backend con mock (prioridad: backend)
        if (backendStockData || priceData?.success || mockStockData) {
          // Calcular cambio diario
          const dailyChange = priceData?.data?.previousClose 
            ? priceData.data.price - priceData.data.previousClose 
            : mockStockData?.dailyChange || 0;
          
          // Construir objeto de stock combinado
          const combinedStock: ExtendedStock = {
            // ID y símbolo
            id: backendStockData?.symbol || mockStockData?.id || symbol,
            symbol: symbol.toUpperCase(),
            
            // Información básica (prioridad: backend -> mock -> default)
            name: backendStockData?.name || mockStockData?.name || symbol,
            sector: backendStockData?.sector || mockStockData?.sector || 'Sin sector',
            
            // Precio y cambios (prioridad: backend real)
            currentPrice: priceData?.data?.price || mockStockData?.currentPrice || 0,
            dailyChange: dailyChange,
            percentageChange: priceData?.data?.changePercent || mockStockData?.percentageChange || 0,
            volume: priceData?.data?.volume || mockStockData?.volume || 0,
            
            // Estadísticas adicionales (solo mock por ahora)
            marketCap: mockStockData?.marketCap || 0,
            pe: mockStockData?.pe || 0,
            dividend: mockStockData?.dividend || 0,
            description: mockStockData?.description || `Información de ${backendStockData?.name || symbol}`,
          };
          
          setStock(combinedStock);
        } else {
          // No se encontró en ningún lado
          setStock(null);
        }
      }
    } catch (error) {
      setStock(null);
    } finally {
      setIsLoading(false);
    }
  };

  const mockChartData = generateMockChartData();

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={[styles.loadingText, { color: colors.text }]}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!stock) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: colors.text }]}>Stock no encontrado</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.background}
      />
      
      {/* Header Navigation */}
      <View style={[styles.header, { 
        borderBottomColor: colors.cardBorder,
        backgroundColor: colors.background 
      }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{stock.symbol}</Text>
        <TouchableOpacity style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Content */}
        <View style={styles.content}>
          {/* Stock Info */}
          <View style={[styles.stockInfoCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.stockName, { color: colors.text }]}>{stock.name}</Text>
            <Text style={[styles.stockSector, { color: colors.subtitle }]}>{stock.sector}</Text>
            
            <View style={styles.priceRow}>
              <Text style={[styles.currentPrice, { color: colors.text }]}>
                ${stock.currentPrice ? stock.currentPrice.toLocaleString() : 'N/A'}
              </Text>
              <Text style={[styles.priceChange, { 
                color: stock.percentageChange >= 0 ? '#10b981' : '#ef4444' 
              }]}>
                {stock.percentageChange !== null && stock.percentageChange !== undefined 
                  ? `${stock.percentageChange >= 0 ? '+' : ''}${stock.percentageChange.toFixed(2)}%`
                  : 'N/A'}
              </Text>
            </View>
          </View>

          {/* Chart */}
          <View style={[styles.chartCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Gráfico</Text>
            <LineChart
              data={mockChartData}
              width={Dimensions.get('window').width - 32}
              height={220}
              chartConfig={{
                backgroundColor: colors.card,
                backgroundGradientFrom: colors.card,
                backgroundGradientTo: colors.card,
                decimalPlaces: 0,
                color: (opacity = 1) => colors.tint,
                labelColor: (opacity = 1) => colors.subtitle,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: colors.tint,
                },
              }}
              bezier
              style={styles.chart}
            />
          </View>

          {/* Stats */}
          <View style={[styles.statsCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Estadísticas</Text>
            
            <View style={styles.statsGrid}>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.subtitle }]}>Volumen</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stock.volume ? stock.volume.toLocaleString() : 'N/A'}
                </Text>
              </View>
              {additionalStats.high !== undefined && additionalStats.high !== null && (
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: colors.subtitle }]}>Máximo del día</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    ${additionalStats.high.toLocaleString()}
                  </Text>
                </View>
              )}
              {additionalStats.low !== undefined && additionalStats.low !== null && (
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: colors.subtitle }]}>Mínimo del día</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    ${additionalStats.low.toLocaleString()}
                  </Text>
                </View>
              )}
              {additionalStats.open !== undefined && additionalStats.open !== null && (
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: colors.subtitle }]}>Apertura</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    ${additionalStats.open.toLocaleString()}
                  </Text>
                </View>
              )}
              {additionalStats.previousClose !== undefined && additionalStats.previousClose !== null && (
                <View style={styles.statItem}>
                  <Text style={[styles.statLabel, { color: colors.subtitle }]}>Cierre anterior</Text>
                  <Text style={[styles.statValue, { color: colors.text }]}>
                    ${additionalStats.previousClose.toLocaleString()}
                  </Text>
                </View>
              )}
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.subtitle }]}>Cap. Mercado</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  ${(stock.marketCap / 1000000).toFixed(0)}M
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.subtitle }]}>P/E Ratio</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stock.pe}
                </Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statLabel, { color: colors.subtitle }]}>Dividendo</Text>
                <Text style={[styles.statValue, { color: colors.text }]}>
                  {stock.dividend}%
                </Text>
              </View>
            </View>
          </View>

          {/* Technical Analysis - Solo para usuarios intermedios/avanzados */}
          {shouldShowAdvancedMetrics() && (
            <View style={[styles.technicalCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Análisis Técnico</Text>
              <Text style={[styles.technicalDescription, { color: colors.subtitle }]}>
                {technicalData.rsi !== undefined 
                  ? 'Indicadores de análisis técnico basados en datos históricos'
                  : 'Análisis técnico no disponible para este stock en este momento'}
              </Text>
              
              {technicalData.rsi === undefined && (
                <View style={[styles.noDataContainer, { backgroundColor: colors.background, marginTop: 16, padding: 16, borderRadius: 8 }]}>
                  <Ionicons name="analytics-outline" size={32} color={colors.subtitle} style={{ marginBottom: 8 }} />
                  <Text style={[styles.noDataText, { color: colors.subtitle, textAlign: 'center' }]}>
                    Los indicadores técnicos se cargarán cuando haya suficientes datos históricos disponibles.
                  </Text>
                </View>
              )}
              
              {technicalData.rsi !== undefined && (
              
              <View style={styles.technicalGrid}>
                {/* RSI */}
                <View style={styles.technicalItemFull}>
                  <View style={styles.technicalHeader}>
                    <View style={styles.indicatorTitleRow}>
                      <Text style={[styles.technicalLabel, { color: colors.text }]}>RSI (14)</Text>
                      <TouchableOpacity 
                        style={[styles.infoButton, { backgroundColor: `${colors.success}15` }]}
                        onPress={() => setExpandedIndicator(expandedIndicator === 'rsi' ? null : 'rsi')}
                      >
                        <Ionicons 
                          name={expandedIndicator === 'rsi' ? "close-circle" : "help-circle"} 
                          size={18} 
                          color={colors.success} 
                        />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.rsiContainer}>
                      <Text style={[styles.rsiValue, { 
                        color: technicalData.rsiSignal === 'OVERBOUGHT' ? '#ef4444' 
                             : technicalData.rsiSignal === 'OVERSOLD' ? '#10b981' 
                             : colors.text 
                      }]}>
                        {technicalData.rsi.toFixed(2)}
                      </Text>
                      {technicalData.rsiSignal && (
                        <Text style={[styles.rsiSignal, { 
                          color: technicalData.rsiSignal === 'OVERBOUGHT' ? '#ef4444' 
                               : technicalData.rsiSignal === 'OVERSOLD' ? '#10b981' 
                               : colors.subtitle,
                          fontSize: 11,
                          marginTop: 2
                        }]}>
                          {technicalData.rsiSignal === 'OVERBOUGHT' ? '🔴 Sobrecompra' 
                           : technicalData.rsiSignal === 'OVERSOLD' ? '🟢 Sobreventa' 
                           : '⚪ Neutral'}
                        </Text>
                      )}
                    </View>
                  </View>
                  
                  {expandedIndicator === 'rsi' && (
                    <View style={[styles.helpCard, { backgroundColor: `${colors.success}10`, borderColor: colors.success }]}>
                      <Text style={[styles.helpTitle, { color: colors.text }]}>
                        💡 ¿Qué es el RSI?
                      </Text>
                      <Text style={[styles.helpText, { color: colors.subtitle }]}>
                        El <Text style={{ fontWeight: '600' }}>Índice de Fuerza Relativa</Text> mide la velocidad y magnitud de los cambios de precio.
                      </Text>
                      <Text style={[styles.helpText, { color: colors.subtitle, marginTop: 8 }]}>
                        📊 <Text style={{ fontWeight: '600' }}>Cómo interpretarlo:</Text>
                      </Text>
                      <Text style={[styles.helpText, { color: colors.subtitle }]}>
                        • <Text style={{ color: '#10b981', fontWeight: '600' }}>RSI {'<'} 30:</Text> Sobrevendido (podría subir)
                      </Text>
                      <Text style={[styles.helpText, { color: colors.subtitle }]}>
                        • <Text style={{ fontWeight: '600' }}>RSI 30-70:</Text> Rango neutral
                      </Text>
                      <Text style={[styles.helpText, { color: colors.subtitle }]}>
                        • <Text style={{ color: '#ef4444', fontWeight: '600' }}>RSI {'>'} 70:</Text> Sobrecomprado (podría bajar)
                      </Text>
                    </View>
                  )}
                  
                  {!expandedIndicator && (
                    <Text style={[styles.technicalExplanation, { color: colors.subtitle }]}>
                      Índice de Fuerza Relativa. Mide impulso de compra/venta. 
                      {technicalData.rsi > 70 ? ' Sobrecomprado (posible corrección a la baja)' 
                       : technicalData.rsi < 30 ? ' Sobrevendido (posible rebote al alza)' 
                       : ' En rango neutral (30-70)'}
                    </Text>
                  )}
                </View>

                {/* SMA 50 */}
                {technicalData.sma50 !== undefined && technicalData.sma50 !== null && (
                  <View style={styles.technicalItem}>
                    <View style={styles.indicatorTitleRow}>
                      <Text style={[styles.technicalLabel, { color: colors.text }]}>SMA 50</Text>
                      <TouchableOpacity 
                        style={[styles.infoButton, { backgroundColor: `${colors.success}15` }]}
                        onPress={() => setExpandedIndicator(expandedIndicator === 'sma50' ? null : 'sma50')}
                      >
                        <Ionicons 
                          name={expandedIndicator === 'sma50' ? "close-circle" : "help-circle"} 
                          size={16} 
                          color={colors.success} 
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      ${technicalData.sma50.toFixed(2)}
                    </Text>
                    {expandedIndicator === 'sma50' ? (
                      <View style={[styles.helpCard, { backgroundColor: `${colors.success}10`, borderColor: colors.success }]}>
                        <Text style={[styles.helpTitle, { color: colors.text }]}>
                          💡 Media Móvil Simple 50
                        </Text>
                        <Text style={[styles.helpText, { color: colors.subtitle }]}>
                          Promedio del precio de cierre de los <Text style={{ fontWeight: '600' }}>últimos 50 días</Text>.
                        </Text>
                        <Text style={[styles.helpText, { color: colors.subtitle, marginTop: 8 }]}>
                          📈 <Text style={{ fontWeight: '600' }}>Interpretación:</Text>
                        </Text>
                        <Text style={[styles.helpText, { color: colors.subtitle }]}>
                          • Si el precio está <Text style={{ fontWeight: '600', color: '#10b981' }}>arriba de la SMA50</Text>: Tendencia alcista de corto plazo
                        </Text>
                        <Text style={[styles.helpText, { color: colors.subtitle }]}>
                          • Si el precio está <Text style={{ fontWeight: '600', color: '#ef4444' }}>debajo de la SMA50</Text>: Tendencia bajista de corto plazo
                        </Text>
                      </View>
                    ) : (
                      <Text style={[styles.technicalExplanation, { color: colors.subtitle }]}>
                        Media móvil de 50 días. Tendencia a corto plazo
                      </Text>
                    )}
                  </View>
                )}

                {/* SMA 200 */}
                {technicalData.sma200 !== undefined && technicalData.sma200 !== null && (
                  <View style={styles.technicalItem}>
                    <View style={styles.indicatorTitleRow}>
                      <Text style={[styles.technicalLabel, { color: colors.text }]}>SMA 200</Text>
                      <TouchableOpacity 
                        style={[styles.infoButton, { backgroundColor: `${colors.success}15` }]}
                        onPress={() => setExpandedIndicator(expandedIndicator === 'sma200' ? null : 'sma200')}
                      >
                        <Ionicons 
                          name={expandedIndicator === 'sma200' ? "close-circle" : "help-circle"} 
                          size={16} 
                          color={colors.success} 
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.statValue, { color: colors.text }]}>
                      ${technicalData.sma200.toFixed(2)}
                    </Text>
                    {expandedIndicator === 'sma200' ? (
                      <View style={[styles.helpCard, { backgroundColor: `${colors.success}10`, borderColor: colors.success }]}>
                        <Text style={[styles.helpTitle, { color: colors.text }]}>
                          💡 Media Móvil Simple 200
                        </Text>
                        <Text style={[styles.helpText, { color: colors.subtitle }]}>
                          Promedio del precio de cierre de los <Text style={{ fontWeight: '600' }}>últimos 200 días</Text>.
                        </Text>
                        <Text style={[styles.helpText, { color: colors.subtitle, marginTop: 8 }]}>
                          📊 <Text style={{ fontWeight: '600' }}>Interpretación:</Text>
                        </Text>
                        <Text style={[styles.helpText, { color: colors.subtitle }]}>
                          • Indica la <Text style={{ fontWeight: '600' }}>tendencia de largo plazo</Text> de la acción
                        </Text>
                        <Text style={[styles.helpText, { color: colors.subtitle }]}>
                          • Si SMA50 cruza arriba de SMA200: <Text style={{ fontWeight: '600', color: '#10b981' }}>Señal alcista</Text> (Golden Cross)
                        </Text>
                        <Text style={[styles.helpText, { color: colors.subtitle }]}>
                          • Si SMA50 cruza debajo de SMA200: <Text style={{ fontWeight: '600', color: '#ef4444' }}>Señal bajista</Text> (Death Cross)
                        </Text>
                      </View>
                    ) : (
                      <Text style={[styles.technicalExplanation, { color: colors.subtitle }]}>
                        Media móvil de 200 días. Tendencia a largo plazo
                      </Text>
                    )}
                  </View>
                )}

                {/* Soporte */}
                {technicalData.support1 !== undefined && technicalData.support1 !== null && (
                  <View style={styles.technicalItem}>
                    <View style={styles.indicatorTitleRow}>
                      <Text style={[styles.technicalLabel, { color: colors.text }]}>Soporte</Text>
                      <TouchableOpacity 
                        style={[styles.infoButton, { backgroundColor: `${colors.success}15` }]}
                        onPress={() => setExpandedIndicator(expandedIndicator === 'support' ? null : 'support')}
                      >
                        <Ionicons 
                          name={expandedIndicator === 'support' ? "close-circle" : "help-circle"} 
                          size={16} 
                          color={colors.success} 
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.statValue, { color: '#10b981' }]}>
                      ${technicalData.support1.toFixed(2)}
                    </Text>
                    {expandedIndicator === 'support' ? (
                      <View style={[styles.helpCard, { backgroundColor: `${colors.success}10`, borderColor: colors.success }]}>
                        <Text style={[styles.helpTitle, { color: colors.text }]}>
                          💡 Nivel de Soporte
                        </Text>
                        <Text style={[styles.helpText, { color: colors.subtitle }]}>
                          Precio donde históricamente aparece <Text style={{ fontWeight: '600', color: '#10b981' }}>demanda fuerte de compra</Text> que impide que baje más.
                        </Text>
                        <Text style={[styles.helpText, { color: colors.subtitle, marginTop: 8 }]}>
                          📌 <Text style={{ fontWeight: '600' }}>Cómo usarlo:</Text>
                        </Text>
                        <Text style={[styles.helpText, { color: colors.subtitle }]}>
                          • Cerca del soporte: <Text style={{ fontWeight: '600' }}>Posible punto de compra</Text>
                        </Text>
                        <Text style={[styles.helpText, { color: colors.subtitle }]}>
                          • Si rompe el soporte: <Text style={{ fontWeight: '600', color: '#ef4444' }}>Señal de caída</Text> continua
                        </Text>
                      </View>
                    ) : (
                      <Text style={[styles.technicalExplanation, { color: colors.subtitle }]}>
                        Nivel de precio donde suele haber demanda de compra
                      </Text>
                    )}
                  </View>
                )}

                {/* Resistencia */}
                {technicalData.resistance1 !== undefined && technicalData.resistance1 !== null && (
                  <View style={styles.technicalItem}>
                    <View style={styles.indicatorTitleRow}>
                      <Text style={[styles.technicalLabel, { color: colors.text }]}>Resistencia</Text>
                      <TouchableOpacity 
                        style={[styles.infoButton, { backgroundColor: `${colors.success}15` }]}
                        onPress={() => setExpandedIndicator(expandedIndicator === 'resistance' ? null : 'resistance')}
                      >
                        <Ionicons 
                          name={expandedIndicator === 'resistance' ? "close-circle" : "help-circle"} 
                          size={16} 
                          color={colors.success} 
                        />
                      </TouchableOpacity>
                    </View>
                    <Text style={[styles.statValue, { color: '#ef4444' }]}>
                      ${technicalData.resistance1.toFixed(2)}
                    </Text>
                    {expandedIndicator === 'resistance' ? (
                      <View style={[styles.helpCard, { backgroundColor: `${colors.success}10`, borderColor: colors.success }]}>
                        <Text style={[styles.helpTitle, { color: colors.text }]}>
                          💡 Nivel de Resistencia
                        </Text>
                        <Text style={[styles.helpText, { color: colors.subtitle }]}>
                          Precio donde históricamente aparece <Text style={{ fontWeight: '600', color: '#ef4444' }}>presión de venta fuerte</Text> que impide que suba más.
                        </Text>
                        <Text style={[styles.helpText, { color: colors.subtitle, marginTop: 8 }]}>
                          📌 <Text style={{ fontWeight: '600' }}>Cómo usarlo:</Text>
                        </Text>
                        <Text style={[styles.helpText, { color: colors.subtitle }]}>
                          • Cerca de la resistencia: <Text style={{ fontWeight: '600' }}>Posible toma de ganancias</Text>
                        </Text>
                        <Text style={[styles.helpText, { color: colors.subtitle }]}>
                          • Si rompe la resistencia: <Text style={{ fontWeight: '600', color: '#10b981' }}>Señal de subida</Text> continua (breakout)
                        </Text>
                      </View>
                    ) : (
                      <Text style={[styles.technicalExplanation, { color: colors.subtitle }]}>
                        Nivel de precio donde suele haber presión de venta
                      </Text>
                    )}
                  </View>
                )}
              </View>
              )}
            </View>
          )}

          {/* Description */}
          <View style={[styles.descriptionCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Acerca de</Text>
            <Text style={[styles.description, { color: colors.text }]}>
              {stock.description}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: Platform.OS === 'ios' ? 60 : 16,
    borderBottomWidth: 1,
    zIndex: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 16,
  },
  stockInfoCard: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  stockName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stockSector: {
    fontSize: 16,
    marginBottom: 16,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  currentPrice: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  priceChange: {
    fontSize: 18,
    fontWeight: '600',
  },
  chartCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  chart: {
    marginVertical: 8,
    borderRadius: 16,
  },
  statsCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    marginBottom: 16,
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  technicalCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  technicalDescription: {
    fontSize: 13,
    marginBottom: 16,
    lineHeight: 18,
  },
  technicalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  technicalItem: {
    width: '48%',
    marginBottom: 16,
  },
  technicalItemFull: {
    width: '100%',
    marginBottom: 16,
  },
  technicalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  technicalLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  technicalExplanation: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 4,
    fontStyle: 'italic',
  },
  rsiContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  rsiValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  rsiSignal: {
    fontSize: 12,
    fontWeight: '500',
  },
  descriptionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 32,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  // Estilos para botones de ayuda de indicadores
  indicatorTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpCard: {
    marginTop: 12,
    padding: 12,
    borderRadius: 10,
    borderWidth: 1.5,
  },
  helpTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  helpText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 4,
  },
});
