'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Container } from '@/components/container';
import { FeedbackCard } from '@/components/feedback-card';
import { SubmitFeedbackDialog } from '@/components/submit-feedback-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api-client';
import { statusConfig } from '@/lib/utils';
import type { Company, Feedback, CreateFeedbackDTO } from '@/lib/types';
import { toast } from 'sonner';
import { Search, MessageSquarePlus } from 'lucide-react';

export default function CompanyFeedbackPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [company, setCompany] = useState<Company | null>(null);
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [userVotes, setUserVotes] = useState<Set<string>>(new Set());

  useEffect(() => {
    const fetchData = async () => {
      try {
        const companyData = await api.get<Company>(`/companies/${slug}`);
        setCompany(companyData);

        const feedbackData = await api.get<Feedback[]>(`/feedback?companyId=${companyData.id}`);
        setFeedbackItems(feedbackData);

        const feedbackIds = feedbackData.map(f => f.id).join(',');
        if (feedbackIds) {
          const votesData = await api.get<{ feedbackId: string }[]>(
            `/votes/user-votes?feedbackIds=${feedbackIds}`,
          );
          setUserVotes(new Set(votesData.map(v => v.feedbackId)));
        }
      } catch (error) {
        toast.error('Failed to load feedback');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  const handleVote = async (feedbackId: string) => {
    try {
      await api.post('/votes', { feedbackId });
      setUserVotes(prev => new Set(prev).add(feedbackId));
    } catch (error) {
      toast.error('Failed to submit vote');
      throw error;
    }
  };

  const handleUnvote = async (feedbackId: string) => {
    try {
      await api.delete(`/votes/${feedbackId}`);
      setUserVotes(prev => {
        const newSet = new Set(prev);
        newSet.delete(feedbackId);
        return newSet;
      });
    } catch (error) {
      toast.error('Failed to remove vote');
      throw error;
    }
  };

  const handleSubmitFeedback = async (data: Omit<CreateFeedbackDTO, 'companyId'>) => {
    if (!company) return;

    const newFeedback = await api.post<Feedback>('/feedback', {
      ...data,
      companyId: company.id,
    });

    setFeedbackItems(prev => [newFeedback, ...prev]);
  };

  const filteredFeedback = feedbackItems.filter(item => {
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = activeTab === 'all' || item.status === activeTab;

    return matchesSearch && matchesStatus;
  });

  const sortedFeedback = [...filteredFeedback].sort((a, b) => b.voteCount - a.voteCount);

  if (loading) {
    return (
      <Container className="py-8">
        <Skeleton className="h-12 w-64 mb-8" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      </Container>
    );
  }

  if (!company) {
    return (
      <Container className="py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Company not found</h1>
          <p className="text-muted-foreground mt-2">
            The feedback board you&apos;re looking for doesn&apos;t exist.
          </p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{company.name} Feedback Board</h1>
        <p className="text-muted-foreground">
          Help us improve by sharing your ideas and reporting issues
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="search"
            placeholder="Search feedback..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <SubmitFeedbackDialog onSubmitAction={handleSubmitFeedback} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="all">All</TabsTrigger>
          {Object.entries(statusConfig).map(([key, config]) => (
            <TabsTrigger key={key} value={key}>
              <span className="hidden sm:inline">{config.label}</span>
              <span className="sm:hidden">{config.icon}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {sortedFeedback.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquarePlus className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No feedback yet</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery
                  ? 'No feedback matches your search.'
                  : 'Be the first to share your thoughts!'}
              </p>
              {!searchQuery && <SubmitFeedbackDialog onSubmitAction={handleSubmitFeedback} />}
            </div>
          ) : (
            <div className="space-y-4">
              {sortedFeedback.map(feedback => (
                <FeedbackCard
                  key={feedback.id}
                  feedback={feedback}
                  hasVoted={userVotes.has(feedback.id)}
                  onVoteAction={handleVote}
                  onUnvoteAction={handleUnvote}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </Container>
  );
}
