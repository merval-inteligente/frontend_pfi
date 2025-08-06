import { Colors } from '@/constants/Colors';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useRef, useState } from 'react';
import {
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
import chatService from '../../services/ChatService';

interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function ChatScreen() {
  const { colorScheme } = useTheme();
  const colors = Colors[colorScheme];
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    initializeChatService();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    setTimeout(() => {
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 100);
  };

  const initializeChatService = async () => {
    try {
      let userToken = await AsyncStorage.getItem('userToken');
      let userId = await AsyncStorage.getItem('userId');

      if (!userToken) {
        userToken = 'demo_token_123';
        userId = 'demo_user';
        await AsyncStorage.setItem('userToken', userToken);
        await AsyncStorage.setItem('userId', userId);
      }

      await chatService.initialize(userToken);
      await chatService.authenticate(userId!);
      console.log('✅ Chat inicializado');
    } catch (error) {
      console.log('⚠️ Usando modo offline');
    }
  };

  const generateFallbackResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    const responses = [
      'Como analista financiero, puedo decirte que el mercado argentino ofrece oportunidades interesantes en este momento.',
      'Basándome en las condiciones actuales, recomiendo diversificar entre sectores defensivos y de crecimiento.',
      'El MERVAL ha mostrado buen momentum últimamente. ¿Te interesa algún sector en particular?',
      'Para tu perfil de inversor, sugiero evaluar las líderes del panel: GGAL, YPF y ALUA.',
      'El contexto macro actual favorece acciones con dividendo y fundamentals sólidos.',
      'Considera rebalancear tu portfolio según las condiciones del mercado actual.'
    ];
    
    if (lowerMessage.includes('precio') || lowerMessage.includes('cotiza')) {
      return 'GGAL cotiza en $850, YPF en $920 y ALUA en $445. Todas muestran buen potencial según mi análisis.';
    }
    
    if (lowerMessage.includes('merval') || lowerMessage.includes('índice')) {
      return 'El MERVAL cerró en 2,180,450 puntos (+1.2%). Sesión positiva liderada por bancos y energía.';
    }
    
    if (lowerMessage.includes('recomend') || lowerMessage.includes('invertir')) {
      return 'Para tu perfil, sugiero: 40% bancos (GGAL, SUPV), 30% energía (YPF), 30% industriales (ALUA, PAM).';
    }
    
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    const messageText = message.trim();
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setMessage('');
    setIsTyping(true);

    try {
      const response = await chatService.sendMessage(messageText);
      
      let botResponseText;
      if (response.success) {
        botResponseText = response.assistantResponse;
      } else {
        botResponseText = generateFallbackResponse(messageText);
      }

      setTimeout(() => {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: botResponseText,
          sender: 'bot',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 800);

    } catch (error) {
      setTimeout(() => {
        const botMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          text: generateFallbackResponse(messageText),
          sender: 'bot',
          timestamp: new Date()
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 800);
    }
  };

  const renderMessage = (msg: ChatMessage, index: number) => {
    const isUser = msg.sender === 'user';
    
    return (
      <View key={msg.id} style={[
        styles.messageContainer,
        isUser ? styles.userMessageContainer : styles.botMessageContainer
      ]}>
        <View style={[
          styles.messageBubble,
          isUser ? styles.userBubble : styles.botBubble,
          { 
            backgroundColor: isUser ? '#007AFF' : (colorScheme === 'dark' ? '#2d372a' : colors.card),
            borderColor: colorScheme === 'dark' ? '#444' : '#e0e0e0'
          }
        ]}>
          <Text style={[
            styles.messageText,
            { color: isUser ? 'white' : colors.text }
          ]}>
            {msg.text}
          </Text>
          
          <Text style={[
            styles.timestamp,
            { color: isUser ? 'rgba(255,255,255,0.7)' : colors.subtitle }
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
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { backgroundColor: colors.card, borderBottomColor: colors.cardBorder }]}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarEmoji}>🤖</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Chat Financiero IA
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.subtitle }]}>
                Asistente MERVAL • En línea
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <TouchableOpacity style={[styles.headerButton, { backgroundColor: colors.background }]}>
              <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.length === 0 && (
            <View style={styles.welcomeContainer}>
              <Text style={[styles.welcomeText, { color: colors.text }]}>
                ¡Hola! 👋
              </Text>
              <Text style={[styles.welcomeSubtext, { color: colors.subtitle }]}>
                Soy tu asistente financiero especializado en el mercado argentino. 
                Puedo ayudarte con análisis de acciones, recomendaciones de inversión y consultas sobre el MERVAL.
              </Text>
            </View>
          )}
          
          {messages.map((msg, index) => renderMessage(msg, index))}
          
          {isTyping && (
            <View style={[styles.messageContainer, styles.botMessageContainer]}>
              <View style={[
                styles.messageBubble,
                styles.botBubble,
                { 
                  backgroundColor: colorScheme === 'dark' ? '#2d372a' : colors.card,
                  borderColor: colorScheme === 'dark' ? '#444' : '#e0e0e0'
                }
              ]}>
                <Text style={[styles.typingText, { color: colors.subtitle }]}>
                  Escribiendo...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={[styles.inputContainer, { backgroundColor: colors.card, borderTopColor: colors.cardBorder }]}>
          <TextInput
            style={[
              styles.textInput,
              { 
                backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5',
                color: colors.text,
                borderColor: colors.cardBorder
              }
            ]}
            value={message}
            onChangeText={setMessage}
            placeholder="Escribe tu consulta financiera..."
            placeholderTextColor={colors.subtitle}
            multiline
            maxLength={500}
            onSubmitEditing={handleSendMessage}
            blurOnSubmit={false}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              { 
                backgroundColor: message.trim() ? '#007AFF' : colors.cardBorder,
                opacity: message.trim() ? 1 : 0.5
              }
            ]}
            onPress={handleSendMessage}
            disabled={!message.trim() || isTyping}
          >
            <Ionicons 
              name="send" 
              size={20} 
              color="white" 
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 12,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarEmoji: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 13,
    marginTop: 1,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyboardContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    flexGrow: 1,
  },
  welcomeContainer: {
    alignItems: 'center',
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 12,
  },
  welcomeSubtext: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 22,
  },
  messageContainer: {
    marginVertical: 4,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  botMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  userBubble: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  botBubble: {
    // backgroundColor y borderColor se definen dinámicamente
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    marginTop: 4,
  },
  typingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    alignItems: 'flex-end',
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    maxHeight: 100,
    fontSize: 16,
    marginRight: 8,
  },
  sendButton: {
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
