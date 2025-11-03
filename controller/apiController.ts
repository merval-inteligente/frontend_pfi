import urlWebServices from './webservices';

// 🔄 SISTEMA DE CACHE ROBUSTO
interface CacheEntry {
  data: any;
  timestamp: number;
  expiresIn: number;
}

const apiCache = new Map<string, CacheEntry>();
const CACHE_DURATION = {
  STOCKS: 30000,     // 30 segundos
  NEWS: 60000,       // 1 minuto  
  FAVORITES: 20000,  // 20 segundos
  PREFERENCES: 25000 // 25 segundos
};

// Función para obtener de cache
const getFromCache = (key: string): any | null => {
  const entry = apiCache.get(key);
  if (entry && Date.now() - entry.timestamp < entry.expiresIn) {
    return entry.data;
  }
  if (entry) {
    apiCache.delete(key); // Limpiar cache expirado
  }
  return null;
};

// Función para guardar en cache
const saveToCache = (key: string, data: any, duration: number): void => {
  apiCache.set(key, {
    data: data,
    timestamp: Date.now(),
    expiresIn: duration
  });
};

// Función para limpiar cache de usuario específico
const clearUserCache = (userId?: string): void => {
  const keysToDelete = Array.from(apiCache.keys()).filter(key => 
    !userId || key.includes(userId)
  );
  keysToDelete.forEach(key => apiCache.delete(key));
};

// Interfaces para tipos
interface RemoveFavoriteStockResponse {
  status: number;
  message: string;
  data: {
    preferences: {
      favoriteStocks: string[];
    };
    removedSymbol: string;
  };
}

interface RemoveFavoriteSectorResponse {
  status: number;
  message: string;
  data: {
    preferences: {
      favoriteStocks: string[];
      notifications: boolean;
      theme: string;
    };
    sector: string;
    removedSymbols: string[];
    totalRemoved: number;
    notFoundInFavorites: number;
  };
}

// 🔐 ENDPOINTS DE AUTENTICACIÓN

export const signUp = async (userData: any) => {
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
      } as any);

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
      const requestBody = {
        email: userData.email,
        password: userData.password,
        name: userData.name,
        acceptTerms: userData.acceptTerms,
        ...(userData.investmentKnowledge && { investmentKnowledge: userData.investmentKnowledge }),
        ...(userData.riskAppetite && { riskAppetite: userData.riskAppetite })
      };
      
      // Crear AbortController para timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
      
      let response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        const textResponse = await response.text();
        throw new Error('Error en la respuesta del servidor (no es JSON válido)');
      }

      if (!response.ok) {
        // Si hay errores de validación específicos, mostrar el primero
        if (data.errors && data.errors.length > 0) {
          const firstError = data.errors[0];
          throw new Error(firstError.message || data.message || 'Error en el registro');
        }
        
        throw new Error(data.message || 'Error en el registro');
      }

      return data;
    }
  } catch (error: any) {
    // Manejar timeout específicamente
    if (error.name === 'AbortError') {
      throw new Error('Timeout: No se pudo conectar con el servidor. Verifica tu conexión a internet.');
    }
    
    // Manejar errores de red
    if (error.message.includes('fetch')) {
      throw new Error('Error de conexión: No se pudo conectar con el servidor.');
    }
    
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

export const requestPasswordReset = async (email: string) => {
  let url = urlWebServices.requestPasswordReset;


  try {
    // Verificar conectividad básica primero
    try {
      const connectivityController = new AbortController();
      const connectivityTimeoutId = setTimeout(() => connectivityController.abort(), 8000); // Aumentado a 8 segundos

      const connectivityCheck = await fetch(urlWebServices.baseUrl, {
        method: 'HEAD',
        signal: connectivityController.signal
      });

      clearTimeout(connectivityTimeoutId);
    } catch (connectivityError) {
      throw new Error('No se puede conectar al servidor. Verifica que el servidor esté ejecutándose.');
    }

    // Crear un controlador AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000); // 10 segundos de timeout (reducido para desarrollo)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
      }),
      signal: controller.signal, // Agregar el signal para poder abortar
    });

    // Limpiar el timeout si la respuesta llegó a tiempo
    clearTimeout(timeoutId);


    if (!response.ok) {
      let errorMessage = `Error HTTP: ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        // Intentar obtener el texto plano de la respuesta
        try {
          const errorText = await response.text();
        } catch (textError) {
        }
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('La solicitud tardó demasiado tiempo. Verifica tu conexión a internet e inténtalo de nuevo.');
    }

    throw error;
  }
};

export const verifyResetCode = async (email: string, code: string) => {
  let url = urlWebServices.verifyResetCode;


  try {
    // Verificar conectividad básica primero
    try {
      const connectivityController = new AbortController();
      const connectivityTimeoutId = setTimeout(() => connectivityController.abort(), 8000);

      const connectivityCheck = await fetch(urlWebServices.baseUrl, {
        method: 'HEAD',
        signal: connectivityController.signal
      });

      clearTimeout(connectivityTimeoutId);
    } catch (connectivityError) {
      throw new Error('No se puede conectar al servidor. Verifica que el servidor esté ejecutándose.');
    }

    // Crear un controlador AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000); // 10 segundos de timeout

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        code: code,
      }),
      signal: controller.signal,
    });

    // Limpiar el timeout si la respuesta llegó a tiempo
    clearTimeout(timeoutId);


    if (!response.ok) {
      let errorMessage = `Error HTTP: ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        
        // Manejar errores específicos del backend
        if (errorData.error === 'INVALID_CODE') {
          errorMessage = 'El código es inválido o ha expirado. Solicita un nuevo código.';
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        try {
          const errorText = await response.text();
        } catch (textError) {
        }
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('La verificación tardó demasiado tiempo. Verifica tu conexión a internet e inténtalo de nuevo.');
    }

    throw error;
  }
};

