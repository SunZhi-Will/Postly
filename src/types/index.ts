export interface Author {
  id: string;
  name: string;
  picture?: string;
}

export interface Post {
  id: string;
  content: string;
  created_at: string;
  is_anonymous: boolean;
  author: Author | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
} 