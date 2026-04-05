# Notification Service — Express

← [Volver al README principal](../README.md)

## Descripción

El **Notification Service** gestiona el registro y la consulta de notificaciones del sistema usando **Firebase Realtime Database**.

## Detalles técnicos

| Campo | Valor |
|---|---|
| Framework | Express.js |
| Puerto | `8003` |
| Base de datos | Firebase Realtime Database |

---

## Instalación

### Dependencias

- `express`
- `firebase-admin`
- `dotenv`
- `cors`

### Pasos

```bash
cd notification-service
npm install
# ⚠️ Importante: Pegar serviceAccountKey.json en la raíz de esta carpeta
node server.js
```

> El archivo `serviceAccountKey.json` se descarga desde la consola de Firebase en **Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada**.

---

## Variables de entorno `.env`

```env
INTERNAL_API_KEY=       # Clave compartida entre Gateway y microservicios
FIREBASE_DATABASE_URL=  # URL de tu Firebase Realtime Database
```
