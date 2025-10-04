import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { Alert } from '@/services/mockup';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface AlertSuggestion {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: 'price' | 'volume' | 'news' | 'portfolio';
  priority: 'low' | 'medium' | 'high';
  config: {
    symbol?: string;
    condition?: 'above' | 'below' | 'change_percent' | 'volume_spike';
    threshold?: number;
    timeframe?: '1h' | '1d' | '1w' | '1m';
  };
}

interface AlertSuggestionsProps {
  userFavorites: string[];
  onSelectSuggestion: (alert: Alert) => void;
}

export const AlertSuggestions: React.FC<AlertSuggestionsProps> = ({
  userFavorites,
  onSelectSuggestion
}) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  // Generar sugerencias inteligentes basadas en favoritos
  const generateSuggestions = (): AlertSuggestion[] => {
    const suggestions: AlertSuggestion[] = [];

    // Sugerencias para cada favorito
    userFavorites.slice(0, 3).forEach((symbol, index) => {
      // Alerta de variación de precio
      suggestions.push({
        id: `price-${symbol}-${index}`,
        title: `${symbol} varía más del 5%`,
        description: `Recibe alertas cuando ${symbol} sube o baja significativamente`,
        icon: 'trending-up',
        type: 'price',
        priority: 'high',
        config: {
          symbol,
          condition: 'change_percent',
          threshold: 5,
          timeframe: '1d'
        }
      });

      // Alerta de volumen inusual
      suggestions.push({
        id: `volume-${symbol}-${index}`,
        title: `Volumen inusual en ${symbol}`,
        description: `Te avisamos cuando hay actividad de trading significativa`,
        icon: 'bar-chart',
        type: 'volume',
        priority: 'medium',
        config: {
          symbol,
          condition: 'volume_spike',
          threshold: 200,
          timeframe: '1h'
        }
      });
    });

    // Sugerencias generales
    suggestions.push({
      id: 'portfolio-alert',
      title: 'Variación de cartera diaria',
      description: 'Monitorea el rendimiento total de tu cartera',
      icon: 'pie-chart',
      type: 'portfolio',
      priority: 'medium',
      config: {
        condition: 'change_percent',
        threshold: 3,
        timeframe: '1d'
      }
    });

    suggestions.push({
      id: 'news-alert',
      title: 'Noticias importantes de tus favoritos',
      description: 'Entérate de noticias relevantes sobre tus acciones',
      icon: 'newspaper',
      type: 'news',
      priority: 'low',
      config: {
        threshold: 1,
        timeframe: '1d'
      }
    });

    return suggestions.slice(0, 5); // Limitar a 5 sugerencias
  };

  const suggestions = generateSuggestions();

  const handleSelectSuggestion = (suggestion: AlertSuggestion) => {
    const alert: Alert = {
      id: `alert-${Date.now()}`,
      title: suggestion.title,
      description: suggestion.description,
      type: suggestion.type,
      icon: suggestion.icon,
      enabled: true,
      priority: suggestion.priority,
      config: suggestion.config,
      createdAt: new Date(),
      triggerCount: 0
    };
    onSelectSuggestion(alert);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#dc3545';
      case 'medium': return '#ffc107';
      case 'low': return '#6c757d';
      default: return colors.success;
    }
  };

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="bulb-outline" size={20} color={colors.success} />
        <Text style={[styles.title, { color: colors.text }]}>Sugerencias para ti</Text>
      </View>
      <Text style={[styles.subtitle, { color: colors.subtitle }]}>
        Basadas en tus acciones favoritas
      </Text>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {suggestions.map((suggestion) => (
          <TouchableOpacity
            key={suggestion.id}
            style={[styles.suggestionCard, { 
              backgroundColor: colors.card,
              borderColor: colors.cardBorder
            }]}
            onPress={() => handleSelectSuggestion(suggestion)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, { 
              backgroundColor: `${getPriorityColor(suggestion.priority)}15` 
            }]}>
              <Ionicons 
                name={suggestion.icon as any} 
                size={24} 
                color={getPriorityColor(suggestion.priority)} 
              />
            </View>
            <Text style={[styles.suggestionTitle, { color: colors.text }]} numberOfLines={2}>
              {suggestion.title}
            </Text>
            <Text style={[styles.suggestionDescription, { color: colors.subtitle }]} numberOfLines={2}>
              {suggestion.description}
            </Text>
            <View style={[styles.badge, { backgroundColor: `${getPriorityColor(suggestion.priority)}15` }]}>
              <Text style={[styles.badgeText, { color: getPriorityColor(suggestion.priority) }]}>
                {suggestion.type === 'price' && 'Precio'}
                {suggestion.type === 'volume' && 'Volumen'}
                {suggestion.type === 'news' && 'Noticias'}
                {suggestion.type === 'portfolio' && 'Cartera'}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 4,
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
  subtitle: {
    fontSize: 13,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  scrollView: {
    paddingLeft: 16,
  },
  scrollContent: {
    paddingRight: 16,
    gap: 12,
  },
  suggestionCard: {
    width: 200,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
    minHeight: 40,
  },
  suggestionDescription: {
    fontSize: 13,
    lineHeight: 18,
    flex: 1,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
