export type BookingSource = "Doctolib" | "Website" | "Direct phone" | "Walk-in" | "Email" | "WhatsApp";
export type PatientType = "New" | "Existing" | "Unclear";
export type MotifCategory =
  | "Rhythmology"
  | "Holter"
  | "Hypertension"
  | "Preventive cardiology"
  | "PGV"
  | "Follow-up"
  | "Device follow-up"
  | "Post-ablation follow-up"
  | "Syncope / dizziness"
  | "Chest discomfort"
  | "Screening"
  | "Other";
export type IntakeStatus = "New Intake" | "Matching" | "Drafting" | "Review" | "Missing Info" | "Ready" | "Pending" | "Working" | "Done";
export type DoctorStatus = "Not Visible" | "Pending" | "Working" | "Done";
export type Priority = "Normal" | "Review" | "Urgent";
export type UserRole = "Secretary" | "Doctor" | "Admin";
export type ReportType = "New Patient Starter Report" | "Existing Patient Extension";
export type InsightType =
  | "New evidence related to patient context"
  | "Drug interaction warning"
  | "Guideline change"
  | "GDPR/compliance alert"
  | "Clinical pattern noticed"
  | "Doctor preference reminder";
export type InsightVisibility = "Quiet" | "Show in case" | "Notify doctor" | "Critical";
export type InsightAction = "Open" | "Save" | "Dismiss" | "Acted on" | "Snooze";
export type AutomationResult = "Demo simulated" | "Success" | "Skipped" | "Failed";
export type RuleStatus = "Active" | "Draft" | "Deprecated";
export type CardiologyCondition =
  | "Palpitations / suspected arrhythmia"
  | "Atrial fibrillation follow-up"
  | "Holter monitoring review"
  | "Hypertension follow-up"
  | "Preventive cardiology / cardiovascular risk assessment"
  | "Syncope / dizziness investigation"
  | "Chest discomfort, non-urgent evaluation"
  | "Post-ablation follow-up"
  | "Pacemaker / device follow-up"
  | "Blood pressure variability / PGV"
  | "Family history / screening"
  | "Mixed or unclear reason requiring secretary verification";

export interface MedicationEntry {
  label: string;
  class: string;
  isFictionalDemoData: true;
  note: "Fake/demo medication data only. No dosage or medical recommendation.";
}

export interface PatientHistoryEvent {
  id: string;
  date: string;
  label: string;
  summary: string;
}

export interface Case {
  id: string;
  patientProfileId?: string;
  source: BookingSource;
  appointment: string;
  patientType: PatientType;
  motif: MotifCategory;
  reasonSummary: string;
  missingInfo: string[];
  priority: Priority;
  secureRecordLink: string;
  patientSecureId: string;
  assignedSecretary: string;
  intakeStatus: IntakeStatus;
  secretaryReview: "Not started" | "Needs review" | "Missing info requested" | "Draft approved" | "Verified";
  doctorStatus: DoctorStatus;
  doctorVisible: boolean;
  aiConfidence: number;
  reportId?: string;
  reportStatus: "Not generated" | "Draft generated" | "Approved" | "Viewed";
  createdAt: string;
  updatedAt: string;
  timeline: string[];
}

export interface BookingInput {
  source: BookingSource;
  appointment: string;
  patientType: PatientType;
  motif: MotifCategory;
  reasonSummary: string;
  missingInfo: string[];
  priority: Priority;
  secureRecordLink: string;
  assignedSecretary: string;
}

export interface Report {
  id: string;
  caseId: string;
  type: ReportType;
  status: "Draft" | "Approved" | "Viewed" | "Locked";
  version: number;
  generatedAt: string;
  sections: { title: string; body: string }[];
  warning: string;
}

export interface SmartInsight {
  id: string;
  relatedCaseId?: string;
  title: string;
  type: InsightType;
  relevance: number;
  confidence: number;
  whyItMayMatter: string;
  sourceCategory: string;
  visibility: InsightVisibility;
  status: "Unread" | "Opened" | "Saved" | "Dismissed" | "Acted on" | "Snoozed";
  doctorAction?: "Opened" | "Saved" | "Dismissed" | "Acted on" | "Snoozed";
  snoozedUntil?: string;
  createdAt: string;
}

export interface AutomationLogEntry {
  id: string;
  timestamp: string;
  actorRole?: UserRole | "System";
  action?: string;
  relatedId?: string;
  caseId: string;
  automationName: string;
  trigger: string;
  result: AutomationResult;
}

export interface SecondBrainMemory {
  id: string;
  signal: string;
  weight: number;
  trend: "Learning" | "Reinforced" | "Reduced";
  lastUpdated: string;
}

export interface PatientProfile {
  patientSecureId: string;
  ageRange: "18-29" | "30-39" | "40-49" | "50-59" | "60-69" | "70-79" | "80+";
  sex: "Female" | "Male" | "Not specified";
  patientType: Exclude<PatientType, "Unclear">;
  primaryCardiologyIssue: CardiologyCondition;
  secondaryConditions: string[];
  medications: MedicationEntry[];
  allergies: string[];
  relevantHistorySummary: string;
  historyEvents: PatientHistoryEvent[];
  lastAppointmentDate: string;
  nextAppointmentDate: string;
  assignedMotifCategory: MotifCategory;
  riskFlag: "Routine" | "Review" | "High attention" | "Secretary verification";
  missingDocumentFlags: string[];
  secureRecordLink: string;
}

export interface AdminConfigSection {
  id: string;
  title: string;
  description: string;
  status: RuleStatus;
  lastUpdated: string;
  settings: Record<string, string | number | boolean>;
}

export interface RuleCard {
  id: string;
  name: string;
  description: string;
  promptText: string;
  status: RuleStatus;
  version: string;
  complianceReviewed: boolean;
  reviewedAt?: string;
  lastUpdated: string;
}

export type ViewKey =
  | "overview"
  | "booking"
  | "calendar"
  | "secretary"
  | "doctor-pending"
  | "doctor-working"
  | "reports"
  | "second-brain"
  | "insights"
  | "automation-log"
  | "admin-rules";
