import { api } from "../../lib/api";

// const CHAT_STORAGE_KEY = "unitreino_chats";

const RANDOM_TITLES = [
  "Conversa Rápida",
  "Plano de Treino",
  "Sessão de Força",
  "Foco em Cardio",
  "Treino Inteligente",
  "Meta de Hoje",
  "Agenda de Exercícios",
  "Resumo do Dia",
]; // <-- Corrigido: Fechamento do array que estava ausente

function readLocalChats() {
  // try {
  //   const raw = localStorage.getItem(CHAT_STORAGE_KEY);
  //   if (!raw) return [];
  //   const parsed = JSON.parse(raw);
  //   return Array.isArray(parsed) ? parsed : [];
  // } catch {
  //   return [];
  // }
}

function saveLocalChats(chats) {
  // localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chats));
}

function generateChatId() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `chat-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function generateChatTitle() {
  const randomIndex = Math.floor(Math.random() * RANDOM_TITLES.length);
  return RANDOM_TITLES[randomIndex];
}

function createLocalChat(firstMessage) {
  const title = firstMessage
    ? firstMessage.trim().slice(0, 36) || generateChatTitle()
    : generateChatTitle();

  const chat = {
    id: generateChatId(),
    titulo: title,
    lastMessage: firstMessage || "",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const chats = [...readLocalChats(), chat];
  saveLocalChats(chats);
  return chat;
}

function updateLocalChat(chatId, updates) {
  const chats = readLocalChats().map((chat) =>
    chat.id === chatId ? { ...chat, ...updates, updatedAt: Date.now() } : chat,
  );
  saveLocalChats(chats);
  return chats;
}

function saveLocalChatMessages(chatId, messages) {
  return updateLocalChat(chatId, {
    messages,
    lastMessage: messages[messages.length - 1]?.conteudo || "",
  });
}

function getLocalChatById(chatId) {
  return readLocalChats().find((chat) => chat.id === chatId) || null;
}

// --- Backend helpers (async) ---
async function getAuthToken() {
  return localStorage.getItem("token") || "";
}

async function fetchChatsFromServer() {
  const token = await getAuthToken();
  if (!token) return null;
  const res = await api.get("/v1/chats", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.data.operacaoFinalizada === false)
    throw new Error(res.data.mensagem?.detalhe || "Falha ao carregar chats");
  return (res.data.result || []).map((c) => ({
    id: c.id,
    titulo: c.mensagem?.slice(0, 36) || c.titulo || "Conversa",
    lastMessage: c.resposta || c.mensagem || "",
    messages: c.messages || [],
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  }));
}

async function createChatServer(firstMessage) {
  const token = await getAuthToken();
  if (!token) return null;
  const res = await api.post("/v1/chats", {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    mensagem: firstMessage,
  });
  if (res.data.operacaoFinalizada === false)
    throw new Error(res.data.mensagem?.detalhe || "Falha ao criar chat");
  const c = res.data.result || res;
  return {
    id: c._id || c.id,
    titulo: c.mensagem?.slice(0, 36) || c.titulo || "Conversa",
    lastMessage: c.resposta || c.mensagem || "",
    messages: c.messages || [],
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
  };
}

async function deleteChatServer(chatId) {
  const token = await getAuthToken();
  if (!token) return null;
  const res = await api.delete(`/v1/chats/${chatId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.data.operacaoFinalizada === false)
    throw new Error(res.data.mensagem?.detalhe || "Falha ao deletar chat");
  return res;
}

// Public API: functions that prefer server when authenticated, else local
function getChats() {
  return readLocalChats();
}

async function getChatsAsync() {
  try {
    const token = await getAuthToken();
    if (token) {
      const chats = await fetchChatsFromServer();
      if (Array.isArray(chats)) return chats;
    }
  } catch (err) {
    console.error("Erro ao buscar chats do servidor:", err);
  }
  return readLocalChats();
}

async function createChat(firstMessage) {
  try {
    const token = await getAuthToken();
    if (token) {
      return await createChatServer(firstMessage);
    }
  } catch (err) {
    console.error("Erro ao criar chat no servidor:", err);
  }
  return createLocalChat(firstMessage);
}

async function deleteChat(chatId) {
  try {
    const token = await getAuthToken();
    if (token) {
      await deleteChatServer(chatId);
      return await getChatsAsync();
    }
  } catch (err) {
    console.error("Erro ao deletar chat no servidor:", err);
  }
  // fallback local
  const remaining = readLocalChats().filter((c) => c.id !== chatId);
  saveLocalChats(remaining);
  return remaining;
}

function getChatById(chatId) {
  return getLocalChatById(chatId);
}

// compatibility aliases for existing code
const saveChatMessages = saveLocalChatMessages;
const updateChat = updateLocalChat;

export {
  // CHAT_STORAGE_KEY,
  createChat,
  getChats,
  getChatsAsync,
  saveLocalChats,
  updateLocalChat,
  saveLocalChatMessages,
  getChatById,
  deleteChat,
  // legacy names
  saveChatMessages,
  updateChat,
};
