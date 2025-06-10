export interface Post {
  id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
  likes?: string[];
  comments?: Comment[];
  tags?: string[];
}

export interface Comment {
  id: string;
  content: string;
  created_at: string;
  author: {
    id: string;
    name: string;
    image?: string;
  };
} 