// Redirect Route - Masked URL Resolution
import { Router, Request, Response } from 'express';
import { verifyToken, TokenPayload } from '../services/jwtService.js';

const router = Router();

// Access log storage (in-memory for MVP)
interface AccessLogEntry {
    timestamp: Date;
    sourceId: string;
    sourceUrl: string;
    query: string;
    category: string;
    userAgent?: string;
    ip?: string;
}

const accessLog: AccessLogEntry[] = [];

/**
 * GET /api/redirect
 * Resolves masked URLs and redirects to actual trusted sources
 * 
 * Query params:
 *   - token: The JWT token containing the source information
 * 
 * Returns: HTTP 302 redirect to the actual source URL
 */
router.get('/', (req: Request, res: Response) => {
    const token = req.query.token as string;

    if (!token) {
        return res.status(400).json({
            error: 'Missing token',
            details: 'Please provide a valid token parameter',
        });
    }

    try {
        // Verify and decode the token
        const payload: TokenPayload = verifyToken(token);

        // Log the access (audit trail)
        const logEntry: AccessLogEntry = {
            timestamp: new Date(),
            sourceId: payload.sourceId,
            sourceUrl: payload.sourceUrl,
            query: payload.query,
            category: payload.category,
            userAgent: req.get('User-Agent'),
            ip: req.ip,
        };

        accessLog.push(logEntry);

        console.log(`[Redirect] Access logged:`, {
            sourceId: payload.sourceId,
            query: payload.query,
            category: payload.category,
            timestamp: logEntry.timestamp.toISOString(),
        });

        // Perform the redirect
        return res.redirect(302, payload.sourceUrl);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.log(`[Redirect] Token verification failed: ${errorMessage}`);

        return res.status(401).json({
            error: 'Invalid or expired token',
            details: errorMessage,
        });
    }
});

/**
 * GET /api/redirect/log
 * Debug endpoint to view the access log
 * (In production, this would be protected and stored in a database)
 */
router.get('/log', (_req: Request, res: Response) => {
    res.json({
        totalAccesses: accessLog.length,
        entries: accessLog.slice(-50), // Last 50 entries
    });
});

export default router;
