export interface Company {
  id: string
  name: string
  slug: string
  createdAt: string
}

export interface User {
  id: string
  email: string
  companyId: string
  createdAt: string
}

export interface Feedback {
  id: string
  companyId: string
  title: string
  description: string
  category: 'feature' | 'bug' | 'improvement' | 'other'
  status: 'new' | 'under_review' | 'planned' | 'in_progress' | 'completed'
  submitterEmail?: string
  voteCount: number
  createdAt: string
  updatedAt: string
}

export interface Vote {
  id: string
  feedbackId: string
  voterIdentifier: string
  createdAt: string
}

export interface CreateFeedbackDTO {
  companyId: string
  title: string
  description: string
  category: Feedback['category']
  submitterEmail?: string
}

export interface UpdateFeedbackDTO {
  status: Feedback['status']
}

export interface LoginDTO {
  email: string
  password: string
}

export interface RegisterDTO {
  email: string
  password: string
  companyId: string
}

export interface AuthResponse {
  access_token: string
  user: {
    id: string
    email: string
    companyId: string
  }
}
