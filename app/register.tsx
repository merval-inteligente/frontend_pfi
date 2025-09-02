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
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

type OnboardingStep = 'register' | 'knowledge1' | 'knowledge2' | 'knowledge3' | 'risk1' | 'risk2' | 'risk3' | 'sectors' | 'welcome';

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
    // Respuestas individuales para evaluar conocimiento
    knowledgeQ1: '', // ¿Sabes qué es una acción?
    knowledgeQ2: '', // Comprensión de inflación
    knowledgeQ3: '', // Conocimiento del MERVAL
    
    // Respuestas individuales para evaluar riesgo
    riskQ1: '', // Personalidad financiera
    riskQ2: '', // Situación hipotética con dinero
    riskQ3: '', // Paciencia financiera
    
    // Valores calculados (se determinan automáticamente)
    investmentKnowledge: '',
    riskAppetite: '',
    sectors: [] as string[],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [availableSectors, setAvailableSectors] = useState<string[]>([
    'Alimentos', 
    'Bancos', 
    'Construcción', 
    'Energía', 
    'Holding', 
    'Metalurgia', 
    'Otros', 
    'Petróleo y Gas', 
    'Siderurgia', 
    'Telecomunicaciones'
  ]);
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
      setCurrentStep('knowledge1');
    } else if (currentStep === 'knowledge1') {
      if (!onboardingData.knowledgeQ1) {
        Alert.alert('Error', 'Por favor selecciona una respuesta');
        return;
      }
      setCurrentStep('knowledge2');
    } else if (currentStep === 'knowledge2') {
      if (!onboardingData.knowledgeQ2) {
        Alert.alert('Error', 'Por favor selecciona una respuesta');
        return;
      }
      setCurrentStep('knowledge3');
    } else if (currentStep === 'knowledge3') {
      if (!onboardingData.knowledgeQ3) {
        Alert.alert('Error', 'Por favor selecciona una respuesta');
        return;
      }
      // Calcular investmentKnowledge basado en las respuestas
      calculateInvestmentKnowledge();
      setCurrentStep('risk1');
    } else if (currentStep === 'risk1') {
      if (!onboardingData.riskQ1) {
        Alert.alert('Error', 'Por favor selecciona una respuesta');
        return;
      }
      setCurrentStep('risk2');
    } else if (currentStep === 'risk2') {
      if (!onboardingData.riskQ2) {
        Alert.alert('Error', 'Por favor selecciona una respuesta');
        return;
      }
      setCurrentStep('risk3');
    } else if (currentStep === 'risk3') {
      if (!onboardingData.riskQ3) {
        Alert.alert('Error', 'Por favor selecciona una respuesta');
        return;
      }
      // Calcular riskAppetite basado en las respuestas
      calculateRiskAppetite();
      setCurrentStep('sectors');
    } else if (currentStep === 'sectors') {
      // Completar registro y login
      completeRegistration();
    }
  };

  const handleBack = () => {
    if (currentStep === 'knowledge1') {
      setCurrentStep('welcome');
    } else if (currentStep === 'knowledge2') {
      setCurrentStep('knowledge1');
    } else if (currentStep === 'knowledge3') {
      setCurrentStep('knowledge2');
    } else if (currentStep === 'risk1') {
      setCurrentStep('knowledge3');
    } else if (currentStep === 'risk2') {
      setCurrentStep('risk1');
    } else if (currentStep === 'risk3') {
      setCurrentStep('risk2');
    } else if (currentStep === 'sectors') {
      setCurrentStep('risk3');
    } else if (currentStep === 'welcome') {
      setCurrentStep('register');
    }
  };

  // Función para calcular el nivel de conocimiento basado en las respuestas
  const calculateInvestmentKnowledge = () => {
    let score = 0;
    
    // Pregunta 1: ¿Sabes qué es una acción?
    if (onboardingData.knowledgeQ1 === 'Tengo una idea general') score += 1;
    else if (onboardingData.knowledgeQ1 === 'Sí, entiendo el concepto') score += 2;
    
    // Pregunta 2: Comprensión de inflación
    if (onboardingData.knowledgeQ2 === 'Probablemente compre menos cosas') score += 1;
    else if (onboardingData.knowledgeQ2 === 'Definitivamente perderá valor por la inflación') score += 2;
    
    // Pregunta 3: Conocimiento del MERVAL
    if (onboardingData.knowledgeQ3 === 'Creo que es algo de la bolsa') score += 1;
    else if (onboardingData.knowledgeQ3 === 'Sí, es el índice de la Bolsa de Buenos Aires') score += 2;
    
    // Calcular nivel basado en puntaje total (0-6)
    let knowledge = 'Principiante';
    if (score >= 4) knowledge = 'Avanzado';
    else if (score >= 2) knowledge = 'Intermedio';
    
    setOnboardingData(prev => ({ ...prev, investmentKnowledge: knowledge }));
  };

  // Función para calcular el apetito de riesgo basado en las respuestas
  const calculateRiskAppetite = () => {
    let score = 0;
    
    // Pregunta 1: ¿Qué harías con $1000?
    if (onboardingData.riskQ1 === 'Invertir la mitad y dejar la mitad segura') score += 1;
    else if (onboardingData.riskQ1 === 'Invertir todo para obtener mejores ganancias') score += 2;
    
    // Pregunta 2: Reacción a pérdidas
    if (onboardingData.riskQ2 === 'Esperaría un poco a ver qué pasa') score += 1;
    else if (onboardingData.riskQ2 === 'La mantendría y hasta compraría más si creo en la empresa') score += 2;
    
    // Pregunta 3: Influencia social
    if (onboardingData.riskQ3 === 'Investigaría un poco antes de decidir') score += 1;
    else if (onboardingData.riskQ3 === 'Invertiría porque confío en mi amigo') score += 2;
    
    // Calcular nivel basado en puntaje total (0-6)
    let riskLevel = 'Conservador';
    if (score >= 4) riskLevel = 'Agresivo';
    else if (score >= 2) riskLevel = 'Moderado';
    
    setOnboardingData(prev => ({ ...prev, riskAppetite: riskLevel }));
  };

  // Funciones auxiliares que retornan valores calculados (para usar en el registro)
  const calculateInvestmentKnowledgeValue = () => {
    let score = 0;
    
    // Pregunta 1: ¿Sabes qué es una acción?
    if (onboardingData.knowledgeQ1 === 'Tengo una idea general') score += 1;
    else if (onboardingData.knowledgeQ1 === 'Sí, entiendo el concepto') score += 2;
    
    // Pregunta 2: Comprensión de inflación
    if (onboardingData.knowledgeQ2 === 'Probablemente compre menos cosas') score += 1;
    else if (onboardingData.knowledgeQ2 === 'Definitivamente perderá valor por la inflación') score += 2;
    
    // Pregunta 3: Conocimiento del MERVAL
    if (onboardingData.knowledgeQ3 === 'Creo que es algo de la bolsa') score += 1;
    else if (onboardingData.knowledgeQ3 === 'Sí, es el índice de la Bolsa de Buenos Aires') score += 2;
    
    // Calcular nivel basado en puntaje total (0-6)
    if (score >= 4) return 'Avanzado';
    else if (score >= 2) return 'Intermedio';
    else return 'Principiante';
  };

  const calculateRiskAppetiteValue = () => {
    let score = 0;
    
    // Pregunta 1: ¿Qué harías con $1000?
    if (onboardingData.riskQ1 === 'Invertir la mitad y dejar la mitad segura') score += 1;
    else if (onboardingData.riskQ1 === 'Invertir todo para obtener mejores ganancias') score += 2;
    
    // Pregunta 2: Reacción a pérdidas
    if (onboardingData.riskQ2 === 'Esperaría un poco a ver qué pasa') score += 1;
    else if (onboardingData.riskQ2 === 'La mantendría y hasta compraría más si creo en la empresa') score += 2;
    
    // Pregunta 3: Influencia social
    if (onboardingData.riskQ3 === 'Investigaría un poco antes de decidir') score += 1;
    else if (onboardingData.riskQ3 === 'Invertiría porque confío en mi amigo') score += 2;
    
    // Calcular nivel basado en puntaje total (0-6)
    if (score >= 4) return 'Agresivo';
    else if (score >= 2) return 'Moderado';
    else return 'Conservador';
  };

  const completeRegistration = async () => {
    try {
      // Validaciones básicas
      if (!formData.email || !formData.password || !formData.name) {
        Alert.alert('Error', 'Todos los campos son requeridos');
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
      
      // Calcular perfil de evaluación
      const knowledge = calculateInvestmentKnowledgeValue();
      const risk = calculateRiskAppetiteValue();
      
      // Registrar usuario con perfil
      await register(formData.email, formData.password, formData.name, knowledge, risk);
      
      // Guardar sectores preferidos si hay alguno seleccionado
      if (onboardingData.sectors.length > 0) {
        try {
          const token = await AsyncStorage.getItem('@auth_token');
          
          if (token) {
            // Agregar cada sector
            for (const sectorName of onboardingData.sectors) {
              try {
                await addSectorToFavorites(sectorName, token);
              } catch (sectorError) {
                // Continuar con los otros sectores aunque uno falle
                console.warn(`Error agregando sector ${sectorName}:`, sectorError);
              }
            }
          }
        } catch (sectorsError) {
          // No fallar el registro por problemas con sectores
          console.warn('Error guardando sectores:', sectorsError);
        }
      }
      
      // Mostrar mensaje de éxito y navegar
      Alert.alert(
        'Registro completado',
        `¡Bienvenido ${formData.name}! Tu perfil ha sido configurado exitosamente.`,
        [{ text: 'Continuar', onPress: () => router.replace('/(tabs)') }]
      );
      
    } catch (error) {
      console.error('Error en registro:', error);
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
      
      // Primero intentar con el token (si existe)
      let token = await AsyncStorage.getItem('@auth_token');
      
      if (token) {
        const sectorsResponse = await getSectors(token);
        
        if (sectorsResponse.sectors) {
          const sectorNames = sectorsResponse.sectors.map((sector: any) => sector.name);
          setAvailableSectors(sectorNames);
          return; // Salir si obtuvo los sectores del backend
        }
      }
      
      // Si no hay token o no se pudieron obtener, usar sectores por defecto
      setAvailableSectors([
        'Alimentos', 
        'Bancos', 
        'Construcción', 
        'Energía', 
        'Holding', 
        'Metalurgia', 
        'Otros', 
        'Petróleo y Gas', 
        'Siderurgia', 
        'Telecomunicaciones'
      ]);
      
    } catch (error) {
      console.error('Error cargando sectores:', error);
      // Usar sectores reales del backend como fallback
      setAvailableSectors([
        'Alimentos', 
        'Bancos', 
        'Construcción', 
        'Energía', 
        'Holding', 
        'Metalurgia', 
        'Otros', 
        'Petróleo y Gas', 
        'Siderurgia', 
        'Telecomunicaciones'
      ]);
    } finally {
      setLoadingSectors(false);
    }
  };

  const getProgressDots = () => {
    const steps = ['welcome', 'knowledge1', 'knowledge2', 'knowledge3', 'risk1', 'risk2', 'risk3', 'sectors'];
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

        <KeyboardAvoidingView 
          style={styles.keyboardContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 120 : 0}
        >
          <ScrollView 
            style={styles.scrollView} 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
            automaticallyAdjustContentInsets={false}
            nestedScrollEnabled={true}
            overScrollMode="never"
          >
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
              <Text style={[styles.helpText, { color: colors.subtitle }]}>
                Solo se permiten letras y espacios
              </Text>
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
        </KeyboardAvoidingView>
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

  // Pantalla de evaluación de conocimientos - Pregunta 1
  if (currentStep === 'knowledge1') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Evaluación de Conocimientos</Text>
        </View>

        <View style={styles.onboardingContent}>
          <View style={styles.onboardingMain}>
            <Text style={[styles.onboardingTitle, { color: colors.text }]}>
              ¿Sabes qué es una acción?
            </Text>
            
            <View style={styles.optionsContainer}>
              {['No', 'Tengo una idea general', 'Sí, entiendo el concepto'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    {
                      borderColor: onboardingData.knowledgeQ1 === option ? '#8CD279' : colors.cardBorder,
                      borderWidth: onboardingData.knowledgeQ1 === option ? 3 : 1,
                    }
                  ]}
                  onPress={() => updateOnboardingData('knowledgeQ1', option)}
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

  // Pantalla de evaluación de conocimientos - Pregunta 2
  if (currentStep === 'knowledge2') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Evaluación de Conocimientos</Text>
        </View>

        <View style={styles.onboardingContent}>
          <View style={styles.onboardingMain}>
            <Text style={[styles.onboardingTitle, { color: colors.text }]}>
              Si guardas $100 en una caja durante 10 años, ¿qué pasará con tu poder de compra?
            </Text>
            
            <View style={styles.optionsContainer}>
              {['Será el mismo', 'Probablemente compre menos cosas', 'Definitivamente perderá valor por la inflación'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    {
                      borderColor: onboardingData.knowledgeQ2 === option ? '#8CD279' : colors.cardBorder,
                      borderWidth: onboardingData.knowledgeQ2 === option ? 3 : 1,
                    }
                  ]}
                  onPress={() => updateOnboardingData('knowledgeQ2', option)}
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

  // Pantalla de evaluación de conocimientos - Pregunta 3
  if (currentStep === 'knowledge3') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Evaluación de Conocimientos</Text>
        </View>

        <View style={styles.onboardingContent}>
          <View style={styles.onboardingMain}>
            <Text style={[styles.onboardingTitle, { color: colors.text }]}>
              ¿Escuchaste alguna vez hablar del MERVAL?
            </Text>
            
            <View style={styles.optionsContainer}>
              {['No sé qué es', 'Creo que escuche alguna vez', 'Sí, es el índice de la Bolsa de Argentina'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    {
                      borderColor: onboardingData.knowledgeQ3 === option ? '#8CD279' : colors.cardBorder,
                      borderWidth: onboardingData.knowledgeQ3 === option ? 3 : 1,
                    }
                  ]}
                  onPress={() => updateOnboardingData('knowledgeQ3', option)}
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

  // Pantalla de evaluación de riesgo - Pregunta 1
  if (currentStep === 'risk1') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Evaluación de Riesgo</Text>
        </View>

        <View style={styles.onboardingContent}>
          <View style={styles.onboardingMain}>
            <Text style={[styles.onboardingTitle, { color: colors.text }]}>
              Si tienes $1000 ahorrados, ¿qué preferirías hacer?
            </Text>
            
            <View style={styles.optionsContainer}>
              {['Dejarlos en el banco sin riesgo', 'Invertir la mitad y dejar la mitad segura', 'Invertir todo para obtener mejores ganancias'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    {
                      borderColor: onboardingData.riskQ1 === option ? '#8CD279' : colors.cardBorder,
                      borderWidth: onboardingData.riskQ1 === option ? 3 : 1,
                    }
                  ]}
                  onPress={() => updateOnboardingData('riskQ1', option)}
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

  // Pantalla de evaluación de riesgo - Pregunta 2
  if (currentStep === 'risk2') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Evaluación de Riesgo</Text>
        </View>

        <View style={styles.onboardingContent}>
          <View style={styles.onboardingMain}>
            <Text style={[styles.onboardingTitle, { color: colors.text }]}>
              Imagina que compraste una acción y al día siguiente perdió 10% de su valor. ¿Qué harías?
            </Text>
            
            <View style={styles.optionsContainer}>
              {['La vendería inmediatamente para no perder más', 'Esperaría un poco', 'La mantendría y hasta compraría más si creo en la empresa'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    {
                      borderColor: onboardingData.riskQ2 === option ? '#8CD279' : colors.cardBorder,
                      borderWidth: onboardingData.riskQ2 === option ? 3 : 1,
                    }
                  ]}
                  onPress={() => updateOnboardingData('riskQ2', option)}
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

  // Pantalla de evaluación de riesgo - Pregunta 3
  if (currentStep === 'risk3') {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBack}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Evaluación de Riesgo</Text>
        </View>

        <View style={styles.onboardingContent}>
          <View style={styles.onboardingMain}>
            <Text style={[styles.onboardingTitle, { color: colors.text }]}>
              Tu amigo te cuenta que ganó mucho dinero invirtiendo en una empresa nueva. ¿Qué harías?
            </Text>
            
            <View style={styles.optionsContainer}>
              {['Prefiero no arriesgar mi dinero', 'Investigaría un poco antes de decidir', 'Invertiría porque confío en mi amigo'].map((option) => (
                <TouchableOpacity
                  key={option}
                  style={[
                    styles.optionButton,
                    {
                      borderColor: onboardingData.riskQ3 === option ? '#8CD279' : colors.cardBorder,
                      borderWidth: onboardingData.riskQ3 === option ? 3 : 1,
                    }
                  ]}
                  onPress={() => updateOnboardingData('riskQ3', option)}
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

        <ScrollView 
          style={styles.onboardingContent}
          contentContainerStyle={styles.onboardingScrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
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
        </ScrollView>
      </SafeAreaView>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex1: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 100,
    minHeight: '100%',
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
  helpText: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
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
  },
  onboardingScrollContent: {
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingBottom: 20,
  },
  onboardingMain: {
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
