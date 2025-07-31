// Quick test para debuggear el registro
export const debugRegister = async () => {
  try {
    console.log('🔍 Testing backend connection...');
    
    // Test 1: Verificar conectividad
    const testUrl = 'http://localhost:8080/api/auth/register';
    console.log('Testing URL:', testUrl);
    
    // Test 2: Enviar datos mínimos
    const testData = {
      email: `debug${Date.now()}@test.com`,
      password: 'test123',
      name: 'Debug User',
      acceptTerms: true
    };
    
    console.log('Sending data:', testData);
    
    const response = await fetch(testUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));
    
    const data = await response.json();
    console.log('Response data:', data);
    
    if (response.ok) {
      console.log('✅ Backend working correctly!');
      return data;
    } else {
      console.log('❌ Backend error:', data);
      throw new Error(data.message || 'Backend error');
    }
    
  } catch (error) {
    console.error('🚨 Debug error:', error);
    
    if (error.message.includes('Network request failed')) {
      console.log('💡 Solución: Verificar que el backend esté corriendo en localhost:8080');
    } else if (error.message.includes('JSON')) {
      console.log('💡 Solución: El backend no devuelve JSON válido');
    } else {
      console.log('💡 Error desconocido:', error.message);
    }
    
    throw error;
  }
};

// Para usar en la consola de React Native:
// import { debugRegister } from '@/controller/debugRegister';
// debugRegister();
