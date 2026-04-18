import { Router } from "express";

const aiRouter = Router();

/* ── CalorieNinjas Nutrition Proxy ── */
aiRouter.get("/nutrition", async (req, res) => {
  try {
    const food = req.query.food as string;
    if (!food) {
      res.status(400).json({ error: "Food query is required" });
      return;
    }

    const apiKey = process.env.CALORIE_NINJA_API_KEY || "";
    const response = await fetch(
      `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(food)}`,
      { headers: { "X-Api-Key": apiKey } },
    );

    if (!response.ok) {
      res.status(502).json({ error: "CalorieNinjas API error", status: response.status });
      return;
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch nutrition data", details: String(err) });
  }
});

/* ── Gemini AI Diet Plan ── */
aiRouter.post("/diet-plan", async (req, res) => {
  try {
    const { prakritiType, goal, bmi, dailyCalories, consumedCalories } = req.body as {
      prakritiType: string;
      goal: string;
      bmi: string;
      dailyCalories: number;
      consumedCalories: number;
    };

    const systemInstruction = `You are a professional Ayurvedic health coach.

Generate a personalized daily wellness plan based on the user's Prakriti (dual dosha), health goal, BMI, and today's nutrition.

Respond ONLY with a valid JSON object — no markdown, no explanation:

{
  "title": "A short inspiring theme (5–8 words)",
  "prakriti": "The prakriti type provided",
  "eat": ["5 specific foods or meals to eat today"],
  "avoid": ["4 foods or habits to avoid today"],
  "lifestyle": ["3 Ayurvedic lifestyle habits for today"],
  "calorieAdvice": "One sentence of practical calorie guidance"
}`;

    const userPrompt = `Prakriti: ${prakritiType}
Goal: ${goal}
BMI: ${bmi}
Calories Target: ${dailyCalories}
Consumed Calories: ${consumedCalories}`;

    const apiKey = process.env.GEMINI_API_KEY || "";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 600 },
        }),
      },
    );

    if (!response.ok) {
      const errBody = await response.json();
      res.status(502).json({ error: "Gemini API error", details: errBody });
      return;
    }

    const data = await response.json() as {
      candidates: { content: { parts: { text: string }[] } }[];
    };

    let text = data.candidates[0].content.parts[0].text;
    text = text.replace(/```json|```/g, "").trim();

    const plan = JSON.parse(text);
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate diet plan", details: String(err) });
  }
});

export default aiRouter;
