import urlWebServices from './webservices';

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

export const requestPasswordReset = async (email: string) => {
  let url = urlWebServices.requestPasswordReset;

  console.log('🔗 URL completa:', url);
  console.log('📧 Email a enviar:', email);
  console.log('🌐 Verificando conectividad al servidor...');

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
      console.log('✅ Servidor reachable, status:', connectivityCheck.status);
    } catch (connectivityError) {
      console.log('❌ Servidor no reachable:', connectivityError);
      throw new Error('No se puede conectar al servidor. Verifica que el servidor esté ejecutándose.');
    }

    // Crear un controlador AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout alcanzado, abortando solicitud');
      controller.abort();
    }, 10000); // 10 segundos de timeout (reducido para desarrollo)

    console.log('📡 Enviando solicitud POST...');
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

    console.log('📡 Status de respuesta:', response.status);
    console.log('📡 Headers de respuesta:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `Error HTTP: ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.log('❌ Datos de error del servidor:', errorData);
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        console.log('❌ No se pudo parsear la respuesta de error');
        // Intentar obtener el texto plano de la respuesta
        try {
          const errorText = await response.text();
          console.log('❌ Texto de error:', errorText);
        } catch (textError) {
          console.log('❌ No se pudo obtener el texto de error');
        }
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Datos de respuesta exitosa:', data);
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('❌ Error: Timeout - La solicitud tardó demasiado tiempo');
      throw new Error('La solicitud tardó demasiado tiempo. Verifica tu conexión a internet e inténtalo de nuevo.');
    }

    console.error('❌ Error en requestPasswordReset:', error);
    throw error;
  }
};

export const verifyResetCode = async (email: string, code: string) => {
  let url = urlWebServices.verifyResetCode;

  console.log('🔐 Verificando código de reset...');
  console.log('🔗 URL completa:', url);
  console.log('📧 Email:', email);
  console.log('🔢 Código:', code);

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
      console.log('✅ Servidor reachable, status:', connectivityCheck.status);
    } catch (connectivityError) {
      console.log('❌ Servidor no reachable:', connectivityError);
      throw new Error('No se puede conectar al servidor. Verifica que el servidor esté ejecutándose.');
    }

    // Crear un controlador AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout alcanzado, abortando solicitud de verificación');
      controller.abort();
    }, 10000); // 10 segundos de timeout

    console.log('📡 Enviando solicitud de verificación POST...');
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

    console.log('📡 Status de respuesta:', response.status);
    console.log('📡 Headers de respuesta:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `Error HTTP: ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.log('❌ Datos de error del servidor:', errorData);
        
        // Manejar errores específicos del backend
        if (errorData.error === 'INVALID_CODE') {
          errorMessage = 'El código es inválido o ha expirado. Solicita un nuevo código.';
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        console.log('❌ No se pudo parsear la respuesta de error');
        try {
          const errorText = await response.text();
          console.log('❌ Texto de error:', errorText);
        } catch (textError) {
          console.log('❌ No se pudo obtener el texto de error');
        }
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Código verificado exitosamente:', data);
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('❌ Error: Timeout - La verificación tardó demasiado tiempo');
      throw new Error('La verificación tardó demasiado tiempo. Verifica tu conexión a internet e inténtalo de nuevo.');
    }

    console.error('❌ Error en verifyResetCode:', error);
    throw error;
  }
};

