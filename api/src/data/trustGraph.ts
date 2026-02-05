// Trust Graph - Hardcoded Database of Verified Sources

export type Category = 'Health' | 'Finance' | 'Legal';
export type SourceType = 'Government' | 'Academic' | 'Industry' | 'News';

export interface Source {
    id: string;
    name: string;
    baseUrl: string;
    category: Category;
    sourceType: SourceType;
    trustScore: number;
    tags: string[];
}

export const trustGraph: Source[] = [
    // Health Sources
    {
        id: 'cdc-001',
        name: 'Centers for Disease Control and Prevention (CDC)',
        baseUrl: 'https://www.cdc.gov',
        category: 'Health',
        sourceType: 'Government',
        trustScore: 99,
        tags: ['disease', 'prevention', 'vaccination', 'outbreak', 'public health', 'infection', 'virus', 'bacteria', 'epidemic', 'pandemic'],
    },
    {
        id: 'who-001',
        name: 'World Health Organization (WHO)',
        baseUrl: 'https://www.who.int',
        category: 'Health',
        sourceType: 'Government',
        trustScore: 98,
        tags: ['global health', 'disease', 'pandemic', 'vaccination', 'public health', 'international', 'outbreak', 'emergency'],
    },
    {
        id: 'nih-001',
        name: 'National Institutes of Health (NIH)',
        baseUrl: 'https://www.nih.gov',
        category: 'Health',
        sourceType: 'Government',
        trustScore: 98,
        tags: ['research', 'clinical trials', 'medicine', 'treatment', 'drug', 'therapy', 'disease', 'genetics'],
    },
    {
        id: 'mayo-001',
        name: 'Mayo Clinic',
        baseUrl: 'https://www.mayoclinic.org',
        category: 'Health',
        sourceType: 'Academic',
        trustScore: 95,
        tags: ['symptoms', 'treatment', 'diagnosis', 'disease', 'condition', 'medication', 'surgery', 'therapy'],
    },
    {
        id: 'pubmed-001',
        name: 'PubMed (National Library of Medicine)',
        baseUrl: 'https://pubmed.ncbi.nlm.nih.gov',
        category: 'Health',
        sourceType: 'Academic',
        trustScore: 97,
        tags: ['research', 'study', 'journal', 'paper', 'clinical', 'peer-reviewed', 'medical literature'],
    },

    // Finance Sources
    {
        id: 'sec-001',
        name: 'U.S. Securities and Exchange Commission (SEC)',
        baseUrl: 'https://www.sec.gov',
        category: 'Finance',
        sourceType: 'Government',
        trustScore: 99,
        tags: ['securities', 'regulation', 'stock', 'investment', 'disclosure', 'filing', 'fraud', 'compliance'],
    },
    {
        id: 'irs-001',
        name: 'Internal Revenue Service (IRS)',
        baseUrl: 'https://www.irs.gov',
        category: 'Finance',
        sourceType: 'Government',
        trustScore: 99,
        tags: ['tax', 'income', 'deduction', 'refund', 'filing', 'compliance', 'audit', 'crypto', 'capital gains'],
    },
    {
        id: 'fed-001',
        name: 'Federal Reserve',
        baseUrl: 'https://www.federalreserve.gov',
        category: 'Finance',
        sourceType: 'Government',
        trustScore: 99,
        tags: ['monetary policy', 'interest rate', 'inflation', 'banking', 'economy', 'fed', 'reserve'],
    },
    {
        id: 'investopedia-001',
        name: 'Investopedia',
        baseUrl: 'https://www.investopedia.com',
        category: 'Finance',
        sourceType: 'Industry',
        trustScore: 88,
        tags: ['investing', 'stock', 'bond', 'mutual fund', 'etf', 'crypto', 'trading', 'portfolio', 'definition'],
    },
    {
        id: 'bloomberg-001',
        name: 'Bloomberg',
        baseUrl: 'https://www.bloomberg.com',
        category: 'Finance',
        sourceType: 'News',
        trustScore: 90,
        tags: ['market', 'stock', 'economy', 'news', 'trading', 'finance', 'business'],
    },

    // Legal Sources
    {
        id: 'scotus-001',
        name: 'Supreme Court of the United States',
        baseUrl: 'https://www.supremecourt.gov',
        category: 'Legal',
        sourceType: 'Government',
        trustScore: 100,
        tags: ['ruling', 'case', 'decision', 'opinion', 'constitutional', 'appeal', 'court'],
    },
    {
        id: 'congress-001',
        name: 'Congress.gov',
        baseUrl: 'https://www.congress.gov',
        category: 'Legal',
        sourceType: 'Government',
        trustScore: 99,
        tags: ['bill', 'law', 'legislation', 'congress', 'senate', 'house', 'act', 'statute'],
    },
    {
        id: 'cornell-law-001',
        name: 'Cornell Law School - Legal Information Institute',
        baseUrl: 'https://www.law.cornell.edu',
        category: 'Legal',
        sourceType: 'Academic',
        trustScore: 96,
        tags: ['law', 'statute', 'code', 'regulation', 'case', 'legal definition', 'constitution'],
    },
    {
        id: 'justia-001',
        name: 'Justia',
        baseUrl: 'https://www.justia.com',
        category: 'Legal',
        sourceType: 'Industry',
        trustScore: 85,
        tags: ['case', 'lawyer', 'legal', 'court', 'ruling', 'precedent', 'litigation'],
    },
    {
        id: 'findlaw-001',
        name: 'FindLaw',
        baseUrl: 'https://www.findlaw.com',
        category: 'Legal',
        sourceType: 'Industry',
        trustScore: 84,
        tags: ['legal', 'lawyer', 'attorney', 'case', 'law', 'rights', 'lawsuit'],
    },
    // Mental Health & Specialized Medical
    {
        id: 'nimh-001',
        name: 'National Institute of Mental Health (NIMH)',
        baseUrl: 'https://www.nimh.nih.gov',
        category: 'Health',
        sourceType: 'Government',
        trustScore: 98,
        tags: ['mental health', 'depression', 'anxiety', 'psychology', 'psychiatry', 'disorder', 'therapy'],
    },
    {
        id: 'apa-001',
        name: 'American Psychological Association',
        baseUrl: 'https://www.apa.org',
        category: 'Health',
        sourceType: 'Academic',
        trustScore: 94,
        tags: ['psychology', 'mental health', 'behavior', 'therapy', 'stress', 'trauma'],
    },
    {
        id: 'medline-001',
        name: 'MedlinePlus',
        baseUrl: 'https://medlineplus.gov',
        category: 'Health',
        sourceType: 'Government',
        trustScore: 99,
        tags: ['health information', 'drugs', 'supplements', 'genetics', 'medical tests', 'symptoms'],
    },
    {
        id: 'cleveland-001',
        name: 'Cleveland Clinic',
        baseUrl: 'https://my.clevelandclinic.org',
        category: 'Health',
        sourceType: 'Academic',
        trustScore: 95,
        tags: ['medical', 'hospital', 'symptoms', 'treatment', 'heart', 'health library', 'expert_opinion'],
    },
    {
        id: 'hopkins-001',
        name: 'Johns Hopkins Medicine',
        baseUrl: 'https://www.hopkinsmedicine.org',
        category: 'Health',
        sourceType: 'Academic',
        trustScore: 96,
        tags: ['medical', 'research', 'conditions', 'diseases', 'health', 'patient care'],
    },
    {
        id: 'webmd-001',
        name: 'WebMD (Fact Checked)',
        baseUrl: 'https://www.webmd.com',
        category: 'Health',
        sourceType: 'Industry',
        trustScore: 82,
        tags: ['symptoms', 'drugs', 'health', 'wellness', 'family health', 'checkup'],
    },

    // Crypto, Real Estate & Global Finance
    {
        id: 'cfpb-001',
        name: 'Consumer Financial Protection Bureau (CFPB)',
        baseUrl: 'https://www.consumerfinance.gov',
        category: 'Finance',
        sourceType: 'Government',
        trustScore: 98,
        tags: ['consumer protection', 'mortgage', 'loan', 'credit card', 'banking', 'complaint', 'fraud'],
    },
    {
        id: 'imf-001',
        name: 'International Monetary Fund (IMF)',
        baseUrl: 'https://www.imf.org',
        category: 'Finance',
        sourceType: 'Government',
        trustScore: 97,
        tags: ['global economy', 'monetary', 'financial stability', 'growth', 'exchange rates'],
    },
    {
        id: 'coindesk-001',
        name: 'CoinDesk',
        baseUrl: 'https://www.coindesk.com',
        category: 'Finance',
        sourceType: 'News',
        trustScore: 85,
        tags: ['crypto', 'bitcoin', 'blockchain', 'ethereum', 'digital assets', 'fintech', 'web3'],
    },
    {
        id: 'wsj-finance-001',
        name: 'Wall Street Journal - Markets',
        baseUrl: 'https://www.wsj.com/market-data',
        category: 'Finance',
        sourceType: 'News',
        trustScore: 92,
        tags: ['markets', 'stocks', 'bonds', 'commodities', 'trading', 'business news'],
    },
    {
        id: 'finra-001',
        name: 'FINRA',
        baseUrl: 'https://www.finra.org',
        category: 'Finance',
        sourceType: 'Industry',
        trustScore: 96,
        tags: ['investor protection', 'broker', 'regulation', 'market integrity', 'financial literacy'],
    },
    {
        id: 'fdic-001',
        name: 'Federal Deposit Insurance Corporation (FDIC)',
        baseUrl: 'https://www.fdic.gov',
        category: 'Finance',
        sourceType: 'Government',
        trustScore: 99,
        tags: ['banking', 'insurance', 'deposits', 'bank failure', 'consumer news', 'loans'],
    },
    {
        id: 'zillow-research-001',
        name: 'Zillow Research',
        baseUrl: 'https://www.zillow.com/research',
        category: 'Finance',
        sourceType: 'Industry',
        trustScore: 85,
        tags: ['real estate', 'housing market', 'home values', 'rent', 'mortgage rates', 'housing data'],
    },

    // Family Law, Civil Rights & International Law
    {
        id: 'aclu-001',
        name: 'American Civil Liberties Union (ACLU)',
        baseUrl: 'https://www.aclu.org',
        category: 'Legal',
        sourceType: 'Industry',
        trustScore: 90,
        tags: ['civil rights', 'liberties', 'freedom', 'justice', 'impairment', 'discrimination', 'police'],
    },
    {
        id: 'hud-001',
        name: 'U.S. Dept of Housing and Urban Development (HUD)',
        baseUrl: 'https://www.hud.gov',
        category: 'Legal',
        sourceType: 'Government',
        trustScore: 98,
        tags: ['housing', 'discrimination', 'fair housing', 'eviction', 'tenant', 'landlord', 'rental help'],
    },
    {
        id: 'nolo-001',
        name: 'Nolo',
        baseUrl: 'https://www.nolo.com',
        category: 'Legal',
        sourceType: 'Industry',
        trustScore: 88,
        tags: ['legal guide', 'forms', 'divorce', 'wills', 'bankruptcy', 'small business', 'landlord-tenant'],
    },
    {
        id: 'un-law-001',
        name: 'United Nations - International Law',
        baseUrl: 'https://www.un.org/en/global-issues/international-law-and-justice',
        category: 'Legal',
        sourceType: 'Government',
        trustScore: 96,
        tags: ['international law', 'treaties', 'human rights', 'justice', 'global courts', 'convention'],
    },
    {
        id: 'ftc-legal-001',
        name: 'Federal Trade Commission (FTC)',
        baseUrl: 'https://www.ftc.gov',
        category: 'Legal',
        sourceType: 'Government',
        trustScore: 99,
        tags: ['consumer protection', 'fraud', 'privacy', 'identity theft', 'antitrust', 'scams'],
    },
    {
        id: 'legalzoom-articles-001',
        name: 'LegalZoom Info',
        baseUrl: 'https://www.legalzoom.com/articles',
        category: 'Legal',
        sourceType: 'Industry',
        trustScore: 80,
        tags: ['business law', 'estate planning', 'intellectual property', 'family law', 'contracts'],
    },
    {
        id: 'eeoc-001',
        name: 'Equal Employment Opportunity Commission',
        baseUrl: 'https://www.eeoc.gov',
        category: 'Legal',
        sourceType: 'Government',
        trustScore: 99,
        tags: ['employment law', 'discrimination', 'workplace rights', 'harassment', 'equal pay', 'hiring'],
    },
];

