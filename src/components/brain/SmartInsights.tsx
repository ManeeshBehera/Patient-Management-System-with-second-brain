"use client";

import { useMemo, useState } from "react";
import { Bell, Bookmark, CheckCircle, Clock, Eye, X, XCircle } from "lucide-react";
import type { DemoActions, DemoData } from "@/lib/appState";
import type { SmartInsight } from "@/lib/types";
import { Card, SectionTitle } from "@/components/shared";

type InsightFilter = "All" | "Quiet" | "Notify Doctor" | "Saved" | "Acted On" | "Snoozed" | "Dismissed";

function statusClass(status: SmartInsight["status"]) {
  if (status === "Opened") return "chip chip-blue";
  if (status === "Saved") return "chip chip-cyan";
  if (status === "Acted on") return "chip chip-green";
  if (status === "Snoozed") return "chip chip-amber";
  if (status === "Dismissed") return "chip chip-muted";
  return "chip chip-blue";
}

export function SmartInsights({ data, actions }: { data: DemoData; actions: DemoActions }) {
  const [filter, setFilter] = useState<InsightFilter>("All");
  const [openInsight, setOpenInsight] = useState<SmartInsight | undefined>();
  const filtered = useMemo(() => {
    return data.insights.filter((insight) => {
      if (filter === "All") return insight.status !== "Snoozed";
      if (filter === "Quiet") return insight.visibility === "Quiet" && insight.status !== "Snoozed";
      if (filter === "Notify Doctor") return insight.visibility === "Notify doctor" || insight.visibility === "Critical";
      if (filter === "Saved") return insight.status === "Saved";
      if (filter === "Acted On") return insight.status === "Acted on";
      if (filter === "Snoozed") return insight.status === "Snoozed";
      return insight.status === "Dismissed";
    });
  }, [data.insights, filter]);

  function handleOpen(insight: SmartInsight) {
    actions.openInsight(insight.id);
    setOpenInsight({ ...insight, status: "Opened", doctorAction: "Opened" });
  }

  return (
    <div className="stack">
      <Card className="quiet-banner">
        <Bell size={20} />
        <strong>Hey doc - we found something that might be interesting.</strong>
        <span>Open when useful; otherwise we stay quiet.</span>
      </Card>
      <Card className="note-card">
        These actions are simulated for the demo. They update local demo state, preference memory, and automation logs only.
      </Card>
      <Card>
        <SectionTitle eyebrow="Quiet notification inbox" title="Smart Insights" action={<span className="badge badge-blue">{filtered.length} visible</span>} />
        <div className="filter-tabs">
          {(["All", "Quiet", "Notify Doctor", "Saved", "Acted On", "Snoozed", "Dismissed"] as InsightFilter[]).map((item) => (
            <button key={item} className={filter === item ? "active" : ""} onClick={() => setFilter(item)}>
              {item}
            </button>
          ))}
        </div>
        <div className="insight-grid">
          {filtered.slice(0, 90).map((insight) => (
            <article className="insight-card" key={insight.id}>
              <div>
                <strong>{insight.title}</strong>
                {insight.visibility === "Critical" && <span className="badge badge-red">Critical</span>}
              </div>
              <p>{insight.whyItMayMatter}</p>
              <dl>
                <div><dt>Related case</dt><dd>{insight.relatedCaseId}</dd></div>
                <div><dt>Type</dt><dd>{insight.type}</dd></div>
                <div><dt>Relevance</dt><dd>{insight.relevance}%</dd></div>
                <div><dt>Confidence</dt><dd>{insight.confidence}%</dd></div>
                <div><dt>Source</dt><dd>{insight.sourceCategory}</dd></div>
                <div><dt>Visibility</dt><dd>{insight.visibility}</dd></div>
                <div><dt>Status</dt><dd><span className={statusClass(insight.status)}>{insight.status}</span></dd></div>
              </dl>
              {insight.snoozedUntil && <small>Snoozed until {new Date(insight.snoozedUntil).toLocaleDateString("en-GB")}</small>}
              <div className="card-actions">
                <button onClick={() => handleOpen(insight)}><Eye size={14} /> Open</button>
                <button onClick={() => actions.saveInsight(insight.id)}><Bookmark size={14} /> Save</button>
                <button onClick={() => actions.dismissInsight(insight.id)}><XCircle size={14} /> Dismiss</button>
                <button onClick={() => actions.actOnInsight(insight.id)}><CheckCircle size={14} /> Acted on</button>
                <button onClick={() => actions.snoozeInsight(insight.id)}><Clock size={14} /> Snooze</button>
              </div>
            </article>
          ))}
        </div>
      </Card>
      {openInsight && (
        <div className="drawer-backdrop" onClick={() => setOpenInsight(undefined)}>
          <aside className="drawer insight-drawer" onClick={(event) => event.stopPropagation()}>
            <div className="drawer-header">
              <div>
                <div className="eyebrow">{openInsight.type}</div>
                <h2>{openInsight.title}</h2>
              </div>
              <button className="icon-button" onClick={() => setOpenInsight(undefined)} aria-label="Close insight">
                <X size={18} />
              </button>
            </div>
            <div className="drawer-section">
              <p>{openInsight.whyItMayMatter}</p>
              <dl>
                <div><dt>Related case</dt><dd>{openInsight.relatedCaseId}</dd></div>
                <div><dt>Source</dt><dd>{openInsight.sourceCategory}</dd></div>
                <div><dt>Visibility</dt><dd>{openInsight.visibility}</dd></div>
                <div><dt>Status</dt><dd>{openInsight.status}</dd></div>
              </dl>
            </div>
            <div className="warning-banner">Demo-only insight. Assistive preparation context, not diagnosis or treatment advice.</div>
          </aside>
        </div>
      )}
    </div>
  );
}
