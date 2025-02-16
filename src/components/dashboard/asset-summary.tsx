import { useQuery } from '@tanstack/react-query';
import { account } from '@/lib/api';
import { formatNumber } from '@/lib/utils';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Account {
  currency: string;
  balance: string;
  avg_buy_price: string;
  unit_currency: string;
}

export function AssetSummary() {
  const { data: accounts } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => account.getAccounts(),
  });

  const chartData = {
    labels: accounts?.data?.map((account: Account) => account.currency) || [],
    datasets: [
      {
        data: accounts?.data?.map((account: Account) => 
          parseFloat(account.balance) * parseFloat(account.avg_buy_price)
        ) || [],
        backgroundColor: [
          '#1E88E5', // 파랑
          '#43A047', // 초록
          '#E53935', // 빨강
          '#FB8C00', // 주황
          '#8E24AA', // 보라
          '#00ACC1', // 청록
          '#6D4C41', // 갈색
          '#546E7A', // 회색
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          font: {
            size: 12
          }
        }
      }
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="border-b border-gray-200 p-4">
        <h2 className="text-lg font-medium text-gray-900">보유자산 현황</h2>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-4">
            {accounts?.data?.map((account: Account) => {
              const balance = parseFloat(account.balance);
              const avgPrice = parseFloat(account.avg_buy_price);
              const totalValue = balance * avgPrice;
              
              return (
                <div key={account.currency} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">{account.currency}</div>
                    <div className="text-sm text-gray-500">평균단가: {formatNumber(avgPrice)} {account.unit_currency}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-gray-900">{formatNumber(totalValue)} {account.unit_currency}</div>
                    <div className="text-sm text-gray-500">{balance.toFixed(8)} {account.currency}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex items-center justify-center">
            <div className="w-full max-w-[300px]">
              <Pie data={chartData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 