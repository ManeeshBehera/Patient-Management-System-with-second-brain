import type {
  AdminConfigSection,
  AutomationLogEntry,
  BookingSource,
  CardiologyCondition,
  Case,
  DeviceRecord,
  MedicationEntry,
  MotifCategory,
  PatientProfile,
  PatientType,
  PaymentRecord,
  Priority,
  Report,
  RuleCard,
  SecondBrainMemory,
  SmartInsight,
  TaskRecord
} from "./types";
import { buildReport } from "./reportTemplates";

type CaseSeed = {
  condition: CardiologyCondition;
  motif: MotifCategory;
  summary: string;
  defaultMissing: string[];
};

const conditionPlan: Array<{ condition: CardiologyCondition; count: number; motif: MotifCategory; summary: string; defaultMissing: string[] }> = [
  {
    condition: "Palpitations / suspected arrhythmia",
    count: 35,
    motif: "Rhythmology",
    summary: "Palpitations for several weeks, rhythmology consultation requested.",
    defaultMissing: ["ECG"]
  },
  {
    condition: "Atrial fibrillation follow-up",
    count: 25,
    motif: "Follow-up",
    summary: "Existing patient returning for rhythm follow-up preparation.",
    defaultMissing: ["Medication list"]
  },
  {
    condition: "Holter monitoring review",
    count: 20,
    motif: "Holter",
    summary: "Existing patient returning for Holter result review.",
    defaultMissing: ["Prior Holter"]
  },
  {
    condition: "Hypertension follow-up",
    count: 20,
    motif: "Hypertension",
    summary: "Hypertension follow-up, medication list missing.",
    defaultMissing: ["Medication list", "Blood pressure log"]
  },
  {
    condition: "Preventive cardiology / cardiovascular risk assessment",
    count: 15,
    motif: "Preventive cardiology",
    summary: "Preventive cardiology assessment, family history noted.",
    defaultMissing: ["Lab results"]
  },
  {
    condition: "Syncope / dizziness investigation",
    count: 15,
    motif: "Rhythmology",
    summary: "Dizziness investigation, rhythmology-oriented preparation requested.",
    defaultMissing: ["ECG", "Previous cardiology report"]
  },
  {
    condition: "Chest discomfort, non-urgent evaluation",
    count: 15,
    motif: "Other",
    summary: "Non-urgent chest discomfort evaluation, secure history review needed.",
    defaultMissing: ["Previous cardiology report"]
  },
  {
    condition: "Post-ablation follow-up",
    count: 10,
    motif: "Rhythmology",
    summary: "Post-ablation follow-up, prior report available in secure layer.",
    defaultMissing: []
  },
  {
    condition: "Pacemaker / device follow-up",
    count: 10,
    motif: "Follow-up",
    summary: "Pacemaker follow-up, device report missing.",
    defaultMissing: ["Device report"]
  },
  {
    condition: "Blood pressure variability / PGV",
    count: 10,
    motif: "PGV",
    summary: "Blood pressure variability, PGV requested.",
    defaultMissing: ["Blood pressure log"]
  },
  {
    condition: "Family history / screening",
    count: 10,
    motif: "Preventive cardiology",
    summary: "Family history screening, preventive cardiology preparation.",
    defaultMissing: ["Lab results"]
  },
  {
    condition: "Mixed or unclear reason requiring secretary verification",
    count: 15,
    motif: "Other",
    summary: "Possible duplicate patient match, secretary verification required.",
    defaultMissing: ["Identity verification"]
  }
];

const ageRanges: PatientProfile["ageRange"][] = ["18-29", "30-39", "40-49", "50-59", "60-69", "70-79", "80+"];
const sexes: PatientProfile["sex"][] = ["Female", "Male", "Not specified"];
const secondaryConditions = ["Sleep quality to review", "Stress context noted", "Metabolic risk context", "Thyroid context to verify", "No secondary condition flagged", "Prior rhythm episode noted"];
const allergyOptions = ["No known demo allergy", "Unknown / to verify", "Demo allergy flag: contrast agent class", "Demo allergy flag: antibiotic class"];
const documentFlags = ["ECG", "Prior Holter", "Medication list", "Previous cardiology report", "Blood pressure log", "Lab results", "Device report", "Insurance/admin document", "Identity verification"];

