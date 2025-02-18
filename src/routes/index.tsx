import { Routes, Route } from 'react-router-dom';
import DashboardPage from '@/pages/dashboard';
import Assets from '@/pages/assets';
import { Settings } from '@/pages/settings';
import AutoTrading from '@/pages/auto-trading';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPage />} />
      <Route path="/assets" element={<Assets />} />
      <Route path="/auto-trading" element={<AutoTrading />} />
      <Route path="/settings" element={<Settings />} />
    </Routes>
  );
} 