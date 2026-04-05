# Pruebas de Rendimiento — Locust

← [Volver al README principal](../README.md)

## Descripción

Las pruebas de carga del sistema están implementadas con **Locust** y se encuentran en esta carpeta (`performance-tests/`). Permiten simular múltiples usuarios concurrentes y medir el comportamiento del sistema bajo estrés.

---

## Instalación

```bash
pip install locust mysql-connector-python
```

---

## Ejecución

Sigue estos pasos en orden:

**1. Poblar la base de datos con datos de prueba:**
```bash
python seed_projects.py
```

**2. Iniciar Locust:**
```bash
locust -f locustfile.py
```

**3. Abrir el panel de control en el navegador:**

→ [http://localhost:8089](http://localhost:8089)

Desde el panel puedes configurar el número de usuarios concurrentes y la tasa de generación de usuarios antes de iniciar la prueba.
