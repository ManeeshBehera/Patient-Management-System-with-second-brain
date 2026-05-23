"use client";

import { useState } from "react";
import { Copy, Edit, Eye, RefreshCw, ToggleLeft, Wand2, X } from "lucide-react";
import type { DemoActions, DemoData } from "@/lib/appState";
import type { AdminConfigSection, RuleCard } from "@/lib/types";
import { Card, SectionTitle } from "@/components/shared";

type ModalState =
  | { type: "config"; section: AdminConfigSection }
  | { type: "rule"; rule: RuleCard; readOnly?: boolean }
  | { type: "reset" }
  | undefined;

export function AdminRules({ data, actions }: { data: DemoData; actions: DemoActions }) {
  const [modal, setModal] = useState<ModalState>();
  const [draftText, setDraftText] = useState("");
  const [loadingAction, setLoadingAction] = useState<string>();

  function runControl(id: string, fn: () => void) {
    setLoadingAction(id);
    window.setTimeout(() => {
      fn();
      setLoadingAction(undefined);
    }, 360);
  }

  function openConfig(section: AdminConfigSection) {
    actions.openAdminSection(section.id);
    setDraftText(JSON.stringify(section.settings, null, 2));
    setModal({ type: "config", section });
  }

  function openRule(rule: RuleCard, readOnly = false) {
    if (readOnly) actions.viewRulePrompt(rule.id);
    setDraftText(rule.promptText);
    setModal({ type: "rule", rule, readOnly });
  }

  return (
    <div className="stack">
      <Card>
        <SectionTitle eyebrow="Admin / Othmane" title="Demo Data Controls" action={<span className="badge badge-blue">{data.patients.length} patients · {data.cases.length} cases</span>} />
        <p className="muted">These controls simulate operational scenarios locally. No real data is created or sent anywhere.</p>
        <div className="quick-actions">
          <button onClick={() => setModal({ type: "reset" })}><RefreshCw size={15} /> Reset demo data</button>
          <button onClick={() => runControl("month", actions.generateSyntheticMonth)}><Wand2 size={15} /> {loadingAction === "month" ? "Generating..." : "Generate new synthetic month"}</button>
          <button onClick={() => runControl("bookings", () => actions.addMockBookings(20))}>{loadingAction === "bookings" ? "Adding..." : "Add 20 new mock bookings"}</button>
          <button onClick={() => runControl("busy", actions.simulateBusyWeek)}>{loadingAction === "busy" ? "Simulating..." : "Simulate busy week"}</button>
          <button onClick={() => runControl("backlog", actions.simulateSecretaryBacklog)}>{loadingAction === "backlog" ? "Simulating..." : "Simulate secretary backlog"}</button>
          <button onClick={() => runControl("review", actions.simulateDoctorReviewDay)}>{loadingAction === "review" ? "Simulating..." : "Simulate doctor review day"}</button>
        </div>
      </Card>
      <div className="admin-grid">
        {data.adminConfig.map((section) => (
          <button className="admin-config-card" key={section.id} onClick={() => openConfig(section)}>
            <strong>{section.title}</strong>
            <span>{section.description}</span>
            <small>{section.status} · updated {section.lastUpdated}</small>
          </button>
        ))}
      </div>
      <Card>
        <SectionTitle eyebrow="Prompt/rule cards" title="Rules registry" />
        <div className="rule-grid">
          {data.adminRules.map((rule) => (
            <article className="rule-card" key={rule.id}>
              <div>
                <strong>{rule.name}</strong>
                <span className={rule.status === "Active" ? "chip chip-green" : rule.status === "Draft" ? "chip chip-amber" : "chip chip-muted"}>{rule.status}</span>
              </div>
              <p>{rule.description}</p>
              <p>{rule.version} · Last updated {rule.lastUpdated}</p>
              <label className="check-row boxed-check"><input type="checkbox" checked={rule.complianceReviewed} onChange={() => actions.markRuleReviewed(rule.id)} /> <span>Compliance reviewed</span></label>
              <div className="card-actions">
                <button onClick={() => openRule(rule)}><Edit size={14} /> Edit</button>
                <button onClick={() => actions.duplicateRule(rule.id)}><Copy size={14} /> Duplicate</button>
                <button onClick={() => actions.toggleRuleStatus(rule.id)}><ToggleLeft size={14} /> Toggle</button>
                <button onClick={() => actions.markRuleReviewed(rule.id)}><RefreshCw size={14} /> Mark reviewed</button>
                <button onClick={() => openRule(rule, true)}><Eye size={14} /> View prompt</button>
              </div>
            </article>
          ))}
        </div>
      </Card>

      {modal && (
        <div className="drawer-backdrop" onClick={() => setModal(undefined)}>
          <aside className="drawer admin-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <div className="eyebrow">Demo-only admin modal</div>
                <h2>{modal.type === "reset" ? "Reset demo data" : modal.type === "config" ? modal.section.title : modal.rule.name}</h2>
              </div>
              <button className="icon-button" onClick={() => setModal(undefined)} aria-label="Close admin modal"><X size={18} /></button>
            </div>

            {modal.type === "reset" && (
              <div className="drawer-section">
                <p>Reset all demo data to the original synthetic dataset?</p>
                <div className="card-actions">
                  <button className="primary-button" onClick={() => { actions.resetDemoData(); setModal(undefined); }}>Confirm reset</button>
                  <button onClick={() => setModal(undefined)}>Close</button>
                </div>
              </div>
            )}

            {modal.type === "config" && (
              <div className="drawer-section">
                <p>{modal.section.description}</p>
                <textarea value={draftText} onChange={(event) => setDraftText(event.target.value)} />
                <div className="card-actions">
                  <button className="primary-button" onClick={() => { actions.saveAdminSection(modal.section.id, { settings: { editedDemoConfig: draftText } }); setModal(undefined); }}>Save demo changes</button>
                  <button onClick={() => actions.resetAdminSection(modal.section.id)}>Reset section</button>
                  <button onClick={() => setModal(undefined)}>Close</button>
                </div>
              </div>
            )}

            {modal.type === "rule" && (
              <div className="drawer-section">
                <p>{modal.rule.description}</p>
                <label>
                  Prompt text
                  <textarea readOnly={modal.readOnly} value={draftText} onChange={(event) => setDraftText(event.target.value)} />
                </label>
                <div className="warning-banner">Demo prompt only. No real LLM calls are made.</div>
                <div className="card-actions">
                  {!modal.readOnly && <button className="primary-button" onClick={() => { actions.editRule(modal.rule.id, { promptText: draftText, version: `${modal.rule.version}+demo` }); setModal(undefined); }}>Save updates</button>}
                  <button onClick={() => setModal(undefined)}>Close</button>
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
