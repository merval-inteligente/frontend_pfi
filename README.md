# 📈 MERVAL Guide

> Aplicación móvil educativa para aprender sobre inversiones en el mercado argentino

![React Native](https://img.shields.io/badge/React%20Native-Expo-61DAFB.svg)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey.svg)

## ¿Qué es?

Una plataforma educativa que ayuda a usuarios sin experiencia a aprender sobre inversiones en el mercado de valores argentino (MERVAL). 

**Importante**: Esta app es solo educativa - no permite realizar transacciones reales.

## Características

### 🎓 Aprendizaje
- **Evaluación de perfil**: Determina tu nivel de conocimiento y tolerancia al riesgo
- **Chat educativo**: IA especializada que responde dudas sobre inversiones
- **Contenido didáctico**: Explicaciones simples de conceptos financieros

### 📊 Exploración
- **Seguimiento de acciones**: Visualiza precios y tendencias del MERVAL
- **Favoritos por sectores**: Organiza acciones de tu interés
- **Alertas educativas**: Notificaciones sobre cambios importantes

### 👤 Personalización
- **Perfil de inversor**: Basado en evaluación de 6 preguntas
- **Preferencias**: Sectores y acciones de interés
- **Temas**: Modo claro/oscuro automático

## Tecnología

- **React Native + Expo**: Aplicación multiplataforma
- **Context API**: Gestión de estado (Auth, Theme, Preferences)
- **APIs REST**: Backend con autenticación JWT
- **AsyncStorage**: Almacenamiento local
- **Chat IA**: Servicio especializado en mercado argentino

## Instalación

```bash
# Clonar proyecto
git clone [repository-url]
cd pfi

# Instalar dependencias
npm install

# Iniciar desarrollo
npm start
```

## Scripts

```bash
npm start          # Servidor de desarrollo
npm run android    # Emulador Android
npm run ios        # Simulador iOS
```

## Estructura

```
app/
├── (tabs)/        # Navegación principal
│   ├── index.tsx      # Dashboard
│   ├── explore.tsx    # Explorar acciones
│   ├── chat.tsx       # Chat educativo
│   └── profile.tsx    # Perfil usuario
├── login.tsx      # Autenticación
├── register.tsx   # Registro con evaluación
└── welcome.tsx    # Bienvenida

components/        # Componentes reutilizables
contexts/         # Estado global
controller/       # APIs y lógica
```

## APIs

### Backend Principal
```
http://192.168.0.17:8080/api

POST /auth/register    # Registro con perfil
POST /auth/login       # Inicio de sesión
GET /user/preferences  # Favoritos del usuario
```

### Chat IA
```
http://192.168.0.17:8084

POST /chat            # Consultas educativas
```

## Sistema de Evaluación

### Conocimientos (3 preguntas)
- Qué son las acciones
- Comprensión de inflación  
- Conocimiento del MERVAL

### Tolerancia al Riesgo (3 preguntas)
- Preferencias de inversión
- Reacción ante pérdidas
- Influencia en decisiones

### Perfiles Resultantes
- **Conocimiento**: Principiante | Intermedio | Avanzado
- **Riesgo**: Conservador | Moderado | Agresivo

## Para quién

- **Estudiantes** interesados en finanzas
- **Principiantes** en inversiones
- **Curiosos** del mercado argentino
- **Educadores** que necesitan herramientas didácticas