export const resetPassword = async (email: string, code: string, newPassword: string) => {
  let url = urlWebServices.resetPassword;


  try {
    // Verificar conectividad básica primero
    try {
      const connectivityController = new AbortController();
      const connectivityTimeoutId = setTimeout(() => connectivityController.abort(), 8000);

      const connectivityCheck = await fetch(urlWebServices.baseUrl, {
        method: 'HEAD',
        signal: connectivityController.signal
      });

      clearTimeout(connectivityTimeoutId);
    } catch (connectivityError) {
      throw new Error('No se puede conectar al servidor. Verifica que el servidor esté ejecutándose.');
    }

    // Crear un controlador AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000); // 10 segundos de timeout

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        code: code,
        newPassword: newPassword,
      }),
      signal: controller.signal,
    });

    // Limpiar el timeout si la respuesta llegó a tiempo
    clearTimeout(timeoutId);


    if (!response.ok) {
      let errorMessage = `Error HTTP: ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        
        // Manejar errores específicos del backend
        if (errorData.error === 'INVALID_CODE') {
          errorMessage = 'El código es inválido o ha expirado. Solicita un nuevo código.';
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        try {
          const errorText = await response.text();
        } catch (textError) {
        }
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('El cambio de contraseña tardó demasiado tiempo. Verifica tu conexión a internet e inténtalo de nuevo.');
    }

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
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Si no se puede parsear como JSON, usar el mensaje de estado HTTP
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return {
      sectors: data.data.sectors,
      count: data.data.count,
      message: data.message
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene la lista completa de acciones usando el endpoint real (requiere autenticación)
 * @param {string} token - JWT token del usuario
 * @returns {Promise} Lista de acciones completas del backend
 */
export const getStocks = async (token: string) => {
  const cacheKey = `stocks_${token.substring(0, 10)}`;
  
  // Verificar cache primero
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const url = urlWebServices.getStocks;

  try {
    const response = await makeRequestWithRetry(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Si no se puede parsear como JSON, usar el mensaje de estado HTTP
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const result = {
      stocks: data.data.stocks,
      count: data.data.count,
      message: data.message
    };
    
    // Guardar en cache
    saveToCache(cacheKey, result, CACHE_DURATION.STOCKS);
    
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene el precio actual del índice MERVAL en tiempo real
 * @returns {Promise} Datos del índice MERVAL con precio actual
 */
export const getMervalPrice = async () => {
  const cacheKey = 'merval_price';
  
  // Cache muy corto para datos en tiempo real (30 segundos)
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const url = urlWebServices.getMervalPrice;

  try {
    const response = await makeRequestWithRetry(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      const result = {
        success: true,
        data: {
          index: data.data.index,
          name: data.data.name,
          price: data.data.price,
          previousClose: data.data.previousClose,
          change: data.data.change,
          changePercent: data.data.changePercent,
          volume: data.data.volume,
          high: data.data.high,
          low: data.data.low,
          currency: data.data.currency,
          date: data.data.date,
          timestamp: data.data.timestamp,
          source: data.data.source
        },
        message: data.message
      };
      
      // Guardar en cache por 30 segundos
      saveToCache(cacheKey, result, 30000);
      
      return result;
    } else {
      throw new Error(data.message || 'Error al obtener precio del MERVAL');
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener precio del MERVAL'
    };
  }
};

/**
 * Obtiene el precio actual de una acción específica del MERVAL
 * @param {string} symbol - Símbolo de la acción (ej: YPF, GGAL, ALUA)
 * @returns {Promise} Datos de la acción con precio actual
 */
export const getStockPrice = async (symbol: string) => {
  const cacheKey = `stock_price_${symbol}`;
  
  // Cache de 30 segundos para precios en tiempo real
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const url = `${urlWebServices.getStockPrice}${symbol}`;

  try {
    const response = await makeRequestWithRetry(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        // Ignorar error de parseo
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      const result = {
        success: true,
        data: {
          symbol: data.data.symbol,
          yahooSymbol: data.data.yahooSymbol,
          name: data.data.name,
          price: data.data.price,
          previousClose: data.data.previousClose,
          change: data.data.change,
          changePercent: data.data.changePercent,
          volume: data.data.volume,
          high: data.data.high,
          low: data.data.low,
          open: data.data.open,
          currency: data.data.currency,
          date: data.data.date,
          source: data.data.source
        },
        message: data.message
      };
      
      // Guardar en cache por 30 segundos
      saveToCache(cacheKey, result, 30000);
      
      return result;
    } else {
      throw new Error(data.message || 'Error al obtener precio de la acción');
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener precio de la acción'
    };
  }
};

/**
 * Obtiene el análisis técnico de una acción específica del MERVAL
 * @param {string} symbol - Símbolo de la acción (ej: YPF, GGAL, ALUA)
 * @returns {Promise} Análisis técnico con RSI, SMA, soportes y resistencias
 */
export const getStockTechnical = async (symbol: string) => {
  const cacheKey = `stock_technical_${symbol}`;
  
  // Cache de 5 minutos para análisis técnico (cambia menos que el precio)
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const url = `${urlWebServices.getStockTechnical}${symbol}/technical`;

  try {
    
    const response = await makeRequestWithRetry(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        // Ignorar error de parseo
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    if (data.success && data.data) {
      
      const result = {
        success: true,
        data: {
          symbol: data.data.symbol,
          name: data.data.name,
          currentPrice: data.data.currentPrice,
          movingAverages: {
            sma50: data.data.movingAverages?.sma50,
            sma200: data.data.movingAverages?.sma200,
            distanceToSMA50: data.data.movingAverages?.distanceToSMA50,
            distanceToSMA200: data.data.movingAverages?.distanceToSMA200
          },
          indicators: {
            rsi: data.data.indicators?.rsi,
            rsiSignal: data.data.indicators?.rsiSignal // OVERSOLD, NEUTRAL, OVERBOUGHT
          },
          signals: {
            sma50Signal: data.data.signals?.sma50Signal, // BULLISH, BEARISH, NEUTRAL
            sma200Signal: data.data.signals?.sma200Signal,
            rsiSignal: data.data.signals?.rsiSignal,
            goldenCross: data.data.signals?.goldenCross
          },
          support: {
            level1: data.data.support?.level1,
            level2: data.data.support?.level2
          },
          resistance: {
            level1: data.data.resistance?.level1,
            level2: data.data.resistance?.level2
          },
          timestamp: data.data.timestamp,
          source: data.data.source
        },
        message: data.message
      };
      
      // Guardar en cache por 5 minutos (300 segundos)
      saveToCache(cacheKey, result, 300000);
      
      return result;
    } else {
      throw new Error(data.message || 'Error al obtener análisis técnico');
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener análisis técnico'
    };
  }
};

/**
 * Obtiene los favoritos del usuario (solo símbolos)
 * @param {string} token - JWT token del usuario
 * @returns {Promise} Lista de símbolos favoritos del usuario
 */
export const getUserFavorites = async (token: string) => {
  const cacheKey = `favorites_${token.substring(0, 10)}`;
  
  // Verificar cache primero
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const url = urlWebServices.getUserFavorites;

  try {
    const response = await makeRequestWithRetry(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      // Manejo específico para error 429 (Too Many Requests)
      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Reintentar una vez
        const retryResponse = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (retryResponse.ok) {
          const retryData = await retryResponse.json();
          return {
            favorites: retryData.data.preferences || {},
            message: retryData.message
          };
        } else {
          throw new Error(`Rate limit persistente: ${retryResponse.status}`);
        }
      }
      
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch {
        // Si no se puede parsear como JSON, usar el mensaje de estado HTTP
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    const result = {
      favorites: data.data.preferences || {},
      message: data.message
    };
    
    // Guardar en cache
    saveToCache(cacheKey, result, CACHE_DURATION.FAVORITES);
    
    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * Obtiene las alertas del sistema
 * @returns {Promise} Lista de alertas activas
 */
export const getAlerts = async () => {
  const cacheKey = 'alerts_all';
  
  // Verificar cache primero
  const cachedData = getFromCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const url = urlWebServices.getAlerts;

  try {
    const response = await makeRequestWithRetry(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Transformar fechas de string a Date
    const alerts = data.map((alert: any) => ({
      ...alert,
      createdAt: new Date(alert.createdAt),
      lastTriggered: alert.lastTriggered ? new Date(alert.lastTriggered) : undefined,
    }));
    
    // Guardar en cache (30 segundos para alertas)
    saveToCache(cacheKey, alerts, 30000);
    
    return alerts;
  } catch (error) {
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
      // Manejar errores específicos
      if (response.status === 404) {
        throw new Error(`Usuario no encontrado o sector "${sectorName}" no existe`);
      } else if (response.status === 400) {
        // Si es error de validación, intentar extraer más información
        if (data.errors && data.errors.length > 0) {
          const errorMsg = data.errors[0].message || `Datos de entrada inválidos para el sector "${sectorName}"`;
          throw new Error(errorMsg);
        }
        throw new Error(`El sector "${sectorName}" no es válido. Verifica que esté en la lista de sectores disponibles.`);
      } else if (response.status === 401) {
        throw new Error('Token de autenticación inválido o expirado');
      } else if (response.status === 500) {
        throw new Error('Error interno del servidor. El usuario podría no estar completamente procesado aún.');
      }
      
      throw new Error(data.message || `Error agregando sector "${sectorName}" a favoritos`);
    }

    return {
      success: true,
      message: data.message,
      favorites: data.data.preferences?.favoriteStocks || [],
      addedSector: sectorName,
      addedSymbols: data.data.addedSymbols || []
    };
  } catch (error: any) {
    
    // Mejorar el mensaje de error para diferentes casos
    const errorMessage = error.message || 'Error desconocido';
    if (errorMessage.includes('fetch')) {
      throw new Error('Error de conexión con el servidor');
    } else if (errorMessage.includes('JSON')) {
      throw new Error('Error en la respuesta del servidor');
    }
    
    throw error;
  }
};

// 🚀 FUNCIONES DE UTILIDAD PARA PREFERENCIAS

/**
 * Actualiza solo el tema del usuario
 * @param {string} theme - "light", "dark" o "system"
 * @param {string} token - JWT token del usuario
 */
export const updateTheme = async (theme: string, token: string) => {
  return await patchUserPreferences({ theme }, token);
};

/**
 * Actualiza solo las notificaciones del usuario
 * @param {boolean} notifications - true o false
 * @param {string} token - JWT token del usuario
 */
export const updateNotifications = async (notifications: boolean, token: string) => {
  return await patchUserPreferences({ notifications }, token);
};

/**
 * Verifica si un símbolo está en favoritos
 * @param {string} symbol - Símbolo a verificar
 * @param {string} token - JWT token del usuario
 * @returns {Promise<boolean>} true si está en favoritos
 */
export const isSymbolInFavorites = async (symbol: string, token: string) => {
  try {
    const response = await getUserPreferences(token);
    const favoriteStocks = response.data.preferences.favoriteStocks || [];
    return favoriteStocks.includes(symbol);
  } catch {
    return false;
  }
};

/**
 * Obtiene solo la lista de favoritos del usuario
 * @param {string} token - JWT token del usuario
 * @returns {Promise<string[]>} Array de símbolos favoritos
 */
export const getFavoriteStocks = async (token: string) => {
  try {
    const response = await getUserPreferences(token);
    return response.data.preferences.favoriteStocks || [];
  } catch {
    return [];
  }
};

/**
 * Clase helper para manejar todas las operaciones de preferencias
 */
export class PreferencesAPI {
  private getToken: () => Promise<string | null>;

  constructor(getToken: () => Promise<string | null>) {
    this.getToken = getToken;
  }

  async makeAuthenticatedRequest(apiFunction: Function, ...args: any[]): Promise<any> {
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

  async updatePreferences(preferences: any) {
    return this.makeAuthenticatedRequest(updateUserPreferences, preferences);
  }

  async patchPreferences(changes: any) {
    return this.makeAuthenticatedRequest(patchUserPreferences, changes);
  }

  async addFavorite(symbol: string) {
    return this.makeAuthenticatedRequest(addToFavorites, symbol);
  }

  async removeFavorite(symbol: string) {
    return this.makeAuthenticatedRequest(removeFromFavorites, symbol);
  }

  async updateTheme(theme: string) {
    return this.makeAuthenticatedRequest(updateTheme, theme);
  }

  async updateNotifications(notifications: boolean) {
    return this.makeAuthenticatedRequest(updateNotifications, notifications);
  }

  async getFavorites() {
    return this.makeAuthenticatedRequest(getFavoriteStocks);
  }

  async isInFavorites(symbol: string) {
    return this.makeAuthenticatedRequest(isSymbolInFavorites, symbol);
  }

  // Métodos sin autenticación
  async getValidSymbols() {
    const token = await this.getToken();
    if (!token) {
      throw new Error('No hay token de autenticación');
    }
    return getValidSymbols(token);
  }

  async getSectors() {
    return this.makeAuthenticatedRequest(getSectors);
  }

  async getStocks() {
    return this.makeAuthenticatedRequest(getStocks);
  }
}

// 🗑️ ENDPOINTS DE ELIMINACIÓN DE FAVORITOS

export const removeFavoriteStock = async (token: string, symbol: string): Promise<RemoveFavoriteStockResponse> => {
  const url = `${urlWebServices.removeFavoriteStock}/${symbol}`;
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al eliminar stock de favoritos');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const removeFavoriteSector = async (token: string, sector: string): Promise<RemoveFavoriteSectorResponse> => {
  const url = urlWebServices.removeFavoriteSector;
  
  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ sector }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al eliminar sector de favoritos');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

// 💬 CHAT SERVICE FUNCTIONS

/**
 * Verificar el estado del Chat Service
 */
export const checkChatHealth = async () => {
  const url = urlWebServices.chatHealth;

  try {
    // Crear un controlador AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 5000); // 5 segundos de timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Limpiar el timeout si la respuesta llegó a tiempo
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    const data = await response.json();
    
    const result = {
      success: true,
      data: data,
      backendConnected: data.services?.main_backend === 'connected'
    };
    
    return result;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      return { 
        success: false, 
        error: 'Chat service timeout - verifique que el servicio esté ejecutándose en http://192.168.1.58:8084' 
      };
    }
    
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    
    if (errorMessage.includes('Network request failed') || errorMessage.includes('fetch')) {
      return { 
        success: false, 
        error: 'No se puede conectar al Chat Service. Verifique que esté ejecutándose en http://192.168.1.58:8084' 
      };
    }
    
    return { success: false, error: errorMessage };
  }
};

/**
 * Verificar token de autenticación en el backend principal
 */
export const verifyChatAuth = async (token: string) => {
  const url = urlWebServices.chatVerifyAuth;

  try {
    // Validar que el token sea un JWT válido
    if (!token || typeof token !== 'string') {
      throw new Error('Token inválido: no es una cadena');
    }

    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new Error('Token inválido: no tiene formato JWT (debe tener 3 partes)');
    }

    // Verificar que cada parte sea base64 válida
    try {
      atob(parts[0]); // header
      atob(parts[1]); // payload
    } catch {
      throw new Error('Token inválido: no es base64 válido');
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token.trim()}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Token inválido: ${response.status}`);
    }

    const data = await response.json();
    
    return {
      success: true,
      user: data.data.user,
      backendToken: token
    };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Error de autenticación desconocido' };
  }
};

