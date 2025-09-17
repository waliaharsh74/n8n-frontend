import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ReactFlow, {
  addEdge,
  Background,
  Controls,

  Handle,

  Position,
  useEdgesState,
  useNodesState,
  MarkerType,
} from "reactflow";
import type{  Connection,
  Edge,
  Node,  NodeProps,
  OnConnect,} from "reactflow";
import "reactflow/dist/style.css";
import classNames from "classnames";

/** ---------- Types ---------- */
type NodeKind =
  | "trigger.manual"
  | "trigger.webhook"
  | "trigger.cron"
  | "trigger.form"
  | "action.telegram"
  | "action.email"
  | "action.llm"
  | "logic.if";

type AnyData = Record<string, any>;

type RFN = Node<AnyData>;
type RFE = Edge<{ condition?: "true" | "false" }>;

const STORAGE_KEY = "wf.reactflow";

/** ---------- Node components ---------- */
const NodeBase: React.FC<
  NodeProps & { title: string; tint: string; inputs?: boolean; outputs?: number }
> = ({ id, selected, data, title, tint, inputs = true, outputs = 1 }) => {
  return (
    <div
      className={classNames(
        "rounded-xl border shadow-sm px-3 py-2 min-w-[180px]",
        selected ? "ring-2 ring-blue-400" : "",
      )}
      style={{ background: tint }}
    >
      {inputs && <Handle type="target" position={Position.Left} />}
      <div className="text-xs uppercase tracking-wide opacity-70">{title}</div>
      <div className="font-semibold text-sm break-words">{data?.label ?? id}</div>
      <div className="text-[11px] opacity-70 mt-1">
        {Object.keys(data || {}).length ? JSON.stringify(data) : "—"}
      </div>
      {Array.from({ length: outputs }).map((_, i) => (
        <Handle
          key={i}
          type="source"
          position={Position.Right}
          id={String(i)}
          style={{ top: 22 + i * 16 }}
        />
      ))}
    </div>
  );
};

const TriggerNode: React.FC<NodeProps<AnyData>> = (p) => (
  <NodeBase {...p} title="Trigger" tint="#f2fbff" inputs={false} outputs={1} />
);

const ActionNode: React.FC<NodeProps<AnyData>> = (p) => (
  <NodeBase {...p} title="Action" tint="#fff7f0" inputs={true} outputs={1} />
);

const IfNode: React.FC<NodeProps<AnyData>> = (p) => (
  <NodeBase {...p} title="IF" tint="#f7fff2" inputs={true} outputs={2} />
);

/** ---------- Node registry ---------- */
const nodeTypes = {
  "trigger.manual": TriggerNode,
  "trigger.webhook": TriggerNode,
  "trigger.cron": TriggerNode,
  "trigger.form": TriggerNode,

  "action.telegram": ActionNode,
  "action.email": ActionNode,
  "action.llm": ActionNode,

  "logic.if": IfNode,
};

/** ---------- Helpers ---------- */
const makeId = () => Math.random().toString(36).slice(2, 9);

const DEFAULT_POSITION = { x: 200, y: 150 };

function saveLocal(nodes: RFN[], edges: RFE[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }));
}
function loadLocal(): { nodes: RFN[]; edges: RFE[] } | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return { nodes: parsed.nodes ?? [], edges: parsed.edges ?? [] };
  } catch {
    return null;
  }
}

/** ---------- Palette ---------- */
const palette: { group: "Triggers" | "Actions" | "Logic"; label: string; type: NodeKind }[] = [
  { group: "Triggers", label: "Manual", type: "trigger.manual" },
  { group: "Triggers", label: "Webhook", type: "trigger.webhook" },
  { group: "Triggers", label: "Cron", type: "trigger.cron" },
  { group: "Triggers", label: "Form submission", type: "trigger.form" },

  { group: "Actions", label: "Telegram", type: "action.telegram" },
  { group: "Actions", label: "Email (Resend)", type: "action.email" },
  { group: "Actions", label: "LLM Response", type: "action.llm" },

  { group: "Logic", label: "IF", type: "logic.if" },
];

