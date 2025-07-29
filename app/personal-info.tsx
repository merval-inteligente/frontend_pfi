import { Colors } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { getDefaultPersonalInfo } from '@/services/mockup';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
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

export default function PersonalInfoScreen() {
  const { colorScheme } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const colors = Colors[colorScheme];

  const [personalInfo, setPersonalInfo] = useState(() => getDefaultPersonalInfo(user || undefined));

  const savePersonalInfo = () => {
    Alert.alert('Éxito', 'Información personal actualizada correctamente', [
      { text: 'OK', onPress: () => router.back() }
    ]);
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
        <Text style={[styles.headerTitle, { color: colors.text }]}>Información Personal</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.profilePictureSection}>
          <View style={[styles.avatarContainer, { borderColor: colors.cardBorder }]}>
            <Image
              source={{
                uri: personalInfo.avatar
              }}
              style={styles.avatar}
              contentFit="cover"
            />
            <TouchableOpacity style={[styles.editAvatarButton, { backgroundColor: colors.tint }]}>
              <Ionicons name="camera" size={16} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={[styles.changePhotoText, { color: colors.subtitle }]}>
            Tocar para cambiar foto
          </Text>
        </View>

        {/* Personal Information Form */}
        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Nombre completo</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.cardBorder }]}
              value={personalInfo.name}
              onChangeText={(text) => setPersonalInfo({...personalInfo, name: text})}
              placeholder="Ingresa tu nombre completo"
              placeholderTextColor={colors.subtitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Email</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.cardBorder }]}
              value={personalInfo.email}
              onChangeText={(text) => setPersonalInfo({...personalInfo, email: text})}
              keyboardType="email-address"
              placeholder="tu@email.com"
              placeholderTextColor={colors.subtitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Teléfono</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.cardBorder }]}
              value={personalInfo.phone}
              onChangeText={(text) => setPersonalInfo({...personalInfo, phone: text})}
              keyboardType="phone-pad"
              placeholder="+54 11 1234-5678"
              placeholderTextColor={colors.subtitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Fecha de nacimiento</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.cardBorder }]}
              value={personalInfo.birthDate}
              onChangeText={(text) => setPersonalInfo({...personalInfo, birthDate: text})}
              placeholder="DD/MM/AAAA"
              placeholderTextColor={colors.subtitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Ocupación</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.cardBorder }]}
              value={personalInfo.occupation}
              onChangeText={(text) => setPersonalInfo({...personalInfo, occupation: text})}
              placeholder="Tu ocupación"
              placeholderTextColor={colors.subtitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Dirección</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.cardBorder }]}
              value={personalInfo.address}
              onChangeText={(text) => setPersonalInfo({...personalInfo, address: text})}
              placeholder="Tu dirección"
              placeholderTextColor={colors.subtitle}
              multiline
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Documento</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.cardBorder }]}
              value={personalInfo.document}
              onChangeText={(text) => setPersonalInfo({...personalInfo, document: text})}
              placeholder="Número de documento"
              placeholderTextColor={colors.subtitle}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { color: colors.text }]}>Nacionalidad</Text>
            <TextInput
              style={[styles.input, { backgroundColor: colors.card, color: colors.text, borderColor: colors.cardBorder }]}
              value={personalInfo.nationality}
              onChangeText={(text) => setPersonalInfo({...personalInfo, nationality: text})}
              placeholder="Tu nacionalidad"
              placeholderTextColor={colors.subtitle}
            />
          </View>
        </View>

        {/* Save Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: colors.tint }]}
            onPress={savePersonalInfo}
          >
            <Ionicons name="checkmark" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.saveButtonText}>Guardar Cambios</Text>
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
  },
  profilePictureSection: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
    borderWidth: 3,
    position: 'relative',
  },
  avatar: {
    width: '100%',
    height: '100%',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changePhotoText: {
    marginTop: 12,
    fontSize: 14,
  },
  formSection: {
    paddingHorizontal: 20,
  },
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
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
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
