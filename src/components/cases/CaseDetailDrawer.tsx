"use client";

import { AlertTriangle, Brain, CheckCircle, Database, FileText, Lock, X } from "lucide-react";
import type { DemoActions, DemoData } from "@/lib/appState";
import type { Case, UserRole } from "@/lib/types";
import { doctorChip, formatDateTime, intakeChip, priorityChip } from "@/lib/utils";

export function CaseDetailDrawer({ demoCase, data, actions, role }: { demoCase?: Case; data: DemoData; actions: DemoActions; role: UserRole }) {
  if (!demoCase) return null;
  const patient = data.patients.find((item) => item.patientSecureId === demoCase.patientSecureId);
  const report = data.reports.find((item) => item.caseId === demoCase.id);
  const insights = data.insights.filter((item) => item.relatedCaseId === demoCase.id).slice(0, 3);
  const canSecretary = role !== "Doctor";
  const canDoctor = role !== "Secretary";

  return (
    <div className="drawer-backdrop" onClick={actions.clearSelectedCase}>
      <aside className="drawer" onClick={(event) => event.stopPropagation()}>
        <div className="drawer-header">
          <div>
            <div className="eyebrow">{demoCase.id}</div>
            <h2>{demoCase.motif}</h2>
          </div>
          <button className="icon-button" onClick={actions.clearSelectedCase} aria-label="Close case">
            <X size={18} />
          </button>
        </div>
        <div className="drawer-chips">
          <span className={intakeChip(demoCase.intakeStatus)}>{demoCase.intakeStatus}</span>
          <span className={doctorChip(demoCase.doctorStatus)}>{demoCase.doctorStatus}</span>
          <span className={priorityChip(demoCase.priority)}>{demoCase.priority}</span>
        </div>
        <section className="drawer-section">
          <h3>Intake summary</h3>
          <p>{demoCase.reasonSummary}</p>
          <dl>
            <div>
              <dt>Appointment</dt>
              <dd>{formatDateTime(demoCase.appointment)}</dd>
            </div>
            <div>
              <dt>Patient Secure ID</dt>
              <dd>{demoCase.patientSecureId}</dd>
            </div>
            <div>
              <dt>AI confidence</dt>
              <dd>{demoCase.aiConfidence}%</dd>
            </div>
          </dl>
        </section>
        <section className="secure-card">
          <Lock size={18} />
          <div>
            <strong>Secure data layer</strong>
            <span>{demoCase.secureRecordLink}</span>
            <small>Identifiable patient data remains outside this cockpit.</small>
          </div>
        </section>
        {patient && (
          <section className="drawer-section">
            <h3>Pseudonymous patient profile</h3>
            <p>{patient.primaryCardiologyIssue}</p>
            <div className="tag-cloud">
              <span>{patient.ageRange}</span>
              <span>{patient.sex}</span>
              <span>{patient.riskFlag}</span>
              <span>{patient.medications[0]?.class}</span>
            </div>
          </section>
        )}
        <section className="drawer-section">
          <h3>Report status</h3>
          <p>{report ? `${report.type} / ${report.status} / v${report.version}` : "No report generated yet."}</p>
        </section>
        <section className="drawer-section">
          <h3>Missing info checklist</h3>
          {demoCase.missingInfo.length ? demoCase.missingInfo.map((item) => <label key={item} className="check-row"><AlertTriangle size={15} /> {item}</label>) : <label className="check-row"><CheckCircle size={15} /> No missing information flagged</label>}
        </section>
        <section className="drawer-section">
          <h3>Secretary checklist</h3>
          {["Identity verified in secure source", "Appointment date/time verified", "Reason/motif verified", "New/existing match checked", "Missing documents requested", "AI draft checked", "Secure record link works"].map((item, index) => (
            <label key={item} className="check-row">
              <input type="checkbox" defaultChecked={index < 3 || demoCase.secretaryReview === "Verified"} /> {item}
            </label>
          ))}
        </section>
        <section className="drawer-section">
          <h3>Automation timeline</h3>
          <ul className="timeline">
            {demoCase.timeline.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </section>
        <section className="drawer-section">
          <h3>Smart Insights</h3>
          {insights.length ? insights.map((item) => (
            <div className="insight-mini" key={item.id}>
              <Brain size={15} />
              <span>{item.title}</span>
              <strong>{item.visibility}</strong>
            </div>
          )) : <p>No relevant quiet insight for this case.</p>}
        </section>
        <div className="drawer-actions">
          {canSecretary && <button onClick={() => actions.matchPatient(demoCase.id)}><Database size={15} /> Match Patient</button>}
          {canSecretary && <button onClick={() => actions.generateDraft(demoCase.id)}><FileText size={15} /> Generate Draft</button>}
          {canSecretary && <button onClick={() => actions.requestMissingInfo(demoCase.id, ["Medication list"])}><AlertTriangle size={15} /> Request Missing Info</button>}
          {canSecretary && <button onClick={() => actions.validateIntake(demoCase.id)}><CheckCircle size={15} /> Validate Intake</button>}
          {canSecretary && <button onClick={() => actions.moveToDoctorPending(demoCase.id)}><CheckCircle size={15} /> Move to Doctor Pending</button>}
          {canDoctor && <button onClick={() => actions.startDoctorWork(demoCase.id)}><FileText size={15} /> Start Doctor Work</button>}
          {canDoctor && <button onClick={() => actions.closeCase(demoCase.id)}><CheckCircle size={15} /> Close Case</button>}
        </div>
      </aside>
    </div>
  );
}
