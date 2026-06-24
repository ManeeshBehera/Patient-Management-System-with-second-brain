"use client";

import { useEffect, useMemo, useState } from "react";
import { AdminRules } from "@/components/admin/AdminRules";
import { SecondBrain } from "@/components/brain/SecondBrain";
import { SmartInsights } from "@/components/brain/SmartInsights";
import { CaseDetailDrawer } from "@/components/cases/CaseDetailDrawer";
import { PatientIntakeCalendar } from "@/components/cases/PatientIntakeCalendar";
import { DevicesTracker } from "@/components/devices/DevicesTracker";
import { DoctorPending } from "@/components/doctor/DoctorPending";
import { DoctorWorking } from "@/components/doctor/DoctorWorking";
import { BookingIntakeForm } from "@/components/intake/BookingIntakeForm";
import { AppShell } from "@/components/layout/AppShell";
import { AutomationLog } from "@/components/logs/AutomationLog";
import { OverviewDashboard } from "@/components/overview/OverviewDashboard";
import { PatientsRegistry } from "@/components/patients/PatientsRegistry";
import { PaymentsTracker } from "@/components/payments/PaymentsTracker";
import { ReportsView } from "@/components/reports/ReportsView";
import { SecretaryReviewBoard } from "@/components/secretary/SecretaryReviewBoard";
import { TasksBoard } from "@/components/tasks/TasksBoard";
import type { DemoActions, DemoData } from "@/lib/appState";
import { generateMockAutomationLogs, generateMockCases, generateMockInsights, generateMockPatients, generateMockReports, mockAdminConfig, mockAdminRules, mockAutomationLogs, mockCases, mockDevices, mockInsights, mockMemories, mockPatients, mockPayments, mockReports, mockTasks } from "@/lib/mockPatients";
import type { AdminConfigSection, Case, InsightAction, RuleCard, UserRole, ViewKey } from "@/lib/types";
import {
  addAutomationLog,
  createCaseFromBooking,
  generateDraftReport,
  matchPatient,
  moveToDoctorPending,
  requestMissingInfo,
  startDoctorWork,
  updateInsightAction,
  validateSecretaryReview,
  closeCase
} from "@/lib/workflow";
import { roleHome } from "@/lib/utils";

const storageKey = "ai-cabinet-intake-os-demo-state";

function initialData(): DemoData {
  return {
    patients: mockPatients,
    cases: mockCases,
    reports: mockReports,
    insights: mockInsights,
    logs: mockAutomationLogs,
    memories: mockMemories,
    adminConfig: mockAdminConfig,
    adminRules: mockAdminRules,
    payments: mockPayments,
    devices: mockDevices,
    tasks: mockTasks
  };
}

function normalizeData(saved: Partial<DemoData>): DemoData {
  const fresh = initialData();
  return {
    patients: saved.patients?.length ? saved.patients : fresh.patients,
    cases: saved.cases?.length ? saved.cases : fresh.cases,
    reports: saved.reports?.length ? saved.reports : fresh.reports,
    insights: saved.insights?.length ? saved.insights : fresh.insights,
    logs: saved.logs?.length ? saved.logs : fresh.logs,
    memories: saved.memories?.length ? saved.memories : fresh.memories,
    adminConfig: saved.adminConfig?.length ? saved.adminConfig : fresh.adminConfig,
    adminRules: saved.adminRules?.length ? saved.adminRules : fresh.adminRules,
    payments: saved.payments?.length ? saved.payments : fresh.payments,
    devices: saved.devices?.length ? saved.devices : fresh.devices,
    tasks: saved.tasks?.length ? saved.tasks : fresh.tasks
  };
}

