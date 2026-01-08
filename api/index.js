const express = require("express");
const fetch = require("node-fetch");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// 根目录测试用，打开网址如果有字说明部署成功
app.get("/", (req, res) => res.send("Gemini Proxy on Zeabur is Running!"));

// 核心接口
app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    console.log("收到 Prompt:", prompt);

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) return res.status(500).send("Error: Missing API Key");

    // 调用 Gemini Flash (极速版)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            maxOutputTokens: 1000, // 放宽字数限制
          }
        }),
      }
    );

    const data = await response.json();
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Error: No content from Google";

    // 返回 JSON 包裹的结果
    res.json({ result: aiText });

  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error: " + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
