import { useState, useEffect } from 'react';
import './AdminDashboard.css';

interface Source {
    id: string;
    name: string;
    baseUrl: string;
    category: 'Health' | 'Finance' | 'Legal';
    sourceType: string;
    trustScore: number;
    tags: string[];
}

interface AdminDashboardProps {
    token: string;
    onLogout: () => void;
}

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

export function AdminDashboard({ token, onLogout }: AdminDashboardProps) {
    const [sources, setSources] = useState<Source[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [name, setName] = useState('');
    const [url, setUrl] = useState('');
    const [category, setCategory] = useState('Health');
    const [score, setScore] = useState(80);
    const [tags, setTags] = useState('');

    // Fetch sources on mount
    useEffect(() => {
        fetchSources();
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

    const handleAddSource = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const newSource = {
                name,
                baseUrl: url,
                category,
                sourceType: 'Custom',
                trustScore: Number(score),
                tags: tags.split(',').map((t) => t.trim()),
            };

            const res = await fetch(`${API_BASE_URL}/api/admin/sources`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(newSource),
            });

            if (res.ok) {
                // Reset form and reload
                setName('');
                setUrl('');
                setTags('');
                fetchSources();
            } else {
                alert('Failed to add source');
            }
        } catch (err) {
            alert('Error adding source');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this source?')) return;

        // Optimistic update
        setSources(sources.filter((s) => s.id !== id));

        await fetch(`${API_BASE_URL}/api/admin/sources/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
    };

    return (
        <div className="admin-dashboard animate-fade-in">
            <header className="admin-header">
                <h2>🛡️ Trust Graph Admin</h2>
                <button onClick={onLogout} className="logout-btn">
                    Logout
                </button>
            </header>

            {/* Add Source Form */}
            <div className="admin-panel">
                <h3>Add New Trusted Source</h3>
                <form onSubmit={handleAddSource} className="add-source-form">
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
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="Health">Health</option>
                            <option value="Finance">Finance</option>
                            <option value="Legal">Legal</option>
                        </select>
                        <input
                            type="number"
                            placeholder="Trust Score (0-100)"
                            value={score}
                            onChange={(e) => setScore(Number(e.target.value))}
                            min="0"
                            max="100"
                        />
                    </div>
                    <input
                        placeholder="Tags (comma separated, e.g. crypto, bitcoin, news)"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        required
                        className="full-width"
                    />
                    <button type="submit" className="add-btn">
                        + Add to Trust Graph
                    </button>
                </form>
            </div>

            {/* Source List */}
            <div className="admin-panel">
                <h3>Active Sources ({sources.length})</h3>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="source-table-container">
                        <table className="source-table">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Category</th>
                                    <th>Score</th>
                                    <th>Action</th>
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
                                            <span className={`category-badge ${s.category.toLowerCase()}`}>
                                                {s.category}
                                            </span>
                                        </td>
                                        <td>{s.trustScore}</td>
                                        <td>
                                            <button
                                                onClick={() => handleDelete(s.id)}
                                                className="delete-btn"
                                                disabled={s.id.startsWith('custom_') === false} // Only delete custom sources for now
                                                title={s.id.startsWith('custom_') ? 'Delete Source' : 'Cannot delete hardcoded sources'}
                                            >
                                                {s.id.startsWith('custom_') ? '🗑️' : '🔒'}
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
