import type {
  AutomationLogEntry,
  AdminConfigSection,
  BookingInput,
  Case,
  InsightAction,
  PatientProfile,
  Report,
  RuleCard,
  SecondBrainMemory,
  SmartInsight
} from "./types";

export interface DemoData {
  patients: PatientProfile[];
  cases: Case[];
  reports: Report[];
  insights: SmartInsight[];
  logs: AutomationLogEntry[];
  memories: SecondBrainMemory[];
  adminConfig: AdminConfigSection[];
  adminRules: RuleCard[];
}

export interface DemoActions {
  createBooking: (input: BookingInput) => void;
  selectCase: (caseId: string) => void;
  clearSelectedCase: () => void;
  matchPatient: (caseId: string) => void;
  generateDraft: (caseId: string) => void;
  requestMissingInfo: (caseId: string, missing: string[]) => void;
  validateIntake: (caseId: string) => void;
  moveToDoctorPending: (caseId: string) => void;
  startDoctorWork: (caseId: string) => void;
  closeCase: (caseId: string) => void;
  updateInsight: (insightId: string, action: InsightAction) => void;
  openInsight: (insightId: string) => void;
  saveInsight: (insightId: string) => void;
  dismissInsight: (insightId: string) => void;
  actOnInsight: (insightId: string) => void;
  snoozeInsight: (insightId: string) => void;
  regenerateReport: (caseId: string) => void;
  approveReport: (caseId: string) => void;
  lockReport: (caseId: string) => void;
  openSecureLink: (caseId: string) => void;
  updateMemory: (memoryId: string, action: "Save memory" | "Dismiss pattern" | "Increase priority" | "Reduce priority" | "View related insights") => void;
  resetDemoData: () => void;
  generateSyntheticMonth: () => void;
  addMockBookings: (count: number) => void;
  simulateBusyWeek: () => void;
  simulateSecretaryBacklog: () => void;
  simulateDoctorReviewDay: () => void;
  openAdminSection: (sectionId: string) => void;
  saveAdminSection: (sectionId: string, updates: Partial<AdminConfigSection>) => void;
  resetAdminSection: (sectionId: string) => void;
  editRule: (ruleId: string, updates: Partial<RuleCard>) => void;
  duplicateRule: (ruleId: string) => void;
  toggleRuleStatus: (ruleId: string) => void;
  markRuleReviewed: (ruleId: string) => void;
  viewRulePrompt: (ruleId: string) => void;
}
