import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { Alert, getDefaultAlerts } from '@/services/mockup';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

const AlertItem = ({ alert, onToggle }: { alert: Alert; onToggle: (id: string) => void }) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  
  return (
    <View style={[styles.alertItem, { backgroundColor: colors.card }]}>
      <View style={[styles.alertIcon, { backgroundColor: `${colors.success}15` }]}>
        <Ionicons name={alert.icon as any} size={24} color={colors.success} />
      </View>
      <View style={styles.alertContent}>
        <Text style={[styles.alertTitle, { color: colors.text }]}>{alert.title}</Text>
        <Text style={[styles.alertDescription, { color: colors.subtitle }]}>{alert.description}</Text>
        <View style={[styles.alertType, { backgroundColor: `${colors.success}15` }]}>
          <Text style={[styles.alertTypeText, { color: colors.success }]}>
            {alert.type === 'price' ? 'Precio' : alert.type === 'news' ? 'Noticias' : 'Cartera'}
          </Text>
        </View>
      </View>
      <Switch
        value={alert.enabled}
        onValueChange={() => onToggle(alert.id)}
        trackColor={{ 
          false: colorScheme === 'dark' ? '#434f40' : '#e9ecef', 
          true: colors.success 
        }}
        thumbColor={alert.enabled ? (colorScheme === 'dark' ? 'white' : '#ffffff') : colors.subtitle}
      />
    </View>
  );
};

export default function AlertsScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [alertList, setAlertList] = React.useState<Alert[]>(getDefaultAlerts());

  const toggleAlert = (id: string) => {
    setAlertList((prev: Alert[]) => 
      prev.map((alert: Alert) => 
        alert.id === id ? { ...alert, enabled: !alert.enabled } : alert
      )
    );
  };

  const activeAlerts = alertList.filter((alert: Alert) => alert.enabled);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Alertas</Text>
          <TouchableOpacity style={styles.settingsButton}>
            <Ionicons name="add" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{activeAlerts.length}</Text>
            <Text style={[styles.statLabel, { color: colors.subtitle }]}>Alertas Activas</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: colors.text }]}>{alertList.length - activeAlerts.length}</Text>
            <Text style={[styles.statLabel, { color: colors.subtitle }]}>Pausadas</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: colors.card }]}>
            <Text style={[styles.statNumber, { color: colors.success }]}>12</Text>
            <Text style={[styles.statLabel, { color: colors.subtitle }]}>Esta Semana</Text>
          </View>
        </View>

        {/* Recent Alert */}
        <View style={[styles.recentAlert, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <View style={styles.recentAlertHeader}>
            <Ionicons name="notifications" size={20} color={colors.success} />
            <Text style={[styles.recentAlertTitle, { color: colors.text }]}>Última Alerta</Text>
            <Text style={[styles.recentAlertTime, { color: colors.subtitle }]}>Hace 2 horas</Text>
          </View>
          <Text style={[styles.recentAlertText, { color: colors.text }]}>
            YPF subió 6.2% - Tu alerta de &quot;YPF sube más del 5%&quot; se activó
          </Text>
        </View>

        {/* Alerts List */}
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Mis Alertas</Text>
        
        {alertList.map((alert: Alert) => (
          <AlertItem key={alert.id} alert={alert} onToggle={toggleAlert} />
        ))}

        {/* Quick Setup */}
        <View style={styles.quickSetup}>
          <Text style={[styles.quickSetupTitle, { color: colors.text }]}>Configuración Rápida</Text>
          <TouchableOpacity style={[styles.quickSetupButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Ionicons name="add-circle-outline" size={20} color={colors.success} />
            <Text style={[styles.quickSetupText, { color: colors.text }]}>Agregar alerta de precio</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.quickSetupButton, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Ionicons name="newspaper-outline" size={20} color={colors.success} />
            <Text style={[styles.quickSetupText, { color: colors.text }]}>Alertas de noticias</Text>
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
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
    marginLeft: 48,
  },
  settingsButton: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  recentAlert: {
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderWidth: 1,
  },
  recentAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentAlertTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
    flex: 1,
  },
  recentAlertTime: {
    fontSize: 12,
  },
  recentAlertText: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  alertItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  alertIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  alertType: {
    alignSelf: 'flex-start',
  },
  alertTypeText: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  quickSetup: {
    paddingHorizontal: 16,
    marginTop: 20,
  },
  quickSetupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickSetupButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  quickSetupText: {
    fontSize: 16,
    marginLeft: 12,
  },
  bottomSpacing: {
    height: 32,
  },
});
