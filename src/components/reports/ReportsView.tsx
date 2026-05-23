"use client";

import { CheckCircle, ExternalLink, Lock, RefreshCw } from "lucide-react";
import { useState } from "react";
import type { DemoActions, DemoData } from "@/lib/appState";
import { Card, SectionTitle } from "@/components/shared";
import { formatDateTime } from "@/lib/utils";

export function ReportsView({ data, actions }: { data: DemoData; actions: DemoActions }) {
  const [activeReportId, setActiveReportId] = useState<string>();
  const reports = data.reports.slice(0, 120);
  const active = reports.find((report) => report.id === activeReportId) ?? reports[0];
  const demoCase = active ? data.cases.find((item) => item.id === active.caseId) : undefined;
  return (
    <div className="dashboard-grid">
      <Card>
        <SectionTitle eyebrow="Drafts" title="Reports" />
        <div className="case-list">
          {reports.map((report) => (
            <button key={report.id} onClick={() => { setActiveReportId(report.id); actions.selectCase(report.caseId); }}>
              <strong>{report.type}</strong>
              <span>{report.caseId} · {report.status}</span>
            </button>
          ))}
        </div>
      </Card>
      <Card className="wide-card">
        <SectionTitle
          eyebrow="Viewer"
          title={active?.type ?? "No report selected"}
          action={demoCase && (
            <div className="card-actions">
              <button className="primary-button" onClick={() => actions.regenerateReport(demoCase.id)}><RefreshCw size={15} /> Regenerate demo draft</button>
              <button onClick={() => actions.approveReport(demoCase.id)}><CheckCircle size={15} /> Approve draft</button>
              <button onClick={() => actions.lockReport(demoCase.id)}><Lock size={15} /> Lock report</button>
              <button onClick={() => actions.openSecureLink(demoCase.id)}><ExternalLink size={15} /> Open secure link placeholder</button>
            </div>
          )}
        />
        {active && demoCase ? (
          <div className="report-viewer">
            <div className="warning-banner">AI-generated draft. Secretary validation required before doctor view.</div>
            <p><strong>{demoCase.id}</strong> · {formatDateTime(demoCase.appointment)} · {demoCase.patientSecureId}</p>
            {active.sections.map((section) => (
              <section key={section.title}>
                <h3>{section.title}</h3>
                <p>{section.body}</p>
              </section>
            ))}
          </div>
        ) : <p>Generate a report from a case to view it here.</p>}
      </Card>
    </div>
  );
}
