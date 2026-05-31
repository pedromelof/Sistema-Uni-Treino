import { useState, useEffect, useRef } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ChatInput from "../components/ChatInput";
import ChatMessage from "../components/ChatMessage";
import { useAuth } from "../context/AuthContext";
import { api } from "../../lib/api";
import {
  createChat,
  getChatById,
  getChats,
  getChatsAsync,
  saveChatMessages,
  updateChat,
} from "../lib/chatStorage";

const GUEST_CHAT_LIMIT = 3;
const GUEST_CHAT_COUNT_KEY = "unitreino_guest_chat_count";

function getGuestChatCount() {
  return Number(localStorage.getItem(GUEST_CHAT_COUNT_KEY) || 0);
}

function setGuestChatCount(count) {
  // localStorage.setItem(GUEST_CHAT_COUNT_KEY, String(count));
}

function StopButton({ onClick }) {
  return (
    <button
      className="stop-generation-btn"
      onClick={onClick}
      aria-label="Parar geracao"
    >
      <span className="stop-square" aria-hidden="true" />
      Parar geracao
    </button>
  );
}

function Chat() {
  const [setIdGerado, idGerado] = useState("");
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();

  const [loadingBanco, setLoadingBanco] = useState(false);
  const [messages, setMessages] = useState([]);
  const [chats, setChats] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [ultimaMsgBot, setUltimaMsgBot] = useState(null);
  const [showLoginRequired, setShowLoginRequired] = useState(false);

  const messagesEndRef = useRef(null);
  const abortControllerRef = useRef(null);
  const timeoutRef = useRef(null);
  const firstMsgSentRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    let mounted = true;
    async function carregar() {
      const list = await getChatsAsync();
      if (mounted) setChats(list || []);
    }
    carregar();
    return () => (mounted = false);
  }, [id, messages]);

  useEffect(() => {
    let mounted = true;

    async function carregarMensagensDoBanco() {
      if (!id || id === "novo") {
        setMessages([]);
        return;
      }

      setLoadingBanco(true);
      try {
        const token = localStorage.getItem("token") || "";

        const response = await api.get(`/v1/chats/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const mensagensDoBanco =
          response.data?.result?.chat?.[0]?.historico || [];

        if (mounted) {
          setMessages(mensagensDoBanco);
        }
      } catch (err) {
        console.error("Erro ao carregar mensagens do banco:", err);
        if (mounted) setMessages([]);
      } finally {
        if (mounted) setLoadingBanco(false);
      }
    }

    window.dispatchEvent(new Event("chatCriado"));

    carregarMensagensDoBanco();

    const firstMessage = location.state?.firstMessage;
    if (firstMessage && !isGenerating) {
      navigate(location.pathname, { replace: true, state: {} });
      sendMessage(firstMessage);
    }

    return () => {
      mounted = false;
    };
  }, [id]);

  useEffect(() => {
    const firstMessage = location.state?.firstMessage;
    if (firstMessage && !firstMsgSentRef.current) {
      firstMsgSentRef.current = true;
      sendMessage(firstMessage);
    }
  }, []);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
      clearTimeout(timeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      localStorage.removeItem(GUEST_CHAT_COUNT_KEY);
      setShowLoginRequired(false);
    } else if (getGuestChatCount() >= GUEST_CHAT_LIMIT) {
      setShowLoginRequired(true);
    }
  }, [isLoggedIn]);

  async function sendMessage(text, retryBotId = null) {
    if (!isLoggedIn && !retryBotId && getGuestChatCount() >= GUEST_CHAT_LIMIT) {
      setShowLoginRequired(true);
      return;
    }

    const msgIdUsuario = `user-${Date.now()}`;
    const botId = retryBotId ?? `bot-${Date.now()}`;

    if (!retryBotId) {
      setMessages((prev) => [
        ...prev,
        { id: msgIdUsuario, tipo: "usuario", conteudo: text },
      ]);
    }

    setMessages((prev) => {
      const already = prev.find((m) => m.id === botId);
      if (already) {
        return prev.map((m) =>
          m.id === botId
            ? { ...m, conteudo: "", loading: true, error: false }
            : m,
        );
      }
      return [
        ...prev,
        { id: botId, tipo: "bot", conteudo: "", loading: true, error: false },
      ];
    });

    const controller = new AbortController();
    setIsGenerating(true);
    setUltimaMsgBot(null);
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const responseIA = await api.post(
        "/v1/mensagem",
        { mensagem: text },
        { signal: controller.signal },
      );

      const conteudoBot =
        responseIA.data?.Mensagem?.Resposta ??
        responseIA.data?.mensagem?.conteudo ??
        "Sem resposta do servidor.";

      const token = localStorage.getItem("token") || "";
      if (isLoggedIn && token) {
        if (!id || id === "novo") {
          const resNovoChat = await api.post(
            "/v1/chats",
            {
              id: location.state?.idGerado,
              mensagem: text,
              resposta: conteudoBot,
              msgIdUsuario,
              msgIdBot: botId,
            },
            { headers: { Authorization: `Bearer ${token}` } },
          );

          if (location.state?.idGerado) {
            navigate(`/chat/${location.state?.idGerado}`, { replace: true });
          }
        } else {
          await api.post(
            `/v1/chats/${id}/mensagem`,
            {
              mensagem: text,
              resposta: conteudoBot,
              msgIdUsuario,
              msgIdBot: botId,
            },
            { headers: { Authorization: `Bearer ${token}` } },
          );
        }
      }

      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId ? { ...m, conteudo: conteudoBot, loading: false } : m,
        ),
      );
      setUltimaMsgBot(botId);

      window.dispatchEvent(new Event("chatCriado"));
    } catch (err) {
      console.error(err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === botId
            ? {
                ...m,
                conteudo:
                  "Não foi possível processar a resposta. Tente novamente.",
                loading: false,
                error: true,
                onRetry: () => sendMessage(text, botId),
              }
            : m,
        ),
      );
    } finally {
      clearTimeout(timeoutId);
      setIsGenerating(false);
    }
  }

  function handleStopGeneration() {
    abortControllerRef.current?.abort();
    clearTimeout(timeoutRef.current);
    setIsGenerating(false);
    setMessages((prev) =>
      prev.map((m, i) =>
        i === prev.length - 1 && m.tipo === "bot" && m.loading
          ? {
              ...m,
              loading: false,
              conteudo: m.conteudo || "[geracao interrompida]",
            }
          : m,
      ),
    );
  }

  function handleAdicionarTreino() {
    alert("Treino adicionado! (TODO: integrar com POST /v1/treinos)");
  }

  return (
    <div className="chat-page">
      <div className="chat-body">
        <main className="chat-main" aria-label="Conversa">
          <div className="chat-messages" aria-live="polite">
            {messages.map((msg) => (
              <div key={msg.id}>
                <ChatMessage message={msg} />
                {isLoggedIn &&
                  msg.id === ultimaMsgBot &&
                  msg.tipo === "bot" &&
                  !msg.loading &&
                  !msg.error &&
                  msg.treino && (
                    <div className="chat-add-treino-area">
                      <button
                        className="chat-add-treino-btn"
                        onClick={handleAdicionarTreino}
                      >
                        Adicionar treino
                      </button>
                    </div>
                  )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {isGenerating && (
            <div className="chat-stop-area">
              <StopButton onClick={handleStopGeneration} />
            </div>
          )}

          <div className="chat-input-area">
            <ChatInput
              onSend={(text) => sendMessage(text)}
              disabled={isGenerating || showLoginRequired}
            />
          </div>
        </main>
      </div>

      {showLoginRequired && !isLoggedIn && (
        <div
          className="modal-overlay auth-required-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-required-title"
        >
          <div className="modal-card auth-required-card">
            <h2 className="modal-title" id="auth-required-title">
              Entre para continuar
            </h2>
            <p className="modal-texto">
              Voce atingiu o limite de {GUEST_CHAT_LIMIT} mensagens gratuitas.
              Faca login ou crie uma conta para continuar usando o chat.
            </p>
            <div className="modal-acoes auth-required-actions">
              <button
                className="btn-secundario"
                type="button"
                onClick={() => navigate("/cadastro")}
              >
                Criar conta
              </button>
              <button
                className="auth-required-login-btn"
                type="button"
                onClick={() => navigate("/login")}
              >
                Log-in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Chat;
