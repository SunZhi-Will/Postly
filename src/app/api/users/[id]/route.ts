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
    url.searchParams.append('table', 'users');
    url.searchParams.append('id', id);
    url.searchParams.append('apiKey', API_KEY as string);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`API 請求失敗: ${response.status}`);
    }
    
    const users = await response.json();
    
    if (!Array.isArray(users) || users.length === 0) {
      throw new Error('找不到此用戶');
    }

    const user = users[0];
    
    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        picture: user.picture
      }
    });
  } catch (error) {
    console.error('獲取用戶資訊錯誤:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '發生未知錯誤',
      },
      { status: 500 }
    );
  }
} 