export const resetPassword = async (email: string, code: string, newPassword: string) => {
  let url = urlWebServices.resetPassword;

  console.log('🔒 Cambiando contraseña...');
  console.log('🔗 URL completa:', url);
  console.log('📧 Email:', email);
  console.log('🔢 Código:', code);
  console.log('🔐 Nueva contraseña length:', newPassword.length);

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
      console.log('✅ Servidor reachable, status:', connectivityCheck.status);
    } catch (connectivityError) {
      console.log('❌ Servidor no reachable:', connectivityError);
      throw new Error('No se puede conectar al servidor. Verifica que el servidor esté ejecutándose.');
    }

    // Crear un controlador AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ Timeout alcanzado, abortando cambio de contraseña');
      controller.abort();
    }, 10000); // 10 segundos de timeout

    console.log('📡 Enviando solicitud de cambio de contraseña POST...');
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

    console.log('📡 Status de respuesta:', response.status);
    console.log('📡 Headers de respuesta:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      let errorMessage = `Error HTTP: ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        console.log('❌ Datos de error del servidor:', errorData);
        
        // Manejar errores específicos del backend
        if (errorData.error === 'INVALID_CODE') {
          errorMessage = 'El código es inválido o ha expirado. Solicita un nuevo código.';
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        console.log('❌ No se pudo parsear la respuesta de error');
        try {
          const errorText = await response.text();
          console.log('❌ Texto de error:', errorText);
        } catch (textError) {
          console.log('❌ No se pudo obtener el texto de error');
        }
      }

      throw new Error(errorMessage);
    }

    const data = await response.json();
    console.log('✅ Contraseña cambiada exitosamente:', data);
    return data;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('❌ Error: Timeout - El cambio de contraseña tardó demasiado tiempo');
      throw new Error('El cambio de contraseña tardó demasiado tiempo. Verifica tu conexión a internet e inténtalo de nuevo.');
    }

    console.error('❌ Error en resetPassword:', error);
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
      } catch (parseError) {
        // Si no se puede parsear como JSON, usar el mensaje de estado HTTP
        console.warn('No se pudo parsear respuesta de error como JSON');
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
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (parseError) {
        // Si no se puede parsear como JSON, usar el mensaje de estado HTTP
        console.warn('No se pudo parsear respuesta de error como JSON');
      }
      throw new Error(errorMessage);
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
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      // Manejo específico para error 429 (Too Many Requests)
      if (response.status === 429) {
        console.warn('⚠️ Rate limit alcanzado, reintentando en 2 segundos...');
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
      } catch (parseError) {
        // Si no se puede parsear como JSON, usar el mensaje de estado HTTP
        console.warn('No se pudo parsear respuesta de error como JSON');
      }
      throw new Error(errorMessage);
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
export const getFavoriteStocks = async (token: string) => {
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
    console.error('❌ Error eliminando stock de favoritos:', error);
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
    console.error('❌ Error eliminando sector de favoritos:', error);
    throw error;
  }
};

// 💬 CHAT SERVICE FUNCTIONS

/**
 * Verificar el estado del Chat Service
 */
export const checkChatHealth = async () => {
  const url = urlWebServices.chatHealth;
  
  console.log('🏥 Checking chat health at URL:', url);

  try {
    // Crear un controlador AbortController para timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ Chat health check timeout');
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
    
    console.log('🏥 Health check response status:', response.status);
    console.log('🏥 Health check response OK:', response.ok);
    
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('🏥 Health check data:', data);
    
    const result = {
      success: true,
      data: data,
      backendConnected: data.services?.main_backend === 'connected'
    };
    
    console.log('🏥 Health check result:', result);
    return result;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('❌ Chat health check timeout - Chat service may not be running');
      return { 
        success: false, 
        error: 'Chat service timeout - verifique que el servicio esté ejecutándose en http://192.168.1.58:8084' 
      };
    }
    
    console.error('❌ Health check error:', error);
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
      console.log('🔍 Error response:', errorText);
      throw new Error(`Token inválido: ${response.status}`);
    }

    const data = await response.json();
    
    console.log('✅ Usuario autenticado en chat service:', data.data.user.name);
    
    return {
      success: true,
      user: data.data.user,
      backendToken: token
    };
  } catch (error) {
    console.error('❌ Chat authentication error:', error);
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
  console.log('📡 sendChatMessage called with fallbackMode:', fallbackMode);
  
  // Si estamos en modo fallback, usar respuestas básicas
  if (fallbackMode) {
    console.log('🔄 Using fallback mode for chat response');
    
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
  
  console.log('📡 sendChatMessage called with:');
  console.log('🔗 URL:', url);
  console.log('🔐 Token length:', token.length);
  console.log('📝 Message:', message);
  console.log('👤 User ID:', userId);

  try {
    if (!token) {
      throw new Error('No hay token de backend disponible');
    }

    const requestBody = { 
      message: message,
      user_id: userId 
    };
    
    console.log('📦 Request body:', requestBody);

    // Agregar timeout al request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log('⏰ Send message timeout');
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

    console.log('📡 Response status:', response.status);
    console.log('📡 Response OK:', response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.log('❌ Error response text:', errorText);
      throw new Error(`Send message failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('🔍 Chat service response data:', data);
    
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
    
    console.log('✅ Returning result:', result);
    return result;
  } catch (error) {
    console.error('❌ Send message error:', error);
    
    // Si hay error de red o timeout, usar fallback automáticamente
    if (error instanceof Error && 
        (error.name === 'AbortError' || 
         error.message.includes('Network request failed') ||
         error.message.includes('fetch'))) {
      
      console.log('🔄 Switching to fallback mode due to network error');
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
      console.warn('⚠️ Chat Service no disponible, usando modo fallback');
      // En lugar de fallar, retornamos éxito pero con advertencia
      return { 
        success: true, 
        fallbackMode: true,
        warning: 'Chat Service externo no disponible, usando respuestas básicas' 
      };
    }

    console.log('✅ Chat Service inicializado');
    return { success: true, fallbackMode: false };
  } catch (error) {
    console.error('❌ Error inicializando chat service:', error);
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