// Interfaz para respuesta de chat
interface ChatResponse {
  success: boolean;
  messageId?: string;
  userMessage?: string;
  assistantResponse?: string;
  timestamp?: string;
  personalized?: boolean;
  hasContext?: boolean;
  fallbackMode?: boolean;
  error?: string;
}

/**
 * Enviar mensaje al Chat Service con fallback
 */
export const sendChatMessage = async (token: string, message: string, userId: string, fallbackMode: boolean = false): Promise<ChatResponse> => {
  // Si estamos en modo fallback, usar respuestas básicas
  if (fallbackMode) {
    // Simular un pequeño delay para parecer más natural
    await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1000));
    
    const fallbackResponse = getChatFallbackResponse(message);
    
    return {
      success: true,
      messageId: 'fallback_' + Date.now(),
      userMessage: message,
      assistantResponse: fallbackResponse,
      timestamp: new Date().toISOString(),
      personalized: false,
      hasContext: false,
      fallbackMode: true
    };
  }

  // Intentar usar el Chat Service externo
  const url = urlWebServices.chatSendMessage;

  try {
    if (!token) {
      throw new Error('No hay token de backend disponible');
    }

    const requestBody = { 
      message: message,
      user_id: userId 
    };

    // Agregar timeout al request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 10000); // 10 segundos de timeout

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Send message failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    const result = {
      success: true,
      messageId: data.message_id,
      userMessage: message,
      assistantResponse: data.response, // El backend devuelve 'response', no 'assistant_response'
      timestamp: data.timestamp,
      personalized: true,
      hasContext: true,
      fallbackMode: false
    };
    
    return result;
  } catch (error) {
    // Si hay error de red o timeout, usar fallback automáticamente
    if (error instanceof Error && 
        (error.name === 'AbortError' || 
         error.message.includes('Network request failed') ||
         error.message.includes('fetch'))) {
      
      return await sendChatMessage(token, message, userId, true);
    }
    
    return { success: false, error: error instanceof Error ? error.message : 'Error al enviar mensaje' };
  }
};

