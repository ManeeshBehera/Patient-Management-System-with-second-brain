import type { DoctorStatus, IntakeStatus, Priority, UserRole } from "./types";

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export function formatShortDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short" }).format(new Date(value));
}

export function todayLabel() {
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date());
}

export function intakeChip(status: IntakeStatus) {
  const map: Record<IntakeStatus, string> = {
    "New Intake": "chip chip-blue",
    Matching: "chip chip-cyan",
    Drafting: "chip chip-indigo",
    Review: "chip chip-amber",
    "Missing Info": "chip chip-red",
    Ready: "chip chip-green",
    Pending: "chip chip-blue",
    Working: "chip chip-amber",
    Done: "chip chip-muted"
  };
  return map[status];
}

export function doctorChip(status: DoctorStatus) {
  const map: Record<DoctorStatus, string> = {
    "Not Visible": "chip chip-muted",
    Pending: "chip chip-blue",
    Working: "chip chip-amber",
    Done: "chip chip-green"
  };
  return map[status];
}

export function priorityChip(priority: Priority) {
  const map: Record<Priority, string> = {
    Normal: "chip chip-green",
    Review: "chip chip-amber",
    Urgent: "chip chip-red"
  };
  return map[priority];
}

export function roleHome(role: UserRole) {
  if (role === "Doctor") return "doctor-pending";
  if (role === "Secretary") return "secretary";
  return "overview";
}
