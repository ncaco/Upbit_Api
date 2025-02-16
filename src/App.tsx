import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '@/components/layout/root-layout';
import DashboardPage from '@/pages/dashboard';
import TradePage from '@/pages/trade';
import AssetsPage from '@/pages/assets';
import './App.css';

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />
      },
      {
        path: 'trade',
        element: <TradePage />
      },
      {
        path: 'assets',
        element: <AssetsPage />
      }
    ]
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
