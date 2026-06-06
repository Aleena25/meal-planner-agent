import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from main import app

client = TestClient(app)


def test_root():
    """Test the root health check endpoint."""
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["status"] == "Meal Planner Agent API is running"


def test_generate_meal_plan_missing_body():
    """Test that missing required fields return 422."""
    response = client.post("/generate-meal-plan", json={})
    assert response.status_code == 422


def test_chat_missing_body():
    """Test that missing required fields return 422."""
    response = client.post("/chat", json={})
    assert response.status_code == 422


@patch("main.client")
def test_chat_success(mock_client):
    """Test the chat endpoint with mocked Anthropic client."""
    mock_response = MagicMock()
    mock_response.content = [MagicMock(text="Here are some great meal prep tips!")]
    mock_client.messages.create.return_value = mock_response

    response = client.post("/chat", json={
        "message": "Give me some meal prep tips",
        "context": ""
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert "response" in data


@patch("main.client")
def test_substitute_meal_success(mock_client):
    """Test the substitute-meal endpoint with mocked client."""
    mock_response = MagicMock()
    mock_response.content = [MagicMock(text='{"alternatives": [{"name": "Oatmeal", "description": "Healthy oats", "calories": 300, "prep_time": "5 mins", "why_good": "High fiber", "ingredients": ["oats", "milk"], "instructions": "Boil and serve"}]}')]
    mock_client.messages.create.return_value = mock_response

    response = client.post("/substitute-meal", json={
        "meal_name": "Scrambled Eggs",
        "meal_type": "breakfast",
        "dietary_preference": "vegetarian",
        "reason": "I want a change"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
