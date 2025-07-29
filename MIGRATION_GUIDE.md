# DOCUMENTACIÓN: Migración de Datos de Prueba a Backend

## Resumen de Cambios Realizados

### 1. Creación del Archivo Central de Mockup
- **Archivo creado**: `services/mockup.ts`
- **Propósito**: Centralizar todos los datos de prueba de la aplicación para facilitar la migración a un backend real.

### 2. Datos Centralizados

#### Información Personal
- **Interfaz**: `PersonalInfo`
- **Datos de prueba**: 
  - Nombre: Juan Pérez
  - Email: juan.perez@email.com
  - Teléfono: +54 11 1234-5678
  - Avatar: URL de Unsplash
- **Función helper**: `getDefaultPersonalInfo(user?: User)`

#### Configuración de Seguridad
- **Interfaz**: `SecuritySettings`
- **Datos por defecto**:
  - Autenticación biométrica: habilitada
  - Verificación en 2 pasos: deshabilitada
  - Notificaciones de login: habilitada
  - Timeout de sesión: 30 minutos
- **Función helper**: `getDefaultSecuritySettings()`

#### Configuración de Alertas
- **Interfaz**: `AlertSettings` y `TimeSettings`
- **Incluye**: Configuración de notificaciones, horarios, horas silenciosas
- **Función helper**: `getDefaultAlertSettings()`, `getDefaultTimeSettings()`

#### Estrategia de Inversión
- **Interfaz**: `InvestmentStrategy`
- **Datos por defecto**: Perfil moderado, horizonte 3-5 años
- **Arrays configurables**: perfiles de riesgo, sectores, objetivos
- **Función helper**: `getDefaultInvestmentStrategy()`, `getRiskProfiles(colors)`

#### Preferencias del Usuario
- **Interfaces**: `SectorItem`, `StockItem`, `UserPreferences`
- **Incluye**: Sectores favoritos, acciones seleccionadas, nivel de experiencia
- **Función helper**: `getDefaultSectors()`, `getDefaultStockPreferences()`

#### Centro de Ayuda
- **Interfaz**: `FAQItem`, `ContactInfo`
- **Datos**: FAQs categorizadas, información de contacto
- **Función helper**: `getFAQs()`, `getContactInfo()`

### 3. Archivos Actualizados

#### Pantallas Principales
1. **`personal-info.tsx`**: Ahora usa `getDefaultPersonalInfo()`
2. **`security.tsx`**: Ahora usa `getDefaultSecuritySettings()`
3. **`alerts-config.tsx`**: Usa `getDefaultAlertSettings()` y `getDefaultTimeSettings()`
4. **`investment-strategy.tsx`**: Usa todas las funciones relacionadas con estrategia
5. **`help-center.tsx`**: Usa `mockFAQs`, `helpCategories`, `getContactInfo()`
6. **`preferences.tsx`**: Usa funciones de sectores y acciones
7. **`profile.tsx`**: Usa `getContactInfo()` para soporte

#### Datos Mantenidos en `mockData.ts`
- Usuarios de prueba
- Datos de acciones (YPFD, GGAL, etc.)
- Noticias del mercado
- Datos del índice MERVAL
- Servicios de autenticación y APIs

## Cómo Migrar a un Backend Real

### 1. Reemplazar Servicios Mock

#### AuthService
```typescript
// En lugar de mockUsers, conectar a:
static async login(email: string, password: string): Promise<User> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
}
```

#### StockService
```typescript
// En lugar de mockStocks, conectar a:
static async getStocks(): Promise<Stock[]> {
  const response = await fetch('/api/stocks');
  return response.json();
}
```

#### NewsService
```typescript
// En lugar de mockNews, conectar a:
static async getNews(): Promise<NewsItem[]> {
  const response = await fetch('/api/news');
  return response.json();
}
```

### 2. Reemplazar Configuraciones de Usuario

