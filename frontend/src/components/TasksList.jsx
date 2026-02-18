import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient, keepPreviousData  } from '@tanstack/react-query';
import { formatDate } from '../utils/utils';
import { listTasks } from '../api/tasks.api';
import Pagination from '../components/Pagination';
import NewTaskDialog from '../components/NewTaskDialog';
import TaskFilters from './TaskFilter';
import { createTask, updateTask as updateTaskApi, deleteTask as deleteTaskApi } from "../api/tasks.api";

const STATUS_OPTIONS  = ["todo", "doing", "done"];
const PRIORITY_OPTIONS = ["low", "medium", "high"];

function TrashIcon() {
    return (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M9 7h6m2 0H7m3-3h4a1 1 0 011 1v2H9V5a1 1 0 011-1z" />
        </svg>
    );
}

export default function TaskLists() {
    const [isNewOpen, setIsNewOpen]       = useState(false);
    const [page, setPage]                 = useState(1);
    const [limit, setLimit]               = useState(20);
    const [editingTitleId, setEditingTitleId] = useState(null);
    const [draftTitle, setDraftTitle]     = useState("");
    const queryClient = useQueryClient();

    const [filters, setFilters] = useState({
        search: "", status: "", priority: "", dateFrom: "", dateTo: "",
    });

    const { data, isLoading, error } = useQuery({
        queryKey: ['tasks', { page, limit, ...filters }],
        queryFn: () => listTasks({
            page, limit,
            ...(filters.search   ? { q: filters.search }         : {}),
            ...(filters.status   ? { status: filters.status }     : {}),
            ...(filters.priority ? { priority: filters.priority } : {}),
            ...(filters.dateFrom ? { from: filters.dateFrom }     : {}),
            ...(filters.dateTo   ? { to: filters.dateTo }         : {}),
        }),
        placeholderData: keepPreviousData,
        staleTime: 10_000,
    });

    const createMutation = useMutation({
        mutationFn: (payload) => createTask(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tasks"] });
            setPage(1);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, patch }) => updateTaskApi(id, patch),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => deleteTaskApi(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["tasks"] }),
    });

    const isMutating = updateMutation.isPending || deleteMutation.isPending;
    const tasks      = data?.data ?? [];
    const meta       = data?.meta ?? {};
    const totalItems = meta.total ?? 0;
    const totalPages = meta.pages;
    const isEmpty    = !isLoading && tasks.length === 0;

    function updateTask(id, patch) { updateMutation.mutate({ id, patch }); }

    function deleteTask(id) {
        if (!confirm("Delete this task?")) return;
        deleteMutation.mutate(id);
    }

    function startEditTitle(task) {
        setEditingTitleId(task.id);
        setDraftTitle(task.title ?? "");
    }

    function commitTitle(id) {
        const next = draftTitle.trim();
        if (next) updateTask(id, { title: next });
        setEditingTitleId(null);
        setDraftTitle("");
    }

    function cancelTitle() {
        setEditingTitleId(null);
        setDraftTitle("");
    }

    function onPageChange(nextPage) {
        setPage(Math.max(1, Math.min(nextPage, totalPages || 1)));
    }

    function onlimitChange(nextSize) {
        setLimit(nextSize);
        setPage(1);
    }

    function handleFilterChange(next) {
        setFilters(next);
        setPage(1);
    }

    if (error) {
        return (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                Failed to load tasks: {error.message}
            </div>
        );
    }

    return (
        <div className="w-full flex flex-col gap-3">
            {/* Filters */}
            <TaskFilters onFilterChange={handleFilterChange} />

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3">
                    <div>
                        <h2 className="text-sm font-semibold text-slate-900">Tasks</h2>
                        <p className="text-xs text-slate-500">
                            {isLoading
                                ? "Loading…"
                                : totalItems > 0
                                    ? `${totalItems} task${totalItems !== 1 ? "s" : ""}`
                                    : "No tasks found"}
                        </p>
                    </div>

                    <button
                        type="button"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 transition-colors"
                        onClick={() => setIsNewOpen(true)}
                    >
                        <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
                        <span className="hidden xs:inline">Add task</span>
                        <span className="xs:hidden">Add</span>
                    </button>
                </div>

                {/* ── DESKTOP TABLE ── */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full table-fixed">
                        <colgroup>
                            <col className="w-[40%]" />
                            <col className="w-[16%]" />
                            <col className="w-[16%]" />
                            <col className="w-[20%]" />
                            <col className="w-[8%]" />
                        </colgroup>
                        <thead>
                            <tr className="bg-slate-50 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400 border-b border-slate-100">
                                <th className="px-4 py-3">Title</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Priority</th>
                                <th className="px-4 py-3">Due date</th>
                                <th className="px-4 py-3" />
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <TableSkeletonRows />
                            ) : isEmpty ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-14 text-center">
                                        <EmptyState />
                                    </td>
                                </tr>
                            ) : (
                                tasks.map((task) => (
                                    <DesktopRow
                                        key={task.id}
                                        task={task}
                                        isMutating={isMutating}
                                        isEditingTitle={editingTitleId === task.id}
                                        draftTitle={draftTitle}
                                        onDraftChange={setDraftTitle}
                                        onStartEdit={startEditTitle}
                                        onCommit={commitTitle}
                                        onCancel={cancelTitle}
                                        onUpdate={updateTask}
                                        onDelete={deleteTask}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* ── MOBILE CARD LIST ── */}
                <div className="sm:hidden divide-y divide-slate-100">
                    {isLoading ? (
                        <MobileSkeletonCards />
                    ) : isEmpty ? (
                        <div className="px-4 py-14">
                            <EmptyState />
                        </div>
                    ) : (
                        tasks.map((task) => (
                            <MobileCard
                                key={task.id}
                                task={task}
                                isMutating={isMutating}
                                isEditingTitle={editingTitleId === task.id}
                                draftTitle={draftTitle}
                                onDraftChange={setDraftTitle}
                                onStartEdit={startEditTitle}
                                onCommit={commitTitle}
                                onCancel={cancelTitle}
                                onUpdate={updateTask}
                                onDelete={deleteTask}
                            />
                        ))
                    )}
                </div>

                {/* Pagination — only when there's data */}
                {!isLoading && !isEmpty && (
                    <div className="border-t border-slate-200 px-4 py-3">
                        <Pagination
                            page={page}
                            limit={limit}
                            totalItems={totalItems}
                            totalPages={totalPages}
                            onPageChange={onPageChange}
                            onlimitChange={onlimitChange}
                        />
                    </div>
                )}
            </div>

            <NewTaskDialog
                open={isNewOpen}
                onClose={() => setIsNewOpen(false)}
                onSubmit={(payload) => createMutation.mutate(payload)}
            />

            {createMutation.isError && (
                <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                    {createMutation.error?.message || "Failed to create task. Please try again."}
                </div>
            )}
        </div>
    );
}

