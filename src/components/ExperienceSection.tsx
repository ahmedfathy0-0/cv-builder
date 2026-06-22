import { useApp, type Experience } from '../App'

interface Props {
  onEdit: (exp: Experience) => void
  onAdd: () => void
}

const variantColors: Record<string, string> = {
  hardware: 'var(--accent-cyan)',
  software: 'var(--accent-purple)',
  data: 'var(--accent-green)',
  default: 'var(--accent-amber)'
}

export default function ExperienceSection({ onEdit, onAdd }: Props) {
  const { data, selection, setSelection, refreshData, addToast } = useApp()

  if (!data) return null

  const toggleExperience = (id: string) => {
    setSelection(prev => ({
      ...prev,
      experienceIds: (prev.experienceIds || []).includes(id)
        ? (prev.experienceIds || []).filter(e => e !== id)
        : [...(prev.experienceIds || []), id]
    }))
  }

  const moveExperience = (id: string, direction: 'up' | 'down') => {
    setSelection(prev => {
      const currentIds = prev.experienceIds || []
      const idx = currentIds.indexOf(id)
      if (idx === -1) return prev

      const targetIdx = direction === 'up' ? idx - 1 : idx + 1
      if (targetIdx < 0 || targetIdx >= currentIds.length) return prev

      const experienceIds = [...currentIds]
      ;[experienceIds[idx], experienceIds[targetIdx]] = [experienceIds[targetIdx], experienceIds[idx]]
      return { ...prev, experienceIds }
    })
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this experience entry?')) return
    try {
      await fetch(`/api/data/experiences/${id}`, { method: 'DELETE' })
      await refreshData()
      setSelection(prev => ({
        ...prev,
        experienceIds: (prev.experienceIds || []).filter(e => e !== id)
      }))
      addToast('Experience deleted', 'success')
    } catch {
      addToast('Failed to delete', 'error')
    }
  }

  // Group by variant
  const variants = [...new Set(data.experiences.map(e => e.variant || 'default'))]
  const selectedExperiences = (selection.experienceIds || [])
    .map(id => data.experiences.find(e => e.id === id))
    .filter((exp): exp is Experience => Boolean(exp))

  return (
    <div>
      <div className="section-header">
        <div>
          <h2>💼 Experience</h2>
          <p style={{ fontSize: 13, color: 'var(--text-tertiary)', marginTop: 4 }}>
            Toggle experiences to include in your CV · {(selection.experienceIds || []).length} selected
          </p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={onAdd}>
          ➕ Add New
        </button>
      </div>

      <div style={{ marginBottom: 16 }}>
        <label className="form-label">Experiences Section Title</label>
        <input
          className="form-input"
          style={{ maxWidth: 300 }}
          value={selection.experiencesSectionTitle || ''}
          onChange={e => setSelection(prev => ({ ...prev, experiencesSectionTitle: e.target.value }))}
          placeholder="Experience"
        />
      </div>

      {selectedExperiences.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 10 }}>Selected Experiences Order</h3>
          <div className="radio-card-group">
            {selectedExperiences.map((exp, idx) => (
              <div key={exp.id} className="radio-card" style={{ padding: '10px 12px' }}>
                <span className="badge" style={{ minWidth: 32, textAlign: 'center' }}>#{idx + 1}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{exp.company}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>{exp.role} · {exp.dates}</div>
                </div>
                <div className="card-actions">
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => moveExperience(exp.id, 'up')}
                    disabled={idx === 0}
                    title="Move up"
                  >
                    ⬆️
                  </button>
                  <button
                    className="btn btn-ghost btn-icon"
                    onClick={() => moveExperience(exp.id, 'down')}
                    disabled={idx === selectedExperiences.length - 1}
                    title="Move down"
                  >
                    ⬇️
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {variants.map(variant => (
        <div key={variant} style={{ marginBottom: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: variantColors[variant.toLowerCase()] || 'var(--text-secondary)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ textTransform: 'capitalize' }}>{variant}</span>
            <span className="badge">{data.experiences.filter(e => (e.variant || 'default') === variant).length}</span>
          </h3>

          {data.experiences.filter(e => (e.variant || 'default') === variant).map(exp => {
            const included = (selection.experienceIds || []).includes(exp.id)
            const selectedIndex = (selection.experienceIds || []).indexOf(exp.id)
            return (
              <div key={exp.id} className="card" style={{ borderLeft: `3px solid ${included ? (variantColors[(exp.variant || 'default').toLowerCase()] || 'var(--accent-cyan)') : 'transparent'}`, opacity: included ? 1 : 0.6 }}>
                <div className="card-header">
                  <div style={{ flex: 1 }}>
                    <div className="card-title">
                      <input
                        type="checkbox"
                        className="toggle-checkbox"
                        checked={included}
                        onChange={() => toggleExperience(exp.id)}
                      />
                      {exp.company}
                      {included && <span className="badge">#{selectedIndex + 1}</span>}
                    </div>
                    <div className="card-subtitle">{exp.role} · {exp.dates}</div>
                  </div>
                  <div className="card-actions">
                    {included && (
                      <>
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={() => moveExperience(exp.id, 'up')}
                          disabled={selectedIndex === 0}
                          title="Move up"
                        >
                          ⬆️
                        </button>
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={() => moveExperience(exp.id, 'down')}
                          disabled={selectedIndex === (selection.experienceIds || []).length - 1}
                          title="Move down"
                        >
                          ⬇️
                        </button>
                      </>
                    )}
                    <button className="btn btn-ghost btn-icon" onClick={() => onEdit(exp)} title="Edit">✏️</button>
                    <button className="btn btn-danger btn-icon" onClick={() => handleDelete(exp.id)} title="Delete">🗑️</button>
                  </div>
                </div>

                <div className="card-items">
                  {exp.items.map((item, i) => (
                    <div key={i} className="card-item">
                      <strong>{item.title}</strong>: <span>{item.description}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
