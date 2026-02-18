import React, { useEffect, useRef, useState } from "react";

const STATUS_OPTIONS = ["todo", "doing", "done"];
const PRIORITY_OPTIONS = ["low", "medium", "high"];

/**
 * TaskFilters
 *
 * Props:
 *   onFilterChange({ search, status, priority, dateFrom, dateTo })
 *
 * Calls onFilterChange whenever any filter changes.
 * Search is debounced by `debounceMs` (default 350ms).
 */
export default function TaskFilters({ onFilterChange, debounceMs = 350 }) {
    const [search, setSearch] = useState("");
    const [status, setStatus] = useState("");
    const [priority, setPriority] = useState(""); // [] = all
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // Debounce search
    const debounceTimer = useRef(null);
    const latestFilters = useRef({});

    function emitChange(overrides = {}) {
        const next = {
            search,
            status,
            priority,
            dateFrom,
            dateTo,
            ...overrides,
        };
        latestFilters.current = next;
        onFilterChange(next);
    }

    // Debounced search emit
    function handleSearchChange(value) {
        setSearch(value);
        clearTimeout(debounceTimer.current);
        debounceTimer.current = setTimeout(() => {
            emitChange({ search: value });
        }, debounceMs);
    }

    function toggleStatusChip(type) {
        if (type === status) {
            setStatus("")
            emitChange({status: ""})
        } else {
            setStatus(type)
            emitChange({status: type})
        }
    }

    function togglePriorityChip(type) {
        if (type === priority) {
            setPriority("")
            emitChange({priority: ""})
        } else {
            setPriority(type)
             emitChange({priority: type})
        }
       
    }

    // Cleanup on unmount
    useEffect(() => () => clearTimeout(debounceTimer.current), []);

    function handleDateFrom(value) {
        setDateFrom(value);
        emitChange({ dateFrom: value });
    }

    function handleDateTo(value) {
        setDateTo(value);
        emitChange({ dateTo: value });
    }

    function hasActiveFilters() {
        return search || status || priority || dateFrom || dateTo;
    }

    function clearAll() {
        setSearch("");
        setStatus("");
        setPriority("");
        setDateFrom("");
        setDateTo("");
        clearTimeout(debounceTimer.current);
        onFilterChange({ search: "", status: "", priority: "", dateFrom: "", dateTo: "" });
    }

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm px-4 py-3 flex flex-col gap-3">
            {/* Row 1: Search + Clear */}
            <div className="flex items-center gap-2">
                {/* Search */}
                <div className="relative flex-1">
                    <svg
                        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
                        viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                    >
                        <circle cx="11" cy="11" r="8" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                    </svg>
                    <input
                        type="text"
                        placeholder="Search tasks…"
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => handleSearchChange("")}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            aria-label="Clear search"
                        >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Clear all filters */}
                {hasActiveFilters() && (
                    <button
                        type="button"
                        onClick={clearAll}
                        className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {/* Row 2: Status chips + Priority chips + Date range */}
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                {/* Status */}
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-500 shrink-0">Status</span>
                    <div className="flex gap-1">
                        {STATUS_OPTIONS.map((s) => (
                            <Chip
                                key={s}
                                label={s}
                                active={status === s}
                                onClick={() => toggleStatusChip(s)}
                            />
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="hidden sm:block h-4 w-px bg-slate-200" />

                {/* Priority */}
                <div className="flex items-center gap-1.5">
                    <span className="text-xs font-medium text-slate-500 shrink-0">Priority</span>
                    <div className="flex gap-1">
                        {PRIORITY_OPTIONS.map((p) => (
                            <Chip
                                key={p}
                                label={p}
                                active={priority === p}
                                onClick={() => togglePriorityChip(p)}
                                colorClass={priorityColor(p)}
                            />
                        ))}
                    </div>
                </div>

                {/* Divider */}
                <div className="hidden sm:block h-4 w-px bg-slate-200" />

                {/* Date range */}
                <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs font-medium text-slate-500 shrink-0">Due date</span>
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => handleDateFrom(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition"
                        aria-label="Due date from"
                        title="From"
                    />
                    <span className="text-xs text-slate-400">–</span>
                    <input
                        type="date"
                        value={dateTo}
                        min={dateFrom || undefined}
                        onChange={(e) => handleDateTo(e.target.value)}
                        className="rounded-lg border border-slate-200 bg-slate-50 px-2 py-1.5 text-xs text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-200 transition"
                        aria-label="Due date to"
                        title="To"
                    />
                </div>
            </div>
        </div>
    );
}

function Chip({ label, active, onClick, colorClass }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={[
                "capitalize rounded-full border px-2.5 py-0.5 text-xs font-medium transition",
                active
                    ? colorClass
                        ? colorClass
                        : "border-slate-800 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
            ].join(" ")}
        >
            {label}
        </button>
    );
}

function priorityColor(p) {
    return {
        low: "border-sky-400 bg-sky-500 text-white",
        medium: "border-amber-400 bg-amber-500 text-white",
        high: "border-rose-400 bg-rose-500 text-white",
    }[p];
}