# Project Service — Flask

← [Volver al README principal](../README.md)

## Descripción

El **Project Service** gestiona los proyectos colaborativos y sus tareas asociadas. Utiliza **MySQL** como base de datos relacional.

## Detalles técnicos

| Campo | Valor |
|---|---|
| Framework | Flask |
| Puerto | `8002` |
| Base de datos | MySQL |

---

## Instalación

### Dependencias

- `flask`
- `flask_sqlalchemy`
- `pymysql`
- `python-dotenv`
- `PyJWT`

### Pasos

```bash
cd project-service
pip install flask flask_sqlalchemy pymysql python-dotenv PyJWT
python app.py
```

---

## Variables de entorno `.env`

```env
JWT_SECRET=        # Debe coincidir con el valor generado en el API Gateway
INTERNAL_API_KEY=  # Clave compartida entre Gateway y microservicios
DATABASE_URL=mysql+pymysql://usuario:contraseña@localhost/nombre_bd
```
