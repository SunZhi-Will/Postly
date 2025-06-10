import { NextRequest, NextResponse } from 'next/server'

const API_KEY = process.env.GAS_API_KEY
const GAS_URL = process.env.GAS_URL

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // 呼叫 GAS API 更新觀看次數
    const url = new URL(GAS_URL!)
    url.searchParams.append('apiKey', API_KEY!)
    url.searchParams.append('table', 'posts')

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id,
        views: 1,
        action: 'updateViews'
      })
    })
    
    if (!response.ok) {
      throw new Error('更新觀看次數失敗')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('處理更新觀看次數請求時發生錯誤:', error)
    return NextResponse.json(
      { success: false, error: '更新觀看次數失敗' },
      { status: 500 }
    )
  }
} 