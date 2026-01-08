export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // 不管飞书发什么，直接秒回这句话
  return new Response("测试成功！通道是畅通的！", {
    status: 200,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' }
  });
}
