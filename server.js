const express = require("express");
const OpenAI = require("openai");

const app = express();
app.use(express.json());

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

app.get("/", (req, res) => {
    res.send("Smiley Horror AI działa!");
});

app.post("/chat", async (req, res) => {
    try {
        const message = String(req.body.message || "").slice(0, 500);
        const happiness = Number(req.body.happiness ?? 100);

        if (!message.trim()) {
            return res.status(400).json({
                error: "Brak wiadomości"
            });
        }

        const response = await client.responses.create({
            model: "gpt-5",
            instructions:
                "Jesteś Smileyem z horrorowej gry Roblox Smiley Horror. " +
                "Odpowiadasz po polsku, krótko i naturalnie. " +
                "Jesteś tajemniczy, czasami niepokojący, ale nie przesadzaj. " +
                "Poziom zadowolenia gracza wynosi obecnie " +
                happiness + " procent.",
            input: message
        });

        res.json({
            reply: response.output_text
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Błąd AI"
        });
    }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Smiley Horror AI działa na porcie ${PORT}`);
});
