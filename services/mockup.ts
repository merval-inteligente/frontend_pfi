// Centralized Mockup Data Service
// Este archivo contiene todos los datos de prueba de la aplicación
// Para reemplazar por un backend funcional, simplemente modifica las funciones de servicio

// Importar interfaces básicas desde mockData para evitar duplicación
import { User } from './mockData';

export interface PersonalInfo {
  name: string;
  email: string;
  document: string;
  avatar: string;
  investmentKnowledge?: string;
  riskAppetite?: string;
}

export interface SecuritySettings {
  biometricAuth: boolean;
  twoFactorAuth: boolean;
  loginNotifications: boolean;
  sessionTimeout: string;
}

export interface AlertSettings {
  priceAlerts: boolean;
  newsAlerts: boolean;
  marketSummary: boolean;
  pushNotifications: boolean;
  emailNotifications: boolean;
  smsNotifications: boolean;
  weeklyReport: boolean;
  monthlyReport: boolean;
  volumeAlerts: boolean;
  volatilityAlerts: boolean;
  dividendAlerts: boolean;
  marketCloseAlerts: boolean;
}

export interface TimeSettings {
  marketOpen: string;
  marketClose: string;
  quietHours: {
    enabled: boolean;
    start: string;
    end: string;
  };
}

export interface InvestmentStrategy {
  riskProfile: string;
  investmentHorizon: string;
  monthlyBudget: string;
  preferredSectors: string[];
  investmentGoals: string[];
  experienceLevel: string;
  diversificationLevel: string;
  maxLossPercentage: string;
}

export interface SectorItem {
  name: string;
  isSelected: boolean;
  count: number;
}

export interface StockItem {
  symbol: string;
  name: string;
  sector: string;
  isSelected: boolean;
}

export interface UserPreferences {
  investmentKnowledge: string;
  riskAppetite: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  tags: string[];
}

export interface ContactInfo {
  email: string;
  whatsapp: string;
  supportEmail: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  type: 'price' | 'news' | 'portfolio';
  enabled: boolean;
  icon: string;
}

export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export interface MervalStock {
  id: string;
  name: string;
  symbol: string;
  sector: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  isFavorite: boolean;
}

// =============================================================================
// MOCK DATA DEFINITIONS
// =============================================================================

// Información personal por defecto
export const mockPersonalInfo: PersonalInfo = {
  name: 'Juan Pérez',
  email: 'juan.perez@email.com',
  phone: '+54 11 1234-5678',
  birthDate: '15/03/1990',
  occupation: 'Analista Financiero',
  address: 'Av. Corrientes 1234, CABA',
  document: '12.345.678',
  nationality: 'Argentina',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'
};

// Configuración de seguridad por defecto
export const mockSecuritySettings: SecuritySettings = {
  biometricAuth: true,
  twoFactorAuth: false,
  loginNotifications: true,
  sessionTimeout: '30 minutos'
};

// Configuración de alertas por defecto
export const mockAlertSettings: AlertSettings = {
  priceAlerts: true,
  newsAlerts: true,
  marketSummary: false,
  pushNotifications: true,
  emailNotifications: false,
  smsNotifications: false,
  weeklyReport: true,
  monthlyReport: false,
  volumeAlerts: false,
  volatilityAlerts: true,
  dividendAlerts: true,
  marketCloseAlerts: false
};

// Configuración de horarios por defecto
export const mockTimeSettings: TimeSettings = {
  marketOpen: '09:00',
  marketClose: '17:00',
  quietHours: {
    enabled: true,
    start: '22:00',
    end: '08:00'
  }
};

// Estrategia de inversión por defecto
export const mockInvestmentStrategy: InvestmentStrategy = {
  riskProfile: 'Moderado',
  investmentHorizon: '3-5 años',
  monthlyBudget: '$50,000',
  preferredSectors: ['Tecnología', 'Finanzas'],
  investmentGoals: ['Crecimiento a largo plazo'],
  experienceLevel: 'Intermedio',
  diversificationLevel: 'Moderada',
  maxLossPercentage: '10%'
};

