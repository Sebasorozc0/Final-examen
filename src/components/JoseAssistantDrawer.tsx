import React, { useState } from 'react';
import { api } from '../api/client';
import { FuenteCitada } from '../types/api';
import { 
  X, 
  Send, 
  Sparkles, 
  BookOpen, 
  ChevronDown, 
  ChevronUp, 
  Loader2, 
  ShieldCheck,
} from 'lucide-react';

interface JoseAssistantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

// Inciso 9: MensajeChat incluye campos de tokens, costo y modelo
interface MensajeChat {
  id: string;
  remitente: 'usuario' | 'jose';
  texto: string;
  fuentes?: FuenteCitada[];
  tiempoMs?: number;
  herramientaEjecutada?: string;
  tokensEntrada?: number;
  tokensSalida?: number;
  tokensTotales?: number;
  costoUsd?: number;
  modelo?: string;
}

export const JoseAssistantDrawer: React.FC<JoseAssistantDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const [mensajes, setMensajes] = useState<MensajeChat[]>([
    {
      id: 'bienvenida',
      remitente: 'jose',
      texto:
        '¡Hola! Soy José, el asistente oficial de la promotora. Puedo responder tus consultas sobre eventos en venta, reglamentos de acceso, recintos, horarios y políticas públicas con respaldo en documentos oficiales.',
    },
  ]);
  const [sessionId] = useState<string>(() => (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : 'c3b9b4a1-8d2a-4f51-b8ef-1f19c902d131'));
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [fuentesAbiertas, setFuentesAbiertas] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  // Inciso 6: handleEnviar usa streaming SSE con cursor progresivo
  const handleEnviar = async (textoAEnviar?: string) => {
    const consulta = (textoAEnviar || input).trim();
    if (!consulta || cargando) return;

    const idUsuario = 'msg-' + Date.now();
    setMensajes((prev) => [...prev, { id: idUsuario, remitente: 'usuario', texto: consulta }]);
    setInput('');
    setCargando(true);

    // Inciso 6: crear placeholder vacío para el streaming en tiempo real
    const idJose = 'jose-' + Date.now();
    setMensajes((prev) => [...prev, { id: idJose, remitente: 'jose', texto: '' }]);

    try {
      // Inciso 6: consultarIaStream emite chunks progresivos palabra por palabra
      const res = await api.consultarIaStream(
        consulta,
        (chunk) => {
          setMensajes((prev) =>
            prev.map((m) => (m.id === idJose ? { ...m, texto: m.texto + chunk } : m))
          );
        },
        sessionId
      );

      // Inciso 2 + 9: actualizar con metadata completa (tool badge, fuentes, tokens, costo)
      setMensajes((prev) =>
        prev.map((m) =>
          m.id === idJose
            ? {
                ...m,
                texto: res.respuesta,
                fuentes: res.fuentes,
                tiempoMs: res.tiempoRespuestaMs,
                herramientaEjecutada: res.herramientaEjecutada,
                tokensEntrada: res.tokensEntrada,
                tokensSalida: res.tokensSalida,
                tokensTotales: res.tokensTotales,
                costoUsd: res.costoUsd,
                modelo: res.modelo,
              }
            : m
        )
      );
    } catch (err: any) {
      setMensajes((prev) =>
        prev.map((m) =>
          m.id === idJose
            ? {
                ...m,
                texto: err?.detail || err?.message || 'Lo siento, no pude conectar con el servicio de IA en este momento.',
              }
            : m
        )
      );
    } finally {
      setCargando(false);
    }
  };

  const toggleFuentes = (msgId: string) => {
    setFuentesAbiertas((prev) => ({ ...prev, [msgId]: !prev[msgId] }));
  };

  const sugerencias = [
    '¿Qué capacidad y cupos disponibles tiene el recinto Explanada Cayalá?',
    '¿Qué eventos están confirmados este mes?',
    '¿Cuáles son las políticas de reembolso y cancelación?',
    '¿Cómo funciona la validación del código QR en puerta?',
    '¿Qué incluye el acceso Platinum VIP en Explanada Cayalá?',
  ];

  return (
    <div className="modal-overlay" onClick={(e) => e.stopPropagation()} style={{ padding: 0 }}>
      <div 
        className="drawer-aside"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '18px 20px',
          borderBottom: '2px solid var(--border-strong)',
          backgroundColor: 'var(--bg-canvas)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              backgroundColor: 'var(--bg-inverse)',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--border-strong)',
              boxShadow: 'var(--shadow-crisp-sm)'
            }}>
              <Sparkles size={20} color="#FF3B20" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '1.15rem' }}>José · Asistente IA</h3>
                <span style={{ width: '8px', height: '8px', backgroundColor: '#10B981', borderRadius: '50%' }} />
              </div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.68rem', color: 'var(--text-secondary)' }}>
                RAG Oficial · Respaldado en Documentos
              </div>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="btn btn-sm btn-outline"
            style={{ padding: '6px 8px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Info Banner */}
        <div style={{
          padding: '8px 16px',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-medium)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.72rem',
          color: 'var(--text-secondary)'
        }}>
          <ShieldCheck size={14} color="#10B981" />
          <span>Información pública verificada con citación de fuentes</span>
        </div>

        {/* Chat History */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          {mensajes.map((m) => {
            const isUser = m.remitente === 'usuario';
            return (
              <div
                key={m.id}
                style={{
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '88%',
                }}
              >
                {/* Burbuja de mensaje */}
                <div style={{
                  padding: '14px 16px',
                  backgroundColor: isUser ? 'var(--bg-inverse)' : '#FFF',
                  color: isUser ? 'var(--text-inverse)' : 'var(--text-primary)',
                  border: '2px solid var(--border-strong)',
                  boxShadow: 'var(--shadow-crisp-sm)',
                  fontSize: '0.92rem',
                  lineHeight: 1.5,
                  wordBreak: 'break-word',
                  whiteSpace: 'pre-line'
                }}>
                  {m.texto}
                  {/* Inciso 6: cursor de streaming parpadeante */}
                  {!isUser && cargando && m.id === mensajes[mensajes.length - 1]?.id && (
                    <span style={{ color: 'var(--accent-vermilion)', fontWeight: 900, marginLeft: '2px', display: 'inline-block' }}>▊</span>
                  )}
                </div>

                {/* Inciso 2: Badge de Tool ejecutada */}
                {m.herramientaEjecutada && (
                  <div style={{
                    marginTop: '6px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backgroundColor: '#EFF6FF',
                    border: '1.5px solid #3B82F6',
                    color: '#1D4ED8',
                    padding: '4px 10px',
                    fontSize: '0.72rem',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 700,
                  }}>
                    <span>🔧 Tool Ejecutada: {m.herramientaEjecutada}</span>
                  </div>
                )}

                {/* Citaciones RAG */}
                {m.fuentes && m.fuentes.length > 0 && (
                  <div style={{ marginTop: '6px' }}>
                    <button
                      onClick={() => toggleFuentes(m.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: 'none',
                        border: 'none',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.72rem',
                        color: '#1D4ED8',
                        fontWeight: 700,
                        cursor: 'pointer',
                        padding: '2px 4px'
                      }}
                    >
                      <BookOpen size={13} />
                      {fuentesAbiertas[m.id] ? 'Ocultar fuentes' : `Ver fuentes citadas (${m.fuentes.length})`}
                      {fuentesAbiertas[m.id] ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                    </button>

                    {fuentesAbiertas[m.id] && (
                      <div style={{
                        marginTop: '4px',
                        backgroundColor: '#FFF',
                        border: '1.5px solid var(--border-strong)',
                        padding: '10px',
                        fontSize: '0.78rem',
                        fontFamily: 'var(--font-mono)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px'
                      }}>
                        {m.fuentes.map((f, i) => (
                          <div key={i} style={{ borderBottom: i < m.fuentes!.length - 1 ? '1px dashed var(--border-medium)' : 'none', paddingBottom: '6px' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                              📄 {f.documento} {f.pagina ? `(Pág. ${f.pagina})` : ''}
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', marginTop: '2px' }}>
                              "{f.extracto}"
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Inciso 9: Métricas de Tokens, Costo y Modelo */}
                {!isUser && (m.tokensTotales !== undefined || m.tiempoMs !== undefined) && (
                  <div style={{
                    marginTop: '6px',
                    padding: '6px 10px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    gap: '10px',
                    fontFamily: 'var(--font-mono)',
                    fontSize: '0.68rem',
                    color: '#64748B',
                  }}>
                    {m.tiempoMs !== undefined && (
                      <span>⚡ {m.tiempoMs}ms</span>
                    )}
                    {m.tokensTotales !== undefined && (
                      <span>
                        📊 Tokens: <strong style={{ color: '#1E293B' }}>{m.tokensTotales}</strong>
                        <span style={{ opacity: 0.7 }}> (in: {m.tokensEntrada} / out: {m.tokensSalida})</span>
                      </span>
                    )}
                    {m.costoUsd !== undefined && (
                      <span style={{ color: '#059669', fontWeight: 700 }}>
                        💰 ${m.costoUsd < 0.0001 ? m.costoUsd.toFixed(6) : m.costoUsd.toFixed(4)} USD
                      </span>
                    )}
                    {m.modelo && (
                      <span style={{
                        backgroundColor: '#E0E7FF',
                        color: '#3730A3',
                        padding: '1px 6px',
                        fontWeight: 700,
                        fontSize: '0.63rem',
                      }}>
                        🤖 {m.modelo}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}

          {cargando && (
            <div style={{
              alignSelf: 'flex-start',
              padding: '12px 16px',
              backgroundColor: '#FFF',
              border: '2px solid var(--border-strong)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem'
            }}>
              <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
              Generando respuesta en tiempo real (SSE)...
            </div>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div style={{
          padding: '10px 16px',
          borderTop: '1.5px dashed var(--border-medium)',
          backgroundColor: 'var(--bg-canvas)',
          display: 'flex',
          overflowX: 'auto',
          gap: '6px',
          whiteSpace: 'nowrap'
        }}>
          {sugerencias.map((sug, i) => (
            <button
              key={i}
              onClick={() => handleEnviar(sug)}
              className="btn btn-sm btn-outline"
              style={{ fontSize: '0.7rem', padding: '4px 10px', backgroundColor: '#FFF' }}
            >
              {sug}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div style={{
          padding: '16px',
          borderTop: '2px solid var(--border-strong)',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          gap: '8px'
        }}>
          <input
            type="text"
            className="input-brutal"
            placeholder="Pregunta a José sobre eventos o reglamentos..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleEnviar()}
            disabled={cargando}
          />
          <button
            onClick={() => handleEnviar()}
            disabled={!input.trim() || cargando}
            className="btn btn-primary"
            style={{ padding: '0 18px' }}
          >
            <Send size={18} />
          </button>
        </div>

      </div>
    </div>
  );
};
