import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';

const GOOGLE_SCRIPT_URL = process.env.GAS_URL;

// 定義使用者資料介面
interface UserData {
  name?: string;
  email?: string;
  picture?: string;
  id?: string;
  created_at?: string;
}

// 驗證 JWT Token 並取得使用者資訊的輔助函數
async function getAuthToken() {
  const headersList = await headers();
  const authorization = headersList.get('Authorization');
  
  // if (!authorization || !authorization.startsWith('Bearer ')) {
  //   throw new Error('未提供有效的認證 Token');
  // }
  
  return authorization?.split(' ')[1];
}

// 處理 API 請求的輔助函數
async function handleUserRequest(
  method: string,
  token: string,
  body?: UserData
) {
  try {
    const url = new URL(GOOGLE_SCRIPT_URL || '');
    url.searchParams.append('table', 'users');
    url.searchParams.append('action', method.toLowerCase());

    const requestOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    };

    if (body) {
      requestOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url.toString(), requestOptions);
    
    if (!response.ok) {
      throw new Error(`API 請求失敗: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error(data.error || '操作失敗');
    }
    
    return data;
  } catch (error) {
    console.error(`API 請求錯誤 (${method}):`, error);
    throw error;
  }
}

// GET: 取得使用者資料
export async function GET() {
  try {
    const token = await getAuthToken();
    const data = await handleUserRequest('GET', token || '');
    return NextResponse.json(data);
  } catch (error) {
    console.error('取得使用者資料錯誤:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '發生未知錯誤',
      },
      { status: 401 }
    );
  }
}

// POST: 建立新使用者
export async function POST(request: NextRequest) {
  try {
    const token = await getAuthToken();
    const body = await request.json();
    
    // 檢查必要欄位
    if (!body.email) {
      throw new Error('缺少必要欄位: email');
    }
    
    const data = await handleUserRequest('POST', token || '', {
      id: body.id,
      name: body.name,
      email: body.email,
      picture: body.picture,
      created_at: new Date().toISOString(),
    });
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('建立使用者錯誤:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '發生未知錯誤',
      },
      { status: 401 }
    );
  }
}

// PUT: 更新使用者資料
export async function PUT(request: NextRequest) {
  try {
    const token = await getAuthToken();
    const body = await request.json();
    
    if (!body.email) {
      throw new Error('缺少必要欄位: email');
    }
    
    const data = await handleUserRequest('PUT', token || '', body);
    return NextResponse.json(data);
  } catch (error) {
    console.error('更新使用者資料錯誤:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '發生未知錯誤',
      },
      { status: 401 }
    );
  }
}

// DELETE: 刪除使用者
export async function DELETE() {
  try {
    const token = await getAuthToken();
    const data = await handleUserRequest('DELETE', token || '');
    return NextResponse.json(data);
  } catch (error) {
    console.error('刪除使用者錯誤:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : '發生未知錯誤',
      },
      { status: 401 }
    );
  }
} 