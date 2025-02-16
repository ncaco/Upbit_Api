import { Outlet } from 'react-router-dom';
import { Header } from './header';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WebSocketProvider } from '@/contexts/websocket-context';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

export function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <main className="max-w-7xl mx-auto px-4 py-6">
            <Outlet />
          </main>
        </div>
      </WebSocketProvider>
    </QueryClientProvider>
  );
} 