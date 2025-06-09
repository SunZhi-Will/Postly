import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const GOOGLE_SCRIPT_URL = process.env.GAS_URL;
const API_KEY = process.env.GAS_API_KEY;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      throw new Error('未提供有效的認證 Token');
    }

    const { id } = await params;
    
    const url = new URL(GOOGLE_SCRIPT_URL as string);
    url.searchParams.append('table', 'posts');
    url.searchParams.append('author_id', id);
    url.searchParams.append('include', 'author,comments');
    url.searchParams.append('apiKey', API_KEY as string);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API 請求失敗: ${response.status}`);
    }
    
    const posts = await response.json();

    // 確保返回的資料格式正確
    if (!Array.isArray(posts)) {
      throw new Error('無效的文章資料格式');
    }

    // 格式化文章資料
    const formattedPosts = posts.map(post => ({
      id: post.id,
      content: post.content,
      author_id: post.author_id,
      created_at: post.created_at,
      is_anonymous: post.is_anonymous,
      author: post.author ? {
        id: post.author.id,
        name: post.author.name,
        email: post.author.email,
        picture: post.author.picture
      } : null,
      comments: post.comments || []
    }));
    
    return NextResponse.json({
      success: true,
      data: formattedPosts
    });
  } catch (error) {
    console.error('獲取用戶文章錯誤:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '發生未知錯誤',
      },
      { status: 500 }
    );
  }
} 