const express = require("express");
const fetch = require("node-fetch");
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => res.send("Gemini Proxy is Running!"));

app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) return res.status(500).send("Error: Missing API Key");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { maxOutputTokens: 1000 }
        }),
      }
    );
    const data = await response.json();
    const aiText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Error: No content";
    res.json({ result: aiText });
  } catch (error) {
    res.status(500).send("Server Error: " + error.message);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
