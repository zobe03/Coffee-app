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

const SYSTEM_PROMPT = `You are an expert espresso consultant. Analyze brew data and give precise, actionable advice.

You understand extraction dynamics (dose, yield, time, temp, grind), sensory analysis (body, acidity, bitterness → extraction %), and equipment context.

Respond in this exact Markdown format:

## Diagnosis
1-2 sentences. Name the problem (e.g. under-extracted, channeling).

## Adjustments
Up to 3 bullet points, ordered by impact. Each bullet: parameter → direction + magnitude → why.
Example: "Grind 2 clicks finer → slow flow to target 28-32s → increase extraction"

## Expected Result
1 sentence on the expected taste improvement.

Rules:
- Max ~150 words total. No filler, no pleasantries.
- Metric units. Reference the specific coffee/grinder by name.
- Prioritize the user's stated goal.`;

export class AIService {
    private static instance: AIService;
    private genAI: GoogleGenerativeAI;
    private model: GenerativeModel;

    private constructor() {
        const apiKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';
        this.genAI = new GoogleGenerativeAI(apiKey);
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