/** ---------- App ---------- */
export default function WorkFlowUI() {
  const initial = loadLocal() ?? { nodes: [], edges: [] };

  const [nodes, setNodes, onNodesChange] = useNodesState<AnyData>(initial.nodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<RFE>(initial.edges);
  const [selected, setSelected] = useState<RFN | null>(null);
  const [openAdd, setOpenAdd] = useState(false);

  // persist
  useEffect(() => {
    const id = setTimeout(() => saveLocal(nodes, edges), 400);
    return () => clearTimeout(id);
  }, [nodes, edges]);

  // add node
  const addNode = useCallback(
    (type: NodeKind) => {
      const n: RFN = {
        id: makeId(),
        type,
        position: {
          x: DEFAULT_POSITION.x + Math.random() * 80,
          y: DEFAULT_POSITION.y + Math.random() * 60,
        },
        data: { label: type.split(".").pop() },
      };
      setNodes((nds) => nds.concat(n));
      setOpenAdd(false);
    },
    [setNodes],
  );

  // edge connect (IF → labeled true/false)
  const onConnect: OnConnect = useCallback(
    (conn: Connection) => {
      const src = nodes.find((n) => n.id === conn.source);
      const isIf = src?.type === "logic.if";
      let label: "true" | "false" | undefined;

      if (isIf) {
        const ans = prompt("Edge condition? (true/false)", "true")?.trim().toLowerCase();
        if (ans === "true" || ans === "false") label = ans;
      }

      setEdges((eds) =>
        addEdge<RFE>(
          {
            ...conn,
            type: isIf ? "default" : "default",
            data: label ? { condition: label } : undefined,
            markerEnd: { type: MarkerType.ArrowClosed },
            label: label,
          },
          eds,
        ),
      );
    },
    [nodes, setEdges],
  );

  // selection
  const onSelectionChange = useCallback(
    ({ nodes: ns }: { nodes: RFN[]; edges: RFE[] }) => setSelected(ns[0] ?? null),
    [],
  );

  // inline inspector (right)
  const updateSelected = useCallback(
    (patch: AnyData) => {
      if (!selected) return;
      setNodes((nds) =>
        nds.map((n) => (n.id === selected.id ? { ...n, data: { ...n.data, ...patch } } : n)),
      );
    },
    [selected, setNodes],
  );

  // empty state
  const showEmpty = nodes.length === 0;

  return (
    <div style={{ height: "100vh", width: "100vw", display: "grid", gridTemplateColumns: "260px 1fr 300px" }}>
      {/* LEFT PALETTE */}
      <aside style={{ borderRight: "1px solid #eee", padding: 12, overflowY: "auto" }}>
        <div className="flex items-center justify-between mb-2">
          <h3 style={{ fontWeight: 700 }}>Steps</h3>
          <button onClick={() => setOpenAdd((v) => !v)} className="px-2 py-1 text-sm border rounded">
            +
          </button>
        </div>

        {openAdd && (
          <div style={{ border: "1px solid #eee", borderRadius: 8, padding: 8, marginBottom: 8 }}>
            {(["Triggers", "Actions", "Logic"] as const).map((group) => (
              <div key={group} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>{group}</div>
                {palette
                  .filter((p) => p.group === group)
                  .map((p) => (
                    <button
                      key={p.type}
                      onClick={() => addNode(p.type)}
                      className="block w-full text-left text-sm px-2 py-1 hover:bg-gray-50 rounded"
                      style={{ marginBottom: 4 }}
                    >
                      {p.label}
                    </button>
                  ))}
              </div>
            ))}
          </div>
        )}

        <div style={{ fontSize: 12, opacity: 0.7 }}>
          Tip: connect from IF to create <b>true/false</b> branches.
        </div>
      </aside>

      {/* CANVAS */}
      <main>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          onSelectionChange={onSelectionChange}
          fitView
        >
          <Background />
          <Controls />
        </ReactFlow>

        {showEmpty && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "grid",
              placeItems: "center",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                background: "white",
                border: "1px dashed #ccc",
                padding: 16,
                borderRadius: 12,
                pointerEvents: "auto",
              }}
            >
              <div style={{ fontWeight: 700, marginBottom: 6 }}>Add first step…</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>Click the <b>+</b> on the left.</div>
            </div>
          </div>
        )}
      </main>

      {/* INSPECTOR */}
      <aside style={{ borderLeft: "1px solid #eee", padding: 12 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Inspector</h3>
        {!selected && <div style={{ fontSize: 12, opacity: 0.7 }}>Select a node.</div>}
        {selected && (
          <div style={{ display: "grid", gap: 8 }}>
            <div>
              <div className="text-xs opacity-70">ID</div>
              <div className="text-sm">{selected.id}</div>
            </div>

            <div>
              <div className="text-xs opacity-70">Type</div>
              <div className="text-sm">{selected.type}</div>
            </div>

            <label className="text-sm">
              Label
              <input
                className="block w-full border rounded px-2 py-1"
                value={selected.data?.label ?? ""}
                onChange={(e) => updateSelected({ label: e.target.value })}
              />
            </label>

            {/* Minimal per-type fields */}
            {selected.type === "action.email" && (
              <>
                <label className="text-sm">
                  To
                  <input
                    className="block w-full border rounded px-2 py-1"
                    value={selected.data?.to ?? ""}
                    onChange={(e) => updateSelected({ to: e.target.value })}
                  />
                </label>
                <label className="text-sm">
                  Subject
                  <input
                    className="block w-full border rounded px-2 py-1"
                    value={selected.data?.subject ?? ""}
                    onChange={(e) => updateSelected({ subject: e.target.value })}
                  />
                </label>
              </>
            )}

            {selected.type === "logic.if" && (
              <label className="text-sm">
                Expression (read-only here)
                <input
                  className="block w-full border rounded px-2 py-1"
                  placeholder={`e.g., ctx.user.role === "manager"`}
                  value={selected.data?.expr ?? ""}
                  onChange={(e) => updateSelected({ expr: e.target.value })}
                />
              </label>
            )}
          </div>
        )}
      </aside>
    </div>
  );
}
