const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

// --- 🕵️‍♂️ 启动时自动诊断程序 ---
async function diagnose() {
  console.log("\n========== 🔍 开始 API 权限诊断 ==========");
  const key = process.env.GEMINI_API_KEY;
  
  if (!key) {
    console.log("❌ 致命错误：环境变量中没有找到 GEMINI_API_KEY！");
    return;
  }
  console.log(`🔑 当前使用的 Key (末4位): ...${key.slice(-4)}`);

  // 直接调用 REST API 查询可用模型列表 (不依赖 SDK，最底层测试)
  try {
    console.log("📡 正在连接 Google 服务器查询可用模型...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${key}`);
    const data = await response.json();

    if (data.error) {
      console.log("❌ Google 拒绝访问，原因如下：");
      console.log(JSON.stringify(data.error, null, 2));
      console.log("👉 如果显示 'User location is not supported' -> 必须换 Zeabur 地区。");
      console.log("👉 如果显示 'API key not valid' -> Key 填错了。");
    } else {
      console.log("✅ 连接成功！您的账号拥有以下模型权限：");
      // 打印出所有模型名字
      if (data.models) {
        data.models.forEach(m => console.log(`   - ${m.name}`));
      } else {
        console.log("⚠️ 奇怪，连接成功但列表为空？");
      }
    }
  } catch (err) {
    console.log("❌ 网络连接失败 (可能是地区问题):", err.message);
  }
  console.log("========== 诊断结束 ==========\n");
}

// 启动服务时立即运行诊断
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  diagnose(); // <--- 运行诊断
});

// 这是一个保底的接口，防止飞书完全报错
app.post("/api/chat", async (req, res) => {
    res.json({ result: "正在诊断中，请查看 Zeabur 日志获取模型列表..." });
});
