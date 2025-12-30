import { useState } from 'react';
import { Template, TemplateParameter } from '../types';
import { getDefaultParameters, validateParameters, renderTemplate } from '../utils/templateRenderer';

interface TemplateEditorProps {
  template: Template;
  onGenerate: (tsxCode: string, title: string) => void;
  onBack: () => void;
}

export default function TemplateEditor({ template, onGenerate, onBack }: TemplateEditorProps) {
  const [parameters, setParameters] = useState<Record<string, any>>(getDefaultParameters(template));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [title, setTitle] = useState(`${template.name} - ${new Date().toLocaleDateString()}`);

  const handleParameterChange = (paramId: string, value: any) => {
    setParameters(prev => ({ ...prev, [paramId]: value }));
    // Clear error for this field
    if (errors[paramId]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[paramId];
        return newErrors;
      });
    }
  };

  const handleGenerate = () => {
    const validation = validateParameters(template.parameters, parameters);
    
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    const renderedCode = renderTemplate(template, parameters);
    onGenerate(renderedCode, title);
  };

  return (
    <div style={s.container}>
      <button onClick={onBack} style={s.back}>← Back to Templates</button>

      <div style={s.header}>
        <h2 style={s.title}>{template.name}</h2>
        <p style={s.desc}>{template.description}</p>
      </div>

      <div style={s.form}>
        <div style={s.field}>
          <label style={s.label}>Video Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={s.input}
            placeholder="Enter video title"
          />
        </div>

        {template.parameters.map(param => (
          <div key={param.id} style={s.field}>
            <label style={s.label}>
              {param.label}
              <span style={s.hint}>{param.description}</span>
            </label>
            {renderParameterInput(param, parameters[param.id], (value) => handleParameterChange(param.id, value))}
            {errors[param.id] && <div style={s.error}>{errors[param.id]}</div>}
          </div>
        ))}

        <button onClick={handleGenerate} style={s.btn}>
          ✨ Generate Video (10 coins)
        </button>
      </div>
    </div>
  );
}

function renderParameterInput(
  param: TemplateParameter,
  value: any,
  onChange: (value: any) => void
) {
  switch (param.type) {
    case 'text':
      return (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={s.input}
          placeholder={param.defaultValue}
        />
      );

    case 'number':
      return (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={s.input}
          min={param.validation?.min}
          max={param.validation?.max}
        />
      );

    case 'color':
      return (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ width: '60px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
          />
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            style={{ ...s.input, flex: 1 }}
            placeholder="#000000"
          />
        </div>
      );

    case 'select':
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={s.input}
        >
          {param.validation?.options?.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );

    case 'boolean':
      return (
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={value}
            onChange={(e) => onChange(e.target.checked)}
            style={{ width: '20px', height: '20px', cursor: 'pointer' }}
          />
          <span style={{ color: '#94a3b8' }}>Enable</span>
        </label>
      );

    default:
      return null;
  }
}

const s = {
  container: { padding: '1rem' },
  back: {
    padding: '0.5rem 1rem',
    background: 'transparent',
    border: '1px solid #2a2a3a',
    borderRadius: '8px',
    color: '#94a3b8',
    cursor: 'pointer',
    fontSize: '0.9rem',
    marginBottom: '1.5rem'
  },
  header: { marginBottom: '2rem' },
  title: { fontSize: '1.8rem', fontWeight: 700, marginBottom: '0.5rem', color: '#f1f5f9' },
  desc: { color: '#94a3b8', fontSize: '0.95rem' },
  form: { display: 'flex', flexDirection: 'column' as const, gap: '1.5rem' },
  field: { display: 'flex', flexDirection: 'column' as const, gap: '0.5rem' },
  label: {
    fontSize: '0.95rem',
    fontWeight: 600,
    color: '#cbd5e1',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.25rem'
  },
  hint: { fontSize: '0.8rem', fontWeight: 400, color: '#64748b' },
  input: {
    padding: '0.75rem 1rem',
    background: '#0f0f15',
    border: '1px solid #2a2a3a',
    borderRadius: '10px',
    color: '#f1f5f9',
    fontSize: '0.95rem',
    outline: 'none',
    fontFamily: 'inherit'
  } as React.CSSProperties,
  error: { color: '#ef4444', fontSize: '0.85rem', marginTop: '0.25rem' },
  btn: {
    padding: '1.25rem 2rem',
    background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    border: 'none',
    borderRadius: '14px',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: 700,
    cursor: 'pointer',
    boxShadow: '0 8px 24px rgba(99,102,241,0.4)',
    marginTop: '1rem'
  }
};