/**
 * Obtener historial de chat
 */
export const getChatHistory = async (token: string, userId: string, limit: number = 50) => {
  const url = `${urlWebServices.chatGetHistory}/${userId}?limit=${limit}`;

  try {
    if (!token || !userId) {
      throw new Error('No hay autenticación disponible');
    }

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    // Si es 404, significa que el usuario no tiene historial (usuario nuevo)
    if (response.status === 404) {
      return {
        success: true,
        messages: [],
        total: 0,
        isNewUser: true
      };
    }

    if (!response.ok) {
      throw new Error(`Get history failed: ${response.status}`);
    }

    const data = await response.json();
    
    const result = {
      success: true,
      messages: data.messages || data.history || [], // El backend devuelve 'messages', no 'history'
      total: data.total_messages || data.messages?.length || 0,
      isNewUser: false
    };
    return result;
  } catch (error) {
    // Si es un error de red o 404, tratarlo como usuario nuevo
    if (error instanceof Error && (error.message.includes('404') || error.message.includes('Not Found'))) {
      return {
        success: true,
        messages: [],
        total: 0,
        isNewUser: true
      };
    }
    return { success: false, error: error instanceof Error ? error.message : 'Error al obtener historial' };
  }
};

/**
 * Inicializar Chat Service con validaciones y fallback
 */
