const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.get("/", (req, res) => res.send("Gemini Official Proxy is Running!"));

app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.json({ result: "Error: Missing API Key" });
    if (!prompt) return res.json({ result: "Error: Prompt is empty" });

    // 1. 初始化最新的官方 SDK
    const genAI = new GoogleGenerativeAI(API_KEY);

    // 2. 获取模型 (使用最新版 SDK 支持的 1.5 Flash)
    const model = genAI.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        // 强制指定 API 版本为 v1beta，解决兼容性问题
        apiVersion: "v1beta"
    });

    // 3. 设置生成配置
    const generationConfig = {
        maxOutputTokens: 1000,
        temperature: 0.9,
    };
    
    // 4. 关闭安全审查
    const safetySettings = [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
    ];

    // 5. 生成内容
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }]}],
        generationConfig,
        safetySettings
    });
    
    const response = await result.response;
    const text = response.text();

    res.json({ result: text });

  } catch (error) {
    console.error("SDK Error:", error);
    // 如果依然报错，这里会显示更详细的原因
    res.json({ result: "SDK Error: " + error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
