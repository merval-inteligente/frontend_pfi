// SDK del Chat Service para React Native
// Ubicación: pfi/services/ChatService.js

import AsyncStorage from '@react-native-async-storage/async-storage';

class ChatService {
  constructor() {
    this.baseUrl = 'http://192.168.0.17:8084'; // Chat Service
    this.backendUrl = 'http://192.168.0.17:8080'; // Backend Principal
    this.token = null;
    this.userId = null;
  }

  /**
   * Inicializar el servicio con token del backend principal
   */
  async initialize(userToken) {
    try {
      this.token = userToken;
      
      // Verificar que el chat service esté disponible
      const healthCheck = await this.checkHealth();
      if (!healthCheck.success) {
        throw new Error('Chat service no disponible');
      }

      console.log('✅ Chat Service inicializado');
      return { success: true };
    } catch (error) {
      console.error('❌ Error inicializando chat service:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Verificar estado del chat service
   */
  async checkHealth() {
    try {
      const response = await fetch(`${this.baseUrl}/health`);
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
        backendConnected: data.services?.main_backend === 'connected'
      };
    } catch (error) {
      console.error('❌ Health check error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Crear token de autenticación para el chat service
   */
  async authenticate(userId) {
    try {
      this.userId = userId;
      
      const response = await fetch(`${this.baseUrl}/auth/token?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.token && { 'X-Backend-Token': this.token })
        }
      });

      if (!response.ok) {
        throw new Error(`Auth failed: ${response.status}`);
      }

      const data = await response.json();
      
      // Guardar token del chat service
      await AsyncStorage.setItem('chat_token', data.access_token);
      
      return {
        success: true,
        chatToken: data.access_token,
        expiresIn: data.expires_in
      };
    } catch (error) {
      console.error('❌ Chat authentication error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener token del chat service desde storage
   */
  async getChatToken() {
    try {
      const chatToken = await AsyncStorage.getItem('chat_token');
      return chatToken;
    } catch (error) {
      console.error('❌ Error getting chat token:', error);
      return null;
    }
  }

  /**
   * Enviar mensaje al chat
   */
  async sendMessage(message) {
    try {
      const chatToken = await this.getChatToken();
      
      if (!chatToken) {
        throw new Error('No hay token de chat disponible');
      }

      const response = await fetch(`${this.baseUrl}/chat/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${chatToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: message,
          user_id: this.userId 
        })
      });

      if (!response.ok) {
        throw new Error(`Send message failed: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        messageId: data.message_id,
        userMessage: data.user_message,
        assistantResponse: data.assistant_response,
        timestamp: data.timestamp,
        personalized: data.personalized || false,
        hasContext: data.user_context !== null
      };
    } catch (error) {
      console.error('❌ Send message error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener historial de chat
   */
  async getChatHistory(limit = 50) {
    try {
      const chatToken = await this.getChatToken();
      
      if (!chatToken || !this.userId) {
        throw new Error('No hay autenticación disponible');
      }

      const response = await fetch(`${this.baseUrl}/chat/history/${this.userId}?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${chatToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Get history failed: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        messages: data.messages || [],
        total: data.total || 0
      };
    } catch (error) {
      console.error('❌ Get history error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener contexto del usuario
   */
  async getUserContext() {
    try {
      const chatToken = await this.getChatToken();
      
      if (!chatToken || !this.userId) {
        throw new Error('No hay autenticación disponible');
      }

      const response = await fetch(`${this.baseUrl}/chat/context/${this.userId}`, {
        headers: {
          'Authorization': `Bearer ${chatToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Get context failed: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        hasProfile: data.has_profile,
        hasPreferences: data.has_preferences,
        hasPortfolio: data.has_portfolio,
        backendConnected: data.backend_connected
      };
    } catch (error) {
      console.error('❌ Get context error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Limpiar datos del chat (logout)
   */
  async logout() {
    try {
      await AsyncStorage.removeItem('chat_token');
      this.token = null;
      this.userId = null;
      console.log('🔄 Chat service logout');
    } catch (error) {
      console.error('❌ Error during logout:', error);
    }
  }

  /**
   * Verificar si está autenticado
   */
  async isAuthenticated() {
    const chatToken = await this.getChatToken();
    return chatToken !== null && this.userId !== null;
  }
}

// Singleton instance
const chatService = new ChatService();

export default chatService;