// Perfiles de riesgo disponibles
export const getRiskProfiles = (colors: any) => [
  {
    key: 'Conservador',
    title: 'Conservador',
    description: 'Prefiero inversiones seguras con retornos estables',
    icon: 'shield-outline',
    color: colors.success
  },
  {
    key: 'Moderado',
    title: 'Moderado',
    description: 'Busco equilibrio entre riesgo y retorno',
    icon: 'trending-up-outline',
    color: colors.tint
  },
  {
    key: 'Agresivo',
    title: 'Agresivo',
    description: 'Busco altos retornos y acepto mayor riesgo',
    icon: 'flash-outline',
    color: colors.warning
  }
];

// Horizontes de inversión disponibles
export const investmentHorizons = [
  'Corto plazo (< 1 año)',
  '1-3 años',
  '3-5 años',
  '5-10 años',
  'Largo plazo (> 10 años)'
];

// Sectores disponibles
export const availableSectors = [
  'Tecnología', 'Finanzas', 'Energía', 'Salud', 'Materiales',
  'Consumo', 'Telecomunicaciones', 'Utilities', 'Real Estate'
];

// Objetivos de inversión disponibles
export const investmentGoals = [
  'Crecimiento a largo plazo',
  'Ingresos por dividendos',
  'Preservación de capital',
  'Jubilación',
  'Compra de vivienda',
  'Educación'
];

// Niveles de experiencia disponibles
export const experienceLevels = ['Principiante', 'Intermedio', 'Avanzado', 'Experto'];

// Niveles de diversificación disponibles
export const diversificationLevels = ['Baja', 'Moderada', 'Alta'];

// Sectores para preferencias
export const mockSectors: SectorItem[] = [
  { name: 'Tecnología', isSelected: true, count: 12 },
  { name: 'Finanzas', isSelected: true, count: 8 },
  { name: 'Energía', isSelected: false, count: 15 },
  { name: 'Salud', isSelected: false, count: 6 },
  { name: 'Materiales', isSelected: false, count: 10 },
  { name: 'Consumo', isSelected: false, count: 14 },
  { name: 'Utilities', isSelected: false, count: 5 }
];

// Acciones para preferencias
export const mockStockPreferences: StockItem[] = [
  { symbol: 'YPFD', name: 'YPF S.A.', sector: 'Energía', isSelected: true },
  { symbol: 'BMA', name: 'Banco Macro S.A.', sector: 'Finanzas', isSelected: true },
  { symbol: 'TXAR', name: 'Ternium Argentina S.A.', sector: 'Materiales', isSelected: true },
  { symbol: 'GGAL', name: 'Grupo Galicia', sector: 'Finanzas', isSelected: false },
  { symbol: 'SUPV', name: 'Grupo Supervielle S.A.', sector: 'Finanzas', isSelected: false },
  { symbol: 'PAMP', name: 'Pampa Energía S.A.', sector: 'Energía', isSelected: false },
  { symbol: 'TS', name: 'Tenaris S.A.', sector: 'Materiales', isSelected: false },
  { symbol: 'MIRG', name: 'Mirgor S.A.C.I.F.I.A.', sector: 'Tecnología', isSelected: false },
  { symbol: 'ALUA', name: 'Aluar Aluminio Argentino S.A.I.C.', sector: 'Materiales', isSelected: false },
  { symbol: 'TECO2', name: 'Telecom Argentina S.A.', sector: 'Telecomunicaciones', isSelected: false },
  { symbol: 'CEPU', name: 'Central Puerto S.A.', sector: 'Energía', isSelected: false },
  { symbol: 'CRES', name: 'Cresud S.A.C.I.F. y A.', sector: 'Real Estate', isSelected: false }
];

// Preferencias del usuario
export const mockUserPreferences: UserPreferences = {
  investmentKnowledge: 'Intermedio',
  riskAppetite: 'Moderado'
};

// Información de contacto
export const mockContactInfo: ContactInfo = {
  email: 'soporte@mervalguide.com',
  whatsapp: '5491123456789',
  supportEmail: 'soporte@mervalguide.com'
};

