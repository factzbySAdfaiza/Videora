import { useState } from 'react';
import { Template, TemplateCategory } from '../types';
import { VIDEO_TEMPLATES, searchTemplates } from '../data/templates';

interface TemplateSelectorProps {
  onSelect: (template: Template) => void;
}

export default function TemplateSelector({ onSelect }: TemplateSelectorProps) {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');

  const filteredTemplates = search
    ? searchTemplates(search)
    : selectedCategory === 'all'
    ? VIDEO_TEMPLATES
    : VIDEO_TEMPLATES.filter(t => t.category === selectedCategory);

  const categories = [
    { value: 'all', label: 'All Templates', icon: '📁' },
    { value: TemplateCategory.SOCIAL_MEDIA, label: 'Social Media', icon: '📱' },
    { value: TemplateCategory.MARKETING, label: 'Marketing', icon: '📢' },
    { value: TemplateCategory.EDUCATION, label: 'Education', icon: '📚' },
    { value: TemplateCategory.BUSINESS, label: 'Business', icon: '💼' },
    { value: TemplateCategory.ENTERTAINMENT, label: 'Entertainment', icon: '🎬' },
  ];

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h2 style={s.title}>Choose a Template</h2>
        <input
          type="text"
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={s.search}
        />
      </div>

      <div style={s.categories}>
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setSelectedCategory(cat.value as any)}
            style={selectedCategory === cat.value ? s.catActive : s.catInactive}
          >
            <span style={{ marginRight: '0.5rem' }}>{cat.icon}</span>
            {cat.label}
          </button>
        ))}
      </div>

      <div style={s.grid}>
        {filteredTemplates.map(template => (
          <div key={template.id} style={s.card} onClick={() => onSelect(template)}>
            <div style={s.thumb}>
              <div style={s.icon}>{getCategoryIcon(template.category)}</div>
            </div>
            <div style={s.content}>
              <h3 style={s.name}>{template.name}</h3>
              <p style={s.desc}>{template.description}</p>
              <div style={s.meta}>
                <span style={s.badge}>{template.difficulty}</span>
                <span style={s.duration}>{template.estimatedDuration}s</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div style={s.empty}>
          <div style={s.emptyIcon}>🔍</div>
          <p style={s.emptyText}>No templates found</p>
        </div>
      )}
    </div>
  );
}

function getCategoryIcon(category: TemplateCategory): string {
  const icons = {
    [TemplateCategory.SOCIAL_MEDIA]: '📱',
    [TemplateCategory.MARKETING]: '📢',
    [TemplateCategory.EDUCATION]: '📚',
    [TemplateCategory.BUSINESS]: '💼',
    [TemplateCategory.ENTERTAINMENT]: '🎬',
    [TemplateCategory.PERSONAL]: '👤',
  };
  return icons[category] || '📁';
}

const s = {
  container: { padding: '1rem' },
  header: { marginBottom: '1.5rem' },
  title: { fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#f1f5f9' },
  search: {
    width: '100%',
    padding: '0.75rem 1rem',
    background: '#0f0f15',
    border: '1px solid #2a2a3a',
    borderRadius: '10px',
    color: '#f1f5f9',
    fontSize: '0.95rem',
    outline: 'none'
  } as React.CSSProperties,
  categories: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap' as const,
    overflowX: 'auto' as const
  },
  catInactive: {
    padding: '0.5rem 1rem',
    background: '#1a1a24',
    border: '1px solid #2a2a3a',
    borderRadius: '8px',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.85rem',
    whiteSpace: 'nowrap' as const
  },
  catActive: {
    padding: '0.5rem 1rem',
    background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2))',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '8px',
    color: '#e0e7ff',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 600,
    whiteSpace: 'nowrap' as const
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: '1rem'
  },
  card: {
    background: 'linear-gradient(135deg, #1a1a24, #12121a)',
    border: '1px solid #2a2a3a',
    borderRadius: '12px',
    overflow: 'hidden',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  thumb: {
    height: '140px',
    background: 'linear-gradient(135deg, #1e293b, #334155)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  icon: { fontSize: '3rem' },
  content: { padding: '1rem' },
  name: { fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem', color: '#f1f5f9' },
  desc: { fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.75rem', lineHeight: 1.4 },
  meta: { display: 'flex', gap: '0.5rem', alignItems: 'center' },
  badge: {
    padding: '0.25rem 0.5rem',
    background: 'rgba(99,102,241,0.2)',
    border: '1px solid rgba(99,102,241,0.3)',
    borderRadius: '6px',
    fontSize: '0.75rem',
    color: '#c7d2fe'
  },
  duration: { fontSize: '0.8rem', color: '#64748b' },
  empty: { textAlign: 'center' as const, padding: '3rem 1rem' },
  emptyIcon: { fontSize: '3rem', marginBottom: '1rem' },
  emptyText: { color: '#64748b', fontSize: '1rem' }
};
