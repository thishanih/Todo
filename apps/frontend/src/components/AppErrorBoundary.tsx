import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  error: Error | null;
}

export class AppErrorBoundary extends Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(
      'The Todo app encountered an unexpected error.',
      error,
      errorInfo,
    );
  }

  render() {
    if (this.state.error) {
      return (
        <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-destructive">
            Unexpected error
          </p>
          <h1 className="mt-3 text-3xl font-semibold">We hit a snag.</h1>
          <p className="mt-3 text-muted-foreground">
            {this.state.error.message || 'The app could not render this page.'}
          </p>
          <Button className="mt-6" onClick={() => window.location.reload()}>
            Reload the app
          </Button>
        </main>
      );
    }

    return this.props.children;
  }
}
