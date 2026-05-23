"use client";

import { useState } from "react";
import type { UserRole, ViewKey } from "@/lib/types";
import { roleHome } from "@/lib/utils";
import { Sidebar, visibleViews } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({
  role,
  setRole,
  activeView,
  setActiveView,
  children
}: {
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeView: ViewKey;
  setActiveView: (view: ViewKey) => void;
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);

  function handleRoleChange(nextRole: UserRole) {
    setRole(nextRole);
    const allowed = visibleViews(nextRole).some((view) => view.key === activeView);
    if (!allowed) setActiveView(roleHome(nextRole) as ViewKey);
  }

  return (
    <div className="app-shell">
      <Sidebar role={role} activeView={activeView} onChange={setActiveView} collapsed={collapsed} onToggle={() => setCollapsed((value) => !value)} />
      <main className="main">
        <TopBar role={role} onRoleChange={handleRoleChange} />
        <div className="content">{children}</div>
      </main>
    </div>
  );
}
