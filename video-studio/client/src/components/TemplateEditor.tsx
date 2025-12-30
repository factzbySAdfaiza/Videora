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
        <div style={styles.container}>
            <button onClick={onBack} style={styles.backBtn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
                Back to Templates
            </button>

            <div style={styles.header}>
                <h1 style={styles.title}>{template.name}</h1>
                <p style={styles.desc}>{template.description}</p>
                <div style={styles.badges}>
                    <span style={styles.badge}>{template.difficulty}</span>
                    <span style={styles.badge}>{template.estimatedDuration}s</span>
                </div>
            </div>

            <div style={styles.form}>
                <div style={styles.field}>
                    <label style={styles.label}>Video Title</label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        style={styles.input}
                        placeholder="Enter video title"
                    />
                </div>

                {template.parameters.map(param => (
                    <div key={param.id} style={styles.field}>
                        <label style={styles.label}>
                            {param.label}
                            <span style={styles.hint}>{param.description}</span>
                        </label>
                        {renderParameterInput(param, parameters[param.id], (value) => handleParameterChange(param.id, value))}
                        {errors[param.id] && <div style={styles.error}>{errors[param.id]}</div>}
                    </div>
                ))}

                <button onClick={handleGenerate} style={styles.generateBtn}>
                    <span style={styles.generateIcon}>✨</span>
                    Generate Video
                    <span style={styles.costBadge}>10 credits</span>
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
    const inputStyle = styles.input;

    switch (param.type) {
        case 'text':
            return (
                <input
                    type="text"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={inputStyle}
                    placeholder={param.defaultValue}
                />
            );
        case 'number':
            return (
                <input
                    type="number"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    style={inputStyle}
                    min={param.validation?.min}
                    max={param.validation?.max}
                />
            );
        case 'color':
            return (
                <div style={styles.colorRow}>
                    <input
                        type="color"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        style={styles.colorPicker}
                    />
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        style={{ ...inputStyle, flex: 1 }}
                        placeholder="#000000"
                    />
                </div>
            );
        case 'select':
            return (
                <select
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    style={inputStyle}
                >
                    {param.validation?.options?.map(option => (
                        <option key={option} value={option}>{option}</option>
                    ))}
                </select>
            );
        case 'boolean':
            return (
                <label style={styles.checkbox}>
                    <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => onChange(e.target.checked)}
                        style={styles.checkboxInput}
                    />
                    <span style={styles.checkboxLabel}>Enable</span>
                </label>
            );
        default:
            return null;
    }
}

const styles: { [key: string]: React.CSSProperties } = {
    container: {
        maxWidth: '700px',
        margin: '0 auto'
    },
    backBtn: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '12px 20px',
        background: 'rgba(255, 255, 255, 0.05)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '12px',
        color: '#a1a1aa',
        fontSize: '14px',
        fontWeight: 500,
        cursor: 'pointer',
        marginBottom: '32px'
    },
    header: {
        marginBottom: '32px'
    },
    title: {
        fontSize: '32px',
        fontWeight: 700,
        margin: '0 0 12px 0',
        background: 'linear-gradient(135deg, #fafafa, #a1a1aa)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
    },
    desc: {
        fontSize: '16px',
        color: '#71717a',
        margin: '0 0 16px 0',
        lineHeight: 1.6
    },
    badges: {
        display: 'flex',
        gap: '10px'
    },
    badge: {
        padding: '8px 14px',
        background: 'rgba(99, 102, 241, 0.15)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
        borderRadius: '8px',
        fontSize: '13px',
        color: '#c7d2fe',
        textTransform: 'capitalize' as const
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
    },
    field: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
    },
    label: {
        fontSize: '14px',
        fontWeight: 600,
        color: '#e4e4e7',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
    },
    hint: {
        fontSize: '13px',
        fontWeight: 400,
        color: '#52525b'
    },
    input: {
        padding: '16px 18px',
        background: 'rgba(0, 0, 0, 0.3)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '12px',
        color: '#fafafa',
        fontSize: '15px',
        outline: 'none',
        fontFamily: 'inherit'
    },
    colorRow: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center'
    },
    colorPicker: {
        width: '56px',
        height: '56px',
        border: 'none',
        borderRadius: '12px',
        cursor: 'pointer',
        background: 'transparent'
    },
    checkbox: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer'
    },
    checkboxInput: {
        width: '22px',
        height: '22px',
        cursor: 'pointer',
        accentColor: '#6366f1'
    },
    checkboxLabel: {
        fontSize: '15px',
        color: '#a1a1aa'
    },
    error: {
        color: '#f87171',
        fontSize: '13px'
    },
    generateBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '20px 32px',
        background: 'linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7)',
        border: 'none',
        borderRadius: '16px',
        color: 'white',
        fontSize: '17px',
        fontWeight: 700,
        cursor: 'pointer',
        boxShadow: '0 8px 32px rgba(99, 102, 241, 0.35), inset 0 1px 0 rgba(255,255,255,0.2)',
        marginTop: '16px'
    },
    generateIcon: {
        fontSize: '20px'
    },
    costBadge: {
        padding: '6px 12px',
        background: 'rgba(255, 255, 255, 0.2)',
        borderRadius: '20px',
        fontSize: '13px',
        fontWeight: 600
    }
};
