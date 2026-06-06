from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
from groq import Groq
import json
import os
from dotenv import load_dotenv

load_dotenv()

client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
MODEL = "llama-3.3-70b-versatile"

app = FastAPI(title="Meal Planner Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """You are an expert meal planning agent and nutritionist. Your role is to create personalized, practical, and delicious meal plans.

Always respond in valid JSON format with this exact structure and nothing else — no markdown, no code blocks, just raw JSON:
{
  "week_summary": "Brief overview of the meal plan theme and goals",
  "daily_calories_target": 2000,
  "days": [
    {
      "day": "Monday",
      "total_calories": 2000,
      "meals": {
        "breakfast": {
          "name": "Meal name",
          "description": "Brief description",
          "calories": 400,
          "prep_time": "10 mins",
          "ingredients": ["ingredient 1", "ingredient 2"],
          "instructions": "Brief cooking instructions"
        },
        "lunch": {
          "name": "Meal name",
          "description": "Brief description",
          "calories": 600,
          "prep_time": "15 mins",
          "ingredients": ["ingredient 1", "ingredient 2"],
          "instructions": "Brief cooking instructions"
        },
        "dinner": {
          "name": "Meal name",
          "description": "Brief description",
          "calories": 700,
          "prep_time": "30 mins",
          "ingredients": ["ingredient 1", "ingredient 2"],
          "instructions": "Brief cooking instructions"
        },
        "snack": {
          "name": "Snack name",
          "description": "Brief description",
          "calories": 200,
          "ingredients": ["ingredient 1"]
        }
      },
      "nutrition_highlight": "Key nutrition note for the day"
    }
  ],
  "shopping_list": {
    "produce": ["item 1", "item 2"],
    "proteins": ["item 1"],
    "dairy": ["item 1"],
    "grains": ["item 1"],
    "pantry": ["item 1"],
    "frozen": ["item 1"]
  },
  "meal_prep_tips": ["tip 1", "tip 2", "tip 3"],
  "estimated_weekly_cost": "$50-70"
}

CRITICAL: Return ONLY the raw JSON object. No markdown, no ```json, no extra text before or after."""


def call_groq(system: str, user: str, max_tokens: int = 8000) -> str:
    """Call Groq API and return cleaned text response."""
    response = client.chat.completions.create(
        model=MODEL,
        max_tokens=max_tokens,
        temperature=0.7,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ]
    )
    text = response.choices[0].message.content.strip()
    # Strip markdown code blocks if model adds them anyway
    if "```json" in text:
        text = text.split("```json")[1].split("```")[0].strip()
    elif "```" in text:
        text = text.split("```")[1].split("```")[0].strip()
    return text


class MealPlanRequest(BaseModel):
    dietary_preference: str
    calories_goal: int
    allergies: Optional[str] = ""
    cuisine_preferences: Optional[str] = ""
    cooking_skill: str = "intermediate"
    people_count: int = 1
    budget: str = "moderate"
    health_goals: Optional[str] = ""


class ChatMessage(BaseModel):
    message: str
    context: Optional[str] = ""


@app.get("/")
def root():
    return {"status": "Meal Planner Agent API is running (Groq/Llama)"}


@app.post("/generate-meal-plan")
async def generate_meal_plan(request: MealPlanRequest):
    """Generate a full weekly meal plan based on user preferences."""

    user_message = f"""Create a personalized weekly meal plan with these preferences:
- Dietary preference: {request.dietary_preference}
- Daily calorie goal: {request.calories_goal} calories
- Allergies/restrictions: {request.allergies or "None"}
- Cuisine preferences: {request.cuisine_preferences or "Varied"}
- Cooking skill level: {request.cooking_skill}
- Number of people: {request.people_count}
- Budget: {request.budget}
- Health goals: {request.health_goals or "General wellness"}

Return ONLY the raw JSON for all 7 days (Monday through Sunday). No extra text."""

    try:
        response_text = call_groq(SYSTEM_PROMPT, user_message, max_tokens=8000)
        meal_plan = json.loads(response_text)
        return {"success": True, "meal_plan": meal_plan}
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse meal plan JSON: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI API error: {str(e)}")


@app.post("/chat")
async def chat_with_agent(message: ChatMessage):
    """Chat with the meal planner agent for modifications or questions."""

    context_prompt = ""
    if message.context:
        context_prompt = f"\n\nCurrent meal plan context:\n{message.context}"

    system = """You are a helpful meal planning assistant. Answer questions about nutrition,
suggest recipe modifications, explain cooking techniques, and help modify meal plans.
Be conversational, friendly, and practical. Keep responses concise (2-4 paragraphs max)."""

    try:
        response_text = call_groq(system, message.message + context_prompt, max_tokens=1000)
        return {"success": True, "response": response_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI API error: {str(e)}")


@app.post("/substitute-meal")
async def substitute_meal(data: dict):
    """Get alternative meal suggestions for a specific meal."""

    meal_name = data.get("meal_name", "")
    meal_type = data.get("meal_type", "")
    dietary_preference = data.get("dietary_preference", "")
    reason = data.get("reason", "I want a change")

    system = "You are a meal planning expert. Return ONLY raw JSON, no markdown, no extra text."
    user = f"""Suggest 3 alternative {meal_type} options to replace "{meal_name}".
Dietary preference: {dietary_preference}
Reason for change: {reason}

Return ONLY this JSON structure:
{{
  "alternatives": [
    {{
      "name": "Meal name",
      "description": "Brief description",
      "calories": 400,
      "prep_time": "15 mins",
      "why_good": "Why this is a great alternative",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "instructions": "Brief cooking instructions"
    }}
  ]
}}"""

    try:
        response_text = call_groq(system, user, max_tokens=1500)
        alternatives = json.loads(response_text)
        return {"success": True, **alternatives}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/nutrition-analysis")
async def analyze_nutrition(data: dict):
    """Get detailed nutrition analysis for the meal plan."""

    meal_plan_summary = data.get("meal_plan_summary", "")

    system = "You are a nutritionist. Return ONLY raw JSON, no markdown, no extra text."
    user = f"""Provide a nutritional analysis for this meal plan:
{meal_plan_summary}

Return ONLY this JSON:
{{
  "overall_score": 8,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["suggestion 1", "suggestion 2"],
  "macro_balance": "Description of macro nutrient balance",
  "micronutrient_highlights": ["highlight 1", "highlight 2"],
  "hydration_tip": "Hydration recommendation"
}}"""

    try:
        response_text = call_groq(system, user, max_tokens=800)
        analysis = json.loads(response_text)
        return {"success": True, "analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
