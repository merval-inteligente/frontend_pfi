import { getBottomPaddingForTabBar, getHeaderPaddingTop } from '@/components/ResponsiveContainer';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { MervalStock, getDefaultMervalStocks, getStockSectors } from '@/services/mockup';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

export default function ExploreScreen() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSector, setSelectedSector] = useState('Todos');
  const [stocks, setStocks] = useState<MervalStock[]>(getDefaultMervalStocks());
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);
  const sectors = getStockSectors();

  const toggleFavorite = (stockId: string) => {
    setStocks(prevStocks => 
      prevStocks.map(stock => 
        stock.id === stockId 
          ? { ...stock, isFavorite: !stock.isFavorite }
          : stock
      )
    );
  };

  const filteredStocks = stocks.filter(stock => {
    const matchesSearch = stock.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         stock.symbol.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSector = selectedSector === 'Todos' || stock.sector === selectedSector;
    const matchesFavorites = !showOnlyFavorites || stock.isFavorite;
    
    return matchesSearch && matchesSector && matchesFavorites;
  });

  const handleAddToPreferences = (stock: MervalStock) => {
    const isAlreadyInPreferences = stock.isFavorite;
    const action = isAlreadyInPreferences ? 'quitar de' : 'agregar a';
    const actionText = isAlreadyInPreferences ? 'Quitar' : 'Agregar';
    
    Alert.alert(
      `${actionText} Preferencias`,
      `¿Deseas ${action} tus preferencias ${stock.name} (${stock.symbol})?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: actionText, 
          onPress: () => {
            toggleFavorite(stock.id);
            Alert.alert(
              'Éxito', 
              `${stock.symbol} ${isAlreadyInPreferences ? 'eliminada de' : 'agregada a'} tus preferencias`
            );
          }
        }
      ]
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const StockCard = ({ stock }: { stock: MervalStock }) => (
    <View style={[styles.stockCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.stockHeader}>
        <View style={styles.stockInfo}>
          <Text style={[styles.stockSymbol, { color: colors.text }]}>{stock.symbol}</Text>
          <Text style={[styles.stockName, { color: colors.subtitle }]}>{stock.name}</Text>
          <Text style={[styles.stockSector, { color: colors.subtitle }]}>{stock.sector}</Text>
        </View>
        <TouchableOpacity 
          style={styles.favoriteButton}
          onPress={() => toggleFavorite(stock.id)}
        >
          <Ionicons 
            name={stock.isFavorite ? 'heart' : 'heart-outline'} 
            size={22} 
            color={stock.isFavorite ? '#FF6B6B' : colors.subtitle} 
          />
        </TouchableOpacity>
      </View>
      
      <View style={styles.stockData}>
        <View style={styles.priceContainer}>
          <Text style={[styles.stockPrice, { color: colors.text }]}>
            {formatPrice(stock.price)}
          </Text>
          <View style={[
            styles.changeContainer,
            { backgroundColor: stock.change >= 0 ? '#4ADE80' : '#F87171' }
          ]}>
            <Ionicons 
              name={stock.change >= 0 ? 'trending-up' : 'trending-down'} 
              size={12} 
              color="white" 
            />
            <Text style={styles.changeText}>
              {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
            </Text>
          </View>
        </View>
        
        <View style={styles.volumeContainer}>
          <Text style={[styles.volumeLabel, { color: colors.subtitle }]}>Volumen:</Text>
          <Text style={[styles.volumeValue, { color: colors.text }]}>
            {(stock.volume / 1000).toFixed(0)}K
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.preferenceButton, { backgroundColor: stock.isFavorite ? '#F87171' : colors.tint }]}
        onPress={() => handleAddToPreferences(stock)}
      >
        <Ionicons 
          name={stock.isFavorite ? 'remove-circle' : 'add-circle'} 
          size={16} 
          color="white" 
          style={{ marginRight: 6 }}
        />
        <Text style={styles.preferenceButtonText}>
          {stock.isFavorite ? 'Quitar' : 'Agregar'}
        </Text>
      </TouchableOpacity>
    </View>
  );
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Mercado</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.searchContainer}>
        <View style={[styles.searchInputContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Ionicons name="search" size={20} color={colors.subtitle} style={styles.searchIcon} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Buscar por nombre o símbolo..."
            placeholderTextColor={colors.subtitle}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sectorsScroll}>
          {sectors.map((sector) => (
            <TouchableOpacity
              key={sector}
              style={[
                styles.sectorButton,
                {
                  backgroundColor: selectedSector === sector ? colors.tint : colors.card,
                  borderColor: colors.cardBorder,
                }
              ]}
              onPress={() => setSelectedSector(sector)}
            >
              <Text style={[
                styles.sectorButtonText,
                {
                  color: selectedSector === sector ? 'white' : colors.text
                }
              ]}>
                {sector}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <TouchableOpacity
          style={[styles.favoritesToggle, { borderColor: colors.cardBorder }]}
          onPress={() => setShowOnlyFavorites(!showOnlyFavorites)}
        >
          <Ionicons 
            name={showOnlyFavorites ? 'heart' : 'heart-outline'} 
            size={20} 
            color={showOnlyFavorites ? '#FF6B6B' : colors.subtitle} 
          />
          <Text style={[styles.favoritesToggleText, { color: colors.text }]}>
            Preferencias
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.stocksList} 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: getBottomPaddingForTabBar() }}
      >
        {filteredStocks.length > 0 ? (
          <View style={styles.stocksGrid}>
            {filteredStocks.map((stock) => (
              <StockCard key={stock.id} stock={stock} />
            ))}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="search" size={64} color={colors.subtitle} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              No se encontraron acciones
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.subtitle }]}>
              Intenta modificar los filtros de búsqueda
            </Text>
          </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: getHeaderPaddingTop(),
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    width: 40,
    height: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  filtersContainer: {
    paddingBottom: 16,
  },
  sectorsScroll: {
    paddingLeft: 20,
    marginBottom: 12,
  },
  sectorButton: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  sectorButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  favoritesToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
  },
  favoritesToggleText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  stocksList: {
    flex: 1,
    paddingHorizontal: 20,
  },
  stocksGrid: {
    gap: 16,
    paddingBottom: 20,
  },
  stockCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  stockHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stockInfo: {
    flex: 1,
  },
  stockSymbol: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  stockName: {
    fontSize: 14,
    marginBottom: 2,
  },
  stockSector: {
    fontSize: 12,
    opacity: 0.8,
  },
  favoriteButton: {
    padding: 4,
  },
  stockData: {
    marginBottom: 16,
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stockPrice: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  changeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  changeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  volumeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  volumeLabel: {
    fontSize: 14,
  },
  volumeValue: {
    fontSize: 14,
    fontWeight: '500',
  },
  preferenceButton: {
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  preferenceButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    textAlign: 'center',
  },
});
