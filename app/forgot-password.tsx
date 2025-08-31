import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { requestPasswordReset, resetPassword, verifyResetCode } from '@/controller/apiController';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

// Estados del flujo de recuperación
type RecoveryStep = 'email' | 'verification' | 'newPassword';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  // Estados del componente
  const [currentStep, setCurrentStep] = useState<RecoveryStep>('email');
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Estados para mostrar/ocultar contraseñas
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Función para manejar el envío del email
  const handleSendEmail = async () => {
    if (!email) {
      Alert.alert('Error', 'Por favor ingresa tu email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    try {
      setIsLoading(true);

      const response = await requestPasswordReset(email);

      Alert.alert(
        'Email enviado',
        'Hemos enviado un código de verificación a tu email. Revisa tu bandeja de entrada.',
        [
          {
            text: 'OK',
            onPress: () => setCurrentStep('verification')
          }
        ]
      );

    } catch (error) {
      console.error('❌ Error al enviar email:', error);
      
      let errorMessage = 'No se pudo enviar el email de recuperación. Inténtalo de nuevo.';
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para verificar el código
  const handleVerifyCode = async () => {
    if (!verificationCode) {
      Alert.alert('Error', 'Por favor ingresa el código de verificación');
      return;
    }

    if (verificationCode.length !== 6) {
      Alert.alert('Error', 'El código debe tener 6 dígitos');
      return;
    }

    try {
      setIsLoading(true);

      const response = await verifyResetCode(email, verificationCode);

      Alert.alert(
        'Código verificado',
        'Código correcto. Ahora puedes establecer tu nueva contraseña.',
        [
          {
            text: 'OK',
            onPress: () => setCurrentStep('newPassword')
          }
        ]
      );

    } catch (error) {
      console.error('❌ Error al verificar código:', error);
      
      let errorMessage = 'Código incorrecto o expirado. Inténtalo de nuevo.';
      if (error instanceof Error && error.message) {
        errorMessage = error.message;
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cambiar la contraseña
  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (newPassword.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }

    // Validar formato de contraseña según requisitos del backend
    const hasLowercase = /[a-z]/.test(newPassword);
    const hasUppercase = /[A-Z]/.test(newPassword);
    const hasNumber = /\d/.test(newPassword);

    if (!hasLowercase || !hasUppercase || !hasNumber) {
      Alert.alert(
        'Contraseña inválida', 
        'La contraseña debe contener al menos:\n• 1 letra minúscula (a-z)\n• 1 letra mayúscula (A-Z)\n• 1 número (0-9)'
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    try {
      setIsLoading(true);

      const response = await resetPassword(email, verificationCode, newPassword);

      Alert.alert(
        'Contraseña actualizada',
        'Tu contraseña ha sido cambiada exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login')
          }
        ]
      );

    } catch (error) {
      console.error('❌ Error al cambiar contraseña:', error);
      
      let errorMessage = 'No se pudo cambiar la contraseña. Inténtalo de nuevo.';
      if (error instanceof Error && error.message) {
        // Manejar errores específicos del backend
        if (error.message.includes('Datos de entrada inválidos')) {
          errorMessage = 'La contraseña no cumple con los requisitos de seguridad. Debe contener al menos: 1 minúscula, 1 mayúscula y 1 número.';
        } else {
          errorMessage = error.message;
        }
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Función para retroceder al paso anterior
  const handleGoBack = () => {
    if (currentStep === 'verification') {
      setCurrentStep('email');
      setVerificationCode('');
    } else if (currentStep === 'newPassword') {
      setCurrentStep('verification');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      router.back();
    }
  };

  // Renderizar contenido según el paso actual
  const renderStepContent = () => {
    switch (currentStep) {
      case 'email':
        return (
          <>
            <View style={styles.iconContainer}>
              <Ionicons name="mail-outline" size={80} color={colors.tint} />
            </View>

            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: colors.text }]}>
                ¿Olvidaste tu contraseña?
              </Text>
              <Text style={[styles.subtitle, { color: colors.subtitle }]}>
                Ingresa tu email y te enviaremos un código de verificación
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Email</Text>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                    color: colors.text
                  }]}
                  placeholder="tu@email.com"
                  placeholderTextColor={colors.subtitle}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoFocus={true}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, {
                  backgroundColor: colors.tint,
                  opacity: isLoading ? 0.7 : 1
                }]}
                onPress={handleSendEmail}
                disabled={isLoading}
              >
                <Text style={styles.primaryButtonText}>
                  {isLoading ? 'Enviando...' : 'Enviar Código'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case 'verification':
        return (
          <>
            <View style={styles.iconContainer}>
              <Ionicons name="shield-checkmark-outline" size={80} color={colors.tint} />
            </View>

            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: colors.text }]}>
                Verificar Código
              </Text>
              <Text style={[styles.subtitle, { color: colors.subtitle }]}>
                Hemos enviado un código de 6 dígitos a {email}
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Código de Verificación</Text>
                <TextInput
                  style={[styles.input, {
                    backgroundColor: colors.card,
                    borderColor: colors.cardBorder,
                    color: colors.text,
                    textAlign: 'center',
                    fontSize: 20,
                    letterSpacing: 4
                  }]}
                  placeholder="123456"
                  placeholderTextColor={colors.subtitle}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  autoFocus={true}
                />
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, {
                  backgroundColor: colors.tint,
                  opacity: isLoading ? 0.7 : 1
                }]}
                onPress={handleVerifyCode}
                disabled={isLoading}
              >
                <Text style={styles.primaryButtonText}>
                  {isLoading ? 'Verificando...' : 'Verificar Código'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case 'newPassword':
        return (
          <>
            <View style={styles.iconContainer}>
              <Ionicons name="lock-closed-outline" size={80} color={colors.tint} />
            </View>

            <View style={styles.textContainer}>
              <Text style={[styles.title, { color: colors.text }]}>
                Nueva Contraseña
              </Text>
              <Text style={[styles.subtitle, { color: colors.subtitle }]}>
                Establece una contraseña segura que incluya al menos 6 caracteres, una minúscula, una mayúscula y un número
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Nueva Contraseña</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.passwordInput, {
                      backgroundColor: colors.card,
                      borderColor: colors.cardBorder,
                      color: colors.text
                    }]}
                    placeholder="Incluye: minúscula, MAYÚSCULA y número"
                    placeholderTextColor={colors.subtitle}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    secureTextEntry={!showNewPassword}
                    autoFocus={true}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowNewPassword(!showNewPassword)}
                  >
                    <Ionicons
                      name={showNewPassword ? "eye-off" : "eye"}
                      size={24}
                      color={colors.subtitle}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: colors.text }]}>Confirmar Contraseña</Text>
                <View style={styles.passwordInputContainer}>
                  <TextInput
                    style={[styles.passwordInput, {
                      backgroundColor: colors.card,
                      borderColor: colors.cardBorder,
                      color: colors.text
                    }]}
                    placeholder="Repite tu contraseña"
                    placeholderTextColor={colors.subtitle}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!showConfirmPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <Ionicons
                      name={showConfirmPassword ? "eye-off" : "eye"}
                      size={24}
                      color={colors.subtitle}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryButton, {
                  backgroundColor: colors.tint,
                  opacity: isLoading ? 0.7 : 1
                }]}
                onPress={handleChangePassword}
                disabled={isLoading}
              >
                <Text style={styles.primaryButtonText}>
                  {isLoading ? 'Actualizando...' : 'Cambiar Contraseña'}
                </Text>
              </TouchableOpacity>
            </View>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleGoBack}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Recuperar Contraseña
        </Text>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { 
                backgroundColor: colors.tint,
                width: currentStep === 'email' ? '33%' : currentStep === 'verification' ? '66%' : '100%'
              }
            ]} 
          />
        </View>
        <Text style={[styles.progressText, { color: colors.subtitle }]}>
          Paso {currentStep === 'email' ? '1' : currentStep === 'verification' ? '2' : '3'} de 3
        </Text>
      </View>

      <View style={styles.content}>
        {renderStepContent()}

        <TouchableOpacity
          style={styles.backToLogin}
          onPress={() => router.replace('/login')}
        >
          <Text style={[styles.backToLoginText, { color: colors.tint }]}>
            ← Volver al inicio de sesión
          </Text>
        </TouchableOpacity>
      </View>
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
    paddingTop: 35,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 14,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  passwordInputContainer: {
    position: 'relative',
  },
  passwordInput: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingRight: 56, // Espacio para el botón del ojo
    fontSize: 16,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 16,
    padding: 8,
  },
  primaryButton: {
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  backToLogin: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 'auto',
  },
  backToLoginText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
