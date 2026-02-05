import { createClient } from '@vercel/kv';
import { Source } from '../data/trustGraph.js';

// Initialize KV client - fails gracefully if env vars are missing
const kv = createClient({
    url: process.env.KV_REST_API_URL || '',
    token: process.env.KV_REST_API_TOKEN || '',
});

const CUSTOM_SOURCES_KEY = 'trust_layer_sources'; // Renamed: no longer "custom"

export class SourceStore {
    /**
     * Get all sources from the database
     * No more merging with hardcoded - DB is the single source of truth
     */
    static async getAllSources(): Promise<Source[]> {
        try {
            if (!process.env.KV_REST_API_URL) {
                console.warn('KV_REST_API_URL missing, returning empty array');
                return [];
            }

            const sources = await kv.get<Source[]>(CUSTOM_SOURCES_KEY);
            return sources || [];
        } catch (error) {
            console.error('Failed to fetch sources:', error);
            return [];
        }
    }

    /**
     * Add a new source
     */
    static async addSource(source: Source): Promise<void> {
        if (!process.env.KV_REST_API_URL) throw new Error('Database not configured');

        const current = await kv.get<Source[]>(CUSTOM_SOURCES_KEY) || [];
        current.push(source);
        await kv.set(CUSTOM_SOURCES_KEY, current);
    }

    /**
     * Update an existing source by ID
     */
    static async updateSource(id: string, updates: Partial<Source>): Promise<Source | null> {
        if (!process.env.KV_REST_API_URL) throw new Error('Database not configured');

        const current = await kv.get<Source[]>(CUSTOM_SOURCES_KEY) || [];
        const index = current.findIndex(s => s.id === id);

        if (index === -1) return null;

        // Merge updates
        current[index] = { ...current[index], ...updates, id }; // Preserve original ID
        await kv.set(CUSTOM_SOURCES_KEY, current);

        return current[index];
    }

    /**
     * Remove a source by ID
     */
    static async removeSource(id: string): Promise<boolean> {
        if (!process.env.KV_REST_API_URL) throw new Error('Database not configured');

        const current = await kv.get<Source[]>(CUSTOM_SOURCES_KEY) || [];
        const filtered = current.filter(s => s.id !== id);

        if (filtered.length === current.length) return false; // Not found

        await kv.set(CUSTOM_SOURCES_KEY, filtered);
        return true;
    }

    /**
     * Get unique categories from existing sources (for autocomplete)
     */
    static async getCategories(): Promise<string[]> {
        const sources = await this.getAllSources();
        const categories = [...new Set(sources.map(s => s.category))];
        return categories.sort();
    }
}