const medicationCatalog: MedicationEntry[] = [
  { label: "Cardiomex", class: "Beta-blocker class", isFictionalDemoData: true, note: "Fake/demo medication data only. No dosage or medical recommendation." },
  { label: "Rhythmolux", class: "Antiarrhythmic class", isFictionalDemoData: true, note: "Fake/demo medication data only. No dosage or medical recommendation." },
  { label: "Tensivar", class: "ARB class", isFictionalDemoData: true, note: "Fake/demo medication data only. No dosage or medical recommendation." },
  { label: "Vascorda", class: "Calcium-channel blocker class", isFictionalDemoData: true, note: "Fake/demo medication data only. No dosage or medical recommendation." },
  { label: "Lipirex", class: "Statin class", isFictionalDemoData: true, note: "Fake/demo medication data only. No dosage or medical recommendation." },
  { label: "Coagulane", class: "Anticoagulant class", isFictionalDemoData: true, note: "Fake/demo medication data only. No dosage or medical recommendation." },
  { label: "Pressidil", class: "ACE-inhibitor class", isFictionalDemoData: true, note: "Fake/demo medication data only. No dosage or medical recommendation." },
  { label: "Arrythmex", class: "Antiarrhythmic class", isFictionalDemoData: true, note: "Fake/demo medication data only. No dosage or medical recommendation." },
  { label: "Diurexa", class: "Diuretic class", isFictionalDemoData: true, note: "Fake/demo medication data only. No dosage or medical recommendation." },
  { label: "Betalor", class: "Beta-blocker class", isFictionalDemoData: true, note: "Fake/demo medication data only. No dosage or medical recommendation." },
  { label: "Calcidron", class: "Calcium-channel blocker class", isFictionalDemoData: true, note: "Fake/demo medication data only. No dosage or medical recommendation." },
  { label: "Angioval", class: "Antiplatelet class", isFictionalDemoData: true, note: "Fake/demo medication data only. No dosage or medical recommendation." },
  { label: "Generic class only", class: "Thyroid medication class", isFictionalDemoData: true, note: "Fake/demo medication data only. No dosage or medical recommendation." },
  { label: "Generic class only", class: "Diabetes medication class", isFictionalDemoData: true, note: "Fake/demo medication data only. No dosage or medical recommendation." },
  { label: "No current medication", class: "No current medication", isFictionalDemoData: true, note: "Fake/demo medication data only. No dosage or medical recommendation." },
  { label: "Unknown / to verify", class: "Unknown / to verify", isFictionalDemoData: true, note: "Fake/demo medication data only. No dosage or medical recommendation." }
];

function pick<T>(items: T[], index: number) {
  return items[index % items.length];
}

function daysFromBase(dayOffset: number, hour = 9) {
  const date = new Date("2026-05-01T00:00:00.000Z");
  date.setUTCDate(date.getUTCDate() + dayOffset);
  date.setUTCHours(hour, (dayOffset * 7) % 60, 0, 0);
  return date.toISOString();
}

function expandedSeeds(): CaseSeed[] {
  return conditionPlan.flatMap((item) =>
    Array.from({ length: item.count }, () => ({
      condition: item.condition,
      motif: item.motif,
      summary: item.summary,
      defaultMissing: item.defaultMissing
    }))
  );
}

function medicationsFor(index: number, condition: CardiologyCondition) {
  if (index % 11 === 0) return [medicationCatalog[14]];
  if (index % 13 === 0) return [medicationCatalog[15]];
  const count = 1 + (index % 3);
  const start = condition.includes("Hypertension") || condition.includes("Blood pressure") ? 2 : condition.includes("Atrial") ? 5 : condition.includes("Preventive") ? 4 : 0;
  return Array.from({ length: count }, (_, offset) => pick(medicationCatalog.slice(0, 14), start + index + offset));
}

export function generateMockPatients(monthOffset = 0): PatientProfile[] {
  return expandedSeeds().map((seed, index) => {
    const idNumber = 1001 + index;
    const patientType: PatientProfile["patientType"] = index % 100 < 38 ? "New" : "Existing";
    const missingDocumentFlags = seed.defaultMissing.length && index % 4 !== 0 ? seed.defaultMissing : index % 9 === 0 ? [pick(documentFlags, index)] : [];
    const lastOffset = -90 + (index % 84) + monthOffset * 30;
    const nextOffset = 1 + (index % 28) + monthOffset * 30;
    return {
      patientSecureId: `PSID-${idNumber}`,
      ageRange: pick(ageRanges, index),
      sex: pick(sexes, index + 1),
      patientType,
      primaryCardiologyIssue: seed.condition,
      secondaryConditions: [pick(secondaryConditions, index), pick(secondaryConditions, index + 3)].filter((item, position, arr) => arr.indexOf(item) === position),
      medications: medicationsFor(index, seed.condition),
      allergies: index % 5 === 0 ? [pick(allergyOptions, index)] : ["No known demo allergy"],
      relevantHistorySummary: `${seed.summary} Secure longitudinal context exists only in ${`HDS://record/PSID-${idNumber}`}.`,
      historyEvents: Array.from({ length: 1 + (index % 4) }, (_, eventIndex) => ({
        id: `HIST-${idNumber}-${eventIndex + 1}`,
        date: daysFromBase(lastOffset - eventIndex * 45, 10),
        label: eventIndex === 0 ? "Last cardiology contact" : "Historical secure-layer event",
        summary: "Demo-only event summary; identifiable details are not stored in the cockpit."
      })),
      lastAppointmentDate: daysFromBase(lastOffset, 10),
      nextAppointmentDate: daysFromBase(nextOffset, 9 + (index % 8)),
      assignedMotifCategory: seed.motif,
      riskFlag: seed.condition.includes("unclear") ? "Secretary verification" : index % 17 === 0 ? "High attention" : index % 5 === 0 ? "Review" : "Routine",
      missingDocumentFlags,
      secureRecordLink: `HDS://record/PSID-${idNumber}`
    };
  });
}

