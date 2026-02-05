// Query Route - Main API Entry Point
import { Router, Request, Response } from 'express';
import { translateQuery, TranslationResult } from '../services/llmService.js';
import { searchSourcesByTags, Category, Source } from '../data/trustGraph.js';
import { SourceStore } from '../services/store.js';
import { signSourceAccess, signManifest } from '../services/jwtService.js';

const router = Router();

// Define the expected response shape
interface SourceItem {
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
    sources: SourceItem[];
    signature: string; // JWT for audit trail
}

interface ErrorResponse {
    error: string;
    details?: string;
}

// GET /api/query?q=...
router.get('/', async (req: Request, res: Response<SourceManifest | ErrorResponse>) => {
    const query = req.query.q as string;

    if (!query) {
        return res.status(400).json({ error: 'Missing query parameter "q"' });
    }

    try {
        // 1. Get AI Translation (NLP -> JSON Tags)
        const translationResponse = await translateQuery(query);

        if (!translationResponse.success || !translationResponse.data) {
            return res.status(500).json({
                error: 'Translation failed',
                details: translationResponse.error || 'Unknown AI error',
            });
        }

        const translation = translationResponse.data;

        // 2. Fetch all sources (Dynamic + Hardcoded)
        const allSources = await SourceStore.getAllSources();

        // 3. Find relevant sources from the combined list
        const relevantSources = searchSourcesByTags(
            translation.category as Category,
            translation.keywords,
            allSources
        );

        // 4. Generate Masked URLs & Audit Tokens
        const baseApiUrl = process.env.BASE_API_URL || 'http://localhost:3001/api';

        const sourceManifestItems: SourceItem[] = relevantSources.map((source) => {
            const { maskedUrl } = signSourceAccess(
                source.id,
                source.baseUrl,
                query,
                translation.category,
                baseApiUrl
            );

            return {
                name: source.name,
                sourceType: source.sourceType,
                trustScore: source.trustScore,
                maskedUrl,
            };
        });

        // 5. Create Cryptographic Signature for the entire result set
        const manifestSignature = signManifest(query, translation, sourceManifestItems);

        // 6. Return the Trust Manifest
        const response: SourceManifest = {
            query,
            translation,
            sources: sourceManifestItems,
            signature: manifestSignature,
        };

        res.json(response);
    } catch (err: any) {
        console.error('Query processing error:', err);
        res.status(500).json({
            error: 'Internal processing error',
            details: err.message,
        });
    }
});

export default router;
