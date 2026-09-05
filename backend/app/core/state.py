from typing import TypedDict, Dict, Any, List, Optional
from pydantic import BaseModel

class AgentState(TypedDict):
    # Inputs
    asset: str
    timeframe: str
    intent_type: str # 'analyze', 'copilot'
    
    # Binance MCP Data
    ticker: Dict[str, Any]
    klines: List[Dict[str, Any]]
    order_book: Dict[str, Any]
    funding: Dict[str, Any]
    open_interest: Dict[str, Any]
    
    # Analysis outputs
    technical_analysis: Dict[str, Any]
    microstructure: Dict[str, Any]
    sentiment: Dict[str, Any]
    regime: Dict[str, Any]
    risk: Dict[str, Any]
    derivatives: Dict[str, Any]
    
    # Final Output
    synthesis: Dict[str, Any]
    error: Optional[str]
