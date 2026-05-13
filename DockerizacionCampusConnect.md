<div align="center">

```
 ██████╗ █████╗ ███╗   ███╗██████╗ ██╗   ██╗███████╗
██╔════╝██╔══██╗████╗ ████║██╔══██╗██║   ██║██╔════╝
██║     ███████║██╔████╔██║██████╔╝██║   ██║███████╗
██║     ██╔══██║██║╚██╔╝██║██╔═══╝ ██║   ██║╚════██║
╚██████╗██║  ██║██║ ╚═╝ ██║██║     ╚██████╔╝███████║
 ╚═════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝      ╚═════╝ ╚══════╝
       ██████╗ ██████╗ ███╗   ██╗███╗   ██╗███████╗ ██████╗████████╗
      ██╔════╝██╔═══██╗████╗  ██║████╗  ██║██╔════╝██╔════╝╚══██╔══╝
      ██║     ██║   ██║██╔██╗ ██║██╔██╗ ██║█████╗  ██║        ██║   
      ██║     ██║   ██║██║╚██╗██║██║╚██╗██║██╔══╝  ██║        ██║   
      ╚██████╗╚██████╔╝██║ ╚████║██║ ╚████║███████╗╚██████╗   ██║   
       ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝╚═╝  ╚═══╝╚══════╝ ╚═════╝   ╚═╝   
```

### 🎓 Plataforma de colaboración universitaria con arquitectura de microservicios