export const initializeChatService = async (userToken: string) => {
  try {
    // Verificar que el chat service esté disponible
    const healthCheck = await checkChatHealth();
    if (!healthCheck.success) {
      // En lugar de fallar, retornamos éxito pero con advertencia
      return { 
        success: true, 
        fallbackMode: true,
        warning: 'Chat Service externo no disponible, usando respuestas básicas' 
      };
    }

    return { success: true, fallbackMode: false };
  } catch {
    // Usar modo fallback en caso de error
    return { 
      success: true, 
      fallbackMode: true,
      warning: 'Error al conectar con Chat Service, usando modo básico'
    };
  }
};

/**
 * Respuesta de fallback para el chat cuando el servicio externo no está disponible
 */
const getChatFallbackResponse = (message: string): string => {
  const lowerMessage = message.toLowerCase();
  
  // Respuestas básicas basadas en palabras clave
  if (lowerMessage.includes('hola') || lowerMessage.includes('holi')) {
    return '¡Hola! 👋 Soy tu asistente financiero. Te ayudo con consultas sobre el mercado argentino. ¿En qué puedo ayudarte?';
  }
  
  if (lowerMessage.includes('merval')) {
    return 'El MERVAL es el índice principal de la Bolsa de Comercio de Buenos Aires. Representa el valor de las acciones más importantes del mercado argentino.';
  }
  
  if (lowerMessage.includes('accion') || lowerMessage.includes('acciones')) {
    return 'Las acciones son instrumentos de inversión que representan una parte de la propiedad de una empresa. En Argentina, las más populares incluyen Galicia, Tenaris, YPF, entre otras.';
  }
  
  if (lowerMessage.includes('dolar') || lowerMessage.includes('dólar')) {
    return 'En Argentina existen diferentes tipos de dólar: oficial, blue, MEP, CCL. Cada uno tiene cotizaciones diferentes según el mercado y regulaciones.';
  }
  
  if (lowerMessage.includes('invertir') || lowerMessage.includes('inversion')) {
    return 'Para invertir en Argentina puedes considerar: acciones del MERVAL, bonos soberanos, FCI, plazos fijos UVA, o instrumentos en dólares. Siempre consulta con un asesor financiero.';
  }
  
  // Respuesta genérica
  return 'Soy tu asistente financiero para el mercado argentino. Puedo ayudarte con consultas sobre el MERVAL, acciones, bonos, dólar y estrategias de inversión. ¿Qué te gustaría saber?';
};

