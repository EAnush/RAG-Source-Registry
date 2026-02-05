// Trust Graph - Type Definitions Only (All data now lives in Vercel KV)

// Categories are now freeform strings (not a fixed enum)
// export type Category = 'Health' | 'Finance' | 'Legal'; // REMOVED

export type SourceType = 'Government' | 'Academic' | 'Industry' | 'News' | 'Custom';

export interface Source {
    id: string;
    name: string;
    baseUrl: string;
    category: string; // Now freeform (was: Category enum)
    sourceType: string; // Made flexible too
    trustScore?: number; // Now optional (0-100)
    tags: string[];
}

// No hardcoded sources - all data lives in Vercel KV
export const trustGraph: Source[] = [];

// Helper function to get sources by category
export function getSourcesByCategory(sources: Source[], category: string): Source[] {
    return sources.filter((source) => source.category === category);
}

// Helper function to search sources by tags
export function searchSourcesByTags(
    category: string,
    keywords: string[],
    sourceList: Source[]
): Source[] {
    // Filter by Category first
    const categoryMatches = sourceList.filter((source) =>
        source.category.toLowerCase() === category.toLowerCase()
    );

    if (keywords.length === 0) {
        return categoryMatches;
    }

    // Score each source
    const scored = categoryMatches.map((source) => {
        const lowerTags = source.tags.map((t) => t.toLowerCase());
        const matchCount = keywords.filter((kw) =>
            lowerTags.some((tag) => tag.includes(kw.toLowerCase()) || kw.toLowerCase().includes(tag))
        ).length;
        return { source, matchCount };
    });

    // Sort by score
    scored.sort((a, b) => {
        if (b.matchCount !== a.matchCount) {
            return b.matchCount - a.matchCount;
        }
        // Use trustScore for secondary sort, defaulting to 50 if not set
        return (b.source.trustScore ?? 50) - (a.source.trustScore ?? 50);
    });

    // Return matches
    const matched = scored.filter((s) => s.matchCount > 0).map((s) => s.source);

    if (matched.length > 0) {
        return matched;
    }

    // Fallback: return top sources
    return categoryMatches
        .sort((a, b) => (b.trustScore ?? 50) - (a.trustScore ?? 50))
        .slice(0, 3);
}
