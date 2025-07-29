import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import {
    availableSectors,
    diversificationLevels,
    experienceLevels,
    getDefaultInvestmentStrategy,
    getRiskProfiles,
    investmentGoals,
    investmentHorizons
} from '@/services/mockup';
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

export default function InvestmentStrategyScreen() {
  const { colorScheme } = useTheme();
  const router = useRouter();
  const colors = Colors[colorScheme];

  const [strategy, setStrategy] = useState(() => getDefaultInvestmentStrategy());

  // Obtener perfiles de riesgo con colores
  const riskProfiles = getRiskProfiles(colors);

  const toggleSector = (sector: string) => {
    setStrategy(prev => ({
      ...prev,
      preferredSectors: prev.preferredSectors.includes(sector)
        ? prev.preferredSectors.filter(s => s !== sector)
        : [...prev.preferredSectors, sector]
    }));
  };

  const toggleGoal = (goal: string) => {
    setStrategy(prev => ({
      ...prev,
      investmentGoals: prev.investmentGoals.includes(goal)
        ? prev.investmentGoals.filter(g => g !== goal)
        : [...prev.investmentGoals, goal]
    }));
  };

  const saveStrategy = () => {
    Alert.alert('Éxito', 'Estrategia de inversión actualizada correctamente', [
      { text: 'OK', onPress: () => router.back() }
    ]);
  };

  const analyzePortfolio = () => {
    Alert.alert(
      'Análisis de Estrategia',
      `Perfil: ${strategy.riskProfile}\nHorizonte: ${strategy.investmentHorizon}\nPresupuesto: ${strategy.monthlyBudget}\n\nRecomendaciones:\n• Diversificar en ${strategy.preferredSectors.length} sectores\n• Revisar estrategia cada 6 meses\n• Mantener reserva de emergencia`,
      [{ text: 'Entendido' }]
    );
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Estrategia de Inversión</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Risk Profile */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Perfil de Riesgo</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.subtitle }]}>
            Selecciona el nivel de riesgo que estás dispuesto a asumir
          </Text>
          
          {riskProfiles.map((profile) => (
            <TouchableOpacity
              key={profile.key}
              style={[
                styles.riskOption,
                { 
                  backgroundColor: strategy.riskProfile === profile.key ? `${profile.color}15` : colors.background,
                  borderColor: strategy.riskProfile === profile.key ? profile.color : colors.cardBorder
                }
              ]}
              onPress={() => setStrategy({...strategy, riskProfile: profile.key})}
            >
              <Ionicons 
                name={profile.icon as any} 
                size={24} 
                color={strategy.riskProfile === profile.key ? profile.color : colors.subtitle} 
              />
              <View style={styles.riskContent}>
                <Text style={[
                  styles.riskTitle,
                  { color: strategy.riskProfile === profile.key ? profile.color : colors.text }
                ]}>
                  {profile.title}
                </Text>
                <Text style={[styles.riskDescription, { color: colors.subtitle }]}>
                  {profile.description}
                </Text>
              </View>
              {strategy.riskProfile === profile.key && (
                <Ionicons name="checkmark-circle" size={24} color={profile.color} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Investment Horizon */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Horizonte de Inversión</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.subtitle }]}>
            ¿Por cuánto tiempo planeas mantener tus inversiones?
          </Text>
          
          <View style={styles.horizonButtons}>
            {investmentHorizons.map((horizon) => (
              <TouchableOpacity
                key={horizon}
                style={[
                  styles.horizonButton,
                  { 
                    backgroundColor: strategy.investmentHorizon === horizon ? colors.tint : colors.background,
                    borderColor: colors.cardBorder 
                  }
                ]}
                onPress={() => setStrategy({...strategy, investmentHorizon: horizon})}
              >
                <Text style={[
                  styles.horizonButtonText,
                  { color: strategy.investmentHorizon === horizon ? 'white' : colors.text }
                ]}>
                  {horizon}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Budget */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Presupuesto Mensual</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.subtitle }]}>
            ¿Cuánto planeas invertir mensualmente?
          </Text>
          
          <TextInput
            style={[styles.budgetInput, { backgroundColor: colors.background, color: colors.text, borderColor: colors.cardBorder }]}
            value={strategy.monthlyBudget}
            onChangeText={(text) => setStrategy({...strategy, monthlyBudget: text})}
            placeholder="Ej: $50,000"
            placeholderTextColor={colors.subtitle}
            keyboardType="numeric"
          />

          <View style={styles.budgetTips}>
            <Text style={[styles.tipTitle, { color: colors.text }]}>💡 Consejos:</Text>
            <Text style={[styles.tipText, { color: colors.subtitle }]}>
              • Invierte solo lo que puedas permitirte perder
            </Text>
            <Text style={[styles.tipText, { color: colors.subtitle }]}>
              • Mantén una reserva de emergencia
            </Text>
            <Text style={[styles.tipText, { color: colors.subtitle }]}>
              • Considera el dollar cost averaging
            </Text>
          </View>
        </View>

        {/* Preferred Sectors */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Sectores Preferidos</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.subtitle }]}>
            Selecciona los sectores en los que te interesa invertir
          </Text>
          
          <View style={styles.sectorGrid}>
            {availableSectors.map((sector) => (
              <TouchableOpacity
                key={sector}
                style={[
                  styles.sectorChip,
                  { 
                    backgroundColor: strategy.preferredSectors.includes(sector) ? colors.tint : colors.background,
                    borderColor: colors.cardBorder 
                  }
                ]}
                onPress={() => toggleSector(sector)}
              >
                <Text style={[
                  styles.sectorChipText,
                  { color: strategy.preferredSectors.includes(sector) ? 'white' : colors.text }
                ]}>
                  {sector}
                </Text>
                {strategy.preferredSectors.includes(sector) && (
                  <Ionicons name="checkmark" size={16} color="white" style={{ marginLeft: 4 }} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Investment Goals */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Objetivos de Inversión</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.subtitle }]}>
            ¿Cuáles son tus principales objetivos financieros?
          </Text>
          
          <View style={styles.goalsGrid}>
            {investmentGoals.map((goal) => (
              <TouchableOpacity
                key={goal}
                style={[
                  styles.goalChip,
                  { 
                    backgroundColor: strategy.investmentGoals.includes(goal) ? colors.success : colors.background,
                    borderColor: colors.cardBorder 
                  }
                ]}
                onPress={() => toggleGoal(goal)}
              >
                <Text style={[
                  styles.goalChipText,
                  { color: strategy.investmentGoals.includes(goal) ? 'white' : colors.text }
                ]}>
                  {goal}
                </Text>
                {strategy.investmentGoals.includes(goal) && (
                  <Ionicons name="checkmark" size={16} color="white" style={{ marginLeft: 4 }} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Additional Settings */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Configuración Adicional</Text>
          
          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Nivel de Experiencia</Text>
            <View style={styles.settingOptions}>
              {experienceLevels.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.settingButton,
                    { 
                      backgroundColor: strategy.experienceLevel === level ? colors.tint : colors.background,
                      borderColor: colors.cardBorder 
                    }
                  ]}
                  onPress={() => setStrategy({...strategy, experienceLevel: level})}
                >
                  <Text style={[
                    styles.settingButtonText,
                    { color: strategy.experienceLevel === level ? 'white' : colors.text }
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.settingRow}>
            <Text style={[styles.settingLabel, { color: colors.text }]}>Diversificación</Text>
            <View style={styles.settingOptions}>
              {diversificationLevels.map((level) => (
                <TouchableOpacity
                  key={level}
                  style={[
                    styles.settingButton,
                    { 
                      backgroundColor: strategy.diversificationLevel === level ? colors.tint : colors.background,
                      borderColor: colors.cardBorder 
                    }
                  ]}
                  onPress={() => setStrategy({...strategy, diversificationLevel: level})}
                >
                  <Text style={[
                    styles.settingButtonText,
                    { color: strategy.diversificationLevel === level ? 'white' : colors.text }
                  ]}>
                    {level}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Máxima Pérdida Aceptable</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.background, color: colors.text, borderColor: colors.cardBorder }]}
              value={strategy.maxLossPercentage}
              onChangeText={(text) => setStrategy({...strategy, maxLossPercentage: text})}
              placeholder="Ej: 10%"
              placeholderTextColor={colors.subtitle}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.analyzeButton, { backgroundColor: colors.background, borderColor: colors.tint }]}
            onPress={analyzePortfolio}
          >
            <Ionicons name="analytics-outline" size={20} color={colors.tint} style={{ marginRight: 8 }} />
            <Text style={[styles.analyzeButtonText, { color: colors.tint }]}>Analizar Estrategia</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.tint }]}
            onPress={saveStrategy}
          >
            <Ionicons name="checkmark" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.saveButtonText}>Guardar Estrategia</Text>
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
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  riskOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    marginBottom: 12,
  },
  riskContent: {
    flex: 1,
    marginLeft: 16,
  },
  riskTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  riskDescription: {
    fontSize: 14,
  },
  horizonButtons: {
    gap: 8,
  },
  horizonButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
  },
  horizonButtonText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  budgetInput: {
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 16,
  },
  budgetTips: {
    padding: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.02)',
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 12,
    marginBottom: 4,
  },
  sectorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sectorChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  sectorChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  goalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 8,
  },
  goalChipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  settingRow: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  settingOptions: {
    flexDirection: 'row',
    gap: 8,
  },
  settingButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  settingButtonText: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  buttonContainer: {
    gap: 12,
    paddingVertical: 20,
  },
  analyzeButton: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: '600',
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
