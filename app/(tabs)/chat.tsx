import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { ChatMessage, generateBotResponse } from '@/services/mockup';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

export default function ChatScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleSendMessage = () => {
    if (message.trim()) {
      const userMessage: ChatMessage = {
        id: Date.now().toString(),
        text: message.trim(),
        sender: 'user',
        timestamp: new Date()
      };

      // Agregar mensaje del usuario
      setMessages(prev => [...prev, userMessage]);
      setMessage('');
      setIsTyping(true);

      // Simular delay de respuesta del bot
      setTimeout(() => {
        const botResponse = generateBotResponse(message.trim());
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: botResponse,
          sender: 'bot',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000 + Math.random() * 2000); // Entre 1-3 segundos
    }
  };

  const handleQuickMessage = (quickMessage: string) => {
    setMessage(quickMessage);
  };

  useEffect(() => {
    // Auto scroll al último mensaje
    if (scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Usar colores específicos del diseño cuando esté en modo oscuro
  const isDark = colorScheme === 'dark';
  const bgColor = isDark ? '#131712' : colors.background;
  const cardColor = isDark ? '#2d372a' : colors.card;
  const subtitleColor = isDark ? '#a5b6a0' : colors.subtitle;
  const textColor = isDark ? 'white' : colors.text;

  const renderMessage = (msg: ChatMessage, index: number) => {
    const isBot = msg.sender === 'bot';
    return (
      <View key={msg.id} style={[
        styles.messageWrapper,
        isBot ? styles.botMessageWrapper : styles.userMessageWrapper
      ]}>
        {isBot && (
          <Image 
            source={{
              uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxKzZcEK_9oBXUVXgVKhwMuT_KoaWFt7W_k3ZiuRuAPZubSrrpzn0g2uCIDjnhFAFslH3V_yunI9eu2ygHt39StbylD2t8M3C777lSbuVGP02t6YvmK-4WSBXupeuOUXCMxEOuYPveL44YH6npskobsn_5h-BwTRwTGAhIvOuJqKH-fAyt88gIV79AUAVuG82LrkZj-iYUEFMGN0RTUrDc268wiEyJDIiNAQcOH_eI4l2RPe98dhUf6_7nEmCDKEinkipLowTB-E8"
            }}
            style={styles.messageAvatar}
          />
        )}
        <View style={[
          styles.messageBubble,
          {
            backgroundColor: isBot ? cardColor : '#4CAF50',
            marginLeft: isBot ? 8 : 50,
            marginRight: isBot ? 50 : 8,
          }
        ]}>
          <Text style={[
            styles.messageText,
            { color: isBot ? textColor : 'white' }
          ]}>
            {msg.text}
          </Text>
          <Text style={[
            styles.messageTime,
            { color: isBot ? subtitleColor : 'rgba(255,255,255,0.7)' }
          ]}>
            {msg.timestamp.toLocaleTimeString('es-AR', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: bgColor }]}>
          <Text style={[styles.headerTitle, { color: textColor }]}>Guía MERVAL</Text>
        </View>

        {/* Chat Content */}
        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollContainer} 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Bot Avatar and Initial Message */}
          <View style={styles.botMessageContainer}>
            <Image 
              source={{
                uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxKzZcEK_9oBXUVXgVKhwMuT_KoaWFt7W_k3ZiuRuAPZubSrrpzn0g2uCIDjnhFAFslH3V_yunI9eu2ygHt39StbylD2t8M3C777lSbuVGP02t6YvmK-4WSBXupeuOUXCMxEOuYPveL44YH6npskobsn_5h-BwTRwTGAhIvOuJqKH-fAyt88gIV79AUAVuG82LrkZj-iYUEFMGN0RTUrDc268wiEyJDIiNAQcOH_eI4l2RPe98dhUf6_7nEmCDKEinkipLowTB-E8"
              }}
              style={styles.botAvatar}
            />
            <View style={styles.messageContainer}>
              <Text style={[styles.botName, { color: subtitleColor }]}>Guía MERVAL</Text>
              <View style={[styles.messageBubble, { backgroundColor: cardColor }]}>
                <Text style={[styles.messageText, { color: textColor }]}>
                  ¡Hola, soy tu asistente financiero! Estoy aquí para ayudarte a entender el mercado de valores argentino. ¿Qué te gustaría saber hoy?
                </Text>
              </View>
            </View>
          </View>

          {/* Messages */}
          {messages.map((msg, index) => renderMessage(msg, index))}

          {/* Typing Indicator */}
          {isTyping && (
            <View style={[styles.messageWrapper, styles.botMessageWrapper]}>
              <Image 
                source={{
                  uri: "https://lh3.googleusercontent.com/aida-public/AB6AXuCxKzZcEK_9oBXUVXgVKhwMuT_KoaWFt7W_k3ZiuRuAPZubSrrpzn0g2uCIDjnhFAFslH3V_yunI9eu2ygHt39StbylD2t8M3C777lSbuVGP02t6YvmK-4WSBXupeuOUXCMxEOuYPveL44YH6npskobsn_5h-BwTRwTGAhIvOuJqKH-fAyt88gIV79AUAVuG82LrkZj-iYUEFMGN0RTUrDc268wiEyJDIiNAQcOH_eI4l2RPe98dhUf6_7nEmCDKEinkipLowTB-E8"
                }}
                style={styles.messageAvatar}
              />
              <View style={[styles.messageBubble, { backgroundColor: cardColor, marginLeft: 8, marginRight: 50 }]}>
                <Text style={[styles.messageText, { color: textColor }]}>
                  Escribiendo...
                </Text>
              </View>
            </View>
          )}

          {/* Quick Action Chips - Solo mostrar si no hay mensajes */}
          {messages.length === 0 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.chipsContainer}
              contentContainerStyle={styles.chipsContent}
            >
              <TouchableOpacity 
                style={[styles.chip, { backgroundColor: cardColor }]}
                onPress={() => handleQuickMessage('¿Qué es el MERVAL?')}
              >
                <Text style={[styles.chipText, { color: textColor }]}>¿Qué es el MERVAL?</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.chip, { backgroundColor: cardColor }]}
                onPress={() => handleQuickMessage('¿Cómo invertir en acciones?')}
              >
                <Text style={[styles.chipText, { color: textColor }]}>¿Cómo invertir en acciones?</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.chip, { backgroundColor: cardColor }]}
                onPress={() => handleQuickMessage('¿Cuáles son las acciones más populares?')}
              >
                <Text style={[styles.chipText, { color: textColor }]}>¿Cuáles son las acciones más populares?</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </ScrollView>

        {/* Input Area - Adaptable al teclado */}
        <View style={[styles.inputSection, { backgroundColor: bgColor }]}>
          <View style={styles.inputContainer}>
            <View style={[styles.inputWrapper, { backgroundColor: cardColor }]}>
              <TextInput
                style={[styles.textInput, { color: textColor }]}
                placeholder="Escribe un mensaje..."
                placeholderTextColor={subtitleColor}
                value={message}
                onChangeText={setMessage}
                multiline
                maxLength={500}
              />
              {message.trim() ? (
                <TouchableOpacity 
                  style={[styles.sendButton, { backgroundColor: '#4CAF50' }]}
                  onPress={handleSendMessage}
                >
                  <Ionicons name="send" size={18} color="white" />
                </TouchableOpacity>
              ) : (
                <TouchableOpacity style={styles.attachButton}>
                  <Ionicons name="image-outline" size={20} color={subtitleColor} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <Text style={[styles.disclaimer, { color: subtitleColor }]}>
            La información proporcionada es solo para fines educativos y no constituye asesoramiento financiero.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 70,
    paddingBottom: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 16, // Menos padding ya que KeyboardAvoidingView maneja el espacio
    flexGrow: 1,
  },
  botMessageContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    paddingVertical: 16,
  },
  botAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  messageContainer: {
    flex: 1,
    gap: 4,
  },
  botName: {
    fontSize: 13,
    fontWeight: 'normal',
    maxWidth: 360,
  },
  messageBubble: {
    maxWidth: 360,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  messageText: {
    fontSize: 16,
    fontWeight: 'normal',
    lineHeight: 22,
  },
  chipsContainer: {
    paddingVertical: 12,
  },
  chipsContent: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 4,
  },
  chip: {
    height: 32,
    paddingHorizontal: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 20 : 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  inputContainer: {
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    borderRadius: 12,
    minHeight: 48,
    maxHeight: 120,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlignVertical: 'top',
  },
  attachButton: {
    padding: 12,
    marginRight: 4,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    marginBottom: 6,
  },
  disclaimer: {
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 16,
  },
  messageWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  botMessageWrapper: {
    justifyContent: 'flex-start',
  },
  userMessageWrapper: {
    justifyContent: 'flex-end',
  },
  messageAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'right',
  },
});
