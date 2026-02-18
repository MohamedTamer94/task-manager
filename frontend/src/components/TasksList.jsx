import React, { useMemo, useState } from "react";

/**
 * Base TaskLists component (JSX + Tailwind)
 * - Columns: Title, Status, Priority, Due Date, Delete
 * - Inline edits for all fields
 * - Keyboard friendly (Enter to save title, Esc to cancel title)
 * - No external deps
 */

const STATUS_OPTIONS = ["Todo", "In Progress", "Done"];
const PRIORITY_OPTIONS = ["Low", "Medium", "High"];

const badge = {
  status: {
    Todo: "bg-slate-100 text-slate-700 ring-slate-200",
    "In Progress": "bg-blue-50 text-blue-700 ring-blue-200",
    Done: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  priority: {
    Low: "bg-slate-100 text-slate-700 ring-slate-200",
    Medium: "bg-amber-50 text-amber-800 ring-amber-200",
    High: "bg-rose-50 text-rose-700 ring-rose-200",
  },
};

function classNames(...xs) {
  return xs.filter(Boolean).join(" ");
}

function formatDate(iso) {
  if (!iso) return "";
  // Expect yyyy-mm-dd; keep it simple and stable
  return iso;
}

export default function TaskLists() {
  const [tasks, setTasks] = useState([
    {
      id: "t1",
      title: "Write project brief",
      status: "Todo",
      priority: "High",
      dueDate: "2026-02-25",
    },
    {
      id: "t2",
      title: "Create wireframes",
      status: "In Progress",
      priority: "Medium",
      dueDate: "2026-02-28",
    },
    {
      id: "t3",
      title: "Ship v1",
      status: "Done",
      priority: "Low",
      dueDate: "2026-03-05",
    },
  ]);

  // For inline title editing (input UX)
  const [editingTitleId, setEditingTitleId] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");

  const sortedTasks = useMemo(() => tasks, [tasks]);

  function updateTask(id, patch) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...patch } : t))
    );
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  function startEditTitle(task) {
    setEditingTitleId(task.id);
    setDraftTitle(task.title ?? "");
  }

  function commitTitle(id) {
    const next = draftTitle.trim();
    updateTask(id, { title: next });
    setEditingTitleId(null);
    setDraftTitle("");
  }

  function cancelTitle() {
    setEditingTitleId(null);
    setDraftTitle("");
  }

  return (
    <div className="w-full">
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Tasks</h2>
            <p className="text-xs text-slate-500">
              Click a field to edit inline.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            onClick={() => {
              const id = crypto?.randomUUID?.() ?? String(Date.now());
              setTasks((prev) => [
                {
                  id,
                  title: "New task",
                  status: "Todo",
                  priority: "Medium",
                  dueDate: "",
                },
                ...prev,
              ]);
            }}
          >
            <span className="text-base leading-none">+</span>
            Add task
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-[760px] w-full table-fixed">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-600">
                <th className="w-[40%] px-4 py-3">Title</th>
                <th className="w-[18%] px-4 py-3">Status</th>
                <th className="w-[18%] px-4 py-3">Priority</th>
                <th className="w-[18%] px-4 py-3">Due date</th>
                <th className="w-[6%] px-4 py-3 text-right"> </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {sortedTasks.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-sm text-slate-500"
                  >
                    No tasks yet.
                  </td>
                </tr>
              ) : (
                sortedTasks.map((task) => {
                  const isEditingTitle = editingTitleId === task.id;

                  return (
                    <tr key={task.id} className="hover:bg-slate-50/50">
                      {/* Title */}
                      <td className="px-4 py-3 align-middle">
                        {isEditingTitle ? (
                          <input
                            autoFocus
                            value={draftTitle}
                            onChange={(e) => setDraftTitle(e.target.value)}
                            onBlur={() => commitTitle(task.id)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") commitTitle(task.id);
                              if (e.key === "Escape") cancelTitle();
                            }}
                            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
                            aria-label={`Edit title for ${task.title}`}
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => startEditTitle(task)}
                            className="group flex w-full items-center justify-between gap-3 rounded-lg px-2 py-2 text-left text-sm text-slate-900 hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
                            title="Click to edit"
                          >
                            <span className="truncate">{task.title}</span>
                            <span className="shrink-0 text-xs text-slate-400 opacity-0 transition group-hover:opacity-100">
                              Edit
                            </span>
                          </button>
                        )}
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3 align-middle">

                          <select
                            value={task.status}
                            onChange={(e) =>
                              updateTask(task.id, { status: e.target.value })
                            }
                            className="ml-auto w-[140px] rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
                            aria-label={`Status for ${task.title}`}
                          >
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s}
                              </option>
                            ))}
                          </select>
                      </td>

                      {/* Priority */}
                      <td className="px-4 py-3 align-middle">
                          <select
                            value={task.priority}
                            onChange={(e) =>
                              updateTask(task.id, { priority: e.target.value })
                            }
                            className="ml-auto w-[140px] rounded-lg border border-slate-200 bg-white px-2 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
                            aria-label={`Priority for ${task.title}`}
                          >
                            {PRIORITY_OPTIONS.map((p) => (
                              <option key={p} value={p}>
                                {p}
                              </option>
                            ))}
                          </select>
                      </td>

                      {/* Due date */}
                      <td className="px-4 py-3 align-middle">
                        <input
                          type="date"
                          value={formatDate(task.dueDate)}
                          onChange={(e) =>
                            updateTask(task.id, { dueDate: e.target.value })
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
                          aria-label={`Due date for ${task.title}`}
                        />
                      </td>

                      {/* Delete */}
                      <td className="px-4 py-3 align-middle">
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => deleteTask(task.id)}
                            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
                            aria-label={`Delete ${task.title}`}
                            title="Delete"
                          >
                            {/* Trash icon */}
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="h-5 w-5"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0H7m3-3h4a1 1 0 011 1v2H9V5a1 1 0 011-1z"
                              />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-3 text-xs text-slate-500">
          <span>{tasks.length} task{tasks.length === 1 ? "" : "s"}</span>
          <span className="hidden sm:inline">
            Tip: Title edit supports <kbd className="rounded bg-slate-100 px-1">Enter</kbd> /{" "}
            <kbd className="rounded bg-slate-100 px-1">Esc</kbd>.
          </span>
        </div>
      </div>
    </div>
  );
}
