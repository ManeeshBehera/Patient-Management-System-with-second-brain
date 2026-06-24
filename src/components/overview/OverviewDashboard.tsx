"use client";

import { Activity, AlertTriangle, Bell, CheckCircle, ClipboardList, Clock, CreditCard, Database, FileText, ListTodo, Stethoscope, UserCheck, Users, Wifi } from "lucide-react";
import type { DemoData } from "@/lib/appState";
import { Card, ComplianceStrip, DonutChart, MiniBarChart, SectionTitle } from "@/components/shared";

function countBy<T extends string>(items: T[]) {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item] = (acc[item] ?? 0) + 1;
    return acc;
  }, {});
}

export function OverviewDashboard({ data }: { data: DemoData }) {
  const activePatients = new Set(data.cases.filter((item) => item.intakeStatus !== "Done").map((item) => item.patientSecureId)).size;
  const sourceCounts = countBy(data.cases.map((item) => item.source));
  const statusCounts = countBy(data.cases.map((item) => item.intakeStatus));
  const motifCounts = Object.entries(countBy(data.cases.map((item) => item.motif)))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([label, value]) => ({ label, value }));
  const insightCounts = Object.entries(countBy(data.insights.map((item) => item.type))).map(([label, value]) => ({ label, value }));
  const ready = data.cases.filter((item) => item.doctorStatus === "Pending").length;
  const secretaryBacklog = data.cases.filter((item) => ["New Intake", "Matching", "Review", "Missing Info", "Drafting"].includes(item.intakeStatus)).length;
  const unpaidPayments = (data.payments ?? []).filter((p) => p.paymentStatus !== "Paid").length;
  const issuedDevices = (data.devices ?? []).filter((d) => ["Issued", "Due soon", "Overdue"].includes(d.status)).length;
  const openTasks = (data.tasks ?? []).filter((t) => t.status !== "Done").length;

  const metrics = [
    { label: "Total patients", value: data.patients.length, icon: Users },
    { label: "Active patients", value: activePatients, icon: Activity },
    { label: "New patients this month", value: data.cases.filter((item) => item.patientType === "New").length, icon: ClipboardList },
    { label: "Existing follow-ups", value: data.cases.filter((item) => item.patientType === "Existing").length, icon: UserCheck },
    { label: "High-priority cases", value: data.cases.filter((item) => item.priority === "Urgent").length, icon: AlertTriangle },
    { label: "Cases missing documents", value: data.cases.filter((item) => item.missingInfo.length > 0).length, icon: Database },
    { label: "Cases ready for doctor", value: ready, icon: CheckCircle },
    { label: "Avg booking-to-ready", value: "3h 20m", icon: Clock },
    { label: "Secretary backlog", value: secretaryBacklog, icon: ClipboardList },
    { label: "Doctor pending load", value: ready, icon: Stethoscope },
    { label: "Unpaid / partial payments", value: unpaidPayments, icon: CreditCard },
    { label: "Devices out / due / overdue", value: issuedDevices, icon: Wifi },
    { label: "Open tasks", value: openTasks, icon: ListTodo },
    { label: "AI drafts generated", value: data.reports.length, icon: FileText },
    { label: "Quiet insights available", value: data.insights.filter((item) => item.visibility === "Quiet").length, icon: Bell }
  ];

  return (
    <div className="stack">
      <ComplianceStrip />
      <section className="hero-grid">
        <Card className="hero-card">
          <div className="hero-copy">
            <span className="badge badge-blue">Notion-style operational cockpit</span>
            <h2>Every booking becomes a verified doctor-ready case.</h2>
            <p>
              A calm intake OS where the secretary validates the workflow, secure health-data placeholders keep identity outside the cockpit, and Dr Amraoui only sees clean,
              prepared cases.
            </p>
          </div>
          <div className="workflow-strip">
            {["Booking Source", "Intake Capture", "Patient Matching", "Draft Prep Report", "Secretary Review", "Ready for Doctor"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </Card>
        <div className="source-card-grid">
          {["Doctolib", "Website", "Direct phone"].map((source) => (
            <Card key={source} className="source-card">
              <strong>{source}</strong>
              <span>{sourceCounts[source] ?? 0} demo cases</span>
            </Card>
          ))}
        </div>
      </section>

      <div className="metric-grid">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <Card key={metric.label} className="metric-card">
              <Icon size={18} />
              <span>{metric.label}</span>
              <strong>{metric.value}</strong>
            </Card>
          );
        })}
      </div>

      <div className="two-col">
        <Card>
          <SectionTitle eyebrow="Source mix" title="Booking source breakdown" />
          <MiniBarChart data={Object.entries(sourceCounts).map(([label, value]) => ({ label, value }))} />
        </Card>
        <Card>
          <SectionTitle eyebrow="Workflow" title="Case distribution by status" />
          <DonutChart
            data={Object.entries(statusCounts).map(([label, value], index) => ({
              label,
              value,
              color: ["#0f8aa0", "#38b2ac", "#7bc8a4", "#f2b84b", "#ef6f6c", "#4f7bd9", "#94a3b8"][index % 7]
            }))}
          />
        </Card>
      </div>

      <div className="two-col">
        <Card>
          <SectionTitle eyebrow="Top 5" title="Motif categories" />
          <MiniBarChart data={motifCounts} color="#2f7dd1" />
        </Card>
        <Card>
          <SectionTitle eyebrow="Second Brain" title="Insights by type" />
          <MiniBarChart data={insightCounts} color="#48a978" />
        </Card>
      </div>

      <Card className="note-card">
        <strong>Demo principle</strong>
        <p>Notion-style cockpit for workflow; sensitive patient data remains in secure health-data layer. This demo does not claim real GDPR or HDS compliance.</p>
      </Card>
    </div>
  );
}
