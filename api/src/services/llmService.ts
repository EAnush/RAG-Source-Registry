// LLM Service - Interface with Groq Cloud API (Llama 3.3 70B) for Query Translation
import Groq from 'groq-sdk';
import { z } from 'zod';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const MODEL_NAME = 'llama-3.3-70b-versatile'; // Faster, smarter, free-tier friendly

// Schema for the expected translation output
const TranslationSchema = z.object({
    category: z.string(), // Freeform - any category allowed
    keywords: z.array(z.string()),
});

export type TranslationResult = z.infer<typeof TranslationSchema>;

export interface TranslationResponse {
    success: boolean;
    data?: TranslationResult;
    error?: string;
}

const SYSTEM_PROMPT = `You are a query translator for a trust verification system. Your ONLY job is to analyze user queries and output a JSON object.

COMMON CATEGORIES (use these if applicable, or create a new one):
- "Health": Body, illness, symptoms, medicine, doctors, disease, injury, mental health
- "Finance": Money, taxes, investments, banks, crypto, stocks, debt, income
- "Legal": Laws, rights, courts, police, lawyers, contracts, disputes
- "Technology": Software, hardware, programming, AI, cybersecurity
- "Education": Schools, learning, courses, degrees, research
- "Science": Physics, chemistry, biology, research, experiments

RULES:
1. You MUST output ONLY valid JSON.
2. The JSON must have exactly two fields:
   - "category": A single-word or short category name (use common ones above, or create appropriate new ones like "Crypto", "Sports", "Travel", etc.)
   - "keywords": An array of 2-5 relevant search keywords.

IMPORTANT FOR KEYWORDS:
- Extract specific technical terms (e.g., use "clinical trials" instead of "testing").
- Include synonyms for slang (e.g., "crypto" -> ["cryptocurrency", "bitcoin"]).
- Include both broad and specific terms.

EXAMPLES:
User: "help my baby has a fever"
Output: {"category": "Health", "keywords": ["infant", "fever", "temperature", "baby", "pediatric"]}

User: "what are the tax implications of selling bitcoin"
Output: {"category": "Finance", "keywords": ["tax", "crypto", "bitcoin", "capital gains", "cryptocurrency"]}

User: "can my landlord evict me without notice"
Output: {"category": "Legal", "keywords": ["eviction", "tenant rights", "landlord", "notice", "housing law"]}
`;

let groqClient: Groq | null = null;

function getGroqClient() {
    if (!groqClient && GROQ_API_KEY) {
        groqClient = new Groq({ apiKey: GROQ_API_KEY });
    }
    return groqClient;
}

export async function translateQuery(query: string): Promise<TranslationResponse> {
    const client = getGroqClient();

    if (!client) {
        return {
            success: false,
            error: 'GROQ_API_KEY is missing in environment variables.',
        };
    }

    try {
        const completion = await client.chat.completions.create({
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: query },
            ],
            model: MODEL_NAME,
            temperature: 0.1,
            response_format: { type: 'json_object' }, // Native JSON mode
        });

        const content = completion.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(content);
        const validated = TranslationSchema.parse(parsed);

        return {
            success: true,
            data: validated,
        };

    } catch (error) {
        let errorMessage = 'Unknown translation error';

        if (error instanceof z.ZodError) {
            errorMessage = `Validation error: ${error.issues.map((e) => e.message).join(', ')}`;
        } else if (error instanceof SyntaxError) {
            errorMessage = `JSON parsing error`;
        } else if (error instanceof Error) {
            errorMessage = error.message;
        }

        console.error(`[LLMService] Groq Error: ${errorMessage}`);

        return {
            success: false,
            error: errorMessage,
        };
    }
}

// Health check for LLM service
export async function checkLlmHealth(): Promise<boolean> {
    if (!GROQ_API_KEY) return false;

    // Lightweight check
    try {
        // We don't make a real call here to save credits/latency, 
        // just checking if client initializes and key exists
        return true;
    } catch {
        return false;
    }
}
