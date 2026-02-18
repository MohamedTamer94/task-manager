import React, { useEffect, useMemo, useRef, useState } from "react";

const STATUS_OPTIONS = ["todo", "doing", "done"];
const PRIORITY_OPTIONS = ["low", "medium", "high"];

const initialForm = {
  title: "",
  description: "",
  status: "todo",
  priority: "medium",
  dueDate: "", // yyyy-mm-dd
};

export default function NewTaskDialog({ open, onClose, onSubmit }) {
  const dialogRef = useRef(null);
  const titleRef = useRef(null);

  const [form, setForm] = useState(initialForm);
  const [touched, setTouched] = useState({});

  // Open/close the native dialog based on `open`
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();
      // focus title after open
      setTimeout(() => titleRef.current?.focus(), 0);
    }

    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  // Reset form when opened/closed (optional: keep values if you prefer)
  useEffect(() => {
    if (open) {
      setForm(initialForm);
      setTouched({});
    }
  }, [open]);

  const errors = useMemo(() => {
    const e = {};
    const title = form.title.trim();
    if (!title) e.title = "Title is required.";
    if (title.length > 120) e.title = "Title is too long (max 120).";
    if (title && title.length < 3) e.title = "Title is too short (min 3)."
    return e;
  }, [form.title]);

  const isValid = Object.keys(errors).length === 0;

  function updateField(name, value) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function markTouched(name) {
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function handleCancel() {
    onClose?.();
  }

  function handleBackdropClose(e) {
    // Native dialog fires onCancel when pressing ESC.
    // This catches clicks outside the dialog content.
    if (e.target === dialogRef.current) onClose?.();
  }

  function handleSubmit(e) {
    e.preventDefault();
    // mark all touched to show errors if invalid
    setTouched({ title: true, status: true, priority: true, dueDate: true });

    if (!isValid) {
      titleRef.current?.focus();
      return;
    }

    onSubmit?.({
      title: form.title.trim(),
      description: form.description,
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate || "",
    });
    onClose?.();
  }

  return (
    <dialog
      ref={dialogRef}
      onClick={handleBackdropClose}
      onCancel={(e) => {
        e.preventDefault(); // keep control in React
        onClose?.();
      }}
      className="w-[min(560px,calc(100%-2rem))] rounded-xl border border-slate-200 p-0 shadow-xl backdrop:bg-black/30 m-auto"
      aria-labelledby="new-task-title"
    >
      <div className="rounded-xl bg-white">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4">
          <div>
            <h3 id="new-task-title" className="text-sm font-semibold text-slate-900">
              New task
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Fill the details below and create a task.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCancel}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-400"
            aria-label="Close dialog"
            title="Close"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4">
          {/* Title */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-700">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              ref={titleRef}
              value={form.title}
              onChange={(e) => updateField("title", e.target.value)}
              onBlur={() => markTouched("title")}
              className={[
                "mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2",
                touched.title && errors.title
                  ? "border-rose-300 focus:ring-rose-200"
                  : "border-slate-200 focus:ring-slate-400",
              ].join(" ")}
              placeholder="e.g., Prepare sprint demo"
              maxLength={120}
              aria-invalid={Boolean(touched.title && errors.title)}
              aria-describedby={touched.title && errors.title ? "title-error" : undefined}
            />
            {touched.title && errors.title ? (
              <p id="title-error" className="mt-2 text-xs text-rose-600">
                {errors.title}
              </p>
            ) : (
              <p className="mt-2 text-[11px] text-slate-400">
                Keep it short and action-oriented.
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-700">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => updateField("description", e.target.value)}
              onBlur={() => markTouched("description")}
              className={
                "mt-2 w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2"}
              aria-describedby={touched.description || undefined}
            />
          </div>

          {/* Row: Status + Priority */}
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium text-slate-700">Status</label>
              <select
                value={form.status}
                onChange={(e) => updateField("status", e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => updateField("priority", e.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p} className="capitalize">
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div className="mb-6">
            <label className="block text-xs font-medium text-slate-700">Due date</label>
            <input
              type="date"
              value={form.dueDate}
              onChange={(e) => updateField("dueDate", e.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-slate-400"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-slate-400"
            >
              Create task
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