function sourceFor(index: number): BookingSource {
  const bucket = index % 100;
  if (bucket < 45) return "Doctolib";
  if (bucket < 70) return "Website";
  if (bucket < 90) return "Direct phone";
  if (bucket < 95) return "WhatsApp";
  return index % 2 === 0 ? "Walk-in" : "Email";
}

function patientTypeFor(index: number, patient: PatientProfile): PatientType {
  const bucket = index % 100;
  if (patient.primaryCardiologyIssue === "Mixed or unclear reason requiring secretary verification" || bucket >= 85) return "Unclear";
  if (bucket < 35) return "New";
  return "Existing";
}

function statusFor(index: number) {
  const bucket = index % 100;
  if (bucket < 15) return { intakeStatus: "New Intake" as const, doctorStatus: "Not Visible" as const, secretaryReview: "Not started" as const, visible: false };
  if (bucket < 25) return { intakeStatus: "Matching" as const, doctorStatus: "Not Visible" as const, secretaryReview: "Needs review" as const, visible: false };
  if (bucket < 40) return { intakeStatus: "Drafting" as const, doctorStatus: "Not Visible" as const, secretaryReview: "Needs review" as const, visible: false };
  if (bucket < 60) return { intakeStatus: "Review" as const, doctorStatus: "Not Visible" as const, secretaryReview: "Draft approved" as const, visible: false };
  if (bucket < 70) return { intakeStatus: "Missing Info" as const, doctorStatus: "Not Visible" as const, secretaryReview: "Missing info requested" as const, visible: false };
  if (bucket < 85) return { intakeStatus: "Ready" as const, doctorStatus: "Pending" as const, secretaryReview: "Verified" as const, visible: true };
  if (bucket < 95) return { intakeStatus: "Ready" as const, doctorStatus: "Working" as const, secretaryReview: "Verified" as const, visible: true };
  return { intakeStatus: "Done" as const, doctorStatus: "Done" as const, secretaryReview: "Verified" as const, visible: true };
}

function confidenceFor(index: number) {
  const bucket = index % 100;
  if (bucket < 50) return 86 + (index % 12);
  if (bucket < 85) return 66 + (index % 16);
  return 38 + (index % 24);
}

function priorityFor(patient: PatientProfile, index: number): Priority {
  if (patient.riskFlag === "High attention" || index % 29 === 0) return "Urgent";
  if (patient.riskFlag === "Review" || patient.riskFlag === "Secretary verification" || index % 4 === 0) return "Review";
  return "Normal";
}

function missingFor(patient: PatientProfile, index: number) {
  if (index % 10 === 7) return [];
  if (patient.missingDocumentFlags.length) return patient.missingDocumentFlags.slice(0, 2);
  return index % 6 === 0 ? [pick(documentFlags, index)] : [];
}

