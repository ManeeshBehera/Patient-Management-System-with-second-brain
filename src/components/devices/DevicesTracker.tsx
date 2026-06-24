"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, Clock, Package, Wifi } from "lucide-react";
import type { DemoData } from "@/lib/appState";
import type { DeviceStatus } from "@/lib/types";
import { Card, MiniBarChart, SectionTitle } from "@/components/shared";

const statusColors: Record<DeviceStatus, string> = {
  Available: "#22c55e",
  Issued: "#2f7dd1",
  "Due soon": "#f59e0b",
  Overdue: "#ef4444",
  Returned: "#22c55e",
  Lost: "#7c3aed",
  Damaged: "#dc2626"
};

const statusIcon: Record<DeviceStatus, React.ElementType> = {
  Available: CheckCircle,
  Issued: Wifi,
  "Due soon": Clock,
  Overdue: AlertTriangle,
  Returned: CheckCircle,
  Lost: AlertTriangle,
  Damaged: AlertTriangle
};

const STATUSES: DeviceStatus[] = ["Available", "Issued", "Due soon", "Overdue", "Returned", "Lost", "Damaged"];

export function DevicesTracker({ data }: { data: DemoData }) {
  const [statusFilter, setStatusFilter] = useState<DeviceStatus | "All">("All");
  const [ownerFilter, setOwnerFilter] = useState<string>("All");

  const devices = data.devices ?? [];

  const filtered = devices.filter(
    (d) =>
      (statusFilter === "All" || d.status === statusFilter) &&
      (ownerFilter === "All" || d.secretaryOwner === ownerFilter)
  );

  const issuedCount = devices.filter((d) => d.status === "Issued").length;
  const dueSoonCount = devices.filter((d) => d.status === "Due soon").length;
  const overdueCount = devices.filter((d) => d.status === "Overdue").length;
  const lostDamaged = devices.filter((d) => d.status === "Lost" || d.status === "Damaged").length;

  const owners = ["All", ...Array.from(new Set(devices.map((d) => d.secretaryOwner)))];

  const statusBarData = STATUSES.map((s) => ({
    label: s,
    value: devices.filter((d) => d.status === s).length
  })).filter((d) => d.value > 0);

  return (
    <div className="stack">
      <SectionTitle
        eyebrow="Devices / Holters"
        title="Device & Holter return tracker"
        action={
          <div className="metric-chips">
            <span className="badge badge-blue">{issuedCount} issued</span>
            {dueSoonCount > 0 && <span className="badge badge-warn">{dueSoonCount} due soon</span>}
            {overdueCount > 0 && <span className="badge badge-danger">{overdueCount} overdue</span>}
            {lostDamaged > 0 && <span className="badge badge-danger">{lostDamaged} lost/damaged</span>}
          </div>
        }
      />

      <div className="metric-grid-sm">
        <Card className="metric-card">
          <Wifi size={18} />
          <span>Currently issued</span>
          <strong>{issuedCount}</strong>
        </Card>
        <Card className="metric-card">
          <Clock size={18} />
          <span>Due soon</span>
          <strong>{dueSoonCount}</strong>
        </Card>
        <Card className="metric-card">
          <AlertTriangle size={18} />
          <span>Overdue</span>
          <strong>{overdueCount}</strong>
        </Card>
        <Card className="metric-card">
          <Package size={18} />
          <span>Lost / damaged</span>
          <strong>{lostDamaged}</strong>
        </Card>
      </div>

      <div className="two-col">
        <Card>
          <SectionTitle eyebrow="Breakdown" title="Device status distribution" />
          <MiniBarChart data={statusBarData} color="#2f7dd1" />
        </Card>
        <Card>
          <SectionTitle eyebrow="Filters" title="Filter devices" />
          <div className="filter-col">
            <div>
              <label className="filter-label">Status</label>
              <div className="pill-group" style={{ flexWrap: "wrap" }}>
                <button className={`pill ${statusFilter === "All" ? "pill-active" : ""}`} onClick={() => setStatusFilter("All")}>
                  All
                </button>
                {STATUSES.map((s) => (
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
        <SectionTitle eyebrow={`${filtered.length} records`} title="Device records" />
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Device ref</th>
                <th>Patient</th>
                <th>Given</th>
                <th>Expected return</th>
                <th>Actual return</th>
                <th>Status</th>
                <th>Owner</th>
                <th>Follow-up</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((device) => {
                const Icon = statusIcon[device.status];
                const isAlert = ["Overdue", "Lost", "Damaged"].includes(device.status);
                return (
                  <tr key={device.id} className={isAlert ? "row-danger" : ""}>
                    <td><span className="mono">{device.id}</span></td>
                    <td>{device.deviceType}</td>
                    <td><span className="mono">{device.deviceRef}</span></td>
                    <td><span className="mono">{device.patientSecureId}</span></td>
                    <td><span className="date-cell"><Clock size={12} />{device.givenDate}</span></td>
                    <td>
                      <span className={isAlert ? "date-cell text-danger" : "date-cell"}>
                        {isAlert && <AlertTriangle size={12} />}
                        {device.expectedReturnDate}
                      </span>
                    </td>
                    <td>{device.actualReturnDate ? <span className="date-cell"><CheckCircle size={12} />{device.actualReturnDate}</span> : <span className="text-muted">—</span>}</td>
                    <td>
                      <span className="status-dot" style={{ color: statusColors[device.status] }}>
                        <Icon size={13} /> {device.status}
                      </span>
                    </td>
                    <td>{device.secretaryOwner}</td>
                    <td>{device.followUpStatus}</td>
                    <td className="text-muted text-sm">{device.notes || "—"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="note-card">
        <strong>Device return rule</strong>
        <p>
          Device return reminders go to the assigned secretary first. Patients are not automatically contacted. Lost or damaged devices are escalated to the admin or
          doctor. All device events are logged in the Automation Log.
        </p>
      </Card>
    </div>
  );
}
