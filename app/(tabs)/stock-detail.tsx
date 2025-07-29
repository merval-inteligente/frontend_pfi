import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { generateStockData, getStockDescription } from '@/services/mockup';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

export default function StockDetailScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const params = useLocalSearchParams();
  const [selectedChart, setSelectedChart] = useState<'price' | 'volume' | 'indicators'>('price');
  
  const stockSymbol = params.symbol as string;
  const stockValue = params.value as string;
  
  const stockData = generateStockData();
  const stockInfo = getStockDescription(stockSymbol);

  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    color: (opacity = 1) => colors.tint + Math.round(opacity * 255).toString(16).padStart(2, '0'),
    labelColor: (opacity = 1) => colors.text + Math.round(opacity * 255).toString(16).padStart(2, '0'),
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 12,
    },
  };

  const renderChart = () => {
    const chartWidth = screenWidth - 32;
    const chartHeight = 220;

    switch (selectedChart) {
      case 'price':
        return (
          <LineChart
            data={{
              labels: stockData.dates.filter((_, index) => index % 5 === 0),
              datasets: [
                {
                  data: stockData.price,
                  color: (opacity = 1) => `#8CD279${Math.round(opacity * 255).toString(16)}`,
                  strokeWidth: 3,
                },
                {
                  data: stockData.movingAverage,
                  color: (opacity = 1) => `#4A9EFF${Math.round(opacity * 255).toString(16)}`,
                  strokeWidth: 2,
                }
              ],
              legend: ['Precio', 'Media Móvil (7d)']
            }}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfig}
            bezier
            style={styles.chart}
          />
        );
      
      case 'volume':
        return (
          <BarChart
            data={{
              labels: stockData.dates.filter((_, index) => index % 5 === 0),
              datasets: [{
                data: stockData.volume.map(v => v / 1000000), // Convertir a millones
              }]
            }}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfig}
            style={styles.chart}
            yAxisSuffix="M"
            yAxisLabel=""
          />
        );
      
      case 'indicators':
        return (
          <LineChart
            data={{
              labels: stockData.dates.filter((_, index) => index % 5 === 0),
              datasets: [{
                data: stockData.rsi,
                color: (opacity = 1) => `#FF6B6B${Math.round(opacity * 255).toString(16)}`,
                strokeWidth: 2,
              }],
              legend: ['RSI (14)']
            }}
            width={chartWidth}
            height={chartHeight}
            chartConfig={chartConfig}
            style={styles.chart}
          />
        );
      
      default:
        return null;
    }
  };

  const getChartTitle = () => {
    switch (selectedChart) {
      case 'price': return 'Precio y Media Móvil';
      case 'volume': return 'Volumen de Transacciones';
      case 'indicators': return 'Indicadores Técnicos (RSI)';
      default: return '';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{stockSymbol}</Text>
          <Text style={[styles.headerSubtitle, { color: colors.subtitle }]}>{stockInfo.name}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={[styles.currentPrice, { color: colors.success }]}>
            ${stockValue}
          </Text>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Chart Selection */}
        <View style={styles.chartSelector}>
          <TouchableOpacity
            style={[
              styles.chartTab,
              { backgroundColor: selectedChart === 'price' ? colors.tint : colors.card }
            ]}
            onPress={() => setSelectedChart('price')}
          >
            <Text style={[
              styles.chartTabText,
              { color: selectedChart === 'price' ? 'white' : colors.text }
            ]}>
              Precio
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.chartTab,
              { backgroundColor: selectedChart === 'volume' ? colors.tint : colors.card }
            ]}
            onPress={() => setSelectedChart('volume')}
          >
            <Text style={[
              styles.chartTabText,
              { color: selectedChart === 'volume' ? 'white' : colors.text }
            ]}>
              Volumen
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.chartTab,
              { backgroundColor: selectedChart === 'indicators' ? colors.tint : colors.card }
            ]}
            onPress={() => setSelectedChart('indicators')}
          >
            <Text style={[
              styles.chartTabText,
              { color: selectedChart === 'indicators' ? 'white' : colors.text }
            ]}>
              Indicadores
            </Text>
          </TouchableOpacity>
        </View>

        {/* Chart */}
        <View style={[styles.chartContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.chartTitle, { color: colors.text }]}>
            {getChartTitle()}
          </Text>
          {renderChart()}
        </View>

        {/* Stock Description */}
        <View style={[styles.descriptionContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.descriptionTitle, { color: colors.text }]}>
            Acerca de {stockSymbol}
          </Text>
          <Text style={[styles.descriptionText, { color: colors.subtitle }]}>
            {stockInfo.description}
          </Text>
        </View>

        {/* Technical Indicators Summary */}
        <View style={[styles.indicatorsContainer, { backgroundColor: colors.card }]}>
          <Text style={[styles.indicatorsTitle, { color: colors.text }]}>
            Resumen Técnico
          </Text>
          <View style={styles.indicatorRow}>
            <View style={styles.indicatorItem}>
              <Text style={[styles.indicatorLabel, { color: colors.subtitle }]}>Media Móvil (7d)</Text>
              <Text style={[styles.indicatorValue, { color: colors.success }]}>
                ${stockData.movingAverage[stockData.movingAverage.length - 1]}
              </Text>
            </View>
            <View style={styles.indicatorItem}>
              <Text style={[styles.indicatorLabel, { color: colors.subtitle }]}>RSI (14)</Text>
              <Text style={[styles.indicatorValue, { color: colors.text }]}>
                {stockData.rsi[stockData.rsi.length - 1]}
              </Text>
            </View>
          </View>
          <View style={styles.indicatorRow}>
            <View style={styles.indicatorItem}>
              <Text style={[styles.indicatorLabel, { color: colors.subtitle }]}>Volumen Promedio</Text>
              <Text style={[styles.indicatorValue, { color: colors.text }]}>
                {(stockData.volume.reduce((a, b) => a + b, 0) / stockData.volume.length / 1000000).toFixed(1)}M
              </Text>
            </View>
            <View style={styles.indicatorItem}>
              <Text style={[styles.indicatorLabel, { color: colors.subtitle }]}>Variación 30d</Text>
              <Text style={[styles.indicatorValue, { color: colors.success }]}>
                +{((stockData.price[stockData.price.length - 1] / stockData.price[0] - 1) * 100).toFixed(1)}%
              </Text>
            </View>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 70,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
    paddingTop: 8,
  },
  chartSelector: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 16,
    gap: 8,
  },
  chartTab: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  chartTabText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chartContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 8,
  },
  descriptionContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
  },
  indicatorsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
  },
  indicatorsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  indicatorRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  indicatorItem: {
    flex: 1,
    marginRight: 16,
  },
  indicatorLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  indicatorValue: {
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 20,
  },
});
