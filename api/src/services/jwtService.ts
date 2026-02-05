// JWT Signing Service - Cryptographic Audit Trail
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'trust-layer-mvp-secret-key';
const TOKEN_EXPIRY = '1h'; // Tokens expire after 1 hour

export interface TokenPayload {
    sourceId: string;
    sourceUrl: string;
    query: string;
    category: string;
    timestamp: number;
}

export interface SignedToken {
    token: string;
    maskedUrl: string;
}

/**
 * Generate a signed JWT token for a source access
 * This creates the cryptographic audit trail
 */
export function signSourceAccess(
    sourceId: string,
    sourceUrl: string,
    query: string,
    category: string,
    baseApiUrl: string
): SignedToken {
    const payload: TokenPayload = {
        sourceId,
        sourceUrl,
        query,
        category,
        timestamp: Date.now(),
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });

    return {
        token,
        maskedUrl: `${baseApiUrl}/redirect?token=${encodeURIComponent(token)}`,
    };
}

/**
 * Verify and decode a token
 * Returns the payload if valid, throws if invalid
 */
export function verifyToken(token: string): TokenPayload {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        return decoded;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw new Error('Token expired');
        } else if (error instanceof jwt.JsonWebTokenError) {
            throw new Error('Invalid token');
        }
        throw error;
    }
}

/**
 * Generate a manifest-level signature for the entire response
 * This proves the entire response came from our system
 */
export function signManifest(
    query: string,
    translation: object,
    sources: object[]
): string {
    const manifestData = { query, translation, sources };
    return jwt.sign(
        { manifest: JSON.stringify(manifestData), timestamp: Date.now() },
        JWT_SECRET,
        { expiresIn: TOKEN_EXPIRY }
    );
}
