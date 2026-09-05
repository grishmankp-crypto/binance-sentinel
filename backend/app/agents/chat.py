import json
from typing import Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from app.core.config import settings

def get_chat_response(message: str, context: Dict[str, Any]) -> str:
    """
    Answers user questions based on the current market context.
    """
    if not settings.GOOGLE_API_KEY:
        # Fallback Demo Mode Response
        return (
            "Based on the current context, the market is exhibiting **bullish momentum** but with notable **derivatives risk**.\n\n"
            "The technical indicators (like the EMA crossover and RSI) suggest strong upward pressure. "
            "However, the elevated funding rate implies that the market is currently overcrowded with longs. "
            "I recommend managing your risk tightly, as a sudden price drop could trigger a cascading long squeeze."
        )

    llm = ChatGoogleGenerativeAI(model=settings.LLM_MODEL, temperature=0.4)
    
    # Strip heavy arrays (like klines) to save context window and avoid hitting token limits
    light_context = {k: v for k, v in context.items() if k != "klines"}
    
    prompt = ChatPromptTemplate.from_messages([
        ("system", """You are the Binance Sentinel AI Copilot, an elite quantitative analyst.
        The user is currently looking at a market intelligence dashboard.
        
        Here is the live data context currently displayed on their screen:
        {context}
        
        Answer the user's question accurately, concisely, and professionally based ONLY on this context. 
        If they ask for advice, provide an objective analysis of the risks and trends shown in the data. Do not provide financial advice.
        Keep responses under 3 paragraphs. Use markdown formatting for readability."""),
        ("user", "{message}")
    ])
    
    chain = prompt | llm
    
    try:
        response = chain.invoke({
            "context": json.dumps(light_context, indent=2),
            "message": message
        })
        return response.content
    except Exception as e:
        print(f"Chat Copilot Error: {e}")
        return "I apologize, but I encountered an error while analyzing the market data for your question."
