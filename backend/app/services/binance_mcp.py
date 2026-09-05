import httpx
import asyncio
from typing import Dict, Any, List, Optional
import time
from app.core.config import settings

class BinanceMCPClient:
    """
    Client for Binance Agent OS MCP endpoint.
    Gracefully falls back to demo data if the endpoint is unavailable or in DEMO_MODE.
    """
    def __init__(self):
        self.endpoint = settings.BINANCE_MCP_ENDPOINT
        self.is_demo = settings.DEMO_MODE
        self.timeout = 5.0
        self.client = httpx.AsyncClient(timeout=self.timeout)

    async def _request(self, method: str, params: Dict[str, Any]) -> Dict[str, Any]:
        if self.is_demo:
            return await self._get_real_binance_data(method, params)

        try:
            # Simulated MCP call format
            response = await self.client.post(
                self.endpoint,
                json={"method": method, "params": params},
                headers={"Authorization": f"Bearer {settings.BINANCE_API_KEY}"} if settings.BINANCE_API_KEY else {}
            )
            response.raise_for_status()
            data = response.json()
            if "error" in data:
                raise Exception(f"MCP JSONRPC Error: {data['error']}")
            return data
        except Exception as e:
            # print(f"MCP Connection failed: {e}. Falling back to REST API.")
            self.is_demo = True
            return await self._get_real_binance_data(method, params)

    async def get_ticker(self, symbol: str) -> Dict[str, Any]:
        data = await self._request("get_ticker", {"symbol": symbol})
        return data

    async def get_klines(self, symbol: str, interval: str = "1h", limit: int = 100) -> List[Dict[str, Any]]:
        data = await self._request("get_klines", {"symbol": symbol, "interval": interval, "limit": limit})
        return data

    async def get_order_book(self, symbol: str, limit: int = 100) -> Dict[str, Any]:
        data = await self._request("get_order_book", {"symbol": symbol, "limit": limit})
        return data

    async def get_funding_rate(self, symbol: str) -> Dict[str, Any]:
        data = await self._request("get_funding_rate", {"symbol": symbol})
        return data

    async def get_open_interest(self, symbol: str) -> Dict[str, Any]:
        data = await self._request("get_open_interest", {"symbol": symbol})
        return data

    async def _get_real_binance_data(self, method: str, params: Dict[str, Any]) -> Any:
        symbol = params.get("symbol", "BTCUSDT")
        
        try:
            if method == "get_ticker":
                res = await self.client.get(f"https://api.binance.com/api/v3/ticker/24hr?symbol={symbol}")
                data = res.json()
                return {
                    "symbol": symbol,
                    "price": float(data.get("lastPrice", 0)),
                    "priceChangePercent": float(data.get("priceChangePercent", 0)),
                    "volume24h": float(data.get("quoteVolume", 0)),
                    "high24h": float(data.get("highPrice", 0)),
                    "low24h": float(data.get("lowPrice", 0)),
                    "timestamp": int(time.time() * 1000)
                }
            elif method == "get_klines":
                res = await self.client.get(f"https://api.binance.com/api/v3/klines?symbol={symbol}&interval={params.get('interval', '1h')}&limit={params.get('limit', 100)}")
                data = res.json()
                return [
                    {
                        "timestamp": k[0],
                        "open": float(k[1]),
                        "high": float(k[2]),
                        "low": float(k[3]),
                        "close": float(k[4]),
                        "volume": float(k[5])
                    } for k in data
                ]
            elif method == "get_order_book":
                res = await self.client.get(f"https://api.binance.com/api/v3/depth?symbol={symbol}&limit={params.get('limit', 20)}")
                data = res.json()
                return {
                    "bids": [[float(b[0]), float(b[1])] for b in data.get("bids", [])],
                    "asks": [[float(a[0]), float(a[1])] for a in data.get("asks", [])]
                }
            elif method == "get_funding_rate":
                res = await self.client.get(f"https://fapi.binance.com/fapi/v1/premiumIndex?symbol={symbol}")
                data = res.json()
                return {
                    "symbol": symbol,
                    "fundingRate": float(data.get("lastFundingRate", 0)),
                    "nextFundingTime": data.get("nextFundingTime", 0)
                }
            elif method == "get_open_interest":
                res = await self.client.get(f"https://fapi.binance.com/fapi/v1/openInterest?symbol={symbol}")
                data = res.json()
                return {
                    "symbol": symbol,
                    "openInterest": float(data.get("openInterest", 0)),
                    "time": data.get("time", 0)
                }
        except Exception as e:
            print(f"Fallback REST failed: {e}")
            
        return {}
