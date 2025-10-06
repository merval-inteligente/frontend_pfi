import { getHeaderPaddingTop } from '@/components/ResponsiveContainer';
import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { getDefaultSecuritySettings } from '@/services/mockup';
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

export default function SecurityScreen() {
  const { colorScheme } = useTheme();
  const router = useRouter();
  const colors = Colors[colorScheme];

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [securitySettings, setSecuritySettings] = useState(() => getDefaultSecuritySettings());

  const changePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    Alert.alert('Éxito', 'Contraseña cambiada correctamente', [
      { 
        text: 'OK', 
        onPress: () => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
        }
      }
    ]);
  };

  const toggleBiometric = () => {
    setSecuritySettings({
      ...securitySettings,
      biometricAuth: !securitySettings.biometricAuth
    });
  };

  const toggleTwoFactor = () => {
    if (!securitySettings.twoFactorAuth) {
      Alert.alert(
        'Verificación en 2 Pasos',
        'Se enviará un código a tu teléfono para configurar la verificación en 2 pasos.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { 
            text: 'Continuar', 
            onPress: () => setSecuritySettings({
              ...securitySettings,
              twoFactorAuth: true
            })
          }
        ]
      );
    } else {
      setSecuritySettings({
        ...securitySettings,
        twoFactorAuth: false
      });
    }
  };

  const toggleLoginNotifications = () => {
    setSecuritySettings({
      ...securitySettings,
      loginNotifications: !securitySettings.loginNotifications
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Seguridad</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Change Password Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Cambiar Contraseña</Text>
          
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Contraseña actual</Text>
            <View style={[styles.passwordInputContainer, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                secureTextEntry={!showCurrentPassword}
                placeholder="Ingresa tu contraseña actual"
                placeholderTextColor={colors.subtitle}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Ionicons 
                  name={showCurrentPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={colors.subtitle} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Nueva contraseña</Text>
            <View style={[styles.passwordInputContainer, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                value={newPassword}
                onChangeText={setNewPassword}
                secureTextEntry={!showNewPassword}
                placeholder="Ingresa tu nueva contraseña"
                placeholderTextColor={colors.subtitle}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons 
                  name={showNewPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={colors.subtitle} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Confirmar nueva contraseña</Text>
            <View style={[styles.passwordInputContainer, { backgroundColor: colors.background, borderColor: colors.cardBorder }]}>
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                placeholder="Confirma tu nueva contraseña"
                placeholderTextColor={colors.subtitle}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={colors.subtitle} 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.changePasswordButton, { backgroundColor: colors.tint }]}
            onPress={changePassword}
          >
            <Text style={styles.changePasswordButtonText}>Cambiar Contraseña</Text>
          </TouchableOpacity>
        </View>

        {/* Security Settings Section */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Configuración de Seguridad</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="finger-print-outline" size={24} color={colors.tint} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Autenticación Biométrica</Text>
                <Text style={[styles.settingSubtitle, { color: colors.subtitle }]}>
                  Usa tu huella dactilar o reconocimiento facial
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={toggleBiometric}>
              <Ionicons 
                name={securitySettings.biometricAuth ? "toggle" : "toggle-outline"} 
                size={32} 
                color={securitySettings.biometricAuth ? colors.tint : colors.subtitle} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="phone-portrait-outline" size={24} color={colors.tint} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Verificación en 2 Pasos</Text>
                <Text style={[styles.settingSubtitle, { color: colors.subtitle }]}>
                  Protección adicional con código SMS
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={toggleTwoFactor}>
              <Ionicons 
                name={securitySettings.twoFactorAuth ? "toggle" : "toggle-outline"} 
                size={32} 
                color={securitySettings.twoFactorAuth ? colors.tint : colors.subtitle} 
              />
            </TouchableOpacity>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="notifications-outline" size={24} color={colors.tint} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Notificaciones de Acceso</Text>
                <Text style={[styles.settingSubtitle, { color: colors.subtitle }]}>
                  Recibe alertas cuando alguien acceda a tu cuenta
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={toggleLoginNotifications}>
              <Ionicons 
                name={securitySettings.loginNotifications ? "toggle" : "toggle-outline"} 
                size={32} 
                color={securitySettings.loginNotifications ? colors.tint : colors.subtitle} 
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.settingItem}>
            <View style={styles.settingContent}>
              <Ionicons name="time-outline" size={24} color={colors.tint} />
              <View style={styles.settingText}>
                <Text style={[styles.settingTitle, { color: colors.text }]}>Tiempo de Sesión</Text>
                <Text style={[styles.settingSubtitle, { color: colors.subtitle }]}>
                  {securitySettings.sessionTimeout}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.subtitle} />
          </TouchableOpacity>
        </View>

        {/* Emergency Options */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Opciones de Emergencia</Text>
          
          <TouchableOpacity style={styles.emergencyOption}>
            <Ionicons name="log-out-outline" size={24} color={colors.warning} />
            <View style={styles.emergencyText}>
              <Text style={[styles.emergencyTitle, { color: colors.warning }]}>Cerrar Todas las Sesiones</Text>
              <Text style={[styles.emergencySubtitle, { color: colors.subtitle }]}>
                Cierra sesión en todos los dispositivos
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={styles.emergencyOption}>
            <Ionicons name="trash-outline" size={24} color={colors.danger} />
            <View style={styles.emergencyText}>
              <Text style={[styles.emergencyTitle, { color: colors.danger }]}>Eliminar Cuenta</Text>
              <Text style={[styles.emergencySubtitle, { color: colors.subtitle }]}>
                Elimina permanentemente tu cuenta
              </Text>
            </View>
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
    marginBottom: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  passwordInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    height: 50,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  eyeButton: {
    padding: 12,
  },
  changePasswordButton: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  changePasswordButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
  emergencyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  emergencyText: {
    marginLeft: 16,
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  emergencySubtitle: {
    fontSize: 14,
  },
  bottomSpacing: {
    height: 40,
  },
});
