"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { markAsRead, markAllAsRead } from "@/actions/notifications";
import { Button } from "@/components/ui/button";
import type { Notification as NotifType } from "@/lib/types/database";
import { Bell } from "lucide-react";

interface NotificationBellProps {
    notifications: NotifType[];
    unreadCount: number;
}

const TYPE_ICONS: Record<string, string> = {
    PAYMENT: "💰",
    WOD: "🏋️",
    PR: "🏆",
    SYSTEM: "⚙️",
    REMINDER: "🔔",
};

export function NotificationBell({ notifications, unreadCount }: NotificationBellProps) {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();

    function handleMarkAllRead() {
        startTransition(async () => {
            await markAllAsRead();
        });
    }

    function handleMarkRead(id: string) {
        startTransition(async () => {
            await markAsRead(id);
        });
    }

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="relative flex h-9 w-9 items-center justify-center rounded-lg hover:bg-accent transition-colors"
                aria-label="Notificaciones"
            >
                <Bell className="w-5 h-5 text-muted-foreground" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </button>

            {open && (
                <>
                    <div
                        className="fixed inset-0 z-40"
                        onClick={() => setOpen(false)}
                    />

                    <div className="absolute right-0 top-12 z-50 w-80 rounded-lg border border-border bg-card shadow-xl">
                        <div className="flex items-center justify-between border-b border-border px-4 py-3">
                            <h3 className="text-sm font-semibold">Notificaciones</h3>
                            {unreadCount > 0 && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleMarkAllRead}
                                    disabled={isPending}
                                    className="text-xs text-indigo-600 hover:text-blue-400 h-auto py-1"
                                >
                                    Marcar todas como leídas
                                </Button>
                            )}
                        </div>

                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length > 0 ? (
                                notifications.slice(0, 10).map((notif) => (
                                    <div
                                        key={notif.id}
                                        className={`border-b border-border last:border-0 px-4 py-3 transition-colors ${!notif.is_read ? "bg-indigo-600/5" : ""
                                            }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <span className="text-base mt-0.5">
                                                {TYPE_ICONS[notif.type] || "📌"}
                                            </span>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-sm font-medium truncate">
                                                        {notif.title}
                                                    </p>
                                                    {!notif.is_read && (
                                                        <button
                                                            onClick={() => handleMarkRead(notif.id)}
                                                            className="ml-2 text-xs text-muted-foreground hover:text-foreground"
                                                        >
                                                            ✓
                                                        </button>
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                                                    {notif.message}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground/50 mt-1">
                                                    {new Date(notif.created_at).toLocaleDateString("es-VE", {
                                                        day: "numeric",
                                                        month: "short",
                                                        hour: "2-digit",
                                                        minute: "2-digit",
                                                    })}
                                                </p>
                                                {notif.link && (
                                                    <Link
                                                        href={notif.link}
                                                        onClick={() => setOpen(false)}
                                                        className="text-xs text-indigo-600 hover:underline mt-1 inline-block"
                                                    >
                                                        Ver →
                                                    </Link>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="py-8 text-center">
                                    <p className="text-sm text-muted-foreground">Sin notificaciones</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