export function generateMockCases(patients: PatientProfile[], count = 280, monthOffset = 0): Case[] {
  return Array.from({ length: count }, (_, index) => {
    const patient = patients[index % patients.length];
    const status = statusFor(index);
    const patientType = patientTypeFor(index, patient);
    const missingInfo = status.intakeStatus === "Missing Info" || patientType === "Unclear" ? missingFor(patient, index) : index % 8 === 0 ? missingFor(patient, index).slice(0, 1) : [];
    const id = `SA-2026-0528-${String(index + 1).padStart(3, "0")}`;
    const hasReport = ["Drafting", "Review", "Ready", "Done"].includes(status.intakeStatus) || status.doctorStatus !== "Not Visible";
    return {
      id,
      patientProfileId: patient.patientSecureId,
      source: sourceFor(index),
      appointment: daysFromBase(20 + (index % 28) + monthOffset * 30, 8 + (index % 9)),
      patientType,
      motif: patient.assignedMotifCategory,
      reasonSummary: patient.relevantHistorySummary.split(" Secure")[0],
      missingInfo,
      priority: priorityFor(patient, index),
      secureRecordLink: patient.secureRecordLink,
      patientSecureId: patient.patientSecureId,
      assignedSecretary: index % 2 === 0 ? "Samira" : "Nadia",
      intakeStatus: missingInfo.length && status.intakeStatus !== "Done" && status.doctorStatus === "Not Visible" ? "Missing Info" : status.intakeStatus,
      secretaryReview: missingInfo.length && !status.visible ? "Missing info requested" : status.secretaryReview,
      doctorStatus: status.doctorStatus,
      doctorVisible: status.visible,
      aiConfidence: confidenceFor(index),
      reportId: hasReport ? `RPT-${id}-1` : undefined,
      reportStatus: hasReport ? (status.visible ? "Approved" : "Draft generated") : "Not generated",
      createdAt: daysFromBase(18 + (index % 10), 7),
      updatedAt: daysFromBase(19 + (index % 12), 11),
      timeline: [
        "Case created",
        patientType === "Unclear" ? "Unclear patient match flagged" : "Patient matching started",
        hasReport ? "AI draft generated" : "Awaiting intake completion",
        status.visible ? "Secretary validated for doctor queue" : "Secretary review pending"
      ]
    };
  });
}

function insightTypeFor(index: number): SmartInsight["type"] {
  const types: SmartInsight["type"][] = [
    "New evidence related to patient context",
    "Drug interaction warning",
    "Guideline change",
    "GDPR/compliance alert",
    "Clinical pattern noticed",
    "Doctor preference reminder"
  ];
  return pick(types, index);
}

export function generateMockInsights(cases: Case[], count = 120): SmartInsight[] {
  return Array.from({ length: count }, (_, index) => {
    const demoCase = cases[(index * 7) % cases.length];
    const type = insightTypeFor(index);
    const critical = type === "GDPR/compliance alert" && demoCase.patientType === "Unclear";
    return {
      id: `INS-${String(index + 1).padStart(3, "0")}`,
      relatedCaseId: demoCase.id,
      title: critical ? "Secretary verification needed before visibility" : type === "Drug interaction warning" ? "Medication context requires current list" : `${demoCase.motif} contextual note`,
      type,
      relevance: critical ? 96 : 62 + (index % 35),
      confidence: 55 + ((index * 3) % 40),
      whyItMayMatter: "Demo-only insight from sanitized workflow context. Assistive preparation signal only, not diagnostic.",
      sourceCategory:
        type === "GDPR/compliance alert"
          ? "GDPR & compliance updates"
          : type === "Drug interaction warning"
            ? "Medications & interactions"
            : type === "Guideline change"
              ? "Clinical guidelines"
              : "Cardiology / rhythmology expertise",
      visibility: critical ? "Critical" : index % 8 === 0 ? "Notify doctor" : index % 4 === 0 ? "Show in case" : "Quiet",
      status: index % 11 === 0 ? "Saved" : index % 13 === 0 ? "Dismissed" : "Unread",
      createdAt: daysFromBase(19 + (index % 14), 9)
    };
  });
}

export function generateMockReports(cases: Case[]): Report[] {
  return cases
    .filter((demoCase) => demoCase.reportId)
    .map((demoCase) => ({
      ...buildReport(demoCase, 1),
      id: demoCase.reportId!,
      status: demoCase.reportStatus === "Approved" ? "Approved" : demoCase.reportStatus === "Viewed" ? "Viewed" : "Draft"
    }));
}

export function generateMockAutomationLogs(cases: Case[], count = 720): AutomationLogEntry[] {
  const names = ["Case created", "Patient matching started", "AI draft generated", "Secretary validation requested", "Missing info flagged", "Report approved", "Moved to doctor pending", "Insight generated", "Doctor dismissed insight"];
  const triggers = ["Booking intake", "Secure record lookup", "Draft prep report", "Secretary review", "Document check", "Approved draft", "Workflow transition", "Second Brain scan", "Doctor action"];
  const results: AutomationLogEntry["result"][] = ["Success", "Success", "Success", "Skipped", "Failed"];
  return Array.from({ length: count }, (_, index) => {
    const demoCase = cases[index % cases.length];
    return {
      id: `LOG-${String(index + 1).padStart(4, "0")}`,
      timestamp: daysFromBase(18 + (index % 18), 7 + (index % 11)),
      actorRole: index % 7 === 0 ? "Admin" : index % 5 === 0 ? "Doctor" : index % 3 === 0 ? "Secretary" : "System",
      action: pick(names, index),
      relatedId: demoCase.id,
      caseId: demoCase.id,
      automationName: pick(names, index),
      trigger: pick(triggers, index),
      result: pick(results, index)
    };
  });
}

