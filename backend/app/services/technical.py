import pandas as pd
import pandas_ta as ta
from typing import Dict, Any, List

def calculate_technical_indicators(klines: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Calculates RSI, MACD, EMA 20/50/200, ATR deterministically using pandas-ta.
    """
    if not klines or len(klines) < 50:
        return {"error": "Not enough data for technical analysis"}

    df = pd.DataFrame(klines)
    
    # Ensure correct types
    for col in ['open', 'high', 'low', 'close', 'volume']:
        df[col] = pd.to_numeric(df[col])

    # Calculate indicators using append=True
    # RSI
    df.ta.rsi(length=14, append=True)
    
    # MACD
    df.ta.macd(fast=12, slow=26, signal=9, append=True)

    # EMAs
    df.ta.ema(length=20, append=True)
    df.ta.ema(length=50, append=True)
    df.ta.ema(length=200, append=True)

    # ATR
    df.ta.atr(length=14, append=True)
    
    # Latest values
    latest = df.iloc[-1]
    
    # Check trend based on EMA
    trend = "NEUTRAL"
    if pd.notna(latest.get('EMA_20')) and pd.notna(latest.get('EMA_50')):
        if latest['close'] > latest['EMA_20'] and latest['EMA_20'] > latest['EMA_50']:
            trend = "BULLISH"
        elif latest['close'] < latest['EMA_20'] and latest['EMA_20'] < latest['EMA_50']:
            trend = "BEARISH"

    return {
        "rsi": float(latest.get('RSI_14', 50)),
        "macd": float(latest.get('MACD_12_26_9', 0)),
        "macd_signal": float(latest.get('MACDs_12_26_9', 0)),
        "macd_hist": float(latest.get('MACDh_12_26_9', 0)),
        "ema_20": float(latest.get('EMA_20', 0)),
        "ema_50": float(latest.get('EMA_50', 0)),
        "ema_200": float(latest.get('EMA_200', 0)),
        "atr": float(latest.get('ATRr_14', 0)),
        "trend_ema": trend
    }
