"use client";

import {
  Activity,
  Bell,
  Brain,
  Calendar,
  ClipboardList,
  Database,
  FileText,
  LayoutDashboard,
  Settings,
  Stethoscope,
  UserCheck
} from "lucide-react";
import type { UserRole, ViewKey } from "@/lib/types";
import { cn } from "@/lib/utils";

const navItems: Array<{ key: ViewKey; label: string; icon: React.ElementType; roles: UserRole[] }> = [
  { key: "overview", label: "Overview", icon: LayoutDashboard, roles: ["Admin", "Secretary"] },
  { key: "booking", label: "Booking Intake", icon: ClipboardList, roles: ["Admin", "Secretary"] },
  { key: "calendar", label: "Patient Intake Calendar", icon: Calendar, roles: ["Admin", "Secretary"] },
  { key: "secretary", label: "Secretary Review", icon: UserCheck, roles: ["Admin", "Secretary"] },
  { key: "doctor-pending", label: "Doctor Pending", icon: Stethoscope, roles: ["Admin", "Doctor"] },
  { key: "doctor-working", label: "Doctor Working", icon: Activity, roles: ["Admin", "Doctor"] },
  { key: "reports", label: "Reports", icon: FileText, roles: ["Admin", "Secretary", "Doctor"] },
  { key: "second-brain", label: "Second Brain", icon: Brain, roles: ["Admin", "Doctor"] },
  { key: "insights", label: "Smart Insights", icon: Bell, roles: ["Admin", "Doctor"] },
  { key: "automation-log", label: "Automation Log", icon: Database, roles: ["Admin"] },
  { key: "admin-rules", label: "Admin Rules", icon: Settings, roles: ["Admin"] }
];

export function visibleViews(role: UserRole) {
  return navItems.filter((item) => item.roles.includes(role));
}

export function Sidebar({
  role,
  activeView,
  onChange,
  collapsed,
  onToggle
}: {
  role: UserRole;
  activeView: ViewKey;
  onChange: (view: ViewKey) => void;
  collapsed: boolean;
  onToggle: () => void;
}) {
  return (
    <aside className={cn("sidebar", collapsed && "sidebar-collapsed")}>
      <button className="brand" onClick={onToggle} aria-label="Toggle sidebar">
        <span className="brand-mark">AI</span>
        {!collapsed && (
          <span>
            <strong>Cabinet OS</strong>
            <small>Dr Amraoui Demo</small>
          </span>
        )}
      </button>
      <nav className="nav-list">
        {visibleViews(role).map((item) => {
          const Icon = item.icon;
          return (
            <button key={item.key} className={cn("nav-item", activeView === item.key && "nav-item-active")} onClick={() => onChange(item.key)}>
              <Icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
      {!collapsed && (
        <div className="sidebar-note">
          <Database size={16} />
          <span>Identifiable data stays in secure health-data placeholders.</span>
        </div>
      )}
    </aside>
  );
}
