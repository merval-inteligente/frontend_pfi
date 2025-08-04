const urlApi = 'http://192.168.0.17:8080/'; // Para desarrollo con IP local
//const urlApi = 'http://localhost:8080/'; // Para desarrollo (no funciona en React Native)
//const urlApi = 'http://10.0.2.2:8080/'; // Para Android Emulator
// const urlApi = "http://[TU_IP_LOCAL]:8080/";  // Para dispositivos reales o iOS

const urlWebServices = {
  // Auth & Users - ENDPOINTS IMPLEMENTADOS ✅
  signUp: urlApi + 'api/auth/register',
  signIn: urlApi + 'api/auth/login',
  getProfile: urlApi + 'api/auth/profile',
  updateProfile: urlApi + 'api/auth/profile',
  updateProfileImage: urlApi + 'api/auth/avatar',
  
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
  
  // 🗑️ Eliminar favoritos
  removeFavoriteStock: urlApi + 'api/user/preferences/stocks/favorite', // DELETE /:symbol
  removeFavoriteSector: urlApi + 'api/user/preferences/stocks/favorite/sector', // DELETE + body {sector}
};

export default urlWebServices;
