# PRD: Secretary Working-Hours Calendar

## 1. Summary
A new module that lets the doctor (and secretaries themselves) define, view, and manage each secretary's working hours on a shared calendar. Instead of fixed daily shifts, hours are set per day and can vary freely (e.g., Secretary 1: 9h–13h Monday, 10h–12h Tuesday). The calendar becomes the single source of truth for who is covering the front desk when, giving the doctor visibility into staffing coverage and gaps.

## 2. Problem
- The doctor currently has no way to see, at a glance, which secretary is working at any given hour.
- Secretary schedules are irregular (different hours each day), so a simple "9-5" template doesn't fit.
- There's no shared view secretaries can check to know who else is on shift, avoiding double coverage or gaps.
- No way to quantify total staffed hours per week/month, or spot under-covered periods (e.g., lunch, early morning, late evening) to plan for off-hours or hire/adjust staffing.

## 3. Goals
- Doctor can define/edit working-hour blocks per secretary, per day, in a calendar UI.
- Secretaries can view the shared calendar to see their own and colleagues' hours.
- Surface total clinic coverage hours (daily/weekly/monthly) and flag uncovered gaps.
- Fit the existing product's look/feel (Notion-like cockpit, no backend — `localStorage`-based, per the current demo architecture).

### Non-goals (v1)
- Time-off / leave requests workflow, payroll/export, shift-swap requests, notifications/reminders, multi-clinic/location support. These can be future iterations.

## 4. Users & Roles
- **Doctor (admin)**: full CRUD on all secretaries' hours; views coverage analytics.
- **Secretary**: views the full shared calendar (all secretaries); can edit their own hours (configurable — doctor may choose to lock editing to herself only).

## 5. User Stories
1. As the doctor, I can add a working-hour block for Secretary 1 on a specific date (e.g., 9:00–13:00) so the schedule reflects reality.
2. As the doctor, I can edit or delete an existing block if hours change.
3. As the doctor, I can view a week/month calendar with all secretaries' blocks color-coded by person, so I can see coverage at a glance.
4. As a secretary, I can open the same calendar and see my own hours and my colleagues', so I know who's on with me.
5. As the doctor, I can see total hours worked per secretary over a week/month (for planning/comparison).
6. As the doctor, I can see clinic-coverage view — hours where at least one secretary is present vs. hours with nobody scheduled (gaps), so I can plan for off-hours or adjust staffing.
7. As the doctor, I can set a recurring weekly pattern for a secretary (optional convenience) but still override individual days.

## 6. Functional Requirements

### 6.1 Calendar view
- Week view (default) and month view toggle.
- Each secretary assigned a distinct color; blocks rendered on a day/time grid (week view) similar to Google Calendar-style day columns.
- Month view shows a condensed summary per day (e.g., total covered hours, or secretary initials + hours).
- Clicking a block opens edit/delete; clicking empty time opens "add block" form (secretary, start time, end time, date).

### 6.2 Managing hours
- Add block: select secretary, date, start time, end time. Validate end > start; warn (not necessarily block) on overlapping blocks for the same secretary.
- Edit/delete existing block.
- Optional: "apply to recurring weekdays" checkbox when creating a block (e.g., every Monday 9–13) that generates individual editable blocks — still overridable per single day.

### 6.3 Coverage & analytics
- Per-secretary total hours: daily / weekly / monthly rollup, shown as a summary panel or table.
- Clinic coverage timeline: a horizontal bar/heatmap per day showing covered vs. uncovered hours (union of all secretaries' blocks against clinic operating hours, e.g., 8:00–19:00 configurable).
- Gap flagging: highlight time ranges with zero secretaries scheduled during defined operating hours — this directly supports "plan for off-hours."
- Simple stat tiles: total staffed hours this week, average hours/secretary, number of uncovered hour-blocks this week.

### 6.4 Permissions
- Doctor: full access to all secretaries' schedules.
- Secretary: read access to all; write access to own schedule only (configurable toggle for doctor to allow/restrict secretary self-editing).

### 6.5 Data model (client-side, consistent with current `localStorage`-only architecture)
```
WorkingHourBlock {
  id: string
  secretaryId: string
  date: string (ISO date)
  startTime: string (HH:mm)
  endTime: string (HH:mm)
  recurringGroupId?: string   // links blocks created via "apply to weekdays"
  createdAt / updatedAt
}
```
Secretaries reuse whatever existing user/staff entity the app already has (or a new lightweight `Secretary { id, name, color }` list if none exists).

## 7. Non-functional requirements
- Consistent with current stack: Next.js, TypeScript, React state + `localStorage`, no backend/DB, no real auth (matches README's stated architecture).
- Fits existing dashboard visual system (healthcare SaaS styling, `lucide-react` icons).
- Data resettable via existing Admin Rules reset mechanism, like other mock data.
- Since this is demo-mode software (per README: synthetic data, no real PHI), no compliance claims are made for this module either.

## 8. Success Metrics (for the demo/product goal)
- Doctor can fully build a week's schedule for 3+ secretaries in under 2 minutes.
- Coverage gaps are visually identifiable within 5 seconds of opening the calendar.
- Zero data loss on page refresh (persisted in `localStorage`).

## 9. Open Questions
1. Should secretaries be able to edit only their own hours, or is this doctor-only in v1?
2. What are the clinic's defined operating hours for gap-detection (fixed, e.g., 8:00–19:00, or configurable in Admin Rules)?
3. Do we need a "notes" field per block (e.g., "covering for X")?
4. Is a simple week/month calendar sufficient, or is a Gantt-style multi-secretary row view preferred (all secretaries stacked as rows, times as columns)?

## 10. Suggested Rollout
- **Phase 1**: Data model + week-view calendar with add/edit/delete blocks, per-secretary color coding.
- **Phase 2**: Coverage/gap analytics (stat tiles + timeline heatmap).
- **Phase 3**: Recurring patterns, month view, self-service permissions for secretaries.
