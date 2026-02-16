import { GoogleGenerativeAI, GenerativeModel } from "@google/generative-ai";
import { BrewLog } from "../entities/BrewLog";
import { Coffee } from "../entities/Coffee";
import { Grinder } from "../entities/Grinder";

export interface AdviceContext {
    coffee?: Coffee;
    grinder?: Grinder;
    allCoffees?: Record<number, Coffee>;
    allGrinders?: Record<number, Grinder>;
}

const SYSTEM_PROMPT = `You are an elite specialty coffee consultant and espresso diagnostician. You have deep expertise in extraction science, grinder calibration, and sensory analysis.

Your role is to analyze a user's espresso brew data and provide precise, actionable advice to improve their next shot. You understand:
- Extraction dynamics: how dose, yield, time, temperature, and grind size interact
- Sensory mapping: how body, acidity, and bitterness relate to extraction percentage
- Equipment context: different grinders have different step sizes and burr geometries
- Coffee characteristics: origin, process method, and roast level affect ideal extraction parameters

Response format — always use this structure:
## 🔍 Diagnosis
A brief 1-2 sentence assessment of the current brew based on the data.

## 🔧 Adjustments
3-4 **specific, measurable** changes ordered by impact. Each must include:
- The parameter to change (grind, dose, yield, time, temp)
- The direction and approximate magnitude (e.g. "grind 1-2 clicks finer", "increase yield by 4g")
- Brief reasoning

## ✨ Expected Outcome
1-2 sentences describing the expected sensory improvement.

Rules:
- Be concise and direct. No filler.
- Use metric units (grams, seconds, °C).
- Reference the specific coffee and grinder when known.
- Consider the user's stated goal as the primary optimization target.
- If the brew data suggests a specific problem (channeling, under/over-extraction), name it explicitly.
- Format all output as Markdown.`;

export class AIService {
    private static instance: AIService;
    private genAI: GoogleGenerativeAI;
    private model: GenerativeModel;

    private constructor() {
        this.genAI = new GoogleGenerativeAI("AIzaSyC--ZWaNvITabo2ZLvrChErg6v1K-Tye7Y");
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            systemInstruction: SYSTEM_PROMPT,
        }, { apiVersion: "v1alpha" });
    }

    public static getInstance(): AIService {
        if (!AIService.instance) {
            AIService.instance = new AIService();
        }
        return AIService.instance;
    }

    public setApiKey(key: string) {
        this.genAI = new GoogleGenerativeAI(key);
        this.model = this.genAI.getGenerativeModel({
            model: "gemini-3-flash-preview",
            systemInstruction: SYSTEM_PROMPT,
        }, { apiVersion: "v1alpha" });
    }

    private bodyLabel(body: number): string {
        return body === 0 ? 'Light' : body === 1 ? 'Medium' : 'Heavy';
    }

    private formatBrewSummary(brew: BrewLog, context: AdviceContext): string {
        const coffee = brew.coffeeId ? context.allCoffees?.[brew.coffeeId] : undefined;
        const grinder = brew.grinderId ? context.allGrinders?.[brew.grinderId] : undefined;
        const ratio = brew.doseIn > 0 ? (brew.doseOut / brew.doseIn).toFixed(1) : '?';

        let summary = `- Date: ${new Date(brew.date).toLocaleDateString()}`;
        if (coffee) summary += ` | Coffee: ${coffee.name}`;
        summary += ` | ${brew.doseIn}g → ${brew.doseOut}g in ${brew.timeSeconds}s (1:${ratio})`;
        if (brew.temperature) summary += ` @ ${brew.temperature}°C`;
        if (brew.grindSetting) summary += ` | Grind: ${brew.grindSetting}`;
        summary += ` | Body: ${this.bodyLabel(brew.score.body)}, Acidity: ${brew.score.acidity}/10, Bitterness: ${brew.score.bitterness}/10`;
        if (brew.score.tasteNotes.length > 0) summary += ` | Notes: ${brew.score.tasteNotes.join(', ')}`;
        return summary;
    }

    async getAdvice(currentLog: BrewLog, history: BrewLog[], goal?: string, context: AdviceContext = {}): Promise<string> {
        try {
            const coffee = context.coffee;
            const grinder = context.grinder;
            const ratio = currentLog.doseIn > 0 ? (currentLog.doseOut / currentLog.doseIn).toFixed(2) : 'N/A';

            // Build coffee section
            let coffeeSection = `**Coffee:** ${coffee?.name || 'Unknown'}`;
            if (coffee?.roastery) coffeeSection += ` by ${coffee.roastery}`;
            if (coffee?.origin) coffeeSection += `\n  - Origin: ${coffee.origin}`;
            if (coffee?.variety) coffeeSection += ` | Variety: ${coffee.variety}`;
            if (coffee?.process) coffeeSection += ` | Process: ${coffee.process}`;
            if (coffee?.roastDate) coffeeSection += ` | Roast Date: ${coffee.roastDate}`;

            // Build grinder section
            let grinderSection = `**Grinder:** ${grinder ? `${grinder.brand} ${grinder.model}` : 'Unknown'}`;
            if (grinder?.description) grinderSection += ` (${grinder.description})`;

            // Build history section
            const recentHistory = history
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 10);

            let historySection = '';
            if (recentHistory.length > 1) {
                historySection = `\n## Recent Brew History (${recentHistory.length} most recent)\n`;
                historySection += recentHistory
                    .map(brew => this.formatBrewSummary(brew, context))
                    .join('\n');
            }

            const prompt = `Analyze this espresso brew and advise how to improve.

## Equipment
${coffeeSection}
${grinderSection}

## Current Brew (to analyze)
- **Dose In:** ${currentLog.doseIn}g
- **Dose Out:** ${currentLog.doseOut}g
- **Extraction Ratio:** 1:${ratio}
- **Time:** ${currentLog.timeSeconds}s
- **Temperature:** ${currentLog.temperature ? currentLog.temperature + '°C' : 'Not recorded'}
- **Grind Setting:** ${currentLog.grindSetting || 'Not recorded'}

## Taste Profile
- **Body:** ${this.bodyLabel(currentLog.score.body)} (${currentLog.score.body}/2)
- **Acidity:** ${currentLog.score.acidity}/10
- **Bitterness:** ${currentLog.score.bitterness}/10
- **Taste Notes:** ${currentLog.score.tasteNotes.length > 0 ? currentLog.score.tasteNotes.join(', ') : 'None recorded'}
${historySection}

## User's Goal
${goal || 'General improvement — balanced, sweet, clean cup.'}`;

            const result = await this.model.generateContent(prompt);
            const response = await result.response;
            return response.text();
        } catch (error) {
            console.error("AI Error:", error);
            const message = error instanceof Error ? error.message : "Unknown error";
            return `Unable to get advice: ${message}. Please check your API Key and internet connection.`;
        }
    }
}

export const aiService = AIService.getInstance();

