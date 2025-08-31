import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { addSectorToFavorites, getSectors } from '@/controller/apiController';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
  View,
} from 'react-native';

type OnboardingStep = 'register' | 'knowledge' | 'risk' | 'sectors' | 'welcome';

export default function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('register');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [onboardingData, setOnboardingData] = useState({
    investmentKnowledge: '',
    riskAppetite: '',
    sectors: [] as string[],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [availableSectors, setAvailableSectors] = useState<string[]>([]);
  const [loadingSectors, setLoadingSectors] = useState(false);

  // Efecto para cargar sectores cuando se llega a la pantalla de sectores
  React.useEffect(() => {
    if (currentStep === 'sectors') {
      loadAvailableSectors();
    }
  }, [currentStep]);

  const handleRegister = () => {
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    if (formData.password.length < 6) {
      Alert.alert('Error', 'La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    // Proceder al onboarding
    setCurrentStep('welcome');
  };

  const handleNext = () => {
    if (currentStep === 'welcome') {
      setCurrentStep('knowledge');
    } else if (currentStep === 'knowledge') {
      if (!onboardingData.investmentKnowledge) {
        Alert.alert('Error', 'Por favor selecciona tu nivel de conocimiento');
        return;
      }
      setCurrentStep('risk');
    } else if (currentStep === 'risk') {
      if (!onboardingData.riskAppetite) {
        Alert.alert('Error', 'Por favor selecciona tu apetito de riesgo');
        return;
      }
      setCurrentStep('sectors');
    } else if (currentStep === 'sectors') {
      // Completar registro y login
      completeRegistration();
    }
  };

  const handleBack = () => {
    if (currentStep === 'knowledge') {
      setCurrentStep('welcome');
    } else if (currentStep === 'risk') {
      setCurrentStep('knowledge');
    } else if (currentStep === 'sectors') {
      setCurrentStep('risk');
    } else if (currentStep === 'welcome') {
      setCurrentStep('register');
    }
  };

  const completeRegistration = async () => {
    try {
      // Primero registrar el usuario
      await register(formData.email, formData.password, formData.name);
      
      // Obtener el token del usuario recién registrado
      const token = await AsyncStorage.getItem('@auth_token');
      
      if (token && onboardingData.sectors.length > 0) {
        // Guardar las preferencias de sectores seleccionadas
        console.log('💾 Guardando preferencias del onboarding...');
        
        try {
          // Agregar cada sector seleccionado como favorito
          const sectorPromises = onboardingData.sectors.map(sectorName => 
            addSectorToFavorites(sectorName, token)
          );
          
          await Promise.all(sectorPromises);
          console.log('✅ Preferencias guardadas exitosamente');
        } catch (preferencesError) {
          console.error('⚠️ Error guardando preferencias:', preferencesError);
          // No bloquear el flujo si hay error guardando preferencias
        }
      }
      
      Alert.alert(
        'Registro completado',
        `¡Bienvenido ${formData.name}! Tu perfil ha sido configurado exitosamente.`,
        [{ text: 'Continuar', onPress: () => router.replace('/(tabs)') }]
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Hubo un problema al completar el registro');
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateOnboardingData = (field: string, value: string | string[]) => {
    setOnboardingData(prev => ({ ...prev, [field]: value }));
  };

  // Función para cargar sectores desde el backend
  const loadAvailableSectors = async () => {
    try {
      setLoadingSectors(true);
      const token = await AsyncStorage.getItem('@auth_token');
      
      if (token) {
        const sectorsResponse = await getSectors(token);
        if (sectorsResponse.sectors) {
          const sectorNames = sectorsResponse.sectors.map((sector: any) => sector.name);
          setAvailableSectors(sectorNames);
        }
      }
    } catch (error) {
      console.error('Error cargando sectores:', error);
      // Usar sectores por defecto si hay error
      setAvailableSectors(['Tecnología', 'Energía', 'Finanzas', 'Bienes de Consumo', 'Salud']);
    } finally {
      setLoadingSectors(false);
    }
  };

  const getProgressDots = () => {
    const steps = ['welcome', 'knowledge', 'risk', 'sectors'];
    const currentIndex = steps.indexOf(currentStep);
    
    return steps.map((_, index) => (
      <View
        key={index}
        style={[
          styles.progressDot,
          {
            backgroundColor: index <= currentIndex ? '#8CD279' : colors.cardBorder
          }
        ]}
      />
    ));
  };

  // Pantalla de registro inicial
  if (currentStep === 'register') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Crear Cuenta</Text>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.welcomeContainer}>
            <Text style={[styles.welcome, { color: colors.text }]}>
              ¡Únete a MERVAL!
            </Text>
            <Text style={[styles.subtitle, { color: colors.subtitle }]}>
              Crea tu cuenta para comenzar a invertir
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Nombre completo</Text>
              <TextInput
                style={[styles.input, { 
                  backgroundColor: colors.card, 
                  borderColor: colors.cardBorder,
                  color: colors.text 
                }]}
                placeholder="Tu nombre completo"
                placeholderTextColor={colors.subtitle}
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
                autoCapitalize="words"
              />
            </View>

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
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Contraseña</Text>
              <View style={[styles.passwordContainer, { 
                backgroundColor: colors.card, 
                borderColor: colors.cardBorder 
              }]}>
                <TextInput
                  style={[styles.passwordInput, { color: colors.text }]}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={colors.subtitle}
                  value={formData.password}
                  onChangeText={(value) => updateFormData('password', value)}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color={colors.subtitle} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Confirmar contraseña</Text>
              <View style={[styles.passwordContainer, { 
                backgroundColor: colors.card, 
                borderColor: colors.cardBorder 
              }]}>
                <TextInput
                  style={[styles.passwordInput, { color: colors.text }]}
                  placeholder="Repite tu contraseña"
                  placeholderTextColor={colors.subtitle}
                  value={formData.confirmPassword}
                  onChangeText={(value) => updateFormData('confirmPassword', value)}
                  secureTextEntry={!showConfirmPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  <Ionicons 
                    name={showConfirmPassword ? 'eye-off' : 'eye'} 
                    size={20} 
                    color={colors.subtitle} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.registerButton, { backgroundColor: colors.tint }]}
              onPress={handleRegister}
            >
              <Text style={styles.registerButtonText}>Crear Cuenta</Text>
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={[styles.loginText, { color: colors.subtitle }]}>
                ¿Ya tienes cuenta? 
              </Text>
              <TouchableOpacity onPress={() => router.push('./login')}>
                <Text style={[styles.loginLink, { color: colors.tint }]}>
                  Inicia sesión
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.terms, { color: colors.subtitle }]}>
              Al crear una cuenta, aceptas nuestros Términos de Servicio y Política de Privacidad
            </Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Pantalla de bienvenida al onboarding
  if (currentStep === 'welcome') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Bienvenido</Text>
        </View>

        <View style={styles.onboardingContent}>
          <View style={styles.onboardingMain}>
            <Text style={[styles.onboardingTitle, { color: colors.text }]}>
              Bienvenido a Invertir
            </Text>
            <Text style={[styles.onboardingDescription, { color: colors.text }]}>
              Empecemos por entender tus metas y preferencias de inversión.
            </Text>
            
            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: '#8CD279' }]}
              onPress={handleNext}
            >
              <Text style={styles.primaryButtonText}>Comenzar</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressDots}>
              {getProgressDots()}
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Pantalla de conocimiento de inversión
  if (currentStep === 'knowledge') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Conocimiento de Inversión</Text>
        </View>

        <View style={styles.onboardingContent}>
          <View style={styles.onboardingMain}>
            <Text style={[styles.onboardingTitle, { color: colors.text }]}>
              ¿Qué tan familiarizado estás con las inversiones?
            </Text>
            
            <View style={styles.optionsContainer}>
              {['Principiante', 'Intermedio', 'Avanzado'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    {
                      borderColor: onboardingData.investmentKnowledge === option ? '#8CD279' : colors.cardBorder,
                      borderWidth: onboardingData.investmentKnowledge === option ? 3 : 1,
                    }
                  ]}
                  onPress={() => updateOnboardingData('investmentKnowledge', option)}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: '#8CD279' }]}
              onPress={handleNext}
            >
              <Text style={styles.primaryButtonText}>Siguiente</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressDots}>
              {getProgressDots()}
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Pantalla de apetito de riesgo
  if (currentStep === 'risk') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Apetito de Riesgo</Text>
        </View>

        <View style={styles.onboardingContent}>
          <View style={styles.onboardingMain}>
            <Text style={[styles.onboardingTitle, { color: colors.text }]}>
              ¿Cuál es tu apetito de riesgo?
            </Text>
            
            <View style={styles.optionsContainer}>
              {['Bajo', 'Medio', 'Alto'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    {
                      borderColor: onboardingData.riskAppetite === option ? '#8CD279' : colors.cardBorder,
                      borderWidth: onboardingData.riskAppetite === option ? 3 : 1,
                    }
                  ]}
                  onPress={() => updateOnboardingData('riskAppetite', option)}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: '#8CD279' }]}
              onPress={handleNext}
            >
              <Text style={styles.primaryButtonText}>Siguiente</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressDots}>
              {getProgressDots()}
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // Pantalla de sectores preferidos
  if (currentStep === 'sectors') {
    const sectorOptions = availableSectors.length > 0 ? availableSectors : [
      'Tecnología',
      'Energía', 
      'Finanzas',
      'Bienes de Consumo',
      'Salud'
    ];

    const toggleSector = (sector: string) => {
      const currentSectors = onboardingData.sectors;
      if (currentSectors.includes(sector)) {
        // Quitar sector si ya está seleccionado
        updateOnboardingData('sectors', currentSectors.filter(s => s !== sector));
      } else {
        // Agregar sector si no está seleccionado
        updateOnboardingData('sectors', [...currentSectors, sector]);
      }
    };

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Sectores de Interés</Text>
        </View>

        <View style={styles.onboardingContent}>
          <View style={styles.onboardingMain}>
            <Text style={[styles.onboardingTitle, { color: colors.text }]}>
              Selecciona tus sectores de interés
            </Text>
            <Text style={[styles.onboardingDescription, { color: colors.text }]}>
              Puedes seleccionar múltiples sectores. Esto nos ayudará a personalizar tu experiencia.
            </Text>
            
            <View style={styles.sectorListContainer}>
              {loadingSectors ? (
                <View style={styles.loadingContainer}>
                  <Ionicons name="hourglass-outline" size={32} color={colors.subtitle} />
                  <Text style={[styles.loadingText, { color: colors.subtitle }]}>
                    Cargando sectores...
                  </Text>
                </View>
              ) : (
                sectorOptions.map((sector) => {
                  const isSelected = onboardingData.sectors.includes(sector);
                  return (
                    <TouchableOpacity
                      key={sector}
                      style={[
                        styles.sectorItem, 
                        { 
                          backgroundColor: isSelected ? '#8CD279' : colors.card, 
                          borderColor: isSelected ? '#8CD279' : colors.cardBorder,
                          borderWidth: 2
                        }
                      ]}
                      onPress={() => toggleSector(sector)}
                    >
                      <View style={styles.sectorContent}>
                        <Text style={[
                          styles.sectorText, 
                          { color: isSelected ? '#131612' : colors.text }
                        ]}>
                          {sector}
                        </Text>
                        {isSelected && (
                          <Ionicons name="checkmark-circle" size={24} color="#131612" />
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </View>
            
            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: '#8CD279' }]}
              onPress={handleNext}
            >
              <Text style={styles.primaryButtonText}>
                {onboardingData.sectors.length > 0 ? 'Finalizar' : 'Omitir por ahora'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressDots}>
              {getProgressDots()}
            </View>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60, // Aumentado de 35 a 60 para evitar que la cámara tape los títulos
    paddingBottom: 16,
    justifyContent: 'center',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    left: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  welcomeContainer: {
    marginBottom: 32,
  },
  welcome: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  form: {
    paddingBottom: 40,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  passwordContainer: {
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
  },
  eyeButton: {
    padding: 4,
  },
  registerButton: {
    paddingVertical: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 24,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  terms: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
  // Estilos para onboarding
  onboardingContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  onboardingMain: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  onboardingTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 34,
  },
  onboardingDescription: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  primaryButton: {
    paddingVertical: 16,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 'auto',
    marginBottom: 20,
  },
  primaryButtonText: {
    color: '#131612',
    fontSize: 16,
    fontWeight: 'bold',
  },
  progressContainer: {
    paddingBottom: 20,
  },
  progressDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    paddingVertical: 20,
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  optionButton: {
    paddingHorizontal: 16,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  checkboxContainer: {
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  checkboxItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxText: {
    fontSize: 16,
    fontWeight: 'normal',
  },
  sectorListContainer: {
    paddingHorizontal: 16,
    marginBottom: 40,
  },
  sectorItem: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  sectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectorText: {
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
});