export default function Page() {
  const [role, setRole] = useState<UserRole>("Admin");
  const [activeView, setActiveView] = useState<ViewKey>("overview");
  const [selectedCaseId, setSelectedCaseId] = useState<string>();
  const [monthOffset, setMonthOffset] = useState(0);
  const [data, setData] = useState<DemoData>(initialData);
  const [toast, setToast] = useState("Ready.");

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3600);
  }

  useEffect(() => {
    const saved = window.localStorage.getItem(storageKey);
    if (saved) {
      try {
        setData(normalizeData(JSON.parse(saved) as Partial<DemoData>));
      } catch {
        setData(initialData());
      }
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(data));
  }, [data]);

  function updateCase(caseId: string, updater: (demoCase: Case) => Case, automationName: string, trigger: string) {
    setData((current) => {
      const nextCases = current.cases.map((demoCase) => (demoCase.id === caseId ? updater(demoCase) : demoCase));
      return {
        ...current,
        cases: nextCases,
        logs: [addAutomationLog(caseId, automationName, trigger, "Success", role, automationName), ...current.logs]
      };
    });
    showToast(`${automationName} - demo state updated.`);
  }

  const actions: DemoActions = useMemo(() => ({
    createBooking(input) {
      setData((current) => {
        const newCase = createCaseFromBooking(input, current.cases);
        return {
          ...current,
          cases: [newCase, ...current.cases],
          logs: [addAutomationLog(newCase.id, "Case created", input.source, "Success", role, "Create booking"), ...current.logs]
        };
      });
      showToast("Case created and sent to secretary review.");
      setActiveView("calendar");
    },
    selectCase(caseId) {
      setSelectedCaseId(caseId);
    },
    clearSelectedCase() {
      setSelectedCaseId(undefined);
    },
    matchPatient(caseId) {
      updateCase(caseId, matchPatient, "Patient matching started", "Manual secretary action");
    },
    generateDraft(caseId) {
      setData((current) => {
        const demoCase = current.cases.find((item) => item.id === caseId);
        if (!demoCase) return current;
        const version = current.reports.filter((report) => report.caseId === caseId).length + 1;
        const generated = generateDraftReport(demoCase, version);
        return {
          ...current,
          cases: current.cases.map((item) => (item.id === caseId ? generated.case : item)),
          reports: [generated.report, ...current.reports.filter((report) => report.id !== generated.report.id)],
          logs: [addAutomationLog(caseId, "AI draft generated", "Deterministic demo template", "Success", role, "Generate draft report"), ...current.logs]
        };
      });
      showToast("Demo draft generated.");
    },
    requestMissingInfo(caseId, missing) {
      updateCase(caseId, (demoCase) => requestMissingInfo(demoCase, missing), "Missing info flagged", "Secretary review");
    },
    validateIntake(caseId) {
      updateCase(caseId, validateSecretaryReview, "Secretary validation requested", "Manual approval");
    },
    moveToDoctorPending(caseId) {
      updateCase(caseId, moveToDoctorPending, "Moved to doctor pending", "Secretary approved");
    },
    startDoctorWork(caseId) {
      updateCase(caseId, startDoctorWork, "Doctor work started", "Doctor action");
      setActiveView("doctor-working");
    },
    closeCase(caseId) {
      updateCase(caseId, closeCase, "Case archived", "Doctor completed consultation");
    },
    updateInsight(insightId, action: InsightAction) {
      setData((current) => {
        const insight = current.insights.find((item) => item.id === insightId);
        const memorySignal =
          action === "Save"
            ? "Doctor saves relevant specialty suggestions"
            : action === "Dismiss"
              ? "Doctor dismisses low-relevance reminders"
              : action === "Acted on"
                ? "Doctor acts on high-signal clinical context"
                : action === "Snooze"
                  ? "Doctor snoozes useful but non-urgent context"
                  : "Doctor opens contextual insights";
        const delta = action === "Dismiss" ? -4 : action === "Snooze" ? -1 : 3;
        return {
          ...current,
          insights: current.insights.map((item) => (item.id === insightId ? updateInsightAction(item, action) : item)),
          memories: current.memories.map((memory, index) =>
            index === 0
              ? { ...memory, signal: memorySignal, weight: Math.max(20, Math.min(98, memory.weight + delta)), trend: delta < 0 ? "Reduced" : "Reinforced", lastUpdated: new Date().toISOString() }
              : memory
          ),
          logs: insight ? [addAutomationLog(insight.relatedCaseId ?? "GLOBAL", `Doctor ${action.toLowerCase()} insight`, "Second Brain inbox", "Demo simulated", role, `${action} insight`, insight.id), ...current.logs] : current.logs
        };
      });
      const messages: Record<InsightAction, string> = {
        Open: "Insight opened - demo detail state updated.",
        Save: "Saved to Doctor's Specialities memory - demo action only.",
        Dismiss: "Dismissed. Similar demo insights will be deprioritized.",
        "Acted on": "Marked as acted on - demo action only.",
        Snooze: "Snoozed for 7 days - demo action only."
      };
      showToast(messages[action]);
    },
    openInsight(insightId) {
      actions.updateInsight(insightId, "Open");
    },
    saveInsight(insightId) {
      actions.updateInsight(insightId, "Save");
    },
    dismissInsight(insightId) {
      actions.updateInsight(insightId, "Dismiss");
    },
    actOnInsight(insightId) {
      actions.updateInsight(insightId, "Acted on");
    },
    snoozeInsight(insightId) {
      actions.updateInsight(insightId, "Snooze");
    },
    regenerateReport(caseId) {
      const demoCase = data.cases.find((item) => item.id === caseId);
      if (!demoCase) return;
      setData((current) => {
        const currentCase = current.cases.find((item) => item.id === caseId);
        if (!currentCase) return current;
        const version = current.reports.filter((report) => report.caseId === caseId).length + 1;
        const generated = generateDraftReport(currentCase, version);
        return {
          ...current,
          cases: current.cases.map((item) => (item.id === caseId ? generated.case : item)),
          reports: [generated.report, ...current.reports],
          logs: [addAutomationLog(caseId, "Report regenerated", "Reports view", "Demo simulated", role, "Regenerate demo draft"), ...current.logs]
        };
      });
      showToast("Report regenerated using deterministic demo template.");
    },
    approveReport(caseId) {
      setData((current) => ({
        ...current,
        reports: current.reports.map((report) => (report.caseId === caseId ? { ...report, status: "Approved" } : report)),
        cases: current.cases.map((item) => (item.id === caseId ? { ...item, reportStatus: "Approved", secretaryReview: "Draft approved" } : item)),
        logs: [addAutomationLog(caseId, "Report approved", "Reports view", "Demo simulated", role, "Approve draft"), ...current.logs]
      }));
      showToast("Draft approved locally for the demo.");
    },
    lockReport(caseId) {
      setData((current) => ({
        ...current,
        reports: current.reports.map((report) => (report.caseId === caseId ? { ...report, status: "Locked" } : report)),
        logs: [addAutomationLog(caseId, "Report locked", "Reports view", "Demo simulated", role, "Lock report"), ...current.logs]
      }));
      showToast("Report locked in demo state.");
    },
    openSecureLink(caseId) {
      setSelectedCaseId(caseId);
      setData((current) => ({
        ...current,
        logs: [addAutomationLog(caseId, "Secure link placeholder opened", "Reports view", "Demo simulated", role, "Open secure link placeholder"), ...current.logs]
      }));
      showToast("Secure record placeholder opened in the case drawer.");
    },
    updateMemory(memoryId, action) {
      setData((current) => ({
        ...current,
        memories: current.memories.map((memory) =>
          memory.id === memoryId
            ? {
                ...memory,
                weight: Math.max(10, Math.min(99, memory.weight + (action === "Reduce priority" || action === "Dismiss pattern" ? -6 : 5))),
                trend: action === "Reduce priority" || action === "Dismiss pattern" ? "Reduced" : "Reinforced",
                lastUpdated: new Date().toISOString()
              }
            : memory
        ),
        logs: [addAutomationLog("SECOND-BRAIN", action, "Second Brain memory", "Demo simulated", role, action, memoryId), ...current.logs]
      }));
      if (action === "View related insights") setActiveView("insights");
      showToast(`${action} - Second Brain memory updated locally.`);
    },
    resetDemoData() {
      setData(initialData());
      setMonthOffset(0);
      showToast("Demo data reset.");
    },
    generateSyntheticMonth() {
      setMonthOffset((offset) => {
        const next = offset + 1;
        const patients = generateMockPatients(next);
        const cases = generateMockCases(patients, 285, next);
        setData({
          patients,
          cases,
          reports: generateMockReports(cases),
          insights: generateMockInsights(cases, 130),
          logs: [addAutomationLog("ADMIN", "Admin generated synthetic month", "Demo Data Controls", "Demo simulated", role, "Generate new synthetic month"), ...generateMockAutomationLogs(cases)],
          memories: mockMemories,
          adminConfig: data.adminConfig,
          adminRules: data.adminRules,
          payments: mockPayments,
          devices: mockDevices,
          tasks: mockTasks
        });
        return next;
      });
      showToast("Generated a new synthetic month.");
    },
    addMockBookings(count) {
      setData((current) => {
        const extra = generateMockCases(current.patients, count, monthOffset + 2).map((demoCase, index) => ({ ...demoCase, id: `SA-2026-NEW-${String(Date.now()).slice(-4)}-${String(index + 1).padStart(2, "0")}`, intakeStatus: "New Intake" as const, doctorStatus: "Not Visible" as const, doctorVisible: false }));
        return { ...current, cases: [...extra, ...current.cases], logs: [addAutomationLog("ADMIN", `Added ${count} mock bookings`, "Demo Data Controls", "Demo simulated", role, "Add mock bookings"), ...extra.map((item) => addAutomationLog(item.id, "Case created", "Bulk demo control", "Success", role, "Bulk case create")), ...current.logs] };
      });
      showToast(`${count} new mock bookings added.`);
    },
    simulateBusyWeek() {
      setData((current) => {
        const extra = generateMockCases(current.patients, 45, monthOffset + 3).map((demoCase, index) => ({ ...demoCase, id: `SA-2026-BUSY-${String(index + 1).padStart(3, "0")}` }));
        return {
          ...current,
          cases: [...extra, ...current.cases],
          reports: [...generateMockReports(extra), ...current.reports],
          insights: [...generateMockInsights(extra, 24), ...current.insights],
          logs: [addAutomationLog("ADMIN", "Simulated busy week", "Demo Data Controls", "Demo simulated", role, "Simulate busy week"), ...current.logs]
        };
      });
      showToast("Busy week simulated with extra cases and insights.");
    },
    simulateSecretaryBacklog() {
      setData((current) => ({
        ...current,
        cases: current.cases.map((demoCase, index) => index < 50 ? { ...demoCase, intakeStatus: index % 2 ? "Review" : "Missing Info", missingInfo: index % 2 ? demoCase.missingInfo : Array.from(new Set([...demoCase.missingInfo, "Medication list"])), doctorStatus: "Not Visible", doctorVisible: false, secretaryReview: index % 2 ? "Needs review" : "Missing info requested" } : demoCase),
        logs: [addAutomationLog("ADMIN", "Simulated secretary backlog", "Demo Data Controls", "Demo simulated", role, "Simulate secretary backlog"), ...current.logs]
      }));
      showToast("Secretary backlog simulated.");
    },
    simulateDoctorReviewDay() {
      setData((current) => ({
        ...current,
        cases: current.cases.map((demoCase, index) => index < 30 ? { ...demoCase, intakeStatus: index < 8 ? "Working" : "Pending", doctorStatus: index < 8 ? "Working" : "Pending", doctorVisible: true, secretaryReview: "Verified", missingInfo: [] } : demoCase),
        insights: [...generateMockInsights(current.cases.slice(0, 30), 18), ...current.insights],
        logs: [addAutomationLog("ADMIN", "Simulated doctor review day", "Demo Data Controls", "Demo simulated", role, "Simulate doctor review day"), ...current.logs]
      }));
      showToast("Doctor review day simulated.");
      setActiveView("doctor-pending");
    },
    openAdminSection(sectionId) {
      setData((current) => ({ ...current, logs: [addAutomationLog("ADMIN", "Admin section opened", "Admin config", "Demo simulated", role, "Open admin section", sectionId), ...current.logs] }));
      showToast("Opened mock admin configuration.");
    },
    saveAdminSection(sectionId, updates: Partial<AdminConfigSection>) {
      setData((current) => ({
        ...current,
        adminConfig: current.adminConfig.map((section) => (section.id === sectionId ? { ...section, ...updates, lastUpdated: new Date().toISOString().slice(0, 10) } : section)),
        logs: [addAutomationLog("ADMIN", "Mock configuration saved", "Admin config", "Demo simulated", role, "Save admin section", sectionId), ...current.logs]
      }));
      showToast("Mock configuration saved.");
    },
    resetAdminSection(sectionId) {
      const original = mockAdminConfig.find((section) => section.id === sectionId);
      if (!original) return;
      setData((current) => ({
        ...current,
        adminConfig: current.adminConfig.map((section) => (section.id === sectionId ? original : section)),
        logs: [addAutomationLog("ADMIN", "Admin section reset", "Admin config", "Demo simulated", role, "Reset admin section", sectionId), ...current.logs]
      }));
      showToast("Mock configuration section reset.");
    },
    editRule(ruleId, updates: Partial<RuleCard>) {
      setData((current) => ({
        ...current,
        adminRules: current.adminRules.map((rule) => (rule.id === ruleId ? { ...rule, ...updates, lastUpdated: new Date().toISOString().slice(0, 10) } : rule)),
        logs: [addAutomationLog("ADMIN", "Rule edited", "Rules registry", "Demo simulated", role, "Edit rule", ruleId), ...current.logs]
      }));
      showToast("Mock rule saved.");
    },
    duplicateRule(ruleId) {
      setData((current) => {
        const rule = current.adminRules.find((item) => item.id === ruleId);
        if (!rule) return current;
        const copy = { ...rule, id: `${rule.id}-copy-${Date.now()}`, name: `Copy of ${rule.name}`, status: "Draft" as const, version: "v0.1", complianceReviewed: false, reviewedAt: undefined, lastUpdated: new Date().toISOString().slice(0, 10) };
        return { ...current, adminRules: [copy, ...current.adminRules], logs: [addAutomationLog("ADMIN", "Rule duplicated", "Rules registry", "Demo simulated", role, "Duplicate rule", ruleId), ...current.logs] };
      });
      showToast("Rule duplicated as a draft.");
    },
    toggleRuleStatus(ruleId) {
      setData((current) => ({
        ...current,
        adminRules: current.adminRules.map((rule) => (rule.id === ruleId ? { ...rule, status: rule.status === "Active" ? "Deprecated" : "Active", lastUpdated: new Date().toISOString().slice(0, 10) } : rule)),
        logs: [addAutomationLog("ADMIN", "Rule status toggled", "Rules registry", "Demo simulated", role, "Toggle rule status", ruleId), ...current.logs]
      }));
      showToast("Rule status updated.");
    },
    markRuleReviewed(ruleId) {
      setData((current) => ({
        ...current,
        adminRules: current.adminRules.map((rule) => (rule.id === ruleId ? { ...rule, complianceReviewed: true, reviewedAt: new Date().toISOString().slice(0, 10), lastUpdated: new Date().toISOString().slice(0, 10) } : rule)),
        logs: [addAutomationLog("ADMIN", "Rule marked compliance reviewed", "Rules registry", "Demo simulated", role, "Mark rule reviewed", ruleId), ...current.logs]
      }));
      showToast("Rule marked compliance reviewed.");
    },
    viewRulePrompt(ruleId) {
      setData((current) => ({ ...current, logs: [addAutomationLog("ADMIN", "Rule prompt viewed", "Rules registry", "Demo simulated", role, "View prompt", ruleId), ...current.logs] }));
      showToast("Opened read-only demo prompt.");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [monthOffset, role, data.adminConfig, data.adminRules, data.cases]);

  function handleSetRole(nextRole: UserRole) {
    setRole(nextRole);
    setActiveView(roleHome(nextRole) as ViewKey);
  }

  const selectedCase = data.cases.find((item) => item.id === selectedCaseId);

  return (
    <AppShell role={role} setRole={handleSetRole} activeView={activeView} setActiveView={setActiveView}>
      {activeView === "overview" && <OverviewDashboard data={data} />}
      {activeView === "booking" && <BookingIntakeForm actions={actions} />}
      {activeView === "calendar" && <PatientIntakeCalendar data={data} actions={actions} selectedCaseId={selectedCaseId} role={role} />}
      {activeView === "secretary" && <SecretaryReviewBoard data={data} actions={actions} />}
      {activeView === "doctor-pending" && <DoctorPending data={data} actions={actions} />}
      {activeView === "doctor-working" && <DoctorWorking data={data} actions={actions} />}
      {activeView === "patients" && <PatientsRegistry data={data} />}
      {activeView === "tasks" && <TasksBoard data={data} />}
      {activeView === "payments" && <PaymentsTracker data={data} />}
      {activeView === "devices" && <DevicesTracker data={data} />}
      {activeView === "reports" && <ReportsView data={data} actions={actions} />}
      {activeView === "second-brain" && <SecondBrain data={data} actions={actions} />}
      {activeView === "insights" && <SmartInsights data={data} actions={actions} />}
      {activeView === "automation-log" && <AutomationLog data={data} />}
      {activeView === "admin-rules" && <AdminRules data={data} actions={actions} />}
      {activeView !== "calendar" && activeView !== "secretary" && <CaseDetailDrawer demoCase={selectedCase} data={data} actions={actions} role={role} />}
      {toast && <div className="global-toast">{toast}</div>}
    </AppShell>
  );
}