// 📰 ENDPOINTS DE NOTICIAS MERVAL

/**
 * Helper para manejar rate limiting con reintentos y mejor logging
 */
const makeRequestWithRetry = async (url: string, options: RequestInit, maxRetries: number = 1): Promise<Response> => {
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      // Agregar delay progresivo entre intentos - más conservador
      if (attempt > 1) {
        const delay = Math.min(3000 * Math.pow(2, attempt - 2), 15000); // Exponential backoff, máx 15s
        await new Promise(resolve => setTimeout(resolve, delay));
      }

      const response = await fetch(url, options);
      
      // Si es rate limit (429), esperar más tiempo antes de reintentar
      if (response.status === 429 && attempt <= maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 10000)); // Esperar 10 segundos
        continue;
      }
      
      return response;
    } catch (error) {
      if (attempt === maxRetries + 1) {
        throw error;
      }
    }
  }
  
  throw new Error('Max reintentos alcanzado');
};

/**
 * Listar todas las noticias con paginación y manejo de rate limiting
 */
export const getNews = async (token: string, page: number = 1, limit: number = 20, sortBy: string = 'fecha_scrapeo', sortOrder: string = 'desc') => {
  const url = `${urlWebServices.baseUrl}api/news?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`;

  try {
    if (!token) {
      throw new Error('Token de autenticación requerido');
    }

    const response = await makeRequestWithRetry(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Rate limit persistente: 429');
      }
      
      throw new Error(`Error al obtener noticias: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data,
      message: data.message
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error al obtener noticias'
    };
  }
};

/**
 * Buscar noticias por texto
 */
export const searchNews = async (token: string, searchTerm: string, page: number = 1, limit: number = 20) => {
  const url = `${urlWebServices.baseUrl}api/news/search?q=${encodeURIComponent(searchTerm)}&page=${page}&limit=${limit}`;

  try {
    if (!token) {
      throw new Error('Token de autenticación requerido');
    }

    if (!searchTerm.trim()) {
      throw new Error('Término de búsqueda requerido');
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error en búsqueda de noticias: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data,
      message: data.message
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error en búsqueda de noticias'
    };
  }
};

/**
 * Búsqueda avanzada de noticias
 */
export const advancedSearchNews = async (
  token: string,
  filters: {
    q?: string;
    company?: string;
    dateFrom?: string;
    dateTo?: string;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
  } = {}
) => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, value.toString());
    }
  });

  const url = `${urlWebServices.baseUrl}api/news/advanced-search?${params.toString()}`;

  try {
    if (!token) {
      throw new Error('Token de autenticación requerido');
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error en búsqueda avanzada: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data,
      message: data.message
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error en búsqueda avanzada'
    };
  }
};

/**
 * Obtener noticias por empresa MERVAL
 */
export const getNewsByCompany = async (token: string, company: string, page: number = 1, limit: number = 20) => {
  const url = `${urlWebServices.baseUrl}api/news/company/${encodeURIComponent(company)}?page=${page}&limit=${limit}`;

  try {
    if (!token) {
      throw new Error('Token de autenticación requerido');
    }

    if (!company.trim()) {
      throw new Error('Nombre de empresa requerido');
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error obteniendo noticias de ${company}: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data,
      message: data.message
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : `Error obteniendo noticias de ${company}`
    };
  }
};

/**
 * Obtener empresas MERVAL disponibles
 */
export const getAvailableCompanies = async (token: string) => {
  const url = `${urlWebServices.baseUrl}api/news/companies`;

  try {
    if (!token) {
      throw new Error('Token de autenticación requerido');
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Error obteniendo empresas: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data,
      message: data.message
    };
  } catch (error) {
    console.error('❌ Error obteniendo empresas:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error obteniendo empresas'
    };
  }
};

/**
 * Obtener noticia específica por ID
 */
export const getNewsById = async (token: string, newsId: string) => {
  const url = `${urlWebServices.baseUrl}api/news/${newsId}`;

  try {
    if (!token) {
      throw new Error('Token de autenticación requerido');
    }

    if (!newsId.trim()) {
      throw new Error('ID de noticia requerido');
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error('Noticia no encontrada');
      }
      throw new Error(`Error obteniendo noticia: ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data,
      message: data.message
    };
  } catch (error) {
    console.error('❌ Error obteniendo noticia:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Error obteniendo noticia'
    };
  }
};

