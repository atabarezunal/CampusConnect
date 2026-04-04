from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Project(db.Model):
    __tablename__ = 'projects'

    id_project = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100))
    description = db.Column(db.Text)
    owner_id = db.Column(db.Integer)

    members = db.relationship('ProjectMember', backref='project', cascade="all, delete-orphan")
    tasks = db.relationship('Task', backref='project', cascade="all, delete-orphan")


class ProjectMember(db.Model):
    __tablename__ = 'project_members'
    id = db.Column(db.Integer, primary_key=True)
    id_project = db.Column(db.Integer, db.ForeignKey('projects.id_project'))
    user_id = db.Column(db.Integer)
    role = db.Column(db.String(50))


class Task(db.Model):
    __tablename__ = 'tasks'
    id_task = db.Column(db.Integer, primary_key=True)
    id_project = db.Column(db.Integer, db.ForeignKey('projects.id_project'))
    title = db.Column(db.String(100))
    status = db.Column(db.String(50))