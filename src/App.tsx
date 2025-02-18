import { RouterProvider, createBrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/components/layout/root-layout';
import DashboardPage from '@/pages/dashboard';
import AssetsPage from '@/pages/assets';
import { Settings } from '@/pages/settings';
import AutoTrading from '@/pages/auto-trading';
import './App.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'assets', element: <AssetsPage /> },
      { path: 'auto-trading', element: <AutoTrading /> },
      { path: 'settings', element: <Settings /> }
    ]
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
