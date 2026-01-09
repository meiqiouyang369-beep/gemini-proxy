const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.get("/", (req, res) => res.send("Gemini 2.0 Service is Ready! 🚀"));

app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    // 1. 基础检查
    if (!API_KEY) return res.json({ result: "Error: Missing API Key" });
    if (!prompt) return res.json({ result: "Error: Prompt is empty" });

    // 2. 初始化 SDK
    const genAI = new GoogleGenerativeAI(API_KEY);

    // 3. 获取模型 
    // ✅ 使用您列表里确认存在的 gemini-2.0-flash
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 4. 生成内容
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. 返回结果
    res.json({ result: text });

  } catch (error) {
    console.error("Chat Error:", error);
    // 如果这个还报错，我们会尝试用 gemini-flash-latest 自动匹配
    res.json({ result: "Error: " + error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
