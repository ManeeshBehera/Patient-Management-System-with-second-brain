"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, Clock, Filter } from "lucide-react";
import type { DemoData } from "@/lib/appState";
import type { TaskStatus, UserRole } from "@/lib/types";
import { Card, SectionTitle } from "@/components/shared";

const statusColors: Record<TaskStatus, string> = {
  "To do": "#64748b",
  "In progress": "#2f7dd1",
  Waiting: "#f59e0b",
  Blocked: "#ef4444",
  Done: "#22c55e"
};

const priorityColors: Record<string, string> = {
  Normal: "#64748b",
  Review: "#f59e0b",
  Urgent: "#ef4444"
};

const STATUSES: TaskStatus[] = ["To do", "In progress", "Waiting", "Blocked", "Done"];

export function TasksBoard({ data }: { data: DemoData }) {
  const [roleFilter, setRoleFilter] = useState<UserRole | "All">("All");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "All">("All");

  const tasks = data.tasks ?? [];

  const filtered = tasks.filter(
    (task) =>
      (roleFilter === "All" || task.assignedRole === roleFilter) &&
      (statusFilter === "All" || task.status === statusFilter)
  );

  const openCount = tasks.filter((t) => t.status !== "Done").length;
  const overdueCount = tasks.filter((t) => t.status !== "Done" && new Date(t.dueDate) < new Date()).length;

  return (
    <div className="stack">
      <SectionTitle
        eyebrow="Tasks"
        title="Cross-user task queue"
        action={
          <div className="metric-chips">
            <span className="badge badge-blue">{openCount} open</span>
            {overdueCount > 0 && <span className="badge badge-warn">{overdueCount} overdue</span>}
          </div>
        }
      />

      <div className="filter-row">
        <div className="pill-group">
          <Filter size={14} />
          {(["All", "Secretary", "Doctor", "Admin"] as Array<UserRole | "All">).map((r) => (
            <button key={r} className={`pill ${roleFilter === r ? "pill-active" : ""}`} onClick={() => setRoleFilter(r)}>
              {r}
            </button>
          ))}
        </div>
        <div className="pill-group">
          {(["All", ...STATUSES] as Array<TaskStatus | "All">).map((s) => (
            <button key={s} className={`pill ${statusFilter === s ? "pill-active" : ""}`} onClick={() => setStatusFilter(s)}>
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="task-columns">
        {STATUSES.map((status) => {
          const columnTasks = filtered.filter((t) => t.status === status);
          return (
            <div key={status} className="task-column">
              <div className="task-column-header" style={{ borderColor: statusColors[status] }}>
                <span style={{ color: statusColors[status] }}>●</span>
                <strong>{status}</strong>
                <span className="badge badge-gray">{columnTasks.length}</span>
              </div>
              <div className="task-column-body">
                {columnTasks.map((task) => {
                  const isOverdue = task.status !== "Done" && new Date(task.dueDate) < new Date();
                  return (
                    <Card key={task.id} className="task-card">
                      <div className="task-card-header">
                        <span className="mono text-xs">{task.id}</span>
                        <span className="badge" style={{ background: `${priorityColors[task.priority]}22`, color: priorityColors[task.priority] }}>
                          {task.priority}
                        </span>
                      </div>
                      <p className="task-title">{task.title}</p>
                      <div className="task-meta">
                        <span className="text-muted text-sm">{task.assignedTo} · {task.assignedRole}</span>
                        <span className={`date-cell ${isOverdue ? "text-danger" : "text-muted"}`}>
                          {isOverdue ? <AlertTriangle size={12} /> : <Clock size={12} />}
                          {task.dueDate}
                        </span>
                      </div>
                      {task.relatedPatientId && (
                        <span className="mono text-xs text-muted">{task.relatedPatientId}</span>
                      )}
                      {task.completionNote && (
                        <p className="task-note">
                          <CheckCircle size={12} /> {task.completionNote}
                        </p>
                      )}
                      <span className="badge badge-gray text-xs">{task.notificationChannel}</span>
                    </Card>
                  );
                })}
                {columnTasks.length === 0 && <p className="empty-col">No tasks</p>}
              </div>
            </div>
          );
        })}
      </div>

      <Card className="note-card">
        <strong>Task rules</strong>
        <p>
          Task notifications do not expose sensitive medical details — only task title, due date, and a secure link are shared. Secretary handles payment and device return
          follow-ups. Doctor tasks come only from verified clinical needs.
        </p>
      </Card>
    </div>
  );
}
