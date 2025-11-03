import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Modal,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

interface AlertCreatorProps {
  visible: boolean;
  onClose: () => void;
  onSave: (alert: any) => void;
  stocks?: string[]; // Lista de símbolos de acciones disponibles
  userRiskProfile?: 'conservador' | 'moderado' | 'agresivo'; // Perfil de riesgo del usuario
}

export const AlertCreator: React.FC<AlertCreatorProps> = ({
  visible,
  onClose,
  onSave,
  stocks = [],
  userRiskProfile = 'moderado'
}) => {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];

  const [alertType, setAlertType] = useState<'price' | 'news' | 'portfolio' | 'volume' | 'technical'>('price');
  const [selectedStock, setSelectedStock] = useState<string>('');
  const [condition, setCondition] = useState<'above' | 'below' | 'change_percent' | 'volume_spike'>('above');
  const [threshold, setThreshold] = useState<string>('');
  const [timeframe, setTimeframe] = useState<'1h' | '1d' | '1w' | '1m'>('1d');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [customTitle, setCustomTitle] = useState<string>('');

  // Función para obtener umbrales sugeridos según el perfil
  const getSuggestedThreshold = React.useCallback((type: string, condition: string): string => {
    if (condition === 'change_percent') {
      if (userRiskProfile === 'conservador') return '5';
      if (userRiskProfile === 'moderado') return '7';
      if (userRiskProfile === 'agresivo') return '10';
    }
    if (condition === 'volume_spike') {
      if (userRiskProfile === 'conservador') return '2';
      if (userRiskProfile === 'moderado') return '2.5';
      if (userRiskProfile === 'agresivo') return '3';
    }
    return '';
  }, [userRiskProfile]);

  // Función para obtener prioridad sugerida según perfil
  const getSuggestedPriority = React.useCallback((): 'low' | 'medium' | 'high' => {
    if (userRiskProfile === 'conservador') return 'medium';
    if (userRiskProfile === 'moderado') return 'medium';
    if (userRiskProfile === 'agresivo') return 'high';
    return 'medium';
  }, [userRiskProfile]);

  // Actualizar prioridad sugerida cuando cambia el perfil
  React.useEffect(() => {
    setPriority(getSuggestedPriority());
  }, [getSuggestedPriority]);

  // Auto-completar threshold sugerido cuando cambia la condición
  React.useEffect(() => {
    if (!threshold) {
      const suggested = getSuggestedThreshold(alertType, condition);
      if (suggested) setThreshold(suggested);
    }
  }, [condition, alertType, getSuggestedThreshold, threshold]);

  const alertTypes = [
    { value: 'price', label: 'Precio', icon: 'trending-up' },
    { value: 'volume', label: 'Volumen', icon: 'bar-chart' },
    { value: 'portfolio', label: 'Cartera', icon: 'wallet' },
    { value: 'news', label: 'Noticias', icon: 'newspaper' },
  ];

  const conditions = {
    price: [
      { value: 'above', label: 'Por encima de' },
      { value: 'below', label: 'Por debajo de' },
      { value: 'change_percent', label: 'Cambio porcentual' },
    ],
    volume: [
      { value: 'volume_spike', label: 'Pico de volumen' },
    ],
    portfolio: [
      { value: 'change_percent', label: 'Cambio porcentual' },
    ],
    news: [
      { value: 'change_percent', label: 'En cualquier noticia' },
    ],
  };

  const timeframes = [
    { value: '1h', label: '1 hora' },
    { value: '1d', label: '1 día' },
    { value: '1w', label: '1 semana' },
    { value: '1m', label: '1 mes' },
  ];

  const priorities = [
    { value: 'low', label: 'Baja', color: '#6c757d' },
    { value: 'medium', label: 'Media', color: '#ffc107' },
    { value: 'high', label: 'Alta', color: '#dc3545' },
  ];

  const handleSave = () => {
    const alert = {
      id: Date.now().toString(),
      title: customTitle || generateTitle(),
      description: generateDescription(),
      type: alertType,
      enabled: true,
      icon: getIconForType(alertType),
      config: {
        symbol: selectedStock,
        condition,
        threshold: parseFloat(threshold),
        timeframe,
      },
      createdAt: new Date(),
      triggerCount: 0,
      priority,
    };
    
    onSave(alert);
    resetForm();
    onClose();
  };

  const generateTitle = (): string => {
    if (alertType === 'price' && selectedStock) {
      if (condition === 'above') return `${selectedStock} supera $${threshold}`;
      if (condition === 'below') return `${selectedStock} cae bajo $${threshold}`;
      if (condition === 'change_percent') return `${selectedStock} ${parseFloat(threshold) > 0 ? 'sube' : 'baja'} ${Math.abs(parseFloat(threshold))}%`;
    }
    if (alertType === 'volume' && selectedStock) {
      return `${selectedStock} volumen anormal`;
    }
    if (alertType === 'portfolio') {
      return `Cartera ${parseFloat(threshold) > 0 ? 'sube' : 'baja'} ${Math.abs(parseFloat(threshold))}%`;
    }
    return 'Nueva alerta personalizada';
  };

  const generateDescription = (): string => {
    if (alertType === 'price' && selectedStock) {
      if (condition === 'above') return `Notificar cuando ${selectedStock} supere los $${threshold}`;
      if (condition === 'below') return `Notificar cuando ${selectedStock} caiga por debajo de $${threshold}`;
      if (condition === 'change_percent') return `Notificar cuando ${selectedStock} tenga un cambio de ${threshold}% en ${timeframe}`;
    }
    if (alertType === 'volume' && selectedStock) {
      return `Notificar cuando el volumen de ${selectedStock} sea ${threshold}% superior al promedio`;
    }
    if (alertType === 'portfolio') {
      return `Notificar cuando la cartera total cambie ${threshold}% en ${timeframe}`;
    }
    return 'Alerta personalizada';
  };

  const getIconForType = (type: string): string => {
    const icons: Record<string, string> = {
      price: 'trending-up',
      volume: 'bar-chart',
      portfolio: 'wallet',
      news: 'newspaper',
      technical: 'analytics',
    };
    return icons[type] || 'notifications';
  };

  const resetForm = () => {
    setSelectedStock('');
    setThreshold('');
    setCustomTitle('');
    setAlertType('price');
    setCondition('above');
    setTimeframe('1d');
    setPriority('medium');
  };

  const isFormValid = (): boolean => {
    if (alertType !== 'portfolio' && !selectedStock) return false;
    if (!threshold || isNaN(parseFloat(threshold))) return false;
    return true;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.background }]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.cardBorder }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Crear Alerta Personalizada</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
            {/* Tipo de Alerta */}
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Tipo de Alerta</Text>
            <View style={styles.typeSelector}>
              {alertTypes.map((type) => (
                <TouchableOpacity
                  key={type.value}
                  style={[
                    styles.typeButton,
                    { 
                      backgroundColor: alertType === type.value ? colors.tint : colors.card,
                      borderColor: colors.cardBorder
                    }
                  ]}
                  onPress={() => setAlertType(type.value as any)}
                >
                  <Ionicons 
                    name={type.icon as any} 
                    size={20} 
                    color={alertType === type.value ? '#fff' : colors.text} 
                  />
                  <Text style={[
                    styles.typeButtonText,
                    { color: alertType === type.value ? '#fff' : colors.text }
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Selección de Acción */}
            {alertType !== 'portfolio' && (
              <>
                <Text style={[styles.sectionLabel, { color: colors.text }]}>Acción</Text>
                <View style={[styles.input, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
                  <TextInput
                    style={[styles.inputText, { color: colors.text }]}
                    placeholder="Ej: YPF, GGAL, PAMP"
                    placeholderTextColor={colors.subtitle}
                    value={selectedStock}
                    onChangeText={setSelectedStock}
                    autoCapitalize="characters"
                  />
                </View>
              </>
            )}

            {/* Condición */}
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Condición</Text>
            <View style={styles.conditionSelector}>
              {(conditions[alertType as keyof typeof conditions] || conditions.price).map((cond) => (
                <TouchableOpacity
                  key={cond.value}
                  style={[
                    styles.conditionButton,
                    { 
                      backgroundColor: condition === cond.value ? colors.tint : colors.card,
                      borderColor: colors.cardBorder
                    }
                  ]}
                  onPress={() => setCondition(cond.value as any)}
                >
                  <Text style={[
                    styles.conditionButtonText,
                    { color: condition === cond.value ? '#fff' : colors.text }
                  ]}>
                    {cond.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Umbral */}
            <Text style={[styles.sectionLabel, { color: colors.text }]}>
              {condition === 'volume_spike' ? 'Porcentaje sobre promedio' : 
               condition === 'change_percent' ? 'Porcentaje de cambio' : 'Valor umbral'}
            </Text>
            <View style={[styles.input, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <TextInput
                style={[styles.inputText, { color: colors.text }]}
                placeholder={condition === 'change_percent' || condition === 'volume_spike' ? 'Ej: 5' : 'Ej: 1000'}
                placeholderTextColor={colors.subtitle}
                value={threshold}
                onChangeText={setThreshold}
                keyboardType="numeric"
              />
              <Text style={[styles.inputSuffix, { color: colors.subtitle }]}>
                {condition === 'change_percent' || condition === 'volume_spike' ? '%' : '$'}
              </Text>
            </View>
            
            {/* Sugerencia personalizada según perfil */}
            {(condition === 'change_percent' || condition === 'volume_spike') && (() => {
              const suggested = getSuggestedThreshold(alertType, condition);
              const profileLabel = userRiskProfile === 'conservador' ? '🛡️ Conservador' : 
                                   userRiskProfile === 'moderado' ? '⚖️ Moderado' : '🚀 Agresivo';
              return suggested ? (
                <View style={[styles.suggestionHint, { backgroundColor: `${colors.success}10`, borderColor: colors.success }]}>
                  <Ionicons name="bulb-outline" size={16} color={colors.success} />
                  <Text style={[styles.suggestionText, { color: colors.success }]}>
                    Sugerido para {profileLabel}: {suggested}%
                  </Text>
                </View>
              ) : null;
            })()}

            {/* Marco Temporal */}
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Marco Temporal</Text>
            <View style={styles.timeframeSelector}>
              {timeframes.map((tf) => (
                <TouchableOpacity
                  key={tf.value}
                  style={[
                    styles.timeframeButton,
                    { 
                      backgroundColor: timeframe === tf.value ? colors.tint : colors.card,
                      borderColor: colors.cardBorder
                    }
                  ]}
                  onPress={() => setTimeframe(tf.value as any)}
                >
                  <Text style={[
                    styles.timeframeButtonText,
                    { color: timeframe === tf.value ? '#fff' : colors.text }
                  ]}>
                    {tf.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Prioridad */}
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Prioridad</Text>
            <View style={styles.prioritySelector}>
              {priorities.map((p) => (
                <TouchableOpacity
                  key={p.value}
                  style={[
                    styles.priorityButton,
                    { 
                      backgroundColor: priority === p.value ? p.color : colors.card,
                      borderColor: priority === p.value ? p.color : colors.cardBorder
                    }
                  ]}
                  onPress={() => setPriority(p.value as any)}
                >
                  <Text style={[
                    styles.priorityButtonText,
                    { color: priority === p.value ? '#fff' : colors.text }
                  ]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Título Personalizado (Opcional) */}
            <Text style={[styles.sectionLabel, { color: colors.text }]}>Título Personalizado (Opcional)</Text>
            <View style={[styles.input, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <TextInput
                style={[styles.inputText, { color: colors.text }]}
                placeholder={generateTitle()}
                placeholderTextColor={colors.subtitle}
                value={customTitle}
                onChangeText={setCustomTitle}
              />
            </View>

            {/* Vista Previa */}
            <View style={[styles.preview, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Text style={[styles.previewLabel, { color: colors.subtitle }]}>Vista Previa</Text>
              <Text style={[styles.previewTitle, { color: colors.text }]}>
                {customTitle || generateTitle()}
              </Text>
              <Text style={[styles.previewDescription, { color: colors.subtitle }]}>
                {generateDescription()}
              </Text>
            </View>
          </ScrollView>

          <View style={[styles.modalFooter, { borderTopColor: colors.cardBorder }]}>
            <TouchableOpacity 
              style={[styles.cancelButton, { backgroundColor: colors.card }]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[
                styles.saveButton, 
                { 
                  backgroundColor: isFormValid() ? colors.tint : colors.subtitle,
                  opacity: isFormValid() ? 1 : 0.5
                }
              ]}
              onPress={handleSave}
              disabled={!isFormValid()}
            >
              <Text style={styles.saveButtonText}>Crear Alerta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalBody: {
    padding: 20,
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  typeSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48,
  },
  inputText: {
    flex: 1,
    fontSize: 16,
  },
  inputSuffix: {
    fontSize: 16,
    fontWeight: '500',
  },
  conditionSelector: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  conditionButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  conditionButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  timeframeSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  timeframeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  prioritySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  priorityButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  priorityButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  preview: {
    marginTop: 20,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  previewDescription: {
    fontSize: 14,
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  suggestionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  suggestionText: {
    fontSize: 13,
    fontWeight: '600',
  },
});
