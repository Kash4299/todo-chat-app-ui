"use client";

import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateView";
import {
    Plus,
    Trash2,
    Check,
    Circle,
    ListFilter,
    Flag,
    BarChart3,
    Sparkles,
} from "lucide-react";

interface Todo {
    id: string;
    text: string;
    completed: boolean;
    priority: "low" | "medium" | "high";
    createdAt: number;
}

type Filter = "all" | "active" | "completed";

const priorityConfig = {
    low: { label: "Low", color: "text-primary", bg: "bg-primary/10", border: "border-primary/30" },
    medium: { label: "Med", color: "text-warning", bg: "bg-warning/10", border: "border-warning/30" },
    high: { label: "High", color: "text-danger", bg: "bg-danger/10", border: "border-danger/30" },
};

export default function TodosPage() {
    const { user, loading } = useAuth();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [input, setInput] = useState("");
    const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");
    const [filter, setFilter] = useState<Filter>("all");
    const [mounted, setMounted] = useState(false);
    const [loadError, setLoadError] = useState("");

    const storageKey = user?.id ? `todochat_todos_${user.id}` : "";

    useEffect(() => {
        if (!storageKey) return;

        const timeout = window.setTimeout(() => {
            try {
                const stored = localStorage.getItem(storageKey);
                if (stored) setTodos(JSON.parse(stored));
            } catch {
                setLoadError("Could not load saved todos.");
            }
            setMounted(true);
        }, 0);

        return () => window.clearTimeout(timeout);
    }, [storageKey]);

    useEffect(() => {
        if (mounted && storageKey) {
            localStorage.setItem(storageKey, JSON.stringify(todos));
        }
    }, [todos, storageKey, mounted]);

    const addTodo = () => {
        const trimmed = input.trim();
        if (!trimmed) return;

        const newTodo: Todo = {
            id: Date.now().toString(36) + Math.random().toString(36).substring(2),
            text: trimmed,
            completed: false,
            priority,
            createdAt: Date.now(),
        };

        setTodos((prev) => [newTodo, ...prev]);
        setInput("");
    };

    const toggleTodo = (id: string) => {
        setTodos((prev) =>
            prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
        );
    };

    const deleteTodo = (id: string) => {
        setTodos((prev) => prev.filter((t) => t.id !== id));
    };

    const filtered = useMemo(() => {
        switch (filter) {
            case "active":
                return todos.filter((t) => !t.completed);
            case "completed":
                return todos.filter((t) => t.completed);
            default:
                return todos;
        }
    }, [todos, filter]);

    const stats = useMemo(() => {
        const total = todos.length;
        const completed = todos.filter((t) => t.completed).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { total, completed, active: total - completed, percentage };
    }, [todos]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") addTodo();
    };

    if (loading || !mounted) {
        return <LoadingState title="Loading todos" />;
    }

    return (
        <div className="p-6 lg:p-8 max-w-4xl mx-auto animate-fade-in">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-text flex items-center gap-3">
                    <Sparkles className="w-8 h-8 text-primary" />
                    My Todos
                </h1>
                <p className="text-text-muted mt-1">Stay organized, get things done</p>
            </div>

            {/* Stats Bar */}
            <div className="bg-surface border border-border rounded-2xl p-5 mb-6">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-text-muted text-sm">
                        <BarChart3 className="w-4 h-4" />
                        <span>Progress</span>
                    </div>
                    <span className="text-sm font-semibold text-text">
                        {stats.completed}/{stats.total} completed
                    </span>
                </div>
                <div className="w-full h-2.5 bg-bg-lighter rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${stats.percentage}%` }}
                    />
                </div>
                <div className="flex gap-4 mt-3">
                    <span className="text-xs text-text-dim">
                        <span className="text-primary font-semibold">{stats.active}</span> active
                    </span>
                    <span className="text-xs text-text-dim">
                        <span className="text-success font-semibold">{stats.completed}</span> done
                    </span>
                </div>
            </div>

            {/* Add Todo */}
            <div className="bg-surface border border-border rounded-2xl p-4 mb-6">
                <div className="flex gap-3">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="What needs to be done?"
                        className="flex-1 px-4 py-3 bg-bg-light border border-border rounded-xl text-text placeholder:text-text-dim focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200"
                    />
                    <div className="flex items-center gap-2">
                        {/* Priority Selector */}
                        <div className="flex items-center bg-bg-light border border-border rounded-xl overflow-hidden">
                            {(["low", "medium", "high"] as const).map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPriority(p)}
                                    className={`px-3 py-3 text-xs font-semibold transition-all duration-200 cursor-pointer ${priority === p
                                            ? `${priorityConfig[p].bg} ${priorityConfig[p].color}`
                                            : "text-text-dim hover:text-text-muted"
                                        }`}
                                >
                                    <Flag className="w-4 h-4" />
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={addTodo}
                            disabled={!input.trim()}
                            className="p-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl hover:shadow-lg hover:shadow-primary/25 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 mb-4">
                <ListFilter className="w-4 h-4 text-text-dim" />
                {(["all", "active", "completed"] as const).map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer capitalize ${filter === f
                                ? "bg-primary/15 text-primary"
                                : "text-text-muted hover:text-text hover:bg-bg-lighter"
                            }`}
                    >
                        {f}
                        {f === "all" && ` (${stats.total})`}
                        {f === "active" && ` (${stats.active})`}
                        {f === "completed" && ` (${stats.completed})`}
                    </button>
                ))}
            </div>

            {/* Todo List */}
            <div className="space-y-2">
                {loadError && (
                    <ErrorState
                        title="Todo storage unavailable"
                        description={loadError}
                    />
                )}

                {filtered.length === 0 && (
                    <EmptyState
                        title={filter === "all" ? "No todos yet" : `No ${filter} todos`}
                        description={filter === "all" ? "Add one above to get started." : undefined}
                    />
                )}

                {filtered.map((todo, index) => {
                    const pc = priorityConfig[todo.priority];
                    return (
                        <div
                            key={todo.id}
                            className={`group flex items-center gap-3 p-4 bg-surface border border-border rounded-xl hover:border-border-light transition-all duration-200 animate-slide-in-up`}
                            style={{ animationDelay: `${index * 0.03}s` }}
                        >
                            {/* Checkbox */}
                            <button
                                onClick={() => toggleTodo(todo.id)}
                                className="shrink-0 cursor-pointer"
                                aria-label={todo.completed ? "Mark as incomplete" : "Mark as complete"}
                            >
                                {todo.completed ? (
                                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                                        <Check className="w-3.5 h-3.5 text-white" />
                                    </div>
                                ) : (
                                    <Circle className="w-6 h-6 text-text-dim hover:text-primary transition-colors duration-200" />
                                )}
                            </button>

                            {/* Text */}
                            <span
                                className={`flex-1 text-sm transition-colors duration-200 ${todo.completed
                                        ? "line-through text-text-dim"
                                        : "text-text"
                                    }`}
                            >
                                {todo.text}
                            </span>

                            {/* Priority Badge */}
                            <span
                                className={`px-2 py-0.5 rounded-md text-xs font-semibold ${pc.bg} ${pc.color} border ${pc.border}`}
                            >
                                {pc.label}
                            </span>

                            {/* Delete */}
                            <button
                                onClick={() => deleteTodo(todo.id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-danger/10 text-text-dim hover:text-danger transition-all duration-200 cursor-pointer"
                                aria-label="Delete todo"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
