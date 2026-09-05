from typing import Dict, Any

def calculate_risk_score(tech: Dict[str, Any], microstructure: Dict[str, Any], sentiment: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculates a risk score 0-100 (0 = Lowest Risk, 100 = Highest Risk).
    """
    score = 50
    
    rsi = tech.get("rsi", 50)
    # Overbought/oversold increases risk of reversal
    if rsi > 75 or rsi < 25:
        score += 15
    elif rsi > 65 or rsi < 35:
        score += 10
        
    imbalance = microstructure.get("imbalance_score", 0)
    # Extreme imbalance is risky
    if abs(imbalance) > 0.4:
        score += 15
        
    sent_score = sentiment.get("score", 50)
    # If trend is bullish but sentiment is bearish, divergence = risk
    trend = tech.get("trend_ema", "NEUTRAL")
    if trend == "BULLISH" and sent_score < 40:
        score += 20
    elif trend == "BEARISH" and sent_score > 60:
        score += 20

    # Bound the score
    score = max(0, min(100, score))

    level = "MODERATE"
    if score < 30:
        level = "LOW"
    elif score > 70:
        level = "HIGH"

    return {
        "score": score,
        "level": level
    }
