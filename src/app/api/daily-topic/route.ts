import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { api } from '@/services/api';

// 用於緩存的變量
let cachedTopic: string | null = null;
let lastGeneratedDate: string | null = null;

// 獲取今天的日期（格式：YYYY-MM-DD）
function getTodayDate() {
  return new Date().toISOString().split('T')[0];
}

// 生成新主題
async function generateNewTopic() {
  if (!process.env.GEMINI_API_KEY) {
    return '分享一個最近改變了你生活的小習慣';
  }

  // 獲取最近的5篇文章
  const recentPosts = await api.getRecentPosts();

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const config = {
    responseMimeType: 'text/plain',
  };

  const model = 'gemini-2.0-flash';
  const contents = [
    {
      role: 'user',
      parts: [
        {
          text: `Based on these recent posts, suggest a new daily topic that is related but fresh. The topic should be 15-30 characters long, and returned as a single line without any additional text or formatting.

Recent posts:
${recentPosts.map((post: string, index: number) => `${index + 1}. ${post}`).join('\n')}`,
        },
      ],
    },
  ];

  try {
    const response = await ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    let result = '';
    for await (const chunk of response) {
      result += chunk.text;
    }
    console.log('result', result);
    console.log('recentPosts', recentPosts);
    
    // 確保只返回一行，移除任何額外的文字
    const singleLine = result.split('\n')[0].trim();
    return singleLine || '分享一個最近改變了你生活的小習慣';
  } catch (error) {
    console.error('生成主題時發生錯誤:', error);
    return '分享一個最近改變了你生活的小習慣';
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const refresh = searchParams.get('refresh') === 'true';
  const today = getTodayDate();

  // 如果請求要求刷新，或今天還沒有生成主題，或者緩存的主題是之前日期的
  if (refresh || !cachedTopic || lastGeneratedDate !== today) {
    cachedTopic = await generateNewTopic();
    lastGeneratedDate = today;
  }

  return NextResponse.json({
    topic: cachedTopic,
    date: today,
  });
} 