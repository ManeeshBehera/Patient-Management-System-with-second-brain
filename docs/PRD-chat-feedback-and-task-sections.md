# PRD: Doctor→Admin Chat/Feedback & Sectioned Tasks Page

## 1. Summary
Two related additions to the Cabinet OS, driven by the Jul 14, 2026 demo call with Dr. Amraoui:

1. **Chat / Feedback** — a lightweight, non-task message channel so doctors (and secretaries) can send the admin (Dr. Amraoui) short notes, ideas, and feedback *inside the platform instead of over WhatsApp/email*. Modeled on the AI Makers "feedback inbox": an owner/recipient, a message body, and reply-able threads — but not a live chat and not doctor-to-doctor DM.
2. **Sectioned Tasks page** — restructure the Tasks view from a single flat status board into three top-level sections (**Patients/Follow-ups**, **Clinic/General**, **Recurring**), with category tags inside Clinic/General, plus a daily morning/end-of-day handover checklist under Recurring. The goal is to "organize the brain" so a "buy tissues" task never sits at the same level as "call a critical patient."

Both fit the current demo architecture: Next.js + TypeScript, React state persisted to `localStorage`, no backend/DB/auth, no real PHI.

---

## PART A — Chat / Feedback (Doctor → Admin)

## A.1 Problem
- Doctors covering for Dr. Amraoui currently message her over **WhatsApp** ("Mr. X had this," "you should buy this blood-pressure tool," "Mayuna was great today"). She wants **everything to flow through the platform**, not scattered across WhatsApp/email.
- These notes are **not tasks** — they have no due date and no priority. Forcing them into the task system (as suggested on the call) clutters the task queue and mislabels their intent.
- Some are appreciations/ideas, some are heads-ups about a patient — but the sender should just be able to "write something small" and have the admin reliably receive it.

## A.2 Goals
- Give doctors/secretaries a one-field way to send a short message to the admin.
- Give the admin a single **inbox** of received messages, with the ability to reply.
- Keep messages **clearly distinct** from tasks (no due date, no priority, no status board).

### Non-goals (v1)
- **Not** a real-time/instant chat.
- **Not** doctor-to-doctor or secretary-to-secretary direct messaging — messages are directed to the **admin** only.
- **No** convert-to-task and **no** patient linking in v1 (messages are standalone notes). Both are candidate Phase 2 items — see Open Questions.
- No attachments, no read receipts, no push/mobile notifications (email/in-app notification reuse only).

## A.3 Users & Roles
- **Sender** (Doctor or Secretary): compose and send a message to the admin; view their own sent messages and any replies.
- **Admin** (Dr. Amraoui): sees all incoming messages in one inbox; can read and reply. New/unread messages surface a count badge.

## A.4 User Stories
1. As a doctor covering the cabinet, I can write a short message ("Overall everything was great; you should buy an X blood-pressure tool") and send it to the admin, without setting a due date or priority.
2. As the admin, I open my Feedback inbox and see all messages, newest first, with unread ones highlighted and a count badge in the sidebar/top bar.
3. As the admin, I can reply to a message; the sender sees my reply on their side ("indirect two-way," like a discussion board — not a live chat).
4. As a sender, I can see the status of my message (Sent → Replied) and read the admin's reply.
5. As the admin, I can mark a message read/handled so my inbox stays clean.

## A.5 Functional Requirements

### A.5.1 Compose
- Single compose form: **message body** (required), auto-stamped **sender** (from current logged-in role/account) and **recipient = Admin** (fixed in v1).
- No due date, no priority, no status columns — this is the explicit differentiator from Tasks.
- Optional short **subject/title** (one line) for inbox readability.

### A.5.2 Admin inbox
- List of received messages, sorted newest-first, each showing sender, subject/first line, timestamp, and read/unread state.
- Unread **count badge** in the sidebar nav item and/or top bar (reuse the existing open-tasks banner pattern).
- Open a message → full body + thread of replies. Actions: **Reply**, **Mark read/handled**.

