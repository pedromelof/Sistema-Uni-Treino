import { useState, useEffect } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../hooks/useNotifications";

import { getChatsAsync, deleteChat } from "../lib/chatStorage";

const token = localStorage.getItem("token");

function IcMenu() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

function IcPlus() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
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

function SidebarContent({
  chats,
  user,
  onNewChat,
  onToggle,
  onItemClick,
  onDeleteChat,
}) {
  return (
    <>
      <div className="sidebar-header-row">
        {onToggle && (
          <button
            className="sidebar-icon-btn"
            onClick={onToggle}
            aria-label="Recolher menu"
          >
            <IcMenu />
          </button>
        )}
      </div>

      <nav className="sidebar-nav-links" aria-label="Navegação primária">
        <NavLink
          to="/gerencia-treino"
          className="sidebar-title-link-new"
          onClick={onItemClick}
          disabled={!token}
        >
          <span className="sidebar-nav-emoji">🏋️</span>
          <span>Treinos</span>
        </NavLink>
      </nav>

      <div className="sidebar-history-section"></div>

      <div className="sidebar-profile-footer">
        <div className="sidebar-profile-user-info">
          <div className="sidebar-avatar" aria-hidden="true">
            {user?.nome?.[0]?.toUpperCase() ?? "P"}
          </div>
          <div className="sidebar-profile-text-stack">
            <span className="sidebar-profile-name">
              {user?.nome ?? "Pedro"}
            </span>
          </div>
        </div>
        <Link
          to="/perfil"
          className="sidebar-profile-settings-link"
          onClick={onItemClick}
          aria-label="Configurações do perfil"
        >
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
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        </Link>
      </div>
    </>
  );
}

function Sidebar({
  collapsed = false,
  onToggle,
  mobileOpen = false,
  onMobileClose,
  chats: initialChats = [],
}) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [activeChats, setActiveChats] = useState([]);

  useEffect(() => {
    let mounted = true;
    async function carregarHistorico() {
      try {
        const historico = await getChatsAsync();
        if (mounted) setActiveChats(historico);
      } catch (err) {
        console.error("Erro ao carregar historico de chats:", err);
      }
    }

    carregarHistorico();

    window.addEventListener("chatCriado", carregarHistorico);
    window.addEventListener("storage", carregarHistorico);

    return () => {
      mounted = false;
      window.removeEventListener("chatCriado", carregarHistorico);
      window.removeEventListener("storage", carregarHistorico);
    };
  }, [mobileOpen, collapsed]);

  function handleNewChat() {
    navigate("/novo-chat");
    onMobileClose?.();
  }

  const handleDeleteChat = async (chatId) => {
    try {
      const remaining = await deleteChat(chatId);
      if (Array.isArray(remaining)) setActiveChats(remaining);
      else {
        const refreshed = await getChatsAsync();
        setActiveChats(refreshed);
      }
      navigate("/novo-chat");
    } catch (err) {
      console.error("Erro ao deletar chat:", err);
    }
  };

  const commonContent = (
    <SidebarContent
      chats={activeChats}
      user={user}
      onNewChat={handleNewChat}
      onToggle={!mobileOpen ? onToggle : undefined}
      onItemClick={onMobileClose}
      onDeleteChat={handleDeleteChat}
    />
  );

  if (collapsed) {
    return (
      <aside
        className="sidebar-master-container sidebar-master-container--collapsed"
        aria-label="Menu recolhido"
      >
        <div className="sidebar-collapsed-top-actions">
          <button
            className="sidebar-square-icon-btn"
            onClick={onToggle}
            title="Expandir menu"
            aria-label="Expandir menu"
          >
            <IcMenu />
          </button>

          <NavLink
            to="/gerencia-treino"
            className="sidebar-collapsed-nav-item"
            title="Treinos"
            onClick={onMobileClose}
          >
            <span className="sidebar-nav-emoji">🏋️</span>
          </NavLink>
        </div>

        <div className="sidebar-collapsed-footer">
          <Link
            to="/perfil"
            title="Configurações do perfil"
            onClick={onMobileClose}
            className="sidebar-collapsed-avatar-link"
          >
            <div className="sidebar-avatar-circle">
              {user?.nome?.[0]?.toUpperCase() ?? "P"}
            </div>
          </Link>
        </div>
      </aside>
    );
  }

  if (onMobileClose !== undefined) {
    return (
      <>
        {mobileOpen && (
          <div
            className="sidebar-mobile-dim-backdrop"
            onClick={onMobileClose}
            aria-hidden="true"
          />
        )}
        <aside
          className={`sidebar-master-container sidebar-master-container--mobile${mobileOpen ? " sidebar-master-container--mobile-open" : ""}`}
          aria-label="Menu lateral"
        >
          {commonContent}
        </aside>
      </>
    );
  }

  return (
    <aside
      className="sidebar-master-container sidebar-master-container--expanded"
      aria-label="Menu lateral"
    >
      {commonContent}
    </aside>
  );
}

export default Sidebar;
