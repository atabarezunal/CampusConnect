# CampusConnect

## Descripción

**CampusConnect** es un sistema distribuido basado en arquitectura de microservicios diseñado para mejorar la colaboración entre estudiantes universitarios.

Permite a los usuarios:

-  Crear grupos de estudio
-  Compartir recursos académicos
-  Colaborar en proyectos
-  Recibir notificaciones en tiempo real

---

## Arquitectura

El sistema está construido bajo una arquitectura de **microservicios**, donde cada servicio es independiente y especializado.

### API Gateway
- **Laravel**
- Punto de entrada único para todas las solicitudes
- Manejo de autenticación y routing

### Microservicios

| Servicio        | Tecnología | Descripción |
|----------------|----------|------------|
| Auth           | Laravel  | Autenticación y autorización |
| Users          | Django   | Gestión de usuarios |
| Study Groups   | Express  | Administración de grupos de estudio |
| Projects       | Flask    | Gestión de proyectos colaborativos |
| Notifications  | Express  | Sistema de notificaciones |

---

## Bases de Datos

Cada microservicio utiliza la base de datos más adecuada según su necesidad:

| Servicio        | Base de Datos |
|----------------|--------------|
| Auth           | MySQL        |
| Users          | PostgreSQL   |
| Projects       | PostgreSQL   |
| Study Groups   | Firebase     |
| Notifications  | Firebase     |

---

## Tecnologías utilizadas

- Laravel
- Django
- Express.js
- Flask
- Node.js
- MySQL
- PostgreSQL
- MongoDB
- Firebase

---
##  Modelo Relacional de Base de Datos

- 🔗 [Ver modelo completo (lucidchart)](https://lucid.app/lucidchart/6a07821e-0869-499c-8c9a-6236205f4cf5/edit?invitationId=inv_1f66d37c-e0c5-441f-84ec-7c4f94dc7c0d)
  
---

## Instalación

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/campusconnect.git
cd campusconnect
