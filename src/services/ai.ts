import { GoogleGenAI } from '@google/genai';

export async function generateDailyTopic(previousArticles: string[]) {
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
          text: `Based on the themes, tone, and perspectives of my most recent five articles, please deeply analyze and reflect to suggest a compelling topic for today's article. The topic should either expand upon or complement my previous content, while offering a fresh perspective or emotional resonance.
Then, please write a short introduction or opening paragraph (around 100–150 words) to help me quickly get into the writing flow.

Here are summaries of my last five articles:
${previousArticles.join('\n')}`,
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
    return result;
  } catch (error) {
    console.error('生成主題時發生錯誤:', error);
    return null;
  }
} 