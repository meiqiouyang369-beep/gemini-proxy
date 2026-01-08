const express = require("express");
const fetch = require("node-fetch");
const app = express();
const port = process.env.PORT || 8080;

app.use(express.json());

app.get("/", (req, res) => res.send("Gemini Proxy is Running!"));

app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;

    if (!API_KEY) return res.json({ result: "Error: Missing API Key in Zeabur" });
    if (!prompt) return res.json({ result: "Error: Prompt is empty" });

    // 核心修改：将模型改为最稳定的 'gemini-pro'
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          // 保持关闭安全审查，防止误判
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_NONE" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_NONE" }
          ]
        }),
      }
    );

    const data = await response.json();

    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (aiText) {
      res.json({ result: aiText });
    } else {
      console.error("Gemini Error:", JSON.stringify(data));
      // 如果出错，返回详细信息
      res.json({ result: "Gemini Error: " + (data.error?.message || JSON.stringify(data)) });
    }

  } catch (error) {
    console.error("Server Error:", error);
    res.json({ result: "Server Error: " + error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
