import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';

export default function TradingChart({ data }: { data: any[] }) {
  const chartContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chartContainerRef.current || !data || !Array.isArray(data) || data.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: 'solid', color: '#111827' }, // gray-900
        textColor: '#9CA3AF', // gray-400
      },
      grid: {
        vertLines: { color: '#1F2937' }, // gray-800
        horzLines: { color: '#1F2937' }, // gray-800
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      }
    });

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#10B981', // green-500
      downColor: '#EF4444', // red-500
      borderVisible: false,
      wickUpColor: '#10B981',
      wickDownColor: '#EF4444',
    });

    // Format data for lightweight-charts
    // The chart expects { time: number (seconds), open, high, low, close }
    const formattedData = data.map((k) => ({
      time: Math.floor(k.timestamp / 1000) as any,
      open: k.open,
      high: k.high,
      low: k.low,
      close: k.close,
    })).sort((a, b) => a.time - b.time); // Must be sorted chronologically

    candlestickSeries.setData(formattedData);

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data]);

  return <div ref={chartContainerRef} className="w-full h-full min-h-[300px]" />;
}
