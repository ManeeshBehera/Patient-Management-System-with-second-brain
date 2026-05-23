import type { Case, Report, ReportType } from "./types";

const preparationWarning = "AI-generated draft. Secretary validation required before doctor view.";

export function getReportType(patientType: Case["patientType"]): ReportType {
  return patientType === "Existing" ? "Existing Patient Extension" : "New Patient Starter Report";
}

export function buildReport(demoCase: Case, version = 1): Report {
  const type = getReportType(demoCase.patientType);
  const isExisting = type === "Existing Patient Extension";
  const missing = demoCase.missingInfo.length ? demoCase.missingInfo.join(", ") : "No currently flagged missing items.";
  const commonAppointment = `${demoCase.id} / ${demoCase.motif} / ${new Date(demoCase.appointment).toLocaleString("en-GB")}`;

  return {
    id: `RPT-${demoCase.id}-${version}`,
    caseId: demoCase.id,
    type,
    status: "Draft",
    version,
    generatedAt: new Date().toISOString(),
    warning: preparationWarning,
    sections: isExisting
      ? [
          { title: "Appointment", body: commonAppointment },
          {
            title: "Previous context",
            body: `Existing secure record ${demoCase.secureRecordLink}. Only sanitized continuity notes are shown in this cockpit.`
          },
          {
            title: "What changed",
            body: `Reason summary: ${demoCase.reasonSummary}. Intake suggests this is a follow-up preparation note, not a diagnosis.`
          },
          {
            title: "Pending follow-ups",
            body: demoCase.motif === "Holter" ? "Check whether Holter report PDF is attached in the secure layer." : "Review prior secure record context before consultation."
          },
          { title: "Missing updates", body: missing },
          {
            title: "Doctor working note",
            body: "Concise context for appointment preparation only. No treatment recommendation generated in demo mode."
          }
        ]
      : [
          { title: "Appointment", body: commonAppointment },
          {
            title: "Available context",
            body: `Sanitized intake from ${demoCase.source}. Patient Secure ID: ${demoCase.patientSecureId}.`
          },
          { title: "Missing information", body: missing },
          {
            title: "Pre-consult checklist",
            body: "Confirm identity in secure source, verify documents, review appointment reason, and keep identifiable details outside this cockpit."
          },
          {
            title: "Reason-specific prep",
            body: `${demoCase.motif} prep placeholder. This demo structures context but does not diagnose or recommend treatment.`
          },
          {
            title: "Secretary action items",
            body: demoCase.missingInfo.length ? "Request missing documents before doctor visibility." : "Draft can be reviewed for approval."
          },
          {
            title: "Doctor preview",
            body: "Short, factual preparation note intended for doctor review after secretary validation."
          }
        ]
  };
}
