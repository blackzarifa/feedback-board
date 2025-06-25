import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Container } from '@/components/container';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-semibold">Feedback Board</span>
          </Link>

          <nav className="flex items-center space-x-4">
            <Button variant="ghost" asChild>
              <Link href="/admin/login">Admin Login</Link>
            </Button>
          </nav>
        </div>
      </Container>
    </header>
  );
}
