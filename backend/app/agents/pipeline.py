from langgraph.graph import StateGraph, END
from app.core.state import AgentState
from app.services.binance_mcp import BinanceMCPClient
from app.services.technical import calculate_technical_indicators
from app.services.microstructure import calculate_order_book_imbalance
from app.services.sentiment import SentimentService
from app.services.derivatives import calculate_squeeze_risk
from app.services.regime import determine_market_regime
from app.services.risk import calculate_risk_score
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from app.core.config import settings

mcp_client = BinanceMCPClient()
sentiment_service = SentimentService()

llm = None
if settings.GOOGLE_API_KEY:
    llm = ChatGoogleGenerativeAI(model=settings.LLM_MODEL, temperature=0.2)

async def market_data_agent(state: AgentState):
    """Fetches all market data from Binance MCP."""
    asset = state["asset"]
    try:
        ticker = await mcp_client.get_ticker(asset)
        klines = await mcp_client.get_klines(asset, state["timeframe"])
        ob = await mcp_client.get_order_book(asset)
        funding = await mcp_client.get_funding_rate(asset)
        oi = await mcp_client.get_open_interest(asset)
        
        return {
            "ticker": ticker,
            "klines": klines,
            "order_book": ob,
            "funding": funding,
            "open_interest": oi
        }
    except Exception as e:
        return {"error": f"Failed to fetch market data: {str(e)}"}

def technical_agent(state: AgentState):
    """Calculates deterministic technical indicators."""
    if "error" in state and state["error"]: return {}
    tech = calculate_technical_indicators(state.get("klines", []))
    return {"technical_analysis": tech}

def microstructure_agent(state: AgentState):
    """Analyzes order book imbalances."""
    if "error" in state and state["error"]: return {}
    micro = calculate_order_book_imbalance(state.get("order_book", {}))
    return {"microstructure": micro}

def derivatives_agent(state: AgentState):
    """Calculates squeeze risk from derivatives data."""
    if "error" in state and state["error"]: return {}
    deriv = calculate_squeeze_risk(state.get("funding", {}), state.get("open_interest", {}))
    return {"derivatives": deriv}

def sentiment_agent(state: AgentState):
    """Analyzes news sentiment."""
    if "error" in state and state["error"]: return {}
    sent = sentiment_service.analyze_sentiment(state["asset"])
    return {"sentiment": sent}

def regime_agent(state: AgentState):
    """Determines market regime."""
    if "error" in state and state["error"]: return {}
    reg = determine_market_regime(state.get("technical_analysis", {}))
    return {"regime": reg}

def risk_agent(state: AgentState):
    """Calculates overall risk score."""
    if "error" in state and state["error"]: return {}
    risk = calculate_risk_score(
        state.get("technical_analysis", {}),
        state.get("microstructure", {}),
        state.get("sentiment", {})
    )
    return {"risk": risk}

async def synthesis_agent(state: AgentState):
    """Uses LLM to synthesize all data into a final intelligence report."""
    if "error" in state and state["error"]: 
        return {"synthesis": {"error": state["error"]}}
        
    if not llm:
        # Mock Synthesis if no LLM - But use actual live Binance prices for the demo!
        ticker = state.get("ticker", {})
        current_price = ticker.get("price", 64000.0)
        
        # Calculate dynamic SL and TP (e.g. 3% stop loss, 8% take profit)
        sl_price = current_price * 0.97
        tp_price = current_price * 1.08
        
        # Format strings neatly
        formatted_entry = f"${current_price:,.2f}" if current_price >= 1 else f"${current_price:,.4f}"
        formatted_sl = f"${sl_price:,.2f}" if sl_price >= 1 else f"${sl_price:,.4f}"
        formatted_tp = f"${tp_price:,.2f}" if tp_price >= 1 else f"${tp_price:,.4f}"

        return {"synthesis": {
            "bias": "BULLISH",
            "confidence": 81,
            "bull_case": ["EMA trend is positive", "Volume expanding"],
            "bear_case": ["Funding is elevated", "Resistance nearby"],
            "invalidation": "Loss of EMA 50",
            "ai_verdict": "Bullish bias with moderate risk.",
            "signal": {
                "action": "BUY",
                "entry": formatted_entry,
                "stop_loss": formatted_sl,
                "take_profit": formatted_tp,
                "reasoning": "Strong positive news sentiment combined with EMA support offsets the moderate derivatives risk."
            }
        }}

    prompt = PromptTemplate.from_template("""
    You are a Senior AI Market Analyst for Binance Sentinel.
    Synthesize the following market data for {asset} into an intelligence report and provide a trade signal based on the news and technicals.
    
    Data:
    Ticker: {ticker}
    Technical: {tech}
    Microstructure: {micro}
    Sentiment: {sentiment}
    Regime: {regime}
    Risk: {risk}
    
    Output JSON ONLY:
    {{
        "bias": "BULLISH" | "BEARISH" | "NEUTRAL",
        "confidence": <0-100>,
        "bull_case": ["<point 1>", "<point 2>", "<point 3>"],
        "bear_case": ["<point 1>", "<point 2>", "<point 3>"],
        "invalidation": "<conditions that invalidate the bias>",
        "ai_verdict": "<2-3 sentence summary>",
        "signal": {{
            "action": "BUY" | "SELL" | "HOLD",
            "entry": "<exact absolute price, e.g. $64,200>",
            "stop_loss": "<exact absolute price, e.g. $62,100>",
            "take_profit": "<exact absolute price, e.g. $68,500>",
            "reasoning": "<1 sentence reasoning for this trade>"
        }}
    }}
    """)
    
    try:
        res = await llm.ainvoke(prompt.format(
            asset=state["asset"],
            ticker=state.get("ticker", {}),
            tech=state.get("technical_analysis", {}),
            micro=state.get("microstructure", {}),
            sentiment=state.get("sentiment", {}),
            regime=state.get("regime", {}),
            risk=state.get("risk", {})
        ))
        
        import json
        content = res.content.replace("```json", "").replace("```", "").strip()
        parsed = json.loads(content)
        return {"synthesis": parsed}
    except Exception as e:
        return {"synthesis": {"error": f"Synthesis failed: {e}"}}

# Build Graph
workflow = StateGraph(AgentState)

workflow.add_node("market", market_data_agent)
workflow.add_node("technical", technical_agent)
workflow.add_node("microstructure", microstructure_agent)
workflow.add_node("derivatives", derivatives_agent)
workflow.add_node("sentiment", sentiment_agent)
workflow.add_node("regime", regime_agent)
workflow.add_node("risk", risk_agent)
workflow.add_node("synthesis", synthesis_agent)

workflow.set_entry_point("market")
workflow.add_edge("market", "technical")
workflow.add_edge("market", "microstructure")
workflow.add_edge("market", "derivatives")
workflow.add_edge("technical", "regime")
workflow.add_edge("technical", "risk")
workflow.add_edge("microstructure", "risk")
workflow.add_edge("derivatives", "risk")

# We can run sentiment parallel to market technically, but let's keep it simple sequential 
workflow.add_edge("market", "sentiment")
workflow.add_edge("sentiment", "risk")
workflow.add_edge("regime", "synthesis")
workflow.add_edge("risk", "synthesis")
workflow.add_edge("synthesis", END)

pipeline_app = workflow.compile()
