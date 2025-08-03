import urlWebServices from './webservices';

// 🔐 ENDPOINTS DE AUTENTICACIÓN

export const signUp = async userData => {
  let url = urlWebServices.signUp;

  try {
    // Si incluye avatar, usar FormData
    if (userData.avatar) {
      const formData = new FormData();
      formData.append('email', userData.email);
      formData.append('password', userData.password);
      formData.append('name', userData.name);
      formData.append('acceptTerms', userData.acceptTerms.toString());
      
      // Agregar avatar
      const imageUri = userData.avatar;
      const uriParts = imageUri.split('.');
      const fileType = uriParts[uriParts.length - 1];

      formData.append('avatar', {
        uri: imageUri,
        name: `avatar.${fileType}`,
        type: `image/${fileType}`,
      });

      let response = await fetch(url, {
        method: 'POST',
        headers: {
          // No incluir Content-Type para FormData - el browser lo agrega automáticamente
        },
        body: formData,
      });

      let data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro');
      }

      return data;
    } else {
      // Registro sin avatar - JSON normal
      let response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
          name: userData.name,
          acceptTerms: userData.acceptTerms
        }),
      });

      let data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error en el registro');
      }

      return data;
    }
  } catch (error) {
    throw error;
  }
};

export const signIn = async userData => {
  let url = urlWebServices.signIn;

  try {
    let response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
      }),
    });

    let data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Error en el login');
    }
    
    return data;
  } catch (error) {
    throw error;
  }
};

