#!/bin/bash
# ─────────────────────────────────────────────────────────────────
# NourishAI — Local Setup Script
# Run: chmod +x setup.sh && ./setup.sh
# ─────────────────────────────────────────────────────────────────

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "  _   _                      _     _        _    ___ "
echo " | \ | | ___  _   _ _ __ (_)___| |__     / \  |_ _|"
echo " |  \| |/ _ \| | | | '__| / __| '_ \   / _ \  | | "
echo " | |\  | (_) | |_| | |  | \__ \ | | | / ___ \ | | "
echo " |_| \_|\___/ \__,_|_|  |_|___/_| |_|/_/   \_\___|"
echo -e "${NC}"
echo "  Meal Planner Agent — Setup"
echo ""

# ── Check prerequisites ───────────────────────────────────────────
echo -e "${YELLOW}Checking prerequisites...${NC}"

if ! command -v python3 &>/dev/null; then
  echo "❌ Python 3 is required. Install from https://python.org"
  exit 1
fi

if ! command -v node &>/dev/null; then
  echo "❌ Node.js is required. Install from https://nodejs.org"
  exit 1
fi

echo "✅ Python $(python3 --version)"
echo "✅ Node $(node --version)"

# ── Backend setup ─────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Setting up backend...${NC}"

cd backend

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "📄 Created backend/.env — please add your ANTHROPIC_API_KEY"
fi

python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt --quiet
echo "✅ Backend dependencies installed"

cd ..

# ── Frontend setup ────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}Setting up frontend...${NC}"

cd frontend

if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "📄 Created frontend/.env"
fi

npm install --silent
echo "✅ Frontend dependencies installed"

cd ..

# ── Done ─────────────────────────────────────────────────────────
echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "  1. Add your API key: edit backend/.env → set ANTHROPIC_API_KEY"
echo "  2. Start backend:  cd backend && source venv/bin/activate && uvicorn main:app --reload"
echo "  3. Start frontend: cd frontend && npm start"
echo "  4. Open:           http://localhost:3000"
echo ""
