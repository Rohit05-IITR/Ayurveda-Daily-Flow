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
    const { prakritiType, goal, bmi, dailyCalories, consumedCalories, todayDate } = req.body as {
      prakritiType: string;
      goal: string;
      bmi: string;
      dailyCalories: number;
      consumedCalories: number;
      todayDate: string;
    };

    const systemInstruction = `You are an elite Ayurvedic nutritionist and wellness coach with 30 years of clinical experience.

Generate a STRICTLY personalized daily Ayurvedic wellness plan. Return ONLY valid JSON — no markdown, no prose, no explanation whatsoever.

═══ CONTENT RULES ═══
- ALL text must be concise — never write paragraphs or long sentences
- Meal titles: 2–4 words (e.g., "Warm Oatmeal", "Kitchari Bowl", "Mung Soup")
- Meal descriptions: 3–6 words (e.g., "with dates and ghee", "seasonal vegetables, cumin")
- Avoid items: 2–4 words each (e.g., "Iced beverages", "Raw salads")
- Lifestyle items: 4–8 words each (e.g., "Walk 15 mins after lunch")
- Focus: exactly one calming, specific insight 8–12 words

═══ PRAKRITI FOOD LOGIC ═══
- Vata: warm, oily, grounding; root vegetables, ghee, cooked grains; avoid cold/raw/dry foods
- Pitta: cooling, sweet, astringent; cucumber, coconut, coriander; avoid spicy/fried/sour
- Kapha: light, pungent, dry; millet, lentils, ginger; avoid heavy dairy/sweets/wheat
- Dual doshas (e.g., Vata-Pitta): intelligently balance both requirements

═══ GOAL FOOD LOGIC ═══
- Muscle Gain: high protein focus — paneer, lentils, eggs, chicken, tofu, milk, nuts; calorie surplus
- Weight Loss: high fibre, low calorie density — soups, mung dal, vegetables, salads; avoid dense carbs
- Weight Gain: calorie-dense wholesome foods — ghee, nuts, full-fat dairy, rice, sweet potato
- Maintain: balanced macros across all meals

═══ DAILY ROTATION ═══
Use the date seed to ensure DIFFERENT meals every day. Never repeat the same combination on consecutive days. Rotate grains, proteins, and vegetables.

═══ JSON SCHEMA (respond with ONLY this) ═══
{
  "title": "5–7 word inspiring plan theme",
  "prakriti": "<prakriti type>",
  "focus": "One specific 8–12 word daily wellness insight",
  "breakfast": [{"title": "2–4 words", "desc": "3–6 words", "kcal": <number>, "protein": <number>}],
  "lunch":     [{"title": "2–4 words", "desc": "3–6 words", "kcal": <number>, "protein": <number>}],
  "dinner":    [{"title": "2–4 words", "desc": "3–6 words", "kcal": <number>, "protein": <number>}],
  "snacks":    [{"title": "2–4 words", "desc": "3–6 words", "kcal": <number>, "protein": <number>}],
  "avoid":     ["4–5 items, 2–4 words each"],
  "lifestyle": ["3 habits, 4–8 words each"]
}

Include exactly 1 item per meal section (breakfast, lunch, dinner, snacks).`;

    const userPrompt = `Prakriti: ${prakritiType}
Goal: ${goal}
BMI: ${bmi}
Daily Calorie Target: ${dailyCalories} kcal
Consumed Today: ${consumedCalories} kcal
Date Seed (for daily variety): ${todayDate}`;

    const apiKey = process.env.GOOGLE_API_KEY || "";
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemInstruction }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: { temperature: 0.85, maxOutputTokens: 1024 },
        }),
      },
    );

    if (!response.ok) {
      const errBody = await response.json();
      res.status(502).json({ error: "Gemini API error", details: errBody });
      return;
    }

    const data = await response.json() as {
      candidates: { content: { parts: { text: string; thought?: boolean }[] } }[];
    };

    const parts = data.candidates[0].content.parts as { text?: string; thought?: boolean }[];
    const responsePart = [...parts].reverse().find(p => !p.thought && p.text);
    if (!responsePart?.text) {
      res.status(502).json({ error: "No text found in Gemini response" });
      return;
    }

    let text = responsePart.text;
    text = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      res.status(502).json({ error: "No JSON found in Gemini response", raw: text.slice(0, 300) });
      return;
    }

    const plan = JSON.parse(match[0]);
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate diet plan", details: String(err) });
  }
});

export default aiRouter;
