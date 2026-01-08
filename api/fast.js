export const config = {
  runtime: 'edge', // 启用边缘计算，速度更快
};

export default async function handler(req) {
  // 1. 基础检查
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { prompt } = await req.json();
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return new Response('Error: Missing API Key', { status: 500 });

    // 2. 核心加速配置：使用 Flash + 限制字数
    const googleRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
             maxOutputTokens: 600,  // 【关键】强制限制输出长度，防止超时
             temperature: 0.7
          }
        })
      }
    );

    // 3. 错误处理
    if (googleRes.status !== 200) {
        return new Response(`Google API Error: ${googleRes.status}`, { status: 500 });
    }

    const googleData = await googleRes.json();
    const aiText = googleData?.candidates?.[0]?.content?.parts?.[0]?.text || "Error: No content";

    // 4. 直接返回纯文本
    return new Response(aiText, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });

  } catch (e) {
    return new Response("Server Error: " + e.message, { status: 500 });
  }
}
