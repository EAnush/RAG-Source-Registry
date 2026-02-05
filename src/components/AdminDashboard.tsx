import { useState, useEffect } from 'react';
import './AdminDashboard.css';

interface Source {
    id: string;
    name: string;
    baseUrl: string;
    category: string;
    sourceType: string;
    trustScore?: number;
    tags: string[];
}

interface AdminDashboardProps {
    token: string;
    onLogout: () => void;
}

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

export function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
    const [sources, setSources] = useState<Source[]>([]);
    const [categories, setCategories] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [editingId, setEditingId] = useState<string | null>(null);
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [category, setCategory] = useState('');
    const [score, setScore] = useState<string>('');
    const [tags, setTags] = useState('');

    // Fetch sources and categories on mount
    useEffect(() => {
        fetchSources();
        fetchCategories();
    }, [token]);

    const fetchSources = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_BASE_URL}/api/admin/sources`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.sources) {
                setSources(data.sources);
            }
        } catch (err) {
            setError('Failed to load sources');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/categories`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.categories) {
                setCategories(data.categories);
            }
        } catch (err) {
            // Silently fail - categories are just for autocomplete
        }
    };

    const resetForm = () => {
        setEditingId(null);
        setName('');
        setUrl('');
        setCategory('');
        setScore('');
        setTags('');
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const sourceData = {
                name,
                baseUrl: url,
                category,
                sourceType: 'Custom',
                trustScore: score ? Number(score) : undefined,
                tags: tags ? tags.split(',').map((t) => t.trim()) : [],
            };

            const isEditing = !!editingId;
            const endpoint = isEditing
                ? `${API_BASE_URL}/api/admin/sources/${editingId}`
                : `${API_BASE_URL}/api/admin/sources`;

            const res = await fetch(endpoint, {
                method: isEditing ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(sourceData),
            });

            if (res.ok) {
                resetForm();
                fetchSources();
                fetchCategories(); // Refresh categories in case a new one was added
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to save source');
            }
        } catch (err) {
            alert('Error saving source');
        }
    };

    const handleEdit = (source: Source) => {
        setEditingId(source.id);
        setName(source.name);
        setUrl(source.baseUrl);
        setCategory(source.category);
        setScore(source.trustScore?.toString() || '');
        setTags(source.tags?.join(', ') || '');

        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this source?')) return;

        // Optimistic update
        setSources(sources.filter((s) => s.id !== id));

        const res = await fetch(`${API_BASE_URL}/api/admin/sources/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
            // Revert on failure
            fetchSources();
            alert('Failed to delete source');
        }
    };

    return (
        <div className="admin-dashboard animate-fade-in">
            <header className="admin-header">
                <h2>🛡️ Trust Graph Admin</h2>
                <button onClick={onLogout} className="logout-btn">
                    Logout
                </button>
            </header>

            {/* Add/Edit Source Form */}
            <div className="admin-panel">
                <h3>{editingId ? '✏️ Edit Source' : '➕ Add New Trusted Source'}</h3>
                <form onSubmit={handleSubmit} className="add-source-form">
                    <div className="form-row">
                        <input
                            placeholder="Source Name (e.g. My Medical Journal)"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <input
                            placeholder="Base URL (e.g. https://journal.com)"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-row">
                        <input
                            list="category-suggestions"
                            placeholder="Category (e.g. Health, Finance, Crypto...)"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            required
                        />
                        <datalist id="category-suggestions">
                            {categories.map((cat) => (
                                <option key={cat} value={cat} />
                            ))}
                        </datalist>
                        <input
                            type="number"
                            placeholder="Trust Score (optional, 0-100)"
                            value={score}
                            onChange={(e) => setScore(e.target.value)}
                            min="0"
                            max="100"
                        />
                    </div>
                    <input
                        placeholder="Tags (comma separated, e.g. crypto, bitcoin, news)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="full-width"
                    />
                    <div className="form-actions">
                        <button type="submit" className="add-btn">
                            {editingId ? '💾 Save Changes' : '+ Add to Trust Graph'}
                        </button>
                        {editingId && (
                            <button type="button" className="cancel-btn" onClick={resetForm}>
                                Cancel
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Source List */}
            <div className="admin-panel">
                <h3>Active Sources ({sources.length})</h3>
                {loading ? (
                    <p>Loading...</p>
                ) : sources.length === 0 ? (
                    <div className="empty-state">
                        <p>No sources yet. Add your first trusted source above!</p>
                    </div>
                ) : (
                    <div className="source-table-container">
                        <table className="source-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Score</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sources.map((s) => (
                                    <tr key={s.id}>
                                        <td>
                                            <div className="source-name-cell">
                                                <strong>{s.name}</strong>
                                                <small>{s.baseUrl}</small>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="category-badge dynamic">
                                                {s.category}
                                            </span>
                                        </td>
                                        <td>{s.trustScore ?? '—'}</td>
                                        <td className="action-buttons">
                                            <button
                                                onClick={() => handleEdit(s)}
                                                className="edit-btn"
                                                title="Edit Source"
                                            >
                                                ✏️
                                            </button>
                                            <button
                                                onClick={() => handleDelete(s.id)}
                                                className="delete-btn"
                                                title="Delete Source"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
