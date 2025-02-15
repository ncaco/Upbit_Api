import { Routes, Route } from 'react-router-dom';
import { Dashboard } from '@/components/dashboard';
import { Trade } from '@/pages/trade';
import { Assets } from '@/pages/assets';
import { Settings } from '@/pages/settings';
import { AutoTrading } from '@/pages/auto-trading';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/trade" element={<Trade />} />
      <Route path="/assets" element={<Assets />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/auto-trading" element={<AutoTrading />} />
    </Routes>
  );
} 