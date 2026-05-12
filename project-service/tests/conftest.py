import sys
import os
import pytest

sys.path.insert(
    0,
    os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
)

from flask import Flask


@pytest.fixture
def app():

    app = Flask(__name__)

    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'

    return app


@pytest.fixture
def app_context(app):

    with app.app_context():
        yield