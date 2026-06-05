import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import {
  ChefHat, Leaf, ShoppingCart, MessageCircle, Sparkles,
  Sun, Moon, Coffee, UtensilsCrossed, Apple, Clock,
  Flame, ArrowRight, RotateCcw, Send, X, CheckCircle,
  TrendingUp, Star, Lightbulb, Package
} from 'lucide-react';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// ─── STYLES ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700&family=DM+Sans:wght@300;400;500;600&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --cream: #faf7f2;
    --warm-white: #fff9f0;
    --clay: #c5785a;
    --clay-light: #d4927a;
    --forest: #3d5a3e;
    --forest-light: #4a7c4e;
    --charcoal: #2c2c2c;
    --muted: #7a7069;
    --border: #e8e0d5;
    --shadow: rgba(44, 44, 44, 0.08);
  }

  body {
    font-family: 'DM Sans', sans-serif;
    background-color: var(--cream);
    color: var(--charcoal);
    min-height: 100vh;
  }

  .app-shell {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* NAV */
  .nav {
    position: sticky; top: 0; z-index: 100;
    background: rgba(250, 247, 242, 0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--border);
    padding: 0 2rem;
    height: 64px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .nav-logo {
    display: flex; align-items: center; gap: 10px;
    font-family: 'Playfair Display', serif;
    font-size: 1.4rem;
    font-weight: 700;
    color: var(--clay);
    text-decoration: none;
  }

  .nav-logo svg { color: var(--forest); }

  .nav-tabs {
    display: flex; gap: 4px;
    background: var(--border);
    padding: 4px;
    border-radius: 10px;
  }

  .nav-tab {
    padding: 6px 16px;
    border-radius: 7px;
    border: none;
    background: transparent;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.2s;
    display: flex; align-items: center; gap: 6px;
  }

  .nav-tab.active {
    background: white;
    color: var(--clay);
    box-shadow: 0 1px 4px var(--shadow);
  }

  /* HERO / SETUP */
  .hero {
    padding: 5rem 2rem 4rem;
    text-align: center;
    max-width: 700px;
    margin: 0 auto;
  }

  .hero-badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: #fff;
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--forest);
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 8px var(--shadow);
  }

  .hero h1 {
    font-family: 'Playfair Display', serif;
    font-size: clamp(2.2rem, 5vw, 3.5rem);
    font-weight: 700;
    line-height: 1.15;
    margin-bottom: 1rem;
    color: var(--charcoal);
  }

  .hero h1 span { color: var(--clay); }

  .hero p {
    font-size: 1.05rem;
    color: var(--muted);
    line-height: 1.7;
    margin-bottom: 3rem;
  }

  /* FORM */
  .setup-form {
    background: white;
    border-radius: 20px;
    padding: 2rem;
    max-width: 680px;
    margin: 0 auto 4rem;
    box-shadow: 0 4px 24px var(--shadow);
    border: 1px solid var(--border);
  }

  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.2rem;
    margin-bottom: 1.5rem;
  }

  .form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .form-group.full { grid-column: 1 / -1; }

  .form-group label {
    font-size: 0.78rem;
    font-weight: 600;
    color: var(--muted);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .form-control {
    padding: 10px 14px;
    border: 1.5px solid var(--border);
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    color: var(--charcoal);
    background: var(--warm-white);
    transition: border-color 0.2s;
    outline: none;
  }

  .form-control:focus { border-color: var(--clay); }

  select.form-control { cursor: pointer; }

  .chips {
    display: flex; flex-wrap: wrap; gap: 8px;
  }

  .chip {
    padding: 6px 14px;
    border-radius: 20px;
    border: 1.5px solid var(--border);
    background: var(--warm-white);
    font-size: 0.82rem;
    font-weight: 500;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .chip.selected {
    background: var(--clay);
    border-color: var(--clay);
    color: white;
  }

  .generate-btn {
    width: 100%;
    padding: 14px;
    background: var(--forest);
    color: white;
    border: none;
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center; gap: 10px;
    transition: all 0.2s;
    margin-top: 0.5rem;
  }

  .generate-btn:hover:not(:disabled) {
    background: var(--forest-light);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(61,90,62,0.3);
  }

  .generate-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

  /* LOADING */
  .loading-screen {
    padding: 5rem 2rem;
    text-align: center;
  }

  .loading-icon {
    width: 72px; height: 72px;
    background: var(--forest);
    border-radius: 20px;
    display: flex; align-items: center; justify-content: center;
    margin: 0 auto 1.5rem;
    color: white;
  }

  .loading-screen h2 {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    margin-bottom: 0.5rem;
  }

  .loading-screen p { color: var(--muted); margin-bottom: 2rem; }

  .loading-bar {
    width: 240px;
    height: 4px;
    background: var(--border);
    border-radius: 2px;
    margin: 0 auto;
    overflow: hidden;
  }

  .loading-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--forest), var(--clay));
    border-radius: 2px;
    animation: load 2.5s ease-in-out infinite;
  }

  @keyframes load {
    0% { width: 0%; }
    50% { width: 80%; }
    100% { width: 100%; }
  }

  /* MAIN PLAN */
  .plan-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .plan-header {
    display: flex; align-items: flex-start; justify-content: space-between;
    margin-bottom: 2rem; gap: 1rem; flex-wrap: wrap;
  }

  .plan-header h2 {
    font-family: 'Playfair Display', serif;
    font-size: 2rem;
    font-weight: 700;
  }

  .plan-header p { color: var(--muted); margin-top: 4px; max-width: 500px; }

  .plan-header-actions { display: flex; gap: 10px; flex-shrink: 0; }

  .btn-outline {
    padding: 9px 18px;
    border: 1.5px solid var(--border);
    background: white;
    border-radius: 10px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 500;
    cursor: pointer;
    display: flex; align-items: center; gap: 6px;
    color: var(--charcoal);
    transition: all 0.2s;
  }

  .btn-outline:hover { border-color: var(--clay); color: var(--clay); }

  /* STAT CARDS */
  .stats-row {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 12px;
    margin-bottom: 2rem;
  }

  .stat-card {
    background: white;
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 1.2rem;
    display: flex; align-items: center; gap: 12px;
  }

  .stat-icon {
    width: 42px; height: 42px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .stat-card .value {
    font-family: 'Playfair Display', serif;
    font-size: 1.3rem;
    font-weight: 700;
    color: var(--charcoal);
  }

  .stat-card .label {
    font-size: 0.75rem;
    color: var(--muted);
    font-weight: 500;
  }

  /* DAYS SCROLL */
  .day-tabs {
    display: flex; gap: 8px;
    overflow-x: auto;
    padding-bottom: 8px;
    margin-bottom: 1.5rem;
    scrollbar-width: none;
  }

  .day-tabs::-webkit-scrollbar { display: none; }

  .day-tab {
    flex-shrink: 0;
    padding: 8px 18px;
    border-radius: 10px;
    border: 1.5px solid var(--border);
    background: white;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.2s;
  }

  .day-tab.active {
    background: var(--clay);
    border-color: var(--clay);
    color: white;
  }

  /* MEALS GRID */
  .meals-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .meal-card {
    background: white;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.4rem;
    transition: box-shadow 0.2s;
    position: relative;
    overflow: hidden;
  }

  .meal-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
  }

  .meal-card.breakfast::before { background: linear-gradient(90deg, #f6c94e, #f0a757); }
  .meal-card.lunch::before { background: linear-gradient(90deg, #5cb85c, #3d9b3d); }
  .meal-card.dinner::before { background: linear-gradient(90deg, #c5785a, #a85b3e); }
  .meal-card.snack::before { background: linear-gradient(90deg, #9b59b6, #7d3cad); }

  .meal-card:hover { box-shadow: 0 4px 20px var(--shadow); }

  .meal-type-badge {
    display: inline-flex; align-items: center; gap: 5px;
    font-size: 0.72rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 10px;
    padding: 3px 10px;
    border-radius: 6px;
  }

  .meal-type-badge.breakfast { background: #fef3cd; color: #b8860b; }
  .meal-type-badge.lunch { background: #d4edda; color: #1e7e34; }
  .meal-type-badge.dinner { background: #fde8e1; color: #c5785a; }
  .meal-type-badge.snack { background: #f0e6f6; color: #7d3cad; }

  .meal-name {
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem;
    font-weight: 600;
    margin-bottom: 6px;
    color: var(--charcoal);
    line-height: 1.3;
  }

  .meal-desc {
    font-size: 0.82rem;
    color: var(--muted);
    line-height: 1.5;
    margin-bottom: 12px;
  }

  .meal-meta {
    display: flex; gap: 12px; margin-bottom: 12px;
  }

  .meal-meta span {
    display: flex; align-items: center; gap: 4px;
    font-size: 0.78rem;
    color: var(--muted);
    font-weight: 500;
  }

  .meal-meta svg { opacity: 0.7; }

  .ingredients-list {
    display: flex; flex-wrap: wrap; gap: 5px;
    margin-bottom: 12px;
  }

  .ingredient-tag {
    font-size: 0.72rem;
    padding: 3px 9px;
    background: var(--cream);
    border-radius: 5px;
    color: var(--muted);
    border: 1px solid var(--border);
  }

  .swap-btn {
    width: 100%;
    padding: 8px;
    border: 1.5px dashed var(--border);
    background: transparent;
    border-radius: 8px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.8rem;
    font-weight: 500;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.2s;
    display: flex; align-items: center; justify-content: center; gap: 5px;
  }

  .swap-btn:hover { border-color: var(--clay); color: var(--clay); background: #fde8e1; }

  .day-nutrition {
    background: white;
    border: 1px solid var(--border);
    border-radius: 14px;
    padding: 1.2rem 1.5rem;
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 2rem;
    font-size: 0.88rem;
    color: var(--forest);
    font-weight: 500;
  }

  .day-nutrition svg { flex-shrink: 0; color: var(--forest); }

  /* SECTIONS */
  .section {
    background: white;
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .section-title {
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 1.2rem;
    display: flex; align-items: center; gap: 8px;
  }

  .shopping-categories {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }

  .shopping-category h4 {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: var(--muted);
    margin-bottom: 8px;
    padding-bottom: 6px;
    border-bottom: 1px solid var(--border);
  }

  .shopping-category ul {
    list-style: none;
    display: flex; flex-direction: column; gap: 5px;
  }

  .shopping-category li {
    display: flex; align-items: center; gap: 7px;
    font-size: 0.85rem;
    color: var(--charcoal);
    cursor: pointer;
    transition: color 0.15s;
  }

  .shopping-category li:hover { color: var(--clay); }

  .check-icon {
    width: 16px; height: 16px;
    border: 1.5px solid var(--border);
    border-radius: 4px;
    flex-shrink: 0;
    transition: all 0.15s;
    display: flex; align-items: center; justify-content: center;
  }

  .check-icon.checked {
    background: var(--forest);
    border-color: var(--forest);
    color: white;
  }

  .tips-list {
    display: flex; flex-direction: column; gap: 10px;
  }

  .tip-item {
    display: flex; align-items: flex-start; gap: 10px;
    padding: 10px;
    background: var(--cream);
    border-radius: 10px;
    font-size: 0.88rem;
    line-height: 1.5;
    color: var(--charcoal);
  }

  .tip-item svg { flex-shrink: 0; margin-top: 2px; color: var(--forest); }

  /* CHAT */
  .chat-wrapper {
    max-width: 780px;
    margin: 0 auto;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    height: calc(100vh - 64px);
  }

  .chat-header {
    text-align: center;
    margin-bottom: 1.5rem;
  }

  .chat-header h2 {
    font-family: 'Playfair Display', serif;
    font-size: 1.6rem;
    font-weight: 700;
  }

  .chat-header p { color: var(--muted); font-size: 0.88rem; margin-top: 4px; }

  .chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 1rem;
    background: white;
    border: 1px solid var(--border);
    border-radius: 16px;
    margin-bottom: 1rem;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
  }

  .chat-bubble {
    display: flex; align-items: flex-start; gap: 10px;
    max-width: 85%;
  }

  .chat-bubble.user { margin-left: auto; flex-direction: row-reverse; }

  .bubble-avatar {
    width: 32px; height: 32px;
    border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.8rem;
    flex-shrink: 0;
  }

  .bubble-avatar.ai { background: var(--forest); color: white; }
  .bubble-avatar.user { background: var(--clay); color: white; }

  .bubble-text {
    padding: 10px 14px;
    border-radius: 14px;
    font-size: 0.88rem;
    line-height: 1.6;
  }

  .chat-bubble.ai .bubble-text {
    background: var(--cream);
    border: 1px solid var(--border);
    border-top-left-radius: 4px;
    color: var(--charcoal);
  }

  .chat-bubble.user .bubble-text {
    background: var(--clay);
    color: white;
    border-top-right-radius: 4px;
  }

  .chat-input-row {
    display: flex; gap: 10px;
  }

  .chat-input {
    flex: 1;
    padding: 12px 16px;
    border: 1.5px solid var(--border);
    border-radius: 12px;
    font-family: 'DM Sans', sans-serif;
    font-size: 0.9rem;
    outline: none;
    transition: border-color 0.2s;
    background: white;
  }

  .chat-input:focus { border-color: var(--clay); }

  .chat-send {
    width: 46px; height: 46px;
    background: var(--clay);
    border: none;
    border-radius: 12px;
    color: white;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    transition: all 0.2s;
    flex-shrink: 0;
  }

  .chat-send:hover:not(:disabled) { background: var(--clay-light); transform: translateY(-1px); }
  .chat-send:disabled { opacity: 0.5; cursor: not-allowed; }

  .quick-questions {
    display: flex; flex-wrap: wrap; gap: 7px;
    margin-bottom: 10px;
  }

  .quick-q {
    padding: 6px 12px;
    border: 1.5px solid var(--border);
    background: white;
    border-radius: 20px;
    font-size: 0.78rem;
    font-weight: 500;
    color: var(--muted);
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .quick-q:hover { border-color: var(--clay); color: var(--clay); }

  /* MODAL */
  .modal-backdrop {
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(4px);
    z-index: 200;
    display: flex; align-items: center; justify-content: center;
    padding: 1rem;
  }

  .modal {
    background: white;
    border-radius: 20px;
    padding: 1.8rem;
    max-width: 520px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0,0,0,0.2);
  }

  .modal-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 1.4rem;
  }

  .modal-header h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.2rem;
    font-weight: 600;
  }

  .modal-close {
    width: 32px; height: 32px;
    border: 1px solid var(--border);
    background: white;
    border-radius: 8px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    color: var(--muted);
    transition: all 0.2s;
  }

  .modal-close:hover { border-color: var(--clay); color: var(--clay); }

  .alt-card {
    border: 1.5px solid var(--border);
    border-radius: 12px;
    padding: 1rem;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .alt-card:hover { border-color: var(--clay); transform: translateY(-1px); }

  .alt-card h4 {
    font-family: 'Playfair Display', serif;
    font-size: 1rem;
    font-weight: 600;
    margin-bottom: 5px;
  }

  .alt-card p { font-size: 0.82rem; color: var(--muted); margin-bottom: 8px; line-height: 1.4; }

  .alt-card .why { font-size: 0.78rem; color: var(--forest); font-weight: 500; }

  /* ANALYSIS */
  .analysis-grid {
    display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
  }

  .score-ring {
    display: flex; flex-direction: column; align-items: center;
    padding: 1.5rem;
    background: var(--cream);
    border-radius: 14px;
    grid-column: 1 / -1;
  }

  .score-number {
    font-family: 'Playfair Display', serif;
    font-size: 3.5rem;
    font-weight: 700;
    color: var(--forest);
    line-height: 1;
  }

  .score-label { font-size: 0.8rem; color: var(--muted); font-weight: 500; margin-top: 4px; }

  .analysis-list { list-style: none; }
  .analysis-list li {
    display: flex; align-items: flex-start; gap: 7px;
    font-size: 0.85rem; padding: 6px 0;
    border-bottom: 1px solid var(--border); line-height: 1.4;
  }
  .analysis-list li:last-child { border-bottom: none; }
  .analysis-list li svg { flex-shrink: 0; margin-top: 2px; }

  @media (max-width: 640px) {
    .form-grid { grid-template-columns: 1fr; }
    .nav-tabs { display: none; }
    .plan-wrapper, .chat-wrapper { padding: 1rem; }
    .meals-grid { grid-template-columns: 1fr; }
    .analysis-grid { grid-template-columns: 1fr; }
  }
`;

// ─── HELPER ───────────────────────────────────────────────────────────────────
const MealIcon = ({ type }) => {
  const icons = {
    breakfast: <Coffee size={13} />,
    lunch: <Sun size={13} />,
    dinner: <Moon size={13} />,
    snack: <Apple size={13} />
  };
  return icons[type] || null;
};

const DIETARY_OPTIONS = ['Omnivore', 'Vegetarian', 'Vegan', 'Keto', 'Paleo', 'Mediterranean', 'Gluten-Free', 'Dairy-Free'];
const CUISINE_OPTIONS = ['Italian', 'Asian', 'Mexican', 'Mediterranean', 'American', 'Indian', 'French', 'Middle Eastern'];
const QUICK_QUESTIONS = [
  'Can I meal prep on Sundays?',
  'What are good protein substitutes?',
  'How do I store these meals?',
  'Make it lower in calories',
  'Add more variety to breakfasts',
  'What can I eat for late-night snacks?'
];

// ─── APP ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState('setup'); // setup | loading | plan
  const [activeTab, setActiveTab] = useState('planner');
  const [mealPlan, setMealPlan] = useState(null);
  const [activeDay, setActiveDay] = useState(0);
  const [checkedItems, setCheckedItems] = useState({});
  const [swapModal, setSwapModal] = useState(null);
  const [alternatives, setAlternatives] = useState([]);
  const [loadingSwap, setLoadingSwap] = useState(false);
  const [analysisModal, setAnalysisModal] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [chatMessages, setChatMessages] = useState([
    { role: 'ai', text: "👋 Hi! I'm your meal planning assistant. Ask me anything about your meal plan, nutrition, or cooking tips!" }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const [form, setForm] = useState({
    dietary_preference: 'Omnivore',
    calories_goal: 2000,
    allergies: '',
    cuisine_preferences: [],
    cooking_skill: 'intermediate',
    people_count: 1,
    budget: 'moderate',
    health_goals: ''
  });

  useEffect(() => {
    const tag = document.createElement('style');
    tag.textContent = styles;
    document.head.appendChild(tag);
    return () => document.head.removeChild(tag);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const toggleCuisine = (c) => {
    setForm(f => ({
      ...f,
      cuisine_preferences: f.cuisine_preferences.includes(c)
        ? f.cuisine_preferences.filter(x => x !== c)
        : [...f.cuisine_preferences, c]
    }));
  };

  const generatePlan = async () => {
    setView('loading');
    try {
      const res = await axios.post(`${API_BASE}/generate-meal-plan`, {
        ...form,
        cuisine_preferences: form.cuisine_preferences.join(', ')
      });
      setMealPlan(res.data.meal_plan);
      setView('plan');
      toast.success('Your meal plan is ready!');
    } catch (e) {
      toast.error('Failed to generate plan. Check your API key.');
      setView('setup');
    }
  };

  const handleSwap = async (meal, type, dayIdx) => {
    setSwapModal({ meal, type, dayIdx });
    setLoadingSwap(true);
    setAlternatives([]);
    try {
      const res = await axios.post(`${API_BASE}/substitute-meal`, {
        meal_name: meal.name,
        meal_type: type,
        dietary_preference: form.dietary_preference,
        reason: 'I want a change'
      });
      setAlternatives(res.data.alternatives || []);
    } catch {
      toast.error('Could not fetch alternatives');
    }
    setLoadingSwap(false);
  };

  const applySwap = (alt) => {
    const updated = JSON.parse(JSON.stringify(mealPlan));
    updated.days[swapModal.dayIdx].meals[swapModal.type] = alt;
    setMealPlan(updated);
    setSwapModal(null);
    toast.success(`Swapped to ${alt.name}!`);
  };

  const handleAnalysis = async () => {
    setAnalysisModal(true);
    if (analysis) return;
    try {
      const summary = mealPlan.days.slice(0, 3).map(d =>
        `${d.day}: ${Object.values(d.meals).map(m => m.name).join(', ')} (~${d.total_calories} cal)`
      ).join('\n');
      const res = await axios.post(`${API_BASE}/nutrition-analysis`, { meal_plan_summary: summary });
      setAnalysis(res.data.analysis);
    } catch {
      toast.error('Analysis failed');
    }
  };

  const sendChat = async (msg) => {
    const text = msg || chatInput.trim();
    if (!text) return;
    setChatInput('');
    setChatMessages(m => [...m, { role: 'user', text }]);
    setChatLoading(true);
    try {
      const context = mealPlan ? `Week plan: ${mealPlan.week_summary}. Target: ${mealPlan.daily_calories_target} cal/day.` : '';
      const res = await axios.post(`${API_BASE}/chat`, { message: text, context });
      setChatMessages(m => [...m, { role: 'ai', text: res.data.response }]);
    } catch {
      setChatMessages(m => [...m, { role: 'ai', text: 'Sorry, I had trouble connecting. Please try again.' }]);
    }
    setChatLoading(false);
  };

  const currentDay = mealPlan?.days?.[activeDay];

  // ── SETUP VIEW ────────────────────────────────────────────────────────────
  if (view === 'setup') return (
    <div className="app-shell">
      <Toaster position="top-right" />
      <nav className="nav">
        <a className="nav-logo"><ChefHat size={22} /> NourishAI</a>
      </nav>
      <div className="hero">
        <div className="hero-badge"><Sparkles size={13} /> Powered by Claude AI</div>
        <h1>Your personal<br /><span>meal planning</span> agent</h1>
        <p>Tell us your preferences and we'll craft a full week of delicious, nutritious meals — complete with recipes, shopping lists, and prep tips.</p>
      </div>

      <motion.div className="setup-form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="form-grid">
          <div className="form-group">
            <label>Dietary Preference</label>
            <select className="form-control" value={form.dietary_preference} onChange={e => setForm(f => ({ ...f, dietary_preference: e.target.value }))}>
              {DIETARY_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Daily Calories Goal</label>
            <input type="number" className="form-control" value={form.calories_goal} min={1000} max={4000} step={50}
              onChange={e => setForm(f => ({ ...f, calories_goal: parseInt(e.target.value) }))} />
          </div>
          <div className="form-group">
            <label>Cooking Skill</label>
            <select className="form-control" value={form.cooking_skill} onChange={e => setForm(f => ({ ...f, cooking_skill: e.target.value }))}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div className="form-group">
            <label>People to Feed</label>
            <input type="number" className="form-control" value={form.people_count} min={1} max={10}
              onChange={e => setForm(f => ({ ...f, people_count: parseInt(e.target.value) }))} />
          </div>
          <div className="form-group">
            <label>Budget</label>
            <select className="form-control" value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}>
              <option value="budget">Budget-friendly</option>
              <option value="moderate">Moderate</option>
              <option value="premium">Premium</option>
            </select>
          </div>
          <div className="form-group">
            <label>Allergies / Restrictions</label>
            <input type="text" className="form-control" placeholder="e.g. nuts, shellfish" value={form.allergies}
              onChange={e => setForm(f => ({ ...f, allergies: e.target.value }))} />
          </div>
          <div className="form-group full">
            <label>Cuisine Preferences (pick any)</label>
            <div className="chips">
              {CUISINE_OPTIONS.map(c => (
                <button key={c} className={`chip ${form.cuisine_preferences.includes(c) ? 'selected' : ''}`}
                  onClick={() => toggleCuisine(c)}>{c}</button>
              ))}
            </div>
          </div>
          <div className="form-group full">
            <label>Health Goals</label>
            <input type="text" className="form-control" placeholder="e.g. lose weight, build muscle, manage diabetes"
              value={form.health_goals} onChange={e => setForm(f => ({ ...f, health_goals: e.target.value }))} />
          </div>
        </div>
        <button className="generate-btn" onClick={generatePlan}>
          <Sparkles size={18} /> Generate My Meal Plan <ArrowRight size={16} />
        </button>
      </motion.div>
    </div>
  );

  // ── LOADING VIEW ──────────────────────────────────────────────────────────
  if (view === 'loading') return (
    <div className="app-shell">
      <motion.div className="loading-screen" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <motion.div className="loading-icon" animate={{ rotate: [0, 10, -10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
          <ChefHat size={32} />
        </motion.div>
        <h2>Crafting your meal plan…</h2>
        <p>Our AI is designing a personalized week of meals just for you.</p>
        <div className="loading-bar"><div className="loading-fill" /></div>
      </motion.div>
    </div>
  );

  // ── PLAN / CHAT VIEWS ─────────────────────────────────────────────────────
  return (
    <div className="app-shell">
      <Toaster position="top-right" />

      <nav className="nav">
        <a className="nav-logo"><ChefHat size={22} /> NourishAI</a>
        <div className="nav-tabs">
          {[
            { id: 'planner', icon: <UtensilsCrossed size={14} />, label: 'Meal Plan' },
            { id: 'shopping', icon: <ShoppingCart size={14} />, label: 'Shopping' },
            { id: 'chat', icon: <MessageCircle size={14} />, label: 'Ask AI' }
          ].map(t => (
            <button key={t.id} className={`nav-tab ${activeTab === t.id ? 'active' : ''}`} onClick={() => setActiveTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <button className="btn-outline" onClick={() => { setView('setup'); setMealPlan(null); setAnalysis(null); }}>
          <RotateCcw size={14} /> New Plan
        </button>
      </nav>

      <AnimatePresence mode="wait">

        {/* PLANNER TAB */}
        {activeTab === 'planner' && (
          <motion.div key="planner" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="plan-wrapper">
              <div className="plan-header">
                <div>
                  <h2>Your Weekly Meal Plan</h2>
                  <p>{mealPlan?.week_summary}</p>
                </div>
                <div className="plan-header-actions">
                  <button className="btn-outline" onClick={handleAnalysis}>
                    <TrendingUp size={14} /> Nutrition Analysis
                  </button>
                </div>
              </div>

              <div className="stats-row">
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#fef3cd' }}>
                    <Flame size={18} style={{ color: '#b8860b' }} />
                  </div>
                  <div>
                    <div className="value">{mealPlan?.daily_calories_target?.toLocaleString()}</div>
                    <div className="label">Calories / Day</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#d4edda' }}>
                    <Leaf size={18} style={{ color: '#1e7e34' }} />
                  </div>
                  <div>
                    <div className="value">{form.dietary_preference}</div>
                    <div className="label">Diet Type</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#fde8e1' }}>
                    <ShoppingCart size={18} style={{ color: '#c5785a' }} />
                  </div>
                  <div>
                    <div className="value">{mealPlan?.estimated_weekly_cost || '—'}</div>
                    <div className="label">Est. Weekly Cost</div>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon" style={{ background: '#f0e6f6' }}>
                    <Star size={18} style={{ color: '#7d3cad' }} />
                  </div>
                  <div>
                    <div className="value">{form.cooking_skill}</div>
                    <div className="label">Skill Level</div>
                  </div>
                </div>
              </div>

              <div className="day-tabs">
                {mealPlan?.days?.map((d, i) => (
                  <button key={i} className={`day-tab ${activeDay === i ? 'active' : ''}`} onClick={() => setActiveDay(i)}>
                    {d.day}
                  </button>
                ))}
              </div>

              {currentDay && (
                <>
                  <div className="day-nutrition">
                    <Lightbulb size={16} />
                    <span><strong>{currentDay.day}:</strong> {currentDay.nutrition_highlight} — ~{currentDay.total_calories?.toLocaleString()} cal</span>
                  </div>

                  <div className="meals-grid">
                    {Object.entries(currentDay.meals).map(([type, meal]) => (
                      <motion.div key={type} className={`meal-card ${type}`}
                        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                        <div className={`meal-type-badge ${type}`}>
                          <MealIcon type={type} />
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </div>
                        <div className="meal-name">{meal.name}</div>
                        <div className="meal-desc">{meal.description}</div>
                        <div className="meal-meta">
                          <span><Flame size={12} /> {meal.calories} cal</span>
                          {meal.prep_time && <span><Clock size={12} /> {meal.prep_time}</span>}
                        </div>
                        {meal.ingredients && (
                          <div className="ingredients-list">
                            {meal.ingredients.slice(0, 5).map((ing, i) => (
                              <span key={i} className="ingredient-tag">{ing}</span>
                            ))}
                            {meal.ingredients.length > 5 && <span className="ingredient-tag">+{meal.ingredients.length - 5} more</span>}
                          </div>
                        )}
                        <button className="swap-btn" onClick={() => handleSwap(meal, type, activeDay)}>
                          <RotateCcw size={12} /> Swap this meal
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}

              {mealPlan?.meal_prep_tips && (
                <div className="section">
                  <div className="section-title"><Lightbulb size={18} color="var(--forest)" /> Meal Prep Tips</div>
                  <div className="tips-list">
                    {mealPlan.meal_prep_tips.map((tip, i) => (
                      <div key={i} className="tip-item">
                        <CheckCircle size={15} />
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* SHOPPING TAB */}
        {activeTab === 'shopping' && (
          <motion.div key="shopping" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="plan-wrapper">
              <div className="plan-header">
                <div>
                  <h2>Shopping List</h2>
                  <p>Everything you need for the full week. Tap items to check them off.</p>
                </div>
                <div className="plan-header-actions">
                  <button className="btn-outline" onClick={() => {
                    const all = {};
                    Object.entries(mealPlan?.shopping_list || {}).forEach(([cat, items]) =>
                      items.forEach(item => { all[`${cat}-${item}`] = true; })
                    );
                    setCheckedItems(all);
                    toast.success('All items checked!');
                  }}>
                    <CheckCircle size={14} /> Check All
                  </button>
                  <button className="btn-outline" onClick={() => { setCheckedItems({}); toast('List cleared'); }}>
                    <RotateCcw size={14} /> Clear
                  </button>
                </div>
              </div>

              <div className="section">
                <div className="shopping-categories">
                  {mealPlan?.shopping_list && Object.entries(mealPlan.shopping_list).map(([category, items]) => (
                    <div key={category} className="shopping-category">
                      <h4><Package size={12} style={{ display: 'inline', marginRight: 5 }} />{category}</h4>
                      <ul>
                        {items.map((item, i) => {
                          const key = `${category}-${item}`;
                          return (
                            <li key={i} onClick={() => setCheckedItems(c => ({ ...c, [key]: !c[key] }))}
                              style={{ textDecoration: checkedItems[key] ? 'line-through' : 'none', opacity: checkedItems[key] ? 0.5 : 1 }}>
                              <div className={`check-icon ${checkedItems[key] ? 'checked' : ''}`}>
                                {checkedItems[key] && <CheckCircle size={10} />}
                              </div>
                              {item}
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* CHAT TAB */}
        {activeTab === 'chat' && (
          <motion.div key="chat" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="chat-wrapper">
              <div className="chat-header">
                <h2>Ask your meal agent</h2>
                <p>Get nutrition advice, recipe tips, or request changes to your plan</p>
              </div>

              <div className="chat-messages">
                {chatMessages.map((m, i) => (
                  <div key={i} className={`chat-bubble ${m.role}`}>
                    <div className={`bubble-avatar ${m.role}`}>
                      {m.role === 'ai' ? <ChefHat size={14} /> : 'Me'}
                    </div>
                    <div className="bubble-text">{m.text}</div>
                  </div>
                ))}
                {chatLoading && (
                  <div className="chat-bubble ai">
                    <div className="bubble-avatar ai"><ChefHat size={14} /></div>
                    <div className="bubble-text" style={{ color: 'var(--muted)' }}>Thinking…</div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="quick-questions">
                {QUICK_QUESTIONS.map((q, i) => (
                  <button key={i} className="quick-q" onClick={() => sendChat(q)}>{q}</button>
                ))}
              </div>

              <div className="chat-input-row">
                <input className="chat-input" placeholder="Ask anything about your meals or nutrition…"
                  value={chatInput} onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendChat()} disabled={chatLoading} />
                <button className="chat-send" onClick={() => sendChat()} disabled={chatLoading || !chatInput.trim()}>
                  <Send size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>

      {/* SWAP MODAL */}
      <AnimatePresence>
        {swapModal && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setSwapModal(null)}>
            <motion.div className="modal" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Swap "{swapModal.meal?.name}"</h3>
                <button className="modal-close" onClick={() => setSwapModal(null)}><X size={14} /></button>
              </div>
              {loadingSwap
                ? <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>Finding alternatives…</p>
                : alternatives.map((alt, i) => (
                  <div key={i} className="alt-card" onClick={() => applySwap(alt)}>
                    <h4>{alt.name}</h4>
                    <p>{alt.description}</p>
                    <div className="why">✓ {alt.why_good}</div>
                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                        <Flame size={11} style={{ display: 'inline' }} /> {alt.calories} cal
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
                        <Clock size={11} style={{ display: 'inline' }} /> {alt.prep_time}
                      </span>
                    </div>
                  </div>
                ))
              }
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ANALYSIS MODAL */}
      <AnimatePresence>
        {analysisModal && (
          <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setAnalysisModal(false)}>
            <motion.div className="modal" initial={{ scale: 0.9 }} animate={{ scale: 1 }}
              onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>Nutrition Analysis</h3>
                <button className="modal-close" onClick={() => setAnalysisModal(false)}><X size={14} /></button>
              </div>
              {!analysis
                ? <p style={{ color: 'var(--muted)', textAlign: 'center', padding: '2rem' }}>Analyzing your plan…</p>
                : (
                  <div className="analysis-grid">
                    <div className="score-ring">
                      <div className="score-number">{analysis.overall_score}/10</div>
                      <div className="score-label">Nutrition Score</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 8, color: 'var(--forest)' }}>✓ Strengths</div>
                      <ul className="analysis-list">
                        {analysis.strengths?.map((s, i) => (
                          <li key={i}><CheckCircle size={13} color="var(--forest)" /> {s}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: 8, color: 'var(--clay)' }}>⚠ Improvements</div>
                      <ul className="analysis-list">
                        {analysis.improvements?.map((s, i) => (
                          <li key={i}><Lightbulb size={13} color="var(--clay)" /> {s}</li>
                        ))}
                      </ul>
                    </div>
                    {analysis.hydration_tip && (
                      <div style={{ gridColumn: '1 / -1', background: 'var(--cream)', borderRadius: 10, padding: '0.8rem 1rem', fontSize: '0.85rem' }}>
                        💧 {analysis.hydration_tip}
                      </div>
                    )}
                  </div>
                )
              }
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
