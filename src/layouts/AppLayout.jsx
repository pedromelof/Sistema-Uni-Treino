import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";

function AppLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const token = localStorage.getItem("token");
  return (
    <div
      className="chat-page"
      style={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <Navbar onMobileMenuClick={() => setMobileSidebarOpen(true)} />

      <div
        className="chat-body"
        style={{
          display: "flex",
          flex: 1,
          width: "100%",
          height: "calc(100vh - 60px)",
          alignItems: "stretch",
        }}
      >
        {token && (
          <Sidebar
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed((prev) => !prev)}
            mobileOpen={mobileSidebarOpen}
            onMobileClose={() => setMobileSidebarOpen(false)}
            chats={[]}
          />
        )}

        <main
          className="crud-main"
          style={{
            flex: 1,
            width: "100%",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
            padding: "30px",
            overflowY: "auto",
            background: "var(--bg-main-content, #ffffff)",
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
