"use client";

import { Bookmark, CheckCircle, FileText, XCircle } from "lucide-react";
import type { DemoActions, DemoData } from "@/lib/appState";
import { Card, SectionTitle } from "@/components/shared";

export function DoctorWorking({ data, actions }: { data: DemoData; actions: DemoActions }) {
  const cases = data.cases.filter((item) => item.doctorStatus === "Working");
  const active = cases[0];
  const report = active ? data.reports.find((item) => item.caseId === active.id) : undefined;
  const patient = active ? data.patients.find((item) => item.patientSecureId === active.patientSecureId) : undefined;
  const insights = active ? data.insights.filter((item) => item.relatedCaseId === active.id).slice(0, 3) : [];

  return (
    <div className="dashboard-grid">
      <Card>
        <SectionTitle eyebrow="Working list" title="Active Doctor Cases" />
        <div className="case-list">
          {cases.slice(0, 30).map((demoCase) => (
            <button key={demoCase.id} onClick={() => actions.selectCase(demoCase.id)}>
              <strong>{demoCase.id}</strong>
              <span>{demoCase.motif}</span>
            </button>
          ))}
        </div>
      </Card>
      <Card className="wide-card">
        <SectionTitle eyebrow="Prep" title={active ? active.id : "No active working case"} />
        {active ? (
          <div className="report-viewer">
            <h3>Prep report</h3>
            {report ? report.sections.map((section) => (
              <section key={section.title}>
                <h4>{section.title}</h4>
                <p>{section.body}</p>
              </section>
            )) : <p>No report generated yet.</p>}
            <h3>Prior context summary</h3>
            <p>{patient?.relevantHistorySummary ?? "No secure-layer summary available in cockpit."}</p>
            <h3>Documents checklist</h3>
            <div className="tag-cloud">{(active.missingInfo.length ? active.missingInfo : ["No missing documents"]).map((item) => <span key={item}>{item}</span>)}</div>
            <h3>Smart Insights quiet panel</h3>
            {insights.map((insight) => (
              <article className="insight-card compact" key={insight.id}>
                <strong>{insight.title}</strong>
                <p>{insight.whyItMayMatter}</p>
                <div className="card-actions">
                  <button onClick={() => actions.updateInsight(insight.id, "Save")}><Bookmark size={14} /> Save insight</button>
                  <button onClick={() => actions.updateInsight(insight.id, "Dismiss")}><XCircle size={14} /> Dismiss</button>
                </div>
              </article>
            ))}
            <div className="card-actions">
              <button onClick={() => actions.generateDraft(active.id)}><FileText size={15} /> Mark reviewed</button>
              <button onClick={() => actions.closeCase(active.id)}><CheckCircle size={15} /> Complete consultation</button>
            </div>
          </div>
        ) : <p>No working cases. Start a ready case from Doctor Pending.</p>}
      </Card>
    </div>
  );
}
