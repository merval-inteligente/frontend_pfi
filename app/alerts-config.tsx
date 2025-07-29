import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { getDefaultAlertSettings, getDefaultTimeSettings } from '@/services/mockup';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';

export default function AlertsConfigScreen() {
  const { colorScheme } = useTheme();
  const router = useRouter();
  const colors = Colors[colorScheme];

  const [alertSettings, setAlertSettings] = useState(() => getDefaultAlertSettings());

  const [timeSettings, setTimeSettings] = useState(() => getDefaultTimeSettings());

  const toggleSetting = (key: keyof typeof alertSettings) => {
    setAlertSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleQuietHours = () => {
    setTimeSettings(prev => ({
      ...prev,
      quietHours: {
        ...prev.quietHours,
        enabled: !prev.quietHours.enabled
      }
    }));
  };

  const saveSettings = () => {
    Alert.alert('Éxito', 'Configuración de alertas guardada correctamente', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const AlertOption = ({ 
    icon, 
    title, 
    subtitle, 
    value, 
    onToggle, 
    color = colors.tint 
  }: {
    icon: string;
    title: string;
    subtitle: string;
    value: boolean;
    onToggle: () => void;
    color?: string;
  }) => (
    <View style={[styles.alertOption, { backgroundColor: colors.background }]}>
      <View style={styles.alertContent}>
        <Ionicons name={icon as any} size={24} color={color} />
        <View style={styles.alertText}>
          <Text style={[styles.alertTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.alertSubtitle, { color: colors.subtitle }]}>{subtitle}</Text>
        </View>
      </View>
      <TouchableOpacity onPress={onToggle}>
        <Ionicons 
          name={value ? "toggle" : "toggle-outline"} 
          size={32} 
          color={value ? colors.tint : colors.subtitle} 
        />
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Configuración de Alertas</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Price and Market Alerts */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Alertas de Mercado</Text>
          
          <AlertOption
            icon="trending-up-outline"
            title="Alertas de Precio"
            subtitle="Notificaciones cuando cambian los precios de tus acciones favoritas"
            value={alertSettings.priceAlerts}
            onToggle={() => toggleSetting('priceAlerts')}
          />

          <AlertOption
            icon="bar-chart-outline"
            title="Alertas de Volumen"
            subtitle="Notificaciones sobre cambios significativos en el volumen de trading"
            value={alertSettings.volumeAlerts}
            onToggle={() => toggleSetting('volumeAlerts')}
          />

          <AlertOption
            icon="flash-outline"
            title="Alertas de Volatilidad"
            subtitle="Notificaciones sobre alta volatilidad en el mercado"
            value={alertSettings.volatilityAlerts}
            onToggle={() => toggleSetting('volatilityAlerts')}
            color={colors.warning}
          />

          <AlertOption
            icon="cash-outline"
            title="Alertas de Dividendos"
            subtitle="Notificaciones sobre pagos de dividendos de tus acciones"
            value={alertSettings.dividendAlerts}
            onToggle={() => toggleSetting('dividendAlerts')}
            color={colors.success}
          />
        </View>

        {/* News and Reports */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Noticias y Reportes</Text>
          
          <AlertOption
            icon="newspaper-outline"
            title="Noticias del Mercado"
            subtitle="Noticias importantes que pueden afectar tus inversiones"
            value={alertSettings.newsAlerts}
            onToggle={() => toggleSetting('newsAlerts')}
          />

          <AlertOption
            icon="document-text-outline"
            title="Resumen Diario"
            subtitle="Resumen del rendimiento del mercado cada día"
            value={alertSettings.marketSummary}
            onToggle={() => toggleSetting('marketSummary')}
          />

          <AlertOption
            icon="calendar-outline"
            title="Reporte Semanal"
            subtitle="Análisis semanal de tu portfolio y el mercado"
            value={alertSettings.weeklyReport}
            onToggle={() => toggleSetting('weeklyReport')}
          />

          <AlertOption
            icon="stats-chart-outline"
            title="Reporte Mensual"
            subtitle="Reporte completo mensual con análisis detallado"
            value={alertSettings.monthlyReport}
            onToggle={() => toggleSetting('monthlyReport')}
          />
        </View>

        {/* Notification Methods */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Métodos de Notificación</Text>
          
          <AlertOption
            icon="phone-portrait-outline"
            title="Notificaciones Push"
            subtitle="Notificaciones en tu dispositivo móvil"
            value={alertSettings.pushNotifications}
            onToggle={() => toggleSetting('pushNotifications')}
          />

          <AlertOption
            icon="mail-outline"
            title="Notificaciones por Email"
            subtitle="Recibir alertas en tu correo electrónico"
            value={alertSettings.emailNotifications}
            onToggle={() => toggleSetting('emailNotifications')}
          />

          <AlertOption
            icon="chatbubble-outline"
            title="Notificaciones SMS"
            subtitle="Recibir alertas por mensaje de texto"
            value={alertSettings.smsNotifications}
            onToggle={() => toggleSetting('smsNotifications')}
          />
        </View>

        {/* Time Settings */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Configuración de Horarios</Text>
          
          <View style={[styles.alertOption, { backgroundColor: colors.background }]}>
            <View style={styles.alertContent}>
              <Ionicons name="moon-outline" size={24} color={colors.tint} />
              <View style={styles.alertText}>
                <Text style={[styles.alertTitle, { color: colors.text }]}>Horas de Silencio</Text>
                <Text style={[styles.alertSubtitle, { color: colors.subtitle }]}>
                  {timeSettings.quietHours.enabled 
                    ? `${timeSettings.quietHours.start} - ${timeSettings.quietHours.end}` 
                    : 'Desactivado'
                  }
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={toggleQuietHours}>
              <Ionicons 
                name={timeSettings.quietHours.enabled ? "toggle" : "toggle-outline"} 
                size={32} 
                color={timeSettings.quietHours.enabled ? colors.tint : colors.subtitle} 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.alertOption, { backgroundColor: colors.background }]}>
            <View style={styles.alertContent}>
              <Ionicons name="time-outline" size={24} color={colors.tint} />
              <View style={styles.alertText}>
                <Text style={[styles.alertTitle, { color: colors.text }]}>Horario de Mercado</Text>
                <Text style={[styles.alertSubtitle, { color: colors.subtitle }]}>
                  {timeSettings.marketOpen} - {timeSettings.marketClose}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.subtitle} />
          </TouchableOpacity>

          <AlertOption
            icon="business-outline"
            title="Alertas de Cierre"
            subtitle="Notificaciones cuando cierra el mercado"
            value={alertSettings.marketCloseAlerts}
            onToggle={() => toggleSetting('marketCloseAlerts')}
          />
        </View>

        {/* Quick Actions */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Acciones Rápidas</Text>
          
          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="volume-high-outline" size={24} color={colors.tint} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>Activar Todas las Alertas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="volume-mute-outline" size={24} color={colors.subtitle} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>Desactivar Todas las Alertas</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.quickAction}>
            <Ionicons name="refresh-outline" size={24} color={colors.tint} />
            <Text style={[styles.quickActionText, { color: colors.text }]}>Restablecer Configuración</Text>
          </TouchableOpacity>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.tint }]}
            onPress={saveSettings}
          >
            <Ionicons name="checkmark" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.saveButtonText}>Guardar Configuración</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 70,
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
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  alertOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  alertContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  alertText: {
    marginLeft: 16,
    flex: 1,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  alertSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  quickAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  quickActionText: {
    marginLeft: 16,
    fontSize: 16,
    fontWeight: '500',
  },
  buttonContainer: {
    paddingVertical: 20,
  },
  saveButton: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomSpacing: {
    height: 40,
  },
});
