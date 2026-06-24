"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, Clock, Lock, Search, User } from "lucide-react";
import type { DemoData } from "@/lib/appState";
import { Card, SectionTitle } from "@/components/shared";

const riskColors: Record<string, string> = {
  Routine: "#22c55e",
  Review: "#f59e0b",
  "High attention": "#ef4444",
  "Secretary verification": "#8b5cf6"
};

export function PatientsRegistry({ data }: { data: DemoData }) {
  const [query, setQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("All");

  const filtered = data.patients.filter((patient) => {
    const matchesQuery =
      !query ||
      patient.patientSecureId.toLowerCase().includes(query.toLowerCase()) ||
      patient.primaryCardiologyIssue.toLowerCase().includes(query.toLowerCase()) ||
      patient.assignedMotifCategory.toLowerCase().includes(query.toLowerCase());
    const matchesRisk = riskFilter === "All" || patient.riskFlag === riskFilter;
    return matchesQuery && matchesRisk;
  });

  const riskGroups = ["All", "Routine", "Review", "High attention", "Secretary verification"];
  const riskCounts: Record<string, number> = { All: data.patients.length };
  for (const p of data.patients) riskCounts[p.riskFlag] = (riskCounts[p.riskFlag] ?? 0) + 1;

  return (
    <div className="stack">
      <SectionTitle
        eyebrow="Patient registry"
        title="All patients"
        action={
          <span className="badge badge-blue">
            <Lock size={12} /> Secure IDs only — identifiable data in HDS layer
          </span>
        }
      />

      <div className="filter-row">
        <div className="search-wrap">
          <Search size={16} />
          <input
            className="search-input"
            placeholder="Search by ID, motif, or condition…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="pill-group">
          {riskGroups.map((flag) => (
            <button
              key={flag}
              className={`pill ${riskFilter === flag ? "pill-active" : ""}`}
              onClick={() => setRiskFilter(flag)}
            >
              {flag} ({riskCounts[flag] ?? 0})
            </button>
          ))}
        </div>
      </div>

      <Card>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Patient ID</th>
                <th>Age range</th>
                <th>Sex</th>
                <th>Type</th>
                <th>Primary issue</th>
                <th>Motif</th>
                <th>Risk flag</th>
                <th>Missing docs</th>
                <th>Next appointment</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map((patient) => (
                <tr key={patient.patientSecureId}>
                  <td>
                    <span className="mono">{patient.patientSecureId}</span>
                  </td>
                  <td>{patient.ageRange}</td>
                  <td>{patient.sex}</td>
                  <td>
                    <span className={`status-badge ${patient.patientType === "New" ? "badge-blue" : "badge-gray"}`}>
                      {patient.patientType}
                    </span>
                  </td>
                  <td className="text-sm text-muted truncate-cell">{patient.primaryCardiologyIssue}</td>
                  <td>{patient.assignedMotifCategory}</td>
                  <td>
                    <span className="risk-dot" style={{ color: riskColors[patient.riskFlag] }}>
                      {patient.riskFlag === "Routine" ? (
                        <CheckCircle size={14} />
                      ) : patient.riskFlag === "High attention" ? (
                        <AlertTriangle size={14} />
                      ) : (
                        <User size={14} />
                      )}
                      {patient.riskFlag}
                    </span>
                  </td>
                  <td>
                    {patient.missingDocumentFlags.length > 0 ? (
                      <span className="badge badge-warn">{patient.missingDocumentFlags.length} missing</span>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                  <td>
                    <span className="date-cell">
                      <Clock size={12} />
                      {patient.nextAppointmentDate.slice(0, 10)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length > 100 && (
          <p className="table-note">Showing 100 of {filtered.length} patients. Refine search to narrow results.</p>
        )}
      </Card>

      <Card className="note-card">
        <strong>Demo principle</strong>
        <p>
          Patient identifiers shown are secure IDs only. Names, contact details, and full records remain in the secure HDS layer outside this cockpit. This registry tracks
          operational state, not clinical data.
        </p>
      </Card>
    </div>
  );
}
