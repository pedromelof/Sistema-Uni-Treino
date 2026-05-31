import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

function IcTrash() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

function IcSearch() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function CrudLesoes() {
  const navigate = useNavigate();
  const [lesoes, setLesoes] = useState([]);
  const [busca, setBusca] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idLesaoDeletar, setIdLesaoDeletar] = useState(null);

  const [novaLesao, setNovaLesao] = useState({
    nome: "",
    gravidade: "Leve",
    descricao: "",
  });

  useEffect(() => {
    const fetchLesoes = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const res = await api.get("/v1/lesoes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.result.success) {
          setLesoes(res.data.result.lesoes || []);
        }
      } catch (err) {
        console.error("Erro ao buscar lesões", err);
      }
    };

    fetchLesoes();
  }, []);

  const handleChange = (e) => {
    setNovaLesao({ ...novaLesao, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const lesaoFormatada = `${novaLesao.nome} (${novaLesao.gravidade}) - ${novaLesao.descricao}`;

    try {
      const res = await api.post(
        "/v1/lesoes",
        { lesao: lesaoFormatada },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (res.data.result.success) {
        setLesoes(res.data.result.lesoes);
        setNovaLesao({ nome: "", gravidade: "Leve", descricao: "" });
        setIsModalOpen(false);
      }
    } catch (err) {
      console.error("Erro ao salvar", err);
    }
  };

  const handleConfirmarDeletar = async () => {
    if (idLesaoDeletar === null) return;
    const token = localStorage.getItem("token");

    try {
      const res = await api.delete(`/v1/lesoes/${idLesaoDeletar}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.result.success) {
        setLesoes(res.data.result.lesoes);
      }
    } catch (err) {
      console.error("Erro ao deletar", err);
    } finally {
      setIdLesaoDeletar(null);
    }
  };

  function abrirCriacao() {
    setNovaLesao({ nome: "", gravidade: "Leve", descricao: "" });
    setIsModalOpen(true);
  }

  const listaFiltrada = lesoes
    .map((texto, index) => ({ index, texto }))
    .filter((item) => item.texto.toLowerCase().includes(busca.toLowerCase()));

  return (
    <div
      className="crud-content"
      style={{
        width: "100%",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
      }}
    >
      <div
        className="crud-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          width: "100%",
          marginBottom: "20px",
        }}
      >
        <h1 className="crud-titulo" style={{ margin: 0, whiteSpace: "nowrap" }}>
          Lista de Lesões
        </h1>

        <div
          className="crud-search-wrap"
          style={{ flex: 1, maxWidth: "500px" }}
        >
          <span className="crud-search-icon">
            <IcSearch />
          </span>
          <input
            type="text"
            className="crud-search"
            placeholder="Pesquisar..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            aria-label="Pesquisar lesões"
            style={{ width: "100%" }}
          />
        </div>

        <button
          className="crud-criar-btn"
          onClick={abrirCriacao}
          style={{ whiteSpace: "nowrap" }}
        >
          Criar nova lesão
        </button>
      </div>

      <div className="crud-table-wrap">
        <table className="crud-table">
          <thead>
            <tr>
              <th>Descrição da Restrição / Lesão</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {listaFiltrada.map((item) => (
              <tr key={item.index}>
                <td style={{ color: "var(--text-primary)", fontWeight: "600" }}>
                  {item.texto}
                </td>
                <td className="crud-acoes">
                  <button
                    className="crud-acao-btn crud-acao-btn--delete"
                    aria-label="Excluir lesão"
                    onClick={() => setIdLesaoDeletar(item.index)}
                  >
                    <IcTrash />
                  </button>
                </td>
              </tr>
            ))}
            {listaFiltrada.length === 0 && (
              <tr>
                <td colSpan="2" className="crud-vazio">
                  Nenhuma lesão encontrada.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="crud-cards">
        {listaFiltrada.map((item) => (
          <div key={item.index} className="crud-card">
            <div className="crud-card-info">
              <span
                className="crud-card-nome"
                style={{ color: "var(--text-primary)" }}
              >
                {item.texto}
              </span>
            </div>
            <div className="crud-acoes">
              <button
                className="crud-acao-btn crud-acao-btn--delete"
                aria-label="Excluir"
                onClick={() => setIdLesaoDeletar(item.index)}
              >
                <IcTrash />
              </button>
            </div>
          </div>
        ))}
        <button
          className="crud-criar-btn crud-criar-btn--mobile"
          onClick={abrirCriacao}
        >
          Criar nova lesão
        </button>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            style={{ maxWidth: "500px", width: "100%" }}
          >
            <h2>Cadastrar Nova Lesão</h2>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nome da Lesão *</label>
                <input
                  type="text"
                  name="nome"
                  required
                  value={novaLesao.nome}
                  onChange={handleChange}
                  placeholder="Ex: Condromalácia Patelar"
                />
              </div>

              <div className="form-group">
                <label>Gravidade</label>
                <select
                  name="gravidade"
                  value={novaLesao.gravidade}
                  onChange={handleChange}
                >
                  <option value="Leve">Leve</option>
                  <option value="Moderada">Moderada</option>
                  <option value="Grave">Grave</option>
                </select>
              </div>

              <div className="form-group">
                <label>Descrição das Restrições *</label>
                <textarea
                  name="descricao"
                  required
                  value={novaLesao.descricao}
                  onChange={handleChange}
                  placeholder="Ex: Evitar flexão de joelho acima de 90 graus."
                  rows="3"
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-salvar">
                  Salvar Lesão
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {idLesaoDeletar !== null && (
        <div className="modal-overlay" style={{ zIndex: "1100" }}>
          <div
            className="modal-content"
            style={{ maxWidth: "400px", textAlign: "center" }}
          >
            <h3 style={{ color: "#dc2626", marginBottom: "10px" }}>
              Confirmar Exclusão
            </h3>
            <p
              style={{
                fontSize: "0.9rem",
                color: "#475569",
                lineHeight: "1.5",
                marginBottom: "20px",
              }}
            >
              Tem certeza que deseja deletar esta lesão permanentemente? A IA
              deixará de considerar essa restrição nos próximos treinos.
            </p>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "12px" }}
            >
              <button
                type="button"
                className="btn-cancelar"
                onClick={() => setIdLesaoDeletar(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmarDeletar}
                style={{
                  background: "#dc2626",
                  color: "#fff",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CrudLesoes;
