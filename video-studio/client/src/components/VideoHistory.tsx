import { useState, useEffect } from 'react';
import { VideoHistoryEntry } from '../types';
import { getHistoryPaginated, deleteHistoryEntry, getHistoryStats } from '../utils/videoHistory';
import { formatFileSize } from '../utils/templateRenderer';

export default function VideoHistory() {
  const [history, setHistory] = useState<VideoHistoryEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'duration'>('date');
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    loadHistory();
    loadStats();
  }, [page, search, sortBy]);

  const loadHistory = () => {
    const result = getHistoryPaginated({
      page,
      limit: 10,
      search,
      sortBy,
      order: 'desc'
    });
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
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.title}>Video History</h2>
        
        {stats && (
          <div style={s.stats}>
            <div style={s.stat}>
              <div style={s.statVal}>{stats.totalVideos}</div>
              <div style={s.statLbl}>Total Videos</div>
            </div>
            <div style={s.stat}>
              <div style={s.statVal}>{stats.averageDuration.toFixed(1)}s</div>
              <div style={s.statLbl}>Avg Duration</div>
            </div>
            {stats.mostUsedTemplate && (
              <div style={s.stat}>
                <div style={s.statVal}>{stats.mostUsedTemplate.count}</div>
                <div style={s.statLbl}>{stats.mostUsedTemplate.name}</div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={s.controls}>
        <input
          type="text"
          placeholder="Search videos..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          style={s.search}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          style={s.select}
        >
          <option value="date">Sort by Date</option>
          <option value="title">Sort by Title</option>
          <option value="duration">Sort by Duration</option>
        </select>
      </div>

      <div style={s.list}>
        {history.map(entry => (
          <div key={entry.id} style={s.card}>
            <div style={s.cardContent}>
              <div style={s.cardHeader}>
                <h3 style={s.cardTitle}>{entry.title}</h3>
                <span style={s.date}>{new Date(entry.createdAt).toLocaleDateString()}</span>
              </div>
              
              {entry.prompt && (
                <p style={s.prompt}>"{entry.prompt}"</p>
              )}
              
              {entry.templateName && (
                <div style={s.badge}>📋 {entry.templateName}</div>
              )}

              <div style={s.meta}>
                <span>📐 {entry.metadata.resolution.width}x{entry.metadata.resolution.height}</span>
                <span>🎬 {entry.metadata.fps} fps</span>
                <span>⏱️ {entry.metadata.duration}s</span>
                <span>💾 {formatFileSize(entry.metadata.fileSize)}</span>
              </div>
            </div>

            <div style={s.actions}>
              <a href={entry.videoUrl} target="_blank" rel="noopener noreferrer" style={s.btnView}>
                👁️ View
              </a>
              <a href={entry.videoUrl} download style={s.btnDownload}>
                📥 Download
              </a>
              <button onClick={() => handleDelete(entry.id)} style={s.btnDelete}>
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {history.length === 0 && (
        <div style={s.empty}>
          <div style={s.emptyIcon}>📹</div>
          <p style={s.emptyText}>No videos in history yet</p>
          <p style={s.emptyHint}>Generated videos will appear here</p>
        </div>
      )}

      {totalPages > 1 && (
        <div style={s.pagination}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            style={page === 1 ? s.btnPageDisabled : s.btnPage}
          >
            ← Previous
          </button>
          <span style={s.pageInfo}>Page {page} of {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={page === totalPages ? s.btnPageDisabled : s.btnPage}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

const s = {
  container: { padding: '1rem' },
  header: { marginBottom: '2rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#f1f5f9' },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
    gap: '1rem',
    marginTop: '1rem'
  },
  stat: {
    padding: '1rem',
    background: 'linear-gradient(135deg, #1a1a24, #12121a)',
    border: '1px solid #2a2a3a',
    borderRadius: '12px',
    textAlign: 'center' as const
  },
  statVal: { fontSize: '1.8rem', fontWeight: 700, color: '#6366f1', marginBottom: '0.25rem' },
  statLbl: { fontSize: '0.8rem', color: '#64748b' },
  controls: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap' as const
  },
  search: {
    flex: 1,
    minWidth: '200px',
    padding: '0.75rem 1rem',
    background: '#0f0f15',
    border: '1px solid #2a2a3a',
    borderRadius: '10px',
    color: '#f1f5f9',
    fontSize: '0.95rem',
    outline: 'none'
  } as React.CSSProperties,
  select: {
    padding: '0.75rem 1rem',
    background: '#0f0f15',
    border: '1px solid #2a2a3a',
    borderRadius: '10px',
    color: '#f1f5f9',
    fontSize: '0.95rem',
    outline: 'none',
    cursor: 'pointer'
  } as React.CSSProperties,
  list: { display: 'flex', flexDirection: 'column' as const, gap: '1rem' },
  card: {
    background: 'linear-gradient(135deg, #1a1a24, #12121a)',
    border: '1px solid #2a2a3a',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: '1rem',
    flexWrap: 'wrap' as const
  },
  cardContent: { flex: 1, minWidth: '250px' },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem', gap: '1rem' },
  cardTitle: { fontSize: '1.1rem', fontWeight: 600, color: '#f1f5f9', margin: 0 },
  date: { fontSize: '0.85rem', color: '#64748b', whiteSpace: 'nowrap' as const },
  prompt: { fontSize: '0.9rem', color: '#94a3b8', fontStyle: 'italic', marginBottom: '0.75rem', lineHeight: 1.4 },
  badge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    background: 'rgba(99,102,241,0.2)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '6px',
    fontSize: '0.8rem',
    color: '#c7d2fe',
    marginBottom: '0.75rem'
  },
  meta: {
    display: 'flex',
    gap: '1rem',
    fontSize: '0.85rem',
    color: '#64748b',
    flexWrap: 'wrap' as const
  },
  actions: { display: 'flex', gap: '0.5rem', flexWrap: 'wrap' as const },
  btnView: {
    padding: '0.5rem 1rem',
    background: '#1a1a24',
    border: '1px solid #2a2a3a',
    borderRadius: '8px',
    color: '#94a3b8',
    fontSize: '0.85rem',
    cursor: 'pointer',
    textDecoration: 'none',
    whiteSpace: 'nowrap' as const
  },
  btnDownload: {
    padding: '0.5rem 1rem',
    background: 'linear-gradient(135deg, #10b981, #059669)',
    border: 'none',
    borderRadius: '8px',
    color: 'white',
    fontSize: '0.85rem',
    cursor: 'pointer',
    textDecoration: 'none',
    whiteSpace: 'nowrap' as const
  },
  btnDelete: {
    padding: '0.5rem 0.75rem',
    background: 'rgba(239,68,68,0.2)',
    border: '1px solid rgba(239,68,68,0.3)',
    borderRadius: '8px',
    color: '#fca5a5',
    fontSize: '0.85rem',
    cursor: 'pointer'
  },
  empty: { textAlign: 'center' as const, padding: '3rem 1rem' },
  emptyIcon: { fontSize: '4rem', marginBottom: '1rem' },
  emptyText: { fontSize: '1.2rem', color: '#94a3b8', marginBottom: '0.5rem' },
  emptyHint: { fontSize: '0.9rem', color: '#64748b' },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '1rem',
    marginTop: '2rem'
  },
  btnPage: {
    padding: '0.5rem 1rem',
    background: '#1a1a24',
    border: '1px solid #2a2a3a',
    borderRadius: '8px',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.9rem'
  },
  btnPageDisabled: {
    padding: '0.5rem 1rem',
    background: '#0f0f15',
    border: '1px solid #1a1a24',
    borderRadius: '8px',
    color: '#475569',
    cursor: 'not-allowed',
    fontSize: '0.9rem'
  },
  pageInfo: { color: '#94a3b8', fontSize: '0.9rem' }
};