// Helper function to get sources by category
export function getSourcesByCategory(category: Category): Source[] {
    return trustGraph.filter((source) => source.category === category);
}

// Helper function to search sources by tags
export function searchSourcesByTags(category: Category, keywords: string[]): Source[] {
    const categoryMatches = trustGraph.filter((source) => source.category === category);

    if (keywords.length === 0) {
        return categoryMatches;
    }

    // Score each source by how many keywords match its tags
    const scored = categoryMatches.map((source) => {
        const lowerTags = source.tags.map((t) => t.toLowerCase());
        const matchCount = keywords.filter((kw) =>
            lowerTags.some((tag) => tag.includes(kw.toLowerCase()) || kw.toLowerCase().includes(tag))
        ).length;
        return { source, matchCount };
    });

    // Sort by match count (descending), then by trust score (descending)
    scored.sort((a, b) => {
        if (b.matchCount !== a.matchCount) {
            return b.matchCount - a.matchCount;
        }
        return b.source.trustScore - a.source.trustScore;
    });

    // Return sources that have at least one match, or top sources if no matches
    const matched = scored.filter((s) => s.matchCount > 0).map((s) => s.source);

    if (matched.length > 0) {
        return matched;
    }

    // Fallback: return top sources by trust score for the category
    return categoryMatches.sort((a, b) => b.trustScore - a.trustScore).slice(0, 3);
}
