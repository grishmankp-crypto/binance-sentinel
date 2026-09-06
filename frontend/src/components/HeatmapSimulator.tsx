/* eslint-disable react-hooks/purity */
'use client';
import React, { useEffect, useState } from 'react';

export default function HeatmapSimulator({ clusters }: { clusters: any[] }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const { minPrice, maxPrice, priceRange, parsedClusters, candles, bgBands } = React.useMemo(() => {
    if (!clusters || clusters.length === 0) {
      return { minPrice: 0, maxPrice: 0, priceRange: 0, parsedClusters: [], candles: [], bgBands: [] };
    }
    const parsed = clusters.map(c => ({
      ...c,
      numPrice: parseFloat(c.price.replace(/[$,]/g, ''))
    }));

    const min = Math.min(...parsed.map(c => c.numPrice)) * 0.98;
    const max = Math.max(...parsed.map(c => c.numPrice)) * 1.02;
    const range = max - min;

    const cands = [];
    let currentY = 50; 
    for (let i = 0; i <= 100; i += 1.5) {
      const isUp = Math.random() > 0.5;
      const bodyHeight = Math.random() * 4 + 1;
      const wickHeight = bodyHeight + Math.random() * 4;
      cands.push({ x: i, y: currentY, isUp, bodyHeight, wickHeight });
      currentY += (Math.random() - 0.5) * 8;
      currentY = Math.max(10, Math.min(90, currentY));
    }

    const bgs = [...Array(12)].map(() => ({
      top: Math.random() * 100,
      height: Math.random() * 4 + 1,
      width: Math.random() * 50 + 20,
      left: Math.random() * 40
    }));

    return { minPrice: min, maxPrice: max, priceRange: range, parsedClusters: parsed, candles: cands, bgBands: bgs };
  }, [clusters]);

  if (!mounted || !clusters || clusters.length === 0) return null;

  return (
    <div className="w-full flex bg-[#0c051a] p-4 rounded-xl border border-gray-800 mt-4 font-mono select-none text-[10px] text-gray-400">
      
      {/* Legend Scale */}
      <div className="flex flex-col items-center mr-4 w-12">
        <span className="mb-1 font-bold text-gray-300">18.21M</span>
        <div className="w-4 h-full rounded-sm bg-gradient-to-b from-[#e2f329] via-[#0daea2] to-[#1B063E] flex-grow"></div>
        <span className="mt-1 font-bold text-gray-300">0</span>
      </div>

      {/* Main Chart Area */}
      <div className="relative flex-grow h-[350px] bg-[#1B063E] border-b border-gray-800 overflow-hidden">
        
        {/* Horizontal grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between opacity-20 pointer-events-none">
          {[1,2,3,4,5,6].map(i => <div key={i} className="w-full h-px bg-gray-500"></div>)}
        </div>

        {/* Liquidation Bands */}
        {parsedClusters.map((cluster, idx) => {
          const yPercent = 100 - ((cluster.numPrice - minPrice) / priceRange) * 100;
          
          let gradient = '';
          if (cluster.intensity === 'HIGH') {
            gradient = 'linear-gradient(90deg, #e2f329 20%, #58d867 50%, #0daea2 80%)';
          } else if (cluster.intensity === 'MEDIUM') {
            gradient = 'linear-gradient(90deg, #0daea2 30%, #3f2991 100%)';
          } else {
            gradient = 'linear-gradient(90deg, #3f2991 40%, transparent 100%)';
          }
          
          return (
            <React.Fragment key={idx}>
              <div 
                className="absolute left-0 right-0 z-10"
                style={{
                  top: `${yPercent}%`,
                  height: cluster.intensity === 'HIGH' ? '6px' : '3px',
                  transform: 'translateY(-50%)',
                  background: gradient,
                  opacity: 0.85
                }}
              />
              {/* Added horizontal streaks for texture */}
              <div 
                className="absolute left-10 right-20 z-10"
                style={{
                  top: `${yPercent + (idx % 2 === 0 ? 1 : -1)}%`,
                  height: '2px',
                  background: gradient,
                  opacity: 0.6
                }}
              />
            </React.Fragment>
          );
        })}

        {/* Background ambient noise bands (simulating low leverage liquidations) */}
        {bgBands.map((b, i) => (
           <div 
             key={`bg-${i}`}
             className="absolute left-0 right-0 z-0 bg-[#3f2991]/30"
             style={{
               top: `${b.top}%`,
               height: `${b.height}px`,
               width: `${b.width}%`,
               left: `${b.left}%`
             }}
           />
        ))}

        {/* Fake Candlesticks Overlay */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          {candles.map((c, i) => (
             <div key={i} className="absolute" style={{ left: `${c.x}%`, top: `${c.y}%`, transform: 'translate(-50%, -50%)' }}>
               <div className={`absolute left-1/2 -translate-x-1/2 w-[1px] ${c.isUp ? 'bg-[#00ff88]' : 'bg-[#ff2a55]'}`} style={{ height: `${c.wickHeight}px`, top: `${-c.wickHeight/2}px` }}></div>
               <div className={`absolute left-1/2 -translate-x-1/2 w-[3px] ${c.isUp ? 'bg-[#00ff88]' : 'bg-[#ff2a55]'}`} style={{ height: `${c.bodyHeight}px`, top: `${-c.bodyHeight/2}px` }}></div>
             </div>
          ))}
        </div>

        {/* Y-Axis Price Labels (Right) */}
        <div className="absolute right-0 top-0 bottom-0 w-12 border-l border-gray-800/50 bg-[#1B063E]/80 flex flex-col justify-between items-center py-2 z-30 font-semibold">
          <span className="text-gray-300">{Math.round(maxPrice)}</span>
          <span className="text-gray-400">{Math.round(minPrice + priceRange*0.75)}</span>
          <span className="text-gray-400">{Math.round(minPrice + priceRange*0.5)}</span>
          <span className="text-gray-400">{Math.round(minPrice + priceRange*0.25)}</span>
          <span className="text-gray-300">{Math.round(minPrice)}</span>
        </div>

        {/* Watermark */}
        <div className="absolute bottom-2 right-14 z-30 flex items-center space-x-1 opacity-70">
          <span className="text-white font-bold text-xs tracking-wider">coinglass</span>
        </div>
      </div>
    </div>
  );
}
