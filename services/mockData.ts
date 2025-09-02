// Mock Data Service
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  investmentKnowledge?: string;
  riskAppetite?: string;
  preferences: {
    favoriteStocks: string[];
    watchlist: string[];
    notifications: boolean;
    theme: 'light' | 'dark' | 'system';
  };
  createdAt: string;
  lastLogin: string;
}

export interface Stock {
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
  logo?: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  author: string;
  publishedAt: string;
  imageUrl?: string;
  relatedStocks: string[];
  category: 'market' | 'company' | 'economic' | 'energy' | 'politics';
  sentiment: 'positive' | 'negative' | 'neutral';
  source: string;
}

export interface MarketData {
  mervalIndex: {
    value: number;
    change: number;
    percentageChange: number;
    volume: number;
    lastUpdate: string;
  };
  topGainers: Stock[];
  topLosers: Stock[];
  mostActive: Stock[];
}

// Mock Users Database
export const mockUsers: Record<string, User> = {
  'nicolas@example.com': {
    id: '1',
    email: 'nicolas@example.com',
    name: 'Nicolás Petcoff',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
    preferences: {
      favoriteStocks: ['YPFD', 'GGAL', 'PAMP', 'BBVA', 'CRES'],
      watchlist: ['YPFD', 'GGAL', 'PAMP', 'BBVA', 'CRES', 'BMA', 'TS', 'CEPU'],
      notifications: true,
      theme: 'system',
    },
    createdAt: '2024-01-15T10:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  'demo@example.com': {
    id: '2',
    email: 'demo@example.com',
    name: 'Usuario Demo',
    preferences: {
      favoriteStocks: ['YPFD', 'BMA'],
      watchlist: ['YPFD', 'BMA', 'TS'],
      notifications: false,
      theme: 'light',
    },
    createdAt: '2024-02-01T14:30:00Z',
    lastLogin: new Date().toISOString(),
  },
};

// Mock Stocks Database
export const mockStocks: Record<string, Stock> = {
  YPFD: {
    id: '1',
    symbol: 'YPFD',
    name: 'YPF Sociedad Anónima',
    sector: 'Energy',
    currentPrice: 60,
    dailyChange: 4.2,
    percentageChange: 7.52,
    volume: 1250000,
    marketCap: 2400000000,
    pe: 12.5,
    dividend: 2.8,
    description: 'YPF S.A. es una empresa integrada de petróleo y gas que opera principalmente en Argentina. La compañía se dedica a la exploración, desarrollo y producción de crudo y gas natural.',
  },
  GGAL: {
    id: '2',
    symbol: 'GGAL',
    name: 'Grupo Financiero Galicia',
    sector: 'Financial Services',
    currentPrice: 70,
    dailyChange: 5.5,
    percentageChange: 8.53,
    volume: 890000,
    marketCap: 1800000000,
    pe: 8.2,
    dividend: 4.5,
    description: 'Grupo Financiero Galicia es uno de los principales grupos financieros de Argentina, ofreciendo servicios bancarios y financieros integrales.',
  },
  PAMP: {
    id: '3',
    symbol: 'PAMP',
    name: 'Pampa Energía',
    sector: 'Utilities',
    currentPrice: 50,
    dailyChange: 2.8,
    percentageChange: 5.93,
    volume: 750000,
    marketCap: 1200000000,
    pe: 15.3,
    dividend: 1.2,
    description: 'Pampa Energía S.A. es una empresa integrada de electricidad que participa en la generación, transmisión y distribución de electricidad en Argentina.',
  },
  BBVA: {
    id: '4',
    symbol: 'BBVA',
    name: 'Banco BBVA Argentina',
    sector: 'Financial Services',
    currentPrice: 85,
    dailyChange: -1.5,
    percentageChange: -1.73,
    volume: 650000,
    marketCap: 950000000,
    pe: 9.8,
    dividend: 3.2,
    description: 'BBVA Argentina es una entidad financiera que ofrece servicios bancarios y financieros a personas físicas, empresas e instituciones.',
  },
  CRES: {
    id: '5',
    symbol: 'CRES',
    name: 'Cresud',
    sector: 'Real Estate',
    currentPrice: 42,
    dailyChange: 1.8,
    percentageChange: 4.48,
    volume: 420000,
    marketCap: 800000000,
    pe: 18.5,
    dividend: 1.8,
    description: 'Cresud S.A.C.I.F. y A. es una empresa agrícola que se dedica al desarrollo de actividades agropecuarias y de inversión inmobiliaria.',
  },
  BMA: {
    id: '6',
    symbol: 'BMA',
    name: 'Banco Macro',
    sector: 'Financial Services',
    currentPrice: 40,
    dailyChange: -0.8,
    percentageChange: -1.96,
    volume: 580000,
    marketCap: 750000000,
    pe: 7.9,
    dividend: 5.1,
    description: 'Banco Macro S.A. es una entidad financiera argentina que brinda servicios bancarios a personas físicas, empresas y gobiernos.',
  },
  TS: {
    id: '7',
    symbol: 'TS',
    name: 'Telecom Argentina',
    sector: 'Telecommunications',
    currentPrice: 80,
    dailyChange: 3.2,
    percentageChange: 4.17,
    volume: 380000,
    marketCap: 1100000000,
    pe: 14.2,
    dividend: 2.5,
    description: 'Telecom Argentina S.A. es una empresa de telecomunicaciones que ofrece servicios de telefonía fija, móvil, internet y datos.',
  },
  CEPU: {
    id: '8',
    symbol: 'CEPU',
    name: 'Central Puerto',
    sector: 'Utilities',
    currentPrice: 90,
    dailyChange: 6.8,
    percentageChange: 8.17,
    volume: 320000,
    marketCap: 1300000000,
    pe: 11.8,
    dividend: 3.8,
    description: 'Central Puerto S.A. es una empresa de generación de energía eléctrica que opera centrales térmicas e hidroeléctricas en Argentina.',
  },
};

