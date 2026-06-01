import { useEffect, useState } from "react";
import { api } from "../../lib/api";

const API_URL = "https://emailunitreino.onrender.com/api/emails";

const STATUS_COLORS = {
  sent:    { bg: "#dcfce7", color: "#166534" },
  failed:  { bg: "#fee2e2", color: "#991b1b" },
  pending: { bg: "#fef9c3", color: "#854d0e" },
};

const STATUS_LABELS = {
  sent:    "Enviado",
  failed:  "Falhou",
  pending: "Pendente",
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg: "#f1f5f9", color: "#475569" };
  return (
    <span
      style={{
        background: s.bg,
        color: s.color,
        padding: "3px 10px",
        borderRadius: "99px",
        fontSize: "11px",
        fontWeight: "700",
        textTransform: "uppercase",
      }}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function IcMail() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function IcTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function IcSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function Email() {
  const [busca, setBusca]         = useState("");
  const [lista, setLista]         = useState([]);
  const [stats, setStats]         = useState({ total: 0, sent: 0, failed: 0, pending: 0 });
  const [isLoading, setIsLoading] = useState(false);

  // Modal compor e-mail
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [enviando, setEnviando]           = useState(false);
  const [to, setTo]                       = useState("");
  const [subject, setSubject]             = useState("");
  const [text, setText]                   = useState("");
  const [composeError, setComposeError]   = useState("");
  const [composeSuccess, setComposeSuccess] = useState("");

  // Modal detalhe
  const [emailDetalhe, setEmailDetalhe]   = useState(null);
  const [isDetalheOpen, setIsDetalheOpen] = useState(false);

  // Modal confirmar delete
  const [idDeletar, setIdDeletar]         = useState(null);

  async function fetchEmails() {
    setIsLoading(true);
    try {
      const [resLista, resStats] = await Promise.all([
        api.get(API_URL),
        api.get(`${API_URL}/stats`),
      ]);

      const dadosLista  = resLista.data  || resLista;
      const dadosStats  = resStats.data  || resStats;

      const emails = dadosLista.emails || (Array.isArray(dadosLista) ? dadosLista : []);
      setLista(emails);
      setStats({
        total:   dadosStats.total   ?? emails.length,
        sent:    dadosStats.sent    ?? 0,
        failed:  dadosStats.failed  ?? 0,
        pending: dadosStats.pending ?? 0,
      });
    } catch (err) {
      console.error("Erro ao buscar e-mails:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchEmails();
  }, []);

  const listaFiltrada = lista.filter(
    (e) =>
      e.to?.toLowerCase().includes(busca.toLowerCase()) ||
      e.subject?.toLowerCase().includes(busca.toLowerCase())
  );

  // ── Enviar e-mail ─────────────────────────────────────────────────────────
  async function handleEnviar(e) {
    e.preventDefault();
    setComposeError("");
    setComposeSuccess("");

    if (!to || !subject || !text) {
      setComposeError("Preencha todos os campos obrigatórios.");
      return;
    }

    setEnviando(true);
    try {
      const res = await api.post(API_URL, { to, subject, text });
      const data = res.data || res;
      setComposeSuccess(
        `E-mail enviado com sucesso!${data.previewUrl ? " (Ethereal)" : ""}`
      );
      setTo(""); setSubject(""); setText("");
      fetchEmails();
      setTimeout(() => {
        setIsComposeOpen(false);
        setComposeSuccess("");
      }, 2000);
    } catch (err) {
      setComposeError(err.message || "Erro ao enviar o e-mail.");
    } finally {
      setEnviando(false);
    }
  }

  // ── Ver detalhe ───────────────────────────────────────────────────────────
  async function handleVerDetalhe(id) {
    try {
      const res  = await api.get(`${API_URL}/${id}`);
      const data = res.data || res;
      setEmailDetalhe(data);
      setIsDetalheOpen(true);
    } catch (err) {
      console.error("Erro ao buscar detalhe:", err);
    }
  }

  // ── Deletar ───────────────────────────────────────────────────────────────
  async function handleConfirmarDeletar() {
    try {
      await api.delete(`${API_URL}/${idDeletar}`);
      fetchEmails();
    } catch (err) {
      console.error("Erro ao remover e-mail:", err);
    } finally {
      setIdDeletar(null);
      if (isDetalheOpen && emailDetalhe?.id === idDeletar) setIsDetalheOpen(false);
    }
  }

  function fmtData(iso) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("pt-BR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div
      className="crud-content"
      style={{ width: "100%", maxWidth: "100%", display: "flex", flexDirection: "column", flex: 1 }}
    >
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div
        className="crud-header"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: "20px", width: "100%", marginBottom: "20px" }}
      >
        <h1 className="crud-titulo" style={{ margin: 0, whiteSpace: "nowrap" }}>
          📬 E-mails
        </h1>
        <div className="crud-search-wrap" style={{ flex: 1, maxWidth: "500px" }}>
          <span className="crud-search-icon"><IcSearch /></span>
          <input
            type="text"
            className="crud-search"
            placeholder="Pesquisar por destinatário ou assunto..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            style={{ width: "100%" }}
          />
        </div>
        <button
          className="crud-criar-btn"
          onClick={() => { setIsComposeOpen(true); setComposeError(""); setComposeSuccess(""); }}
          style={{ whiteSpace: "nowrap" }}
        >
          ✉️ Compor E-mail
        </button>
      </div>

      {/* ── Stats ──────────────────────────────────────────────────────── */}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "24px" }}
      >
        {[
          { label: "Total",    value: stats.total,   color: "inherit" },
          { label: "Enviados", value: stats.sent,    color: "#166534" },
          { label: "Falhas",   value: stats.failed,  color: "#991b1b" },
          { label: "Pendentes",value: stats.pending, color: "#854d0e" },
        ].map((s) => (
          <div
            key={s.label}
            style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: "10px",
              padding: "16px 18px", boxShadow: "0 1px 3px rgba(0,0,0,.05)" }}
          >
            <div style={{ fontSize: "28px", fontWeight: "800", color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
            <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "5px", fontWeight: "600" }}>
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Tabela ─────────────────────────────────────────────────────── */}
      <div className="crud-table-wrap">
        <table className="crud-table">
          <thead>
            <tr>
              <th>Para</th>
              <th>Assunto</th>
              <th>Status</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="5" className="crud-vazio">Carregando...</td>
              </tr>
            )}
            {!isLoading && listaFiltrada.map((e) => (
              <tr key={e.id}>
                <td>
                  <strong style={{ fontSize: "13px" }}>{e.to}</strong>
                </td>
                <td style={{ color: "#374151", fontSize: "13px" }}>{e.subject}</td>
                <td><StatusBadge status={e.status} /></td>
                <td style={{ color: "#6b7280", fontSize: "12px" }}>{fmtData(e.createdAt)}</td>
                <td className="crud-acoes">
                  <button
                    className="crud-acao-btn crud-acao-btn--edit"
                    title="Ver detalhes"
                    onClick={() => handleVerDetalhe(e.id)}
                  >
                    <IcMail />
                  </button>
                  <button
                    className="crud-acao-btn crud-acao-btn--delete"
                    title="Remover"
                    onClick={() => setIdDeletar(e.id)}
                  >
                    <IcTrash />
                  </button>
                </td>
              </tr>
            ))}
            {!isLoading && listaFiltrada.length === 0 && (
              <tr>
                <td colSpan="5" className="crud-vazio">
                  Nenhum e-mail encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Cards mobile ───────────────────────────────────────────────── */}
      <div className="crud-cards">
        {listaFiltrada.map((e) => (
          <div key={e.id} className="crud-card">
            <div className="crud-card-info">
              <span className="crud-card-nome">{e.to}</span>
              <span className="crud-card-data">{e.subject}</span>
              <StatusBadge status={e.status} />
            </div>
            <div className="crud-acoes">
              <button className="crud-acao-btn crud-acao-btn--edit"
                onClick={() => handleVerDetalhe(e.id)}><IcMail /></button>
              <button className="crud-acao-btn crud-acao-btn--delete"
                onClick={() => setIdDeletar(e.id)}><IcTrash /></button>
            </div>
          </div>
        ))}
        <button
          className="crud-criar-btn crud-criar-btn--mobile"
          onClick={() => setIsComposeOpen(true)}
        >
          ✉️ Compor E-mail
        </button>
      </div>

      {/* ══ MODAL: Compor E-mail ══════════════════════════════════════════ */}
      {isComposeOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "520px", width: "100%" }}>
            <h2 style={{ marginBottom: "18px", fontSize: "1.1rem" }}>
              ✉️ Compor E-mail
            </h2>
            <form onSubmit={handleEnviar}>
              <div className="form-group">
                <label>Para (destinatário) *</label>
                <input
                  type="email"
                  required
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="destinatario@exemplo.com"
                />
              </div>
              <div className="form-group">
                <label>Assunto *</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Assunto do e-mail"
                />
              </div>
              <div className="form-group">
                <label>Mensagem *</label>
                <textarea
                  required
                  rows="5"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Escreva o conteúdo do e-mail..."
                  style={{ resize: "vertical" }}
                />
              </div>

              {composeError && (
                <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "10px" }}>
                  ⚠️ {composeError}
                </p>
              )}
              {composeSuccess && (
                <p style={{ color: "#16a34a", fontSize: "13px", marginBottom: "10px" }}>
                  ✅ {composeSuccess}
                </p>
              )}

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setIsComposeOpen(false)}
                  disabled={enviando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-salvar"
                  disabled={enviando}
                >
                  {enviando ? "Enviando..." : "📤 Enviar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ MODAL: Detalhe do E-mail ══════════════════════════════════════ */}
      {isDetalheOpen && emailDetalhe && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "520px", width: "100%" }}>
            <h2 style={{ marginBottom: "18px", fontSize: "1.1rem" }}>
              📨 Detalhes do E-mail
            </h2>

            {[
              { label: "Para",      value: emailDetalhe.to },
              { label: "Assunto",   value: emailDetalhe.subject },
              { label: "Enviado em",value: fmtData(emailDetalhe.createdAt) },
            ].map((f) => (
              <div key={f.label} style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280",
                  textTransform: "uppercase", marginBottom: "3px" }}>{f.label}</div>
                <div style={{ fontSize: "13px", color: "#111827" }}>{f.value || "—"}</div>
              </div>
            ))}

            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280",
                textTransform: "uppercase", marginBottom: "3px" }}>Status</div>
              <StatusBadge status={emailDetalhe.status} />
            </div>

            <div style={{ marginBottom: "12px" }}>
              <div style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280",
                textTransform: "uppercase", marginBottom: "3px" }}>Mensagem</div>
              <div style={{ fontSize: "13px", color: "#111827", whiteSpace: "pre-wrap",
                background: "#f9fafb", padding: "10px", borderRadius: "6px", border: "1px solid #e5e7eb" }}>
                {emailDetalhe.text || "—"}
              </div>
            </div>

            {emailDetalhe.previewUrl && (
              <div style={{ marginBottom: "12px" }}>
                <div style={{ fontSize: "11px", fontWeight: "700", color: "#6b7280",
                  textTransform: "uppercase", marginBottom: "3px" }}>Preview (Ethereal)</div>
                <a
                  href={emailDetalhe.previewUrl}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#2563eb", fontSize: "13px" }}
                >
                  Visualizar e-mail no browser →
                </a>
              </div>
            )}

            {emailDetalhe.error && (
              <p style={{ color: "#dc2626", fontSize: "13px", marginBottom: "12px" }}>
                ⚠️ Erro: {emailDetalhe.error}
              </p>
            )}

            <div className="modal-actions">
              <button className="btn-cancelar" onClick={() => setIsDetalheOpen(false)}>
                Fechar
              </button>
              <button
                onClick={() => setIdDeletar(emailDetalhe.id)}
                style={{ background: "#fee2e2", color: "#dc2626", border: "none",
                  padding: "8px 16px", borderRadius: "4px", fontWeight: "600", cursor: "pointer" }}
              >
                🗑 Remover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ MODAL: Confirmar remoção ══════════════════════════════════════ */}
      {idDeletar !== null && (
        <div className="modal-overlay" style={{ zIndex: 600 }}>
          <div className="modal-content" style={{ maxWidth: "400px", textAlign: "center" }}>
            <h3 style={{ color: "#dc2626", marginBottom: "10px" }}>Remover E-mail</h3>
            <p style={{ fontSize: "0.9rem", color: "#475569", marginBottom: "20px" }}>
              Tem certeza que deseja remover este registro? Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
              <button className="btn-cancelar" onClick={() => setIdDeletar(null)}>
                Cancelar
              </button>
              <button
                onClick={handleConfirmarDeletar}
                style={{ background: "#dc2626", color: "#fff", border: "none",
                  padding: "8px 16px", borderRadius: "4px", fontWeight: "600", cursor: "pointer" }}
              >
                Sim, Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Email;