// 🧪 FUNCIÓN DE TEST TEMPORAL - REMOVER EN PRODUCCIÓN
export const testNewsEndpoint = async () => {
  const testToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY4YjYxMjJiOTc5MThjZTIxYzVlZmQxZiIsImVtYWlsIjoibmljb2xhc3BldGNvZmZAZ21haWwuY29tIiwiaWF0IjoxNzU2NzczNjY4LCJleHAiOjE3NTczNzg0Njh9.zJFKytB9P-Fkl3QaU9R8jNHeACivyZp1GLhS4G3xIWw';
  
  
  // Test 1: Verificar conectividad del backend
  try {
    const baseResponse = await fetch(urlWebServices.baseUrl, {
      method: 'GET'
    });
  } catch (error) {
    console.error('❌ Backend no disponible:', error);
    return;
  }

  // Test 2: Probar endpoint de noticias
  const newsUrl = `${urlWebServices.baseUrl}api/news?page=1&limit=5`;
  
  
  try {
    const response = await fetch(newsUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Content-Type': 'application/json'
      }
    });

    

    if (response.ok) {
      const data = await response.json();
     
      if (data.data?.news && data.data.news.length > 0) {
        console.log('📝 Primera noticia:', {
          titulo: data.data.news[0].titulo,
          fecha: data.data.news[0].fecha_scrapeo,
          empresas: data.data.news[0].empresas_merval
        });
      }
    } else {
      const errorText = await response.text();
      console.error('❌ Error Response Body:', errorText);
      
      // Test 3: Verificar endpoint alternativo
      if (response.status === 404) {
        
        const alternativeUrls = [
          `${urlWebServices.baseUrl}news`,
          `${urlWebServices.baseUrl}api/noticias`,
          `${urlWebServices.baseUrl}noticias`
        ];
        
        for (const altUrl of alternativeUrls) {
          try {
           
            const altResponse = await fetch(altUrl, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${testToken}`,
                'Content-Type': 'application/json'
              }
            });
            
            if (altResponse.ok) {
              
              break;
            }
          } catch (altError) {
            console.log(`❌ ${altUrl} - Error:`, altError);
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Error en test de noticias:', error);
  }
  
  
};

