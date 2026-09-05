from typing import Dict, Any

def calculate_squeeze_risk(funding: Dict[str, Any], oi: Dict[str, Any]) -> Dict[str, Any]:
    """
    Calculates the risk of a long or short squeeze based on funding rate and open interest.
    """
    if not funding or not oi:
        return {"squeeze_risk": "UNKNOWN", "funding_rate": 0, "open_interest": 0, "interpretation": "Insufficient data"}
    
    funding_rate = funding.get("fundingRate", 0)
    open_interest = oi.get("openInterest", 0)
    
    # We use some heuristic thresholds for a hackathon demo
    # Highly positive funding = longs paying shorts = overcrowded longs
    # Highly negative funding = shorts paying longs = overcrowded shorts
    
    risk = "LOW"
    interpretation = "Market leverage is neutral."
    
    if funding_rate > 0.0005:  # e.g. 0.05% per 8 hours (very high)
        risk = "HIGH LONG SQUEEZE RISK"
        interpretation = f"Funding rate is extremely positive ({funding_rate*100:.3f}%). Market is heavily long. A sudden price drop could cascade into a long squeeze."
    elif funding_rate > 0.0002:
        risk = "MODERATE LONG SQUEEZE RISK"
        interpretation = f"Funding rate is positive ({funding_rate*100:.3f}%). Modest long bias."
    elif funding_rate < -0.0005:
        risk = "HIGH SHORT SQUEEZE RISK"
        interpretation = f"Funding rate is extremely negative ({funding_rate*100:.3f}%). Market is heavily short. A sudden price pump could trigger a short squeeze."
    elif funding_rate < -0.0002:
        risk = "MODERATE SHORT SQUEEZE RISK"
        interpretation = f"Funding rate is negative ({funding_rate*100:.3f}%). Modest short bias."
        
    return {
        "squeeze_risk": risk,
        "funding_rate": funding_rate,
        "open_interest": open_interest,
        "interpretation": interpretation
    }
