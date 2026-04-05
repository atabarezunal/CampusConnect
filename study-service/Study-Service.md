# Study Service — Express

← [Volver al README principal](../README.md)

## Descripción

El **Study Service** gestiona los grupos de estudio y sus miembros. Utiliza **Firebase Realtime Database** como base de datos principal para sincronización en tiempo real.

## Detalles técnicos

| Campo | Valor |
|---|---|
| Framework | Express.js |
| Puerto | `3001` |
| Base de datos | Firebase Realtime Database |

---

## Instalación

### Dependencias

- `express`
- `firebase-admin`
- `dotenv`
- `cors`
- `jsonwebtoken`

### Pasos

```bash
cd study-service
npm install
# ⚠️ Importante: Pegar serviceAccountKey.json en la raíz de esta carpeta
npm start
```

> El archivo `serviceAccountKey.json` se descarga desde la consola de Firebase en **Configuración del proyecto → Cuentas de servicio → Generar nueva clave privada**.

---

## Variables de entorno `.env`

```env
JWT_SECRET=             # Debe coincidir con el valor generado en el API Gateway
INTERNAL_API_KEY=       # Clave compartida entre Gateway y microservicios
FIREBASE_DATABASE_URL=  # URL de tu Firebase Realtime Database
```
