"use client";

import { Bell, FileText, PlayCircle } from "lucide-react";
import type { DemoActions, DemoData } from "@/lib/appState";
import { Card, SectionTitle } from "@/components/shared";
import { formatDateTime } from "@/lib/utils";

export function DoctorPending({ data, actions }: { data: DemoData; actions: DemoActions }) {
  const cases = data.cases.filter((item) => item.doctorVisible && item.doctorStatus === "Pending" && ["Ready", "Pending"].includes(item.intakeStatus));
  return (
    <div className="stack">
      <Card>
        <SectionTitle eyebrow="Verified only" title="Doctor Pending" action={<span className="badge badge-green">{cases.length} ready cases</span>} />
        <div className="doctor-grid">
          {cases.slice(0, 60).map((demoCase) => {
            const insightCount = data.insights.filter((item) => item.relatedCaseId === demoCase.id && item.visibility !== "Quiet").length;
            return (
              <article className="doctor-card" key={demoCase.id}>
                <div>
                  <strong>{demoCase.id}</strong>
                  {insightCount > 0 && <span className="badge badge-blue"><Bell size={13} /> {insightCount}</span>}
                </div>
                <h3>{demoCase.motif}</h3>
                <p>{demoCase.reasonSummary}</p>
                <dl>
                  <div><dt>Appointment</dt><dd>{formatDateTime(demoCase.appointment)}</dd></div>
                  <div><dt>Report type</dt><dd>{demoCase.patientType === "Existing" ? "Existing Patient Extension" : "New Patient Starter Report"}</dd></div>
                  <div><dt>Missing info</dt><dd>{demoCase.missingInfo.length ? demoCase.missingInfo.join(", ") : "Ready"}</dd></div>
                </dl>
                <div className="card-actions">
                  <button onClick={() => actions.selectCase(demoCase.id)}><FileText size={15} /> Open Prep</button>
                  <button onClick={() => actions.startDoctorWork(demoCase.id)}><PlayCircle size={15} /> Start Working</button>
                </div>
              </article>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
