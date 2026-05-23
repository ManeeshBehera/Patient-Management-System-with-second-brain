"use client";

import type { DemoData } from "@/lib/appState";
import { Card, SectionTitle } from "@/components/shared";
import { formatDateTime } from "@/lib/utils";

export function AutomationLog({ data }: { data: DemoData }) {
  return (
    <Card>
      <SectionTitle eyebrow="Operations" title="Automation Log" action={<span className="badge badge-blue">{data.logs.length} events</span>} />
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Actor role</th>
              <th>Action</th>
              <th>Related case / insight / rule</th>
              <th>Automation name</th>
              <th>Trigger</th>
              <th>Result</th>
            </tr>
          </thead>
          <tbody>
            {data.logs.slice(0, 180).map((log) => (
              <tr key={log.id}>
                <td>{formatDateTime(log.timestamp)}</td>
                <td>{log.actorRole ?? "System"}</td>
                <td>{log.action ?? log.automationName}</td>
                <td>{log.relatedId ?? log.caseId}</td>
                <td>{log.automationName}</td>
                <td>{log.trigger}</td>
                <td><span className={log.result === "Success" || log.result === "Demo simulated" ? "chip chip-green" : log.result === "Failed" ? "chip chip-red" : "chip chip-muted"}>{log.result}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
