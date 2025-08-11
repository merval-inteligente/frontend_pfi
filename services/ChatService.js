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
      // Validar que el token sea un JWT
      if (!userToken || typeof userToken !== 'string') {
        throw new Error('Token inválido: no es una cadena');
      }

      // Un JWT debe tener exactamente 3 partes separadas por puntos
      const parts = userToken.split('.');
      if (parts.length !== 3) {
        throw new Error('Token inválido: no tiene formato JWT (debe tener 3 partes)');
      }

      // Verificar que cada parte sea base64 válida
      try {
        atob(parts[0]); // header
        atob(parts[1]); // payload
        // parts[2] es la signature, no necesariamente base64 puro
      } catch (_e) {
        throw new Error('Token inválido: no es base64 válido');
      }

      this.token = userToken.trim(); // Eliminar espacios en blanco
      
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
   * Autenticar usuario - usar directamente el token del backend
   */
  async authenticate(userId) {
    try {
      this.userId = userId;
      
      if (!this.token) {
        throw new Error('No hay token del backend principal');
      }

      // Verificar que el token sea válido en el backend principal
      const response = await fetch(`${this.backendUrl}/api/auth/verify`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('🔍 Error response:', errorText);
        throw new Error(`Token inválido: ${response.status}`);
      }

      const data = await response.json();
      
      // Usar directamente el token del backend para el chat service
      console.log('✅ Usuario autenticado en chat service:', data.data.user.name);
      
      return {
        success: true,
        user: data.data.user,
        backendToken: this.token
      };
    } catch (error) {
      console.error('❌ Chat authentication error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar mensaje al chat
   */
  async sendMessage(message) {
    try {
      if (!this.token) {
        throw new Error('No hay token de backend disponible');
      }

      const response = await fetch(`${this.baseUrl}/api/chat/message`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
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
      console.log('🔍 Chat service response:', data);
      
      return {
        success: true,
        messageId: data.message_id,
        userMessage: message,
        assistantResponse: data.response, // El backend devuelve 'response', no 'assistant_response'
        timestamp: data.timestamp,
        personalized: true,
        hasContext: true
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
      if (!this.token || !this.userId) {
        throw new Error('No hay autenticación disponible');
      }

      const response = await fetch(`${this.baseUrl}/api/chat/history/${this.userId}?limit=${limit}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Get history failed: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        messages: data.history || [],
        total: data.total_messages || 0
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
      if (!this.token || !this.userId) {
        throw new Error('No hay autenticación disponible');
      }

      // Este endpoint no existe en el chat service actual, 
      // podemos usar el health check para verificar conectividad
      const response = await fetch(`${this.baseUrl}/health`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Get context failed: ${response.status}`);
      }

      const data = await response.json();
      
      return {
        success: true,
        hasProfile: true, // Asumimos que si tenemos token, hay perfil
        hasPreferences: true,
        hasPortfolio: false, // Por ahora no manejamos portfolio
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
    return this.token !== null && this.userId !== null;
  }
}

// Singleton instance
const chatService = new ChatService();

export default chatService;
