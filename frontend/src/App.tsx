import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AppRoutes } from './routes/AppRoutes';
import { SmoothScrollProvider } from './providers/SmoothScrollProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30, // 30 seconds
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        // Do not retry on 401, 403, or 404
        if (error?.status === 401 || error?.status === 403 || error?.status === 404) {
          return false;
        }
        return failureCount < 2;
      },
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <SmoothScrollProvider duration={1.1}>
          <AppRoutes />
          <Toaster position="top-right" richColors closeButton />
        </SmoothScrollProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
