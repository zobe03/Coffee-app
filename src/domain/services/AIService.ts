import { GoogleGenerativeAI } from "@google/generative-ai";
import { BrewLog } from "../entities/BrewLog";

export class AIService {
    private static instance: AIService;
    private genAI: GoogleGenerativeAI;
    private model: any;

    private constructor() {
        // Ideally this comes from ENV or user settings
        // For now, we will use a placeholder or assume user provides it
        // API Key provided by user
        this.genAI = new GoogleGenerativeAI("AIzaSyC--ZWaNvITabo2ZLvrChErg6v1K-Tye7Y");
        this.model = this.genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }, { apiVersion: "v1alpha" });
    }

    public static getInstance(): AIService {
        if (!AIService.instance) {
            AIService.instance = new AIService();
        }
        return AIService.instance;
    }

    public setApiKey(key: string) {
        this.genAI = new GoogleGenerativeAI(key);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-3-flash-preview" }, { apiVersion: "v1alpha" });
    }

    async getAdvice(currentLog: Partial<BrewLog>, history: BrewLog[], goal?: string): Promise<string> {
        try {
            const prompt = `
        You are a specialty coffee expert. Analyze this brew and suggest improvements.
        
        Current Brew:
        - Dose In: ${currentLog.doseIn}g
        - Dose Out: ${currentLog.doseOut}g
        - Time: ${currentLog.timeSeconds}s
        - Temp: ${currentLog.temperature}°C
        - Grind: ${currentLog.grindSetting}
        - Taste: Body=${currentLog.score?.body}/2, Acidity=${currentLog.score?.acidity}/10, Bitterness=${currentLog.score?.bitterness}/10
        - Notes: ${currentLog.score?.tasteNotes?.join(', ')}

        History: ${history.length} previous brews.

        User Goal: ${goal || "General improvement for a balanced cup."}

        Provide extremely concise, actionable advice in bullet points. Max 3-4 bullet points.
        Format as Markdown.
        Focus on grind size, dose, and yield.
      `;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("AI Error:", error);
            // @ts-ignore
            if (global.alert) {
                // @ts-ignore
                alert("AI Error: " + (error.message || "Unknown error"));
            }
            return "Unable to get advice. Please check your API Key and internet connection.";
        }
    }
}

export const aiService = AIService.getInstance();
