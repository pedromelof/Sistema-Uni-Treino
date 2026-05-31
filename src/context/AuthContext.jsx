import { createContext, useCallback, useEffect } from "react";
import CryptoJS from "crypto-js";
import { useConfigStore } from "../../store/configStore";
import { api } from "../../lib/api";

export const AuthContext = createContext(null);

function base64UrlEncode(value) {
  return value.replace(/=+$/g, "").replace(/\+/g, "-").replace(/\//g, "_");
}

function generateGuestJwt() {
  const header = base64UrlEncode(
    btoa(JSON.stringify({ alg: "HS256", typ: "JWT" })),
  );
  const payload = base64UrlEncode(
    btoa(
      JSON.stringify({
        sub: "guest",
        role: "guest",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + 86400,
      }),
    ),
  );
  const signature = base64UrlEncode(
    CryptoJS.HmacSHA256(`${header}.${payload}`, "unitreino-guest").toString(
      CryptoJS.enc.Base64,
    ),
  );

  return `${header}.${payload}.${signature}`;
}

export function AuthProvider({ children }) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const { token, usuario, setToken, setUsuario, clearAll } = useConfigStore();

  /**
   * Login real — POST /v1/account/login
   *
   * O backend espera: { email, password }
   * Retorna: { result: { success: true, accessToken: "..." }, mensagem: { msg: "100..." } }
   *
   * NOTA BACKEND: getToken({}) gera JWT com payload vazio.
   * Quando o backend incluir { email, nome } no payload, podemos
   * decodificar o token aqui para extrair os dados do usuário.
   */
  async function login(email, senha) {
    const response = await api.post("/v1/account/login", {
      email,
      password: senha,
    });

    const accessToken = response.data?.result?.accessToken;
    if (!accessToken) throw new Error("Token não recebido do servidor.");

    localStorage.setItem("token", accessToken);
    setToken(accessToken);

    setUsuario({ email, nome: email.split("@")[0] });

    return accessToken;
  }

  function logout() {
    localStorage.removeItem("token");
    clearAll();
  }

  return {
    user: usuario,
    isLoggedIn: !!token,
    token,
    login,
    logout,
  };
}
