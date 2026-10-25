
const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json({ limit: "10kb" }));

// GROQ AI — zamiast płatnego OpenAI API
const client = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1"
});

app.get("/", (req, res) => {
    res.send("Smiley Horror AI działa!");
});

app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        provider: "Groq",
        keyConfigured: Boolean(process.env.GROQ_API_KEY)
    });
});

app.post("/chat", async (req, res) => {
    try {
        if (!process.env.GROQ_API_KEY) {
            console.error("Brak zmiennej GROQ_API_KEY!");

            return res.status(500).json({
                error: "Brak GROQ_API_KEY w Render"
            });
        }

        const message = String(req.body?.message || "").slice(0, 500);
        const rawHappiness = Number(req.body?.happiness ?? 100);
        const happiness = Number.isFinite(rawHappiness)
            ? Math.max(0, Math.min(100, rawHappiness))
            : 100;

        if (!message.trim()) {
            return res.status(400).json({
                error: "Brak wiadomości"
            });
        }

        const response = await client.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                {
                    role: "system",
                    content:
                        "Jesteś Smileyem z horrorowej gry Roblox Smiley Horror. " +
                        "Odpowiadasz po polsku, krótko i naturalnie. " +
                        "Jesteś tajemniczy, niepokojący i czasem groźny, " +
                        "ale nie przesadzaj. Zachowuj charakter postaci. " +
                        "Poziom zadowolenia gracza wynosi " +
                        happiness + " procent. " +
                        "Jeśli zadowolenie jest niskie, zachowuj się bardziej wrogo."
                },
                {
                    role: "user",
                    content: message
                }
            ],
            max_completion_tokens: 180
        });

        const reply =
            response.choices?.[0]?.message?.content?.trim() ||
            "Hehe... Smiley nie ma teraz nic do powiedzenia.";

        console.log("Groq AI: odpowiedź wygenerowana.");

        return res.json({ reply });

    } catch (error) {
        console.error("Groq API error:", {
            status: error.status || "unknown",
            message: error.message || "Nieznany błąd"
        });

        return res.status(500).json({
            error: "Błąd AI",
            details: error.status || "unknown"
        });
    }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
    console.log("Smiley Horror AI działa na porcie " + PORT);
    console.log(
        "Groq API key configured:",
        Boolean(process.env.GROQ_API_KEY)
    );
});
