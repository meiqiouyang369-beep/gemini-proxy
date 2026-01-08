// 版本号: V2.0 (强制刷新版)
export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  try {
    const { prompt } = await req.json();
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return new Response('Error: Missing API Key', { status: 500 });

    // 核心修改：使用 Flash 模型 + 强制限制 800 字
    const googleRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
             maxOutputTokens: 800,  // 强制限制输出长度，保证 5 秒内说完
             temperature: 0.7
          }
        })
      }
    );

    const googleData = await googleRes.json();
    const aiText = googleData?.candidates?.[0]?.content?.parts?.[0]?.text || "Error: No content";

    return new Response(aiText, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });

  } catch (e) {
    return new Response("Server Error: " + e.message, { status: 500 });
  }
}