#### Información Personal
```typescript
// En lugar de getDefaultPersonalInfo(), usar:
static async getUserProfile(userId: string): Promise<PersonalInfo> {
  const response = await fetch(`/api/users/${userId}/profile`);
  return response.json();
}

static async updateUserProfile(userId: string, data: PersonalInfo): Promise<void> {
  await fetch(`/api/users/${userId}/profile`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}
```

#### Configuraciones de Seguridad
```typescript
// En lugar de getDefaultSecuritySettings(), usar:
static async getSecuritySettings(userId: string): Promise<SecuritySettings> {
  const response = await fetch(`/api/users/${userId}/security`);
  return response.json();
}
```

#### Configuraciones de Alertas
```typescript
// En lugar de getDefaultAlertSettings(), usar:
static async getAlertSettings(userId: string): Promise<AlertSettings> {
  const response = await fetch(`/api/users/${userId}/alerts`);
  return response.json();
}
```

### 3. Reemplazar Datos Estáticos

#### Centro de Ayuda
```typescript
// En lugar de mockFAQs, usar:
static async getFAQs(): Promise<FAQItem[]> {
  const response = await fetch('/api/help/faqs');
  return response.json();
}
```

#### Información de Contacto
```typescript
// En lugar de getContactInfo(), usar:
static async getContactInfo(): Promise<ContactInfo> {
  const response = await fetch('/api/contact-info');
  return response.json();
}
```

### 4. Plan de Migración Sugerido

#### Fase 1: APIs de Autenticación y Usuario
1. Reemplazar `AuthService`
2. Migrar configuraciones de perfil personal
3. Implementar almacenamiento de preferencias

#### Fase 2: Datos Financieros
1. Conectar a API real de mercado (ej: Alpha Vantage, Yahoo Finance)
2. Reemplazar `StockService` y `MarketService`
3. Implementar cache para datos de mercado

#### Fase 3: Contenido Dinámico
1. Migrar `NewsService` a fuente real de noticias
2. Implementar sistema de FAQs administrable
3. Configuración dinámica de contacto

#### Fase 4: Configuraciones Avanzadas
1. Sistema de alertas en tiempo real
2. Estrategias de inversión personalizables
3. Preferencias sincronizadas entre dispositivos

### 5. Variables de Entorno Necesarias

```env
# APIs de Mercado
MARKET_API_KEY=your_api_key
MARKET_API_URL=https://api.marketdata.com

# Base de Datos
DATABASE_URL=postgresql://...

# APIs de Noticias
NEWS_API_KEY=your_news_api_key

# Configuración de Email
SMTP_HOST=smtp.gmail.com
SUPPORT_EMAIL=soporte@mervalguide.com

# Notificaciones Push
PUSH_NOTIFICATION_KEY=your_push_key
```

### 6. Estructura de Base de Datos Sugerida

```sql
-- Usuarios
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE,
  name VARCHAR,
  avatar_url VARCHAR,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

-- Configuraciones de Usuario
CREATE TABLE user_settings (
  user_id UUID REFERENCES users(id),
  category VARCHAR, -- 'security', 'alerts', 'personal'
  settings JSONB,
  updated_at TIMESTAMP
);

-- Preferencias de Inversión
CREATE TABLE investment_preferences (
  user_id UUID REFERENCES users(id),
  preferred_sectors TEXT[],
  risk_profile VARCHAR,
  investment_goals TEXT[],
  updated_at TIMESTAMP
);
```

## Beneficios de la Centralización

1. **Mantenimiento**: Un solo lugar para actualizar datos de prueba
2. **Consistencia**: Todos los archivos usan los mismos datos
3. **Migración**: Fácil identificación de qué reemplazar
4. **Testing**: Datos controlados para pruebas
5. **Documentación**: Interfaces claras para el backend

## Notas Importantes

- El archivo `mockData.ts` original se mantiene para los datos de mercado y autenticación
- Las funciones helper permiten personalización basada en el usuario
- Los tipos TypeScript facilitan la migración al backend
- Todas las pantallas mantienen su funcionalidad actual
