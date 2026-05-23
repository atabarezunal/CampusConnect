from app.models import db, Project, ProjectMember, Task

class ProjectService:

    @staticmethod
    def create_project(data, owner_id):
        project = Project(
            title=data['title'],
            description=data['description'],
            owner_id=int(owner_id)
        )
        db.session.add(project)
        db.session.flush()
        # El owner también es miembro con rol 'OWNER'
        owner_member = ProjectMember(
            id_project=project.id_project,
            user_id=int(owner_id),
            role='OWNER'
        )
        db.session.add(owner_member)
        db.session.commit()
        return {"message": "Proyecto creado", "id": project.id_project}, 201

    @staticmethod
    def get_user_projects(user_id):
        uid = int(user_id)
        # Proyectos donde es owner o miembro
        member_project_ids = db.session.query(ProjectMember.id_project)\
            .filter(ProjectMember.user_id == uid).subquery()
        projects = Project.query.filter(
            db.or_(
                Project.owner_id == uid,
                Project.id_project.in_(member_project_ids)
            )
        ).all()
        return [{
            "id_project": p.id_project,
            "title":       p.title,
            "description": p.description,
            "owner_id":    p.owner_id,
        } for p in projects], 200

    @staticmethod
    def delete_project(id_project, current_user_id):
        project = Project.query.get(id_project)
        if not project:
            return {"error": "Proyecto no encontrado"}, 404
        if project.owner_id != int(current_user_id):
            return {"error": "Solo el OWNER puede eliminar el proyecto"}, 403
        db.session.delete(project)
        db.session.commit()
        return {"message": "Proyecto eliminado"}, 200

    @staticmethod
    def get_members(id_project):
        members = ProjectMember.query.filter_by(id_project=id_project).all()
        return [{
            "user_id":    m.user_id,
            "role":       m.role,
            "id_project": m.id_project,
        } for m in members], 200

    @staticmethod
    def add_member(data, requester_id):
        # Solo OWNER o MANAGER pueden añadir
        requester = ProjectMember.query.filter_by(
            id_project=data['id_project'],
            user_id=int(requester_id)
        ).first()
        if not requester or requester.role not in ('OWNER', 'MANAGER'):
            return {"error": "Sin permisos para añadir miembros"}, 403

        existing = ProjectMember.query.filter_by(
            id_project=data['id_project'],
            user_id=data['user_id']
        ).first()
        if existing:
            return {"error": "El usuario ya es miembro"}, 409

        member = ProjectMember(
            id_project=data['id_project'],
            user_id=data['user_id'],
            role=data.get('role', 'CONTRIBUTOR')
        )
        db.session.add(member)
        db.session.commit()
        return {"message": "Miembro agregado"}, 201

    @staticmethod
    def remove_member(id_project, target_user_id, requester_id):
        requester = ProjectMember.query.filter_by(
            id_project=id_project,
            user_id=int(requester_id)
        ).first()
        if not requester or requester.role not in ('OWNER', 'MANAGER'):
            return {"error": "Sin permisos para eliminar miembros"}, 403
        if int(target_user_id) == int(requester_id):
            return {"error": "No puedes eliminarte a ti mismo"}, 400

        member = ProjectMember.query.filter_by(
            id_project=id_project,
            user_id=int(target_user_id)
        ).first()
        if not member:
            return {"error": "Miembro no encontrado"}, 404

        db.session.delete(member)
        db.session.commit()
        return {"message": "Miembro eliminado"}, 200

    @staticmethod
    def create_task(data):
        task = Task(
            id_project=data['id_project'],
            title=data['title'],
            status=data.get('status', 'pending')
        )
        db.session.add(task)
        db.session.commit()
        return {
            "message": "Tarea creada",
            "id_task": task.id_task,
            "title":   task.title,
            "status":  task.status,
        }, 201

    @staticmethod
    def get_tasks_by_project(id_project):
        tasks = Task.query.filter_by(id_project=id_project).all()
        return [{
            "id_task":    t.id_task,
            "title":      t.title,
            "status":     t.status,
            "id_project": t.id_project,
        } for t in tasks], 200

    @staticmethod
    def update_task_status(id_task, status, user_id):
        task = Task.query.get(id_task)
        if not task:
            return {"error": "Tarea no encontrada"}, 404
        # Cualquier miembro del proyecto puede actualizar
        member = ProjectMember.query.filter_by(
            id_project=task.id_project,
            user_id=int(user_id)
        ).first()
        if not member:
            return {"error": "No eres miembro del proyecto"}, 403
        task.status = status
        db.session.commit()
        return {"message": "Estado actualizado", "status": task.status}, 200