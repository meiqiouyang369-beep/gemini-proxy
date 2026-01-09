const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.get("/", (req, res) => res.send("Gemini Amazon Service Ready! 🚀"));

app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.send("Error: Missing API Key");

    const genAI = new GoogleGenerativeAI(API_KEY);
    // 使用免费版别名，确保稳定
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // ✅ 关键：直接发送纯文本，这样飞书里就不会有 {"result":...} 这种乱码了
    res.send(text);

  } catch (error) {
    console.error("Chat Error:", error);
    res.send("Error: " + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