export const getProfile = async token => {
  let url = urlWebServices.getProfile;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateProfile = async (profileData, token) => {
  let url = urlWebServices.updateProfile;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error updating profile');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const uploadAvatar = async (imageUri, token) => {
  try {
    const url = urlWebServices.updateProfileImage; // Usando la URL de avatar

    const formData = new FormData();
    const uriParts = imageUri.split('.');
    const fileType = uriParts[uriParts.length - 1];

    formData.append('avatar', {
      uri: imageUri,
      name: `avatar.${fileType}`,
      type: `image/${fileType}`,
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        // No incluir Content-Type para FormData - el browser lo agrega automáticamente
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error uploading avatar');
    }

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    throw error;
  }
};

export const deleteAvatar = async token => {
  try {
    const url = urlWebServices.updateProfileImage; // Misma URL pero DELETE

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error deleting avatar');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

// 🎯 ENDPOINTS DE PREFERENCIAS

/**
 * Obtiene las preferencias del usuario
 * @param {string} token - JWT token del usuario
 * @returns {Promise} Preferencias del usuario
 */
export const getUserPreferences = async (token) => {
  const url = urlWebServices.getUserPreferences;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Actualiza todas las preferencias del usuario (PUT - reemplaza completamente)
 * @param {Object} preferences - Objeto con todas las preferencias
 * @param {string} token - JWT token del usuario
 * @returns {Promise} Preferencias actualizadas
 */
export const updateUserPreferences = async (preferences, token) => {
  const url = urlWebServices.updateUserPreferences;

  try {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(preferences),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error actualizando preferencias');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Actualiza parcialmente las preferencias del usuario (PATCH - solo campos específicos)
 * @param {Object} changes - Objeto con los campos a cambiar
 * @param {string} token - JWT token del usuario
 * @returns {Promise} Preferencias actualizadas
 */
export const patchUserPreferences = async (changes, token) => {
  const url = urlWebServices.patchUserPreferences;

  try {
    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(changes),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error actualizando preferencias parcialmente');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Agrega una acción a favoritos
 * @param {string} symbol - Símbolo de la acción (ej: "GGAL")
 * @param {string} token - JWT token del usuario
 * @returns {Promise} Resultado de la operación
 */
export const addToFavorites = async (symbol, token) => {
  const url = urlWebServices.addToFavorites;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ symbol }),
    });

    const data = await response.json();

    // Manejar caso especial: símbolo ya está en favoritos (409)
    if (response.status === 409) {
      return {
        alreadyExists: true,
        message: data.message,
        preferences: data.data.preferences
      };
    }

    if (!response.ok) {
      throw new Error(data.message || 'Error agregando a favoritos');
    }

    return {
      success: true,
      message: data.message,
      preferences: data.data.preferences,
      addedSymbol: data.data.addedSymbol
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Remueve una acción de favoritos
 * @param {string} symbol - Símbolo de la acción (ej: "GGAL")
 * @param {string} token - JWT token del usuario
 * @returns {Promise} Resultado de la operación
 */
export const removeFromFavorites = async (symbol, token) => {
  const url = `${urlWebServices.removeFromFavorites}${symbol}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error removiendo de favoritos');
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message,
      preferences: data.data.preferences,
      removedSymbol: data.data.removedSymbol
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene la lista de símbolos válidos del MERVAL (requiere autenticación)
 * @param {string} token - JWT token del usuario
 * @returns {Promise} Lista de símbolos válidos
 */
export const getValidSymbols = async (token?: string) => {
  const url = urlWebServices.getValidSymbols;

  try {
    const headers: any = {
      'Content-Type': 'application/json',
    };

    // Agregar token si está disponible
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error obteniendo símbolos válidos');
    }

    const data = await response.json();
    return {
      symbols: data.data.symbols,
      count: data.data.count,
      message: data.message
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene la lista de sectores usando el endpoint real (requiere autenticación)
 * @param {string} token - JWT token del usuario
 * @returns {Promise} Lista de sectores reales del backend
 */
export const getSectors = async (token: string) => {
  const url = urlWebServices.getSectors;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error obteniendo sectores');
    }

    const data = await response.json();
    return {
      sectors: data.data.sectors,
      count: data.data.count,
      message: data.message
    };
  } catch (error) {
    console.error('❌ Error en getSectors:', error);
    throw error;
  }
};

/**
 * Obtiene la lista completa de acciones usando el endpoint real (requiere autenticación)
 * @param {string} token - JWT token del usuario
 * @returns {Promise} Lista de acciones completas del backend
 */
export const getStocks = async (token: string) => {
  const url = urlWebServices.getStocks;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error obteniendo acciones');
    }

    const data = await response.json();
    return {
      stocks: data.data.stocks,
      count: data.data.count,
      message: data.message
    };
  } catch (error) {
    console.error('❌ Error en getStocks:', error);
    throw error;
  }
};

/**
 * Obtiene los favoritos del usuario (solo símbolos)
 * @param {string} token - JWT token del usuario
 * @returns {Promise} Lista de símbolos favoritos del usuario
 */
export const getUserFavorites = async (token: string) => {
  const url = urlWebServices.getUserFavorites;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Error obteniendo favoritos');
    }

    const data = await response.json();
    return {
      favorites: data.data.preferences || {},
      message: data.message
    };
  } catch (error) {
    console.error('❌ Error en getUserFavorites:', error);
    throw error;
  }
};

/**
 * Agrega una acción específica a favoritos
 * @param {string} symbol - Símbolo de la acción (ej: "GGAL")
 * @param {string} token - JWT token del usuario
 * @returns {Promise} Resultado de la operación
 */
export const addStockToFavorites = async (symbol: string, token: string) => {
  const url = urlWebServices.addStockToFavorites;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ symbol })
    });

    const data = await response.json();

    // Manejar caso especial: símbolo ya está en favoritos (409)
    if (response.status === 409) {
      return {
        alreadyExists: true,
        message: data.message,
        favorites: data.data.preferences?.favoriteStocks || []
      };
    }

    if (!response.ok) {
      throw new Error(data.message || 'Error agregando acción a favoritos');
    }

    return {
      success: true,
      message: data.message,
      favorites: data.data.preferences?.favoriteStocks || [],
      addedSymbol: symbol
    };
  } catch (error) {
    console.error('❌ Error en addStockToFavorites:', error);
    throw error;
  }
};

/**
 * Agrega todas las acciones de un sector a favoritos
 * @param {string} sectorName - Nombre del sector (ej: "Tecnología")
 * @param {string} token - JWT token del usuario
 * @returns {Promise} Resultado de la operación
 */
export const addSectorToFavorites = async (sectorName: string, token: string) => {
  const url = urlWebServices.addSectorToFavorites;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ sector: sectorName })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error agregando sector a favoritos');
    }

    return {
      success: true,
      message: data.message,
      favorites: data.data.preferences?.favoriteStocks || [],
      addedSector: sectorName,
      addedSymbols: data.data.addedSymbols || []
    };
  } catch (error) {
    console.error('❌ Error en addSectorToFavorites:', error);
    throw error;
  }
};

// 🚀 FUNCIONES DE UTILIDAD PARA PREFERENCIAS

/**
 * Actualiza solo el tema del usuario
 * @param {string} theme - "light", "dark" o "system"
 * @param {string} token - JWT token del usuario
 */
export const updateTheme = async (theme, token) => {
  return await patchUserPreferences({ theme }, token);
};

/**
 * Actualiza solo las notificaciones del usuario
 * @param {boolean} notifications - true o false
 * @param {string} token - JWT token del usuario
 */
export const updateNotifications = async (notifications, token) => {
  return await patchUserPreferences({ notifications }, token);
};

/**
 * Verifica si un símbolo está en favoritos
 * @param {string} symbol - Símbolo a verificar
 * @param {string} token - JWT token del usuario
 * @returns {Promise<boolean>} true si está en favoritos
 */
export const isSymbolInFavorites = async (symbol, token) => {
  try {
    const response = await getUserPreferences(token);
    const favoriteStocks = response.data.preferences.favoriteStocks || [];
    return favoriteStocks.includes(symbol);
  } catch (error) {
    console.error('Error verificando favoritos:', error);
    return false;
  }
};

/**
 * Obtiene solo la lista de favoritos del usuario
 * @param {string} token - JWT token del usuario
 * @returns {Promise<string[]>} Array de símbolos favoritos
 */
export const getFavoriteStocks = async (token) => {
  try {
    const response = await getUserPreferences(token);
    return response.data.preferences.favoriteStocks || [];
  } catch (error) {
    console.error('Error obteniendo favoritos:', error);
    return [];
  }
};

/**
 * Clase helper para manejar todas las operaciones de preferencias
 */
export class PreferencesAPI {
  constructor(getToken) {
    this.getToken = getToken;
  }

  async makeAuthenticatedRequest(apiFunction, ...args) {
    const token = await this.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    return apiFunction(...args, token);
  }

  // Métodos principales
  async getPreferences() {
    return this.makeAuthenticatedRequest(getUserPreferences);
  }

  async updatePreferences(preferences) {
    return this.makeAuthenticatedRequest(updateUserPreferences, preferences);
  }

  async patchPreferences(changes) {
    return this.makeAuthenticatedRequest(patchUserPreferences, changes);
  }

  async addFavorite(symbol) {
    return this.makeAuthenticatedRequest(addToFavorites, symbol);
  }

  async removeFavorite(symbol) {
    return this.makeAuthenticatedRequest(removeFromFavorites, symbol);
  }

  async updateTheme(theme) {
    return this.makeAuthenticatedRequest(updateTheme, theme);
  }

  async updateNotifications(notifications) {
    return this.makeAuthenticatedRequest(updateNotifications, notifications);
  }

  async getFavorites() {
    return this.makeAuthenticatedRequest(getFavoriteStocks);
  }

  async isInFavorites(symbol) {
    return this.makeAuthenticatedRequest(isSymbolInFavorites, symbol);
  }

  // Métodos sin autenticación
  async getValidSymbols() {
    const token = await this.getToken();
    return getValidSymbols(token);
  }

  async getSectors() {
    return this.makeAuthenticatedRequest(getSectors);
  }

  async getStocks() {
    return this.makeAuthenticatedRequest(getStocks);
  }
}

