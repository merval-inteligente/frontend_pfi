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
};

export default urlWebServices;
