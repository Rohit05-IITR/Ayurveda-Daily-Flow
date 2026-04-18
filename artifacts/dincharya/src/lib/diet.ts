export interface DietPlan {
  icon: string;
  title: string;
  eat: string[];
  avoid: string[];
}

const DIET_DB: Record<string, DietPlan> = {
  "Vata-Pitta": {
    icon: "🍲",
    title: "Warm & Mildly Spiced",
    eat: [
      "Warm, cooked grains — rice, oats, wheat",
      "Nourishing dairy — warm milk, ghee, soft cheese",
      "Sweet fruits — mango, pear, coconut, dates",
      "Root vegetables — sweet potato, carrot, beet",
      "Mild spices — cumin, coriander, fennel, cardamom",
    ],
    avoid: [
      "Cold, raw, or iced foods and beverages",
      "Very spicy or pungent foods — chilli, mustard",
      "Dry, light snacks — crackers, chips, popcorn",
      "Excessive caffeine, alcohol, or fermented foods",
    ],
  },
  "Pitta-Kapha": {
    icon: "🥗",
    title: "Cooling & Light",
    eat: [
      "Fresh, leafy vegetables — spinach, kale, cucumber",
      "Cooling fruits — pomegranate, melon, coconut water",
      "Light grains — barley, millet, quinoa",
      "Bitter & astringent foods — broccoli, sprouts, turmeric",
      "Light legumes — moong dal, chickpeas",
    ],
    avoid: [
      "Oily, fried, or greasy foods",
      "Spicy, pungent, or very salty foods",
      "Heavy sweets — ice cream, cheese, pastries",
      "Red meat and excessive dairy",
    ],
  },
  "Vata-Kapha": {
    icon: "🍵",
    title: "Warm & Light",
    eat: [
      "Warm, light soups and stews — lentil, vegetable",
      "Herbal teas — ginger, tulsi, cinnamon",
      "Light grains — quinoa, rice, millet",
      "Cooked leafy greens with warming spices",
      "Light proteins — moong dal, tofu, eggs",
    ],
    avoid: [
      "Cold, raw, or heavy foods",
      "Dairy in excess — especially cold milk, cheese",
      "Fried, oily, or processed foods",
      "Refined sugar and heavy desserts",
    ],
  },
};

function normalizeType(raw: string): string {
  const map: Record<string, string> = {
    "Pitta-Vata": "Vata-Pitta",
    "Kapha-Pitta": "Pitta-Kapha",
    "Kapha-Vata": "Vata-Kapha",
  };
  return map[raw] || raw;
}

const SINGLE_DOSHA_FALLBACK: Record<string, DietPlan> = {
  Vata:  { icon: "🍲", title: "Warm & Grounding", eat: ["Warm, cooked meals — soups, stews, and rice","Root vegetables: sweet potato, carrot","Healthy fats: ghee, sesame oil, avocado","Warm herbal teas — ginger, ashwagandha, tulsi"], avoid: ["Cold, raw, or dry foods","Carbonated drinks and caffeine"] },
  Pitta: { icon: "🥗", title: "Cooling & Nourishing", eat: ["Fresh, cooling fruits — melons, pomegranate","Leafy greens, cucumber, and zucchini","Dairy: milk, ghee, and unsalted butter","Cooling spices — coriander, fennel, cardamom"], avoid: ["Spicy, sour, salty, or fermented foods","Alcohol and caffeine"] },
  Kapha: { icon: "🥦", title: "Light & Stimulating", eat: ["Light grains — millet, barley, quinoa","Pungent vegetables: radish, onion, ginger","Warming spices — black pepper, turmeric","Light proteins — legumes, chickpeas, lentils"], avoid: ["Heavy, oily, sweet, or cold foods","Excess dairy and refined sugar"] },
};

export function getDietPlan(prakritiType: string): DietPlan {
  const normalized = normalizeType(prakritiType);
  if (DIET_DB[normalized]) return DIET_DB[normalized];
  // single dosha fallback
  const primary = prakritiType.split("-")[0];
  return SINGLE_DOSHA_FALLBACK[primary] || SINGLE_DOSHA_FALLBACK["Vata"];
}
