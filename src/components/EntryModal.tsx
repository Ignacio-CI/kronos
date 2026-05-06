import { useState } from "react";
import type { Entry, Project } from "@/types";
import { decimalHours, formatHMS, pad, renderMD } from "@/lib/utils";

export type EntryDraft = Partial<Entry>;

type EntryModalProps = {
  entry: EntryDraft;
  projects: Project[];
  onSave: (entry: Entry) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

export function EntryModal({ entry, projects, onSave, onDelete, onClose }: EntryModalProps) {
  const isNew = !entry.id;
  const [projectId, setProjectId] = useState<string>(entry.projectId ?? projects[0]!.id);
  const [date, setDate] = useState<string>(() => {
    const d = new Date(entry.start ?? Date.now());
    return d.toISOString().slice(0, 10);
  });
  const [startTime, setStartTime] = useState<string>(() => {
    const d = new Date(entry.start ?? Date.now());
    return pad(d.getHours()) + ":" + pad(d.getMinutes());
  });
  const [endTime, setEndTime] = useState<string>(() => {
    const d = new Date(entry.end ?? (Date.now() + 60 * 60 * 1000));
    return pad(d.getHours()) + ":" + pad(d.getMinutes());
  });
  const [note, setNote] = useState<string>(entry.note ?? "");

  const startMs = new Date(date + "T" + startTime).getTime();
  const endMs = new Date(date + "T" + endTime).getTime();
  const dur = Math.max(0, endMs - startMs);

  const save = () => {
    onSave({
      ...entry,
      id: entry.id ?? ("e" + Math.random().toString(36).slice(2, 8)),
      projectId,
      start: new Date(startMs).toISOString(),
      end: new Date(endMs).toISOString(),
      note,
    });
    onClose();
  };

  const project = projects.find(p => p.id === projectId);
  const revenue = project ? decimalHours(dur) * project.rate : 0;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="eyebrow">{isNew ? "new entry" : "edit entry"}</div>
            <div className="title">{isNew ? "Log time" : "Adjust session"}</div>
          </div>
          <button onClick={onClose} aria-label="Close" className="muted">
            <div className="icon-x" />
          </button>
        </div>

        <div className="modal-body">
          <div className="field">
            <label>Project</label>
            <select value={projectId} onChange={e => setProjectId(e.target.value)}>
              {projects.map(p => (
                <option key={p.id} value={p.id}>{p.client} — {p.name}</option>
              ))}
            </select>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Date</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="field">
              <label>Duration</label>
              <input className="mono" readOnly value={formatHMS(dur)} />
            </div>
          </div>

          <div className="field-row">
            <div className="field">
              <label>Start</label>
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
            </div>
            <div className="field">
              <label>End</label>
              <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label>Note · supports **bold** *italic* `code`</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="What did you work on?"
            />
            {note && (
              <div
                className="md-out"
                style={{ marginTop: 10, padding: 12, borderLeft: "2px solid var(--rule)" }}
                dangerouslySetInnerHTML={{ __html: renderMD(note) }}
              />
            )}
          </div>

          {project && (
            <div className="totals-row">
              <div>
                <div className="lbl">Hours</div>
                <div className="val">{decimalHours(dur).toFixed(2)}</div>
              </div>
              <div>
                <div className="lbl">Rate</div>
                <div className="val">${project.rate}/h</div>
              </div>
              <div>
                <div className="lbl">Revenue</div>
                <div className="val" style={{ color: "var(--accent)" }}>${revenue.toFixed(0)}</div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-foot">
          {!isNew && entry.id && (
            <button
              className="btn-ghost"
              onClick={() => { onDelete(entry.id!); onClose(); }}
              style={{ marginRight: "auto", color: "var(--accent)" }}
            >
              Delete
            </button>
          )}
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button className="btn-primary" onClick={save}>{isNew ? "Log session" : "Save"}</button>
        </div>
      </div>
    </div>
  );
}
