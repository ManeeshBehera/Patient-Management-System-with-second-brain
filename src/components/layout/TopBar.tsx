"use client";

import { Calendar, Lock, Shield } from "lucide-react";
import type { UserRole } from "@/lib/types";
import { todayLabel } from "@/lib/utils";

export const APP_VERSION = "0.2.0";

export function TopBar({ role, onRoleChange }: { role: UserRole; onRoleChange: (role: UserRole) => void }) {
  return (
    <header className="topbar">
      <div>
        <div className="eyebrow">AI Cabinet Intake OS · Dr Amraoui</div>
        <h1>Intake, prep, validation, and quiet clinical intelligence</h1>
      </div>
      <div className="topbar-actions">
        <div className="role-switcher" aria-label="Role switcher">
          {(["Secretary", "Doctor", "Admin"] as UserRole[]).map((item) => (
            <button key={item} className={role === item ? "active" : ""} onClick={() => onRoleChange(item)}>
              {item}
            </button>
          ))}
        </div>
        <span className="version-badge">v{APP_VERSION}</span>
        <span className="badge badge-demo">
          <Shield size={14} /> Demo mode
        </span>
        <span className="date-pill">
          <Calendar size={14} /> {todayLabel()}
        </span>
        <span className="date-pill">
          <Lock size={14} /> Mock data only
        </span>
      </div>
    </header>
  );
}
