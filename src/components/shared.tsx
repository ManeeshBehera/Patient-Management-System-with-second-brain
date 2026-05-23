import { AlertTriangle, CheckCircle, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("card", className)}>{children}</section>;
}

export function SectionTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: React.ReactNode }) {
  return (
    <div className="section-title">
      <div>
        {eyebrow && <div className="eyebrow">{eyebrow}</div>}
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function ComplianceStrip() {
  const items = ["Demo data only", "Identifiable patient data remains outside the cockpit", "AI drafts require secretary validation", "Doctor only sees verified ready cases", "Second Brain is assistive, not diagnostic"];
  return (
    <div className="compliance-strip">
      {items.map((item, index) => (
        <span key={item}>
          {index === 0 ? <Shield size={14} /> : index === 2 ? <AlertTriangle size={14} /> : <CheckCircle size={14} />} {item}
        </span>
      ))}
    </div>
  );
}

export function MiniBarChart({ data, color = "#0f8aa0" }: { data: Array<{ label: string; value: number }>; color?: string }) {
  const max = Math.max(...data.map((item) => item.value), 1);
  return (
    <div className="mini-bars">
      {data.map((item) => (
        <div className="mini-bar-row" key={item.label}>
          <span>{item.label}</span>
          <div className="bar-track">
            <div style={{ width: `${Math.max(6, (item.value / max) * 100)}%`, background: color }} />
          </div>
          <strong>{item.value}</strong>
        </div>
      ))}
    </div>
  );
}

export function DonutChart({ data }: { data: Array<{ label: string; value: number; color: string }> }) {
  const total = Math.max(data.reduce((sum, item) => sum + item.value, 0), 1);
  let cumulative = 25;
  const gradient = data
    .map((item) => {
      const start = cumulative;
      cumulative += (item.value / total) * 100;
      return `${item.color} ${start}% ${cumulative}%`;
    })
    .join(", ");
  return (
    <div className="donut-wrap">
      <div className="donut" style={{ background: `conic-gradient(${gradient}, #edf5f6 0)` }}>
        <span>{total}</span>
      </div>
      <div className="legend">
        {data.map((item) => (
          <span key={item.label}>
            <i style={{ background: item.color }} /> {item.label} {item.value}
          </span>
        ))}
      </div>
    </div>
  );
}
