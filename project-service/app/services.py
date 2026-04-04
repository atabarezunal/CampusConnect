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
        db.session.commit()
        return {"message": "Proyecto creado", "id": project.id_project}, 201

    @staticmethod
    def get_all_projects():
        projects = Project.query.all()
        return [{
            "id_project": p.id_project,
            "title": p.title,
            "description": p.description,
            "owner_id": p.owner_id
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
        return {"message": "Proyecto y sus dependencias eliminados"}, 200

    @staticmethod
    def add_member(data):
        member = ProjectMember(
            id_project=data['id_project'],
            user_id=data['user_id'],
            role=data['role']
        )
        db.session.add(member)
        db.session.commit()
        return {"message": "Miembro agregado"}, 201

    @staticmethod
    def create_task(data):
        task = Task(
            id_project=data['id_project'],
            title=data['title'],
            status=data['status']
        )
        db.session.add(task)
        db.session.commit()
        return {"message": "Tarea creada"}, 201

    @staticmethod
    def get_tasks_by_project(id_project):
        tasks = Task.query.filter_by(id_project=id_project).all()
        return [{
            "id_task": t.id_task,
            "title": t.title,
            "status": t.status
        } for t in tasks], 200