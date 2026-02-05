// Query Route - Main API Entry Point
import { Router, Request, Response } from 'express';
import { translateQuery, TranslationResult } from '../services/llmService';
import { searchSourcesByTags, Category, Source } from '../data/trustGraph';
import { signSourceAccess, signManifest } from '../services/jwtService';

const router = Router();

// Response types
interface SourceManifestItem {
    name: string;
    sourceType: string;
    trustScore: number;
    maskedUrl: string;
}

interface SourceManifest {
    query: string;
    translation: {
        category: string;
        keywords: string[];
    };
    sources: SourceManifestItem[];
    signature: string;
}

interface ErrorResponse {
    error: string;
    details?: string;
}

/**
 * GET /api/query
 * Main endpoint for querying trusted sources
 * 
 * Query params:
 *   - q: The natural language query string
 * 
 * Returns: SourceManifest with masked URLs
 */
router.get('/', async (req: Request, res: Response<SourceManifest | ErrorResponse>) => {
    const query = req.query.q as string;

    if (!query || query.trim().length === 0) {
        return res.status(400).json({
            error: 'Missing query parameter',
            details: 'Please provide a query using ?q=your+query',
        });
    }

    console.log(`[Query] Received: "${query}"`);

    // Step 1: Translate the query using Ollama/Qwen
    const translationResult = await translateQuery(query);

    if (!translationResult.success || !translationResult.data) {
        console.log(`[Query] Translation failed: ${translationResult.error}`);
        return res.status(500).json({
            error: 'Translation failed',
            details: translationResult.error,
        });
    }

    const translation: TranslationResult = translationResult.data;
    console.log(`[Query] Translation: ${JSON.stringify(translation)}`);

    // Step 2: Search the Trust Graph for matching sources
    const category = translation.category as Category;
    const matchedSources: Source[] = searchSourcesByTags(category, translation.keywords);

    console.log(`[Query] Found ${matchedSources.length} sources for category "${category}"`);

    // Step 3: Generate masked URLs with JWT tokens
    const baseApiUrl = `${req.protocol}://${req.get('host')}/api`;

    const sources: SourceManifestItem[] = matchedSources.map((source) => {
        const signed = signSourceAccess(
            source.id,
            source.baseUrl,
            query,
            category,
            baseApiUrl
        );

        return {
            name: source.name,
            sourceType: source.sourceType,
            trustScore: source.trustScore,
            maskedUrl: signed.maskedUrl,
        };
    });

    // Step 4: Create the manifest and sign it
    const manifestData = {
        query,
        translation: {
            category: translation.category,
            keywords: translation.keywords,
        },
        sources,
    };

    const signature = signManifest(manifestData);

    const response: SourceManifest = {
        ...manifestData,
        signature,
    };

    console.log(`[Query] Returning manifest with ${sources.length} sources`);
    return res.json(response);
});

export default router;