export const mockPatients = generateMockPatients();
export const mockCases = generateMockCases(mockPatients);
export const mockReports = generateMockReports(mockCases);
export const mockInsights = generateMockInsights(mockCases);
export const mockAutomationLogs = generateMockAutomationLogs(mockCases);
export const mockMemories: SecondBrainMemory[] = [
  { id: "MEM-001", signal: "Doctor often saves Holter workflow suggestions", weight: 82, trend: "Reinforced", lastUpdated: "2026-05-23T09:15:00" },
  { id: "MEM-002", signal: "Doctor dismisses generic GDPR reminders", weight: 47, trend: "Reduced", lastUpdated: "2026-05-23T08:55:00" },
  { id: "MEM-003", signal: "Doctor acts on medication-interaction alerts", weight: 78, trend: "Learning", lastUpdated: "2026-05-23T09:25:00" },
  { id: "MEM-004", signal: "Doctor prefers concise prep notes", weight: 91, trend: "Reinforced", lastUpdated: "2026-05-23T10:00:00" }
];

export const mockAdminConfig: AdminConfigSection[] = [
  {
    id: "ai-prompts",
    title: "AI Prompts & Rules",
    description: "Mock prompt routing and report generation guardrails.",
    status: "Active",
    lastUpdated: "2026-05-23",
    settings: { noDiagnosis: true, secretaryGateRequired: true, maxDraftLength: 900 }
  },
  {
    id: "report-templates",
    title: "Report templates",
    description: "Demo templates for starter and existing-patient prep reports.",
    status: "Active",
    lastUpdated: "2026-05-23",
    settings: { starterTemplate: "v2", extensionTemplate: "v1", lockAfterApproval: false }
  },
  {
    id: "compliance-guardrails",
    title: "Compliance guardrails",
    description: "Visible demo reminders for secure-layer separation and no real compliance claim.",
    status: "Active",
    lastUpdated: "2026-05-23",
    settings: { hdsPlaceholderOnly: true, noRealCertificationClaim: true, auditEveryAction: true }
  },
  {
    id: "notification-thresholds",
    title: "Notification thresholds",
    description: "Quiet-by-default Second Brain relevance thresholds.",
    status: "Draft",
    lastUpdated: "2026-05-23",
    settings: { quietBelow: 80, notifyAbove: 90, criticalAbove: 96 }
  },
  {
    id: "role-permissions",
    title: "Role permissions",
    description: "Mock role visibility rules for Secretary, Doctor, and Admin.",
    status: "Active",
    lastUpdated: "2026-05-23",
    settings: { doctorRawIntakeHidden: true, adminFullCockpit: true, secretaryCanApprove: true }
  }
];