// Alertas del usuario
export const mockAlerts: Alert[] = [
  {
    id: '1',
    title: 'YPF sube más del 5%',
    description: 'Notificar cuando YPF tenga una variación positiva mayor al 5%',
    type: 'price',
    enabled: true,
    icon: 'trending-up',
  },
  {
    id: '2',
    title: 'MERVAL alcanza nuevo máximo',
    description: 'Alerta cuando el índice MERVAL supere su máximo histórico',
    type: 'news',
    enabled: true,
    icon: 'stats-chart',
  },
  {
    id: '3',
    title: 'Banco Galicia reporta ganancias',
    description: 'Notificar sobre reportes trimestrales de GGAL',
    type: 'news',
    enabled: false,
    icon: 'document-text',
  },
  {
    id: '4',
    title: 'Cartera pierde más del 3%',
    description: 'Alerta cuando mi cartera total baje más del 3% en el día',
    type: 'portfolio',
    enabled: true,
    icon: 'warning',
  },
  {
    id: '5',
    title: 'Telecom Argentina - Dividendos',
    description: 'Recordatorio sobre fechas de pago de dividendos de TS',
    type: 'news',
    enabled: true,
    icon: 'cash',
  },
];

// Respuestas automáticas del bot de chat
export const mockBotResponses = [
  "¡Excelente pregunta! El índice MERVAL es el principal indicador bursátil de Argentina, compuesto por las acciones más líquidas del mercado.",
  "Para invertir en acciones argentinas necesitas abrir una cuenta en un broker autorizado por la CNV, como InvertirOnline, Balanz o PPI.",
  "Las acciones más populares suelen ser YPF, Banco Galicia (GGAL), Tenaris (TS), y Pampa Energía (PAMP).",
  "El análisis técnico utiliza gráficos e indicadores para predecir movimientos de precios. Es complementario al análisis fundamental.",
  "Los dividendos son pagos que hacen las empresas a sus accionistas. No todas las compañías los distribuyen.",
  "Es importante diversificar tu cartera entre diferentes sectores y activos para reducir el riesgo.",
  "El mercado argentino opera de lunes a viernes de 11:00 a 17:00 horas.",
  "Recuerda que invertir en bolsa implica riesgos. Nunca inviertas dinero que no puedas permitirte perder.",
  "Te recomiendo empezar con montos pequeños mientras aprendes sobre el mercado.",
  "¿Te gustaría que te explique algún concepto específico del mercado de valores?"
];

// Palabras clave para respuestas específicas
export const mockKeywordResponses: { [key: string]: string } = {
  'merval': 'El MERVAL es el índice líder de la Bolsa de Comercio de Buenos Aires. Incluye las acciones más negociadas y representa el 80% del volumen de operaciones.',
  'ypf': 'YPF (Yacimientos Petrolíferos Fiscales) es la principal empresa petrolera argentina. Su acción es una de las más negociadas en el MERVAL.',
  'galicia': 'Banco Galicia (GGAL) es uno de los bancos privados más grandes de Argentina. Sus acciones son muy líquidas en el mercado.',
  'tenaris': 'Tenaris (TS) es una empresa global líder en tubos de acero para la industria energética. Tiene fuerte presencia internacional.',
  'dividendos': 'Los dividendos son distribuciones de ganancias que las empresas pagan a sus accionistas. Se anuncian en las asambleas anuales.',
  'broker': 'Un broker es un intermediario autorizado para operar en bolsa. En Argentina debe estar registrado en la CNV (Comisión Nacional de Valores).',
  'riesgo': 'Todo inversión conlleva riesgo. Es importante diversificar, no invertir más de lo que puedes permitirte perder, y educarse constantemente.',
  'análisis': 'Existen dos tipos principales: análisis fundamental (estudia la empresa) y técnico (estudia gráficos de precios).',
  'horarios': 'La Bolsa de Buenos Aires opera de lunes a viernes de 11:00 a 17:00 horas, hora local argentina.'
};

