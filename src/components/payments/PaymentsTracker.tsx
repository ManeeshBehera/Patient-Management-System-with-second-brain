"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, Clock, CreditCard, Filter } from "lucide-react";
import type { DemoData } from "@/lib/appState";
import type { PaymentStatus } from "@/lib/types";
import { Card, MiniBarChart, SectionTitle } from "@/components/shared";

const statusColors: Record<PaymentStatus, string> = {
  Paid: "#22c55e",
  Unpaid: "#ef4444",
  "Partially paid": "#f59e0b",
  Unknown: "#64748b"
};

const followUpColors: Record<string, string> = {
  "Not contacted": "#64748b",
  Emailed: "#2f7dd1",
  Called: "#8b5cf6",
  Resolved: "#22c55e"
};

export function PaymentsTracker({ data }: { data: DemoData }) {
  const [statusFilter, setStatusFilter] = useState<PaymentStatus | "All">("All");
  const [ownerFilter, setOwnerFilter] = useState<string>("All");

  const payments = data.payments ?? [];

  const filtered = payments.filter(
    (p) =>
      (statusFilter === "All" || p.paymentStatus === statusFilter) &&
      (ownerFilter === "All" || p.secretaryOwner === ownerFilter)
  );

  const unpaidCount = payments.filter((p) => p.paymentStatus === "Unpaid").length;
  const partialCount = payments.filter((p) => p.paymentStatus === "Partially paid").length;
  const overdueCount = payments.filter((p) => p.paymentStatus !== "Paid" && new Date(p.dueDate) < new Date()).length;
  const totalOutstanding = payments.filter((p) => p.paymentStatus !== "Paid").reduce((sum, p) => sum + (p.amountDue - p.amountPaid), 0);

  const owners = ["All", ...Array.from(new Set(payments.map((p) => p.secretaryOwner)))];

  const statusBarData: Array<{ label: PaymentStatus; value: number }> = [
    { label: "Unpaid", value: unpaidCount },
    { label: "Partially paid", value: partialCount },
    { label: "Paid", value: payments.filter((p) => p.paymentStatus === "Paid").length },
    { label: "Unknown", value: payments.filter((p) => p.paymentStatus === "Unknown").length }
  ];

  return (
    <div className="stack">
      <SectionTitle
        eyebrow="Payments"
        title="Payment follow-up tracker"
        action={
          <div className="metric-chips">
            <span className="badge badge-warn">{unpaidCount} unpaid</span>
            {partialCount > 0 && <span className="badge badge-warn">{partialCount} partial</span>}
            {overdueCount > 0 && <span className="badge badge-danger">{overdueCount} overdue</span>}
          </div>
        }
      />

      <div className="metric-grid-sm">
        <Card className="metric-card">
          <CreditCard size={18} />
          <span>Total outstanding</span>
          <strong>€{totalOutstanding}</strong>
        </Card>
        <Card className="metric-card">
          <AlertTriangle size={18} />
          <span>Unpaid</span>
          <strong>{unpaidCount}</strong>
        </Card>
        <Card className="metric-card">
          <Clock size={18} />
          <span>Overdue</span>
          <strong>{overdueCount}</strong>
        </Card>
        <Card className="metric-card">
          <CheckCircle size={18} />
          <span>Paid</span>
          <strong>{payments.filter((p) => p.paymentStatus === "Paid").length}</strong>
        </Card>
      </div>

      <div className="two-col">
        <Card>
          <SectionTitle eyebrow="Breakdown" title="Payment status distribution" />
          <MiniBarChart data={statusBarData.map((d) => ({ label: d.label, value: d.value }))} color="#ef6f6c" />
        </Card>
        <Card>
          <SectionTitle eyebrow="Filters" title="Filter payments" />
          <div className="filter-col">
            <div>
              <label className="filter-label">Status</label>
              <div className="pill-group">
                {(["All", "Unpaid", "Partially paid", "Paid", "Unknown"] as Array<PaymentStatus | "All">).map((s) => (
                  <button key={s} className={`pill ${statusFilter === s ? "pill-active" : ""}`} onClick={() => setStatusFilter(s)}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="filter-label">Secretary</label>
              <div className="pill-group">
                {owners.map((o) => (
                  <button key={o} className={`pill ${ownerFilter === o ? "pill-active" : ""}`} onClick={() => setOwnerFilter(o)}>
                    {o}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card>
        <SectionTitle eyebrow={`${filtered.length} records`} title="Payment records" />
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Patient</th>
                <th>Service</th>
                <th>Due</th>
                <th>Paid</th>
                <th>Status</th>
                <th>Due date</th>
                <th>Reminder</th>
                <th>Owner</th>
                <th>Follow-up</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((payment) => {
                const isOverdue = payment.paymentStatus !== "Paid" && new Date(payment.dueDate) < new Date();
                return (
                  <tr key={payment.id} className={isOverdue ? "row-danger" : ""}>
                    <td><span className="mono">{payment.id}</span></td>
                    <td><span className="mono">{payment.patientSecureId}</span></td>
                    <td>{payment.serviceType}</td>
                    <td><strong>€{payment.amountDue}</strong></td>
                    <td>€{payment.amountPaid}</td>
                    <td>
                      <span className="status-dot" style={{ color: statusColors[payment.paymentStatus] }}>
                        ● {payment.paymentStatus}
                      </span>
                    </td>
                    <td>
                      <span className={isOverdue ? "text-danger date-cell" : "date-cell"}>
                        {isOverdue && <AlertTriangle size={12} />}
                        {payment.dueDate}
                      </span>
                    </td>
                    <td><span className="date-cell"><Clock size={12} />{payment.reminderDate}</span></td>
                    <td>{payment.secretaryOwner}</td>
                    <td>
                      <span style={{ color: followUpColors[payment.followUpStatus] }}>
                        {payment.followUpStatus}
                      </span>
                    </td>
                    <td className="text-muted text-sm">{payment.notes || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="note-card">
        <strong>Payment follow-up rule</strong>
        <p>
          Payment reminders go to the assigned secretary first. Patients are not automatically contacted. Sensitive case context is not included in payment follow-up
          communications.
        </p>
      </Card>
    </div>
  );
}
