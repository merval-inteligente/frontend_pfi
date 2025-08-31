# 📈 MERVAL Guide

Una aplicación multiplataforma para el seguimiento y análisis del mercado financiero argentino (MERVAL), desarrollada con React Native y Expo. Actualmente disponible para dispositivos móviles con expansión planificada para plataforma web.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android%20%7C%20Web%20(próximamente)-lightgrey.svg)
![React Native](https://img.shields.io/badge/React%20Native-Expo-61DAFB.svg)

## 🚀 Características Principales

### 💰 Gestión Financiera
- **Dashboard Principal**: Vista consolidada de tus inversiones y tendencias del mercado
- **Seguimiento de Acciones**: Monitoreo en tiempo real de precios y variaciones
- **Favoritos Personalizados**: Guarda y organiza tus acciones preferidas por sectores
- **Alertas Inteligentes**: Configuración de notificaciones para cambios importantes

### 🤖 Chat Inteligente
- **Asistente IA**: Chat integrado para consultas sobre el mercado financiero
- **Historial de Conversaciones**: Mantiene el contexto de tus consultas anteriores
- **Respuestas Especializadas**: Información específica sobre MERVAL y acciones argentinas

### 👤 Gestión de Usuario
- **Autenticación Segura**: Sistema de login/registro con JWT
- **Perfil Personalizable**: Configuración de preferencias y temas
- **Onboarding Intuitivo**: Proceso guiado para nuevos usuarios
- **Recuperación de Contraseña**: Sistema seguro de reset de credenciales

### ⚙️ Configuración Avanzada
- **Temas Adaptativos**: Modo claro, oscuro y automático
- **Gestión de Notificaciones**: Control granular de alertas
- **Sincronización en la Nube**: Backup automático de preferencias
- **Centro de Ayuda**: Documentación y soporte integrado

## 🏗️ Arquitectura Técnica

### Stack Tecnológico
- **Frontend**: React Native con Expo Router (multiplataforma)
- **Navegación**: File-based routing con tabs y stack navigation
- **Estado Global**: Context API para autenticación y preferencias
- **Almacenamiento**: AsyncStorage para datos locales
- **UI/UX**: Componentes nativos con temas adaptativos
- **APIs**: Integración con servicios backend y chat IA
- **Web**: Expansión planificada con compatibilidad web nativa de Expo

### Estructura del Proyecto
```
app/
├── (tabs)/              # Navegación principal por tabs
│   ├── index.tsx        # Dashboard principal
│   ├── explore.tsx      # Explorar mercado
│   ├── chat.tsx         # Chat inteligente
│   ├── alerts.tsx       # Gestión de alertas
│   ├── preferences.tsx  # Configuración de favoritos
│   └── profile.tsx      # Perfil de usuario
├── _layout.tsx          # Layout principal
├── login.tsx           # Autenticación
├── register.tsx        # Registro/Onboarding
├── welcome.tsx         # Pantalla de bienvenida
└── ...                 # Pantallas adicionales

components/              # Componentes reutilizables
├── ui/                 # Componentes de interfaz
├── ThemedView.tsx      # Componentes con temas
└── ...

contexts/               # Gestión de estado global
├── AuthContext.tsx     # Autenticación
├── ThemeContext.tsx    # Temas
└── PreferencesContext.tsx  # Preferencias

controller/             # Lógica de negocio
├── apiController.ts    # Funciones API
└── webservices.ts      # Endpoints

services/               # Servicios externos
├── mockData.ts         # Datos de prueba
└── mockup.ts          # Configuraciones mock
```

## 🛠️ Configuración de Desarrollo

### Prerrequisitos
- Node.js (v18 o superior)
- npm o yarn
- Expo CLI
- Android Studio (para Android)
- Xcode (para iOS, solo macOS)

### Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [repository-url]
   cd pfi
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   ```bash
   # Crear archivo .env con las configuraciones necesarias
   cp .env.example .env
   ```

4. **Iniciar el servidor de desarrollo**
   ```bash
   npm start
   ```

### Scripts Disponibles

- `npm start` - Inicia Expo Dev Server
- `npm run android` - Ejecuta en emulador Android
- `npm run ios` - Ejecuta en simulador iOS
- `npm run web` - Ejecuta en navegador web
- `npm run lint` - Ejecuta ESLint

## 📱 Deployment

### Build de Producción

1. **Android**
   ```bash
   npx expo build:android
   ```

2. **iOS**
   ```bash
   npx expo build:ios
   ```

3. **Web** (próximamente)
   ```bash
   npx expo export:web
   ```

### Configuración de Release
- **Bundle ID**: `com.nicolas.mervalguide`
- **Scheme**: `mervalguide`
- **Versión**: 1.0.0
- **Plataformas**: iOS, Android, Web (en desarrollo)

## 🔧 Configuración de Backend

### APIs Integradas
- **Autenticación**: Sistema JWT con refresh tokens
- **Datos Financieros**: APIs de MERVAL y mercado argentino
- **Chat IA**: Servicio de chat inteligente en puerto 8084
- **Preferencias**: Gestión de favoritos y configuraciones

### Endpoints Principales
```
Base URL: http://192.168.1.58

Authentication:
- POST /auth/login
- POST /auth/register
- POST /auth/refresh

User Preferences:
- GET /user/preferences
- PATCH /user/preferences
- POST /user/favorites/stocks
- DELETE /user/favorites/stocks

Market Data:
- GET /sectors
- GET /stocks
- GET /stocks/[symbol]
```

## 🚀 Características Destacadas

### Sistema de Chat Inteligente
- Integración con IA especializada en mercado financiero
- Manejo de timeouts y fallbacks
- Historial persistente de conversaciones
- Respuestas contextuales sobre MERVAL

### Gestión de Favoritos Avanzada
- Sincronización automática con backend
- Organización por sectores
- Rate limiting y manejo de errores
- Actualización en tiempo real

### Temas Adaptativos
- Soporte completo para modo claro/oscuro
- Detección automática del tema del sistema
- Transiciones suaves entre temas
- Consistencia visual en toda la app

## 🔒 Seguridad

- **Autenticación JWT**: Tokens seguros con expiración
- **Almacenamiento Seguro**: AsyncStorage para datos sensibles
- **Validación de Entrada**: Sanitización de datos de usuario
- **HTTPS**: Comunicación encriptada con APIs
