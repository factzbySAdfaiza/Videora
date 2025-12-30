import { useState, useEffect } from 'react';
import { VideoHistoryEntry } from '../types';
import { getHistoryPaginated, deleteHistoryEntry, getHistoryStats } from '../utils/videoHistory';
import { formatFileSize } from '../utils/templateRenderer';

export default function VideoHistoryPanel() {
    const [history, setHistory] = useState<VideoHistoryEntry[]>([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [search, setSearch] = useState('');
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        loadHistory();
        loadStats();
    }, [page, search]);

    const loadHistory = () => {
        const result = getHistoryPaginated({ page, limit: 8, search, sortBy: 'date', order: 'desc' });
        setHistory(result.items);
        setTotalPages(result.totalPages);
    };

    const loadStats = () => {
        setStats(getHistoryStats());
    };

    const handleDelete = (id: string) => {
        if (confirm('Delete this video from history?')) {
            deleteHistoryEntry(id);
            loadHistory();
            loadStats();
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>History</h1>
                    <p style={styles.subtitle}>Your generated videos</p>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div style={styles.statsGrid}>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>🎬</div>
                        <div style={styles.statInfo}>
                            <div style={styles.statValue}>{stats.totalVideos}</div>
                            <div style={styles.statLabel}>Total Videos</div>
                        </div>
                    </div>
                    <div style={styles.statCard}>
                        <div style={styles.statIcon}>⏱️</div>
                        <div style={styles.statInfo}>
                            <div style={styles.statValue}>{stats.averageDuration.toFixed(1)}s</div>
                            <div style={styles.statLabel}>Avg Duration</div>
                        </div>
                    </div>
                    {stats.mostUsedTemplate && (
                        <div style={styles.statCard}>
                            <div style={styles.statIcon}>⭐</div>
                            <div style={styles.statInfo}>
                                <div style={styles.statValue}>{stats.mostUsedTemplate.count}</div>
                                <div style={styles.statLabel}>{stats.mostUsedTemplate.name}</div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Search */}
            <div style={styles.searchBar}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                    type="text"
                    placeholder="Search videos..."
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                    style={styles.searchInput}
                />
            </div>

            {/* Video List */}
            <div style={styles.list}>
                {history.map(entry => (
                    <div key={entry.id} style={styles.videoCard}>
                        <div style={styles.videoPreview}>
                            <div style={styles.playIcon}>▶</div>
                        </div>
                        <div style={styles.videoInfo}>
                            <h3 style={styles.videoTitle}>{entry.title}</h3>
                            {entry.prompt && (
                                <p style={styles.videoPrompt}>"{entry.prompt.substring(0, 60)}..."</p>
                            )}
                            <div style={styles.videoMeta}>
                                <span>{entry.metadata.resolution.width}×{entry.metadata.resolution.height}</span>
                                <span>•</span>
                                <span>{entry.metadata.fps} fps</span>
                                <span>•</span>
                                <span>{entry.metadata.duration}s</span>
                            </div>
                        </div>
                        <div style={styles.videoActions}>
                            <a href={entry.videoUrl} target="_blank" rel="noopener noreferrer" style={styles.actionBtn}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                            </a>
                            <a href={entry.videoUrl} download style={styles.actionBtn}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                                </svg>
                            </a>
                            <button onClick={() => handleDelete(entry.id)} style={styles.deleteBtn}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                                </svg>
                            </button>
                        </div>
                        <div style={styles.videoDate}>
                            {new Date(entry.createdAt).toLocaleDateString()}
                        </div>
                    </div>
                ))}
            </div>

            {history.length === 0 && (
                <div style={styles.empty}>
                    <div style={styles.emptyIcon}>📹</div>
                    <p style={styles.emptyText}>No videos yet</p>
                    <p style={styles.emptyHint}>Generated videos will appear here</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div style={styles.pagination}>
                    <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        style={page === 1 ? styles.pageDisabled : styles.pageBtn}
                    >
                        ← Previous
                    </button>
                    <span style={styles.pageInfo}>Page {page} of {totalPages}</span>
                    <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        style={page === totalPages ? styles.pageDisabled : styles.pageBtn}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        maxWidth: '1000px',
        margin: '0 auto'
    },
    header: {
        marginBottom: '32px'
    },
    title: {
        fontSize: '36px',
        fontWeight: 700,
        margin: 0,
        background: 'linear-gradient(135deg, #fafafa, #a1a1aa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    },
    subtitle: {
        fontSize: '16px',
        color: '#71717a',
        marginTop: '8px'
    },
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px',
        marginBottom: '28px'
    },
    statCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '20px',
        background: 'rgba(24, 24, 27, 0.6)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
    },
    statIcon: {
        fontSize: '28px'
    },
    statInfo: {},
    statValue: {
        fontSize: '24px',
        fontWeight: 700,
        color: '#fafafa'
    },
    statLabel: {
        fontSize: '13px',
        color: '#71717a'
    },
    searchBar: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 20px',
        background: 'rgba(24, 24, 27, 0.6)',
        backdropFilter: 'blur(20px)',
        borderRadius: '14px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        marginBottom: '20px'
    },
    searchInput: {
        flex: 1,
        background: 'transparent',
        border: 'none',
        outline: 'none',
        color: '#fafafa',
        fontSize: '15px'
    },
    list: {
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
    },
    videoCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '20px',
        padding: '20px',
        background: 'rgba(24, 24, 27, 0.6)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)'
    },
    videoPreview: {
        width: '80px',
        height: '60px',
        background: 'linear-gradient(135deg, #1e293b, #334155)',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
    },
    playIcon: {
        color: '#71717a',
        fontSize: '18px'
    },
    videoInfo: {
        flex: 1,
        minWidth: 0
    },
    videoTitle: {
        fontSize: '15px',
        fontWeight: 600,
        color: '#fafafa',
        margin: '0 0 4px 0',
        whiteSpace: 'nowrap' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis'
    },
    videoPrompt: {
        fontSize: '13px',
        color: '#71717a',
        margin: '0 0 8px 0',
        fontStyle: 'italic'
    },
    videoMeta: {
        display: 'flex',
        gap: '8px',
        fontSize: '12px',
        color: '#52525b'
    },
    videoActions: {
        display: 'flex',
        gap: '8px'
    },
    actionBtn: {
        padding: '10px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '10px',
        color: '#a1a1aa',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        textDecoration: 'none'
    },
    deleteBtn: {
        padding: '10px',
        background: 'rgba(239, 68, 68, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        borderRadius: '10px',
        color: '#f87171',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    videoDate: {
        fontSize: '12px',
        color: '#52525b',
        whiteSpace: 'nowrap' as const
    },
    empty: {
        textAlign: 'center' as const,
        padding: '60px 20px'
    },
    emptyIcon: {
        fontSize: '48px',
        marginBottom: '16px'
    },
    emptyText: {
        fontSize: '18px',
        color: '#a1a1aa',
        margin: '0 0 8px 0'
    },
    emptyHint: {
        fontSize: '14px',
        color: '#52525b',
        margin: 0
    },
    pagination: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        gap: '16px',
        marginTop: '28px'
    },
    pageBtn: {
        padding: '10px 20px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '10px',
        color: '#a1a1aa',
        fontSize: '14px',
        cursor: 'pointer'
    },
    pageDisabled: {
        padding: '10px 20px',
        background: 'transparent',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: '10px',
        color: '#3f3f46',
        fontSize: '14px',
        cursor: 'not-allowed'
    },
    pageInfo: {
        fontSize: '14px',
        color: '#71717a'
    }
};
