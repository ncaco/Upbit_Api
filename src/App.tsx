import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { RootLayout } from '@/components/layout/root-layout';
import DashboardPage from '@/pages/dashboard';
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
        path: 'assets',
        element: <AssetsPage />
      }
    ]
  }
]);

export default function App() {
  return <RouterProvider router={router} />;
}
