export interface Author {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

export interface Post {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  is_anonymous: boolean;
}

export interface Comment {
  id: string;
  content: string;
  post_id: string;
  author_id: string;
  created_at: string;
  is_anonymous: boolean;
  author?: Author | null;
  post?: Post;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export interface ApiService {
  getPosts(): Promise<ApiResponse<Post[]>>;
  getPost(id: string): Promise<ApiResponse<Post>>;
  getMyPosts(): Promise<ApiResponse<Post[]>>;
  getMyComments(): Promise<ApiResponse<Comment[]>>;
  getPostComments(postId: string): Promise<ApiResponse<Comment[]>>;
  getStreak(): Promise<ApiResponse<{ streak: number }>>;
  createComment(postId: string, content: string, isAnonymous: boolean): Promise<ApiResponse<Comment>>;
  createPost(content: string, isAnonymous: boolean): Promise<ApiResponse<Post>>;
  setUserEmail(email: string | null): void;
  getUser(userId: string): Promise<{ success: boolean; data: Author; error?: string }>;
  getUserPosts(userId: string): Promise<ApiResponse<Post[]>>;
  getRecentPosts(): Promise<string[]>;
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

interface CacheData {
  [key: string]: unknown;
}

class Cache {
  private cache: Map<string, { data: CacheData; timestamp: number }> = new Map();
  private readonly TTL = 5 * 60 * 1000; // 5 minutes

  set(key: string, data: CacheData) {
    this.cache.set(key, { data, timestamp: Date.now() });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    return item.data as T;
  }

  clear() {
    this.cache.clear();
  }
}

const localCache = new Cache();

const API_KEY = process.env.GAS_API_KEY;
const GAS_URL = process.env.GAS_URL;

class Api implements ApiService {
  private userEmail: string | null = null;

  constructor() {
    // userEmail 將在每次請求時從 session 中獲取
  }

  setUserEmail(email: string | null) {
    console.log('設置用戶 email:', email);
    this.userEmail = email;
    localCache.clear();
  }

  private getUserEmail() {
    return this.userEmail;
  }

  private getCacheKey(endpoint: string, params: Record<string, string> = {}): string {
    const sortedParams = Object.entries(params)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    return `${endpoint}?${sortedParams}`;
  }

  private async fetchWithCache<T>(
    endpoint: string,
    params: Record<string, string> = {},
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    // 只快取 GET 請求
    if (options.method && options.method !== 'GET') {
      try {
        const response = await fetch(`${BASE_URL}${endpoint}`, options);
        const data = await response.json();
        return { 
          success: response.ok, 
          data: data.data || data, // 有些 API 直接返回數據，有些包裝在 data 中
          error: data.error 
        };
      } catch (error) {
        console.error(`API 請求失敗 (${endpoint}):`, error);
        return { success: false, data: [] as unknown as T, error: '請求失敗' };
      }
    }

    const cacheKey = this.getCacheKey(endpoint, params);
    const cachedData = localCache.get<T>(cacheKey);
    
    if (cachedData) {
      return { success: true, data: cachedData };
    }

    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${BASE_URL}${endpoint}${queryString ? `?${queryString}` : ''}`;
      const response = await fetch(url, options);
      const data = await response.json();

      if (response.ok) {
        const responseData = data.data || data; // 有些 API 直接返回數據，有些包裝在 data 中
        localCache.set(cacheKey, responseData);
        return { success: true, data: responseData };
      }

      return { success: false, data: [] as unknown as T, error: data.error };
    } catch (error) {
      console.error(`API 請求失敗 (${endpoint}):`, error);
      return { success: false, data: [] as unknown as T, error: '請求失敗' };
    }
  }

  // 獲取最近的五篇文章
  async getRecentPosts(): Promise<string[]> {
    try {
      const response = await fetch(`${GAS_URL}?apiKey=${API_KEY}&table=posts`);
      const data = await response.json() as Post[];
      
      // 按創建時間排序並取最近的5篇
      return data
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5)
        .map(post => post.content);
    } catch (error) {
      console.error('獲取文章時發生錯誤:', error);
      return [];
    }
  }

  // 公開的 API 呼叫
  async getPosts(): Promise<ApiResponse<Post[]>> {
    try {
      return this.fetchWithCache<Post[]>('/posts', {
        user_email: this.userEmail || '',
        include: 'author,comments'
      });
    } catch (error) {
      console.error('獲取文章失敗:', error);
      return { success: false, data: [], error: '獲取文章失敗' };
    }
  }

  async getPost(id: string): Promise<ApiResponse<Post>> {
    try {
      const response = await this.fetchWithCache<Post>('/posts', {
        id,
        user_email: this.userEmail || '',
        include: 'comments'
      });

      if (response.success && response.data) {
        return response;
      }

      return {
        success: false,
        data: {
          id: '',
          content: '',
          author_id: '',
          created_at: '',
          updated_at: '',
          is_anonymous: false
        },
        error: response.error || '獲取文章失敗'
      };
    } catch (error) {
      console.error('獲取文章失敗:', error);
      return {
        success: false,
        data: {
          id: '',
          content: '',
          author_id: '',
          created_at: '',
          updated_at: '',
          is_anonymous: false
        },
        error: '獲取文章失敗'
      };
    }
  }

  async getMyPosts(): Promise<ApiResponse<Post[]>> {
    try {
      if (!this.userEmail) {
        return { success: false, data: [], error: '請先登入' };
      }

      return this.fetchWithCache<Post[]>('/posts', {
        user_email: this.userEmail,
        mine: 'true',
        include: 'author,comments'
      });
    } catch (error) {
      console.error('獲取我的文章失敗:', error);
      return { success: false, data: [], error: '獲取文章失敗' };
    }
  }

  async getMyComments(): Promise<ApiResponse<Comment[]>> {
    try {
      if (!this.userEmail) {
        return { success: false, data: [], error: '請先登入' };
      }

      return this.fetchWithCache<Comment[]>('/comments', {
        user_email: this.userEmail,
        mine: 'true',
        include: 'author,post'
      });
    } catch (error) {
      console.error('獲取我的留言失敗:', error);
      return { success: false, data: [], error: '獲取留言失敗' };
    }
  }

  async getStreak(): Promise<ApiResponse<{ streak: number }>> {
    try {
      if (!this.userEmail) {
        return { success: false, data: { streak: 0 }, error: '請先登入' };
      }

      return this.fetchWithCache<{ streak: number }>('/streak', {
        user_email: this.userEmail
      });
    } catch (error) {
      console.error('獲取連續發文天數失敗:', error);
      return { success: false, data: { streak: 0 }, error: '獲取連續發文天數失敗' };
    }
  }

  async getPostComments(postId: string): Promise<ApiResponse<Comment[]>> {
    try {
      return this.fetchWithCache<Comment[]>('/comments', {
        post_id: postId,
        user_email: this.userEmail || '',
        include: 'author'
      });
    } catch (error) {
      console.error('獲取留言失敗:', error);
      return { success: false, data: [], error: '獲取留言失敗' };
    }
  }

  async createComment(postId: string, content: string, isAnonymous: boolean): Promise<ApiResponse<Comment>> {
    try {
      if (!this.userEmail) {
        return {
          success: false,
          data: {
            id: '',
            content: '',
            post_id: '',
            author_id: '',
            created_at: '',
            is_anonymous: false
          },
          error: '請先登入'
        };
      }

      return this.fetchWithCache<Comment>('/comments', {}, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          post_id: postId,
          content,
          is_anonymous: isAnonymous
        }),
      });
    } catch (error) {
      console.error('創建留言失敗:', error);
      return {
        success: false,
        data: {
          id: '',
          content: '',
          post_id: '',
          author_id: '',
          created_at: '',
          is_anonymous: false
        },
        error: '創建留言失敗'
      };
    }
  }

  async createPost(content: string, isAnonymous: boolean): Promise<ApiResponse<Post>> {
    try {
      if (!this.userEmail) {
        return {
          success: false,
          data: {
            id: '',
            content: '',
            author_id: '',
            created_at: '',
            updated_at: '',
            is_anonymous: false
          },
          error: '請先登入'
        };
      }

      return this.fetchWithCache<Post>(
        '/posts',
        {},
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            content,
            is_anonymous: isAnonymous,
            user_email: this.userEmail
          })
        }
      );
    } catch (error) {
      console.error('創建文章失敗:', error);
      return {
        success: false,
        data: {
          id: '',
          content: '',
          author_id: '',
          created_at: '',
          updated_at: '',
          is_anonymous: false
        },
        error: '創建文章失敗'
      };
    }
  }

  async getUser(userId: string): Promise<{ success: boolean; data: Author; error?: string }> {
    try {
      const response = await this.fetchWithCache<Author>(`/users/${userId}`, {
        user_email: this.userEmail || ''
      });

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data
        };
      }

      return {
        success: false,
        data: { id: '', name: '', email: '' },
        error: response.error || '獲取用戶資料失敗'
      };
    } catch (error) {
      console.error('獲取用戶資料失敗:', error);
      return {
        success: false,
        data: { id: '', name: '', email: '' },
        error: '獲取用戶資料失敗'
      };
    }
  }

  async getUserPosts(userId: string): Promise<ApiResponse<Post[]>> {
    try {
      const response = await this.fetchWithCache<Post[]>(`/users/${userId}/posts`, {
        user_email: this.userEmail || ''
      });

      if (response.success && response.data) {
        // 確保返回的是數組
        const posts = Array.isArray(response.data) ? response.data : [response.data];
        return {
          success: true,
          data: posts
        };
      }

      return {
        success: false,
        data: [],
        error: response.error || '獲取用戶文章失敗'
      };
    } catch (error) {
      console.error('獲取用戶文章失敗:', error);
      return {
        success: false,
        data: [],
        error: '獲取用戶文章失敗'
      };
    }
  }
}

// 只保留一個 api 導出
export const api = new Api(); 