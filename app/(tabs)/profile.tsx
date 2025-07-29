import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getContactInfo } from '@/services/mockup';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
interface ProfileOption {
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  rightElement?: 'arrow' | 'toggle' | 'value';
  value?: string;
}

const profileSections = [
  {
    title: 'Cuenta',
    options: [
      {
        id: '1',
        title: 'Información Personal',
        subtitle: 'Actualiza tus datos',
        icon: 'person-outline',
        rightElement: 'arrow' as const,
      },
      {
        id: 'preferences',
        title: 'Mis Preferencias',
        subtitle: 'Sectores y acciones de interés',
        icon: 'heart-outline',
        rightElement: 'arrow' as const,
      },
      {
        id: '2',
        title: 'Seguridad',
        subtitle: 'Contraseña y autenticación',
        icon: 'shield-outline',
        rightElement: 'arrow' as const,
      },
      {
        id: '3',
        title: 'Configuración de Alertas',
        subtitle: 'Gestiona tus notificaciones',
        icon: 'notifications-outline',
        rightElement: 'arrow' as const,
      },
      {
        id: '4',
        title: 'Estrategia de Inversión',
        subtitle: 'Perfil de riesgo: Moderado',
        icon: 'trending-up-outline',
        rightElement: 'arrow' as const,
      },
    ],
  },
  {
    title: 'Configuración',
    options: [
      {
        id: '5',
        title: 'Tema',
        subtitle: 'Oscuro',
        icon: 'moon-outline',
        rightElement: 'value' as const,
        value: 'Oscuro',
      },
      {
        id: '6',
        title: 'Moneda',
        subtitle: 'Peso Argentino',
        icon: 'cash-outline',
        rightElement: 'value' as const,
        value: 'ARS',
      },
      {
        id: '7',
        title: 'Idioma',
        subtitle: 'Español',
        icon: 'language-outline',
        rightElement: 'value' as const,
        value: 'ES',
      },
    ],
  },
  {
    title: 'Soporte',
    options: [
      {
        id: '8',
        title: 'Centro de Ayuda',
        subtitle: 'Preguntas frecuentes',
        icon: 'help-circle-outline',
        rightElement: 'arrow' as const,
      },
      {
        id: '9',
        title: 'Contactar Soporte',
        subtitle: 'Obtén ayuda personalizada',
        icon: 'mail-outline',
        rightElement: 'arrow' as const,
      },
      {
        id: '10',
        title: 'Acerca de',
        subtitle: 'Versión 1.0.0',
        icon: 'information-circle-outline',
        rightElement: 'arrow' as const,
      },
    ],
  },
];

const ProfileOptionItem = ({ option, onPress }: { 
  option: ProfileOption; 
  onPress: (option: ProfileOption) => void;
}) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  
  return (
    <TouchableOpacity 
      style={[styles.optionItem, { backgroundColor: colors.card }]}
      onPress={() => onPress(option)}
    >
      <View style={[styles.optionIcon, { backgroundColor: `${colors.success}15` }]}>
        <Ionicons name={option.icon as any} size={20} color={colors.success} />
      </View>
      <View style={styles.optionContent}>
        <Text style={[styles.optionTitle, { color: colors.text }]}>{option.title}</Text>
        {option.subtitle && (
          <Text style={[styles.optionSubtitle, { color: colors.subtitle }]}>{option.subtitle}</Text>
        )}
      </View>
      <View style={styles.optionRight}>
        {option.rightElement === 'value' && (
          <Text style={[styles.optionValue, { color: colors.subtitle }]}>{option.value}</Text>
        )}
        {option.rightElement === 'arrow' && (
          <Ionicons name="chevron-forward" size={20} color={colors.subtitle} />
        )}
      </View>
    </TouchableOpacity>
  );
};

