import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const GAS_URL = process.env.GAS_URL
const API_KEY = process.env.GAS_API_KEY

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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')
    const postId = searchParams.get('post_id')
    const mine = searchParams.get('mine')
    const id = searchParams.get('id')
    const include = searchParams.get('include')

    if (!table) {
      return NextResponse.json({ error: 'Missing table parameter' }, { status: 400 })
    }

    // 如果不是取得公開文章，則需要身份驗證
    if (table !== 'posts' || mine === 'true' || id) {
      if (!session?.user?.email) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    const url = new URL(GAS_URL!)
    url.searchParams.set('apiKey', API_KEY!)
    url.searchParams.set('table', table)

    // 只有在有登入的情況下才傳送用戶信息
    if (session?.user?.email) {
      const userId = await getUserId(session.user.email);
      url.searchParams.set('user_id', userId)
    }

    if (postId) url.searchParams.set('post_id', postId)
    if (mine) url.searchParams.set('mine', mine)
    if (id) url.searchParams.set('id', id)
    if (include) url.searchParams.set('include', include)

    const response = await fetch(url.toString())
    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('API 代理錯誤:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '發生未知錯誤' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { table } = body

    if (!table) {
      return NextResponse.json({ error: 'Missing table parameter' }, { status: 400 })
    }

    const url = new URL(GAS_URL!)
    url.searchParams.set('apiKey', API_KEY!)
    url.searchParams.set('table', table)

    const userId = await getUserId(session.user.email);
    const requestBody = {
      ...body,
      user_id: userId,
      author: session.user.name || '未命名用戶',
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    })

    const data = await response.json()

    if (data.error) {
      return NextResponse.json({ error: data.error }, { status: 400 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('API 代理錯誤:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '發生未知錯誤' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')
    const id = searchParams.get('id')

    if (!table || !id) {
      return NextResponse.json(
        { error: 'Missing table or id parameter' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const userId = await getUserId(session.user.email);

    const url = new URL(GAS_URL!)
    url.searchParams.set('apiKey', API_KEY!)
    url.searchParams.set('table', table)
    url.searchParams.set('id', id)

    const response = await fetch(url.toString(), {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...body,
        user_id: userId,
      }),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('API 代理錯誤:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '發生未知錯誤' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const table = searchParams.get('table')
    const id = searchParams.get('id')

    if (!table || !id) {
      return NextResponse.json(
        { error: 'Missing table or id parameter' },
        { status: 400 }
      )
    }

    const userId = await getUserId(session.user.email);
    const url = new URL(GAS_URL!)
    url.searchParams.set('apiKey', API_KEY!)
    url.searchParams.set('table', table)
    url.searchParams.set('id', id)

    const response = await fetch(url.toString(), {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        user_id: userId,
      }),
    })

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('API 代理錯誤:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '發生未知錯誤' },
      { status: 500 }
    )
  }
} 