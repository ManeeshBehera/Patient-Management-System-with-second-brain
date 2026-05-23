"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle, FileText, Send, UserCheck } from "lucide-react";
import type { DemoActions, DemoData } from "@/lib/appState";
import type { Case } from "@/lib/types";
import { Card, SectionTitle } from "@/components/shared";
import { formatDateTime, priorityChip } from "@/lib/utils";

const checklistItems = [
  "Identity verified in secure source",
  "Appointment date/time verified",
  "Reason/motif verified",
  "New/existing match checked",
  "Missing documents requested",
  "AI draft checked",
  "Secure record link works"
];

function ColumnCard({ title, cases, onSelect, actions }: { title: string; cases: Case[]; onSelect: (caseId: string) => void; actions: DemoActions }) {
  return (
    <div className="kanban-col secretary-col">
      <h3>
        {title}
        <span className="count-badge">{cases.length}</span>
      </h3>
      <div className="column-scroll">
        {cases.slice(0, 40).map((demoCase) => (
          <article className="review-card" key={demoCase.id}>
            <button className="card-select" onClick={() => onSelect(demoCase.id)}>
              <div>
                <strong>{demoCase.id}</strong>
                <span className={priorityChip(demoCase.priority)}>{demoCase.priority}</span>
              </div>
              <p>{demoCase.source} · {demoCase.motif}</p>
              <small>{formatDateTime(demoCase.appointment)}</small>
              <small>{demoCase.missingInfo.length ? demoCase.missingInfo.join(", ") : "No missing info"}</small>
              <span className="chip chip-cyan">AI {demoCase.aiConfidence}%</span>
            </button>
            <div className="card-actions">
              <button onClick={() => { onSelect(demoCase.id); actions.matchPatient(demoCase.id); }}><UserCheck size={14} /> Verify</button>
              <button onClick={() => { onSelect(demoCase.id); actions.requestMissingInfo(demoCase.id, ["Previous cardiology report"]); }}><AlertTriangle size={14} /> Missing info</button>
              <button onClick={() => { onSelect(demoCase.id); actions.generateDraft(demoCase.id); actions.approveReport(demoCase.id); }}><FileText size={14} /> Approve draft</button>
              <button onClick={() => { onSelect(demoCase.id); actions.moveToDoctorPending(demoCase.id); }}><Send size={14} /> Send</button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function SecretaryReviewBoard({ data, actions }: { data: DemoData; actions: DemoActions }) {
  const [selectedCaseId, setSelectedCaseId] = useState<string>();
  const [checksByCase, setChecksByCase] = useState<Record<string, boolean[]>>({});
  const selectedCase = data.cases.find((item) => item.id === selectedCaseId);
  const checks = selectedCaseId ? checksByCase[selectedCaseId] ?? Array(checklistItems.length).fill(false) : [];
  const completed = checks.filter(Boolean).length;
  const readyToSend = selectedCase && completed === checklistItems.length;

  const columns = useMemo(
    () => [
      { title: "To verify", cases: data.cases.filter((item) => ["New Intake", "Matching"].includes(item.intakeStatus)) },
      { title: "Missing information", cases: data.cases.filter((item) => item.intakeStatus === "Missing Info") },
      { title: "Draft ready", cases: data.cases.filter((item) => item.intakeStatus === "Review" || item.intakeStatus === "Drafting") },
      { title: "Verified", cases: data.cases.filter((item) => item.secretaryReview === "Verified" && item.doctorStatus === "Pending") }
    ],
    [data.cases]
  );

  function toggleCheck(index: number) {
    if (!selectedCaseId) return;
    setChecksByCase((current) => {
      const next = current[selectedCaseId] ? [...current[selectedCaseId]] : Array(checklistItems.length).fill(false);
      next[index] = !next[index];
      return { ...current, [selectedCaseId]: next };
    });
  }

  return (
    <div className="secretary-layout">
      <Card className="wide-card min-w-0">
        <SectionTitle eyebrow="Human gate" title="Secretary Review Board" />
        <div className="kanban secretary-board">
          {columns.map((column) => (
            <ColumnCard key={column.title} title={column.title} cases={column.cases} onSelect={setSelectedCaseId} actions={actions} />
          ))}
        </div>
      </Card>
      <Card className="secretary-detail">
        {!selectedCase ? (
          <div className="empty-state">
            <UserCheck size={26} />
            <h2>Select a case to review its checklist.</h2>
            <p>The right panel stays focused on one selected case so checklist rows, labels, and approval state remain readable.</p>
          </div>
        ) : (
          <>
            <SectionTitle eyebrow="Selected case" title={selectedCase.id} action={<span className="badge badge-blue">{completed} / {checklistItems.length} checks completed</span>} />
            <div className="case-summary-panel">
              <p><strong>{selectedCase.source}</strong> · {selectedCase.motif}</p>
              <p>{formatDateTime(selectedCase.appointment)} · {selectedCase.patientType}</p>
              <p>{selectedCase.missingInfo.length ? selectedCase.missingInfo.join(", ") : "No missing info flagged"}</p>
              <p>{selectedCase.secureRecordLink}</p>
              <p>Report status: {selectedCase.reportStatus}</p>
            </div>
            <div className="checklist-stack">
              {checklistItems.map((item, index) => (
                <label className="check-row boxed-check" key={item}>
                  <input type="checkbox" checked={Boolean(checks[index])} onChange={() => toggleCheck(index)} />
                  <span>{item}</span>
                </label>
              ))}
            </div>
            <div className="note-card compact">
              <CheckCircle size={18} />
              <p>Approving a case makes it doctor-visible and moves it to Doctor Pending.</p>
            </div>
            <div className="card-actions">
              <button onClick={() => actions.generateDraft(selectedCase.id)}><FileText size={14} /> Generate draft</button>
              <button onClick={() => actions.approveReport(selectedCase.id)}><CheckCircle size={14} /> Approve draft</button>
              <button disabled={!readyToSend} className={!readyToSend ? "disabled-button" : ""} onClick={() => actions.moveToDoctorPending(selectedCase.id)}><Send size={14} /> Approve and send to doctor</button>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
