import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { ApiClient } from '@/lib/api-client'

const apiClient = ApiClient.getInstance()

async function getUserId(email: string): Promise<string> {
  const data = await apiClient.request<Array<{ id: string }>>({
    table: 'users',
    params: { email }
  })

  if (!data?.[0]?.id) {
    throw new Error('User not found')
  }

  return data[0].id
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ success: false, error: '請先登入' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const searchParams = request.nextUrl.searchParams
    const requestedEmail = searchParams.get('user_email')
    const mine = searchParams.get('mine') === 'true'
    const include = searchParams.get('include')?.split(',') || []
    const postId = searchParams.get('id')

    if (mine && requestedEmail !== session.user.email) {
      return new Response(JSON.stringify({ success: false, error: '無權限查看其他用戶的資料' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const userId = await getUserId(session.user.email)
    const params: Record<string, string> = {}
    
    if (include.length > 0) {
      params.include = include.join(',')
    }
    
    if (mine) {
      params.author_id = userId
    }

    // 如果有指定文章 ID，則只查詢該文章
    if (postId) {
      params.id = postId
    }

    const data = await apiClient.request<Array<{
      id: string;
      content: string;
      author_id: string;
      created_at: string;
      is_anonymous: boolean;
    }>>({
      table: 'posts',
      userId,
      params
    })

    // 如果是查詢單一文章，則只返回第一筆資料
    const responseData = postId ? data[0] : data

    if (postId && !responseData) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: '找不到此文章',
        data: null 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ 
      success: true, 
      data: responseData 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('獲取文章數據失敗:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: '獲取文章數據失敗',
      data: null
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new Response(JSON.stringify({ error: '請先登入' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const body = await request.json()
    const { content, is_anonymous = false } = body

    if (!content) {
      return new Response(JSON.stringify({ error: '缺少必要參數' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const userId = await getUserId(session.user.email)
    const postData = {
      id: crypto.randomUUID(),
      content,
      author_id: userId,
      created_at: new Date().toISOString(),
      is_anonymous
    }

    await apiClient.request({
      table: 'posts',
      method: 'POST',
      body: postData
    })

    return new Response(JSON.stringify({ success: true, data: postData }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('處理文章請求時發生錯誤:', error)
    return new Response(JSON.stringify({ error: '處理請求失敗' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
} 