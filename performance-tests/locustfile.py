import random
from locust import HttpUser, task, between, events

class CampusConnectTester(HttpUser):
    # Tiempo de espera entre 1 y 3 segundos (simula humano)
    wait_time = between(1, 3)
    
    # URL del Gateway de Laravel
    host = "http://localhost:8000"

    def on_start(self):
        """ Se ejecuta al iniciar cada usuario simulado para obtener su token """
        login_payload = {
            "email": "prueba@unal", #ESTE USUARIO DEBE DE ESTAR CREADO EN LA BASE DE DATOS PARA PROBARLO
            "password": "prueba"
        }
        
        with self.client.post("/api/login", json=login_payload, catch_response=True) as response:
            if response.status_code == 200:
                self.token = response.json().get('access_token')
                self.headers = {
                    "Authorization": f"Bearer {self.token}",
                    "Accept": "application/json"
                }
            else:
                response.failure(f"Fallo de Login: {response.text}")


    @task(3)
    def test_flask_get_projects(self):
        """ Prueba de carga: Obtener proyectos del usuario """
        self.client.get("/api/projects", headers=self.headers, name="Flask: Get Projects")

    @task(1)
    def test_flask_create_project(self):
        """ Prueba de estrés: Creación de proyectos en MySQL """
        payload = {
            "title": f"Proyecto Stress {random.randint(1, 9999)}",
            "description": "Prueba de rendimiento con Locust y Flask"
        }
        self.client.post("/api/projects", json=payload, headers=self.headers, name="Flask: Create Project")

    @task(1)
    def test_flask_create_task(self):
        """ Prueba de carga: Crear tareas en proyectos """
        
        payload = {
            "id_project": 2,
            "title": "Tarea de carga masiva",
            "status": "pending"
        }
        self.client.post("/api/tasks", json=payload, headers=self.headers, name="Flask: Create Task")


    @task(2)
    def test_django_profile(self):
        """ Prueba User Service (Django + Postgres) """
        self.client.get("/api/profile/2", headers=self.headers, name="Django: Get Profile")

    @task(2)
    def test_express_study_groups(self):
        """ Prueba Study Service (Express + Firebase) """
        self.client.get("/api/study-groups", headers=self.headers, name="Express: List Groups")

    @task(1)
    def test_express_notifications(self):
        """ Prueba Notification Service (Express + Firebase) """
        self.client.get("/api/my-notifications", headers=self.headers, name="Express: Get Notifications")
