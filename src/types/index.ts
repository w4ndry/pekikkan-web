export interface Quote {
  id: string;
  content: string;
  author: string;
  user_id: string;
  like_count: number;
  save_count: number;
  created_at: string;
  updated_at: string;
  user?: {
    username: string;
    full_name: string;
    avatar_url?: string;
  };
  isLiked?: boolean;
  isSaved?: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
}

export interface Interaction {
  id: string;
  user_id: string;
  quote_id: string;
  type: 'like' | 'save' | 'report';
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface QuoteReport {
  id: string;
  quote_id: string;
  user_id: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
  quote?: Quote;
  user?: UserProfile;
}