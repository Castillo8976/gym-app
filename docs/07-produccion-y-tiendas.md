# Checklist de producción y tiendas

Este documento separa lo que ya está preparado en el repositorio de lo que requiere
cuentas, secretos, infraestructura o revisión legal.

## Backend

- [x] Imagen Docker reproducible: `backend/Dockerfile`.
- [x] CI de instalación, pruebas, auditoría de dependencias y build de imagen.
- [x] Migraciones versionadas y comprobación de migraciones pendientes al arrancar.
- [x] Scripts `backend/scripts/backup.sh` y `restore.sh`.
- [ ] Ejecutar backups programados en almacenamiento externo, probar restauración y definir retención.
- [ ] Publicar detrás de HTTPS con un dominio propio.
- [ ] Configurar secretos fuera del repositorio: `JWT_SECRET`, credenciales de DB y CORS.
- [ ] Conectar un proveedor de correo para recuperación y verificación; mantener `AUTH_EXPOSE_TOKENS=false`.
- [ ] Añadir logs, métricas, alertas y un endpoint de health monitorizado.

## Base de datos

- [ ] Crear una instancia administrada de MySQL/MariaDB.
- [ ] Aplicar migraciones en staging y producción con backup previo.
- [ ] Verificar el flujo de rollback en una copia restaurada, no sobre producción.
- [x] Ejecutar la integración `RUN_DB_INTEGRATION=1` contra la base local de Docker.
- [ ] Confirmar índices, límites de conexión y zona horaria.

## Aplicación móvil

- [ ] Cambiar `EXPO_PUBLIC_API_URL` a la URL HTTPS de producción.
- [ ] Crear un development build y probar Android/iOS en dispositivos reales.
- [ ] Configurar EAS Build, identificadores de paquete, iconos, splash y firma.
- [ ] Probar login, refresh, recuperación/verificación de email, sesiones, rutinas, ligas
      y eliminación de cuenta.
- [ ] Verificar que la eliminación de cuenta sea accesible desde la UI y tenga confirmación.

## Privacidad y publicación

La siguiente información es una plantilla técnica y debe ser revisada por un profesional
antes de publicarse.

- Datos tratados: nombre, email, contraseña derivada, género, fecha de nacimiento opcional,
  peso corporal, entrenamientos, marcas personales, rangos y participación en ligas.
- Finalidad: autenticación, sincronización del entrenamiento, cálculos de progreso y
  funcionamiento de las ligas.
- Seguridad: contraseñas con bcrypt, tokens de acceso de corta duración, refresh tokens
  revocables y tokens de recuperación almacenados como hashes.
- Derechos: acceso, corrección y eliminación de la cuenta desde la aplicación.
- Retención: definir plazo para datos activos, backups y registros técnicos.
- Terceros: declarar proveedor de hosting, base de datos, correo, analítica y tiendas.
- Contacto: definir responsable y correo para solicitudes de privacidad.
- Colombia: revisar Ley 1581 de 2012, Decreto 1377 de 2013 y obligaciones aplicables.

Antes de enviar a las tiendas:

- [ ] Publicar política de privacidad accesible desde la app y las fichas de tienda.
- [ ] Completar formularios de seguridad y privacidad de Google Play y App Store.
- [ ] Configurar clasificación por edades, contenido, capturas y descripción.
- [ ] Registrar cuentas de desarrollador y aceptar acuerdos vigentes.
- [ ] Hacer una beta cerrada y registrar incidencias de producción.
