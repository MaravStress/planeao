import React, { useState } from 'react';
import { useUniProgress } from '../context/UniProgressContext';
import type { SubjectStatus } from '../types/uniProgress';

const UniProgressPage: React.FC = () => {
    const { terms, addTerm, updateSubjectStatus, deleteTerm } = useUniProgress();
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    // Modal state
    const [newTermName, setNewTermName] = useState('');
    const [newSubjects, setNewSubjects] = useState<string[]>(['']);

    const handleAddSubjectInput = () => setNewSubjects([...newSubjects, '']);
    const handleSubjectChange = (index: number, value: string) => {
        const updated = [...newSubjects];
        updated[index] = value;
        setNewSubjects(updated);
    };
    
    const handleSubmitTerm = () => {
        const validSubjects = newSubjects.filter(s => s.trim() !== '');
        if (newTermName.trim() && validSubjects.length > 0) {
            addTerm(newTermName.trim(), validSubjects);
            setNewTermName('');
            setNewSubjects(['']);
            setIsModalOpen(false);
        }
    };

    // Calculate Stats
    let faltantes = 0;
    let seleccionadas = 0;
    let aprobadas = 0;
    
    terms.forEach(term => {
        term.subjects.forEach(sub => {
            if (sub.status === 'No cursada') faltantes++;
            if (sub.status === 'Cursando') seleccionadas++;
            if (sub.status === 'Aprobada') aprobadas++;
        });
    });

    const totalMaterias = faltantes + seleccionadas + aprobadas;
    const porcentajeCarrera = totalMaterias === 0 ? 0 : Math.round((aprobadas / totalMaterias) * 100);

    const calculateEstimatedTime = (): string => {
        if (seleccionadas === 0) return 'N/A (Selecciona materias que estés cursando)';
        
        const totalMonths = (faltantes / seleccionadas) * 4;
        const roundedMonths = Math.ceil(totalMonths);
        
        if (roundedMonths === 0) return '¡Terminado!';
        
        const years = Math.floor(roundedMonths / 12);
        const months = roundedMonths % 12;
        
        const parts = [];
        if (years > 0) parts.push(years === 1 ? '1 año' : `${years} años`);
        if (months > 0) parts.push(months === 1 ? '1 mes' : `${months} meses`);
        
        return parts.length > 0 ? parts.join(' y ') : 'N/A';
    };

    return (
        <div className="page-container" style={{ position: 'relative' }}>
            <header className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <div>
                    <h1 style={{ marginBottom: '0.5rem' }}>Progreso de la Universidad</h1>
                    <p style={{ color: 'var(--color-text-muted)' }}>Sigue tu avance académico y calificaciones.</p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    style={{
                        backgroundColor: 'var(--color-primary)',
                        color: 'white',
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        fontSize: '1.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: 'var(--shadow-glow)',
                        cursor: 'pointer',
                        transition: 'var(--transition-fast)',
                        border: 'none'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)' }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)' }}
                    title="Añadir cuatrimestre"
                >
                    +
                </button>
            </header>

            {/* Statistics Bar */}
            <div className="glass-panel" style={{ 
                padding: '2rem', 
                marginBottom: '2rem', 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '2rem', 
                justifyContent: 'space-around',
                alignItems: 'center'
            }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Materias Seleccionadas</span>
                    <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-secondary)' }}>{seleccionadas}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Materias Faltantes</span>
                    <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-warning)' }}>{faltantes}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Progreso</span>
                    <span style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--color-primary-light)' }}>{porcentajeCarrera}%</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Tiempo Estimado</span>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-success)', textAlign: 'center' }}>{calculateEstimatedTime()}</span>
                </div>
            </div>

            {/* Terms List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {terms.length === 0 ? (
                    <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                        No has añadido ningún cuatrimestre aún. ¡Agrega uno con el botón + !
                    </div>
                ) : (
                    terms.map(term => (
                        <div key={term.id} className="glass-panel" style={{ padding: '2rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h2 style={{ margin: 0 }}>{term.name}</h2>
                                <button 
                                    onClick={() => { if(window.confirm('¿Eliminar cuatrimestre?')) deleteTerm(term.id) }}
                                    style={{
                                        color: 'var(--color-danger)',
                                        fontSize: '0.9rem',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        opacity: 0.8
                                    }}
                                    onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
                                    onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.8' }}
                                >
                                    Eliminar Cuatrimestre
                                </button>
                            </div>
                            
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                                gap: '1rem'
                            }}>
                                {term.subjects.map(subject => {
                                    let borderColor = 'hsla(0, 0%, 100%, 0.1)';
                                    let bgColor = 'hsla(0, 0%, 100%, 0.02)';
                                    
                                    if (subject.status === 'Aprobada') {
                                        borderColor = 'hsla(145, 65%, 45%, 0.3)';
                                        bgColor = 'hsla(145, 65%, 45%, 0.05)';
                                    } else if (subject.status === 'Cursando') {
                                        borderColor = 'hsla(180, 70%, 50%, 0.4)';
                                        bgColor = 'hsla(180, 70%, 50%, 0.1)';
                                    }

                                    return (
                                        <div 
                                            key={subject.id} 
                                            style={{
                                                padding: '1.2rem',
                                                borderRadius: 'var(--radius-md)',
                                                border: `1px solid ${borderColor}`,
                                                background: bgColor,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                gap: '1rem',
                                                transition: 'all var(--transition-normal)'
                                            }}
                                        >
                                            <span style={{ 
                                                fontSize: '1.1rem',
                                                fontWeight: '500',
                                                textDecoration: subject.status === 'Aprobada' ? 'line-through' : 'none',
                                                color: subject.status === 'Aprobada' ? 'var(--color-text-muted)' : 'var(--color-text-main)'
                                            }}>
                                                {subject.name}
                                            </span>
                                            <select 
                                                value={subject.status}
                                                onChange={(e) => updateSubjectStatus(term.id, subject.id, e.target.value as SubjectStatus)}
                                                style={{
                                                    backgroundColor: 'var(--color-bg-input)',
                                                    border: '1px solid hsla(0, 0%, 100%, 0.1)',
                                                    borderRadius: 'var(--radius-sm)',
                                                    padding: '0.6rem',
                                                    color: 'var(--color-text-main)',
                                                    fontSize: '0.9rem',
                                                    width: '100%',
                                                    outline: 'none',
                                                    cursor: 'pointer'
                                                }}
                                            >
                                                <option value="No cursada">No cursada</option>
                                                <option value="Cursando">Cursando</option>
                                                <option value="Aprobada">Aprobada</option>
                                            </select>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Term Modal */}
            {isModalOpen && (
                <div style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    backdropFilter: 'blur(4px)',
                    zIndex: 1000,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '2rem'
                }}>
                    <div className="glass-panel" style={{
                        width: '100%',
                        maxWidth: '500px',
                        padding: '2rem',
                        maxHeight: '90vh',
                        overflowY: 'auto'
                    }}>
                        <h2 style={{ marginBottom: '1.5rem', marginTop: 0 }}>Añadir Cuatrimestre</h2>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginBottom: '2rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Nombre del Cuatrimestre</label>
                                <input 
                                    type="text" 
                                    value={newTermName}
                                    onChange={(e) => setNewTermName(e.target.value)}
                                    placeholder="Ej: Cuatrimestre 1"
                                    style={{
                                        width: '100%',
                                        backgroundColor: 'var(--color-bg-input)',
                                        border: '1px solid hsla(0, 0%, 100%, 0.1)',
                                        borderRadius: 'var(--radius-sm)',
                                        padding: '0.8rem',
                                        color: 'var(--color-text-main)',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>
                            
                            <div>
                                <label style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>Materias</label>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                                    {newSubjects.map((sub, index) => (
                                        <input 
                                            key={index}
                                            type="text"
                                            value={sub}
                                            onChange={(e) => handleSubjectChange(index, e.target.value)}
                                            placeholder={`Nombre de la materia ${index + 1}`}
                                            style={{
                                                width: '100%',
                                                backgroundColor: 'var(--color-bg-input)',
                                                border: '1px solid hsla(0, 0%, 100%, 0.1)',
                                                borderRadius: 'var(--radius-sm)',
                                                padding: '0.8rem',
                                                color: 'var(--color-text-main)',
                                                fontSize: '1rem',
                                                outline: 'none'
                                            }}
                                        />
                                    ))}
                                </div>
                                <button 
                                    onClick={handleAddSubjectInput}
                                    style={{
                                        marginTop: '1rem',
                                        color: 'var(--color-primary-light)',
                                        fontSize: '0.9rem',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer'
                                    }}
                                >
                                    + Añadir otra materia
                                </button>
                            </div>
                        </div>
                        
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '1rem',
                            borderTop: '1px solid hsla(0, 0%, 100%, 0.1)',
                            paddingTop: '1.5rem'
                        }}>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                style={{
                                    padding: '0.8rem 1.5rem',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'hsla(0, 0%, 100%, 0.1)',
                                    color: 'white',
                                    border: 'none',
                                    cursor: 'pointer'
                                }}
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSubmitTerm}
                                disabled={!newTermName.trim() || newSubjects.filter(s => s.trim() !== '').length === 0}
                                style={{
                                    padding: '0.8rem 1.5rem',
                                    borderRadius: 'var(--radius-sm)',
                                    background: 'var(--color-primary)',
                                    color: 'white',
                                    fontWeight: '500',
                                    border: 'none',
                                    cursor: (!newTermName.trim() || newSubjects.filter(s => s.trim() !== '').length === 0) ? 'not-allowed' : 'pointer',
                                    opacity: (!newTermName.trim() || newSubjects.filter(s => s.trim() !== '').length === 0) ? 0.5 : 1
                                }}
                            >
                                Guardar Cuatrimestre
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UniProgressPage;
