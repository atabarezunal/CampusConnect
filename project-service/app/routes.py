from flask import Blueprint, request, jsonify
from app.services import ProjectService
from app.middleware import secure_route

bp = Blueprint('routes', __name__)

@bp.route('/projects', methods=['POST'])
@secure_route
def create_project():
    result, status = ProjectService.create_project(request.json, request.user_id)
    return jsonify(result), status

@bp.route('/projects', methods=['GET'])
@secure_route
def get_projects():
    result, status = ProjectService.get_user_projects(request.user_id)
    return jsonify(result), status

@bp.route('/projects/<int:id_project>', methods=['DELETE'])
@secure_route
def delete_project(id_project):
    result, status = ProjectService.delete_project(id_project, request.user_id)
    return jsonify(result), status

@bp.route('/projects/<int:id_project>/members', methods=['GET'])
@secure_route
def get_members(id_project):
    result, status = ProjectService.get_members(id_project)
    return jsonify(result), status

@bp.route('/projects/members', methods=['POST'])
@secure_route
def add_member():
    result, status = ProjectService.add_member(request.json, request.user_id)
    return jsonify(result), status

@bp.route('/projects/<int:id_project>/members', methods=['DELETE'])
@secure_route
def remove_member(id_project):
    data = request.json
    result, status = ProjectService.remove_member(
        id_project, data['user_id'], request.user_id
    )
    return jsonify(result), status

@bp.route('/tasks', methods=['POST'])
@secure_route
def create_task():
    result, status = ProjectService.create_task(request.json)
    return jsonify(result), status

@bp.route('/tasks/<int:id_project>', methods=['GET'])
@secure_route
def get_tasks(id_project):
    result, status = ProjectService.get_tasks_by_project(id_project)
    return jsonify(result), status

@bp.route('/tasks/<int:id_task>', methods=['PATCH'])
@secure_route
def update_task(id_task):
    result, status = ProjectService.update_task_status(
        id_task, request.json.get('status'), request.user_id
    )
    return jsonify(result), status