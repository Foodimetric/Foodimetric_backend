// seed/prompts.js
const Prompt = require("./src/models/Prompt");

const questionsByCategory = {
    0: [
        "What should I eat to gain or lose weight in a healthy way?",
        "Can you tell me the nutrient content or calories of local Nigerian foods (e.g., akara, eba, jollof rice)?",
        "How many calories should I eat daily based on my body measurements?",
        "What foods or nutrients help with low energy or weak immunity?",
        "Can you give me cooking instructions for traditional meals (e.g., egusi soup, yam porridge, fried rice)?",
        "How can I eat healthy on a student budget or with limited food access?",
        "What does my BMI mean, and what can I do if it's too high or low?",
        "Can you create a simple 3-day meal plan?",
    ],
    1: [
        "Can you break down the nutrient profile of a Nigerian food (e.g., efo riro, moi moi)?",
        "What are the advantages and disadvantages of various dietary patterns?",
        "Discuss the importance of nutrient metabolism in human health.",
        "How can I evaluate dietary diversity for a population group?",
        "Generate a 3-day therapeutic diet plan with kcal breakdown.",
        "Explain how to assess malnutrition using anthropometric indices.",
        "Can you generate nutrition-based survey questions for research?",
        "What are key indicators in clinical nutrition assessments?",
    ],
    2: [
        "Plan a 7-day Nigerian meal plan for a diabetic patient with hypertension.",
        "Create a TDEE-based diet plan for a PCOS client using local foods.",
        "How do I track nutrient intake across meals?",
        "Can you assist in building a customized meal plan based on symptoms?",
        "Suggest nutrient-rich, affordable recipes for client counseling.",
        "Break down macronutrient needs for a weight loss program.",
        "What is a therapeutic diet for a patient with chronic ulcer?",
        "Can you list high-protein, low-fat Nigerian food options?",
    ],
    3: [
        "Explain the steps of nutritional assessment.",
        "What’s the difference between IBW and BMI?",
        "Help me understand dietary planning concepts step by step.",
        "What is medical nutrition therapy and when is it used?",
        "Give me sample practice questions in nutrition and dietetics.",
        "Explain the nutritional management of common diseases like ulcer or diabetes.",
        "Break down a case study involving malnutrition.",
        "What topics should I master before graduation?",
    ],
};

async function seedPrompts() {
    try {
        // clear existing prompts
        await Prompt.deleteMany({});

        // insert new prompts
        const inserts = Object.keys(questionsByCategory).map((key) => ({
            category: Number(key),
            prompts: questionsByCategory[key],
        }));

        await Prompt.insertMany(inserts);

        console.log("✅ Prompt templates seeded successfully!");
    } catch (error) {
        console.error("❌ Error seeding prompts:", error);
    }
}

module.exports = { seedPrompts }
