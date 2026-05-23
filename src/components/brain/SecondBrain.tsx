"use client";

import { Activity, Brain, Database, FileText, Lock, Shield, Stethoscope } from "lucide-react";
import type { DemoActions, DemoData } from "@/lib/appState";
import { Card, SectionTitle } from "@/components/shared";

export function SecondBrain({ data, actions }: { data: DemoData; actions: DemoActions }) {
  const sources = [
    ["Patient history, secure layer", Database],
    ["Medications & interactions", Shield],
    ["Clinical guidelines", FileText],
    ["Medical journals & updates", Activity],
    ["GDPR & compliance updates", Lock],
    ["Cardiology / rhythmology expertise", Stethoscope],
    ["Doctor preferences & feedback", Brain]
  ] as const;

  return (
    <div className="stack">
      <Card className="hero-card compact-hero">
        <span className="badge badge-blue">Doctor&apos;s Specialities - Second Brain</span>
        <h2>A quiet assistant that learns what matters and stays out of the way.</h2>
        <p>It does not auto-diagnose, does not make treatment decisions, and only surfaces context when relevance is high enough for the workflow.</p>
      </Card>
      <div className="source-card-grid seven">
        {sources.map(([label, Icon]) => (
          <Card key={label} className="source-card">
            <Icon size={20} />
            <strong>{label}</strong>
          </Card>
        ))}
      </div>
      <Card className="engine-card">
        <Brain size={32} />
        <div>
          <SectionTitle eyebrow="AI Reasoning Engine" title="Context-aware, low-noise intelligence" />
          <div className="engine-grid">
            {["Learns over time", "Understands context", "Prioritizes what matters", "Reduces noise", "Does not auto-diagnose", "Does not make treatment decisions"].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
      </Card>
      <div className="metric-grid">
        {data.memories.map((memory) => (
          <Card key={memory.id} className="memory-card">
            <strong>{memory.signal}</strong>
            <div className="meter"><span style={{ width: `${memory.weight}%` }} /></div>
            <small>{memory.trend} · {memory.weight}%</small>
            <div className="card-actions">
              <button onClick={() => actions.updateMemory(memory.id, "Save memory")}>Save memory</button>
              <button onClick={() => actions.updateMemory(memory.id, "Dismiss pattern")}>Dismiss pattern</button>
              <button onClick={() => actions.updateMemory(memory.id, "Increase priority")}>Increase priority</button>
              <button onClick={() => actions.updateMemory(memory.id, "Reduce priority")}>Reduce priority</button>
              <button onClick={() => actions.updateMemory(memory.id, "View related insights")}>View related insights</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
