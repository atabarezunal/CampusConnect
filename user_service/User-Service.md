# User Service — Django

← [Volver al README principal](../README.md)

## Descripción

El **User Service** se encarga de la gestión de perfiles de usuario dentro del sistema CampusConnect.

## Detalles técnicos

| Campo | Valor |
|---|---|
| Framework | Django |
| Puerto | `8001` |
| Base de datos | PostgreSQL |

---

## Instalación

### Dependencias

- `Django`
- `djangorestframework`
- `psycopg2-binary`
- `python-dotenv`
- `PyJWT`

### Pasos

```bash
cd user-service
pip install django djangorestframework psycopg2-binary python-dotenv PyJWT
python manage.py migrate
python manage.py runserver 8001
```

---

## Variables de entorno `.env`

```env
JWT_SECRET=        # Debe coincidir con el valor generado en el API Gateway
INTERNAL_API_KEY=  # Clave compartida entre Gateway y microservicios
DB_NAME=
DB_USER=
DB_PASSWORD=
DB_HOST=127.0.0.1
DB_PORT=5432
```
