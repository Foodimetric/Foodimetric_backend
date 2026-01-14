const Resource = require("./src/models/resource.models.js");

const allResources = [
//     {
//         id: "inherited-eating-habits",
//         image:
//             "https://res.cloudinary.com/dqf23mtna/image/upload/v1764973102/Breaking_Inherited_Eating_Habits_How_to_Rebuild_a_Healthy_Nutrition_Pattern_for_Modern_Living_l5ze7m.webp",
//         category: "ARTICLES",
//         date: "02/12/2025",
//         title:
//             "Breaking Inherited Eating Habits: How to Rebuild a Healthy Nutrition Pattern for Modern Living",
//         description:
//             "Learn how to break inherited eating habits and rebuild healthier nutrition patterns. Explore practical steps, food-pairing tips, and tools like Foodimetric to transform your wellbeing.",
//         author: "Victoria Okeozor",
//         likes: 0,
//         summary:
//             "Many of us inherited eating habits we never chose—heavy meals, low vegetables, late dinners, and food rules passed down through generations. This article reveals how to break those patterns and build healthier, balanced nutrition suited to modern lifestyles. Discover practical steps, smarter food pairing, and tools like Foodimetric to create a better nutrition inheritance.",
//         content: `The Hidden Inheritance Nobody Talks About: Your Eating Habits

// We all grew up on food patterns we never chose.
// Most of us inherited them—not through DNA, but through the kitchens we were raised in.
// Breakfast meant beverage and bread.
// Dinner was a mountain of swallow with very little soup, usually late at night. And because swallows were mostly cassava-based, we didn’t explore other options.
// Protein was shared based on age (and sometimes gender).
// Fruits and vegetables? Optional visitors that appeared on Christmas or Easter.
// These meals comforted us… but they didn’t always nourish us.

// Now as adults, many of us are realising that if we don’t intentionally rebuild our nutrition habits, we’ll keep repeating patterns that don’t match the lives we want.
// So how do we break cycles we never chose?
// Let’s walk through it.

// 1. Become Aware of Your Default Food Patterns

// Before changing anything, understand what you do on autopilot. Ask yourself:
// • What meals do I repeat simply out of habit?
// • What food “rule” did I inherit that no longer serves me?
// • What do I eat just because “that’s how we grew up”?

// Common inherited beliefs:
// • “Real food must be heavy.”
// • “A swallow plate must be big for you to feel full.”
// • “Fruits aren’t filling.”
// • “Vegetables are optional.”

// Awareness is the first step to unlearning and rewiring.

// 2. Rebuild Your Plate With Balance, Not Bulk

// Our parents often ate for survival—long days of trading, farming, or physical labour.
// But today, many of us work from home, sit at desks, or move far less.

// Your body now needs:
// • Protein for steady energy
// • Fibre for digestion
// • Healthy fats for brain and hormone support
// • Carbs in controlled, intentional portions

// This is the shift from survival eating to intentional eating.

// 3. Learn Basic Food Pairing — It Changes Everything

// Most of us were never taught how to combine foods so the body can use them effectively.

// Small changes = big difference:
// • Add vegetables to ANY meal (yes, even bread and beverage).
// • More soup, less swallow.
// • Pair yam with eggs or beans, not just oil.
// • Pair rice with vegetables, beans, chicken, or eggs—whatever you can afford.
// • Reduce sugar + starch combos (noodles + bread, bread + soda).

// When pairing improves, energy improves—and so does wellness.

// 4. Upgrade Cultural Meals Without Losing the Culture

// You don’t need to abandon your favourite foods—just prepare them smarter.
// • Use less palm oil and more vegetables in egusi (you’re not competing for “most oily egusi”).
// • Grill proteins instead of deep frying—your heart will thank you.
// • Reduce seasoning cubes; flavour with ogiri, curry leaf, nutmeg, scent leaf, utazi seed, iru.
// • Jollof doesn’t have to be bright red—ditch store-bought paste. Add shombo, carrots, ginger, garlic for nutrients, colour, and flavour.

// 5. Build a Meal Rhythm That Supports Your Health

// Inherited patterns were random:
// Skipped breakfasts, heavy late dinners, minimal hydration.

// Your body thrives on rhythm:
// • earlier meals
// • consistent hydration
// • colour on every plate
// • lighter dinners

// Choose consistency over perfection.

// 6. Use Technology — The Advantage Your Parents Never Had

// Our parents didn’t have nutrition tools. We do.

// This is where Foodimetric becomes a game-changer.
// On Foodimetric, you get:
// • balanced recipe options
// • ingredient breakdowns
// • nutrition education for everyday meals
// • digestion + energy tips
// • easy food-pairing guides
// • health-focused meal inspiration

// You’re not starting from scratch—you’re starting with tools previous generations never had.

// 7. Build Your Own Nutrition Inheritance

// When you know how to nourish yourself, you influence more than your own life.
// Your siblings watch you.
// Your friends learn from you.
// Your future children will copy your patterns.

// The intentional shifts you make today become the health inheritance they didn’t give you,
// but you will pass on to the next generation.`,
//     },

//     {
//         id: "how-ai-is-shaping-the-future-of-nutrition-in-africa",
//         image:
//             "https://res.cloudinary.com/dqf23mtna/image/upload/v1764973462/How_AI_is_haping_he_future_of_nutrtion_page-0001_zt13vr.webp",
//         category: "ARTICLES",
//         date: "01/08/2025",
//         title:
//             "How AI is Shaping the Future of Nutrition in Africa",
//         description:
//             "This article talks about insights from nutrition and technology experts (Amos Kamau, Ojamalia Priscilla Godwins, and Ademola Ayomide) on the opportunities, challenges, and collaborative requirements for leveraging Artificial Intelligence (AI) to improve nutrition and achieve food security across Africa. It focuses on aligning AI with continental goals like Agenda 2063 and SDG 2 (Zero Hunger).",
//         author: "Foodimetric",
//         likes: 0,
//         summary:
//             "Discover the key insights on the role of AI in African nutrition, identifying both immense potential and critical development hurdles.",
//         content: `The Future of Food Security in Africa is Here.

// Artificial Intelligence (AI) holds the key to solving some of Africa's most urgent nutritional challenges, from predictive malnutrition modeling to creating customized, culturally-relevant diets.

// However, realizing this potential requires navigating significant hurdles:
// • How do we make AI inclusive and accessible across diverse communities?
// • How do we ensure AI solutions respect African cultures and indigenous food systems?
// • What are the ethical frameworks needed to govern AI's role in public health?

// This paper synthesizes the perspectives of top experts and thought leaders in nutrition, public health, and technology. It provides a deep dive into the opportunities, the critical challenges (like data bias and digital literacy), and the collaborative strategies required to build a well-nourished continent powered by responsible AI.

// Discover the roadmap for leveraging technology to achieve Zero Hunger by 2063. 

// <a href="https://drive.google.com/uc?export=download&id=1W35EIP2yitkDjcTyftqq9u-Yw7IaVyCJ" target="_blank" style="display: block; margin-top: 20px; padding: 10px 15px; background-color: #007bff; color: white; text-align: center; text-decoration: none; border-radius: 5px; font-weight: bold;">
//     DOWNLOAD THE FULL EXPERT PAPER NOW (PDF)
// </a>
// `
//     },
    {
        id: "sustainable-nutrition-for-healthy-living",
        image:
            "https://res.cloudinary.com/dqf23mtna/image/upload/v1768399462/ODL_ANTHOLOGY_2024_ewbfl4.png",
        category: "ARTICLES",
        date: "01/12/2024",
        title:
            "Sustainable Nutrition for Healthy Living (Our Diet Line Anthology Vol. 2.0)",
        description:
            "Sustainable Nutrition for Healthy Living is a nutrition anthology published by Our Diet Line (ODL) that brings together articles, short stories, poems, and educational pieces focused on sustainable nutrition, healthy lifestyles, and environmental wellness within the Nigerian context.",
        author: "Our Diet Line (ODL)",
        likes: 0,
        summary:
            "This anthology explores sustainable nutrition through scientific articles, creative writing, and advocacy pieces. It highlights healthy eating, food safety, lifestyle habits, environmental sustainability, and nutrition education. The collection promotes informed dietary choices while addressing public health, cultural food practices, and sustainability challenges in Nigeria.",
        content: `The report contains a curated collection of:
	•	Scholarly articles on sustainable nutrition, mindful eating, geriatric nutrition, dietetics, sugar consumption, and environmental wellness
	•	Short stories and poems illustrating nutrition challenges, food safety, hygiene, and poverty-related food issues
	•	Practical nutrition education covering infant feeding (FADUS model), hygiene, chronic disease prevention, organic foods, and lifestyle habits
	•	Advocacy content promoting local foods, sustainable food systems, and nutrition awareness 

<a href="https://drive.google.com/uc?export=download&id=1hD8wDsu-3LHrhIYmbhN-HHHox2Mdw0AF" target="_blank" style="display: block; margin-top: 20px; padding: 10px 15px; background-color: #007bff; color: white; text-align: center; text-decoration: none; border-radius: 5px; font-weight: bold;">
    DOWNLOAD THE REPORT NOW (PDF)
</a>
`
    },
    {
        id: "nutrition-for-all-an-anthology-on-malnutrition",
        image:
            "https://res.cloudinary.com/dqf23mtna/image/upload/v1768399833/ODL_ANTHOLOGY_2023_shgqub.webp",
        category: "ARTICLES",
        date: "01/12/2023",
        title:
            "Nutrition for All: An Anthology on Malnutrition",
        description:
            "Nutrition for All: An Anthology on Malnutrition is a collective publication by Our Diet Line that brings together essays, poems, and short reflective pieces written by students and young professionals in nutrition-related fields. The anthology focuses on nutrition education, food safety, maternal and child nutrition, and the fight against malnutrition through awareness and advocacy.",
        author: "Our Diet Line (ODL)",
        likes: 0,
        summary:
            "This anthology presents creative and educational writings on nutrition and malnutrition, highlighting food safety, maternal and child health, dietary practices, and public nutrition awareness. Through essays and poetry, contributors advocate accessible, affordable, and informed nutrition choices as a foundation for health, productivity, and national development.",
        content: `The report compiles twelve thematic entries addressing key nutrition issues such as breastfeeding, food poisoning, good health, protein intake, festive eating, and hidden hunger. It blends scientific nutrition knowledge with storytelling and poetry to educate the public on healthy eating practices, nutrition equity, and malnutrition prevention in Nigerian and African contexts. 

<a href="https://drive.google.com/uc?export=download&id=1CLrVFy7JFxubIOIbp2SW7kGsZvvTpYai" target="_blank" style="display: block; margin-top: 20px; padding: 10px 15px; background-color: #007bff; color: white; text-align: center; text-decoration: none; border-radius: 5px; font-weight: bold;">
    DOWNLOAD THE REPORT NOW (PDF)
</a>
`
    },

];
const seedResources = async () => {
    try {
        for (const resource of allResources) {
            await Resource.updateOne(
                { title: resource.title }, // Look for this ID
                { 
                    $setOnInsert: { likes: 0 }, // ONLY set likes to 0 if it's a brand new document
                    $set: {
                        image: resource.image,
                        category: resource.category,
                        date: resource.date,
                        title: resource.title,
                        description: resource.description,
                        author: resource.author,
                        summary: resource.summary,
                        content: resource.content
                    }
                },
                { upsert: true } // Create if not found
            );
        }
        console.log("Resources synced without overwriting likes.");
    } catch (error) {
        console.error("Seeding error:", error);
    }
};
module.exports = { seedResources }
