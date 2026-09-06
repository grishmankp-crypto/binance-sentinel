'use client';
import React from 'react';

export default function FearAndGreedGauge({ value }: { value: number }) {
  // value is 0 to 100
  const normalizedValue = Math.min(100, Math.max(0, value));
  
  // Calculate angle for the needle (0 to 180 degrees)
  // 0 = 0 degrees (left), 100 = 180 degrees (right)
  const angle = (normalizedValue / 100) * 180;
  
  let label = "Neutral";
  let color = "text-yellow-500";
  if (value >= 75) { label = "Extreme Greed"; color = "text-green-500"; }
  else if (value >= 55) { label = "Greed"; color = "text-green-400"; }
  else if (value <= 25) { label = "Extreme Fear"; color = "text-red-500"; }
  else if (value <= 45) { label = "Fear"; color = "text-red-400"; }

  // 180 degree SVG arc path
  const radius = 80;
  const strokeWidth = 20;
  const cx = 100;
  const cy = 100;
  
  return (
    <div className="bg-[#181a20] border border-gray-800 rounded-xl p-6 flex flex-col items-center justify-center text-center">
      <h3 className="text-lg font-semibold text-white w-full text-left mb-6">Crypto Fear & Greed Index</h3>
      
      <div className="relative w-48 h-28 overflow-hidden mb-2">
        {/* SVG Gauge */}
        <svg viewBox="0 0 200 110" className="w-full h-full drop-shadow-lg">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff4d4d" />    {/* Red */}
              <stop offset="35%" stopColor="#ffa64d" />   {/* Orange */}
              <stop offset="65%" stopColor="#ffd24d" />   {/* Yellow */}
              <stop offset="100%" stopColor="#2ebd85" />  {/* Green */}
            </linearGradient>
          </defs>
          {/* Background Arc */}
          <path
            d={`M ${cx - radius},${cy} A ${radius},${radius} 0 0,1 ${cx + radius},${cy}`}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
          
          {/* Needle Triangle */}
          <g transform={`rotate(${angle} ${cx} ${cy})`} className="transition-transform duration-1000 ease-out">
            <polygon points={`${cx - 7},${cy} ${cx + 7},${cy} ${cx},${cy - radius + strokeWidth/2 - 5}`} fill="#848e9c" />
            <circle cx={cx} cy={cy} r="7" fill="#848e9c" />
            <circle cx={cx} cy={cy} r="3" fill="#181a20" />
          </g>
        </svg>

        {/* Center Number */}
        <div className="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-end">
          <span className="text-4xl font-bold text-white leading-none">{value}</span>
        </div>
      </div>
      
      <span className={`text-xl font-bold ${color} mt-2 tracking-wide`}>{label}</span>
      
      <div className="w-full mt-8 flex justify-between items-center text-sm">
        <div className="w-1/2 bg-[#ff4d4d] text-white text-center py-1.5 rounded-l-md font-semibold opacity-90">Bearish</div>
        <div className="w-1/2 bg-[#2ebd85] text-white text-center py-1.5 rounded-r-md font-semibold opacity-90">Bullish</div>
      </div>
      
      <p className="text-xs text-gray-500 mt-6 text-left leading-relaxed">
        The index ranges from 0 (Extreme Fear) to 100 (Extreme Greed). A low value signals overselling, while a high value suggests market FOMO.
      </p>
    </div>
  );
}
