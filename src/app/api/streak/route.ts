import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const API_KEY = process.env.GAS_API_KEY
const GAS_URL = process.env.GAS_URL

interface Post {
  id: string;
  created_at: string;
  content: string;
  author_id: string;
}

async function getUserId(email: string): Promise<string> {
  const url = new URL(GAS_URL!);
  url.searchParams.set('apiKey', API_KEY!);
  url.searchParams.set('table', 'users');
  url.searchParams.set('email', email);

  const response = await fetch(url.toString());
  const data = await response.json();

  if (!data || !data[0]?.id) {
    throw new Error('User not found');
  }

  return data[0].id;
}

function calculateStreak(posts: Post[]): number {
  if (!posts || posts.length === 0) return 0;

  // 按照日期排序（從新到舊）
  const sortedPosts = [...posts].sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  let streak = 1;  // 從第一篇文章開始計算
  let currentDate = new Date(sortedPosts[0].created_at);
  currentDate.setHours(0, 0, 0, 0);

  // 從第二篇文章開始檢查
  for (let i = 1; i < sortedPosts.length; i++) {
    const postDate = new Date(sortedPosts[i].created_at);
    postDate.setHours(0, 0, 0, 0);

    // 計算與前一天的差距
    const diffDays = Math.floor((currentDate.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24));

    // 如果是連續的前一天，增加連續天數
    if (diffDays === 1) {
      streak++;
      currentDate = postDate;
    } else if (diffDays === 0) {
      // 同一天的文章，繼續檢查
      continue;
    } else {
      // 不是連續的，中斷計算
      break;
    }
  }

  return streak;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // 檢查用戶是否已登入
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: '請先登入' }), {
        status: 401,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    const searchParams = request.nextUrl.searchParams
    const requestedEmail = searchParams.get('user_email')

    // 檢查請求的 email 是否與當前登入用戶相符
    if (requestedEmail !== session.user.email) {
      return new Response(JSON.stringify({ error: '無權限查看其他用戶的資料' }), {
        status: 403,
        headers: {
          'Content-Type': 'application/json',
        },
      })
    }

    const userId = await getUserId(session.user.email);
    const response = await fetch(
      `${GAS_URL}?apiKey=${API_KEY}&user_id=${userId}&table=posts`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )

    const posts = await response.json()

    if (posts.error) {
      throw new Error(posts.error)
    }

    // 計算連續天數
    const streak = calculateStreak(posts);

    return new Response(JSON.stringify({ streak }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    })
  } catch (error) {
    console.error('獲取連續發文數據失敗:', error)
    return new Response(
      JSON.stringify({ error: '獲取連續發文數據失敗' }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    )
  }
} 