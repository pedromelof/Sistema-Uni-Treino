import React from "react";
import { useNavigate } from "react-router-dom";
import ChatInput from "../components/ChatInput";
import Logo from "../components/Logo";
import { createChat } from "../lib/chatStorage";

function NovoChat() {
  const navigate = useNavigate();

  const gerarId = () => {
    const timestamp = Date.now().toString(36);
    const arrayAleatorio = new Uint32Array(2);
    window.crypto.getRandomValues(arrayAleatorio);
    const aleatorio1 = arrayAleatorio[0].toString(36);
    const aleatorio2 = arrayAleatorio[1].toString(36);

    return `${timestamp}_${aleatorio1}${aleatorio2}`;
  };

  function handleFirstMessage(text) {
    const createdChat = createChat(text);

    const id = gerarId();

    navigate("/chat/novo", {
      replace: true,
      state: { firstMessage: text, idGerado: id },
    });
  }
  return (
    <div
      className="novo-chat-container"
      style={{
        width: "100%",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        gap: "40px",
        padding: "20px",
      }}
    >
      <div className="novo-chat-logo-area" aria-hidden="true">
        <Logo size={64} />
      </div>

      <div className="novo-chat-input-area" style={{ width: "100%" }}>
        <ChatInput onSend={handleFirstMessage} />
      </div>
    </div>
  );
}

export default NovoChat;
