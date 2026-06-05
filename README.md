# 🥗 NourishAI — AI-Powered Meal Planner Agent

> A full-stack AI meal planning application built with **FastAPI** (Python) + **React**, powered by **Anthropic Claude**.

![Python](https://img.shields.io/badge/Python-3.11-blue?logo=python)
![React](https://img.shields.io/badge/React-18-61dafb?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![Claude AI](https://img.shields.io/badge/Claude-AI-orange)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

- 🤖 **AI Meal Plan Generation** — Full 7-day plan with breakfast, lunch, dinner & snacks
- 🔄 **Meal Swapping** — Don't like a meal? Get 3 AI-suggested alternatives instantly
- 🛒 **Smart Shopping List** — Auto-generated, organized by category, with checkboxes
- 💬 **Chat Assistant** — Ask questions, request changes, get cooking tips in real-time
- 📊 **Nutrition Analysis** — AI-scored nutritional breakdown with strengths & improvements
- 🎯 **Fully Personalized** — Dietary preferences, allergies, budget, skill level, cuisine
- 🐳 **Docker Ready** — One command local setup with Docker Compose
- 🚀 **Deploy-Ready** — Configs for Railway, Render (backend) + Vercel, Netlify (frontend)

---

## 🖥️ Tech Stack

| Layer     | Technology                        |
|-----------|-----------------------------------|
| Frontend  | React 18, Framer Motion, Axios    |
| Backend   | FastAPI, Python 3.11, Uvicorn     |
| AI        | Anthropic Claude (claude-sonnet)  |
| Deploy    | Railway / Render + Vercel / Netlify |
| Container | Docker + Docker Compose           |
| CI/CD     | GitHub Actions                    |

---

## 📁 Project Structure

```
meal-planner-agent/
├── backend/                  # FastAPI Python backend
│   ├── main.py               # All API routes & Claude integration
│   ├── requirements.txt      # Python dependencies
│   ├── Dockerfile            # Backend Docker config
│   ├── Procfile              # Heroku / Railway start command
│   ├── railway.toml          # Railway deployment config
│   ├── render.yaml           # Render deployment config
│   ├── .env.example          # Environment variables template
│   └── tests/
│       └── test_main.py      # Pytest test suite
│
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── App.js            # Main app (all components)
│   │   └── index.js          # React entry point
│   ├── public/
│   │   └── index.html        # HTML template
│   ├── package.json          # Node dependencies
│   ├── Dockerfile            # Frontend Docker config
│   ├── nginx.conf            # Nginx config for Docker
│   ├── vercel.json           # Vercel deployment config
│   └── .env.example          # Frontend env template
│
├── .github/
│   └── workflows/
│       └── ci.yml            # GitHub Actions CI/CD
├── docker-compose.yml        # Local Docker orchestration
├── netlify.toml              # Netlify deployment config
├── setup.sh                  # One-click local setup script
└── README.md
```

---

## 🚀 Quick Start (Local)

### Option A — Automated Setup

```bash
git clone https://github.com/YOUR_USERNAME/meal-planner-agent.git
cd meal-planner-agent
chmod +x setup.sh && ./setup.sh
```

Then add your API key to `backend/.env` and start both servers.

---

### Option B — Manual Setup

#### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/meal-planner-agent.git
cd meal-planner-agent
```

#### 2. Backend setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create env file
cp .env.example .env
# Edit .env and set your ANTHROPIC_API_KEY

# Start the server
uvicorn main:app --reload --port 8000
```

#### 3. Frontend setup
```bash
cd frontend
cp .env.example .env
npm install
npm start
```

#### 4. Open the app
```
http://localhost:3000
```

---

### Option C — Docker Compose

```bash
# Create backend/.env with your key first
echo "ANTHROPIC_API_KEY=your_key_here" > backend/.env

docker-compose up --build
```

App runs at `http://localhost:3000`

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

| Variable           | Required | Description                        |
|--------------------|----------|------------------------------------|
| `ANTHROPIC_API_KEY`| ✅ Yes   | Your Anthropic API key             |

Get your API key at [console.anthropic.com](https://console.anthropic.com)

### Frontend (`frontend/.env`)

| Variable              | Default                  | Description              |
|-----------------------|--------------------------|--------------------------|
| `REACT_APP_API_URL`   | `http://localhost:8000`  | Backend API URL          |

---

## 🌐 API Endpoints

| Method | Endpoint               | Description                          |
|--------|------------------------|--------------------------------------|
| GET    | `/`                    | Health check                         |
| POST   | `/generate-meal-plan`  | Generate a full 7-day meal plan      |
| POST   | `/chat`                | Chat with the meal planning agent    |
| POST   | `/substitute-meal`     | Get alternative meal suggestions     |
| POST   | `/nutrition-analysis`  | Analyze nutritional quality of plan  |

### Example: Generate Meal Plan

```bash
curl -X POST http://localhost:8000/generate-meal-plan \
  -H "Content-Type: application/json" \
  -d '{
    "dietary_preference": "Vegetarian",
    "calories_goal": 2000,
    "allergies": "nuts",
    "cuisine_preferences": "Mediterranean, Italian",
    "cooking_skill": "intermediate",
    "people_count": 2,
    "budget": "moderate",
    "health_goals": "weight loss"
  }'
```

---

## 🚀 Deployment

### Backend → Railway (Recommended)

1. Push code to GitHub
2. Go to [railway.app](https://railway.app) → New Project → Deploy from GitHub
3. Select the `backend/` folder
4. Add environment variable: `ANTHROPIC_API_KEY=your_key`
5. Railway auto-deploys using `railway.toml`

### Backend → Render

1. Go to [render.com](https://render.com) → New Web Service
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Add `ANTHROPIC_API_KEY` in Environment Variables
5. Deploy — `render.yaml` handles the rest

### Frontend → Vercel (Recommended)

1. Go to [vercel.com](https://vercel.com) → New Project → Import GitHub repo
2. Set **Root Directory** to `frontend`
3. Add environment variable: `REACT_APP_API_URL=https://your-backend-url.railway.app`
4. Deploy

### Frontend → Netlify

1. Go to [netlify.com](https://netlify.com) → New Site → Import from Git
2. `netlify.toml` auto-configures build settings
3. Add env var: `REACT_APP_API_URL=https://your-backend-url`

---

## 🧪 Running Tests

```bash
cd backend
source venv/bin/activate
pip install pytest httpx
pytest tests/ -v
```

---

## 🔧 GitHub Repository Setup

```bash
# 1. Initialize git
git init
git add .
git commit -m "feat: initial NourishAI meal planner agent"

# 2. Create repo on GitHub then push
git remote add origin https://github.com/YOUR_USERNAME/meal-planner-agent.git
git branch -M main
git push -u origin main
```

### Add GitHub Secrets (for CI/CD)

Go to your repo → **Settings → Secrets and variables → Actions → New repository secret**

| Secret Name         | Value                        |
|---------------------|------------------------------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key       |

---

## 🗺️ Roadmap

- [ ] User authentication & saved meal plans
- [ ] PDF export of meal plan & shopping list
- [ ] Calorie & macro tracking dashboard
- [ ] Integration with grocery delivery APIs
- [ ] Mobile app (React Native)
- [ ] Multi-language support

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 🙏 Acknowledgments

- [Anthropic Claude](https://anthropic.com) for the AI backbone
- [FastAPI](https://fastapi.tiangolo.com) for the blazing-fast backend
- [Framer Motion](https://www.framer.com/motion/) for smooth animations

---

<p align="center">Made with ❤️ and 🥗</p>
