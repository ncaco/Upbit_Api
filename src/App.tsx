import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { RootLayout } from '@/components/layout/root-layout';
import { AppRoutes } from '@/routes';
import { WebSocketProvider } from '@/contexts/websocket-context';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WebSocketProvider>
        <BrowserRouter>
          <RootLayout>
            <AppRoutes />
          </RootLayout>
        </BrowserRouter>
      </WebSocketProvider>
    </QueryClientProvider>
  );
}

export default App;