export const mockPayments: PaymentRecord[] = [
  { id: "PAY-001", patientSecureId: "PSID-1001", caseId: "SA-2026-0528-001", serviceType: "Holter", amountDue: 150, amountPaid: 0, paymentStatus: "Unpaid", dueDate: "2026-06-01", reminderDate: "2026-05-28", secretaryOwner: "Samira", followUpStatus: "Not contacted", notes: "Patient informed at appointment.", createdAt: "2026-05-20T09:00:00", updatedAt: "2026-05-20T09:00:00" },
  { id: "PAY-002", patientSecureId: "PSID-1003", caseId: "SA-2026-0528-003", serviceType: "Consultation", amountDue: 80, amountPaid: 40, paymentStatus: "Partially paid", dueDate: "2026-06-05", reminderDate: "2026-06-03", secretaryOwner: "Nadia", followUpStatus: "Emailed", notes: "First instalment received.", createdAt: "2026-05-21T10:00:00", updatedAt: "2026-05-24T11:00:00" },
  { id: "PAY-003", patientSecureId: "PSID-1005", serviceType: "Check-up", amountDue: 60, amountPaid: 60, paymentStatus: "Paid", dueDate: "2026-05-15", reminderDate: "2026-05-12", secretaryOwner: "Samira", followUpStatus: "Resolved", notes: "Paid on the day.", createdAt: "2026-05-15T08:30:00", updatedAt: "2026-05-15T08:30:00" },
  { id: "PAY-004", patientSecureId: "PSID-1007", caseId: "SA-2026-0528-007", serviceType: "Holter", amountDue: 150, amountPaid: 0, paymentStatus: "Unpaid", dueDate: "2026-05-25", reminderDate: "2026-05-22", secretaryOwner: "Nadia", followUpStatus: "Called", notes: "Left voicemail, no response yet.", createdAt: "2026-05-18T14:00:00", updatedAt: "2026-05-23T09:00:00" },
  { id: "PAY-005", patientSecureId: "PSID-1009", serviceType: "Consultation", amountDue: 80, amountPaid: 0, paymentStatus: "Unpaid", dueDate: "2026-06-10", reminderDate: "2026-06-07", secretaryOwner: "Samira", followUpStatus: "Not contacted", notes: "", createdAt: "2026-05-22T11:00:00", updatedAt: "2026-05-22T11:00:00" },
  { id: "PAY-006", patientSecureId: "PSID-1011", caseId: "SA-2026-0528-011", serviceType: "Holter", amountDue: 150, amountPaid: 75, paymentStatus: "Partially paid", dueDate: "2026-06-12", reminderDate: "2026-06-09", secretaryOwner: "Nadia", followUpStatus: "Emailed", notes: "Balance outstanding.", createdAt: "2026-05-23T10:00:00", updatedAt: "2026-05-27T13:00:00" },
  { id: "PAY-007", patientSecureId: "PSID-1013", serviceType: "Check-up", amountDue: 60, amountPaid: 60, paymentStatus: "Paid", dueDate: "2026-05-10", reminderDate: "2026-05-08", secretaryOwner: "Samira", followUpStatus: "Resolved", notes: "Paid by card.", createdAt: "2026-05-10T09:00:00", updatedAt: "2026-05-10T09:00:00" },
  { id: "PAY-008", patientSecureId: "PSID-1015", caseId: "SA-2026-0528-015", serviceType: "Consultation", amountDue: 80, amountPaid: 0, paymentStatus: "Unpaid", dueDate: "2026-05-20", reminderDate: "2026-05-17", secretaryOwner: "Nadia", followUpStatus: "Called", notes: "Patient promised payment this week.", createdAt: "2026-05-16T08:00:00", updatedAt: "2026-05-23T15:00:00" },
  { id: "PAY-009", patientSecureId: "PSID-1017", serviceType: "Other", amountDue: 40, amountPaid: 0, paymentStatus: "Unknown", dueDate: "2026-06-15", reminderDate: "2026-06-12", secretaryOwner: "Samira", followUpStatus: "Not contacted", notes: "Pending insurance clarification.", createdAt: "2026-05-24T12:00:00", updatedAt: "2026-05-24T12:00:00" },
  { id: "PAY-010", patientSecureId: "PSID-1019", caseId: "SA-2026-0528-019", serviceType: "Holter", amountDue: 150, amountPaid: 150, paymentStatus: "Paid", dueDate: "2026-05-18", reminderDate: "2026-05-15", secretaryOwner: "Nadia", followUpStatus: "Resolved", notes: "Paid in full at collection.", createdAt: "2026-05-18T10:30:00", updatedAt: "2026-05-18T10:30:00" }
];

export const mockDevices: DeviceRecord[] = [
  { id: "DEV-001", deviceType: "Holter", deviceRef: "HLT-001", patientSecureId: "PSID-1002", caseId: "SA-2026-0528-002", givenDate: "2026-05-10", expectedReturnDate: "2026-05-17", status: "Overdue", secretaryOwner: "Samira", reminderDate: "2026-05-16", followUpStatus: "Called", notes: "Patient unreachable after 2 attempts." },
  { id: "DEV-002", deviceType: "Holter", deviceRef: "HLT-002", patientSecureId: "PSID-1004", caseId: "SA-2026-0528-004", givenDate: "2026-05-20", expectedReturnDate: "2026-05-27", status: "Returned", secretaryOwner: "Nadia", reminderDate: "2026-05-25", followUpStatus: "Resolved", notes: "Returned in good condition." },
  { id: "DEV-003", deviceType: "Holter", deviceRef: "HLT-003", patientSecureId: "PSID-1006", caseId: "SA-2026-0528-006", givenDate: "2026-05-25", expectedReturnDate: "2026-06-01", status: "Due soon", secretaryOwner: "Samira", reminderDate: "2026-05-30", followUpStatus: "Not contacted", notes: "" },
  { id: "DEV-004", deviceType: "Holter", deviceRef: "HLT-004", patientSecureId: "PSID-1008", caseId: "SA-2026-0528-008", givenDate: "2026-05-28", expectedReturnDate: "2026-06-04", status: "Issued", secretaryOwner: "Nadia", reminderDate: "2026-06-02", followUpStatus: "Not contacted", notes: "Instructions given at handover." },
  { id: "DEV-005", deviceType: "Holter", deviceRef: "HLT-005", patientSecureId: "PSID-1010", givenDate: "2026-05-05", expectedReturnDate: "2026-05-12", actualReturnDate: "2026-05-12", status: "Returned", secretaryOwner: "Samira", reminderDate: "2026-05-10", followUpStatus: "Resolved", notes: "On time." },
  { id: "DEV-006", deviceType: "Holter", deviceRef: "HLT-006", patientSecureId: "PSID-1012", caseId: "SA-2026-0528-012", givenDate: "2026-05-08", expectedReturnDate: "2026-05-15", status: "Overdue", secretaryOwner: "Nadia", reminderDate: "2026-05-14", followUpStatus: "Emailed", notes: "Email sent, no reply." },
  { id: "DEV-007", deviceType: "ECG monitor", deviceRef: "ECG-001", patientSecureId: "PSID-1014", givenDate: "2026-05-29", expectedReturnDate: "2026-06-05", status: "Issued", secretaryOwner: "Samira", reminderDate: "2026-06-03", followUpStatus: "Not contacted", notes: "" },
  { id: "DEV-008", deviceType: "Holter", deviceRef: "HLT-007", patientSecureId: "PSID-1016", caseId: "SA-2026-0528-016", givenDate: "2026-05-03", expectedReturnDate: "2026-05-10", status: "Lost", secretaryOwner: "Nadia", reminderDate: "2026-05-09", followUpStatus: "Called", notes: "Patient says device was misplaced. Escalated to admin." },
  { id: "DEV-009", deviceType: "Holter", deviceRef: "HLT-008", patientSecureId: "PSID-1018", caseId: "SA-2026-0528-018", givenDate: "2026-05-27", expectedReturnDate: "2026-06-03", status: "Issued", secretaryOwner: "Samira", reminderDate: "2026-06-01", followUpStatus: "Not contacted", notes: "" },
  { id: "DEV-010", deviceType: "Holter", deviceRef: "HLT-009", patientSecureId: "PSID-1020", givenDate: "2026-05-15", expectedReturnDate: "2026-05-22", actualReturnDate: "2026-05-23", status: "Returned", secretaryOwner: "Nadia", reminderDate: "2026-05-21", followUpStatus: "Resolved", notes: "Returned one day late, device in good condition." }
];

