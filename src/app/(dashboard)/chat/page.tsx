"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { EmptyState, ErrorState, LoadingState } from "@/components/StateView";
import {
    Send,
    Hash,
    Users,
    Smile,
    MessageSquare,
} from "lucide-react";

interface Message {
    id: string;
    userId: string;
    userName: string;
    userAvatar: string;
    text: string;
    timestamp: number;
    channel: string;
}

const channels = [
    { id: "general", label: "General", icon: Hash },
    { id: "random", label: "Random", icon: Smile },
    { id: "tech", label: "Tech", icon: MessageSquare },
    { id: "design", label: "Design", icon: Users },
];

// Seed messages for a more lively demo
const seedMessages: Omit<Message, "id">[] = [
    {
        userId: "bot-1",
        userName: "Sarah Chen",
        userAvatar: "https://ui-avatars.com/api/?name=Sarah+Chen&background=8B5CF6&color=fff&bold=true&size=128",
        text: "Hey everyone! Welcome to TodoChat 👋",
        timestamp: Date.now() - 3600000,
        channel: "general",
    },
    {
        userId: "bot-2",
        userName: "Alex Rivera",
        userAvatar: "https://ui-avatars.com/api/?name=Alex+Rivera&background=3B82F6&color=fff&bold=true&size=128",
        text: "This app looks amazing! Love the dark theme.",
        timestamp: Date.now() - 3000000,
        channel: "general",
    },
    {
        userId: "bot-1",
        userName: "Sarah Chen",
        userAvatar: "https://ui-avatars.com/api/?name=Sarah+Chen&background=8B5CF6&color=fff&bold=true&size=128",
        text: "Has anyone tried the new todo priorities? Super handy for organizing tasks.",
        timestamp: Date.now() - 2400000,
        channel: "general",
    },
    {
        userId: "bot-3",
        userName: "Jordan Lee",
        userAvatar: "https://ui-avatars.com/api/?name=Jordan+Lee&background=EC4899&color=fff&bold=true&size=128",
        text: "Just deployed a new microservice using Go and gRPC — runs like a dream 🚀",
        timestamp: Date.now() - 1800000,
        channel: "tech",
    },
    {
        userId: "bot-2",
        userName: "Alex Rivera",
        userAvatar: "https://ui-avatars.com/api/?name=Alex+Rivera&background=3B82F6&color=fff&bold=true&size=128",
        text: "Anyone else obsessed with the teal + orange color combo? 🎨",
        timestamp: Date.now() - 1200000,
        channel: "design",
    },
    {
        userId: "bot-3",
        userName: "Jordan Lee",
        userAvatar: "https://ui-avatars.com/api/?name=Jordan+Lee&background=EC4899&color=fff&bold=true&size=128",
        text: "Friday vibes! What's everyone working on this weekend?",
        timestamp: Date.now() - 600000,
        channel: "random",
    },
];

