import json
import pytest
from fastapi.testclient import TestClient

from backend.app.db.base import Base
from backend.app.db.session import engine, SessionLocal
from backend.app.main import app
from backend.app.db import models


@pytest.fixture(scope="module")
def client():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    # seed some memories
    db.add(models.Memory(type="fact", content="C++ was created by Bjarne Stroustrup."))
    db.add(models.Memory(type="pref", content="Prefers dark mode and Vim keybindings."))
    db.commit()
    db.close()

    with TestClient(app) as c:
        yield c


def test_search_endpoint(client):
    r = client.get('/api/v1/memories/search', params={'q': 'dark mode', 'limit': 3})
    assert r.status_code == 200
    body = r.json()
    assert 'data' in body
    assert isinstance(body['data'], list)
