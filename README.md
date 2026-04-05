# CampusConnect

## Descripción

**CampusConnect** es un sistema distribuido basado en arquitectura de microservicios diseñado para mejorar la colaboración entre estudiantes universitarios.

Permite a los usuarios:

- Crear grupos de estudio
- Compartir recursos académicos
- Colaborar en proyectos
- Recibir notificaciones en tiempo real

---

## Arquitectura

El sistema está construido bajo una arquitectura de **microservicios**, donde cada servicio es independiente y especializado.

### API Gateway
- **Laravel**
- Punto de entrada único para todas las solicitudes
- Manejo de autenticación y routing

### Microservicios

| Servicio | Tecnología | Descripción | Documentación |
|---|---|---|---|
| Auth | Laravel | Autenticación y autorización | [📄 Ver README](./docs/README.md) |
| Users | Django | Gestión de usuarios | [📄 Ver README](./user_service/README.md) |
| Study Groups | Express | Administración de grupos de estudio | [📄 Ver README](./study-service/README.md) |
| Projects | Flask | Gestión de proyectos colaborativos | [📄 Ver README](./project-service/README.md) |
| Notifications | Express | Sistema de notificaciones | [📄 Ver README](./notification-service/README.md) |

---

## Bases de Datos

Cada microservicio utiliza la base de datos más adecuada según su necesidad:

| Servicio | Base de Datos |
|---|---|
| Auth | MySQL |
| Users | PostgreSQL |
| Projects | MySQL |
| Study Groups | Firebase |
| Notifications | Firebase |

---

## Tecnologías utilizadas

- Laravel
- Django
- Express.js
- Flask
- Node.js
- MySQL
- PostgreSQL
- Firebase

---

## Modelo Relacional de Base de Datos

- 🔗 [Ver modelo completo (Lucidchart)](https://lucid.app/lucidchart/6a07821e-0869-499c-8c9a-6236205f4cf5/edit?invitationId=inv_1f66d37c-e0c5-441f-84ec-7c4f94dc7c0d)

---

## Instalación

### Requisitos Previos

| Herramienta | Versión mínima |
|---|---|
| PHP & Composer | PHP 8.2+ |
| Node.js & npm | Node.js 18+ |
| Python & pip | Python 3.10+ |
| PostgreSQL | Cualquier versión reciente |
| MySQL | Cualquier versión reciente |
| Firebase | Cuenta activa + `serviceAccountKey.json` |

### 1. Clonar el repositorio

```bash
git clone https://github.com/atabarezunal/CampusConnect.git
cd campusconnect
```

### 2. Levantar cada servicio

Consulta el README de cada microservicio para los pasos de instalación detallados:

- [API Gateway (Laravel)](./api-gateway/README.md)
- [User Service (Django)](./user_service/README.md)
- [Study Service (Express)](./study-service/README.md)
- [Project Service (Flask)](./project-service/README.md)
- [Notification Service (Express)](./notification-service/README.md)

### 3. Configuración de seguridad compartida

> ⚠️ **Importante:** Todos los `.env` deben compartir las mismas claves para que la comunicación entre servicios funcione correctamente.

| Variable | Descripción |
|---|---|
| `JWT_SECRET` | Generado en Laravel, debe copiarse a Django, Express y Flask |
| `INTERNAL_API_KEY` | Clave interna para bloquear accesos externos directos |
| `FIREBASE_DATABASE_URL` | URL de Firebase Realtime Database para los servicios Express |

---

## Pruebas de Rendimiento

Las pruebas de carga están implementadas con **Locust** y se encuentran en la carpeta `performance-tests/`.

→ [📄 Ver documentación de pruebas](./performance-tests/README.md)
