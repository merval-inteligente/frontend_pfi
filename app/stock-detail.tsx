import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { ExtendedStock, generateMockChartData, getExtendedStock } from '@/services/mockup';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Dimensions,
    SafeAreaView,
    ScrollView,
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
  const colors = Colors[colorScheme];
  
  const [stock, setStock] = useState<ExtendedStock | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStockData();
  }, [symbol]); // eslint-disable-line react-hooks/exhaustive-deps

  const loadStockData = async () => {
    try {
      if (typeof symbol === 'string') {
        const stockData = getExtendedStock(symbol);
        setStock(stockData);
      }
    } catch (error) {
      console.error('Error loading stock data:', error);
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
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.cardBorder }]}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{stock.symbol}</Text>
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* Stock Info */}
          <View style={[styles.stockInfoCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Text style={[styles.stockName, { color: colors.text }]}>{stock.name}</Text>
            <Text style={[styles.stockSector, { color: colors.subtitle }]}>{stock.sector}</Text>
            
            <View style={styles.priceRow}>
              <Text style={[styles.currentPrice, { color: colors.text }]}>
                ${stock.currentPrice}
              </Text>
              <Text style={[styles.priceChange, { 
                color: stock.percentageChange >= 0 ? '#10b981' : '#ef4444' 
              }]}>
                {stock.percentageChange >= 0 ? '+' : ''}{stock.percentageChange.toFixed(2)}%
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
                  {stock.volume.toLocaleString()}
                </Text>
              </View>
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
    paddingVertical: 12,
    paddingTop: 60,
    borderBottomWidth: 1,
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
});