export default function ProfileScreen() {
  const { theme, colorScheme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const router = useRouter();
  const colors = Colors[colorScheme];

  // Estados para los modales
  const [aboutModalVisible, setAboutModalVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      router.replace('/welcome');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const handlePreferencesPress = () => {
    router.push('/(tabs)/preferences');
  };

  const getThemeName = (currentTheme: string) => {
    switch (currentTheme) {
      case 'light': return 'Claro';
      case 'dark': return 'Oscuro';
      case 'system': return 'Sistema';
      default: return 'Sistema';
    }
  };

  const handleThemePress = () => {
    const themes = ['system', 'light', 'dark'];
    const currentIndex = themes.indexOf(theme);
    const nextIndex = (currentIndex + 1) % themes.length;
    setTheme(themes[nextIndex] as any);
  };

  const handleOptionPress = (option: ProfileOption) => {
    switch (option.id) {
      case '1': // Información Personal
        router.push('/personal-info');
        break;
      case 'preferences': // Mis Preferencias
        handlePreferencesPress();
        break;
      case '2': // Seguridad
        router.push('/security');
        break;
      case '3': // Configuración de Alertas
        router.push('/alerts-config');
        break;
      case '4': // Estrategia de Inversión
        router.push('/investment-strategy');
        break;
      case '5': // Tema
        handleThemePress();
        break;
      case '6': // Moneda
        Alert.alert('Moneda', 'Funcionalidad de cambio de moneda próximamente');
        break;
      case '7': // Idioma
        Alert.alert('Idioma', 'Funcionalidad de cambio de idioma próximamente');
        break;
      case '8': // Centro de Ayuda
        router.push('/help-center');
        break;
      case '9': // Contactar Soporte
        Alert.alert('Contactar Soporte', `Para soporte técnico, escríbenos a ${getContactInfo().email}`);
        break;
      case '10': // Acerca de
        setAboutModalVisible(true);
        break;
      default:
        break;
    }
  };

  // Actualizar la sección de configuración con el tema actual
  const updatedProfileSections = profileSections.map(section => {
    if (section.title === 'Configuración') {
      return {
        ...section,
        options: section.options.map(option => {
          if (option.id === '5') {
            return {
              ...option,
              subtitle: getThemeName(theme),
              value: getThemeName(theme),
              icon: theme === 'light' ? 'sunny-outline' : theme === 'dark' ? 'moon-outline' : 'phone-portrait-outline',
            };
          }
          return option;
        })
      };
    }
    return section;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.scrollView}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Perfil</Text>
        </View>

        {/* Profile Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={{
                uri: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
              }}
              style={styles.avatar}
              contentFit="cover"
            />
          </View>
          <Text style={[styles.profileName, { color: colors.text }]}>
            {user?.name || 'Usuario'}
          </Text>
          <Text style={[styles.profileEmail, { color: colors.subtitle }]}>
            {user?.email || 'usuario@email.com'}
          </Text>
        </View>

        {/* Profile Options */}
        {updatedProfileSections.map((section, sectionIndex) => (
          <View key={sectionIndex} style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            <View style={[styles.sectionContent, { backgroundColor: colors.card }]}>
              {section.options.map((option, optionIndex) => (
                <View key={option.id}>
                  <ProfileOptionItem 
                    option={option} 
                    onPress={handleOptionPress}
                  />
                  {optionIndex < section.options.length - 1 && (
                    <View style={[styles.optionDivider, { backgroundColor: colors.cardBorder }]} />
                  )}
                </View>
              ))}
            </View>
          </View>
        ))}

        {/* Logout Button */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity 
            style={[styles.logoutButton, { backgroundColor: `${colors.danger}15`, borderColor: `${colors.danger}30` }]}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.danger} />
            <Text style={[styles.logoutText, { color: colors.danger }]}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Modal Acerca de */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={aboutModalVisible}
        onRequestClose={() => setAboutModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Acerca de MERVAL Guide</Text>
              <TouchableOpacity onPress={() => setAboutModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <View style={styles.aboutContent}>
                <Text style={[styles.aboutVersion, { color: colors.text }]}>Versión 1.0.0</Text>
                <Text style={[styles.aboutDescription, { color: colors.subtitle }]}>
                  MERVAL Guide es tu aplicación de confianza para mantenerte informado sobre el mercado de valores argentino. 
                  Obtén información en tiempo real, análisis técnicos y noticias financieras.
                </Text>
                
                <Text style={[styles.aboutSectionTitle, { color: colors.text }]}>Características:</Text>
                <Text style={[styles.aboutFeature, { color: colors.subtitle }]}>• Cotizaciones en tiempo real</Text>
                <Text style={[styles.aboutFeature, { color: colors.subtitle }]}>• Análisis técnico avanzado</Text>
                <Text style={[styles.aboutFeature, { color: colors.subtitle }]}>• Noticias financieras</Text>
                <Text style={[styles.aboutFeature, { color: colors.subtitle }]}>• Alertas personalizadas</Text>
                <Text style={[styles.aboutFeature, { color: colors.subtitle }]}>• Chat con asistente IA</Text>
                
                <Text style={[styles.aboutCopyright, { color: colors.subtitle }]}>
                  © 2025 MERVAL Guide. Todos los derechos reservados.
                </Text>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
  profileSection: {
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 16,
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionContent: {
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  optionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 14,
  },
  optionRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  optionValue: {
    fontSize: 14,
    marginRight: 8,
  },
  optionDivider: {
    height: 1,
    marginLeft: 72,
  },
  logoutContainer: {
    paddingHorizontal: 16,
    marginTop: 32,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 32,
  },
  // Estilos de modales
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    borderRadius: 20,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalBody: {
    flex: 1,
  },
  modalButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
  },
  modalButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  // Estilos de inputs
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  // Estilos de seguridad
  securityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  securityOptionContent: {
    flex: 1,
    marginLeft: 16,
  },
  securityOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  securityOptionSubtitle: {
    fontSize: 14,
  },
  // Estilos de alertas
  alertOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  alertOptionContent: {
    flex: 1,
  },
  alertOptionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  alertOptionSubtitle: {
    fontSize: 14,
  },
  // Estilos de estrategia de inversión
  riskButtons: {
    gap: 8,
  },
  riskButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  riskButtonText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  // Estilos de ayuda
  helpSection: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  helpQuestion: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  helpAnswer: {
    fontSize: 14,
    lineHeight: 20,
  },
  // Estilos de acerca de
  aboutContent: {
    padding: 16,
  },
  aboutVersion: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  aboutDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  aboutSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  aboutFeature: {
    fontSize: 14,
    marginBottom: 4,
  },
  aboutCopyright: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
    fontStyle: 'italic',
  },
});
