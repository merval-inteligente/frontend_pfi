# Guía MERVAL - Aplicación de Inversiones 📈

Una aplicación móvil moderna para seguimiento e inversiones en el mercado de valores argentino (MERVAL), desarrollada con React Native y Expo.

## Características

### 🎯 Funcionalidades Principales
- **Dashboard principal** con resumen del mercado MERVAL
- **Autenticación de usuarios** (registro/login)
- **Gestión de preferencias** de inversión y favoritos
- **Detalles de acciones** con gráficos y estadísticas
- **Chat con IA** para consultas financieras
- **Explorador de mercado** con filtros por sector
- **Sistema de alertas** y notificaciones
- **Perfil de usuario** personalizable
- **Centro de ayuda** con FAQs

### 🛠 Tecnologías
- **React Native** con Expo Router
- **TypeScript** para tipado estático
- **Context API** para manejo de estado
- **AsyncStorage** para persistencia local
- **React Native Chart Kit** para gráficos
- **Expo Image** para optimización de imágenes
- **Ionicons** para iconografía

## Instalación

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Iniciar la aplicación**
   ```bash
   npm start
   ```

3. **Ejecutar en plataformas específicas**
   ```bash
   npm run android  # Android
   npm run ios      # iOS
   npm run web      # Web
   ```

## Estructura del Proyecto

```
├── app/                    # Pantallas principales (Expo Router)
│   ├── (tabs)/            # Navegación por pestañas
│   │   ├── index.tsx      # Dashboard principal
│   │   ├── explore.tsx    # Explorador de mercado
│   │   ├── preferences.tsx # Gestión de preferencias
│   │   ├── alerts.tsx     # Sistema de alertas
│   │   ├── chat.tsx       # Chat con IA
│   │   └── profile.tsx    # Perfil de usuario
│   ├── stock-detail.tsx   # Detalle de acciones
│   ├── login.tsx          # Autenticación
│   └── ...               # Otras pantallas
├── components/            # Componentes reutilizables
├── contexts/              # Context providers
├── controller/            # Lógica de API y controladores
├── services/              # Servicios y datos mock
├── constants/             # Constantes y configuración
└── hooks/                # Custom hooks
```

## Configuración

### Variables de Entorno
La aplicación utiliza endpoints configurados en `controller/webservices.ts`. Actualmente apunta a:
- Backend: `http://localhost:8080/api`

### Temas
Soporte para modo claro/oscuro configurado en `constants/Colors.ts`.

## Desarrollo

### Scripts Disponibles
- `npm start` - Inicia el servidor de desarrollo
- `npm run android` - Ejecuta en Android
- `npm run ios` - Ejecuta en iOS  
- `npm run web` - Ejecuta en navegador web
- `npm run lint` - Ejecuta el linter

### Arquitectura
- **Expo Router** para navegación basada en archivos
- **Context API** para estado global (auth, tema, preferencias)
- **AsyncStorage** para persistencia de datos de usuario
- **Fallback a mock data** cuando no hay conectividad con backend

## Estado del Proyecto

✅ **Completado:**
- Estructura básica de navegación
- Sistema de autenticación
- Dashboard con datos del mercado
- Gestión de preferencias de usuario
- Detalles de acciones con gráficos
- Chat básico con IA
- Temas claro/oscuro

🚧 **En desarrollo:**
- Integración completa con backend
- Sistema de notificaciones push
- Análisis técnico avanzado
- Portfolio de inversiones

## Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

---

Desarrollado por **Nicolás Petcoff** 🚀
