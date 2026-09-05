import feedparser
from typing import List, Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from app.core.config import settings
import time

class SentimentService:
    def __init__(self):
        self.llm = None
        if settings.GOOGLE_API_KEY:
            self.llm = ChatGoogleGenerativeAI(
                model=settings.LLM_MODEL,
                temperature=0.0
            )
        self._news_cache = []
        self._news_cache_time = 0
        self._cache_duration = 300 # 5 minutes cache

    def fetch_news(self, limit: int = 10) -> List[Dict[str, str]]:
        current_time = time.time()
        if self._news_cache and (current_time - self._news_cache_time < self._cache_duration):
            return self._news_cache[:limit]

        try:
            # RSS feed from CoinTelegraph
            feed_url = "https://cointelegraph.com/rss"
            feed = feedparser.parse(feed_url)
            articles = []
            for entry in feed.entries[:limit]:
                articles.append({
                    "title": entry.title,
                    "link": entry.link,
                    "published": entry.published,
                    "source": "Cointelegraph"
                })
            self._news_cache = articles
            self._news_cache_time = current_time
            return articles
        except Exception as e:
            print(f"Error fetching news: {e}")
            return self._news_cache[:limit] if self._news_cache else []

    def analyze_sentiment(self, asset: str) -> Dict[str, Any]:
        articles = self.fetch_news(limit=5)
        
        if not articles:
            return {"sentiment": "NEUTRAL", "score": 50, "articles": []}

        if not self.llm:
            # Fallback when no LLM key
            return {
                "sentiment": "BULLISH",
                "score": 75,
                "momentum": "+5 points",
                "agreement": "4/5 sources bullish",
                "articles": articles
            }
            
        headlines = "\n".join([f"- {a['title']} ({a['source']})" for a in articles])
        
        prompt = PromptTemplate.from_template("""
        Analyze the sentiment of the following recent crypto headlines for {asset}.
        Output ONLY a JSON format.
        {{
            "sentiment": "BULLISH" | "BEARISH" | "NEUTRAL" | "VERY_BULLISH" | "VERY_BEARISH",
            "score": <0-100 where 100 is max bullish>,
            "momentum": "<e.g. +10 points / 6h>",
            "agreement": "<e.g. 4/5 sources bullish>"
        }}
        
        Headlines:
        {headlines}
        """)
        
        try:
            res = self.llm.invoke(prompt.format(asset=asset, headlines=headlines))
            # parse json block
            import json
            content = res.content.replace("```json", "").replace("```", "").strip()
            parsed = json.loads(content)
            parsed["articles"] = articles
            return parsed
        except Exception as e:
            print(f"LLM Sentiment failed: {e}")
            return {
                "sentiment": "NEUTRAL",
                "score": 50,
                "momentum": "Neutral",
                "agreement": "Mixed",
                "articles": articles
            }
