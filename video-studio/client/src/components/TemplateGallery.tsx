import { useState } from 'react';
import { Template, TemplateCategory } from '../types';
import { VIDEO_TEMPLATES, searchTemplates } from '../data/templates';

interface TemplateGalleryProps {
    onSelect: (template: Template) => void;
}

const categoryIcons: Record<string, string> = {
    [TemplateCategory.SOCIAL_MEDIA]: '📱',
    [TemplateCategory.MARKETING]: '📢',
    [TemplateCategory.EDUCATION]: '📚',
    [TemplateCategory.BUSINESS]: '💼',
    [TemplateCategory.ENTERTAINMENT]: '🎬',
    [TemplateCategory.PERSONAL]: '👤'
};

export default function TemplateGallery({ onSelect }: TemplateGalleryProps) {
    const [search, setSearch] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');

    const filteredTemplates = search
        ? searchTemplates(search)
        : selectedCategory === 'all'
        ? VIDEO_TEMPLATES
        : VIDEO_TEMPLATES.filter(t => t.category === selectedCategory);

    const categories = [
        { value: 'all', label: 'All', icon: '✨' },
        { value: TemplateCategory.SOCIAL_MEDIA, label: 'Social', icon: '📱' },
        { value: TemplateCategory.MARKETING, label: 'Marketing', icon: '📢' },
        { value: TemplateCategory.EDUCATION, label: 'Education', icon: '📚' },
        { value: TemplateCategory.BUSINESS, label: 'Business', icon: '💼' }
    ];

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <div>
                    <h1 style={styles.title}>Templates</h1>
                    <p style={styles.subtitle}>Start with a professionally designed template</p>
                </div>
            </div>

            <div style={styles.searchBar}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#71717a" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="M21 21l-4.35-4.35"/>
                </svg>
                <input
                    type="text"
                    placeholder="Search templates..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={styles.searchInput}
                />
            </div>

            <div style={styles.categories}>
                {categories.map(cat => (
                    <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value as any)}
                        style={selectedCategory === cat.value ? styles.catActive : styles.catInactive}
                    >
                        <span>{cat.icon}</span>
                        <span>{cat.label}</span>
                    </button>
                ))}
            </div>

            <div style={styles.grid}>
                {filteredTemplates.map(template => (
                    <div key={template.id} style={styles.card} onClick={() => onSelect(template)}>
                        <div style={styles.cardPreview}>
                            <div style={styles.previewIcon}>
                                {categoryIcons[template.category] || '📁'}
                            </div>
                            <div style={styles.cardOverlay}>
                                <span style={styles.useBtn}>Use Template</span>
                            </div>
                        </div>
                        <div style={styles.cardContent}>
                            <h3 style={styles.cardTitle}>{template.name}</h3>
                            <p style={styles.cardDesc}>{template.description}</p>
                            <div style={styles.cardMeta}>
                                <span style={styles.difficultyBadge}>{template.difficulty}</span>
                                <span style={styles.duration}>{template.estimatedDuration}s</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredTemplates.length === 0 && (
                <div style={styles.empty}>
                    <div style={styles.emptyIcon}>🔍</div>
                    <p style={styles.emptyText}>No templates found</p>
                    <p style={styles.emptyHint}>Try a different search term</p>
                </div>
            )}
        </div>
    );
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        maxWidth: '1200px',
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
    categories: {
        display: 'flex',
        gap: '10px',
        marginBottom: '28px',
        flexWrap: 'wrap' as const
    },
    catInactive: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 18px',
        background: 'rgba(255, 255, 255, 0.03)',
        border: '1px solid rgba(255, 255, 255, 0.06)',
        borderRadius: '10px',
        color: '#71717a',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer'
    },
    catActive: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 18px',
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.15))',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '10px',
        color: '#e0e7ff',
        fontSize: '14px',
        fontWeight: 600,
        cursor: 'pointer'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '20px'
    },
    card: {
        background: 'rgba(24, 24, 27, 0.6)',
        backdropFilter: 'blur(20px)',
        borderRadius: '20px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease'
    },
    cardPreview: {
        position: 'relative',
        height: '180px',
        background: 'linear-gradient(135deg, #1e293b, #334155)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    previewIcon: {
        fontSize: '56px'
    },
    cardOverlay: {
        position: 'absolute',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        opacity: 0,
        transition: 'opacity 0.2s ease'
    },
    useBtn: {
        padding: '12px 24px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
        borderRadius: '10px',
        color: 'white',
        fontSize: '14px',
        fontWeight: 600
    },
    cardContent: {
        padding: '20px'
    },
    cardTitle: {
        fontSize: '17px',
        fontWeight: 700,
        color: '#fafafa',
        margin: '0 0 8px 0'
    },
    cardDesc: {
        fontSize: '14px',
        color: '#71717a',
        lineHeight: 1.5,
        margin: '0 0 16px 0'
    },
    cardMeta: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
    },
    difficultyBadge: {
        padding: '6px 12px',
        background: 'rgba(99, 102, 241, 0.15)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '6px',
        fontSize: '12px',
        color: '#c7d2fe',
        textTransform: 'capitalize' as const
    },
    duration: {
        fontSize: '13px',
        color: '#52525b'
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
    }
};
