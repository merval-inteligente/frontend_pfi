// ✅ API Gateway de AWS - Backend deployado
// ⚠️ ENTORNO DE LABORATORIO - Usando HTTP (no recomendado para producción)
// 
// ADVERTENCIA DE SEGURIDAD:
// - Las credenciales se envían sin encriptar (visible en herramientas de desarrollo)
// - Solo usar en entornos de desarrollo/laboratorio controlados
// - Para producción: configurar dominio propio + certificado SSL en AWS Certificate Manager
//
const AWS_API_GATEWAY = 'http://api-gateway-alb-1226808360.us-east-1.elb.amazonaws.com/';

// 🔧 URLs por servicio (todos apuntan al API Gateway)
const urlApi = AWS_API_GATEWAY; // General Service (Auth, Users, Preferences)
const chatApi = AWS_API_GATEWAY; // Chat Service (ruteado por API Gateway)
const alertsApi = AWS_API_GATEWAY; // Alerts Service (ruteado por API Gateway)

// 💡 Para desarrollo local, descomenta estas líneas:
 //const urlApi = 'http://192.168.0.17:8080/';
 //const chatApi = 'http://192.168.0.17:8084/';
 //const alertsApi = 'http://192.168.0.17:8000/';

const urlWebServices = {
  // URL Base para verificaciones de conectividad
  baseUrl: urlApi,
  
  // Auth & Users - ENDPOINTS IMPLEMENTADOS ✅
  signUp: urlApi + 'api/auth/register',
  signIn: urlApi + 'api/auth/login',
  getProfile: urlApi + 'api/auth/profile',
  updateProfile: urlApi + 'api/auth/profile',
  updateProfileImage: urlApi + 'api/auth/avatar',
  requestPasswordReset: urlApi + 'api/auth/request-password-reset',
  verifyResetCode: urlApi + 'api/auth/verify-reset-code',
  resetPassword: urlApi + 'api/auth/reset-password',
  
  // User Preferences - ENDPOINTS IMPLEMENTADOS ✅
  getUserPreferences: urlApi + 'api/user/preferences',
  updateUserPreferences: urlApi + 'api/user/preferences', // PUT
  patchUserPreferences: urlApi + 'api/user/preferences', // PATCH
  addToFavorites: urlApi + 'api/user/preferences/stocks/favorite',
  removeFromFavorites: urlApi + 'api/user/preferences/stocks/favorite/', // + symbol
  getValidSymbols: urlApi + 'api/user/preferences/stocks/symbols',
  
  // 🆕 Nuevos endpoints con sectores y stocks completos (requieren token)
  getSectors: urlApi + 'api/user/preferences/stocks/sectors',
  getStocks: urlApi + 'api/user/preferences/stocks/complete',
  
  // 🆕 Favoritos - manejo de preferencias del usuario
  getUserFavorites: urlApi + 'api/user/preferences', // GET - Ver favoritos (solo símbolos)
  addStockToFavorites: urlApi + 'api/user/preferences/stocks/favorite', // POST - Agregar 1 favorito
  addSectorToFavorites: urlApi + 'api/user/preferences/stocks/favorite/sector', // POST - Agregar sector completo
  
  // 🆕 Sentimiento de mercado basado en análisis de Twitter
  getSymbolsSentiment: urlApi + 'symbols-sentiment', // GET - Sentimiento de todos los símbolos
  
  // 🗑️ Eliminar favoritos
  removeFavoriteStock: urlApi + 'api/user/preferences/stocks/favorite', // DELETE /:symbol
  removeFavoriteSector: urlApi + 'api/user/preferences/stocks/favorite/sector', // DELETE + body {sector}
  
  // 📊 MERVAL Index - Precio en tiempo real
  getMervalPrice: urlApi + 'api/merval/price',
  getStockPrice: urlApi + 'api/merval/stock/', // + symbol (ej: YPF, GGAL, etc.)
  getStockTechnical: urlApi + 'api/merval/stock/', // + symbol/technical (RSI, SMA, soporte/resistencia)
  
  // 💬 Chat Service Endpoints
  chatHealth: chatApi + 'health',
  chatVerifyAuth: urlApi + 'api/auth/verify',
  chatSendMessage: chatApi + 'api/chat/message',
  chatGetHistory: chatApi + 'api/chat/history', // + /:userId?limit=50
  
  // 🔔 Alerts Endpoints
  getAlerts: alertsApi + 'alerts',
};

export default urlWebServices;
