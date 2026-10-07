# App móvil - Gym App

Cliente React Native con Expo para Android e iOS. El flujo actual ya cubre registro, entrenamiento, historial, PRs, rangos, rutinas, ligas, perfil editable y validación del estado del backend.

## Requisitos

- Node.js LTS y npm.
- API y base de datos local configuradas según [backend/README.md](../backend/README.md).
- Android Studio y un emulador/dispositivo Android para development builds locales. Para compilar iOS de forma local se necesita macOS; Expo Go permite comprobaciones iniciales, pero no sustituye el development build.

## Instalar

Desde `app/`:

```powershell
npm install
npx expo install --check
```

La app usa Expo SDK `57.0.27`, React Native `0.86.3`, `expo-dev-client` `57.0.19`, `expo-secure-store` `57.0.4`, `expo-system-ui` `57.0.4` y soporte web con `react-dom` `19.2.3` y `react-native-web` `0.21.2`. Las versiones exactas quedan registradas también en `package-lock.json`. Usa `npx expo install <paquete>` al añadir módulos nativos para mantener la matriz del SDK. Mantén `expo-dev-client` instalado: las pruebas de módulos nativos deben ejecutarse en un development build, no solo en Expo Go.

## Conectar con la API

La URL predeterminada es `http://10.0.2.2:3000/api` en emulador Android y `http://localhost:3000/api` en simulador iOS. En un teléfono físico, define `EXPO_PUBLIC_API_URL` con la IP LAN del ordenador y el puerto del backend, por ejemplo `http://192.168.1.20:3000/api`. El teléfono y el ordenador deben estar en la misma red y el firewall debe permitir el puerto.

Para configurar una IP local en PowerShell desde `app/`:

```powershell
if (-not (Test-Path .env)) { Copy-Item .env.example .env }
Add-Content .env 'EXPO_PUBLIC_API_URL=http://192.168.1.20:3000/api'
```

Sustituye la IP de ejemplo por la dirección LAN del ordenador. `.env` está ignorado por Git y `.env.example` se conserva como plantilla.

Expo incrusta las variables `EXPO_PUBLIC_*` al iniciar el bundler; vuelve a iniciarlo después de cambiar la URL. Para desarrollo local sobre HTTP, Express/CORS debe estar activo y accesible desde el dispositivo. No uses HTTP ni secretos de producción en una app publicada.

## Desarrollo y development build

Con el backend activo y la URL de API configurada, desde `app/` crea e instala el development build Android en un emulador o dispositivo conectado:

```powershell
npm run android
```

Para las siguientes sesiones de desarrollo, inicia Metro en modo development client:

```powershell
npm run dev-client
```

`npm run android` equivale a `expo run:android` y compila el cliente nativo; no es un sustituto de Expo Go. En otra terminal, `npm run dev-client` proporciona el bundle JS y recarga rápida.

`expo run:ios` requiere macOS. EAS Build no está configurado en esta entrega; la preparación de cuentas, firma y builds de tienda se documentará aparte y requerirá autorización.

## Vista previa web

Desde `app/`, inicia la vista de desarrollo en navegador:

```powershell
npm run web
```

Expo muestra la URL local, normalmente `http://localhost:8081`. La vista web sirve para revisar la interfaz y no sustituye las pruebas en Android/iOS ni un development build. En web, el token de la sesión de desarrollo se guarda en `localStorage`; en Android/iOS se mantiene en `expo-secure-store`.

## Recorrido actual

1. Abre la app y crea una cuenta o inicia sesión.
2. Pulsa **Empezar entrenamiento** y registra series con carga, repeticiones y tipo de serie.
3. Finaliza la sesión y consulta el historial.
4. Revisa tus **Rangos** y **PRs**.
5. Crea o aplica **Rutinas**.
6. Crea o entra en **Ligas**.
7. En el **Perfil** actualiza peso corporal y comprueba el estado de conexión del backend.

El backend usa JWT; el cliente guarda el token con `expo-secure-store`. Cada usuario solo ve sus propias sesiones.

## Comprobaciones

```powershell
npx expo install --check
npx expo-doctor
```

La validación completa requiere una instancia local de MySQL/MariaDB migrada y el backend activo; la app también incluye una comprobación de salud del backend para validar el estado de la API.