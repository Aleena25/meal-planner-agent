from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional
import google.generativeai as genai
import json
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.environ.get("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.0-flash")
app = FastAPI(title="Meal Planner Agent API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

SYSTEM_PROMPT = """You are an expert meal planning agent and nutritionist. Your role is to create personalized, practical, and delicious meal plans.

When given user preferences, you will:
1. Create a detailed weekly meal plan (7 days, 3 meals + snacks per day)
2. Provide nutritional highlights for each day
3. Generate a consolidated shopping list organized by category
4. Offer meal prep tips to save time
5. Suggest recipe substitutions for dietary restrictions

Always respond in valid JSON format with this exact structure:
{
  "week_summary": "Brief overview of the meal plan theme and goals",
  "daily_calories_target": number,
  "days": [
    {
      "day": "Monday",
      "total_calories": number,
      "meals": {
        "breakfast": {
          "name": "Meal name",
          "description": "Brief description",
          "calories": number,
          "prep_time": "X mins",
          "ingredients": ["ingredient 1", "ingredient 2"],
          "instructions": "Brief cooking instructions"
        },
        "lunch": {
          "name": "Meal name",
          "description": "Brief description",
          "calories": number,
          "prep_time": "X mins",
          "ingredients": ["ingredient 1", "ingredient 2"],
          "instructions": "Brief cooking instructions"
        },
        "dinner": {
          "name": "Meal name",
          "description": "Brief description",
          "calories": number,
          "prep_time": "X mins",
          "ingredients": ["ingredient 1", "ingredient 2"],
          "instructions": "Brief cooking instructions"
        },
        "snack": {
          "name": "Snack name",
          "description": "Brief description",
          "calories": number,
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
  "estimated_weekly_cost": "$XX-XX"
}

Be creative, practical, and health-conscious. Vary cuisines and cooking methods throughout the week.
IMPORTANT: Return ONLY the raw JSON. No markdown, no code blocks, no extra text."""


def call_gemini(prompt: str, max_tokens: int = 8000) -> str:
    """Call Gemini API and return text response."""
    response = model.generate_content(
        prompt,
        generation_config=genai.types.GenerationConfig(
            max_output_tokens=max_tokens,
            temperature=0.7,
        )
    )
    text = response.text.strip()
    # Strip markdown code blocks if present
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
    return {"status": "Meal Planner Agent API is running (Gemini)"}


@app.post("/generate-meal-plan")
async def generate_meal_plan(request: MealPlanRequest):
    """Generate a full weekly meal plan based on user preferences."""

    full_prompt = f"""{SYSTEM_PROMPT}

Now create a personalized weekly meal plan for a user with these preferences:
- Dietary preference: {request.dietary_preference}
- Daily calorie goal: {request.calories_goal} calories
- Allergies/restrictions: {request.allergies or "None"}
- Cuisine preferences: {request.cuisine_preferences or "Varied"}
- Cooking skill level: {request.cooking_skill}
- Number of people: {request.people_count}
- Budget: {request.budget}
- Health goals: {request.health_goals or "General wellness"}

Return ONLY valid JSON, no other text."""

    try:
        response_text = call_gemini(full_prompt, max_tokens=8000)
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

    full_prompt = f"""You are a helpful meal planning assistant. You can answer questions about nutrition,
suggest recipe modifications, explain cooking techniques, and help modify meal plans.
Be conversational, friendly, and practical. Keep responses concise but helpful (2-4 paragraphs max).
If asked to modify the meal plan, provide specific actionable suggestions.

User message: {message.message}{context_prompt}"""

    try:
        response_text = call_gemini(full_prompt, max_tokens=1000)
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

    prompt = f"""Suggest 3 alternative {meal_type} options to replace "{meal_name}".
Dietary preference: {dietary_preference}
Reason for change: {reason}

Respond ONLY in this JSON format, no extra text:
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
        response_text = call_gemini(prompt, max_tokens=1500)
        alternatives = json.loads(response_text)
        return {"success": True, **alternatives}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/nutrition-analysis")
async def analyze_nutrition(data: dict):
    """Get detailed nutrition analysis for the meal plan."""

    meal_plan_summary = data.get("meal_plan_summary", "")

    prompt = f"""Provide a brief nutritional analysis for this meal plan:
{meal_plan_summary}

Respond ONLY in this JSON format, no extra text:
{{
  "overall_score": 8,
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["suggestion 1", "suggestion 2"],
  "macro_balance": "Description of macro nutrient balance",
  "micronutrient_highlights": ["highlight 1", "highlight 2"],
  "hydration_tip": "Hydration recommendation"
}}"""

    try:
        response_text = call_gemini(prompt, max_tokens=800)
        analysis = json.loads(response_text)
        return {"success": True, "analysis": analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
