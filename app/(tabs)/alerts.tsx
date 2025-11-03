import { AlertCreator } from '@/components/AlertCreator';
import { AlertSuggestions } from '@/components/AlertSuggestions';
import { getBottomPaddingForTabBar, getHeaderPaddingTop, ResponsiveContainer, useResponsivePadding } from '@/components/ResponsiveContainer';
import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { usePreferencesSync } from '@/contexts/PreferencesSyncContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getAlerts } from '@/controller/apiController';
import { Alert } from '@/services/mockup';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const AlertItem = ({ alert, onToggle, onEdit }: { alert: Alert; onToggle: (id: string) => void; onEdit: (alert: Alert) => void }) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return '#dc2626';
      case 'high': return '#f97316';
      case 'medium': return '#fbbf24';
      case 'low': return '#22c55e';
      default: return colors.success;
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical': return 'alert-circle';
      case 'high': return 'warning';
      case 'medium': return 'information-circle';
      case 'low': return 'checkmark-circle';
      default: return 'notifications';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'news': return 'newspaper';
      case 'price': return 'trending-up';
      case 'volume': return 'bar-chart';
      case 'portfolio': return 'pie-chart';
      default: return 'notifications';
    }
  };

  const getTimeSinceLastTrigger = (lastTriggered?: Date | string) => {
    if (!lastTriggered) return null;
    const triggerDate = typeof lastTriggered === 'string' ? new Date(lastTriggered) : lastTriggered;
    const diff = Date.now() - triggerDate.getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };
  
  return (
    <TouchableOpacity 
      style={[
        styles.alertItem, 
        { 
          backgroundColor: colors.card,
          borderLeftWidth: 4,
          borderLeftColor: alert.enabled ? getPriorityColor(alert.priority || 'low') : colors.cardBorder,
          opacity: alert.enabled ? 1 : 0.6
        }
      ]}
      onPress={() => onEdit(alert)}
      activeOpacity={0.7}
    >
      {/* Header Row */}
      <View style={styles.alertHeader}>
        {/* Priority Icon */}
        <View style={[styles.statusIndicator, { backgroundColor: `${getPriorityColor(alert.priority || 'low')}20` }]}>
          <Ionicons 
            name={getPriorityIcon(alert.priority || 'low') as any} 
            size={20} 
            color={getPriorityColor(alert.priority || 'low')} 
          />
        </View>

        {/* Title & Symbol */}
        <View style={styles.alertTitleRow}>
          {alert.config?.symbol && (
            <View style={[styles.symbolBadge, { backgroundColor: `${getPriorityColor(alert.priority || 'low')}15` }]}>
              <Text style={[styles.symbolText, { color: getPriorityColor(alert.priority || 'low') }]}>
                {alert.config.symbol}
              </Text>
            </View>
          )}
        </View>

        {/* Active/Inactive Toggle */}
        <TouchableOpacity 
          style={[
            styles.statusIndicator,
            { backgroundColor: alert.enabled ? `${getPriorityColor(alert.priority || 'low')}15` : `${colors.subtitle}10` }
          ]}
          onPress={(e) => {
            e.stopPropagation();
            onToggle(alert.id);
          }}
          activeOpacity={0.7}
        >
          <Ionicons 
            name={alert.enabled ? "notifications" : "notifications-off"} 
            size={18} 
            color={alert.enabled ? getPriorityColor(alert.priority || 'low') : colors.subtitle} 
          />
        </TouchableOpacity>
      </View>

      {/* Title */}
      <Text style={[styles.alertTitle, { color: colors.text }]} numberOfLines={2}>
        {alert.title}
      </Text>

      {/* Description */}
      <Text style={[styles.alertDescription, { color: colors.subtitle }]} numberOfLines={2}>
        {alert.description}
      </Text>

      {/* Footer Row */}
      <View style={styles.alertMeta}>
        {/* Type Icon */}
        <View style={styles.alertTypeBadge}>
          <Ionicons name={getTypeIcon(alert.type) as any} size={14} color={colors.tint} />
        </View>

        {/* Trigger Count */}
        {alert.triggerCount !== undefined && alert.triggerCount > 0 && (
          <View style={styles.triggerBadge}>
            <Ionicons name="flash" size={12} color={colors.success} />
            <Text style={[styles.triggerCountText, { color: colors.success }]}>{alert.triggerCount}</Text>
          </View>
        )}

        {/* Time */}
        {alert.lastTriggered && (
          <Text style={[styles.lastTriggered, { color: colors.subtitle }]}>
            {getTimeSinceLastTrigger(alert.lastTriggered)}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function AlertsScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const { user } = useAuth();
  const { userFavorites } = usePreferencesSync();
  const [alertList, setAlertList] = useState<Alert[]>([]);
  const [showCreator, setShowCreator] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(20); // Mostrar 20 inicialmente
  const ITEMS_PER_PAGE = 20;

  // Cargar alertas desde la API
  const loadAlerts = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      
      const alerts = await getAlerts();
      
      // Ordenar por fecha de creación (más recientes primero)
      const sortedAlerts = alerts.sort((a: Alert, b: Alert) => {
        const dateA = a.createdAt ? (typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt) : new Date(0);
        const dateB = b.createdAt ? (typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      setAlertList(sortedAlerts);
    } catch {
      setError('No se pudieron cargar las alertas. Verifica tu conexión.');
      // Mantener el array vacío en caso de error
      setAlertList([]);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Cargar alertas al montar el componente
  useEffect(() => {
    loadAlerts();
  }, []);

  // Resetear paginación cuando cambian los filtros
  useEffect(() => {
    setDisplayCount(ITEMS_PER_PAGE);
  }, [filterPriority, filterType]);

  const toggleAlert = (id: string) => {
    setAlertList((prev: Alert[]) => 
      prev.map((alert: Alert) => 
        alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
      )
    );
  };

  const handleSaveAlert = (newAlert: Alert) => {
    setAlertList((prev) => [newAlert, ...prev]);
  };

  const handleEditAlert = (alert: Alert) => {
    // Por ahora solo mostramos la info, se puede extender para editar
  };

  const handleRefresh = () => {
    loadAlerts(true);
    setDisplayCount(ITEMS_PER_PAGE); // Reset al refrescar
  };

  const handleLoadMore = () => {
    setDisplayCount(prev => prev + ITEMS_PER_PAGE);
  };

  // Filtrar alertas
  const filteredAlerts = alertList.filter((alert: Alert) => {
    if (filterPriority && alert.priority !== filterPriority) return false;
    if (filterType && alert.type !== filterType) return false;
    return true;
  });

  // Alertas a mostrar (con paginación)
  const displayedAlerts = filteredAlerts.slice(0, displayCount);
  const hasMore = displayCount < filteredAlerts.length;

  const activeAlerts = filteredAlerts.filter((alert: Alert) => alert.enabled);
  const triggeredThisWeek = filteredAlerts.filter((alert: Alert) => {
    if (!alert.lastTriggered) return false;
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const triggerDate = typeof alert.lastTriggered === 'string' ? new Date(alert.lastTriggered) : alert.lastTriggered;
    return triggerDate.getTime() > weekAgo;
  }).length;

  const responsivePadding = useResponsivePadding();
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ResponsiveContainer>
        {/* Header */}
        <View style={[styles.header, { 
          backgroundColor: colors.background, 
          borderBottomColor: colors.cardBorder,
          paddingHorizontal: responsivePadding.horizontal,
          paddingTop: getHeaderPaddingTop()
        }]}>
        <View>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Alertas</Text>
          <Text style={[styles.headerSubtitle, { color: colors.subtitle }]}>
            {activeAlerts.length} activas
          </Text>
        </View>
        <TouchableOpacity 
          style={[styles.addButton, { backgroundColor: colors.success }]}
          onPress={() => setShowCreator(true)}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Estadísticas */}
      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Ionicons name="notifications-outline" size={20} color={colors.success} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{activeAlerts.length}</Text>
          <Text style={[styles.statLabel, { color: colors.subtitle }]}>Activas</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Ionicons name="pulse-outline" size={20} color="#ffc107" />
          <Text style={[styles.statNumber, { color: colors.text }]}>{triggeredThisWeek}</Text>
          <Text style={[styles.statLabel, { color: colors.subtitle }]}>Esta semana</Text>
        </View>
        <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <Ionicons name="list-outline" size={20} color={colors.subtitle} />
          <Text style={[styles.statNumber, { color: colors.text }]}>{alertList.length}</Text>
          <Text style={[styles.statLabel, { color: colors.subtitle }]}>Total</Text>
        </View>
      </View>

      {/* Filtros */}
      <View style={styles.filtersContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersScroll}>
          <TouchableOpacity 
            style={[styles.filterChip, { 
              backgroundColor: filterPriority === null ? colors.success : colors.card,
              borderColor: filterPriority === null ? colors.success : colors.cardBorder
            }]}
            onPress={() => setFilterPriority(null)}
          >
            <Text style={[styles.filterChipText, { 
              color: filterPriority === null ? 'white' : colors.text 
            }]}>Todas</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, { 
              backgroundColor: filterPriority === 'critical' ? '#dc2626' : colors.card,
              borderColor: filterPriority === 'critical' ? '#dc2626' : colors.cardBorder
            }]}
            onPress={() => setFilterPriority('critical')}
          >
            <Ionicons name="alert-circle" size={16} color={filterPriority === 'critical' ? 'white' : '#dc2626'} />
            <Text style={[styles.filterChipText, { 
              color: filterPriority === 'critical' ? 'white' : colors.text 
            }]}>Críticas</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, { 
              backgroundColor: filterPriority === 'high' ? '#f97316' : colors.card,
              borderColor: filterPriority === 'high' ? '#f97316' : colors.cardBorder
            }]}
            onPress={() => setFilterPriority('high')}
          >
            <Ionicons name="warning" size={16} color={filterPriority === 'high' ? 'white' : '#f97316'} />
            <Text style={[styles.filterChipText, { 
              color: filterPriority === 'high' ? 'white' : colors.text 
            }]}>Alta</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, { 
              backgroundColor: filterPriority === 'medium' ? '#fbbf24' : colors.card,
              borderColor: filterPriority === 'medium' ? '#fbbf24' : colors.cardBorder
            }]}
            onPress={() => setFilterPriority('medium')}
          >
            <Text style={[styles.filterChipText, { 
              color: filterPriority === 'medium' ? 'white' : colors.text 
            }]}>Media</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, { 
              backgroundColor: filterType === 'news' ? colors.tint : colors.card,
              borderColor: filterType === 'news' ? colors.tint : colors.cardBorder
            }]}
            onPress={() => setFilterType(filterType === 'news' ? null : 'news')}
          >
            <Ionicons name="newspaper-outline" size={16} color={filterType === 'news' ? 'white' : colors.text} />
            <Text style={[styles.filterChipText, { 
              color: filterType === 'news' ? 'white' : colors.text 
            }]}>Noticias</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, { 
              backgroundColor: filterType === 'price' ? colors.tint : colors.card,
              borderColor: filterType === 'price' ? colors.tint : colors.cardBorder
            }]}
            onPress={() => setFilterType(filterType === 'price' ? null : 'price')}
          >
            <Ionicons name="trending-up-outline" size={16} color={filterType === 'price' ? 'white' : colors.text} />
            <Text style={[styles.filterChipText, { 
              color: filterType === 'price' ? 'white' : colors.text 
            }]}>Precio</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterChip, { 
              backgroundColor: filterType === 'volume' ? colors.tint : colors.card,
              borderColor: filterType === 'volume' ? colors.tint : colors.cardBorder
            }]}
            onPress={() => setFilterType(filterType === 'volume' ? null : 'volume')}
          >
            <Ionicons name="bar-chart-outline" size={16} color={filterType === 'volume' ? 'white' : colors.text} />
            <Text style={[styles.filterChipText, { 
              color: filterType === 'volume' ? 'white' : colors.text 
            }]}>Volumen</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            tintColor={colors.success}
            colors={[colors.success]}
          />
        }
      >
        {/* Indicador de error */}
        {error && (
          <View style={[styles.errorBanner, { backgroundColor: `${colors.danger}15`, borderColor: colors.danger }]}>
            <Ionicons name="warning-outline" size={20} color={colors.danger} />
            <Text style={[styles.errorText, { color: colors.danger }]}>{error}</Text>
          </View>
        )}

        {/* Indicador de carga inicial */}
        {isLoading && filteredAlerts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.success} />
            <Text style={[styles.loadingText, { color: colors.subtitle }]}>Cargando alertas...</Text>
          </View>
        ) : filteredAlerts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off-outline" size={64} color={colors.subtitle} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {filterPriority || filterType ? 'No hay alertas con estos filtros' : 'No hay alertas'}
            </Text>
            <Text style={[styles.emptyText, { color: colors.subtitle }]}>
              {filterPriority || filterType 
                ? 'Intenta cambiar los filtros para ver más resultados'
                : 'Crea tu primera alerta personalizada para recibir notificaciones oportunas'
              }
            </Text>
            {!filterPriority && !filterType && (
              <TouchableOpacity 
                style={[styles.createButton, { backgroundColor: colors.success }]}
                onPress={() => setShowCreator(true)}
              >
                <Ionicons name="add" size={20} color="white" />
                <Text style={styles.createButtonText}>Crear Alerta</Text>
              </TouchableOpacity>
            )}
          </View>
        ) : (
          <>
            {/* Sugerencias inteligentes */}
            {userFavorites.length > 0 && !filterPriority && !filterType && (
              <AlertSuggestions
                userFavorites={userFavorites}
                onSelectSuggestion={handleSaveAlert}
              />
            )}
            
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {filterPriority || filterType ? 'Resultados' : 'Mis Alertas'}
              {filteredAlerts.length > 0 && (
                <Text style={[styles.sectionSubtitle, { color: colors.subtitle }]}>
                  {' '}({displayedAlerts.length} de {filteredAlerts.length})
                </Text>
              )}
            </Text>
            
            {displayedAlerts.map((alert: Alert, index: number) => (
              <AlertItem 
                key={alert.id || `alert-${index}`} 
                alert={alert} 
                onToggle={toggleAlert} 
                onEdit={handleEditAlert} 
              />
            ))}

            {/* Botón Ver Más */}
            {hasMore && (
              <TouchableOpacity 
                style={[styles.loadMoreButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}
                onPress={handleLoadMore}
                activeOpacity={0.7}
              >
                <Ionicons name="chevron-down-circle-outline" size={20} color={colors.tint} />
                <Text style={[styles.loadMoreText, { color: colors.tint }]}>
                  Ver más ({filteredAlerts.length - displayCount} restantes)
                </Text>
              </TouchableOpacity>
            )}
          </>
        )}
        <View style={[styles.bottomSpacing, { height: getBottomPaddingForTabBar() }]} />
      </ScrollView>

      {/* Modal de creación */}
      <AlertCreator
        visible={showCreator}
        onClose={() => setShowCreator(false)}
        onSave={handleSaveAlert}
        stocks={userFavorites}
        userRiskProfile={(user?.riskAppetite as 'conservador' | 'moderado' | 'agresivo') || 'moderado'}
      />
      </ResponsiveContainer>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 70,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 16,
    marginBottom: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 4,
  },
  statLabel: {
    fontSize: 11,
    textAlign: 'center',
  },
  filtersContainer: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  filtersScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 16,
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: 'normal',
  },
  alertItem: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 6,
  },
  alertMainContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    gap: 10,
  },
  alertTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  symbolBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  symbolText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  statusIndicator: {
    width: 38,
    height: 38,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertTitle: {
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  alertDescription: {
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 14,
    opacity: 0.8,
  },
  alertMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  alertTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  alertTypeText: {
    fontSize: 13,
    fontWeight: '600',
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '600',
  },
  triggerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 3,
  },
  triggerCountText: {
    fontSize: 13,
    fontWeight: '700',
  },
  lastTriggered: {
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 'auto',
  },
  expandIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    gap: 4,
  },
  expandText: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  errorText: {
    fontSize: 14,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    fontSize: 14,
    marginTop: 12,
  },
  loadMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  loadMoreText: {
    fontSize: 15,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 32,
  },
});
