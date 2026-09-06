'use client';
import { useState, useEffect, useRef } from 'react';
import { Activity, TrendingUp, AlertTriangle, MessageSquare, Clock, ArrowRight, Zap, ArrowUpRight, ArrowDownRight, ShieldAlert, BarChart3, Send, Target } from 'lucide-react';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';

const TradingChart = dynamic(() => import('../components/TradingChart'), { ssr: false });
import HeatmapSimulator from '../components/HeatmapSimulator';
import FearAndGreedGauge from '../components/FearAndGreedGauge';

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [asset, setAsset] = useState('BTCUSDT');
  const [timeframe, setTimeframe] = useState('1h');
  const [showEvidence, setShowEvidence] = useState(false);
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: 'Hello! I am Sentinel Copilot. Ask me anything about the current market data.' }
  ]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchData();
  }, [asset, timeframe]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ asset, timeframe })
      });
      const json = await res.json();
      setData(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!chatInput.trim() || !data) return;
    
    const newMessages = [...chatMessages, { role: 'user', content: chatInput }];
    setChatMessages(newMessages);
    setChatInput('');
    setChatLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: chatInput, context: data })
      });
      const json = await res.json();
      setChatMessages([...newMessages, { role: 'assistant', content: json.reply }]);
    } catch (err) {
      setChatMessages([...newMessages, { role: 'assistant', content: 'Connection error.' }]);
    } finally {
      setChatLoading(false);
    }
  };

  const formatVolume = (vol: number) => {
    if (!vol) return '---';
    if (vol >= 1e9) return `$${(vol / 1e9).toFixed(2)}B`;
    if (vol >= 1e6) return `$${(vol / 1e6).toFixed(2)}M`;
    return `$${vol.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-[#0b0e11] text-gray-100 font-sans p-4 md:p-6">
      <header className="flex flex-col md:flex-row justify-between items-center mb-6 border-b border-gray-800 pb-4">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-bold tracking-tight flex items-center">
            <Zap className="mr-2 text-yellow-500" /> Binance Sentinel
          </h1>
          <p className="text-gray-400 text-sm">AI Market Intelligence</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="bg-gray-900 border border-gray-700 rounded p-1 flex space-x-1">
            {['15m', '1h', '4h', '1d'].map(tf => (
              <button 
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${timeframe === tf ? 'bg-yellow-500 text-black' : 'text-gray-400 hover:text-white hover:bg-gray-800'}`}
              >
                {tf}
              </button>
            ))}
          </div>
          <select 
            className="bg-gray-900 border border-gray-700 text-white rounded p-2 focus:ring-yellow-500 focus:border-yellow-500"
            value={asset}
            onChange={(e) => setAsset(e.target.value)}
          >
            <option value="BTCUSDT">BTC/USDT</option>
            <option value="ETHUSDT">ETH/USDT</option>
            <option value="SOLUSDT">SOL/USDT</option>
            <option value="BNBUSDT">BNB/USDT</option>
          </select>
        </div>
      </header>

      {loading && !data ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-500"></div>
        </div>
      ) : data ? (
        <div className="grid grid-cols-12 gap-6 max-w-[1400px] mx-auto">
          
          {/* Main Dashboard (Left) */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* Main Price Banner */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex justify-between items-center relative overflow-hidden">
              {loading && <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500/20"><div className="h-full bg-yellow-500 w-1/3 animate-pulse"></div></div>}
              <div>
                <h2 className="text-3xl font-bold">{data.ticker?.price ? `$${data.ticker.price.toLocaleString()}` : '---'}</h2>
                <p className={`text-sm ${data.ticker?.priceChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {data.ticker?.priceChangePercent >= 0 ? '+' : ''}{data.ticker?.priceChangePercent}% (24h)
                </p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-sm">24h Volume</p>
                <p className="font-semibold text-lg">{data.ticker?.volume24h ? formatVolume(data.ticker.volume24h) : '---'}</p>
              </div>
            </div>

            {/* TradingView Chart */}
            {data.klines && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                 <h3 className="text-gray-400 text-sm mb-2 font-semibold tracking-wider">PRICE CHART ({timeframe.toUpperCase()})</h3>
                 <TradingChart data={data.klines} />
              </div>
            )}

            {/* Trade Signal Hero Card */}
            {data.synthesis?.signal && (
              <div className="bg-gradient-to-r from-gray-900 to-gray-800 border border-gray-700 rounded-xl p-6 relative overflow-hidden shadow-2xl">
                <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                  <div>
                    <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider mb-2">AI Trade Signal</h3>
                    <div className="flex items-baseline space-x-4">
                      <span className={`text-4xl font-extrabold tracking-tight ${
                        data.synthesis.signal.action === 'BUY' ? 'text-green-500' : 
                        data.synthesis.signal.action === 'SELL' ? 'text-red-500' : 'text-gray-400'
                      }`}>
                        {data.synthesis.signal.action}
                      </span>
                      <span className="text-2xl text-white font-medium">@ {data.synthesis.signal.entry}</span>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0 flex space-x-6 bg-gray-900/80 px-6 py-4 rounded-lg border border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Take Profit</p>
                      <p className="text-xl font-bold text-green-400">{data.synthesis.signal.take_profit}</p>
                    </div>
                    <div className="w-px bg-gray-700"></div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Stop Loss</p>
                      <p className="text-xl font-bold text-red-400">{data.synthesis.signal.stop_loss}</p>
                    </div>
                  </div>
                </div>
                <p className="text-gray-300 bg-gray-900/50 p-4 rounded-lg border border-gray-800/50 text-sm md:text-base leading-relaxed">
                  <span className="font-semibold text-yellow-500 mr-2">Rationale:</span> 
                  {data.synthesis.signal.reasoning}
                </p>
              </div>
            )}

            {/* Signal Grid */}
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-4 bg-gray-900 border border-gray-800 rounded-xl p-6 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-500/5 rounded-bl-full -z-10"></div>
                <div className="flex items-center space-x-2 mb-4">
                  <Zap className="text-yellow-500" size={20} />
                  <h3 className="text-lg font-semibold text-white">AI Verdict</h3>
                </div>
                <div className="mb-6 flex-grow">
                  <div className="flex justify-between items-end mb-2">
                    <span className={`text-2xl font-bold ${
                      data.synthesis?.bias === 'BULLISH' ? 'text-green-500' : 
                      data.synthesis?.bias === 'BEARISH' ? 'text-red-500' : 'text-gray-300'
                    }`}>
                      {data.synthesis?.bias || 'ANALYZING...'}
                    </span>
                    <span className="text-gray-400 text-sm">Conf: {data.synthesis?.confidence || 0}%</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-1.5 mb-6">
                    <div className={`h-1.5 rounded-full ${
                      data.synthesis?.bias === 'BULLISH' ? 'bg-green-500' : 
                      data.synthesis?.bias === 'BEARISH' ? 'bg-red-500' : 'bg-gray-500'
                    }`} style={{ width: `${data.synthesis?.confidence || 0}%` }}></div>
                  </div>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {data.synthesis?.ai_verdict || 'AI is currently analyzing the market data to generate a verdict.'}
                  </p>
                </div>
                <button 
                  onClick={() => setShowEvidence(true)}
                  className="w-full py-2 mt-auto bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/50 text-yellow-500 font-semibold rounded transition-colors text-sm"
                >
                  View Full Evidence
                </button>
              </div>

              <div className="col-span-12 md:col-span-4 space-y-4">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-full">
                  <h3 className="text-gray-400 text-sm mb-4">Market Regime</h3>
                  <p className="text-xl font-bold text-white mb-2">{data.regime?.regime?.replace(/_/g, ' ') || 'UNKNOWN'}</p>
                  <ul className="space-y-2 mt-4 text-sm text-gray-400">
                    {data.regime?.supporting_factors?.slice(0,2).map((f: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <span className="text-yellow-500 mr-2">•</span> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="col-span-12 md:col-span-4 space-y-4">
                 <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 h-full">
                  <h3 className="text-gray-400 text-sm mb-4">Risk Level</h3>
                  <div className="flex items-center space-x-3 mb-2">
                    <ShieldAlert className={
                      data.risk?.level === 'HIGH' ? 'text-red-500' : 
                      data.risk?.level === 'LOW' ? 'text-green-500' : 'text-yellow-500'
                    } size={24} />
                    <p className={`text-xl font-bold ${
                      data.risk?.level === 'HIGH' ? 'text-red-500' : 
                      data.risk?.level === 'LOW' ? 'text-green-500' : 'text-yellow-500'
                    }`}>
                      {data.risk?.level || 'MODERATE'}
                    </p>
                  </div>
                  {data.derivatives && (
                    <div className="mt-4 pt-4 border-t border-gray-800">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Derivatives Risk</p>
                      <p className={`text-sm font-bold ${data.derivatives.squeeze_risk?.includes('HIGH') ? 'text-red-500' : 'text-gray-300'}`}>
                        {data.derivatives.squeeze_risk}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Liquidation Clusters */}
            {data.synthesis?.liquidation_clusters && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <Target className="text-yellow-500" size={20} />
                    <h3 className="text-lg font-semibold text-white">Liquidation Heatmap</h3>
                  </div>
                  <span className="text-xs text-gray-500 uppercase tracking-wider">High Leverage Clusters</span>
                </div>
                <HeatmapSimulator clusters={data.synthesis.liquidation_clusters} />
              </div>
            )}

            {/* Bottom Section: Fear & Greed + Live News Feed */}
            {data.sentiment?.articles && data.sentiment.articles.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                
                {/* Fear & Greed Gauge */}
                <FearAndGreedGauge value={data.sentiment.overall_score || 75} />

                {/* Live News Feed */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 flex flex-col h-full">
                  <div className="flex items-center space-x-2 mb-4">
                    <Activity className="text-yellow-500" size={20} />
                    <h3 className="text-lg font-semibold text-white">Live Market News</h3>
                    <span className="ml-2 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20 flex items-center space-x-1">
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      <span>LIVE</span>
                    </span>
                  </div>
                  <div className="space-y-3 flex-grow overflow-y-auto pr-2 custom-scrollbar">
                    {data.sentiment.articles.slice(0, 4).map((article: any, idx: number) => (
                      <a 
                        key={idx} 
                        href={article.link} 
                        target="_blank" 
                        rel="noreferrer"
                        className="block bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-lg p-3 transition-colors"
                      >
                        <h4 className="text-sm font-medium text-gray-200 mb-1 leading-snug line-clamp-2">{article.title}</h4>
                        <div className="flex items-center text-xs text-gray-500 space-x-3">
                          <span className="text-yellow-500/80">{article.source}</span>
                          <span>•</span>
                          <span>{new Date(article.published).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

          {/* AI Chat Copilot (Right) */}
          <div className="col-span-12 lg:col-span-4 bg-gray-900 border border-gray-800 rounded-xl flex flex-col h-[800px] sticky top-6">
            <div className="p-4 border-b border-gray-800 flex items-center bg-gray-900/50 rounded-t-xl">
              <MessageSquare className="text-yellow-500 mr-2" size={20} />
              <h3 className="font-semibold text-white">AI Copilot</h3>
              <span className="ml-auto flex items-center space-x-1 text-xs text-green-500 bg-green-500/10 px-2 py-1 rounded-full border border-green-500/20">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
                <span>ONLINE</span>
              </span>
            </div>
            
            <div className="flex-grow overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-yellow-500 text-black font-medium rounded-tr-none' 
                      : 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none prose prose-invert prose-sm'
                  }`}>
                    {msg.role === 'assistant' ? (
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              ))}
              {chatLoading && (
                <div className="flex items-start">
                  <div className="bg-gray-800 border border-gray-700 rounded-lg rounded-tl-none p-4 flex space-x-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 border-t border-gray-800 bg-gray-900 rounded-b-xl">
              <div className="relative">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder={`Ask about ${asset}...`}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-4 pr-12 py-3 focus:outline-none focus:border-yellow-500 text-sm"
                  disabled={chatLoading}
                />
                <button 
                  onClick={handleSendMessage}
                  disabled={!chatInput.trim() || chatLoading}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-yellow-500 hover:bg-gray-700 rounded-md disabled:opacity-50 disabled:hover:bg-transparent"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-gray-500 py-12">Failed to load data.</div>
      )}

      {/* Evidence Modal */}
      {showEvidence && data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-2xl relative">
            <button onClick={() => setShowEvidence(false)} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
            <div className="p-6 border-b border-gray-800">
              <h2 className="text-2xl font-bold text-white flex items-center"><Zap className="text-yellow-500 mr-2" /> AI Analysis Evidence</h2>
              <p className="text-gray-400 mt-1">{asset} Market State</p>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-800/50 p-4 rounded-lg border border-green-500/20">
                  <h4 className="text-green-500 font-bold mb-2 flex items-center"><ArrowUpRight size={16} className="mr-1" /> Bull Case</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    {data.synthesis?.bull_case?.map((item: string, i: number) => <li key={i}>• {item}</li>)}
                  </ul>
                </div>
                <div className="bg-gray-800/50 p-4 rounded-lg border border-red-500/20">
                  <h4 className="text-red-500 font-bold mb-2 flex items-center"><ArrowDownRight size={16} className="mr-1" /> Bear Case</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    {data.synthesis?.bear_case?.map((item: string, i: number) => <li key={i}>• {item}</li>)}
                  </ul>
                </div>
              </div>
              <div>
                <h4 className="text-yellow-500 font-bold mb-2 text-sm uppercase tracking-wider">Invalidation Conditions</h4>
                <div className="bg-gray-800 p-3 rounded text-sm text-gray-300 border border-gray-700">{data.synthesis?.invalidation || "Not specified."}</div>
              </div>
              <div>
                <h4 className="text-gray-400 font-bold mb-2 text-sm uppercase tracking-wider">Raw Signals</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="bg-gray-800 p-2 rounded"><span className="block text-gray-500">RSI</span><span className="font-bold text-white">{data.technical_analysis?.rsi?.toFixed(2)}</span></div>
                  <div className="bg-gray-800 p-2 rounded"><span className="block text-gray-500">MACD</span><span className="font-bold text-white">{data.technical_analysis?.macd?.toFixed(2)}</span></div>
                  <div className="bg-gray-800 p-2 rounded"><span className="block text-gray-500">EMA 20</span><span className="font-bold text-white">{data.technical_analysis?.ema_20?.toFixed(2)}</span></div>
                  <div className="bg-gray-800 p-2 rounded"><span className="block text-gray-500">Imbalance</span><span className="font-bold text-white">{data.microstructure?.imbalance_percent?.toFixed(1)}%</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