![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Laravel](https://img.shields.io/badge/Laravel-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)
![Django](https://img.shields.io/badge/Django-092E20?style=for-the-badge&logo=django&logoColor=white)
![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)
![Express](https://img.shields.io/badge/Express-404D59?style=for-the-badge&logo=express&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-005C84?style=for-the-badge&logo=mysql&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)

</div>

---

## 📋 Tabla de Contenidos

- [🔧 Requisitos Previos](#-requisitos-previos)
- [🚀 Instalación Paso a Paso](#-instalación-paso-a-paso)
  - [1 · Clonar el repositorio](#1--clonar-el-repositorio)
  - [2 · Configurar variables de entorno](#2--configurar-variables-de-entorno)
  - [3 · Configurar Firebase](#3--configurar-firebase)
  - [4 · Levantar contenedores](#4--levantar-contenedores)
  - [5 · Verificar contenedores](#5--verificar-contenedores)
- [🌐 Puertos del Sistema](#-puertos-del-sistema)
- [🧪 Flujo de Pruebas](#-flujo-de-pruebas)
- [🛠️ Comandos Útiles](#️-comandos-útiles)

---

## 🔧 Requisitos Previos

> ⚠️ **Asegúrate de tener instaladas las siguientes herramientas antes de comenzar.**

| Herramienta | Versión | Notas |
|:-----------:|:-------:|:-----:|
| 🐋 **Docker Desktop** | Última | Requerido |
| 🧩 **Docker Compose** | Incluido | Viene con Docker Desktop |


---

## 🚀 Instalación Paso a Paso

### 1 · Clonar el repositorio

```bash
git clone https://github.com/atabarezunal/CampusConnect.git
cd CampusConnect
```

---

### 2 · Configurar variables de entorno

Copia el .env.example en un archivo **`.env`** en la raíz del proyecto y configuralo debidamente tus credenciales

```env
# ──────────────────────────────────────────
# 🔗  URLs INTERNAS  (Entre servicios)
# ──────────────────────────────────────────
USER_SERVICE_URL=http://user-service:8001
PROJECT_SERVICE_URL=http://project-service:8002
STUDY_SERVICE_URL=http://study-service:3001
NOTIFICATION_SERVICE_URL=http://notification-service:8003

# ──────────────────────────────────────────
# 🔥  FIREBASE
# ──────────────────────────────────────────
STUDY_FIREBASE_DATABASE_URL=https://YOUR_FIREBASE.firebaseio.com/
NOTIFICATION_FIREBASE_DATABASE_URL=https://YOUR_FIREBASE.firebaseio.com/
```

> 💡 **Tip:** Reemplaza `REPLACE_WITH_YOUR_KEY` con tu clave de Laravel y configura tus URLs de Firebase reales.

---

### 3 · Configurar Firebase

Coloca los archivos de credenciales del **Firebase Admin SDK** en la siguiente estructura:

```
📁 firebase/
├── 📄 study-service.json
└── 📄 notification-service.json
```

> 🔥 Estos archivos los obtienes desde la consola de Firebase → *Configuración del proyecto* → *Cuentas de servicio*.

---

### 4 · Levantar contenedores

Desde la raíz del proyecto, ejecuta:

```bash
docker compose up --build
```

> ⏳ La primera vez puede tardar varios minutos mientras se descargan e instalan las dependencias de todos los servicios.

---

### 5 · Verificar contenedores

```bash
docker ps
```

✅ Deberías ver los siguientes **7 contenedores** activos:

| # | Contenedor | Estado |
|:-:|:----------:|:------:|
| 1 | `api-gateway` | 🟢 Running |
| 2 | `user-service` | 🟢 Running |
| 3 | `project-service` | 🟢 Running |
| 4 | `study-service` | 🟢 Running |
| 5 | `notification-service` | 🟢 Running |
| 6 | `mysql-db` | 🟢 Running |
| 7 | `postgres-db` | 🟢 Running |

---

## 🌐 Puertos del Sistema

```
                    ┌─────────────────────────────────────────┐
                    │           ARQUITECTURA DE RED           │
                    └─────────────────────────────────────────┘

  Cliente / Postman
        │
        ▼
┌──────────────────┐
│   API Gateway    │  ◄──── :8000  (Laravel)
└────────┬─────────┘
         │
    ┌────┴──────────────────────────────────┐
    │                                       │
    ▼                                       ▼
┌──────────┐  :8001    ┌──────────────┐  :8002
│  Django  │ User Svc  │    Flask     │ Project Svc
└──────────┘           └──────────────┘
    │                                       │
    ▼                                       ▼
┌──────────┐  :5432    ┌──────────────┐  :3306
│PostgreSQL│           │    MySQL     │
└──────────┘           └──────────────┘

┌──────────────────┐  :3001   ┌────────────────────┐  :8003
│  Study Service   │          │ Notification Svc   │
│   (Express)      │          │    (Express)       │
└──────────────────┘          └────────────────────┘
         │                              │
         └──────────────┬───────────────┘
                        ▼
                 🔥 Firebase RTDB
```

| Servicio | Puerto | Tecnología |
|:--------:|:------:|:----------:|
| 🌐 API Gateway | **8000** | Laravel |
| 👤 User Service | **8001** | Django |
| 📁 Project Service | **8002** | Flask |
| 📚 Study Service | **3001** | Express |
| 🔔 Notification Service | **8003** | Express |
| 🐘 PostgreSQL | **5432** | — |
| 🐬 MySQL | **3306** | — |

---

## 🧪 Flujo de Pruebas

> Ejecuta los siguientes comandos en orden para probar todos los endpoints del sistema. Guarda el **token JWT** que te devuelve el login.

### 1️⃣ Registro de usuario

```bash
curl -X POST http://localhost:8000/api/register \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alejo",
    "email": "alejo@test.com",
    "password": "12345678"
  }'
```

---

### 2️⃣ Login

```bash
curl -X POST http://localhost:8000/api/login \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alejo@test.com",
    "password": "12345678"
  }'
```

> 🔑 **Copia el `token` JWT de la respuesta** y úsalo en las siguientes solicitudes como `TU_TOKEN`.

---

### 3️⃣ Obtener usuario autenticado

```bash
curl http://localhost:8000/api/me \
  -H "Authorization: Bearer TU_TOKEN"
```

---

### 4️⃣ Crear perfil `(Django)`

```bash
curl -X POST http://localhost:8000/api/profile \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 1,
    "bio": "Estudiante de Ingeniería",
    "career": "Ingeniería de Sistemas",
    "semester": 7
  }'
```

---

### 5️⃣ Crear skill

```bash
curl -X POST http://localhost:8000/api/skills \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Docker"
  }'
```

---

### 6️⃣ Crear grupo de estudio `(Express)`

```bash
curl -X POST http://localhost:8000/api/study-groups \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Grupo Docker",
    "id_subject": "INF-001",
    "description": "Grupo para practicar Docker"
  }'
```

---

### 7️⃣ Obtener grupos de estudio

```bash
curl http://localhost:8000/api/study-groups \
  -H "Authorization: Bearer TU_TOKEN"
```

---

### 8️⃣ Crear proyecto `(Flask)`

```bash
curl -X POST http://localhost:8000/api/projects \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Proyecto Microservicios",
    "description": "Proyecto final Docker"
  }'
```

---

### 9️⃣ Obtener proyectos

```bash
curl http://localhost:8000/api/projects \
  -H "Authorization: Bearer TU_TOKEN"
```

---

### 🔟 Crear tarea de proyecto

```bash
curl -X POST http://localhost:8000/api/tasks \
  -H "Authorization: Bearer TU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "id_project": 1,
    "title": "Configurar Docker",
    "status": "pending"
  }'
```

---

### 1️⃣1️⃣ Obtener tareas

```bash
curl http://localhost:8000/api/tasks/1 \
  -H "Authorization: Bearer TU_TOKEN"
```

---

### 1️⃣2️⃣ Obtener notificaciones

```bash
curl http://localhost:8000/api/my-notifications \
  -H "Authorization: Bearer TU_TOKEN"
```

---

## 🛠️ Comandos Útiles

### ♻️ Reiniciar contenedores

```bash
docker compose restart
```

### 🛑 Detener contenedores

```bash
docker compose down
```

### 🔨 Reconstruir imágenes

```bash
docker compose up --build
```

### 📋 Ver logs por servicio

```bash
# API Gateway
docker compose logs api-gateway

# User Service
docker compose logs user-service

# Project Service
docker compose logs project-service

# Study Service
docker compose logs study-service

# Notification Service
docker compose logs notification-service
```

> 💡 **Tip:** Agrega `-f` al final de cualquier comando de logs para seguirlos en tiempo real:
> ```bash
> docker compose logs -f api-gateway
> ```

---

<div align="center">

**¿Problemas con la instalación?** Abre un issue en el repositorio 🐛

[![GitHub](https://img.shields.io/badge/GitHub-atabarezunal%2FCampusConnect-181717?style=for-the-badge&logo=github)](https://github.com/atabarezunal/CampusConnect)

*Hecho para la comunidad universitaria*

</div>