export const mockTasks: TaskRecord[] = [
  { id: "TSK-001", title: "Follow up on unpaid Holter payment – PSID-1001", assignedTo: "Samira", assignedRole: "Secretary", dueDate: "2026-06-02", priority: "Normal", status: "To do", relatedPatientId: "PSID-1001", relatedCaseId: "SA-2026-0528-001", notificationChannel: "Email", createdAt: "2026-05-25T09:00:00", updatedAt: "2026-05-25T09:00:00" },
  { id: "TSK-002", title: "Chase overdue Holter HLT-001 return – PSID-1002", assignedTo: "Samira", assignedRole: "Secretary", dueDate: "2026-05-28", priority: "Urgent", status: "In progress", relatedPatientId: "PSID-1002", notificationChannel: "Email", createdAt: "2026-05-18T10:00:00", updatedAt: "2026-05-23T11:00:00" },
  { id: "TSK-003", title: "Verify identity – PSID-1007 appointment unclear", assignedTo: "Nadia", assignedRole: "Secretary", dueDate: "2026-05-30", priority: "Review", status: "Waiting", relatedPatientId: "PSID-1007", relatedCaseId: "SA-2026-0528-007", notificationChannel: "In-app", createdAt: "2026-05-20T14:00:00", updatedAt: "2026-05-22T09:00:00" },
  { id: "TSK-004", title: "Request missing ECG for SA-2026-0528-005", assignedTo: "Samira", assignedRole: "Secretary", dueDate: "2026-05-29", priority: "Normal", status: "Done", relatedCaseId: "SA-2026-0528-005", notificationChannel: "Email", completionNote: "ECG received and uploaded to secure layer.", createdAt: "2026-05-19T08:00:00", updatedAt: "2026-05-26T14:00:00" },
  { id: "TSK-005", title: "Review device report – HLT-006 overdue escalation", assignedTo: "Othmane", assignedRole: "Admin", dueDate: "2026-05-27", priority: "Urgent", status: "In progress", relatedPatientId: "PSID-1012", notificationChannel: "Notion", createdAt: "2026-05-22T16:00:00", updatedAt: "2026-05-24T10:00:00" },
  { id: "TSK-006", title: "Confirm appointment date – PSID-1009", assignedTo: "Samira", assignedRole: "Secretary", dueDate: "2026-06-05", priority: "Normal", status: "To do", relatedPatientId: "PSID-1009", notificationChannel: "In-app", createdAt: "2026-05-26T09:30:00", updatedAt: "2026-05-26T09:30:00" },
  { id: "TSK-007", title: "Validate medication list – SA-2026-0528-011", assignedTo: "Nadia", assignedRole: "Secretary", dueDate: "2026-05-31", priority: "Review", status: "To do", relatedCaseId: "SA-2026-0528-011", notificationChannel: "In-app", createdAt: "2026-05-25T11:00:00", updatedAt: "2026-05-25T11:00:00" },
  { id: "TSK-008", title: "Follow up partial payment balance – PSID-1003", assignedTo: "Nadia", assignedRole: "Secretary", dueDate: "2026-06-04", priority: "Normal", status: "Waiting", relatedPatientId: "PSID-1003", notificationChannel: "Email", createdAt: "2026-05-24T13:00:00", updatedAt: "2026-05-27T08:00:00" },
  { id: "TSK-009", title: "Check insurance status – PSID-1017 payment unknown", assignedTo: "Samira", assignedRole: "Secretary", dueDate: "2026-06-10", priority: "Normal", status: "Blocked", relatedPatientId: "PSID-1017", notificationChannel: "In-app", createdAt: "2026-05-24T14:00:00", updatedAt: "2026-05-24T14:00:00" },
  { id: "TSK-010", title: "Review HLT-006 loss report and assess replacement", assignedTo: "Dr. Amraoui", assignedRole: "Doctor", dueDate: "2026-05-30", priority: "Urgent", status: "To do", relatedPatientId: "PSID-1016", notificationChannel: "Notion", createdAt: "2026-05-23T15:00:00", updatedAt: "2026-05-23T15:00:00" },
  { id: "TSK-011", title: "Send missing blood pressure log request – PSID-1011", assignedTo: "Nadia", assignedRole: "Secretary", dueDate: "2026-06-01", priority: "Normal", status: "Done", relatedPatientId: "PSID-1011", notificationChannel: "Email", completionNote: "Request sent via secure messaging.", createdAt: "2026-05-21T10:00:00", updatedAt: "2026-05-27T16:00:00" },
  { id: "TSK-012", title: "Prepare secretary validation for SA-2026-0528-019", assignedTo: "Samira", assignedRole: "Secretary", dueDate: "2026-06-02", priority: "Normal", status: "In progress", relatedCaseId: "SA-2026-0528-019", notificationChannel: "In-app", createdAt: "2026-05-26T08:00:00", updatedAt: "2026-05-27T10:00:00" }
];

