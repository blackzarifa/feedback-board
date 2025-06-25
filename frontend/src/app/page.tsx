'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Container } from '@/components/container';
import { api } from '@/lib/api-client';
import { Company } from '@/lib/types';
import { ArrowRight, Building2 } from 'lucide-react';

export default function Home() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const data = await api.get<Company[]>('/companies');
        setCompanies(data);
      } catch (err) {
        setError('Failed to load companies');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-12">
        <div className="text-center">
          <p className="text-red-500">{error}</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-12">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Customer Feedback Boards</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Select a company below to view and submit feedback. Help shape the future of the products
          you use.
        </p>
      </div>

      {companies.length === 0 ? (
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No companies available yet.</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {companies.map(company => (
            <Link
              key={company.id}
              href={`/${company.slug}`}
              className="block transition-transform hover:scale-[1.02]"
            >
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Building2 className="h-8 w-8 text-primary" />
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <CardTitle className="mt-4">{company.name}</CardTitle>
                  <CardDescription>View feedback and feature requests</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12 text-center text-sm text-muted-foreground">
        <p>
          Are you a company admin?
          <Link href="/admin/login" className="text-primary hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </Container>
  );
}
