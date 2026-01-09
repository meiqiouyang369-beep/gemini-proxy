const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.get("/", (req, res) => res.send("Gemini Official SDK Proxy is Running!"));

app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.json({ result: "Error: Missing API Key" });
    if (!prompt) return res.json({ result: "Error: Prompt is empty" });

    // 1. 初始化官方 SDK
    const genAI = new GoogleGenerativeAI(API_KEY);

    // 2. 获取模型 (使用目前兼容性最好的 gemini-pro)
    // 如果这个还不通，那就是账号完全没权限
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // 3. 设置安全选项 (全部放行)
    const generationConfig = {
        maxOutputTokens: 1000,
    };
    const safetySettings = [
        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
    ];

    // 4. 生成内容
    const result = await model.generateContent({
        contents: [{ role: "user", parts: [{ text: prompt }]}],
        generationConfig,
        safetySettings
    });
    
    const response = await result.response;
    const text = response.text();

    // 5. 返回结果
    res.json({ result: text });

  } catch (error) {
    console.error("SDK Error:", error);
    // 把详细的错误吐出来，如果是因为地区或权限，这里会写得很清楚
    res.json({ result: "SDK Error: " + error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
