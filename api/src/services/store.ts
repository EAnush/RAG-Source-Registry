import { createClient } from '@vercel/kv';
import { trustGraph, Source } from '../data/trustGraph.js';

// Initialize KV client - fails gracefully if env vars are missing
const kv = createClient({
    url: process.env.KV_REST_API_URL || '',
    token: process.env.KV_REST_API_TOKEN || '',
});

const CUSTOM_SOURCES_KEY = 'trust_layer_custom_sources';

export class SourceStore {
    /**
     * Get all sources (Hardcoded + Custom)
     */
    static async getAllSources(): Promise<Source[]> {
        try {
            if (!process.env.KV_REST_API_URL) {
                console.warn('KV_REST_API_URL missing, returning only hardcoded sources');
                return trustGraph;
            }

            const customSources = await kv.get<Source[]>(CUSTOM_SOURCES_KEY);
            const combined = [...trustGraph, ...(customSources || [])];
            return combined;
        } catch (error) {
            console.error('Failed to fetch custom sources:', error);
            return trustGraph; // Fallback to hardcoded
        }
    }

    /**
     * Add a new custom source
     */
    static async addSource(source: Source): Promise<void> {
        if (!process.env.KV_REST_API_URL) throw new Error('Database not configured');

        const current = await kv.get<Source[]>(CUSTOM_SOURCES_KEY) || [];
        current.push(source);
        await kv.set(CUSTOM_SOURCES_KEY, current);
    }

    /**
     * Remove a custom source by ID
     */
    static async removeSource(id: string): Promise<void> {
        if (!process.env.KV_REST_API_URL) throw new Error('Database not configured');

        const current = await kv.get<Source[]>(CUSTOM_SOURCES_KEY) || [];
        const filtered = current.filter(s => s.id !== id);
        await kv.set(CUSTOM_SOURCES_KEY, filtered);
    }
}
