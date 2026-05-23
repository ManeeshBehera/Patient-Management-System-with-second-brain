"use client";

import { useMemo, useState } from "react";
import type { DemoActions, DemoData } from "@/lib/appState";
import type { IntakeStatus, UserRole } from "@/lib/types";
import { Card, SectionTitle } from "@/components/shared";
import { doctorChip, formatDateTime, formatShortDate, intakeChip, priorityChip } from "@/lib/utils";
import { CaseDetailDrawer } from "./CaseDetailDrawer";

const statuses: Array<IntakeStatus | "All"> = ["All", "New Intake", "Matching", "Drafting", "Review", "Missing Info", "Ready", "Pending", "Working", "Done"];

export function PatientIntakeCalendar({ data, actions, selectedCaseId, role }: { data: DemoData; actions: DemoActions; selectedCaseId?: string; role: UserRole }) {
  const [view, setView] = useState<"table" | "board" | "calendar">("table");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<IntakeStatus | "All">("All");
  const [page, setPage] = useState(1);
  const pageSize = 28;
  const filtered = useMemo(() => {
    const text = query.toLowerCase();
    return data.cases.filter((demoCase) => {
      const matchesStatus = status === "All" || demoCase.intakeStatus === status;
      const matchesQuery = [demoCase.id, demoCase.patientSecureId, demoCase.source, demoCase.motif, demoCase.reasonSummary].join(" ").toLowerCase().includes(text);
      return matchesStatus && matchesQuery;
    });
  }, [data.cases, query, status]);
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
  const selected = data.cases.find((item) => item.id === selectedCaseId);

  return (
    <div className="stack">
      <Card>
        <SectionTitle eyebrow="Notion-like database" title="Patient Intake Calendar" action={<span className="badge badge-blue">{filtered.length} cases</span>} />
        <div className="toolbar">
          <input placeholder="Search case, PSID, source, motif..." value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} />
          <select value={status} onChange={(event) => { setStatus(event.target.value as IntakeStatus | "All"); setPage(1); }}>
            {statuses.map((item) => <option key={item}>{item}</option>)}
          </select>
          <div className="segmented">
            {(["table", "board", "calendar"] as const).map((item) => <button key={item} className={view === item ? "active" : ""} onClick={() => setView(item)}>{item}</button>)}
          </div>
        </div>

        {view === "table" && (
          <>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Case ID</th>
                    <th>Source</th>
                    <th>Appointment</th>
                    <th>Patient Type</th>
                    <th>Motif</th>
                    <th>Intake Status</th>
                    <th>Secretary Review</th>
                    <th>Doctor Status</th>
                    <th>Missing Info</th>
                    <th>AI Confidence</th>
                    <th>Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((demoCase) => (
                    <tr key={demoCase.id} onClick={() => actions.selectCase(demoCase.id)}>
                      <td><strong>{demoCase.id}</strong></td>
                      <td>{demoCase.source}</td>
                      <td>{formatDateTime(demoCase.appointment)}</td>
                      <td>{demoCase.patientType}</td>
                      <td>{demoCase.motif}</td>
                      <td><span className={intakeChip(demoCase.intakeStatus)}>{demoCase.intakeStatus}</span></td>
                      <td>{demoCase.secretaryReview}</td>
                      <td><span className={doctorChip(demoCase.doctorStatus)}>{demoCase.doctorStatus}</span></td>
                      <td>{demoCase.missingInfo.length ? demoCase.missingInfo.join(", ") : "None"}</td>
                      <td>{demoCase.aiConfidence}%</td>
                      <td><span className={priorityChip(demoCase.priority)}>{demoCase.priority}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <button disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Previous</button>
              <span>Page {page} of {pages}</span>
              <button disabled={page === pages} onClick={() => setPage((value) => Math.min(pages, value + 1))}>Next</button>
            </div>
          </>
        )}

        {view === "board" && (
          <div className="kanban">
            {statuses.filter((item) => item !== "All").map((column) => (
              <div className="kanban-col" key={column}>
                <h3>{column}</h3>
                {filtered.filter((item) => item.intakeStatus === column).slice(0, 12).map((demoCase) => (
                  <button className="case-card" key={demoCase.id} onClick={() => actions.selectCase(demoCase.id)}>
                    <strong>{demoCase.id}</strong>
                    <span>{demoCase.motif}</span>
                    <small>{formatDateTime(demoCase.appointment)}</small>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}

        {view === "calendar" && (
          <div className="calendar-grid">
            {Array.from({ length: 14 }, (_, index) => {
              const dayCases = filtered.filter((item) => new Date(item.appointment).getUTCDate() === 21 + index);
              return (
                <div className="calendar-cell" key={index}>
                  <strong>{dayCases[0] ? formatShortDate(dayCases[0].appointment) : `May ${21 + index}`}</strong>
                  {dayCases.slice(0, 5).map((demoCase) => <button key={demoCase.id} onClick={() => actions.selectCase(demoCase.id)}>{demoCase.id} · {demoCase.motif}</button>)}
                </div>
              );
            })}
          </div>
        )}
      </Card>
      <CaseDetailDrawer demoCase={selected} data={data} actions={actions} role={role} />
    </div>
  );
}
