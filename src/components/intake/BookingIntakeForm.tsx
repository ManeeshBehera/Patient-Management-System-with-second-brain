"use client";

import { useMemo, useState } from "react";
import { Globe, Phone, PlusCircle } from "lucide-react";
import type { BookingInput, BookingSource, MotifCategory, PatientType, Priority } from "@/lib/types";
import type { DemoActions } from "@/lib/appState";
import { Card, SectionTitle } from "@/components/shared";

const sources: BookingSource[] = ["Doctolib", "Website", "Direct phone", "Walk-in", "Email", "WhatsApp"];
const patientTypes: PatientType[] = ["New", "Existing", "Unclear"];
const motifs: MotifCategory[] = ["Rhythmology", "Holter", "Hypertension", "Preventive cardiology", "PGV", "Follow-up", "Device follow-up", "Post-ablation follow-up", "Syncope / dizziness", "Chest discomfort", "Screening", "Other"];
const priorities: Priority[] = ["Normal", "Review", "Urgent"];

const defaults: BookingInput = {
  source: "Doctolib",
  appointment: "2026-05-28T09:30",
  patientType: "New",
  motif: "Rhythmology",
  reasonSummary: "Palpitations for several weeks, rhythmology consultation requested.",
  missingInfo: ["ECG"],
  priority: "Review",
  secureRecordLink: "HDS://record/PSID-NEW",
  assignedSecretary: "Samira"
};

export function BookingIntakeForm({ actions }: { actions: DemoActions }) {
  const [form, setForm] = useState<BookingInput>(defaults);
  const [toast, setToast] = useState("");
  const reportType = useMemo(() => (form.patientType === "Existing" ? "Existing Patient Extension" : "New Patient Starter Report"), [form.patientType]);

  function update<K extends keyof BookingInput>(key: K, value: BookingInput[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function simulate(source: "Doctolib" | "Website" | "Direct phone") {
    const presets: Record<typeof source, BookingInput> = {
      Doctolib: { ...defaults, source, reasonSummary: "New patient from Doctolib, palpitations, ECG needed.", missingInfo: ["ECG"], motif: "Rhythmology" },
      Website: { ...defaults, source, patientType: "Existing", motif: "Holter", reasonSummary: "Existing patient returning for Holter result review.", missingInfo: [] },
      "Direct phone": { ...defaults, source, patientType: "Existing", motif: "Hypertension", reasonSummary: "Hypertension follow-up, medication list missing.", missingInfo: ["Medication list"] }
    };
    setForm(presets[source]);
  }

  function submit() {
    actions.createBooking(form);
    setToast("Case created and sent to secretary review.");
  }

  return (
    <div className="stack">
      <Card>
        <SectionTitle eyebrow="Capture" title="Booking Intake" action={<span className="badge badge-blue">{reportType}</span>} />
        <div className="quick-actions">
          <button onClick={() => simulate("Doctolib")}>
            <Globe size={16} /> Simulate Doctolib booking
          </button>
          <button onClick={() => simulate("Website")}>
            <Globe size={16} /> Simulate website booking
          </button>
          <button onClick={() => simulate("Direct phone")}>
            <Phone size={16} /> Simulate direct phone booking
          </button>
        </div>
        <div className="form-grid">
          <label>
            Booking source
            <select value={form.source} onChange={(event) => update("source", event.target.value as BookingSource)}>
              {sources.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Appointment date/time
            <input type="datetime-local" value={form.appointment} onChange={(event) => update("appointment", event.target.value)} />
          </label>
          <label>
            Patient type guess
            <select value={form.patientType} onChange={(event) => update("patientType", event.target.value as PatientType)}>
              {patientTypes.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Motif category
            <select value={form.motif} onChange={(event) => update("motif", event.target.value as MotifCategory)}>
              {motifs.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Missing documents
            <input value={form.missingInfo.join(", ")} onChange={(event) => update("missingInfo", event.target.value.split(",").map((item) => item.trim()).filter(Boolean))} />
          </label>
          <label>
            Priority
            <select value={form.priority} onChange={(event) => update("priority", event.target.value as Priority)}>
              {priorities.map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
          </label>
          <label>
            Secure record link
            <input value={form.secureRecordLink} onChange={(event) => update("secureRecordLink", event.target.value)} />
          </label>
          <label>
            Assigned secretary
            <input value={form.assignedSecretary} onChange={(event) => update("assignedSecretary", event.target.value)} />
          </label>
          <label className="form-wide">
            Sanitized reason summary
            <textarea value={form.reasonSummary} onChange={(event) => update("reasonSummary", event.target.value)} />
          </label>
        </div>
        <div className="form-footer">
          <button className="primary-button" onClick={submit}>
            <PlusCircle size={17} /> Create case
          </button>
          {toast && <span className="toast">{toast}</span>}
        </div>
      </Card>
    </div>
  );
}
