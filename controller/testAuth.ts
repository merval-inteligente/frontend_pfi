// TEST para verificar el registro con el backend
import { signUp } from '@/controller/apiController';

export const testRegister = async () => {
  try {
    console.log('🧪 Probando registro sin avatar...');
    
    const userData = {
      email: `test${Date.now()}@merval.com`,
      password: 'password123',
      name: 'Usuario Test',
      acceptTerms: true
    };

    const response = await signUp(userData);
    
    console.log('✅ Registro exitoso:', {
      success: response.success,
      message: response.message,
      userId: response.data?.user?.id,
      token: response.data?.token ? 'Token presente' : 'Sin token',
      avatar: response.data?.avatar || 'Sin avatar'
    });

    return response;
  } catch (error) {
    console.error('❌ Error en registro:', error.message);
    throw error;
  }
};

// Ejemplo de uso:
// import { testRegister } from '@/controller/testAuth';
// testRegister().then(result => console.log('Test completado'));
