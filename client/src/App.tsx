import { useState, useEffect, type FormEvent } from 'react';
import './App.css';

// Types matching the backend API
interface TranslationData {
  category: string;
  keywords: string[];
}

interface SourceItem {
  name: string;
  sourceType: string;
  trustScore: number;
  maskedUrl: string;
}

interface SourceManifest {
  query: string;
  translation: TranslationData;
  sources: SourceItem[];
  signature: string;
}

interface HealthStatus {
  status: string;
  services: {
    api: boolean;
    ollama: boolean;
    trustGraph: {
      loaded: boolean;
      sourceCount: number;
    };
  };
}

interface ErrorState {
  error: string;
  details?: string;
}

const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3001';

function App() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<SourceManifest | null>(null);
  const [error, setError] = useState<ErrorState | null>(null);
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [healthChecking, setHealthChecking] = useState(true);

  // Check API health on mount
  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    setHealthChecking(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/health`);
      const data = await response.json();
      setHealth(data);
    } catch {
      setHealth(null);
    } finally {
      setHealthChecking(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/query?q=${encodeURIComponent(query)}`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data as ErrorState);
      } else {
        setResult(data as SourceManifest);
      }
    } catch (err) {
      setError({
        error: 'Connection failed',
        details: 'Could not connect to the Trust Layer API. Make sure the server is running on port 3001.',
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryClass = (category: string): string => {
    return category.toLowerCase();
  };

  return (
    <div className="app">
      <div className="container">
        {/* Header */}
        <header className="header">
          <h1>
            <span className="gradient-text">Trust Layer</span> Debug Console
          </h1>
          <p className="subtitle">The Data Firewall for Enterprise AI</p>
          <span className="badge">MVP v1.0.0</span>
        </header>

        {/* Health Status */}
        <div className="health-status">
          <span
            className={`status-dot ${healthChecking
              ? 'checking'
              : health?.services.api
                ? 'online'
                : 'offline'
              }`}
          />
          <span>
            API: {healthChecking ? 'Checking...' : health ? 'Connected' : 'Offline'}
          </span>
          {health && (
            <>
              <span style={{ color: 'var(--text-muted)' }}>|</span>
              <span
                className={`status-dot ${health.services.ollama ? 'online' : 'offline'}`}
              />
              <span>
                Ollama: {health.services.ollama ? 'Ready' : 'Not Connected'}
              </span>
              <span style={{ color: 'var(--text-muted)' }}>|</span>
              <span style={{ color: 'var(--text-muted)' }}>
                Trust Graph: {health.services.trustGraph.sourceCount} sources
              </span>
            </>
          )}
        </div>

        {/* Search Section */}
        <section className="search-section">
          <form onSubmit={handleSubmit} className="search-container">
            <input
              type="text"
              className="search-input"
              placeholder="Ask a question... e.g., 'What are the symptoms of heart disease?'"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              className="search-button"
              disabled={loading || !query.trim()}
            >
              {loading ? (
                <>
                  <span className="animate-spin">⟳</span>
                  Translating...
                </>
              ) : (
                <>🔍 Query</>
              )}
            </button>
          </form>
        </section>

        {/* Results Grid */}
        <div className="results-grid">
          {/* Left Panel - AI Translation */}
          <div className="panel">
            <div className="panel-header">
              <span className="icon">🧠</span>
              <h3>Qwen Translation</h3>
            </div>
            <div className="panel-content">
              {loading && (
                <div className="loading-state">
                  <div className="loading-spinner" />
                  <span>Analyzing query with Qwen2.5...</span>
                </div>
              )}

              {!loading && !result && !error && (
                <div className="empty-state">
                  <div className="icon">💬</div>
                  <p>Enter a query to see how the AI translates it</p>
                </div>
              )}

              {error && (
                <div className="error-state">
                  <h4>⚠️ {error.error}</h4>
                  {error.details && <p>{error.details}</p>}
                </div>
              )}

              {result && (
                <div className="translation-output animate-fade-in">
                  <span
                    className={`category-badge ${getCategoryClass(
                      result.translation.category
                    )}`}
                  >
                    📁 {result.translation.category}
                  </span>

                  <div>
                    <strong style={{ color: 'var(--text-secondary)' }}>
                      Extracted Keywords:
                    </strong>
                    <div className="keywords-list">
                      {result.translation.keywords.map((kw, i) => (
                        <span key={i} className="keyword-tag">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ marginTop: '16px' }}>
                    <strong style={{ color: 'var(--text-secondary)' }}>
                      Original Query:
                    </strong>
                    <p
                      style={{
                        color: 'var(--text-muted)',
                        fontStyle: 'italic',
                        marginTop: '4px',
                      }}
                    >
                      "{result.query}"
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Trusted Sources */}
          <div className="panel">
            <div className="panel-header">
              <span className="icon">🛡️</span>
              <h3>Trusted Source Manifest</h3>
            </div>
            <div className="panel-content">
              {loading && (
                <div className="loading-state">
                  <div className="loading-spinner" />
                  <span>Searching Trust Graph...</span>
                </div>
              )}

              {!loading && !result && !error && (
                <div className="empty-state">
                  <div className="icon">📋</div>
                  <p>Verified sources will appear here</p>
                </div>
              )}

              {error && (
                <div className="empty-state">
                  <div className="icon">⚠️</div>
                  <p>No sources available</p>
                </div>
              )}

              {result && result.sources.length > 0 && (
                <div className="animate-fade-in">
                  {result.sources.map((source, i) => (
                    <div key={i} className="source-card">
                      <div className="source-header">
                        <span className="source-name">{source.name}</span>
                        <span className="trust-score">
                          ✓ {source.trustScore}/100
                        </span>
                      </div>
                      <div className="source-type">{source.sourceType}</div>
                      <a
                        href={source.maskedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="masked-url"
                      >
                        🔗 {source.maskedUrl.substring(0, 60)}...
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Signature Section */}
        {result && (
          <div className="signature-section animate-fade-in">
            <h4>🔐 Cryptographic Audit Signature</h4>
            <div className="signature-value">{result.signature}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
