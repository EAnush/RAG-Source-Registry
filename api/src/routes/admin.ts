import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { SourceStore } from '../services/store.js';
import { Source } from '../data/trustGraph.js';

const router = Router();
const ADMIN_PASSWORD = 'llmreserve';
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Middleware to verify Admin Token
const requireAdmin = (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = authHeader.split(' ')[1];
    try {
        jwt.verify(token, JWT_SECRET);
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
    }
};

// POST /api/admin/login
router.post('/login', (req, res) => {
    const { password } = req.body;
    if (password === ADMIN_PASSWORD) {
        const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
        return res.json({ success: true, token });
    }
    return res.status(401).json({ error: 'Invalid password' });
});

// GET /api/admin/sources - Get all sources
router.get('/sources', requireAdmin, async (_req, res) => {
    const sources = await SourceStore.getAllSources();
    res.json({ sources });
});

// GET /api/admin/categories - Get unique categories for autocomplete
router.get('/categories', requireAdmin, async (_req, res) => {
    const categories = await SourceStore.getCategories();
    res.json({ categories });
});

// POST /api/admin/sources - Add new source
router.post('/sources', requireAdmin, async (req, res) => {
    try {
        const newSource: Source = req.body;

        // Basic validation
        if (!newSource.name || !newSource.baseUrl || !newSource.category) {
            return res.status(400).json({ error: 'Missing required fields: name, baseUrl, category' });
        }

        // Assign ID if missing
        if (!newSource.id) {
            newSource.id = 'src_' + Date.now();
        }

        // Default tags to empty array if not provided
        if (!newSource.tags) {
            newSource.tags = [];
        }

        // Default sourceType if not provided
        if (!newSource.sourceType) {
            newSource.sourceType = 'Custom';
        }

        await SourceStore.addSource(newSource);
        res.json({ success: true, source: newSource });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /api/admin/sources/:id - Update existing source
router.put('/sources/:id', requireAdmin, async (req, res) => {
    try {
        const updated = await SourceStore.updateSource(req.params.id, req.body);

        if (!updated) {
            return res.status(404).json({ error: 'Source not found' });
        }

        res.json({ success: true, source: updated });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/admin/sources/:id - Delete any source
router.delete('/sources/:id', requireAdmin, async (req, res) => {
    try {
        const deleted = await SourceStore.removeSource(req.params.id);

        if (!deleted) {
            return res.status(404).json({ error: 'Source not found' });
        }

        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