export default function ChatPage() {
    const { user, loading } = useAuth();
    const [activeChannel, setActiveChannel] = useState("general");
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [mounted, setMounted] = useState(false);
    const [loadError, setLoadError] = useState("");
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const storageKey = "todochat_messages";

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            try {
                const stored = localStorage.getItem(storageKey);
                if (stored) {
                    setMessages(JSON.parse(stored));
                } else {
                    const seeded = seedMessages.map((m) => ({
                        ...m,
                        id: Math.random().toString(36).substring(2),
                    }));
                    setMessages(seeded);
                    localStorage.setItem(storageKey, JSON.stringify(seeded));
                }
            } catch {
                setLoadError("Could not load saved messages.");
            }
            setMounted(true);
        }, 0);

        return () => window.clearTimeout(timeout);
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem(storageKey, JSON.stringify(messages));
        }
    }, [messages, mounted]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, activeChannel]);

    const channelMessages = useMemo(
        () => messages.filter((m) => m.channel === activeChannel),
        [messages, activeChannel]
    );

    const sendMessage = () => {
        const trimmed = input.trim();
        if (!trimmed || !user) return;

        const msg: Message = {
            id: Date.now().toString(36) + Math.random().toString(36).substring(2),
            userId: user.id,
            userName: user.name,
            userAvatar: user.avatar,
            text: trimmed,
            timestamp: Date.now(),
            channel: activeChannel,
        };

        setMessages((prev) => [...prev, msg]);
        setInput("");
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const formatTime = (ts: number | string) => {
        const date = new Date(ts);
        if (isNaN(date.getTime())) return "";
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const getMessageCounts = (channelId: string) => {
        return messages.filter((m) => m.channel === channelId).length;
    };

    if (loading || !mounted) {
        return <LoadingState title="Loading chat" />;
    }

    return (
        <div className="flex h-full animate-fade-in relative">
            {/* Channel Sidebar */}
            <div className="w-60 bg-bg border-r border-border flex flex-col shrink-0">
                <div className="p-4 border-b border-border">
                    <h2 className="text-sm font-bold text-text uppercase tracking-wider">Channels</h2>
                </div>
                <div className="flex-1 p-2 space-y-0.5 overflow-y-auto">
                    {channels.map((ch) => {
                        const isActive = activeChannel === ch.id;
                        const count = getMessageCounts(ch.id);
                        return (
                            <button
                                key={ch.id}
                                onClick={() => setActiveChannel(ch.id)}
                                className={`flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${isActive
                                        ? "bg-primary/15 text-primary"
                                        : "text-text-muted hover:text-text hover:bg-bg-lighter"
                                    }`}
                            >
                                <ch.icon className="w-4 h-4 shrink-0" />
                                <span className="flex-1 text-left">{ch.label}</span>
                                {count > 0 && (
                                    <span
                                        className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? "bg-primary/20 text-primary" : "bg-bg-lighter text-text-dim"
                                            }`}
                                    >
                                        {count}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col min-w-0">
                {/* Channel Header */}
                <div className="px-6 py-4 border-b border-border bg-surface/50 backdrop-blur-sm flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-2">
                            <Hash className="w-5 h-5 text-primary" />
                            <h2 className="text-lg font-bold text-text">
                                {channels.find((c) => c.id === activeChannel)?.label}
                            </h2>
                        </div>
                        <p className="text-xs text-text-dim mt-0.5">
                            {channelMessages.length} messages
                        </p>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 relative">
                    {loadError && (
                        <ErrorState
                            title="Message storage unavailable"
                            description={loadError}
                        />
                    )}

                    {channelMessages.length === 0 && (
                        <EmptyState
                            title="No messages yet"
                            description={`Be the first to say something in ${channels.find(c => c.id === activeChannel)?.label}.`}
                        />
                    )}

                    {channelMessages.map((msg, index) => {
                        const isOwn = msg.userId === user?.id;
                        return (
                            <div
                                key={msg.id}
                                className={`flex gap-3 animate-slide-in-up ${isOwn ? "flex-row-reverse" : ""}`}
                                style={{ animationDelay: `${Math.min(index * 0.02, 0.5)}s` }}
                            >
                                <Image
                                    src={msg.userAvatar}
                                    alt={msg.userName}
                                    width={36}
                                    height={36}
                                    unoptimized
                                    className="w-9 h-9 rounded-full shrink-0 ring-2 ring-border mt-0.5 object-cover"
                                />
                                <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"}`}>
                                    <div className={`flex items-baseline gap-2 mb-1 ${isOwn ? "flex-row-reverse" : ""}`}>
                                        <span className="text-sm font-semibold text-text">
                                            {isOwn ? "You" : msg.userName}
                                        </span>
                                        <span className="text-xs text-text-dim">{formatTime(msg.timestamp)}</span>
                                    </div>
                                    <div
                                        className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isOwn
                                                ? "bg-gradient-to-r from-primary to-primary-light text-white rounded-tr-md"
                                                : "bg-surface border border-border text-text rounded-tl-md"
                                            }`}
                                    >
                                        {msg.text}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-border bg-surface/50 backdrop-blur-sm">
                    <div className="flex items-center gap-3">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder={`Message #${channels.find((c) => c.id === activeChannel)?.label.toLowerCase()}...`}
                            className="flex-1 px-4 py-3 bg-bg-light border border-border rounded-xl text-text placeholder:text-text-dim focus:border-primary focus:ring-1 focus:ring-primary transition-colors duration-200"
                        />
                        <button
                            onClick={sendMessage}
                            disabled={!input.trim()}
                            className="p-3 bg-gradient-to-r from-primary to-primary-light text-white rounded-xl hover:shadow-lg hover:shadow-primary/25 active:scale-95 transition-all duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                            <Send className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
