# App móvil - Gym App

Cliente React Native con Expo para Android e iOS. El flujo actual permite crear una cuenta o iniciar sesión, consultar ejercicios, crear una sesión, guardar series en kilogramos y repeticiones, y ver el historial con el detalle de sus series. No calcula ni muestra rangos o 1RM.

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

La app usa Expo SDK `57.0.26`, React Native `0.86.3`, `expo-dev-client` `57.0.19`, `expo-secure-store` `57.0.4` y `expo-system-ui` `57.0.4`. Las versiones exactas quedan registradas también en `package-lock.json`. Usa `npx expo install <paquete>` al añadir módulos nativos para mantener la matriz del SDK. Mantén `expo-dev-client` instalado: las pruebas de módulos nativos deben ejecutarse en un development build, no solo en Expo Go.

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

## Recorrido

1. Abre la app en el development build y crea una cuenta con nombre, correo, contraseña, género del perfil y peso corporal en kg, o inicia sesión.
2. Pulsa **Empezar entrenamiento**.
3. Elige un ejercicio del catálogo y registra la carga en kg y las repeticiones.
4. Guarda cada serie; el contador confirma el guardado y **Finalizar entrenamiento** cierra la sesión.
5. Abre **Historial** y toca una sesión para consultar sus series.

El backend usa JWT; el cliente guarda el token con `expo-secure-store`. Cada usuario ve únicamente sus propias sesiones. El endpoint guarda cada serie individualmente, por lo que si se interrumpe la red durante una sesión se pueden haber persistido solo algunas series; consulta el historial antes de reintentar.

## Comprobaciones

```powershell
npx expo install --check
npx expo-doctor
```

La validación completa requiere conectar el development build a una instancia local de MySQL/MariaDB migrada y sembrada. Los rangos permanecen deshabilitados hasta definir sus reglas.