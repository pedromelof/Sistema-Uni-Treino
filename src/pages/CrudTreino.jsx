import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

function IcEdit() {
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
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

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

function IcPlay() {
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
      <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
    </svg>
  );
}

function CrudTreino() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [lista, setLista] = useState([]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [idTreinoEdicao, setIdTreinoEdicao] = useState(null);
  const [idTreinoDeletar, setIdTreinoDeletar] = useState(null);
  const [treinoDetalhado, setTreinoDetalhado] = useState(null);

  const [novoNome, setNovoNome] = useState("");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novaDuracao, setNovaDuracao] = useState("");
  const [exerciciosForm, setExerciciosForm] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [exNome, setExNome] = useState("");
  const [exSeries, setExSeries] = useState("");
  const [exReps, setExReps] = useState("");
  const [exCarga, setExCarga] = useState("");
  const [exObs, setExObs] = useState("");

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token") || "";
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  async function fetchTreinos() {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await api.get(
          "https://servicetreino-unitreino.onrender.com/treinos",
          {
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
          },
        );

        if (response.operacaoFinalizada === false) {
          throw new Error(
            response.mensagem?.detalhe || "Falha ao buscar treinos.",
          );
        }

        if (response.operacaoFinalizada === false) {
          throw new Error(
            response.mensagem?.detalhe ||
              response.mensagem?.msg ||
              "Falha ao buscar treinos.",
          );
        }

        const dadosOriginais = response.data?.result || response.data || [];
        const treinosNormalizados = dadosOriginais.map((t) => ({
          ...t,
          id: t._id || t.id,
        }));

        setLista(treinosNormalizados || []);
      } catch (err) {
        console.error("Erro ao buscar treinos:", err);
      } finally {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    fetchTreinos();
  }, []);

  const listaFiltrada = (lista || []).filter((t) =>
    t.nome.toLowerCase().includes(busca.toLowerCase()),
  );

  function handleAdicionarExercicioNoForm() {
    if (!exNome || !exSeries || !exReps) {
      alert("Por favor, preencha o nome, séries e repetições do exercício.");
      return;
    }
    const novoEx = {
      id: "ex_" + Date.now(),
      nome: exNome,
      series: parseInt(exSeries),
      repeticoes: parseInt(exReps),
      carga: parseInt(exCarga) || 0,
      observacao: exObs,
    };
    setExerciciosForm([...exerciciosForm, novoEx]);

    setExNome("");
    setExSeries("");
    setExReps("");
    setExCarga("");
    setExObs("");
  }

  function handleRemoverExercicioNoForm(idEx) {
    setExerciciosForm(exerciciosForm.filter((ex) => ex.id !== idEx));
  }

  function abrirCriacao() {
    setIdTreinoEdicao(null);
    setNovoNome("");
    setNovaDescricao("");
    setNovaDuracao("");
    setExerciciosForm([]);
    setIsModalOpen(true);
  }

  function abrirEdicao(treino) {
    setIdTreinoEdicao(treino.id);
    setNovoNome(treino.nome);
    setNovaDescricao(treino.descricao || "");
    setNovaDuracao(treino.duracaoMinutos || "");
    setExerciciosForm(treino.exercicios || []);
    setIsModalOpen(true);
  }

  async function handleSalvarTreino(e) {
    e.preventDefault();
    if (!novoNome || !novaDuracao) return;

    const formatoExercicios = exerciciosForm.map((ex) => ({
      nome: ex.nome,
      series: Number(ex.series),
      repeticoes: Number(ex.repeticoes),
      carga: Number(ex.carga) || 0,
      observacao: ex.observacao || "",
    }));

    try {
      const url = idTreinoEdicao ? `/treinos/${idTreinoEdicao}` : "/treinos";
      const method = idTreinoEdicao ? "PUT" : "POST";

      let response = {};
      if (method === "PUT") {
        response = await api.put(
          "https://servicetreino-unitreino.onrender.com" + url,
          {
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
            nome: novoNome,
            descricao: novaDescricao,
            duracaoMinutos: Number(novaDuracao),
            exercicios: formatoExercicios,
          },
        );
      } else {
        response = await api.post(
          "https://servicetreino-unitreino.onrender.com" + url,
          {
            headers: {
              "Content-Type": "application/json",
              ...getAuthHeaders(),
            },
            nome: novoNome,
            descricao: novaDescricao,
            duracaoMinutos: Number(novaDuracao),
            exercicios: formatoExercicios,
          },
        );
      }

      if (response.operacaoFinalizada === false) {
        throw new Error(
          response.mensagem?.detalhe ||
            response.mensagem?.msg ||
            "Falha ao salvar treino.",
        );
      }

      const data = response.data || response;
      const resultado = data.result || data;
      const treinoSalvo = {
        ...resultado,
        id: resultado._id || resultado.id,
        dia: resultado.dia || "A definir",
        ultima: resultado.ultima || "Nunca realizado",
      };

      if (idTreinoEdicao) {
        setLista((prev) =>
          prev.map((t) => (t.id === idTreinoEdicao ? treinoSalvo : t)),
        );
        if (treinoDetalhado && treinoDetalhado.id === idTreinoEdicao) {
          setTreinoDetalhado(treinoSalvo);
        }
      } else {
        setLista((prev) => [...prev, treinoSalvo]);
      }

      setIsModalOpen(false);
      setIdTreinoEdicao(null);
      setNovoNome("");
      setNovaDescricao("");
      setNovaDuracao("");
      setExerciciosForm([]);
    } catch (err) {
      console.error(err);
      alert(err.message || "Erro ao salvar o treino. Verifique seus dados.");
    }
  }

  async function handleConfirmarDeletar() {
    try {
      const response = await api.delete(
        `https://servicetreino-unitreino.onrender.com/treinos/${idTreinoDeletar}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          },
        },
      );
      if (response.operacaoFinalizada === false) {
        throw new Error(
          response.mensagem?.detalhe ||
            response.mensagem?.msg ||
            "Falha ao excluir treino.",
        );
      }
      setLista((prev) => prev.filter((t) => t.id !== idTreinoDeletar));
      if (treinoDetalhado && treinoDetalhado.id === idTreinoDeletar) {
        setTreinoDetalhado(null);
      }
    } catch (err) {
      console.error(err);
      alert(err.message || "Erro ao excluir o treino.");
    } finally {
      setIdTreinoDeletar(null);
    }
  }

  // Corrigido para readAsDataURL
  function handleUploadFoto(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const treinoAtualizado = { ...treinoDetalhado, foto: reader.result };
        setTreinoDetalhado(treinoAtualizado);
        setLista((prev) =>
          prev.map((t) => (t.id === treinoDetalhado.id ? treinoAtualizado : t)),
        );
      };
      reader.readAsDataURL(file);
    }
  }

  function handleExcluirFoto() {
    const comboSemFoto = { ...treinoDetalhado, foto: null };
    setTreinoDetalhado(comboSemFoto);
    setLista((prev) =>
      prev.map((t) => (t.id === treinoDetalhado.id ? comboSemFoto : t)),
    );
  }

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
      {!treinoDetalhado ? (
        <>
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
            <h1
              className="crud-titulo"
              style={{ margin: 0, whiteSpace: "nowrap" }}
            >
              Lista de Treinos
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
              Criar novo treino
            </button>
          </div>

          <div className="crud-table-wrap">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>Nome do treino</th>
                  <th>Dia do treino</th>
                  <th>Última realização</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {listaFiltrada.map((t) => (
                  <tr key={t.id}>
                    <td
                      onClick={() => setTreinoDetalhado(t)}
                      style={{
                        cursor: "pointer",
                        color: "#2b2b2b",
                        fontWeight: "600",
                      }}
                    >
                      {t.nome}
                    </td>
                    <td>{t.dia || "A definir"}</td>
                    <td>{t.ultima || "Nunca realizado"}</td>
                    <td className="crud-acoes">
                      <button
                        className="crud-acao-btn crud-acao-btn--edit"
                        aria-label="Editar treino"
                        onClick={() => abrirEdicao(t)}
                      >
                        <IcEdit />
                      </button>
                      <button
                        className="crud-acao-btn crud-acao-btn--delete"
                        aria-label="Excluir treino"
                        onClick={() => setIdTreinoDeletar(t.id)}
                      >
                        <IcTrash />
                      </button>
                    </td>
                  </tr>
                ))}
                {listaFiltrada.length === 0 && (
                  <tr>
                    <td colSpan="4" className="crud-vazio">
                      Nenhum treino encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="crud-cards">
            {listaFiltrada.map((t) => (
              <div key={t.id} className="crud-card">
                <div
                  className="crud-card-info"
                  onClick={() => setTreinoDetalhado(t)}
                  style={{ cursor: "pointer" }}
                >
                  <span className="crud-card-nome" style={{ color: "#1d1d1d" }}>
                    {t.nome}
                  </span>
                  <span className="crud-card-data">
                    {t.ultima || "Nunca realizado"}
                  </span>
                </div>
                <div className="crud-acoes">
                  <button
                    className="crud-acao-btn crud-acao-btn--play"
                    onClick={() => navigate(`/execucao-treino/${t.id}`)}
                  >
                    <IcPlay />
                  </button>
                  <button
                    className="crud-acao-btn crud-acao-btn--edit"
                    aria-label="Editar"
                    onClick={() => abrirEdicao(t)}
                  >
                    <IcEdit />
                  </button>
                  <button
                    className="crud-acao-btn crud-acao-btn--delete"
                    aria-label="Excluir"
                    onClick={() => setIdTreinoDeletar(t.id)}
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
              Criar novo treino
            </button>
          </div>
        </>
      ) : (
        <div className="detalhes-treino-completo">
          <div className="crud-topbar">
            <button
              className="btn-voltar-top"
              onClick={() => setTreinoDetalhado(null)}
            >
              ← Voltar para Lista
            </button>
          </div>

          <div className="crud-header" style={{ marginBottom: "20px" }}>
            <div>
              <h1 className="crud-titulo">{treinoDetalhado.nome}</h1>
              <p style={{ color: "#64748b", margin: "4px 0" }}>
                {treinoDetalhado.descricao || "Sem descrição informada."}
              </p>
              <span className="card-time-badge">
                Duração: {treinoDetalhado.duracaoMinutos} min
              </span>
            </div>
            <button
              className="crud-criar-btn"
              onClick={() => abrirEdicao(treinoDetalhado)}
            >
              Editar esta ficha
            </button>
          </div>

          <div
            className="split-form-layout"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "30px",
            }}
          >
            <div className="col-foto-container">
              <h3 style={{ marginBottom: "15px", fontSize: "1.1rem" }}>
                Imagem Informativa do Treino
              </h3>

              {treinoDetalhado.foto ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    alignItems: "center",
                  }}
                >
                  <img
                    src={treinoDetalhado.foto}
                    alt="Foto do Treino"
                    style={{
                      maxWidth: "100%",
                      maxHeight: "300px",
                      borderRadius: "8px",
                      objectFit: "cover",
                      boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    }}
                  />
                  <div style={{ display: "flex", gap: "10px" }}>
                    <label
                      className="crud-criar-btn"
                      style={{
                        padding: "8px 14px",
                        fontSize: "0.85rem",
                        cursor: "pointer",
                      }}
                    >
                      Alterar Foto
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleUploadFoto}
                        style={{ display: "none" }}
                      />
                    </label>
                    <button
                      className="crud-acao-btn crud-acao-btn--delete"
                      style={{
                        background: "#fee2e2",
                        color: "#dc2626",
                        padding: "8px 14px",
                        borderRadius: "6px",
                        border: "none",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                      onClick={handleExcluirFoto}
                    >
                      Excluir Foto
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    border: "2px dashed #cbd5e1",
                    padding: "4px 20px",
                    borderRadius: "10px",
                    textAlign: "center",
                    background: "#f8fafc",
                  }}
                >
                  <p style={{ color: "#64748b", margin: "15px 0" }}>
                    Nenhuma foto anexada a este treino.
                  </p>
                  <label
                    className="crud-criar-btn"
                    style={{
                      display: "inline-block",
                      padding: "8px 16px",
                      cursor: "pointer",
                      marginBottom: "15px",
                    }}
                  >
                    📸 Fazer Upload de Foto
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadFoto}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              )}
            </div>

            <div className="col-exercicios-container">
              <h3 style={{ marginBottom: "15px", fontSize: "1.1rem" }}>
                Ficha de Exercícios Vinculados (
                {treinoDetalhado.exercicios?.length || 0})
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                {treinoDetalhado.exercicios?.map((ex, idx) => (
                  <div
                    key={ex.id || idx}
                    style={{
                      background: "#f8fafc",
                      padding: "14px",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    <h4
                      style={{
                        margin: "0 0 6px 0",
                        fontSize: "1rem",
                        color: "#0f172a",
                      }}
                    >
                      {ex.nome}
                    </h4>
                    <div
                      style={{
                        display: "flex",
                        gap: "15px",
                        fontSize: "0.85rem",
                        color: "#475569",
                      }}
                    >
                      <span>
                        <strong>Séries:</strong> {ex.series}
                      </span>
                      <span>
                        <strong>Reps:</strong> {ex.repeticoes}
                      </span>
                      <span>
                        <strong>Carga:</strong> {ex.carga}kg
                      </span>
                    </div>
                    {ex.observacao && (
                      <p
                        style={{
                          margin: "6px 0 0 0",
                          fontSize: "0.8rem",
                          color: "#64748b",
                          fontStyle: "italic",
                        }}
                      >
                        💡 {ex.observacao}
                      </p>
                    )}
                  </div>
                ))}
                {(!treinoDetalhado.exercicios ||
                  treinoDetalhado.exercicios.length === 0) && (
                  <p style={{ color: "#94a3b8", fontStyle: "italic" }}>
                    Nenhum exercício cadastrado nesta ficha.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="modal-overlay">
          <div
            className="modal-content"
            style={{ maxWidth: "800px", width: "100%" }}
          >
            <h2>
              {idTreinoEdicao
                ? "Editar Ficha de Treino"
                : "Cadastrar Novo Treino"}
            </h2>

            <form onSubmit={handleSalvarTreino}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <div>
                  <div className="form-group">
                    <label>Nome do Treino *</label>
                    <input
                      type="text"
                      required
                      value={novoNome}
                      onChange={(e) => setNovoNome(e.target.value)}
                      placeholder="Ex: Treino A - Peito e Tríceps"
                    />
                  </div>

                  <div className="form-group">
                    <label>Descrição</label>
                    <textarea
                      value={novaDescricao}
                      onChange={(e) => setNovaDescricao(e.target.value)}
                      placeholder="Ex: Foco em progressão de carga no supino"
                      rows="3"
                    />
                  </div>

                  <div className="form-group">
                    <label>Duração Estimada (minutos) *</label>
                    <input
                      type="number"
                      required
                      value={novaDuracao}
                      onChange={(e) => setNovaDuracao(e.target.value)}
                      placeholder="Ex: 60"
                    />
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label style={{ fontWeight: "bold", marginBottom: "8px" }}>
                    Exercícios do Treino
                  </label>

                  <div
                    style={{
                      background: "#f1f5f9",
                      padding: "10px",
                      borderRadius: "6px",
                      marginBottom: "10px",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Nome do Exercício (ex: Leg Press)"
                      value={exNome}
                      onChange={(e) => setExNome(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "6px",
                        marginBottom: "6px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "4px",
                      }}
                    />
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "6px",
                        marginBottom: "6px",
                      }}
                    >
                      <input
                        type="number"
                        placeholder="Séries"
                        value={exSeries}
                        onChange={(e) => setExSeries(e.target.value)}
                        style={{
                          padding: "6px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Reps"
                        value={exReps}
                        onChange={(e) => setExReps(e.target.value)}
                        style={{
                          padding: "6px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                        }}
                      />
                      <input
                        type="number"
                        placeholder="Carga kg"
                        value={exCarga}
                        onChange={(e) => setExCarga(e.target.value)}
                        style={{
                          padding: "6px",
                          border: "1px solid #cbd5e1",
                          borderRadius: "4px",
                        }}
                      />
                    </div>
                    <input
                      type="text"
                      placeholder="Observações rápidas..."
                      value={exObs}
                      onChange={(e) => setExObs(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "6px",
                        marginBottom: "8px",
                        border: "1px solid #cbd5e1",
                        borderRadius: "4px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={handleAdicionarExercicioNoForm}
                      style={{
                        width: "100%",
                        background: "#0f172a",
                        color: "#fff",
                        border: "none",
                        padding: "6px",
                        borderRadius: "4px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      + Incluir Exercício
                    </button>
                  </div>

                  <div
                    style={{
                      maxHeight: "140px",
                      overflowY: "auto",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    {(exerciciosForm || []).map((ex) => (
                      <div
                        key={ex.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          background: "#fff",
                          padding: "6px 10px",
                          borderRadius: "4px",
                          border: "1px solid #cbd5e1",
                        }}
                      >
                        <div style={{ fontSize: "0.85rem" }}>
                          <strong style={{ display: "block" }}>
                            {ex.nome}
                          </strong>
                          <span style={{ color: "#64748b" }}>
                            {ex.series}x{ex.repeticoes} — {ex.carga}kg
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoverExercicioNoForm(ex.id)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            fontSize: "1.1rem",
                            cursor: "pointer",
                            fontWeight: "bold",
                          }}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                    {(!exerciciosForm || exerciciosForm.length === 0) && (
                      <p
                        style={{
                          color: "#94a3b8",
                          fontStyle: "italic",
                          fontSize: "0.85rem",
                          textAlign: "center",
                        }}
                      >
                        Ficha sem exercícios.
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-actions" style={{ marginTop: "20px" }}>
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-salvar">
                  {idTreinoEdicao ? "Atualizar Ficha" : "Salvar Treino"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {idTreinoDeletar !== null && (
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
              Tem certeza que deseja deletar este treino permanentemente? Todos
              os dados de exercícios e imagens vinculados serão perdidos.
            </p>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "12px" }}
            >
              <button
                type="button"
                className="btn-cancelar"
                onClick={() => setIdTreinoDeletar(null)}
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

export default CrudTreino;