// ─── Desktop row ──────────────────────────────────────────────────────────

function DesktopRow({
    task, isMutating,
    isEditingTitle, draftTitle, onDraftChange,
    onStartEdit, onCommit, onCancel,
    onUpdate, onDelete,
}) {
    const selectCls = "w-full capitalize rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:opacity-50 transition";

    return (
        <tr className="group hover:bg-slate-50/60 transition-colors">
            {/* Title */}
            <td className="px-4 py-2.5 align-middle">
                {isEditingTitle ? (
                    <input
                        autoFocus
                        value={draftTitle}
                        onChange={(e) => onDraftChange(e.target.value)}
                        onBlur={() => onCommit(task.id)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter")  onCommit(task.id);
                            if (e.key === "Escape") onCancel();
                        }}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        aria-label={`Edit title for ${task.title}`}
                    />
                ) : (
                    <button
                        type="button"
                        onClick={() => onStartEdit(task)}
                        className="group/title flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300 transition-colors"
                    >
                        <span className="truncate flex-1">{task.title}</span>
                        <svg className="h-3 w-3 shrink-0 text-slate-300 opacity-0 group-hover/title:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 012.828 2.828L11.828 15.828a4 4 0 01-2.828 1.172H7v-2a4 4 0 011.172-2.828z" />
                        </svg>
                    </button>
                )}
            </td>

            {/* Status */}
            <td className="px-4 py-2.5 align-middle">
                <select
                    value={task.status}
                    disabled={isMutating}
                    onChange={(e) => onUpdate(task.id, { status: e.target.value })}
                    className={selectCls}
                    aria-label={`Status for ${task.title}`}
                >
                    {STATUS_OPTIONS.map((s) => (
                        <option className="capitalize" key={s} value={s}>{s}</option>
                    ))}
                </select>
            </td>

            {/* Priority */}
            <td className="px-4 py-2.5 align-middle">
                <select
                    value={task.priority}
                    disabled={isMutating}
                    onChange={(e) => onUpdate(task.id, { priority: e.target.value })}
                    className={selectCls}
                    aria-label={`Priority for ${task.title}`}
                >
                    {PRIORITY_OPTIONS.map((p) => (
                        <option className="capitalize" key={p} value={p}>{p}</option>
                    ))}
                </select>
            </td>

            {/* Due date */}
            <td className="px-4 py-2.5 align-middle">
                <input
                    type="date"
                    value={formatDate(task.dueDate)}
                    onChange={(e) => onUpdate(task.id, { dueDate: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition"
                    aria-label={`Due date for ${task.title}`}
                />
            </td>

            {/* Delete */}
            <td className="px-4 py-2.5 align-middle">
                <div className="flex justify-end">
                    <button
                        type="button"
                        onClick={() => onDelete(task.id)}
                        disabled={isMutating}
                        className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:opacity-40 transition-colors"
                        aria-label={`Delete ${task.title}`}
                        title="Delete task"
                    >
                        <TrashIcon />
                    </button>
                </div>
            </td>
        </tr>
    );
}

// ─── Mobile card ──────────────────────────────────────────────────────────

function MobileCard({
    task, isMutating,
    isEditingTitle, draftTitle, onDraftChange,
    onStartEdit, onCommit, onCancel,
    onUpdate, onDelete,
}) {
    const selectCls = "w-full capitalize rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 disabled:opacity-50";

    return (
        <div className="px-4 py-3 flex flex-col gap-2.5">
            {/* Title + delete */}
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                    {isEditingTitle ? (
                        <input
                            autoFocus
                            value={draftTitle}
                            onChange={(e) => onDraftChange(e.target.value)}
                            onBlur={() => onCommit(task.id)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter")  onCommit(task.id);
                                if (e.key === "Escape") onCancel();
                            }}
                            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => onStartEdit(task)}
                            className="text-left text-sm font-medium text-slate-900 leading-snug w-full truncate hover:text-slate-600 transition-colors"
                        >
                            {task.title}
                        </button>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => onDelete(task.id)}
                    disabled={isMutating}
                    className="shrink-0 inline-flex items-center justify-center rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-300 disabled:opacity-40 transition-colors"
                    aria-label={`Delete ${task.title}`}
                >
                    <TrashIcon />
                </button>
            </div>

            {/* Status / Priority / Due date */}
            <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Status</span>
                    <select
                        value={task.status}
                        disabled={isMutating}
                        onChange={(e) => onUpdate(task.id, { status: e.target.value })}
                        className={selectCls}
                        aria-label={`Status for ${task.title}`}
                    >
                        {STATUS_OPTIONS.map((s) => (
                            <option className="capitalize" key={s} value={s}>{s}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Priority</span>
                    <select
                        value={task.priority}
                        disabled={isMutating}
                        onChange={(e) => onUpdate(task.id, { priority: e.target.value })}
                        className={selectCls}
                        aria-label={`Priority for ${task.title}`}
                    >
                        {PRIORITY_OPTIONS.map((p) => (
                            <option className="capitalize" key={p} value={p}>{p}</option>
                        ))}
                    </select>
                </div>

                <div className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Due date</span>
                    <input
                        type="date"
                        value={formatDate(task.dueDate)}
                        onChange={(e) => onUpdate(task.id, { dueDate: e.target.value })}
                        className="w-full rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200"
                        aria-label={`Due date for ${task.title}`}
                    />
                </div>
            </div>
        </div>
    );
}

// ─── Skeleton loaders ─────────────────────────────────────────────────────

function TableSkeletonRows() {
    return Array.from({ length: 5 }).map((_, i) => (
        <tr key={i} className="animate-pulse">
            <td className="px-4 py-3.5"><div className="h-3.5 w-3/4 rounded-full bg-slate-100" /></td>
            <td className="px-4 py-3.5"><div className="h-3.5 w-16 rounded-full bg-slate-100" /></td>
            <td className="px-4 py-3.5"><div className="h-3.5 w-14 rounded-full bg-slate-100" /></td>
            <td className="px-4 py-3.5"><div className="h-3.5 w-24 rounded-full bg-slate-100" /></td>
            <td />
        </tr>
    ));
}

function MobileSkeletonCards() {
    return Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="px-4 py-3 flex flex-col gap-2.5 animate-pulse">
            <div className="h-4 w-2/3 rounded-full bg-slate-100" />
            <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="h-8 rounded-lg bg-slate-100" />
                ))}
            </div>
        </div>
    ));
}

// ─── Empty state ──────────────────────────────────────────────────────────

function EmptyState() {
    return (
        <div className="flex flex-col items-center gap-2 text-slate-400">
            <svg className="h-8 w-8 text-slate-200" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm text-slate-400">No tasks found</p>
        </div>
    );
}