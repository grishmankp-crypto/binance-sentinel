'use client';
import React, { useEffect, useState } from 'react';

export default function HeatmapSimulator({ clusters }: { clusters: any[] }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !clusters || clusters.length === 0) return null;

  // Extract prices from strings (e.g., "$64,500")
  const parsedClusters = clusters.map(c => ({
    ...c,
    numPrice: parseFloat(c.price.replace(/[$,]/g, ''))
  }));

  const minPrice = Math.min(...parsedClusters.map(c => c.numPrice)) * 0.98;
  const maxPrice = Math.max(...parsedClusters.map(c => c.numPrice)) * 1.02;
  const priceRange = maxPrice - minPrice;

  // Generate a fake price line that wanders from left to right
  const points = [];
  let currentY = 50; // start in middle
  for (let i = 0; i <= 100; i += 2) {
    points.push(`${i}% ${currentY}%`);
    // Random walk
    currentY += (Math.random() - 0.5) * 10;
    currentY = Math.max(10, Math.min(90, currentY)); // keep within bounds
  }
  const svgPath = points.map((p, i) => (i === 0 ? `M 0,${currentY}` : `L ${i},${currentY}`)).join(' ');

  return (
    <div className="relative w-full h-[280px] bg-[#0b0e11] rounded-lg overflow-hidden border border-gray-800 mt-4 font-mono select-none">
      
      {/* Grid Lines */}
      <div className="absolute inset-0 flex flex-col justify-between opacity-10 pointer-events-none">
        {[1,2,3,4,5].map(i => <div key={i} className="w-full h-px bg-white"></div>)}
      </div>
      <div className="absolute inset-0 flex justify-between opacity-10 pointer-events-none">
        {[1,2,3,4,5,6,7].map(i => <div key={i} className="w-px h-full bg-white"></div>)}
      </div>

      {/* Heatmap Clusters */}
      {parsedClusters.map((cluster, idx) => {
        // Calculate Y position as percentage from top
        const yPercent = 100 - ((cluster.numPrice - minPrice) / priceRange) * 100;
        
        // Heatmap colors based on intensity
        const color = cluster.intensity === 'HIGH' ? 'rgba(255, 204, 0, 0.8)' : 
                     cluster.intensity === 'MEDIUM' ? 'rgba(255, 153, 0, 0.5)' : 
                     'rgba(255, 102, 0, 0.3)';
        
        const height = cluster.intensity === 'HIGH' ? '12px' : '8px';
        const blur = cluster.intensity === 'HIGH' ? 'blur(8px)' : 'blur(12px)';

        return (
          <React.Fragment key={idx}>
            {/* Glowing Band */}
            <div 
              className="absolute left-0 right-0 z-10"
              style={{
                top: `${yPercent}%`,
                height: height,
                transform: 'translateY(-50%)',
                background: `linear-gradient(90deg, transparent 0%, ${color} 50%, transparent 100%)`,
                filter: blur,
                opacity: 0.8
              }}
            />
            {/* Price Label */}
            <div 
              className="absolute right-2 z-30 text-[10px] text-gray-300 bg-[#0b0e11]/80 px-1 rounded border border-gray-700"
              style={{
                top: `${yPercent}%`,
                transform: 'translateY(-50%)',
              }}
            >
              {cluster.price}
            </div>
            {/* Leverage Label */}
            <div 
              className="absolute left-2 z-30 text-[10px] text-yellow-500/80 bg-[#0b0e11]/80 px-1 rounded border border-gray-700/50"
              style={{
                top: `${yPercent}%`,
                transform: 'translateY(-50%)',
              }}
            >
              {cluster.leverage}
            </div>
          </React.Fragment>
        );
      })}

      {/* Fake Price Line Overlay */}
      <svg className="absolute inset-0 w-full h-full z-20 pointer-events-none" preserveAspectRatio="none">
        <path 
          d={svgPath.replace(/%/g, '')} 
          fill="none" 
          stroke="rgba(255, 255, 255, 0.7)" 
          strokeWidth="1.5" 
          vectorEffect="non-scaling-stroke"
          style={{ transform: 'scale(10, 2.8)' }} // hack to stretch SVG path
        />
        <circle cx="100%" cy={`${currentY}%`} r="3" fill="#fff" className="animate-pulse" />
      </svg>
      
      {/* Current Price Indicator */}
      <div 
        className="absolute right-0 z-30 text-xs font-bold text-white bg-green-500 px-2 py-0.5 rounded-l"
        style={{
          top: `${currentY}%`,
          transform: 'translateY(-50%)',
        }}
      >
        LIVE
      </div>

      {/* Coinglass Watermark */}
      <div className="absolute bottom-2 left-2 z-30 opacity-30 pointer-events-none flex items-center space-x-1">
        <div className="w-4 h-4 rounded-full border-2 border-white flex items-center justify-center">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
        </div>
        <span className="text-xs font-bold text-white tracking-widest">COINGLASS</span>
      </div>

      <div className="absolute top-2 left-2 z-30 text-[10px] text-gray-500">
        Liquidation Leverage Map (Simulated)
      </div>
    </div>
  );
}