export const mockAdminRules: RuleCard[] = [
  {
    id: "rule-new-patient",
    name: "New Patient Starter Report",
    description: "Structures a concise non-diagnostic preparation report for new patients.",
    promptText: "Demo prompt: summarize sanitized intake, missing information, and pre-consult checklist without diagnosis or treatment advice.",
    status: "Active",
    version: "v2.3",
    complianceReviewed: true,
    reviewedAt: "2026-05-23",
    lastUpdated: "2026-05-23"
  },
  {
    id: "rule-existing-extension",
    name: "Existing Patient Extension",
    description: "Extends previous secure-layer context with sanitized appointment changes.",
    promptText: "Demo prompt: compare sanitized current reason with prior context placeholders; never include identifiable data.",
    status: "Active",
    version: "v1.9",
    complianceReviewed: true,
    reviewedAt: "2026-05-23",
    lastUpdated: "2026-05-23"
  },
  {
    id: "rule-secretary-checklist",
    name: "Secretary Validation Checklist",
    description: "Human validation gate before doctor visibility.",
    promptText: "Demo prompt: require identity, appointment, motif, missing documents, draft, and secure link checks.",
    status: "Active",
    version: "v3.1",
    complianceReviewed: true,
    reviewedAt: "2026-05-23",
    lastUpdated: "2026-05-23"
  },
  {
    id: "rule-second-brain",
    name: "Second Brain Relevance Filter",
    description: "Keeps intelligence quiet unless relevance and context justify surfacing.",
    promptText: "Demo prompt: default to Quiet, elevate only strong contextual relevance, and never diagnose.",
    status: "Draft",
    version: "v0.8",
    complianceReviewed: false,
    lastUpdated: "2026-05-23"
  },
  {
    id: "rule-gdpr",
    name: "GDPR Alert Rules",
    description: "Demo compliance reminders for identity mismatch and secure-layer separation.",
    promptText: "Demo prompt: flag unclear patient matching and secure-link issues without claiming real compliance.",
    status: "Active",
    version: "v1.5",
    complianceReviewed: true,
    reviewedAt: "2026-05-23",
    lastUpdated: "2026-05-23"
  },
  {
    id: "rule-medication",
    name: "Medication Alert Rules",
    description: "Demo-only medication context checks using fake/class-based medication data.",
    promptText: "Demo prompt: request missing medication lists; do not infer treatment, interactions, or dosage.",
    status: "Active",
    version: "v1.2",
    complianceReviewed: true,
    reviewedAt: "2026-05-23",
    lastUpdated: "2026-05-23"
  }
];
