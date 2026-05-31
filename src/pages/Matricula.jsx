import { useEffect, useState } from "react";
import { api } from "../../lib/api";

const API_URL = "https://matricula-y5i0.onrender.com/matriculas";

const STATUS_COLORS = {
  ATIVA:     { bg: "#dcfce7", color: "#166534" },
  CANCELADA: { bg: "#fee2e2", color: "#991b1b" },
  TRANCADA:  { bg: "#fef3c7", color: "#92400e" },
  CONCLUIDA: { bg: "#dbeafe", color: "#1e40af" },
  PENDENTE:  { bg: "#fef9c3", color: "#854d0e" },
};

function StatusBadge({ status }) {
  const s = STATUS_COLORS[status] || { bg: "#f1f5f9", color: "#475569" };
  return (
    <span style={{
      background: s.bg, color: s.color,
      padding: "3px 10px", borderRadius: "99px",
      fontSize: "11px", fontWeight: "700", textTransform: "uppercase"
    }}>
      {status}
    </span>
  );
}

function IcEdit() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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

function Matricula() {
  const [busca, setBusca] = useState("");
  const [lista, setLista] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idDeletar, setIdDeletar] = useState(null);

  const [alunoId, setAlunoId] = useState("");
  const [nomeAluno, setNomeAluno] = useState("");
  const [cursoId, setCursoId] = useState("");
  const [nomeCurso, setNomeCurso] = useState("");
  const [turmaId, setTurmaId] = useState("");
  const [nomeTurma, setNomeTurma] = useState("");
  const [observacao, setObservacao] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || "";
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  async function fetchMatriculas() {
    setIsLoading(true);
    try {
      const response = await api.get(API_URL, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      const dados = response.data || response;
      setLista(Array.isArray(dados) ? dados : []);
    } catch (err) {
      console.error("Erro ao buscar matrículas:", err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchMatriculas();
  }, []);

  const listaFiltrada = lista.filter((m) =>
    m.nomeAluno?.toLowerCase().includes(busca.toLowerCase()) ||
    m.nomeCurso?.toLowerCase().includes(busca.toLowerCase())
  );

  function abrirCriacao() {
    setAlunoId(""); setNomeAluno("");
    setCursoId(""); setNomeCurso("");
    setTurmaId(""); setNomeTurma("");
    setObservacao("");
    setIsModalOpen(true);
  }

  async function handleSalvar(e) {
    e.preventDefault();
    try {
      const payload = {
        alunoId: Number(alunoId),
        cursoId: Number(cursoId),
        turmaId: Number(turmaId),
        nomeAluno, nomeCurso, nomeTurma,
        observacao: observacao || null,
      };
      const response = await api.post(API_URL, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
        ...payload,
      });
      const nova = response.data || response;
      setLista((prev) => [...prev, nova]);
      setIsModalOpen(false);
    } catch (err) {
      alert(err.message || "Erro ao cadastrar matrícula.");
    }
  }

  async function handleCancelar(id) {
    if (!confirm("Cancelar esta matrícula?")) return;
    try {
      await api.patch(`${API_URL}/${id}/cancelar`, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      fetchMatriculas();
    } catch (err) {
      alert(err.message || "Erro ao cancelar.");
    }
  }

  async function handleTrancar(id) {
    if (!confirm("Trancar esta matrícula?")) return;
    try {
      await api.patch(`${API_URL}/${id}/trancar`, {
        headers: { "Content-Type": "application/json", ...getAuthHeaders() },
      });
      fetchMatriculas();
    } catch (err) {
      alert(err.message || "Erro ao trancar.");
    }
  }

  async function handleConfirmarDeletar() {
    try {
      await handleCancelar(idDeletar);
    } finally {
      setIdDeletar(null);
    }
  }

  return (
    <div className="crud-content" style={{ width: "100%", maxWidth: "100%",
      display: "flex", flexDirection: "column", flex: 1 }}>

      <div className="crud-header" style={{ display: "flex", alignItems: "center",
        justifyContent: "space-between", gap: "20px", width: "100%", marginBottom: "20px" }}>
        <h1 className="crud-titulo" style={{ margin: 0, whiteSpace: "nowrap" }}>
          Matrículas
        </h1>
        <div className="crud-search-wrap" style={{ flex: 1, maxWidth: "500px" }}>
          <span className="crud-search-icon"><IcSearch /></span>
          <input type="text" className="crud-search" placeholder="Pesquisar aluno ou curso..."
            value={busca} onChange={(e) => setBusca(e.target.value)}
            style={{ width: "100%" }} />
        </div>
        <button className="crud-criar-btn" onClick={abrirCriacao}
          style={{ whiteSpace: "nowrap" }}>
          Nova matrícula
        </button>
      </div>

      <div className="crud-table-wrap">
        <table className="crud-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Aluno</th>
              <th>Curso / Turma</th>
              <th>Data</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan="6" className="crud-vazio">Carregando...</td></tr>
            )}
            {!isLoading && listaFiltrada.map((m) => (
              <tr key={m.id}>
                <td>#{m.id}</td>
                <td>
                  <strong>{m.nomeAluno}</strong>
                  <br />
                  <small style={{ color: "#94a3b8" }}>ID {m.alunoId}</small>
                </td>
                <td>
                  {m.nomeCurso}
                  <br />
                  <small style={{ color: "#94a3b8" }}>{m.nomeTurma}</small>
                </td>
                <td>{m.dataMatricula}</td>
                <td><StatusBadge status={m.status} /></td>
                <td className="crud-acoes">
                  {m.status === "ATIVA" && (
                    <button className="crud-acao-btn crud-acao-btn--edit"
                      title="Trancar" onClick={() => handleTrancar(m.id)}>
                      🔒
                    </button>
                  )}
                  {m.status !== "CANCELADA" && m.status !== "CONCLUIDA" && (
                    <button className="crud-acao-btn crud-acao-btn--delete"
                      title="Cancelar" onClick={() => setIdDeletar(m.id)}>
                      <IcTrash />
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {!isLoading && listaFiltrada.length === 0 && (
              <tr><td colSpan="6" className="crud-vazio">Nenhuma matrícula encontrada.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards mobile */}
      <div className="crud-cards">
        {listaFiltrada.map((m) => (
          <div key={m.id} className="crud-card">
            <div className="crud-card-info">
              <span className="crud-card-nome">{m.nomeAluno}</span>
              <span className="crud-card-data">{m.nomeCurso}</span>
              <StatusBadge status={m.status} />
            </div>
            <div className="crud-acoes">
              {m.status === "ATIVA" && (
                <button className="crud-acao-btn crud-acao-btn--edit"
                  onClick={() => handleTrancar(m.id)}>🔒</button>
              )}
              {m.status !== "CANCELADA" && m.status !== "CONCLUIDA" && (
                <button className="crud-acao-btn crud-acao-btn--delete"
                  onClick={() => setIdDeletar(m.id)}><IcTrash /></button>
              )}
            </div>
          </div>
        ))}
        <button className="crud-criar-btn crud-criar-btn--mobile" onClick={abrirCriacao}>
          Nova matrícula
        </button>
      </div>

      {/* Modal cadastro */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: "600px", width: "100%" }}>
            <h2>Cadastrar Nova Matrícula</h2>
            <form onSubmit={handleSalvar}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div className="form-group">
                  <label>ID do Aluno *</label>
                  <input type="number" required value={alunoId}
                    onChange={(e) => setAlunoId(e.target.value)} placeholder="Ex: 10" />
                </div>
                <div className="form-group">
                  <label>Nome do Aluno *</label>
                  <input type="text" required value={nomeAluno}
                    onChange={(e) => setNomeAluno(e.target.value)} placeholder="Ex: Maria Silva" />
                </div>
                <div className="form-group">
                  <label>ID do Curso *</label>
                  <input type="number" required value={cursoId}
                    onChange={(e) => setCursoId(e.target.value)} placeholder="Ex: 5" />
                </div>
                <div className="form-group">
                  <label>Nome do Curso *</label>
                  <input type="text" required value={nomeCurso}
                    onChange={(e) => setNomeCurso(e.target.value)}
                    placeholder="Ex: Engenharia de Software" />
                </div>
                <div className="form-group">
                  <label>ID da Turma *</label>
                  <input type="number" required value={turmaId}
                    onChange={(e) => setTurmaId(e.target.value)} placeholder="Ex: 200" />
                </div>
                <div className="form-group">
                  <label>Nome da Turma *</label>
                  <input type="text" required value={nomeTurma}
                    onChange={(e) => setNomeTurma(e.target.value)}
                    placeholder="Ex: Turma A - Manhã" />
                </div>
                <div className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <label>Observação</label>
                  <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)}
                    placeholder="Opcional" rows="2" />
                </div>
              </div>
              <div className="modal-actions" style={{ marginTop: "20px" }}>
                <button type="button" className="btn-cancelar"
                  onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-salvar">Salvar Matrícula</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal confirmar cancelamento */}
      {idDeletar !== null && (
        <div className="modal-overlay" style={{ zIndex: "1100" }}>
          <div className="modal-content" style={{ maxWidth: "400px", textAlign: "center" }}>
            <h3 style={{ color: "#dc2626", marginBottom: "10px" }}>Cancelar Matrícula</h3>
            <p style={{ fontSize: "0.9rem", color: "#475569", marginBottom: "20px" }}>
              Tem certeza que deseja cancelar esta matrícula? Esta ação não pode ser desfeita.
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
              <button type="button" className="btn-cancelar"
                onClick={() => setIdDeletar(null)}>Voltar</button>
              <button type="button" onClick={handleConfirmarDeletar}
                style={{ background: "#dc2626", color: "#fff", border: "none",
                  padding: "8px 16px", borderRadius: "4px", fontWeight: "600", cursor: "pointer" }}>
                Sim, Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Matricula;