// Acciones del MERVAL
export const mockMervalStocks: MervalStock[] = [
  { id: '1', name: 'YPF S.A.', symbol: 'YPFD', sector: 'Energía', price: 5250, change: 150, changePercent: 2.94, volume: 1250000, isFavorite: false },
  { id: '2', name: 'Banco Macro S.A.', symbol: 'BMA', sector: 'Finanzas', price: 3200, change: -80, changePercent: -2.44, volume: 890000, isFavorite: true },
  { id: '3', name: 'Telecom Argentina S.A.', symbol: 'TECO2', sector: 'Telecomunicaciones', price: 1450, change: 45, changePercent: 3.20, volume: 650000, isFavorite: false },
  { id: '4', name: 'Grupo Galicia', symbol: 'GGAL', sector: 'Finanzas', price: 2890, change: 120, changePercent: 4.33, volume: 1100000, isFavorite: true },
  { id: '5', name: 'Pampa Energía S.A.', symbol: 'PAMP', sector: 'Energía', price: 4150, change: -65, changePercent: -1.54, volume: 430000, isFavorite: false },
  { id: '6', name: 'Tenaris S.A.', symbol: 'TS', sector: 'Materiales', price: 6780, change: 220, changePercent: 3.35, volume: 780000, isFavorite: false },
  { id: '7', name: 'Arcor S.A.I.C.', symbol: 'ARCOR', sector: 'Alimentos', price: 1890, change: 35, changePercent: 1.89, volume: 320000, isFavorite: false },
  { id: '8', name: 'Mercado Libre Inc.', symbol: 'MELI', sector: 'Tecnología', price: 125000, change: 2500, changePercent: 2.04, volume: 95000, isFavorite: true },
  { id: '9', name: 'Globant S.A.', symbol: 'GLOB', sector: 'Tecnología', price: 15600, change: -320, changePercent: -2.01, volume: 180000, isFavorite: false },
  { id: '10', name: 'Cencosud S.A.', symbol: 'CNCO', sector: 'Retail', price: 890, change: 15, changePercent: 1.71, volume: 560000, isFavorite: false },
  { id: '11', name: 'Aluar Aluminio Argentino', symbol: 'ALUA', sector: 'Materiales', price: 2340, change: -45, changePercent: -1.89, volume: 440000, isFavorite: false },
  { id: '12', name: 'Transportadora de Gas del Sur', symbol: 'TGSU2', sector: 'Energía', price: 3450, change: 85, changePercent: 2.53, volume: 290000, isFavorite: false },
  { id: '13', name: 'Central Puerto S.A.', symbol: 'CEPU', sector: 'Energía', price: 1780, change: 95, changePercent: 5.64, volume: 380000, isFavorite: false },
  { id: '14', name: 'Grupo Supervielle', symbol: 'SUPV', sector: 'Finanzas', price: 1250, change: -25, changePercent: -1.96, volume: 420000, isFavorite: false },
  { id: '15', name: 'Loma Negra C.I.A.S.A.', symbol: 'LOMA', sector: 'Materiales', price: 2890, change: 140, changePercent: 5.09, volume: 310000, isFavorite: false },
];

// Sectores disponibles para filtro de stocks
export const mockStockSectors = ['Todos', 'Energía', 'Finanzas', 'Tecnología', 'Materiales', 'Alimentos', 'Telecomunicaciones', 'Retail'];

// Categorías para el centro de ayuda
export const helpCategories = [
  'Todas', 'Inversiones', 'Análisis Técnico', 'Aplicación', 
  'Seguridad', 'Estrategia', 'Conceptos'
];

// Preguntas frecuentes
export const mockFAQs: FAQItem[] = [
  {
    id: '1',
    question: '¿Cómo empezar a invertir en la bolsa argentina?',
    answer: 'Para empezar a invertir, primero debes: 1) Definir tu perfil de riesgo, 2) Abrir una cuenta en un broker autorizado por la CNV, 3) Transferir fondos a tu cuenta, 4) Investigar las empresas que te interesan, 5) Comenzar con montos pequeños mientras aprendes.',
    category: 'Inversiones',
    tags: ['principiante', 'comenzar', 'broker']
  },
  {
    id: '2',
    question: '¿Qué son los indicadores técnicos?',
    answer: 'Los indicadores técnicos son herramientas matemáticas que analizan el precio y volumen de las acciones para identificar tendencias y patrones. Los más comunes son las medias móviles, RSI, MACD y Bandas de Bollinger.',
    category: 'Análisis Técnico',
    tags: ['indicadores', 'análisis', 'gráficos']
  },
  {
    id: '3',
    question: '¿Cómo configurar alertas de precio?',
    answer: 'Puedes configurar alertas en la sección de Alertas de tu perfil. Selecciona las acciones que te interesan y define los niveles de precio que quieres monitorear. Recibirás notificaciones cuando se alcancen esos niveles.',
    category: 'Aplicación',
    tags: ['alertas', 'notificaciones', 'precio']
  },
  {
    id: '4',
    question: '¿Es segura mi información financiera?',
    answer: 'Sí, utilizamos encriptación de grado bancario para proteger tu información. Nunca almacenamos datos sensibles como contraseñas de brokers. Toda la información se transmite a través de conexiones seguras HTTPS.',
    category: 'Seguridad',
    tags: ['seguridad', 'privacidad', 'datos']
  },
  {
    id: '5',
    question: '¿Qué es la diversificación?',
    answer: 'La diversificación es una estrategia que consiste en distribuir tus inversiones entre diferentes activos, sectores o mercados para reducir el riesgo. El principio es "no poner todos los huevos en la misma canasta".',
    category: 'Estrategia',
    tags: ['diversificación', 'riesgo', 'estrategia']
  },
  {
    id: '6',
    question: '¿Cuándo debo vender una acción?',
    answer: 'Debes considerar vender cuando: 1) Has alcanzado tu objetivo de ganancia, 2) Los fundamentos de la empresa han cambiado negativamente, 3) Necesitas rebalancear tu portfolio, 4) Has detectado mejores oportunidades.',
    category: 'Estrategia',
    tags: ['vender', 'estrategia', 'timing']
  },
  {
    id: '7',
    question: '¿Qué son los dividendos?',
    answer: 'Los dividendos son pagos que las empresas hacen a sus accionistas como parte de las ganancias. Se pueden pagar en efectivo o en acciones adicionales. No todas las empresas pagan dividendos.',
    category: 'Conceptos',
    tags: ['dividendos', 'pagos', 'acciones']
  },
  {
    id: '8',
    question: '¿Cómo interpretar el volumen de trading?',
    answer: 'El volumen indica cuántas acciones se han negociado en un período. Alto volumen generalmente confirma tendencias de precio, mientras que bajo volumen puede indicar falta de interés o consolidación.',
    category: 'Análisis Técnico',
    tags: ['volumen', 'trading', 'análisis']
  }
];

