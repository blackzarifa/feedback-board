'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import { Container } from '@/components/container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { api } from '@/lib/api-client';
import { statusConfig, cn } from '@/lib/utils';
import type { Company, Feedback } from '@/lib/types';
import { toast } from 'sonner';
import { Search, Trash2, ChevronUp, Mail, Calendar, LogOut } from 'lucide-react';
import { format } from 'date-fns';

export default function AdminDashboardPage() {
  const { user, token, logout } = useAuth();
  const [company, setCompany] = useState<Company | null>(null);
  const [feedbackItems, setFeedbackItems] = useState<Feedback[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const companies = await api.get<Company[]>('/companies');
        const userCompany = companies.find(c => c.id === user.companyId);
        setCompany(userCompany || null);

        const feedbackData = await api.get<Feedback[]>(`/feedback?companyId=${user.companyId}`);
        setFeedbackItems(feedbackData);
      } catch (error) {
        toast.error('Failed to load data');
        console.error(error);
      }
    };

    fetchData();
  }, [user]);

  const handleStatusUpdate = async (feedbackId: string, newStatus: Feedback['status']) => {
    try {
      await api.patch(
        `/feedback/${feedbackId}`,
        { status: newStatus },
        { token: token || undefined },
      );

      setFeedbackItems(prev =>
        prev.map(item => (item.id === feedbackId ? { ...item, status: newStatus } : item)),
      );

      toast.success('Status updated successfully');
    } catch (error) {
      toast.error(error as string);
    }
  };

  const handleDelete = async () => {
    if (!deleteId || !token) return;

    try {
      await api.delete<{ message: string }>(`/feedback/${deleteId}`, { token: token || undefined });
      setFeedbackItems(prev => prev.filter(item => item.id !== deleteId));
      toast.success('Feedback deleted successfully');
    } catch (error) {
      toast.error('Failed to delete feedback');
    } finally {
      setDeleteId(null);
    }
  };

  const filteredFeedback = feedbackItems.filter(item => {
    const matchesSearch =
      !searchQuery ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.submitterEmail?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = activeTab === 'all' || item.status === activeTab;

    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: feedbackItems.length,
    new: feedbackItems.filter(f => f.status === 'new').length,
    inProgress: feedbackItems.filter(f => f.status === 'in_progress').length,
    completed: feedbackItems.filter(f => f.status === 'completed').length,
  };

  return (
    <ProtectedRoute>
      <Container className="py-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
            <p className="text-muted-foreground">
              Manage feedback for {company?.name || 'your company'}
            </p>
          </div>
          <Button variant="outline" onClick={logout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">New Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.new}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                In Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
            </CardContent>
          </Card>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="search"
              placeholder="Search feedback by title, description, or email..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
            <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
            {Object.entries(statusConfig).map(([key, config]) => {
              const count = feedbackItems.filter(f => f.status === key).length;
              return (
                <TabsTrigger key={key} value={key}>
                  <span className="hidden sm:inline">{config.label}</span>
                  <span className="sm:hidden">{config.icon}</span>
                  <span className="ml-1">({count})</span>
                </TabsTrigger>
              );
            })}
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {filteredFeedback.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <p className="text-muted-foreground">
                    {searchQuery
                      ? 'No feedback matches your search.'
                      : 'No feedback in this category.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredFeedback.map(feedback => (
                  <Card key={feedback.id} className="overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-lg">
                            <ChevronUp className="h-5 w-5" />
                          </div>
                          <span className="text-sm font-semibold mt-1">{feedback.voteCount}</span>
                        </div>

                        <div className="flex-1 space-y-3">
                          <div>
                            <div className="flex items-start justify-between">
                              <h3 className="font-semibold text-lg">{feedback.title}</h3>
                              <div className="flex items-center gap-2">
                                <Select
                                  value={feedback.status}
                                  onValueChange={value =>
                                    handleStatusUpdate(feedback.id, value as Feedback['status'])
                                  }
                                >
                                  <SelectTrigger className="w-[140px] h-8">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Object.entries(statusConfig).map(([value, config]) => (
                                      <SelectItem key={value} value={value}>
                                        <div className="flex items-center gap-2">
                                          <span className={cn('text-xs', config.color)}>
                                            {config.icon}
                                          </span>
                                          <span>{config.label}</span>
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setDeleteId(feedback.id)}
                                >
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-muted-foreground mt-1">{feedback.description}</p>
                          </div>

                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <Badge variant="outline">{feedback.category}</Badge>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {format(new Date(feedback.createdAt), 'MMM d, yyyy')}
                            </div>
                            {feedback.submitterEmail && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {feedback.submitterEmail}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Feedback</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this feedback? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </Container>
    </ProtectedRoute>
  );
}
