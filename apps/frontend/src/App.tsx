import { Suspense, lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import { SuspenseFallback } from '@/components/SuspenseFallback';
import NotFoundView from '@/views/NotFoundView';

const TodoView = lazy(() => import('@/views/todoView/TodoView'));

export default function App() {
  return (
    <AppErrorBoundary>
      <Suspense fallback={<SuspenseFallback />}>
        <Routes>
          <Route element={<TodoView />} path="/" />
          <Route element={<NotFoundView />} path="*" />
        </Routes>
      </Suspense>
    </AppErrorBoundary>
  );
}
