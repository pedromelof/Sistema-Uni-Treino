import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import { AuthProvider } from "./context/AuthContext";

import AppLayout from "./layouts/AppLayout";

import Login from "./pages/Login";
import Cadastro from "./pages/Cadastro";
import RecuperarSenha from "./pages/RecuperarSenha";

import Home from "./pages/Home";
import NovoChat from "./pages/NovoChat";
import Chat from "./pages/Chat";
import Perfil from "./pages/Perfil";
import CrudTreino from "./pages/CrudTreino";
import CrudLesoes from "./pages/CrudLesoes";
import ExecucaoTreino from "./pages/ExecucaoTreino";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/recuperar-senha" element={<RecuperarSenha />} />

            <Route index element={<Home />} />
            <Route path="/" element={<AppLayout />}>
              <Route path="novo-chat" element={<NovoChat />} />
              <Route path="chat/:id" element={<Chat />} />
              <Route path="perfil" element={<Perfil />} />
              <Route path="gerencia-treino" element={<CrudTreino />} />
              <Route path="gerencia-lesoes" element={<CrudLesoes />} />
              <Route path="execucao-treino/:id" element={<ExecucaoTreino />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
