from unittest.mock import patch, MagicMock
from app.services import ProjectService
from app.models import Project


# TEST 1
def test_create_project_success():

    data = {
        "title": "Proyecto Test",
        "description": "Descripcion"
    }

    fake_project = MagicMock(id_project=1)

    with patch("app.services.Project", return_value=fake_project), \
         patch("app.services.db.session") as session:

        result, status = ProjectService.create_project(data, 10)

        assert status == 201
        assert result["message"] == "Proyecto creado"
        assert result["id"] == 1

        session.add.assert_called_once()
        session.commit.assert_called_once()
        
# TEST 2
def test_get_all_projects(app_context):

    fake_projects = [
        MagicMock(
            id_project=1,
            title="Proyecto 1",
            description="Desc 1",
            owner_id=5
        ),
        MagicMock(
            id_project=2,
            title="Proyecto 2",
            description="Desc 2",
            owner_id=7
        )
    ]

    with patch("app.services.Project.query") as query:

        query.all.return_value = fake_projects

        result, status = ProjectService.get_all_projects()

        assert status == 200
        assert len(result) == 2
        assert result[0]["title"] == "Proyecto 1"


# TEST 3
def test_delete_project_not_found(app_context):

    with patch("app.services.Project.query") as query:

        query.get.return_value = None

        result, status = ProjectService.delete_project(1, 10)

        assert status == 404
        assert "Proyecto no encontrado" in result["error"]


# TEST 4
def test_delete_project_not_owner(app_context):

    fake_project = MagicMock(owner_id=1)

    with patch("app.services.Project.query") as query:

        query.get.return_value = fake_project

        result, status = ProjectService.delete_project(1, 999)

        assert status == 403
        assert "OWNER" in result["error"]


# TEST 5
def test_create_task_success():

    data = {
        "id_project": 1,
        "title": "Tarea Test",
        "status": "pending"
    }

    fake_task = MagicMock()

    with patch("app.services.Task", return_value=fake_task), \
         patch("app.services.db.session") as session:

        result, status = ProjectService.create_task(data)

        assert status == 201
        assert result["message"] == "Tarea creada"

        session.add.assert_called_once()
        session.commit.assert_called_once()