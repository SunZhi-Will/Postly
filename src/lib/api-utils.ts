const API_KEY = process.env.GAS_API_KEY
const GAS_API_URL = process.env.GAS_URL

// 定義通用的介面
export interface Author {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export interface Post {
  id: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at?: string;
  is_anonymous: boolean;
  streak_count?: number;
  last_post_date?: string;
  author?: Author | null;
}

export interface Comment {
  id: string;
  content: string;
  post_id: string;
  author_id: string;
  created_at: string;
  is_anonymous: boolean;
  author?: Author | null;
}

export interface ApiResponse<T> {
  error?: string;
  data?: T[];
  success?: boolean;
}

// 快取設定
const CACHE_TTL = 30 * 1000; // 30 秒快取
const dataCache: Map<string, { data: unknown; timestamp: number }> = new Map();

// 快取包裝函數
async function withCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttl: number = CACHE_TTL
): Promise<T> {
  const now = Date.now();
  const cached = dataCache.get(key);

  if (cached && now - cached.timestamp < ttl) {
    return cached.data as T;
  }

  const data = await fetchFn();
  dataCache.set(key, { data, timestamp: now });
  return data;
}

// GAS API 請求工具
export async function gasQuery<T>(
  table: string,
  params: Record<string, string> = {},
  options: {
    useCache?: boolean;
    cacheTTL?: number;
    method?: 'GET' | 'POST';
    body?: string;
  } = {}
): Promise<ApiResponse<T>> {
  const url = new URL(GAS_API_URL || '');
  url.searchParams.append('apiKey', API_KEY || '');
  url.searchParams.append('table', table);

  // 添加其他查詢參數
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });

  const fetchData = async () => {
    const fetchOptions: RequestInit = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (options.method === 'POST' && options.body) {
      fetchOptions.body = options.body;
    }

    const response = await fetch(url.toString(), fetchOptions);
    return response.json();
  };

  if (options.useCache && options.method !== 'POST') {
    const cacheKey = url.toString();
    return withCache(cacheKey, fetchData, options.cacheTTL);
  }

  return fetchData();
}

// 輔助函數：根據 email 獲取用戶 ID（帶快取）
export async function getUserId(email: string): Promise<string> {
  const cacheKey = `user_id_${email}`;
  
  const fetchUserId = async () => {
    const response = await gasQuery<Author>('users', { email });
    if (!response.data?.[0]?.id) {
      throw new Error('User not found');
    }
    return response.data[0].id;
  };

  return withCache(cacheKey, fetchUserId, 5 * 60 * 1000); // 5 分鐘快取
}

// 輔助函數：檢查文章是否存在（帶快取）
export async function checkPostExists(postId: string): Promise<boolean> {
  const cacheKey = `post_exists_${postId}`;
  
  const checkPost = async () => {
    const response = await gasQuery<Post>('posts', { id: postId });
    return Boolean(response.data && response.data.length > 0);
  };

  return withCache(cacheKey, checkPost);
}

// 輔助函數：處理匿名內容的隱私
export function filterAnonymousContent<T extends Post | Comment>(
  items: T[],
  currentUserEmail: string
): T[] {
  return items
    .filter(item => {
      if (!item.is_anonymous) return true;
      return item.author?.email === currentUserEmail;
    })
    .map(item => {
      if (item.is_anonymous && item.author?.email !== currentUserEmail) {
        return {
          ...item,
          author: null
        };
      }
      return item;
    });
}