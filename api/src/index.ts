// Trust Layer API - Main Server Entry Point
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import queryRouter from './routes/query.js';
import redirectRouter from './routes/redirect.js';
import adminRouter from './routes/admin.js';
import { checkLlmHealth } from './services/llmService.js';
import { trustGraph } from './data/trustGraph.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, _res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});

// ROUTING STRATEGY:
// Create a router that handles the core logic, then mount it at BOTH
// '/api' (for local dev and explicit calls) AND '/' (for Vercel serverless where paths might be rewritten/stripped).
const apiRouter = express.Router();

apiRouter.use('/query', queryRouter);
apiRouter.use('/redirect', redirectRouter);
apiRouter.use('/admin', adminRouter);

apiRouter.get('/health', async (_req, res) => {
    const llmStatus = await checkLlmHealth();

    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        services: {
            api: true,
            llm: llmStatus,
            trustGraph: {
                loaded: true,
                sourceCount: trustGraph.length,
                categories: ['Health', 'Finance', 'Legal'],
            },
        },
    });
});

apiRouter.get('/', (_req, res) => {
    res.json({
        name: 'Trust Layer API',
        version: '1.0.0-mvp',
        description: 'Source Recommendation API for Enterprise AI - The Data Firewall',
        endpoints: {
            query: 'GET /query?q=your+query',
            redirect: 'GET /redirect?token=jwt_token',
            health: 'GET /health',
            accessLog: 'GET /redirect/log',
        },
    });
});

// Dual-Mount Strategy
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Error handling middleware
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[Error]', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message,
    });
});

// Start server
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    TRUST LAYER API                        ║
║                  The Data Firewall for AI                 ║
╠═══════════════════════════════════════════════════════════╣
║  Server running on: http://localhost:${PORT}                 ║
║  Sources loaded: ${trustGraph.length} verified sources                    ║
║  Categories: Health, Finance, Legal                       ║
╠═══════════════════════════════════════════════════════════╣
║  Endpoints:                                               ║
║  • GET /api/query?q=your+query     - Query sources        ║
║  • GET /api/redirect?token=...     - Resolve masked URL   ║
║  • GET /api/health                 - Service health       ║
╚═══════════════════════════════════════════════════════════╝
    `);

        // Check LLM on startup
        checkLlmHealth().then((healthy) => {
            if (healthy) {
                console.log('✓ Groq LLM service is configured');
            } else {
                console.log('⚠ Warning: GROQ_API_KEY is missing');
            }
        });
    });
}

export default app;
