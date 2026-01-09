const express = require("express");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.get("/", (req, res) => res.send("Gemini Flash Service is Ready! 🚀"));

app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.json({ result: "Error: Missing API Key" });

    const genAI = new GoogleGenerativeAI(API_KEY);

    // ✅ 改用这个模型，它是 Google 官方提供的“免费版”安全别名
    // 它在您的列表里明确存在 (gemini-flash-latest)
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    res.json({ result: text });

  } catch (error) {
    console.error("Chat Error:", error);
    // 如果碰巧这个也忙，我们把错误返回给飞书看
    res.json({ result: "Error: " + error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
