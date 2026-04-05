# API Gateway — Laravel

← [Volver al README principal](../README.md)

## Descripción

El **API Gateway** es el punto de entrada único del sistema. Todas las solicitudes externas pasan primero por aquí, donde se valida la autenticación JWT y se redirige al microservicio correspondiente.

## Detalles técnicos

| Campo | Valor |
|---|---|
| Framework | Laravel |
| Puerto | `8000` |
| Base de datos | MySQL |
| Autenticación | JWT (`tymon/jwt-auth`) |

---

## Instalación

### Dependencias principales

- `tymon/jwt-auth`

### Pasos

```bash
cd api-gateway
composer install
cp .env.example .env
php artisan key:generate
php artisan jwt:secret
php artisan migrate
php artisan serve --port=8000
```

---

## Variables de entorno `.env`

```env
APP_KEY=           # Generado con php artisan key:generate
JWT_SECRET=        # Generado con php artisan jwt:secret — copiar este valor a todos los demás servicios
INTERNAL_API_KEY=  # Clave compartida entre Gateway y microservicios
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=
DB_USERNAME=
DB_PASSWORD=
```

> ⚠️ El valor de `JWT_SECRET` debe ser idéntico en todos los microservicios del sistema.
