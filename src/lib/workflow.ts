import type {
  AutomationLogEntry,
  AutomationResult,
  BookingInput,
  Case,
  InsightAction,
  InsightType,
  MotifCategory,
  PatientType,
  SmartInsight
} from "./types";
import { buildReport, getReportType } from "./reportTemplates";

function now() {
  return new Date().toISOString();
}

function nextId(existing: Case[]) {
  const next = existing.length + 1;
  return `SA-2026-0528-${String(next).padStart(3, "0")}`;
}

export function createCaseFromBooking(input: BookingInput, existingCases: Case[] = []): Case {
  const id = nextId(existingCases);
  const psid = `PSID-${1042 + existingCases.length * 37}`;
  return {
    id,
    source: input.source,
    appointment: input.appointment,
    patientType: input.patientType,
    motif: input.motif,
    reasonSummary: input.reasonSummary,
    missingInfo: input.missingInfo,
    priority: input.priority,
    secureRecordLink: input.secureRecordLink || `HDS://record/${psid}`,
    patientSecureId: psid,
    assignedSecretary: input.assignedSecretary,
    intakeStatus: input.patientType === "Unclear" ? "Matching" : input.missingInfo.length ? "Missing Info" : "Review",
    secretaryReview: input.missingInfo.length ? "Missing info requested" : "Needs review",
    doctorStatus: "Not Visible",
    doctorVisible: false,
    aiConfidence: input.patientType === "Unclear" ? 44 : input.missingInfo.length ? 68 : 82,
    reportStatus: "Not generated",
    createdAt: now(),
    updatedAt: now(),
    timeline: ["Case created and sent to secretary review"]
  };
}

export function matchPatient(demoCase: Case): Case {
  return {
    ...demoCase,
    patientType: demoCase.patientType === "Unclear" ? "Existing" : demoCase.patientType,
    intakeStatus: "Review",
    secretaryReview: "Needs review",
    aiConfidence: Math.max(demoCase.aiConfidence, 78),
    updatedAt: now(),
    timeline: [...demoCase.timeline, "Patient match verified in secure source"]
  };
}

export function classifyCase(demoCase: Case, patientType: PatientType, motifCategory: MotifCategory): Case {
  return {
    ...demoCase,
    patientType,
    motif: motifCategory,
    updatedAt: now(),
    timeline: [...demoCase.timeline, `Classified as ${patientType} / ${motifCategory}`]
  };
}

export function generateDraftReport(demoCase: Case, version = 1) {
  const report = buildReport(demoCase, version);
  const updated: Case = {
    ...demoCase,
    intakeStatus: "Review",
    secretaryReview: demoCase.missingInfo.length ? "Missing info requested" : "Draft approved",
    reportStatus: "Draft generated",
    reportId: report.id,
    updatedAt: now(),
    timeline: [...demoCase.timeline, `${getReportType(demoCase.patientType)} generated`]
  };
  return { case: updated, report };
}

export function requestMissingInfo(demoCase: Case, missingInfo: string[]): Case {
  const merged = Array.from(new Set([...demoCase.missingInfo, ...missingInfo.filter(Boolean)]));
  return {
    ...demoCase,
    missingInfo: merged,
    intakeStatus: "Missing Info",
    secretaryReview: "Missing info requested",
    doctorVisible: false,
    doctorStatus: "Not Visible",
    updatedAt: now(),
    timeline: [...demoCase.timeline, `Missing info requested: ${missingInfo.join(", ") || "Additional documents"}`]
  };
}

export function validateSecretaryReview(demoCase: Case): Case {
  return {
    ...demoCase,
    missingInfo: [],
    intakeStatus: "Ready",
    secretaryReview: "Verified",
    reportStatus: demoCase.reportStatus === "Draft generated" ? "Approved" : demoCase.reportStatus,
    updatedAt: now(),
    timeline: [...demoCase.timeline, "Secretary validated intake and secure record link"]
  };
}

export function moveToDoctorPending(demoCase: Case): Case {
  return {
    ...validateSecretaryReview(demoCase),
    intakeStatus: "Pending",
    doctorVisible: true,
    doctorStatus: "Pending",
    updatedAt: now(),
    timeline: [...demoCase.timeline, "Moved to doctor pending queue"]
  };
}

export function startDoctorWork(demoCase: Case): Case {
  return {
    ...demoCase,
    intakeStatus: "Working",
    doctorVisible: true,
    doctorStatus: "Working",
    reportStatus: demoCase.reportStatus === "Not generated" ? "Not generated" : "Viewed",
    updatedAt: now(),
    timeline: [...demoCase.timeline, "Doctor started working case"]
  };
}

export function closeCase(demoCase: Case): Case {
  return {
    ...demoCase,
    intakeStatus: "Done",
    doctorStatus: "Done",
    doctorVisible: true,
    updatedAt: now(),
    timeline: [...demoCase.timeline, "Case closed and archived"]
  };
}

export function createSmartInsight(caseId: string, type: InsightType): SmartInsight {
  return {
    id: `INS-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    relatedCaseId: caseId,
    title: type === "Drug interaction warning" ? "Medication context requires current list" : "Quiet contextual update",
    type,
    relevance: type === "Drug interaction warning" ? 93 : 76,
    confidence: 78,
    whyItMayMatter: "Demo insight generated from sanitized workflow context. It is assistive only and not diagnostic.",
    sourceCategory: type.includes("GDPR") ? "GDPR & compliance updates" : "Cardiology / rhythmology expertise",
    visibility: type === "Drug interaction warning" ? "Notify doctor" : "Quiet",
    status: "Unread",
    createdAt: now()
  };
}

export function updateInsightAction(insight: SmartInsight, action: InsightAction): SmartInsight {
  const map: Record<InsightAction, SmartInsight["status"]> = {
    Open: "Opened",
    Save: "Saved",
    Dismiss: "Dismissed",
    "Acted on": "Acted on",
    Snooze: "Snoozed"
  };
  const status = map[action];
  const snoozedUntil = action === "Snooze" ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() : insight.snoozedUntil;
  return { ...insight, status, doctorAction: status === "Unread" ? undefined : status, snoozedUntil };
}

export function openInsight(insight: SmartInsight) {
  return updateInsightAction(insight, "Open");
}

export function saveInsight(insight: SmartInsight) {
  return updateInsightAction(insight, "Save");
}

export function dismissInsight(insight: SmartInsight) {
  return updateInsightAction(insight, "Dismiss");
}

export function actOnInsight(insight: SmartInsight) {
  return updateInsightAction(insight, "Acted on");
}

export function snoozeInsight(insight: SmartInsight) {
  return updateInsightAction(insight, "Snooze");
}

export function addAutomationLog(
  caseId: string,
  automationName: string,
  trigger: string,
  result: AutomationResult,
  actorRole: AutomationLogEntry["actorRole"] = "System",
  action = automationName,
  relatedId = caseId
): AutomationLogEntry {
  return {
    id: `LOG-${Math.random().toString(36).slice(2, 9).toUpperCase()}`,
    timestamp: now(),
    actorRole,
    action,
    relatedId,
    caseId,
    automationName,
    trigger,
    result
  };
}
