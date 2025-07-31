import { signUp } from './apiController';

const testRegister = async () => {
  try {
    console.log('Testing register with real backend...');
    
    const testData = {
      email: 'test' + Date.now() + '@example.com',
      password: 'password123',
      name: 'Test User',
      acceptTerms: true
    };
    
    console.log('Sending registration data:', testData);
    
    const response = await signUp(testData);
    
    console.log('Registration response:', response);
    
    return response;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export default testRegister;