// Mock News Database
export const mockNews: NewsItem[] = [
  {
    id: '1',
    title: 'YPF anuncia nueva inversión millonaria en Vaca Muerta',
    summary: 'La petrolera estatal invertirá USD 2.500 millones en nuevos proyectos de exploración y desarrollo en la formación Vaca Muerta durante 2025.',
    content: 'YPF Sociedad Anónima anunció oficialmente una inversión de USD 2.500 millones destinada a expandir sus operaciones en la formación Vaca Muerta. El plan incluye la perforación de 150 nuevos pozos y la construcción de infraestructura adicional. Esta inversión representa un aumento del 35% respecto al año anterior y posiciona a YPF como líder en el desarrollo de recursos no convencionales en Argentina.',
    author: 'María González',
    publishedAt: '2025-01-27T08:30:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1583511715588-3ffe1b0e7fb4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    relatedStocks: ['YPFD'],
    category: 'company',
    sentiment: 'positive',
    source: 'Ámbito Financiero',
  },
  {
    id: '2',
    title: 'Banco Central mantiene tasa de interés en niveles históricos',
    summary: 'El BCRA decidió mantener la tasa de política monetaria en 118% anual, priorizando el control inflacionario sobre el crecimiento económico.',
    content: 'En su reunión mensual, el Banco Central de la República Argentina (BCRA) decidió mantener la tasa de política monetaria en 118% anual. La decisión se basó en la necesidad de continuar con el proceso desinflacionario iniciado en el último trimestre. Los analistas esperaban una reducción gradual, pero las autoridades monetarias priorizaron la estabilidad de precios.',
    author: 'Carlos Rodríguez',
    publishedAt: '2025-01-27T14:15:00Z',
    relatedStocks: ['GGAL', 'BMA', 'BBVA'],
    category: 'economic',
    sentiment: 'neutral',
    source: 'La Nación',
  },
  {
    id: '3',
    title: 'Galicia reporta ganancias récord en el cuarto trimestre',
    summary: 'El banco superó ampliamente las expectativas del mercado con un ROE del 38% y anuncia un ambicioso plan de expansión digital.',
    content: 'Grupo Financiero Galicia presentó resultados excepcionales para el cuarto trimestre de 2024, con un retorno sobre patrimonio (ROE) del 38%, superando las estimaciones de analistas en un 15%. El banco atribuyó estos resultados a la mejora en la calidad de cartera y el crecimiento en servicios digitales. La entidad anunció inversiones por USD 200 millones en tecnología para 2025.',
    author: 'Ana Martínez',
    publishedAt: '2025-01-27T10:45:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    relatedStocks: ['GGAL'],
    category: 'company',
    sentiment: 'positive',
    source: 'Cronista',
  },
  {
    id: '4',
    title: 'Inflación de enero muestra desaceleración significativa',
    summary: 'El INDEC reportó una inflación mensual del 2.1%, la más baja en los últimos 18 meses, impactando positivamente en el mercado.',
    content: 'El Instituto Nacional de Estadística y Censos (INDEC) informó que la inflación de enero fue del 2.1%, marcando una significativa desaceleración respecto al 2.7% de diciembre. Este resultado estuvo por debajo de las expectativas del mercado y representa la cifra más baja desde julio de 2023. Los analistas ven con optimismo esta tendencia para el desarrollo del mercado de capitales.',
    author: 'Roberto Silva',
    publishedAt: '2025-01-27T16:20:00Z',
    relatedStocks: [],
    category: 'economic',
    sentiment: 'positive',
    source: 'Página 12',
  },
  {
    id: '5',
    title: 'Pampa Energía inaugura el parque eólico más grande del país',
    summary: 'La empresa invirtió USD 400 millones en el nuevo complejo de energía renovable ubicado en la Patagonia, con capacidad para 200 MW.',
    content: 'Pampa Energía S.A. inauguró oficialmente el parque eólico "Vientos del Sur", el más grande de Argentina con una capacidad instalada de 200 MW. La inversión total ascendió a USD 400 millones y el proyecto generará energía limpia para abastecer a más de 150.000 hogares. Esta iniciativa forma parte del plan estratégico de la compañía para liderar la transición energética en el país.',
    author: 'Laura Fernández',
    publishedAt: '2025-01-26T12:00:00Z',
    imageUrl: 'https://images.unsplash.com/photo-1466611653911-95081537e5b7?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    relatedStocks: ['PAMP'],
    category: 'energy',
    sentiment: 'positive',
    source: 'Infobae',
  },
];