// =============================================================================
// MOCK DATA HELPERS
// =============================================================================

// Función para obtener información personal por defecto
export const getDefaultPersonalInfo = (user?: User): PersonalInfo => ({
  name: user?.name || mockPersonalInfo.name,
  email: user?.email || mockPersonalInfo.email,
  phone: mockPersonalInfo.phone,
  birthDate: mockPersonalInfo.birthDate,
  occupation: mockPersonalInfo.occupation,
  address: mockPersonalInfo.address,
  document: mockPersonalInfo.document,
  nationality: mockPersonalInfo.nationality,
  avatar: user?.avatar || mockPersonalInfo.avatar
});

// Función para obtener configuración de seguridad por defecto
export const getDefaultSecuritySettings = (): SecuritySettings => ({ ...mockSecuritySettings });

// Función para obtener configuración de alertas por defecto
export const getDefaultAlertSettings = (): AlertSettings => ({ ...mockAlertSettings });

// Función para obtener configuración de horarios por defecto
export const getDefaultTimeSettings = (): TimeSettings => ({ ...mockTimeSettings });

// Función para obtener estrategia de inversión por defecto
export const getDefaultInvestmentStrategy = (): InvestmentStrategy => ({ ...mockInvestmentStrategy });

// Función para obtener sectores por defecto
export const getDefaultSectors = (): SectorItem[] => [...mockSectors];

// Función para obtener preferencias de acciones por defecto
export const getDefaultStockPreferences = (): StockItem[] => [...mockStockPreferences];

// Función para obtener preferencias del usuario por defecto
export const getDefaultUserPreferences = (): UserPreferences => ({ ...mockUserPreferences });

// Función para obtener información de contacto
export const getContactInfo = (): ContactInfo => ({ ...mockContactInfo });

// Función para obtener FAQs
export const getFAQs = (): FAQItem[] => [...mockFAQs];

// Función para obtener alertas del usuario
export const getDefaultAlerts = (): Alert[] => [...mockAlerts];

// Función para generar respuesta del bot
export const generateBotResponse = (userMessage: string): string => {
  const message = userMessage.toLowerCase();
  
  // Buscar palabras clave específicas
  for (const [keyword, response] of Object.entries(mockKeywordResponses)) {
    if (message.includes(keyword)) {
      return response;
    }
  }
  
  // Si no hay palabra clave específica, devolver respuesta aleatoria
  const randomIndex = Math.floor(Math.random() * mockBotResponses.length);
  return mockBotResponses[randomIndex];
};

// Función para obtener acciones del MERVAL
export const getDefaultMervalStocks = (): MervalStock[] => [...mockMervalStocks];

// Función para obtener sectores de stocks
export const getStockSectors = (): string[] => [...mockStockSectors];

