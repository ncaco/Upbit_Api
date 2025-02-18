import { useQuery } from '@tanstack/react-query';
import { market } from '@/lib/api/market';
import { Card } from '@/components/ui/card';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export function PriceChart() {
  const { data: candles } = useQuery({
    queryKey: ['candles', 'KRW-BTC'],
    queryFn: () => market.getCandles('KRW-BTC', 1),
    refetchInterval: 1000,
  });

  const chartData = {
    labels: candles?.data?.map((candle: any) => 
      new Date(candle.timestamp).toLocaleTimeString()
    ) || [],
    datasets: [
      {
        label: '가격',
        data: candles?.data?.map((candle: any) => candle.trade_price) || [],
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: false
      }
    }
  };

  return (
    <Card className="p-4">
      <h2 className="text-lg font-bold mb-4">가격 차트</h2>
      <div className="h-96">
        <Line options={options} data={chartData} />
      </div>
    </Card>
  );
} 