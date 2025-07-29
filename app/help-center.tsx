import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { getContactInfo, helpCategories, mockFAQs } from '@/services/mockup';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    Linking,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';

const faqData = mockFAQs;

const categories = helpCategories;

export default function HelpCenterScreen() {
  const { colorScheme } = useTheme();
  const router = useRouter();
  const colors = Colors[colorScheme];

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const filteredFAQs = faqData.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'Todas' || item.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const toggleExpanded = (id: string) => {
    setExpandedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const contactSupport = () => {
    const contactInfo = getContactInfo();
    Alert.alert(
      'Contactar Soporte',
      'Selecciona cómo prefieres contactarnos:',
      [
        {
          text: 'Email',
          onPress: () => Linking.openURL(`mailto:${contactInfo.email}?subject=Consulta desde la app`)
        },
        {
          text: 'WhatsApp',
          onPress: () => Linking.openURL(`https://wa.me/${contactInfo.whatsapp}?text=Hola, necesito ayuda con MERVAL Guide`)
        },
        {
          text: 'Cancelar',
          style: 'cancel'
        }
      ]
    );
  };

  const openTutorials = () => {
    Alert.alert(
      'Tutoriales',
      'Próximamente tendremos videotutoriales disponibles para ayudarte a aprovechar al máximo la aplicación.',
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Centro de Ayuda</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={[styles.searchInputContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
            <Ionicons name="search" size={20} color={colors.subtitle} style={styles.searchIcon} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Buscar preguntas frecuentes..."
              placeholderTextColor={colors.subtitle}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={colors.subtitle} />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Quick Actions */}
        <View style={[styles.quickActionsSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Acciones Rápidas</Text>
          
          <View style={styles.quickActionsGrid}>
            <TouchableOpacity 
              style={[styles.quickAction, { backgroundColor: colors.background }]}
              onPress={contactSupport}
            >
              <Ionicons name="chatbubble-outline" size={24} color={colors.tint} />
              <Text style={[styles.quickActionTitle, { color: colors.text }]}>Contactar</Text>
              <Text style={[styles.quickActionSubtitle, { color: colors.subtitle }]}>Soporte directo</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickAction, { backgroundColor: colors.background }]}
              onPress={openTutorials}
            >
              <Ionicons name="play-circle-outline" size={24} color={colors.success} />
              <Text style={[styles.quickActionTitle, { color: colors.text }]}>Tutoriales</Text>
              <Text style={[styles.quickActionSubtitle, { color: colors.subtitle }]}>Aprende paso a paso</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickAction, { backgroundColor: colors.background }]}
              onPress={() => Linking.openURL('https://www.cnv.gov.ar')}
            >
              <Ionicons name="document-text-outline" size={24} color={colors.warning} />
              <Text style={[styles.quickActionTitle, { color: colors.text }]}>Regulación</Text>
              <Text style={[styles.quickActionSubtitle, { color: colors.subtitle }]}>Info oficial CNV</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.quickAction, { backgroundColor: colors.background }]}
              onPress={() => Alert.alert('Glosario', 'Próximamente disponible un glosario completo de términos financieros.')}
            >
              <Ionicons name="book-outline" size={24} color={colors.danger} />
              <Text style={[styles.quickActionTitle, { color: colors.text }]}>Glosario</Text>
              <Text style={[styles.quickActionSubtitle, { color: colors.subtitle }]}>Términos financieros</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Category Filter */}
        <View style={styles.categorySection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Categorías</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: selectedCategory === category ? colors.tint : colors.card,
                    borderColor: colors.cardBorder,
                  }
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryButtonText,
                  {
                    color: selectedCategory === category ? 'white' : colors.text
                  }
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* FAQ List */}
        <View style={[styles.faqSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Preguntas Frecuentes {filteredFAQs.length > 0 && `(${filteredFAQs.length})`}
          </Text>
          
          {filteredFAQs.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search" size={48} color={colors.subtitle} />
              <Text style={[styles.noResultsTitle, { color: colors.text }]}>
                No se encontraron resultados
              </Text>
              <Text style={[styles.noResultsSubtitle, { color: colors.subtitle }]}>
                Intenta con otros términos de búsqueda o contacta a soporte
              </Text>
            </View>
          ) : (
            <View style={styles.faqList}>
              {filteredFAQs.map((item) => (
                <View key={item.id} style={[styles.faqItem, { backgroundColor: colors.background }]}>
                  <TouchableOpacity
                    style={styles.faqHeader}
                    onPress={() => toggleExpanded(item.id)}
                  >
                    <View style={styles.faqHeaderContent}>
                      <Text style={[styles.faqQuestion, { color: colors.text }]}>
                        {item.question}
                      </Text>
                      <View style={styles.faqMeta}>
                        <Text style={[styles.faqCategory, { color: colors.tint }]}>
                          {item.category}
                        </Text>
                      </View>
                    </View>
                    <Ionicons 
                      name={expandedItems.includes(item.id) ? "chevron-up" : "chevron-down"} 
                      size={20} 
                      color={colors.subtitle} 
                    />
                  </TouchableOpacity>
                  
                  {expandedItems.includes(item.id) && (
                    <View style={styles.faqAnswer}>
                      <Text style={[styles.faqAnswerText, { color: colors.subtitle }]}>
                        {item.answer}
                      </Text>
                      <View style={styles.faqTags}>
                        {item.tags.map((tag) => (
                          <View key={tag} style={[styles.faqTag, { backgroundColor: `${colors.tint}15` }]}>
                            <Text style={[styles.faqTagText, { color: colors.tint }]}>
                              {tag}
                            </Text>
                          </View>
                        ))}
                      </View>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Contact Section */}
        <View style={[styles.contactSection, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>¿No encontraste lo que buscas?</Text>
          <Text style={[styles.contactDescription, { color: colors.subtitle }]}>
            Nuestro equipo de soporte está aquí para ayudarte. Contáctanos y te responderemos lo antes posible.
          </Text>
          
          <TouchableOpacity
            style={[styles.contactButton, { backgroundColor: colors.tint }]}
            onPress={contactSupport}
          >
            <Ionicons name="chatbubble" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.contactButtonText}>Contactar Soporte</Text>
          </TouchableOpacity>
          
          <Text style={[styles.contactInfo, { color: colors.subtitle }]}>
            📧 {getContactInfo().email}{'\n'}
            📱 WhatsApp: +{getContactInfo().whatsapp}{'\n'}
            🕒 Lun-Vie 9:00-18:00 ART
          </Text>
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
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    height: 48,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  quickActionsSection: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickAction: {
    flex: 1,
    minWidth: '45%',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 8,
    marginBottom: 4,
  },
  quickActionSubtitle: {
    fontSize: 12,
    textAlign: 'center',
  },
  categorySection: {
    paddingLeft: 20,
    marginBottom: 20,
  },
  categoryScroll: {
    paddingRight: 20,
  },
  categoryButton: {
    paddingHorizontal: 16,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  faqSection: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  faqList: {
    gap: 12,
  },
  faqItem: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  faqHeaderContent: {
    flex: 1,
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  faqMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  faqCategory: {
    fontSize: 12,
    fontWeight: '600',
  },
  faqAnswer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  faqAnswerText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  faqTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  faqTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  faqTagText: {
    fontSize: 11,
    fontWeight: '500',
  },
  noResultsContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  contactSection: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
  },
  contactDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  contactButton: {
    height: 50,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  contactInfo: {
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  bottomSpacing: {
    height: 40,
  },
});