// =============================================================================
// STOCK DETAIL DATA INTERFACES AND FUNCTIONS
// =============================================================================

export interface StockData {
  price: number[];
  volume: number[];
  movingAverage: number[];
  rsi: number[];
  dates: string[];
}

export interface StockDescription {
  name: string;
  description: string;
}

// Descripciones de los stocks
export const mockStockDescriptions: Record<string, StockDescription> = {
  'YPF': {
    name: 'YPF S.A.',
    description: 'YPF S.A. es una empresa energética argentina integrada verticalmente, líder en el mercado de hidrocarburos del país. Se dedica a la exploración, producción, refinación y comercialización de petróleo y gas natural, así como a la petroquímica.'
  },
  'YPFD': {
    name: 'YPF S.A.',
    description: 'YPF S.A. es una empresa energética argentina integrada verticalmente, líder en el mercado de hidrocarburos del país. Se dedica a la exploración, producción, refinación y comercialización de petróleo y gas natural, así como a la petroquímica.'
  },
  'GGAL': {
    name: 'Grupo Financiero Galicia',
    description: 'Grupo Financiero Galicia es uno de los principales bancos privados de Argentina. Ofrece servicios bancarios comerciales, de inversión, seguros y administración de activos a individuos, empresas y entidades gubernamentales.'
  },
  'PAMP': {
    name: 'Pampa Energía S.A.',
    description: 'Pampa Energía es una compañía energética argentina integrada que participa en la generación de electricidad, exploración y producción de petróleo y gas, refinación y distribución de combustibles.'
  },
  'BBVA': {
    name: 'Banco BBVA Argentina',
    description: 'BBVA Argentina es una entidad bancaria que forma parte del grupo español BBVA. Ofrece servicios financieros integrales incluyendo banca comercial, corporativa, de inversión y seguros.'
  },
  'CRES': {
    name: 'Cresud S.A.C.I.F. y A.',
    description: 'Cresud es una compañía agropecuaria argentina dedicada principalmente a la producción agrícola, ganadera y desarrollo inmobiliario. Es uno de los principales productores agropecuarios de América Latina.'
  },
  'BMA': {
    name: 'Banco Macro S.A.',
    description: 'Banco Macro es uno de los principales bancos privados de Argentina, ofreciendo servicios bancarios comerciales, préstamos, tarjetas de crédito y servicios financieros para individuos y empresas.'
  },
  'TXAR': {
    name: 'Ternium Argentina S.A.',
    description: 'Ternium Argentina es una empresa siderúrgica líder en América Latina, dedicada a la producción de acero plano y largo para los sectores automotriz, de la construcción, energético y de aplicaciones industriales.'
  },
  'TS': {
    name: 'Tenaris S.A.',
    description: 'Tenaris es un proveedor global líder de productos y servicios tubulares para las industrias de energía del mundo, con foco en la exploración y producción de petróleo y gas.'
  },
  'MELI': {
    name: 'Mercado Libre Inc.',
    description: 'Mercado Libre es la empresa de tecnología líder en comercio electrónico y fintech en América Latina. Opera el marketplace online más grande de la región y ofrece soluciones de pagos a través de Mercado Pago.'
  },
  'GLOB': {
    name: 'Globant S.A.',
    description: 'Globant es una empresa multinacional de tecnología que ofrece servicios de desarrollo de software, diseño digital e innovación para empresas en todo el mundo.'
  },
  'ALUA': {
    name: 'Aluar Aluminio Argentino S.A.I.C.',
    description: 'Aluar es una empresa argentina productora de aluminio primario y productos de aluminio. Es el único productor integrado de aluminio primario en Argentina.'
  },
  'ARCOR': {
    name: 'Arcor S.A.I.C.',
    description: 'Arcor es una empresa multinacional argentina líder en la fabricación de golosinas, chocolates, galletas y alimentos. Es una de las principales empresas de confitería de América Latina.'
  },
  'CNCO': {
    name: 'Cencosud S.A.',
    description: 'Cencosud es una empresa multinacional de retail presente en varios países de América Latina, operando supermercados, centros comerciales, tiendas por departamento y mejoramiento del hogar.'
  },
  'SUPV': {
    name: 'Grupo Supervielle S.A.',
    description: 'Grupo Supervielle es un grupo financiero argentino que ofrece servicios bancarios, seguros y administración de activos a través de sus subsidiarias.'
  },
  'MIRG': {
    name: 'Mirgor S.A.C.I.F.I.A.',
    description: 'Mirgor es una empresa argentina industrial que se dedica a la fabricación de productos electrónicos, electrodomésticos y componentes automotrices.'
  },
  'CEPU': {
    name: 'Central Puerto S.A.',
    description: 'Central Puerto es una empresa argentina de generación de energía eléctrica que opera centrales térmicas e hidroeléctricas en Argentina.'
  }
};

