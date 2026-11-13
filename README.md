# Gym App

Aplicación de entrenamiento con API REST, rangos de fuerza, PRs, rutinas y
ligas. El proyecto está dividido en:

- `backend/`: Node.js, Express, Sequelize y MariaDB.
- `app/`: cliente React Native con Expo.

## Requisitos

- Git.
- Node.js LTS y npm.
- Docker Desktop iniciado.
- Expo Go en el teléfono para una vista previa rápida, o Android Studio para
  un development build.

## Inicio rápido con Docker y Expo Go

Los comandos siguientes están escritos para PowerShell desde la raíz del
repositorio.

### 1. Instalar dependencias

```powershell
cd backend
npm install
cd ..\app
npm install
cd ..
```

### 2. Configurar el backend

Copia la plantilla de variables de Docker y cambia los secretos de desarrollo:

```powershell
Copy-Item .env.example .env
```

Genera un `JWT_SECRET` aleatorio de al menos 32 caracteres:

```powershell
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Pega el resultado en `JWT_SECRET` dentro de `.env`.

### 3. Iniciar base de datos y API

```powershell
docker compose up -d --build
```

El primer arranque ejecuta las migraciones y carga los datos iniciales. Comprueba
la API:

```powershell
Invoke-RestMethod http://localhost:3000/api/health
```

Debe responder con `ok: true` y una base de datos conectada.

Para detener los servicios:

```powershell
docker compose down
```

Para detenerlos y borrar también los datos locales de la base:

```powershell
docker compose down -v
```

### 4. Configurar la app para un teléfono físico

Obtén la IP LAN del ordenador:

```powershell
Get-NetIPAddress -AddressFamily IPv4 |
  Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } |
  Select-Object IPAddress, InterfaceAlias
```

Copia la plantilla de la app y sustituye la IP por la del ordenador:

```powershell
cd app
Copy-Item .env.example .env
Set-Content .env 'EXPO_PUBLIC_API_URL=http://192.168.1.20:3000/api'
```

El teléfono y el ordenador deben estar en la misma red Wi-Fi. El firewall debe
permitir los puertos `3000` y `8081`.

### 5. Iniciar Expo Go por LAN

```powershell
npx expo start --go --lan
```

Escanea el QR que muestra Expo CLI con Expo Go. Si Expo Go no encuentra el
servidor, selecciona **Enter URL manually** y usa:

```text
exp://IP_DEL_ORDENADOR:8081
```

Ejemplo:

```text
exp://192.168.1.20:8081
```

No uses la URL HTTP del túnel como URL manual de Expo Go. Si el túnel devuelve
`502 Bad Gateway`, usa LAN o un development build.

## Desarrollo de la app

Desde `app/`:

```powershell
npm run web
```

Para un development build Android:

```powershell
npm run android
```

Después de cambiar `EXPO_PUBLIC_API_URL`, reinicia Expo para que Metro vuelva a
inyectar la variable.

## Pruebas y validaciones

Backend:

```powershell
cd backend
npm test
```

App:

```powershell
cd ..\app
npx expo install --check
npx expo-doctor
```

## Solución de problemas

| Problema | Solución |
|---|---|
| Docker no conecta con el daemon | Abre Docker Desktop y espera a que el motor Linux esté listo. |
| `ECONNREFUSED` en el puerto 3000 | Comprueba `docker compose ps` y `Invoke-RestMethod http://localhost:3000/api/health`. |
| Expo Go muestra `502 Bad Gateway` | No uses el túnel; reinicia con `npx expo start --go --lan`. |
| El teléfono no conecta con Metro | Verifica la misma Wi-Fi, la IP LAN y el firewall del puerto 8081. |
| La app no conecta con la API | Verifica `EXPO_PUBLIC_API_URL`, la IP LAN y el firewall del puerto 3000. |
| Falta `JWT_SECRET` | Define un secreto aleatorio en el `.env` de la raíz y reinicia Docker Compose. |

Para más detalle, consulta [backend/README.md](./backend/README.md) y
[app/README.md](./app/README.md).
