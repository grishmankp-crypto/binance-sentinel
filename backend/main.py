from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="Binance Sentinel API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    asset: str
    timeframe: str = "1h"

@app.get("/")
def read_root():
    return {"status": "ok", "service": "Binance Sentinel"}

@app.get("/api/health/mcp")
def health_mcp():
    return {"status": "ok", "mcp_connected": True}

from app.agents.pipeline import pipeline_app
from app.agents.chat import get_chat_response
from typing import Dict, Any

class ChatRequest(BaseModel):
    message: str
    context: Dict[str, Any]

@app.post("/api/v1/chat")
async def chat_endpoint(req: ChatRequest):
    response = get_chat_response(req.message, req.context)
    return {"status": "success", "reply": response}

@app.post("/api/v1/analyze")
async def analyze(req: AnalyzeRequest):
    state = {
        "asset": req.asset,
        "timeframe": req.timeframe,
        "intent_type": "analyze"
    }
    
    # Run the graph
    result = await pipeline_app.ainvoke(state)
    
    return {
        "status": "success",
        "asset": req.asset,
        "data": {
            "ticker": result.get("ticker"),
            "klines": result.get("klines"),
            "technical_analysis": result.get("technical_analysis"),
            "microstructure": result.get("microstructure"),
            "derivatives": result.get("derivatives"),
            "sentiment": result.get("sentiment"),
            "regime": result.get("regime"),
            "risk": result.get("risk"),
            "synthesis": result.get("synthesis")
        }
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