// Función para generar datos históricos de un stock
export const generateStockData = (): StockData => {
  const dates = [];
  const price = [];
  const volume = [];
  const movingAverage = [];
  const rsi = [];
  
  let basePrice = 1500;
  let baseVolume = 1000000;
  
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    dates.push(date.toLocaleDateString('es-AR', { month: 'short', day: 'numeric' }));
    
    // Simular variación de precio
    const variation = (Math.random() - 0.5) * 100;
    basePrice += variation;
    price.push(Math.round(basePrice));
    
    // Simular volumen
    const volumeVariation = (Math.random() - 0.5) * 500000;
    baseVolume += volumeVariation;
    volume.push(Math.round(Math.abs(baseVolume)));
    
    // Media móvil simple (últimos 7 días)
    if (i >= 6) {
      const avg = price.slice(i - 6, i + 1).reduce((a, b) => a + b, 0) / 7;
      movingAverage.push(Math.round(avg));
    } else {
      movingAverage.push(basePrice);
    }
    
    // RSI simulado
    rsi.push(Math.round(Math.random() * 40 + 30)); // RSI entre 30-70
  }
  
  return { price, volume, movingAverage, rsi, dates };
};

// Función para obtener descripción de un stock
export const getStockDescription = (symbol: string): StockDescription => {
  return mockStockDescriptions[symbol] || {
    name: 'Información no disponible',
    description: 'Información detallada no disponible para este activo.'
  };
};

// =============================================================================
// EXTENDED STOCK DETAIL DATA INTERFACES AND FUNCTIONS
// =============================================================================

export interface ExtendedStock {
  id: string;
  symbol: string;
  name: string;
  sector: string;
  currentPrice: number;
  dailyChange: number;
  percentageChange: number;
  volume: number;
  marketCap: number;
  pe: number;
  dividend: number;
  description: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    data: number[];
    strokeWidth: number;
  }[];
}