### A.5.3 Threads / replies
- A message is a thread: original + zero-or-more replies.
- Admin can reply; sender can reply back. "Indirect two-way" — no typing indicators, no live updates; new replies appear on next load/refresh (consistent with the app's `localStorage` model).

### A.5.4 Notifications
- Reuse the existing `NotificationChannel` concept (`Email | Notion | In-app`) for a lightweight "you have a new message/reply" signal. In demo mode this is simulated (no real send), consistent with current automation-log behavior.

### A.5.5 Permissions
- Doctors/Secretaries: create messages, view their own threads + replies.
- Admin: view all threads, reply, mark read.
- No one other than the admin sees another sender's messages.

## A.6 Data model (client-side, `localStorage`, consistent with current architecture)
```ts
type FeedbackMessageStatus = "Sent" | "Read" | "Replied" | "Handled";

interface FeedbackMessage {
  id: string;
  subject?: string;            // optional one-line title
  body: string;                // required
  fromUser: string;            // sender display name / account
  fromRole: UserRole;          // "Doctor" | "Secretary" | "Admin"
  toRole: "Admin";             // fixed recipient in v1
  status: FeedbackMessageStatus;
  replies: FeedbackReply[];
  createdAt: string;
  updatedAt: string;
}

interface FeedbackReply {
  id: string;
  body: string;
  fromUser: string;
  fromRole: UserRole;
  createdAt: string;
}
```
- New `ViewKey`: `"feedback"` (or `"messages"`), added to the sidebar. Seed with a few dummy messages like other demo data, resettable via the existing Admin Rules reset.

---

## PART B — Sectioned Tasks Page

## B.1 Problem
Today `TasksBoard` renders one flat board columned by **status** (To do / In progress / Waiting / Blocked / Done). Every task type lives at the same level, so:
- Low-stakes errands ("buy tissues," "buy a gift for Saturday's breakfast") sit beside safety-critical items ("call this patient — it's an emergency").
- There's no way to separate **patient work** from **cabinet errands** from **recurring routines**.
- Recurring routines (rent on the 5th, weekly inventory check, morning/leaving handover) have to be re-created manually each time.

Dr. Amraoui asked for the tasks to be **divided** so the setup "organizes their brain."

## B.2 Goals
- Reorganize Tasks into **three top-level sections**: **Patients/Follow-ups**, **Clinic/General**, **Recurring**.
- Within **Clinic/General**, tag each task with a **category** (Administration, Payment, Furniture/Material) so finer buckets from the meeting are preserved as filters rather than separate pages.
- Support **recurring tasks** (e.g., every Monday, every 5th of the month) created once and regenerated by the system.
- Support a **daily morning / end-of-day handover checklist** (tick-box, resets daily) under Recurring.
- Preserve existing capabilities: assignment (to a person, or to the clinic with/without notify-all), priority, due date, status, notification channel.

### Non-goals (v1)
- Full finance/accountability module (payment *tasks* are in scope; the finances ledger is a separate track).
- Inventory management screen itself (already a separate module — tasks only *reference* it; furniture/material tasks are distinct from the inventory stock module).
- Dependencies between tasks, sub-tasks, Gantt/timeline views.

## B.3 Users & Roles
- **Admin** (Dr. Amraoui): full CRUD across all sections; sets recurrence; configures categories.
- **Doctor**: sees/creates tasks assigned to/by them (esp. Patients/Follow-ups).
- **Secretary / Front desk**: sees clinic tasks and their assignments; self-assigns unassigned clinic tasks; ticks the daily handover checklist.

## B.4 Information Architecture

### B.4.1 Three top-level sections
1. **Patients / Follow-ups** — anything tied to a patient or clinical follow-up (e.g., "call patient to book with Dr. Sana," device-return follow-ups, "chase Mrs. X for payment of last week's consult"). Optionally linked to a patient via existing `relatedPatientId`.
2. **Clinic / General** — non-patient cabinet operations, each carrying a **category tag**:
   - **Administration** (send a letter, send the Carte Vitale, paperwork)
   - **Payment** (collect/relaunch a patient payment — the secretary-visible collection tasks)
   - **Furniture / Material** (one-off purchases: table for the breakfast, tools) — distinct from the recurring **Inventory** stock module.
3. **Recurring** — tasks that repeat on a schedule, plus the **daily handover checklist** (see B.5.4).

> Note on visibility of payment tasks: secretaries **can** see payment-*collection* tasks (they need to act on them), but full cabinet **accountability/finances** stays restricted to the admin — that lives in the separate finance track, not here.

### B.4.2 Category vs. section
- **Section** = the primary tab a task lives under (Patients/Follow-ups, Clinic/General, Recurring).
- **Category** = a tag used *inside Clinic/General* for filtering (Administration / Payment / Furniture-Material). Categories are editable in Admin so the doctor can rename/add.

## B.5 Functional Requirements

### B.5.1 Section navigation
- Tasks view gets a section switcher (tabs or segmented control): **Patients/Follow-ups · Clinic/General · Recurring**.
- Within a section, keep the existing status columns (To do / In progress / Waiting / Blocked / Done) and the existing role + status filters.
- In **Clinic/General**, add **category filter chips** (All · Administration · Payment · Furniture/Material).
- Keep the existing **open** and **overdue** count badges; scope them per active section, plus a global banner of "open tasks today" (extends the current top banner).

### B.5.2 Create / edit task
Extend the create form with:
- **Section** (required): Patients/Follow-ups · Clinic/General · Recurring.
- **Category** (required only when Section = Clinic/General): Administration · Payment · Furniture/Material.
- **Assignment** (existing, three modes must be selectable up front):
  1. one specific person,
  2. the **clinic** (shared/unassigned pool — no individual notification), or
  3. the clinic **with notify-all** (every clinic member gets the notification).
- Existing fields retained: title, due date, priority (Normal/Review/Urgent), status, `relatedPatientId`/`relatedCaseId`, notification channel, completion note.
- **Unassigned clinic tasks** remain self-assignable ("up for grabs"): a clinic member can claim ownership so two people don't do the same task. Kept as a fallback, secondary to the explicit up-front assignment the doctor prefers.

### B.5.3 Recurring tasks
- On create, allow **Recurring = on** with a simple schedule: **Daily**, **Weekly (choose weekday[s])**, or **Monthly (choose day-of-month)**. Examples: "pay rent every 5th," "secretary checks inventory every Monday, writes it up every Friday."
- The system regenerates the next instance when due (in demo mode, generate upcoming instances on load). Recurring definitions are editable/deletable; editing the rule doesn't retro-edit already-completed instances.
- A recurring task can be assigned to a person or the clinic, same as one-off tasks.

### B.5.4 Daily handover checklist (under Recurring)
- A **morning** checklist and an **end-of-day** checklist: a fixed set of tick-box items the admin defines once (e.g., "unlock/prep rooms," "check devices due back today," "close register").
- Rendered top-of-section (mirrors the "top-right daily checklist" the doctor asked for); items **reset daily** so each day starts fresh.
- Secretaries tick items as done; the admin can see completion per day. Checklist items are managed by the admin (add/edit/remove).

### B.5.5 Notifications & banner
- Keep the existing open-tasks banner; extend it to reflect the active section and to include recurring items due today + unticked checklist items.
- Reuse `NotificationChannel` for assignment notifications; "notify-all clinic" fans out to all clinic members.

## B.6 Data model changes (client-side, `localStorage`)
Extend `TaskRecord`:
```ts
type TaskSection = "Patient/Follow-up" | "Clinic/General" | "Recurring";
type ClinicCategory = "Administration" | "Payment" | "Furniture/Material";

interface TaskRecord {
  // ...existing fields (id, title, assignedTo, assignedRole, dueDate,
  //    priority, status, relatedPatientId, relatedCaseId,
  //    notificationChannel, completionNote, createdAt, updatedAt)...
  section: TaskSection;              // NEW — required
  category?: ClinicCategory;         // NEW — required when section = "Clinic/General"
  assignmentMode: "Person" | "Clinic" | "Clinic+Notify"; // NEW
  recurrence?: {                     // NEW — present when recurring
    frequency: "Daily" | "Weekly" | "Monthly";
    weekdays?: number[];             // for Weekly (0–6)
    dayOfMonth?: number;             // for Monthly (1–31)
    recurringGroupId: string;        // links generated instances
  };
}

interface HandoverChecklistItem {    // NEW
  id: string;
  label: string;
  slot: "Morning" | "EndOfDay";
  // completion tracked per date:
  completedOn: string[];             // ISO dates ticked done
  createdAt: string;
  updatedAt: string;
}
```
- Categories and checklist items are admin-editable (surface in Admin Rules alongside other config).
- Seed dummy tasks across all three sections + a couple of recurring items and checklist entries, resettable via the existing reset mechanism.

## B.7 Migration / backward compatibility
- Existing seeded tasks have no `section`. Default them: tasks with `relatedPatientId` → **Patients/Follow-ups**; everything else → **Clinic/General** with category **Administration** as a safe default. `assignmentMode` defaults to `"Person"` when `assignedTo` is a named user.

---

## 6. Non-functional requirements (both parts)
- Same stack: Next.js, TypeScript, React state + `localStorage`, no backend/DB, no real auth or external sends (matches README).
- Fits the existing dashboard visual system (healthcare SaaS styling, `lucide-react` icons, `Card`/`SectionTitle` primitives in `src/components/shared.tsx`).
- Bilingual-ready (EN/FR) like the rest of the app; category/section/checklist labels must be translatable. (Arabic is a later track, per the call.)
- Demo-mode disclaimer unchanged: synthetic data, no real PHI; notifications simulated.

## 7. Success metrics (demo goals)
- The admin can send/receive a message and reply entirely in-app — zero WhatsApp needed for that exchange.
- A secretary can find all patient tasks without scrolling past errands (section switch < 2 clicks).
- A recurring task ("rent on the 5th") is created once and reappears automatically each period.
- Morning checklist visibly resets each day and is tick-completable.

## 8. Open questions
1. **Message → task / patient link (Part A):** deferred to v1 per decision, but the doctor described notes that "become a task" and "notes about a patient." Confirm this is Phase 2, and whether patient-linking should come before convert-to-task.
2. **Recurring instance generation:** in a no-backend demo, generate upcoming instances on app load (client-side). Acceptable for the demo, or do we only render the *rule* + next occurrence?
3. **Checklist scope:** is one shared clinic checklist enough, or per-secretary checklists? Assumed one shared per slot in v1.
4. **Category list authority:** final category names — Administration / Payment / Furniture-Material — confirmed? The doctor also mentioned a weekly **cardiology** Excel (monthly remote-patient billing to social security, ~100 names, tick-when-done); is that a new category/recurring-checklist, or its own module? She said she'll send the full spec.
5. **Notify-all channel:** for "clinic + notify," which channels fire in demo (in-app only, or simulated email too)?

## 9. Suggested rollout
- **Phase 1 (Tasks):** add Section field + three-section navigation, category tags/filters in Clinic/General, migrate existing tasks. Highest daily value.
- **Phase 2 (Recurring + checklist):** recurrence rules + generation, morning/end-of-day handover checklist.
- **Phase 3 (Chat/Feedback):** compose + admin inbox + reply threads + unread badge.
- **Phase 4 (later):** message→task conversion, patient-linked notes, cardiology billing tracker — pending Dr. Amraoui's written spec.
