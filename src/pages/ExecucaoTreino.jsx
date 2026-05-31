import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/api";

function ExecucaoTreino() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [treino, setTreino] = useState(null);
  const [segundosGeral, setSegundosGeral] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [estadoExercicios, setEstadoExercicios] = useState({});

  const [tempoDescansoAlvo, setTempoDescansoAlvo] = useState(60);
  const [segundosDescanso, setSegundosDescanso] = useState(0);
  const [descansoAtivo, setDescansoAtivo] = useState(false);
  const timerDescansoRef = useRef(null);

  useEffect(() => {
    const timerGeral = setInterval(() => {
      setSegundosGeral((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timerGeral);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token") || "";

    async function carregarTreino() {
      setIsLoading(true);
      try {
        const response = await api.get(`/v1/treinos/${id}`, {
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        });

        if (response.operacaoFinalizada === false) {
          throw new Error(
            response.mensagem?.detalhe ||
              response.mensagem?.msg ||
              "Falha ao carregar treino.",
          );
        }

        const resultado = response.result || response;
        setTreino({
          ...resultado,
          id: resultado._id || resultado.id,
        });

        setEstadoExercicios(
          (resultado.exercicios || []).reduce((acc, ex) => {
            acc[ex._id || ex.id || ex.nome] = Array.from(
              { length: ex.series },
              (_, i) => ({
                numero: i + 1,
                concluida: false,
                carga: ex.carga || 0,
              }),
            );
            return acc;
          }, {}),
        );
      } catch (error) {
        console.error("Erro ao carregar treino:", error);
        setTreino(null);
      } finally {
        setIsLoading(false);
      }
    }

    carregarTreino();
  }, [id]);

  useEffect(() => {
    if (descansoAtivo && segundosDescanso > 0) {
      timerDescansoRef.current = setInterval(() => {
        setSegundosDescanso((prev) => prev - 1);
      }, 1000);
    } else if (segundosDescanso === 0 && descansoAtivo) {
      setDescansoAtivo(false);
      clearInterval(timerDescansoRef.current);
      alert("Descanso finalizado! Hora da próxima série.");
    }

    return () => clearInterval(timerDescansoRef.current);
  }, [descansoAtivo, segundosDescanso]);

  const formatarTempo = (totalSegundos) => {
    const hrs = Math.floor(totalSegundos / 3600);
    const mins = Math.floor((totalSegundos % 3600) / 60);
    const secs = totalSegundos % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const iniciarDescanso = () => {
    setSegundosDescanso(tempoDescansoAlvo);
    setDescansoAtivo(true);
  };

  const resetarDescanso = () => {
    setDescansoAtivo(false);
    setSegundosDescanso(0);
  };

  const toggleSerie = (exId, indexSerie) => {
    setEstadoExercicios((prev) => {
      const novasSeries = [...prev[exId]];
      novasSeries[indexSerie] = {
        ...novasSeries[indexSerie],
        concluida: !novasSeries[indexSerie].concluida,
      };
      return { ...prev, [exId]: novasSeries };
    });
  };

  const alterarCargaSerie = (exId, indexSerie, novaCarga) => {
    setEstadoExercicios((prev) => {
      const novasSeries = [...prev[exId]];
      novasSeries[indexSerie] = {
        ...novasSeries[indexSerie],
        carga: parseInt(novaCarga) || 0,
      };
      return { ...prev, [exId]: novasSeries };
    });
  };

  const handleFinalizarTreino = () => {
    alert(
      `Treino finalizado com sucesso!\nTempo total: ${formatarTempo(segundosGeral)}`,
    );
    navigate("/gerencia-treino");
  };

  if (isLoading) {
    return (
      <div className="chat-page">
        <div className="chat-body">
          <main className="crud-main" aria-label="Carregando treino">
            <p>Carregando treino...</p>
          </main>
        </div>
      </div>
    );
  }

  if (!treino) {
    return (
      <div className="chat-page">
        <div className="chat-body">
          <main className="crud-main" aria-label="Treino não encontrado">
            <p>
              Treino não encontrado. Verifique se o treino existe ou recarregue
              a página.
            </p>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="chat-page">
      <div className="chat-body">
        <main className="crud-main" aria-label="Execução de treino">
          <div
            className="crud-topbar"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "15px",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                display: "flex",
                width: "100%",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div className="cronometro-box">
                <span>
                  Tempo Geral: <strong>{formatarTempo(segundosGeral)}</strong>
                </span>
              </div>
              <button
                className="btn-voltar-top"
                onClick={() => navigate("/gerencia-treino")}
              >
                Voltar para Lista
              </button>
            </div>

            <div
              style={{
                background: "#f1f5f9",
                padding: "15px",
                borderRadius: "8px",
                width: "100%",
                boxSizing: "border-box",
                border: "1px solid #cbd5e1",
              }}
            >
              <h4
                style={{
                  margin: "0 0 10px 0",
                  fontSize: "0.95rem",
                  color: "#1e293b",
                }}
              >
                Cronômetro de Descanso entre Séries
              </h4>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "15px",
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <label style={{ fontSize: "0.85rem", fontWeight: "600" }}>
                    Tempo:
                  </label>
                  <select
                    value={tempoDescansoAlvo}
                    onChange={(e) =>
                      setTempoDescansoAlvo(parseInt(e.target.value))
                    }
                    disabled={descansoAtivo}
                    style={{
                      padding: "6px",
                      borderRadius: "4px",
                      border: "1px solid #cbd5e1",
                    }}
                  >
                    <option value={30}>30 segundos</option>
                    <option value={45}>45 segundos</option>
                    <option value={60}>1 minuto</option>
                    <option value={90}>1 minuto e 30s</option>
                    <option value={120}>2 minutos</option>
                  </select>
                </div>

                <div style={{ display: "flex", gap: "8px" }}>
                  {!descansoAtivo ? (
                    <button
                      type="button"
                      onClick={iniciarDescanso}
                      style={{
                        background: "#2563eb",
                        color: "white",
                        border: "none",
                        padding: "6px 14px",
                        borderRadius: "4px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Iniciar Descanso ({tempoDescansoAlvo}s)
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={resetarDescanso}
                      style={{
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        padding: "6px 14px",
                        borderRadius: "4px",
                        fontWeight: "600",
                        cursor: "pointer",
                      }}
                    >
                      Parar / Resetar
                    </button>
                  )}
                </div>

                {segundosDescanso > 0 && (
                  <div
                    style={{
                      background: "#fef08a",
                      color: "#854d0e",
                      padding: "6px 16px",
                      borderRadius: "20px",
                      fontWeight: "bold",
                      fontSize: "1.1rem",
                      animation: "pulse 1s infinite",
                    }}
                  >
                    Descansando: {segundosDescanso}s
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="execution-header" style={{ marginTop: "20px" }}>
            <h1 className="crud-titulo">{treino.nome}</h1>
            <p className="treino-subdesc">{treino.descricao}</p>
          </div>

          <div className="exercicios-execution-list">
            {treino.exercicios.map((ex) => {
              const infoSeries = estadoExercicios[ex.id] || [];
              const feitas = infoSeries.filter((s) => s.concluida).length;
              const total = ex.series;

              return (
                <div
                  key={ex.id}
                  className="exercicio-card-exec"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "stretch",
                    gap: "12px",
                    background: feitas === total ? "#d4edda" : "#fff",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <h3
                        style={{
                          margin: "0",
                          fontSize: "1.2rem",
                          color: "#0f172a",
                        }}
                      >
                        {ex.nome}
                      </h3>
                      {ex.observacao && (
                        <p
                          style={{
                            margin: "4px 0 0 0",
                            fontSize: "0.85rem",
                            color: "#64748b",
                          }}
                        >
                          {ex.observacao}
                        </p>
                      )}
                    </div>
                    <div
                      style={{
                        background: "#e2e8f0",
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontWeight: "bold",
                        fontSize: "0.9rem",
                        color: "#334155",
                      }}
                    >
                      Progresso: {feitas} / {total} séries
                    </div>
                  </div>

                  <div
                    style={{
                      background: "#f8fafc",
                      padding: "10px",
                      borderRadius: "6px",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {infoSeries.map((serie, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "6px 0",
                          borderBottom:
                            index !== infoSeries.length - 1
                              ? "1px solid #e2e8f0"
                              : "none",
                          opacity: serie.concluida ? 0.6 : 1,
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <input
                            type="checkbox"
                            checked={serie.concluida}
                            onChange={() => toggleSerie(ex.id, index)}
                            style={{
                              width: "18px",
                              height: "18px",
                              cursor: "pointer",
                            }}
                          />
                          <span
                            style={{ fontWeight: "600", fontSize: "0.9rem" }}
                          >
                            Série {serie.numero}
                          </span>
                          <span
                            style={{ color: "#64748b", fontSize: "0.85rem" }}
                          >
                            ({ex.repeticoes} Reps)
                          </span>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <label
                            style={{ fontSize: "0.8rem", color: "#475569" }}
                          >
                            Carga:
                          </label>
                          <input
                            type="number"
                            value={serie.carga}
                            onChange={(e) =>
                              alterarCargaSerie(ex.id, index, e.target.value)
                            }
                            style={{
                              width: "60px",
                              padding: "4px",
                              border: "1px solid #cbd5e1",
                              borderRadius: "4px",
                              textAlign: "center",
                            }}
                          />
                          <span
                            style={{ fontSize: "0.85rem", color: "#475569" }}
                          >
                            kg
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>

          <div
            className="execution-footer-actions"
            style={{ marginTop: "30px" }}
          >
            <button
              className="btn-finalizar-treino"
              onClick={handleFinalizarTreino}
            >
              Finalizar Treino Completo
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ExecucaoTreino;
