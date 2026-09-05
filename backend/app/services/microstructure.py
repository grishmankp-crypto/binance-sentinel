from typing import Dict, Any

def calculate_order_book_imbalance(order_book: Dict[str, Any]) -> Dict[str, Any]:
    """
    Analyzes order book for buy/sell pressure.
    Order Book Imbalance = (Bid Volume - Ask Volume) / (Bid Volume + Ask Volume)
    """
    bids = order_book.get("bids", [])
    asks = order_book.get("asks", [])

    if not bids or not asks:
        return {"imbalance": 0, "pressure": "NEUTRAL", "interpretation": "No data"}

    # Calculate total volume in the top N levels (e.g. 20 levels)
    # Format typically: [[price, quantity], ...]
    bid_vol = sum(float(b[1]) for b in bids)
    ask_vol = sum(float(a[1]) for a in asks)

    total_vol = bid_vol + ask_vol
    if total_vol == 0:
        return {"imbalance": 0, "pressure": "NEUTRAL", "interpretation": "Zero volume"}

    imbalance = (bid_vol - ask_vol) / total_vol

    pressure = "NEUTRAL"
    if imbalance > 0.15:
        pressure = "BUY PRESSURE"
    elif imbalance < -0.15:
        pressure = "SELL PRESSURE"

    interpretation = (
        f"Bid-side depth is currently {int((bid_vol/ask_vol)*100 - 100)}% "
        f"{'stronger' if bid_vol > ask_vol else 'weaker'} than ask-side depth, "
        f"suggesting {'immediate buy-side liquidity' if bid_vol > ask_vol else 'immediate sell-side pressure'}."
    )

    return {
        "imbalance_score": imbalance, # -1 to 1
        "imbalance_percent": imbalance * 100,
        "pressure": pressure,
        "bid_volume": bid_vol,
        "ask_volume": ask_vol,
        "interpretation": interpretation
    }
