import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { filterAnonymousContent } from '@/lib/api-utils';
import { ApiClient } from '@/lib/api-client';

const apiClient = ApiClient.getInstance();

interface Comment {
  id: string;
  content: string;
  post_id: string;
  author_id: string;
  created_at: string;
  is_anonymous: boolean;
  author?: {
    id: string;
    name: string;
    email: string;
    picture?: string;
  };
}

async function getUserId(email: string): Promise<string> {
  const data = await apiClient.request<Array<{ id: string }>>({
    table: 'users',
    params: { email }
  });

  if (!data?.[0]?.id) {
    throw new Error('User not found');
  }

  return data[0].id;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '請先登入' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const isMine = searchParams.get('mine') === 'true';
    const postId = searchParams.get('post_id');
    const include = searchParams.get('include')?.split(',') || [];

    const params: Record<string, string> = {};
    
    if (include.length > 0) {
      params.include = include.join(',');
    }

    if (postId) {
      params.post_id = postId;
    }

    const userId = await getUserId(session.user.email);
    
    if (isMine) {
      params.author_id = userId;
    }

    const data = await apiClient.request<Comment[]>({
      table: 'comments',
      userId,
      params
    });

    const commentsData = filterAnonymousContent(data, session.user.email);
    return NextResponse.json(commentsData);
  } catch (error) {
    console.error('處理評論請求時發生錯誤:', error);
    return NextResponse.json(
      { error: '處理請求失敗' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '請先登入' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, post_id, is_anonymous = false } = body;

    if (!content || !post_id) {
      return NextResponse.json(
        { error: '缺少必要參數' },
        { status: 400 }
      );
    }

    const userId = await getUserId(session.user.email);
    const commentData: Comment = {
      id: crypto.randomUUID(),
      content,
      post_id,
      author_id: userId,
      created_at: new Date().toISOString(),
      is_anonymous
    };

    await apiClient.request<void, Comment>({
      table: 'comments',
      method: 'POST',
      body: commentData
    });

    return NextResponse.json({ success: true, data: commentData });
  } catch (error) {
    console.error('處理評論請求時發生錯誤:', error);
    return NextResponse.json(
      { error: '處理請求失敗' },
      { status: 500 }
    );
  }
} 