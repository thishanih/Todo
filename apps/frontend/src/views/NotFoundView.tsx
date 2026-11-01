import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export default function NotFoundView() {
  return (
    <main className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold">This page wandered off.</h1>
        <p className="mt-2 text-muted-foreground">
          Let’s get you back to your list.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Back to todos</Link>
        </Button>
      </div>
    </main>
  );
}
