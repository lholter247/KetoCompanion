import { GoogleGenAI, Type } from "@google/genai";
import { MealAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeMeal = async (text: string): Promise<MealAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze the following meal description: "${text}". 
      Break it down into individual food items with estimated quantities.
      Calculate the nutritional content for each item and the total meal.
      Crucial: Calculate 'netCarbs' (Total Carbs - Fiber).
      Determine if this meal is strictly Keto-friendly (High Fat, Moderate Protein, Very Low Carb).
      Provide a short, helpful piece of advice or feedback regarding the meal's keto compatibility.`,
      config: {
        systemInstruction: "You are an expert Keto Diet Nutritionist. You are precise with calorie and macro estimations.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foods: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  quantity: { type: Type.STRING },
                  calories: { type: Type.NUMBER },
                  fat: { type: Type.NUMBER },
                  protein: { type: Type.NUMBER },
                  carbs: { type: Type.NUMBER, description: "Total Carbohydrates" },
                  netCarbs: { type: Type.NUMBER, description: "Total Carbs minus Fiber" },
                },
                required: ["name", "quantity", "calories", "fat", "protein", "carbs", "netCarbs"]
              }
            },
            total: {
              type: Type.OBJECT,
              properties: {
                calories: { type: Type.NUMBER },
                fat: { type: Type.NUMBER },
                protein: { type: Type.NUMBER },
                carbs: { type: Type.NUMBER },
                netCarbs: { type: Type.NUMBER },
              },
              required: ["calories", "fat", "protein", "carbs", "netCarbs"]
            },
            ketoAdvice: { type: Type.STRING },
            isKetoFriendly: { type: Type.BOOLEAN },
          },
          required: ["foods", "total", "ketoAdvice", "isKetoFriendly"],
        },
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as MealAnalysis;
    }
    
    throw new Error("No response from Gemini");

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
