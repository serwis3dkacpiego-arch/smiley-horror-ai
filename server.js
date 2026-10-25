
const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json({ limit: "10kb" }));

const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

app.get("/", (req, res) => {
    res.send("Smiley Horror AI działa!");
});

app.post("/chat", async (req, res) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            return res.status(500).json({
                error: "Brak GROQ_API_KEY w Render"
            });
        }

        const message = String(req.body.message || "").slice(0, 500);
        const happiness = Math.max(
            0,
            Math.min(100, Number(req.body.happiness ?? 100))
        );

        if (!message.trim()) {
            return res.status(400).json({
                error: "Brak wiadomości"
            });
        }

        const response = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: [
                {
                    role: "system",
                    content:
                        "Jesteś Smileyem z horrorowej gry Roblox Smiley Horror. " +
                        "Odpowiadasz po polsku, krótko i naturalnie. " +
                        "Jesteś tajemniczy i czasami niepokojący. " +
                        "Poziom zadowolenia gracza wynosi " +
                        happiness + " procent."
                },
                {
                    role: "user",
                    content: message
                }
            ],
            max_completion_tokens: 180
        });

        const reply =
            response.choices?.[0]?.message?.content ||
            "Hehe... nie mam teraz nic do powiedzenia.";

        res.json({ reply });
    } catch (error) {
        console.error(
            "Groq API error:",
            error.status || "",
            error.message || "Nieznany błąd"
        );

        res.status(500).json({
            error: "Błąd AI",
            details: error.status || "unknown"
        });
    }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
    console.log("Smiley Horror AI działa na porcie " + PORT);
});
