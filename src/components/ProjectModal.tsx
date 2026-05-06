import { useState } from "react";
import type { Project } from "@/types";

const PROJECT_COLORS = [
  "oklch(52% 0.16 35)",   // terracotta
  "oklch(40% 0.06 240)",  // ink blue
  "oklch(45% 0.09 145)",  // forest
  "oklch(55% 0.13 80)",   // ochre
  "oklch(48% 0.14 320)",  // plum
  "oklch(38% 0.05 200)",  // slate teal
  "oklch(58% 0.12 20)",   // brick
  "oklch(42% 0.08 110)",  // moss
];

export type ProjectDraft = Partial<Project>;

type ProjectModalProps = {
  project: ProjectDraft;
  existingCount: number;
  onSave: (p: Project) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
};

export function ProjectModal({
  project, existingCount, onSave, onDelete, onClose,
}: ProjectModalProps) {
  const isNew = !project.id;
  const [client, setClient] = useState(project.client ?? "");
  const [name, setName] = useState(project.name ?? "");
  const [rate, setRate] = useState<number | string>(project.rate ?? 200);
  const [target, setTarget] = useState<number | string>(project.target ?? 10);
  const [note, setNote] = useState(project.note ?? "");
  const [color, setColor] = useState(
    project.color ?? PROJECT_COLORS[existingCount % PROJECT_COLORS.length]!,
  );

  const canSave = client.trim() !== "" && name.trim() !== "";

  const save = () => {
    if (!canSave) return;
    onSave({
      ...project,
      id: project.id ?? ("p" + Math.random().toString(36).slice(2, 8)),
      client: client.trim(),
      name: name.trim(),
      rate: Number(rate) || 0,
      target: Number(target) || 0,
      color,
      note,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <div className="eyebrow">{isNew ? "new project" : "edit project"}</div>
            <div className="title">{isNew ? "Open an engagement" : "Refine project"}</div>
          </div>
          <button onClick={onClose} aria-label="Close" className="muted">
            <div className="icon-x" />
          </button>
        </div>

        <div className="modal-body">
          <div className="field">
            <label>Client</label>
            <input
              autoFocus
              value={client}
              onChange={e => setClient(e.target.value)}
              placeholder="Halberd & Finch"
            />
          </div>

          <div className="field">
            <label>Project name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Brand Architecture Refresh"
            />
          </div>

          <div className="field-row">
            <div className="field">
              <label>Rate (USD / hour)</label>
              <input
                type="number"
                min="0"
                step="5"
                value={rate}
                onChange={e => setRate(e.target.value)}
              />
            </div>
            <div className="field">
              <label>Weekly target (hours)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={target}
                onChange={e => setTarget(e.target.value)}
              />
            </div>
          </div>

          <div className="field">
            <label>Tag colour</label>
            <div style={{ display: "flex", gap: 10, paddingTop: 6, flexWrap: "wrap" }}>
              {PROJECT_COLORS.map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  aria-label={c}
                  style={{
                    width: 26, height: 26, borderRadius: 999,
                    background: c,
                    border: color === c ? "2px solid var(--ink)" : "1px solid var(--rule)",
                    boxShadow: color === c ? "0 0 0 2px var(--paper)" : "none",
                    cursor: "pointer",
                    padding: 0,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="field">
            <label>Note · supports **bold** *italic* `code`</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Engagement scope, key contacts, etc."
            />
          </div>
        </div>

        <div className="modal-foot">
          {!isNew && project.id && (
            <button
              className="btn-ghost"
              onClick={() => {
                if (confirm("Delete this project and all its time entries?")) {
                  onDelete(project.id!);
                  onClose();
                }
              }}
              style={{ marginRight: "auto", color: "var(--accent)" }}
            >
              Delete project
            </button>
          )}
          <button className="btn-ghost" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary"
            onClick={save}
            disabled={!canSave}
            style={{ opacity: canSave ? 1 : 0.4, cursor: canSave ? "pointer" : "not-allowed" }}
          >
            {isNew ? "Open project" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