// Mock Market Data
export const mockMarketData: MarketData = {
  mervalIndex: {
    value: 1567234,
    change: 35789,
    percentageChange: 2.34,
    volume: 125000000,
    lastUpdate: new Date().toISOString(),
  },
  topGainers: [
    mockStocks.CEPU,
    mockStocks.GGAL,
    mockStocks.YPFD,
  ],
  topLosers: [
    mockStocks.BMA,
    mockStocks.BBVA,
  ],
  mostActive: [
    mockStocks.YPFD,
    mockStocks.GGAL,
    mockStocks.PAMP,
  ],
};

// Authentication Service
export class AuthService {
  static async login(email: string, password: string): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers[email];
    if (!user || password !== 'password123') {
      throw new Error('Credenciales inválidas');
    }
    
    // Update last login
    user.lastLogin = new Date().toISOString();
    
    return user;
  }
  
  static async register(email: string, password: string, name: string): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (mockUsers[email]) {
      throw new Error('El usuario ya existe');
    }
    
    const newUser: User = {
      id: Date.now().toString(),
      email,
      name,
      preferences: {
        favoriteStocks: [],
        watchlist: [],
        notifications: true,
        theme: 'system',
      },
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    
    mockUsers[email] = newUser;
    return newUser;
  }
}

// Data Services
export class StockService {
  static async getStocks(): Promise<Stock[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return Object.values(mockStocks);
  }
  
  static async getStock(symbol: string): Promise<Stock> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const stock = mockStocks[symbol];
    if (!stock) {
      throw new Error('Stock no encontrado');
    }
    return stock;
  }
  
  static async getUserStocks(favoriteStocks: string[]): Promise<Stock[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return favoriteStocks.map(symbol => mockStocks[symbol]).filter(Boolean);
  }
}

export class NewsService {
  static async getNews(limit?: number): Promise<NewsItem[]> {
    await new Promise(resolve => setTimeout(resolve, 600));
    return limit ? mockNews.slice(0, limit) : mockNews;
  }
  
  static async getNewsForStock(symbol: string): Promise<NewsItem[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    return mockNews.filter(news => news.relatedStocks.includes(symbol));
  }
}

export class MarketService {
  static async getMarketData(): Promise<MarketData> {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockMarketData;
  }
}