// Datos extendidos de stocks con información financiera completa
export const mockExtendedStocks: ExtendedStock[] = [
  {
    id: '1',
    symbol: 'YPFD',
    name: 'YPF S.A.',
    sector: 'Energía',
    currentPrice: 5250,
    dailyChange: 150,
    percentageChange: 2.94,
    volume: 1250000,
    marketCap: 2100000000,
    pe: 8.5,
    dividend: 3.2,
    description: 'YPF S.A. es una empresa energética argentina integrada verticalmente, líder en el mercado de hidrocarburos del país. Se dedica a la exploración, producción, refinación y comercialización de petróleo y gas natural, así como a la petroquímica.'
  },
  {
    id: '2',
    symbol: 'GGAL',
    name: 'Grupo Financiero Galicia',
    sector: 'Finanzas',
    currentPrice: 2890,
    dailyChange: 120,
    percentageChange: 4.33,
    volume: 1100000,
    marketCap: 1500000000,
    pe: 6.2,
    dividend: 5.8,
    description: 'Grupo Financiero Galicia es uno de los principales bancos privados de Argentina. Ofrece servicios bancarios comerciales, de inversión, seguros y administración de activos a individuos, empresas y entidades gubernamentales.'
  },
  {
    id: '3',
    symbol: 'PAMP',
    name: 'Pampa Energía S.A.',
    sector: 'Energía',
    currentPrice: 4150,
    dailyChange: -65,
    percentageChange: -1.54,
    volume: 430000,
    marketCap: 890000000,
    pe: 12.3,
    dividend: 2.1,
    description: 'Pampa Energía es una compañía energética argentina integrada que participa en la generación de electricidad, exploración y producción de petróleo y gas, refinación y distribución de combustibles.'
  },
  {
    id: '4',
    symbol: 'MELI',
    name: 'Mercado Libre Inc.',
    sector: 'Tecnología',
    currentPrice: 125000,
    dailyChange: 2500,
    percentageChange: 2.04,
    volume: 95000,
    marketCap: 6200000000,
    pe: 45.2,
    dividend: 0,
    description: 'Mercado Libre es la empresa de tecnología líder en comercio electrónico y fintech en América Latina. Opera el marketplace online más grande de la región y ofrece soluciones de pagos a través de Mercado Pago.'
  },
  {
    id: '5',
    symbol: 'GLOB',
    name: 'Globant S.A.',
    sector: 'Tecnología',
    currentPrice: 15600,
    dailyChange: -320,
    percentageChange: -2.01,
    volume: 180000,
    marketCap: 780000000,
    pe: 28.7,
    dividend: 0,
    description: 'Globant es una empresa multinacional de tecnología que ofrece servicios de desarrollo de software, diseño digital e innovación para empresas en todo el mundo.'
  },
  {
    id: '6',
    symbol: 'BMA',
    name: 'Banco Macro S.A.',
    sector: 'Finanzas',
    currentPrice: 3200,
    dailyChange: -80,
    percentageChange: -2.44,
    volume: 890000,
    marketCap: 1200000000,
    pe: 7.8,
    dividend: 4.5,
    description: 'Banco Macro es uno de los principales bancos privados de Argentina, ofreciendo servicios bancarios comerciales, préstamos, tarjetas de crédito y servicios financieros para individuos y empresas.'
  },
  {
    id: '7',
    symbol: 'TS',
    name: 'Tenaris S.A.',
    sector: 'Materiales',
    currentPrice: 6780,
    dailyChange: 220,
    percentageChange: 3.35,
    volume: 780000,
    marketCap: 4100000000,
    pe: 11.2,
    dividend: 6.8,
    description: 'Tenaris es un proveedor global líder de productos y servicios tubulares para las industrias de energía del mundo, con foco en la exploración y producción de petróleo y gas.'
  },
  {
    id: '8',
    symbol: 'ALUA',
    name: 'Aluar Aluminio Argentino S.A.I.C.',
    sector: 'Materiales',
    currentPrice: 2340,
    dailyChange: -45,
    percentageChange: -1.89,
    volume: 440000,
    marketCap: 650000000,
    pe: 15.4,
    dividend: 2.8,
    description: 'Aluar es una empresa argentina productora de aluminio primario y productos de aluminio. Es el único productor integrado de aluminio primario en Argentina.'
  },
  {
    id: '9',
    symbol: 'ARCOR',
    name: 'Arcor S.A.I.C.',
    sector: 'Alimentos',
    currentPrice: 1890,
    dailyChange: 35,
    percentageChange: 1.89,
    volume: 320000,
    marketCap: 890000000,
    pe: 18.7,
    dividend: 3.5,
    description: 'Arcor es una empresa multinacional argentina líder en la fabricación de golosinas, chocolates, galletas y alimentos. Es una de las principales empresas de confitería de América Latina.'
  },
  {
    id: '10',
    symbol: 'CRES',
    name: 'Cresud S.A.C.I.F. y A.',
    sector: 'Real Estate',
    currentPrice: 1560,
    dailyChange: 45,
    percentageChange: 2.97,
    volume: 125000,
    marketCap: 420000000,
    pe: 22.3,
    dividend: 1.8,
    description: 'Cresud es una compañía agropecuaria argentina dedicada principalmente a la producción agrícola, ganadera y desarrollo inmobiliario. Es uno de los principales productores agropecuarios de América Latina.'
  }
];

// Datos simulados para gráficos
export const generateMockChartData = (): ChartData => ({
  labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'],
  datasets: [
    {
      data: [
        Math.floor(Math.random() * 50) + 20,
        Math.floor(Math.random() * 50) + 20,
        Math.floor(Math.random() * 50) + 20,
        Math.floor(Math.random() * 50) + 20,
        Math.floor(Math.random() * 50) + 20,
        Math.floor(Math.random() * 50) + 20,
      ],
      strokeWidth: 2,
    },
  ],
});

// Función para obtener stock extendido por símbolo
export const getExtendedStock = (symbol: string): ExtendedStock | null => {
  return mockExtendedStocks.find(stock => stock.symbol === symbol) || null;
};

// Función para obtener todos los stocks extendidos
export const getAllExtendedStocks = (): ExtendedStock[] => [...mockExtendedStocks];
