import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const API_BASE = "https://paymentunitreino.onrender.com";

function fmt(v) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(v || 0);
}
function fmtDate(d) {
  if (!d) return "—";
  const [y, m, day] = d.split("-");
  return `${day}/${m}/${y}`;
}
function today() {
  return new Date().toISOString().split("T")[0];
}

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
function IcTag() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
      <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
  );
}

function PaidBadge({ paid, vencido }) {
  let bg, color, label;
  if (paid) {
    bg = "#dcfce7";
    color = "#166534";
    label = "Pago";
  } else if (vencido) {
    bg = "#fee2e2";
    color = "#991b1b";
    label = "Vencido";
  } else {
    bg = "#fef3c7";
    color = "#92400e";
    label = "Pendente";
  }
  return (
    <span
      style={{
        background: bg,
        color,
        padding: "3px 10px",
        borderRadius: "99px",
        fontSize: "11px",
        fontWeight: "700",
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
  );
}

function Pagamento() {
  const navigate = useNavigate();

  const [pagamentos, setPagamentos] = useState([]);
  const [tipos, setTipos] = useState([]);
  const [loading, setLoading] = useState(false);

  const [tab, setTab] = useState("pagamento");
  const [editId, setEditId] = useState(null);
  const [editTipoId, setEditTipoId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [busca, setBusca] = useState("");

  const [nomeCliente, setNomeCliente] = useState("");
  const [valorTotal, setValorTotal] = useState("");
  const [valorParcela, setValorParcela] = useState("");
  const [dataPagamento, setDataPagamento] = useState("");
  const [dataVencimento, setDataVencimento] = useState("");
  const [qtdParcela, setQtdParcela] = useState("1");
  const [tipoPagId, setTipoPagId] = useState("");

  const [descricaoTipo, setDescricaoTipo] = useState("");

  const headers = () => {
    const token = localStorage.getItem("token") || "";
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  async function fetchPagamentos() {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/pagamentos`, { headers: headers() });
      const d = await r.json();
      setPagamentos(Array.isArray(d) ? d : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchTipos() {
    try {
      const r = await fetch(`${API_BASE}/tipoPagamentos`, {
        headers: headers(),
      });
      const d = await r.json();
      setTipos(Array.isArray(d) ? d : []);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    fetchPagamentos();
    fetchTipos();
  }, []);

  function resetPagForm() {
    setEditId(null);
    setNomeCliente("");
    setValorTotal("");
    setValorParcela("");
    setDataPagamento("");
    setDataVencimento("");
    setQtdParcela("1");
    setTipoPagId("");
  }
  function resetTipoForm() {
    setEditTipoId(null);
    setDescricaoTipo("");
  }

  function carregarPagamento(p) {
    setEditId(p.id);
    setNomeCliente(p.nomeCliente || "");
    setValorTotal(p.valorTotal ?? "");
    setValorParcela(p.valorParcela ?? "");
    setDataPagamento(p.dataPagamento || "");
    setDataVencimento(p.dataVencimento || "");
    setQtdParcela(p.qtdParcela ?? "1");
    setTipoPagId(p.tipoPagamento?.id ?? "");
    setTab("pagamento");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function carregarTipo(t) {
    setEditTipoId(t.id);
    setDescricaoTipo(t.descricao || "");
    setTab("tipo");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleSubmitPag(e) {
    e.preventDefault();
    if (!nomeCliente || !valorTotal || !dataVencimento || !tipoPagId) return;
    const payload = {
      nomeCliente,
      valorTotal: parseFloat(valorTotal),
      valorParcela: parseFloat(valorParcela) || 0,
      dataPagamento: dataPagamento || null,
      dataVencimento,
      qtdParcela: parseInt(qtdParcela) || 1,
      tipoPagamento: { id: parseInt(tipoPagId) },
    };
    try {
      const url = editId
        ? `${API_BASE}/pagamentos/${editId}`
        : `${API_BASE}/pagamentos`;
      const r = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: headers(),
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error();
      resetPagForm();
      fetchPagamentos();
    } catch (err) {
      alert("Erro ao salvar pagamento.");
    }
  }

  async function handleSubmitTipo(e) {
    e.preventDefault();
    if (!descricaoTipo.trim()) return;
    const payload = { descricao: descricaoTipo.trim() };
    try {
      const url = editTipoId
        ? `${API_BASE}/tipoPagamentos/${editTipoId}`
        : `${API_BASE}/tipoPagamentos`;
      const r = await fetch(url, {
        method: editTipoId ? "PUT" : "POST",
        headers: headers(),
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error();
      resetTipoForm();
      fetchTipos();
    } catch (err) {
      alert("Erro ao salvar tipo.");
    }
  }

  async function handleDelete() {
    const { id, kind } = confirmDelete;
    const url =
      kind === "pag"
        ? `${API_BASE}/pagamentos/${id}`
        : `${API_BASE}/tipoPagamentos/${id}`;
    try {
      const r = await fetch(url, { method: "DELETE", headers: headers() });
      if (!r.ok) throw new Error();
      if (kind === "pag")
        setPagamentos((prev) => prev.filter((p) => p.id !== id));
      else setTipos((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      alert("Erro ao deletar.");
    } finally {
      setConfirmDelete(null);
    }
  }

  const tipoSelecionado = tipos.find((t) => t.id === parseInt(tipoPagId));
  const totalFloat = parseFloat(valorTotal) || 0;
  const qtdInt = parseInt(qtdParcela) || 1;
  const parcelaCalc = valorParcela
    ? parseFloat(valorParcela)
    : qtdInt > 1
      ? totalFloat / qtdInt
      : totalFloat;
  const pagFiltrados = pagamentos.filter((p) =>
    p.nomeCliente?.toLowerCase().includes(busca.toLowerCase()),
  );

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
      <div className="crud-topbar" style={{ marginBottom: "20px" }}>
        <button className="btn-voltar-top" onClick={() => navigate("/")}>
          ← Voltar
        </button>
      </div>

      <div
        className="crud-header"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          width: "100%",
          marginBottom: "24px",
        }}
      >
        <h1 className="crud-titulo" style={{ margin: 0 }}>
          Pagamentos
        </h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "360px 1fr",
          gap: "24px",
          alignItems: "start",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            position: "sticky",
            top: "20px",
            boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          }}
        >
          <div
            style={{
              display: "flex",
              borderBottom: "1px solid #e2e8f0",
              padding: "0 4px",
            }}
          >
            <button
              type="button"
              onClick={() => {
                setTab("pagamento");
                resetPagForm();
              }}
              style={{
                flex: 1,
                padding: "14px 12px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
                fontFamily: "inherit",
                color: tab === "pagamento" ? "#0f172a" : "#94a3b8",
                borderBottom:
                  tab === "pagamento"
                    ? "2px solid #0f172a"
                    : "2px solid transparent",
                transition: "all .15s",
              }}
            >
              Pagamento
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("tipo");
                resetTipoForm();
              }}
              style={{
                flex: 1,
                padding: "14px 12px",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "13px",
                fontFamily: "inherit",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                color: tab === "tipo" ? "#0f172a" : "#94a3b8",
                borderBottom:
                  tab === "tipo"
                    ? "2px solid #0f172a"
                    : "2px solid transparent",
                transition: "all .15s",
              }}
            >
              <IcTag /> Tipos
            </button>
          </div>

          {tab === "pagamento" && (
            <form
              onSubmit={handleSubmitPag}
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              {editId && (
                <div
                  style={{
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: "8px",
                    padding: "8px 12px",
                    fontSize: "13px",
                    color: "#1d4ed8",
                    fontWeight: "600",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  Editando #{editId}
                  <button
                    type="button"
                    onClick={resetPagForm}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "#1d4ed8",
                      fontWeight: "700",
                      fontSize: "18px",
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              )}

              <div className="form-group" style={{ margin: 0 }}>
                <label>Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome completo"
                  value={nomeCliente}
                  onChange={(e) => setNomeCliente(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Tipo de pagamento *</label>
                <select
                  required
                  value={tipoPagId}
                  onChange={(e) => setTipoPagId(e.target.value)}
                >
                  <option value="">Selecione...</option>
                  {tipos.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.descricao}
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Valor total (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="0,00"
                    value={valorTotal}
                    onChange={(e) => setValorTotal(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Parcelas</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="1"
                    value={qtdParcela}
                    onChange={(e) => setQtdParcela(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label>Valor por parcela (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Calculado automaticamente"
                  value={valorParcela}
                  onChange={(e) => setValorParcela(e.target.value)}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "12px",
                }}
              >
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Vencimento *</label>
                  <input
                    type="date"
                    required
                    value={dataVencimento}
                    onChange={(e) => setDataVencimento(e.target.value)}
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Data pagamento</label>
                  <input
                    type="date"
                    value={dataPagamento}
                    onChange={(e) => setDataPagamento(e.target.value)}
                  />
                </div>
              </div>

              {(totalFloat > 0 || tipoSelecionado) && (
                <div
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    padding: "14px",
                  }}
                >
                  <p
                    style={{
                      margin: "0 0 10px",
                      fontSize: "11px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: ".05em",
                      color: "#94a3b8",
                    }}
                  >
                    Resumo
                  </p>
                  {tipoSelecionado && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "13px",
                        color: "#64748b",
                        marginBottom: "6px",
                      }}
                    >
                      <span>Forma</span>
                      <span style={{ fontWeight: "600", color: "#0f172a" }}>
                        {tipoSelecionado.descricao}
                      </span>
                    </div>
                  )}
                  {totalFloat > 0 && qtdInt > 1 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "13px",
                        color: "#64748b",
                        marginBottom: "6px",
                      }}
                    >
                      <span>{qtdInt}x de</span>
                      <span style={{ fontWeight: "600", color: "#0f172a" }}>
                        {fmt(parcelaCalc)}
                      </span>
                    </div>
                  )}
                  {totalFloat > 0 && (
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: "15px",
                        fontWeight: "700",
                        paddingTop: "10px",
                        borderTop: "1px solid #e2e8f0",
                        color: "#0f172a",
                        marginTop: "6px",
                      }}
                    >
                      <span>Total</span>
                      <span>{fmt(totalFloat)}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="modal-actions" style={{ marginTop: "4px" }}>
                {editId && (
                  <button
                    type="button"
                    className="btn-cancelar"
                    onClick={resetPagForm}
                  >
                    Cancelar
                  </button>
                )}
                <button
                  type="submit"
                  className="btn-salvar"
                  style={{ flex: 1 }}
                >
                  {editId ? "Atualizar" : "Registrar pagamento"}
                </button>
              </div>
            </form>
          )}

          {tab === "tipo" && (
            <div style={{ padding: "20px" }}>
              <form
                onSubmit={handleSubmitTipo}
                style={{ marginBottom: "20px" }}
              >
                {editTipoId && (
                  <div
                    style={{
                      background: "#eff6ff",
                      border: "1px solid #bfdbfe",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      marginBottom: "14px",
                      fontSize: "13px",
                      color: "#1d4ed8",
                      fontWeight: "600",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    Editando tipo #{editTipoId}
                    <button
                      type="button"
                      onClick={resetTipoForm}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#1d4ed8",
                        fontWeight: "700",
                        fontSize: "18px",
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>
                )}
                <div className="form-group" style={{ marginBottom: "16px" }}>
                  <label>Descrição *</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    placeholder="Ex: PIX, Cartão de Crédito, Boleto…"
                    value={descricaoTipo}
                    onChange={(e) => setDescricaoTipo(e.target.value)}
                  />
                </div>
                <div className="modal-actions">
                  {editTipoId && (
                    <button
                      type="button"
                      className="btn-cancelar"
                      onClick={resetTipoForm}
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    className="btn-salvar"
                    style={{ flex: 1 }}
                  >
                    {editTipoId ? "Atualizar tipo" : "Criar tipo"}
                  </button>
                </div>
              </form>

              {tipos.length > 0 && (
                <>
                  <p
                    style={{
                      margin: "0 0 10px",
                      fontSize: "11px",
                      fontWeight: "700",
                      textTransform: "uppercase",
                      letterSpacing: ".05em",
                      color: "#94a3b8",
                    }}
                  >
                    Tipos cadastrados
                  </p>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    {tipos.map((t) => (
                      <div
                        key={t.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "8px 10px",
                          background: "#f8fafc",
                          borderRadius: "8px",
                          border: "1px solid #e2e8f0",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "13px",
                            fontWeight: "500",
                            color: "#0f172a",
                          }}
                        >
                          {t.descricao}
                        </span>
                        <div className="crud-acoes" style={{ gap: "4px" }}>
                          <button
                            className="crud-acao-btn crud-acao-btn--edit"
                            onClick={() => carregarTipo(t)}
                            title="Editar"
                          >
                            <IcEdit />
                          </button>
                          <button
                            className="crud-acao-btn crud-acao-btn--delete"
                            onClick={() =>
                              setConfirmDelete({ id: t.id, kind: "tipo" })
                            }
                            title="Deletar"
                          >
                            <IcTrash />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div className="crud-header" style={{ marginBottom: 0 }}>
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
                placeholder="Pesquisar cliente..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                style={{ width: "100%" }}
              />
            </div>
            <span
              style={{
                fontSize: "13px",
                color: "#94a3b8",
                fontWeight: "500",
                whiteSpace: "nowrap",
              }}
            >
              {pagFiltrados.length} registro
              {pagFiltrados.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="crud-table-wrap">
            <table className="crud-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Tipo</th>
                  <th>Total</th>
                  <th>Parcelas</th>
                  <th>Vencimento</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan="7" className="crud-vazio">
                      Carregando...
                    </td>
                  </tr>
                )}
                {!loading &&
                  pagFiltrados.map((p) => {
                    const isPago = !!p.dataPagamento;
                    const isVencido =
                      !isPago && p.dataVencimento && p.dataVencimento < today();
                    return (
                      <tr key={p.id}>
                        <td>
                          <strong>{p.nomeCliente}</strong>
                        </td>
                        <td>{p.tipoPagamento?.descricao || "—"}</td>
                        <td>{fmt(p.valorTotal)}</td>
                        <td>
                          {p.qtdParcela > 1
                            ? `${p.qtdParcela}x ${fmt(p.valorParcela)}`
                            : "À vista"}
                        </td>
                        <td>{fmtDate(p.dataVencimento)}</td>
                        <td>
                          <PaidBadge paid={isPago} vencido={isVencido} />
                        </td>
                        <td className="crud-acoes">
                          <button
                            className="crud-acao-btn crud-acao-btn--edit"
                            title="Editar"
                            onClick={() => carregarPagamento(p)}
                          >
                            <IcEdit />
                          </button>
                          <button
                            className="crud-acao-btn crud-acao-btn--delete"
                            title="Deletar"
                            onClick={() =>
                              setConfirmDelete({ id: p.id, kind: "pag" })
                            }
                          >
                            <IcTrash />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                {!loading && pagFiltrados.length === 0 && (
                  <tr>
                    <td colSpan="7" className="crud-vazio">
                      Nenhum pagamento encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="crud-cards">
            {pagFiltrados.map((p) => {
              const isPago = !!p.dataPagamento;
              const isVencido =
                !isPago && p.dataVencimento && p.dataVencimento < today();
              return (
                <div key={p.id} className="crud-card">
                  <div className="crud-card-info">
                    <span className="crud-card-nome">{p.nomeCliente}</span>
                    <span className="crud-card-data">
                      {p.tipoPagamento?.descricao || "—"} · {fmt(p.valorTotal)}
                    </span>
                    <PaidBadge paid={isPago} vencido={isVencido} />
                  </div>
                  <div className="crud-acoes">
                    <button
                      className="crud-acao-btn crud-acao-btn--edit"
                      onClick={() => carregarPagamento(p)}
                    >
                      <IcEdit />
                    </button>
                    <button
                      className="crud-acao-btn crud-acao-btn--delete"
                      onClick={() =>
                        setConfirmDelete({ id: p.id, kind: "pag" })
                      }
                    >
                      <IcTrash />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {confirmDelete && (
        <div className="modal-overlay" style={{ zIndex: 1100 }}>
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
              {confirmDelete.kind === "pag"
                ? "Tem certeza que deseja deletar este pagamento? Esta ação não pode ser desfeita."
                : "Deletar este tipo pode afetar pagamentos vinculados. Confirmar?"}
            </p>
            <div
              style={{ display: "flex", justifyContent: "center", gap: "12px" }}
            >
              <button
                type="button"
                className="btn-cancelar"
                onClick={() => setConfirmDelete(null)}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDelete}
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
                Sim, Deletar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Pagamento;
