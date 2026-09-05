from typing import Dict, Any

def determine_market_regime(tech_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Classifies the market into regimes deterministically.
    """
    if "error" in tech_data:
        return {"regime": "UNKNOWN", "confidence": 0, "supporting_factors": []}

    trend = tech_data.get("trend_ema", "NEUTRAL")
    rsi = tech_data.get("rsi", 50)
    atr = tech_data.get("atr", 0)

    regime = "SIDEWAYS"
    confidence = 50
    factors = []

    if trend == "BULLISH":
        if rsi > 60:
            regime = "STRONG_BULLISH_TREND"
            confidence = 85
            factors.append("EMA alignment is positive")
            factors.append("RSI shows strong momentum")
        else:
            regime = "BULLISH_TREND"
            confidence = 70
            factors.append("EMA alignment is positive but momentum is moderate")
    elif trend == "BEARISH":
        if rsi < 40:
            regime = "STRONG_BEARISH_TREND"
            confidence = 85
            factors.append("EMA alignment is negative")
            factors.append("RSI shows weak momentum")
        else:
            regime = "BEARISH_TREND"
            confidence = 70
            factors.append("EMA alignment is negative but momentum is moderate")
    
    # Volatility Check
    # If ATR is high relative to price (simplified here) we'd tag HIGH_VOLATILITY
    if atr > 1000: # Arbitrary high threshold for BTC demo, should be dynamic
        factors.append("High volatility detected via ATR")

    return {
        "regime": regime,
        "confidence": confidence,
        "supporting_factors": factors
    }
