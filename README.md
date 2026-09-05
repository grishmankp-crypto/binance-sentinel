# ⚡ Binance Sentinel | Agent OS

![Binance Sentinel Banner](https://placehold.co/1200x400/0b0e11/EAB308.png?text=Binance+Sentinel+|+AI+Market+Intelligence)

**Binance Sentinel** is an elite, autonomous AI Quantitative Analyst built for the **Binance Agent OS Mini Hackathon**. 

It leverages a powerful multi-agent LangGraph pipeline connected to the Binance MCP (Model Context Protocol) to ingest real-time market data, technical indicators, and derivatives risk metrics. It then synthesizes this raw data using Gemini 1.5 Pro to provide instantaneous, highly accurate **Trade Signals**, **Risk Assessments**, and a **Conversational AI Copilot**.

---

## ✨ Key Features

* 🧠 **Autonomous AI Trade Signals:** Dynamically calculates precise Entry, Stop Loss, and Take Profit levels based on live order book imbalances, EMA/RSI crossovers, and sentiment analysis.
* 💬 **Market Intelligence Copilot:** A conversational AI assistant permanently docked on your dashboard. Ask it anything about the current asset (e.g., *"What's the current squeeze risk?"*), and it will answer strictly using the live data context.
* 📊 **Multi-Timeframe TradingView Integration:** Sleek, reactive price charts embedded directly into the UI. Toggle seamlessly between `15m`, `1h`, `4h`, and `1d` intervals—the AI instantly recalculates its verdict based on the new timeframe.
* 🚨 **Derivatives Squeeze Risk Detection:** Continuously monitors Binance Futures Open Interest and Funding Rates to warn you of impending Long/Short squeezes before they happen.
* 🛡️ **Robust Fallback Architecture:** If the primary MCP endpoint experiences rate limits, the system gracefully falls back to the native Binance REST API without dropping a single frame of data.

---

## 🏗️ Architecture

The project is split into a highly responsive modern web app and a heavy-duty Python AI pipeline:

### 1. Backend (FastAPI + LangGraph + Gemini 1.5 Pro)
* **Agentic Workflow:** We use a LangGraph `StateGraph` to orchestrate specialized agents (`market_agent`, `technical_agent`, `derivatives_agent`, `synthesis_agent`).
* **Binance MCP / REST:** Native integration with Binance market data.
* **LLM:** Gemini 1.5 Pro acts as the overarching synthesis engine, outputting structured JSON for the frontend.

### 2. Frontend (Next.js + Tailwind CSS v4)
* **React & Lightweight Charts:** Blazing fast candlestick rendering.
* **Responsive Grid:** A beautiful, dark-mode terminal UI built for traders, complete with dynamic alert coloring (Green/Red/Yellow).

---

## 🚀 Getting Started

### Prerequisites
* Python 3.10+
* Node.js 18+
* A Gemini Developer API Key (`AIzaSy...`)

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Add your API Keys:
   Create a `.env` file in the `backend` folder:
   ```env
   BINANCE_API_KEY=your_binance_key
   BINANCE_API_SECRET=your_binance_secret
   GOOGLE_API_KEY=your_gemini_key
   ```
4. Run the API Server:
   ```bash
   python -m uvicorn main:app --port 8000
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🏆 Built for the Binance Agent OS Mini Hackathon
This project was designed with a focus on **Actionability, Agentic Reasoning, and UX**. By bridging the gap between raw exchange data and human-readable intelligence, Binance Sentinel proves what is possible when you give an LLM direct, real-time access to the world's largest crypto exchange.
