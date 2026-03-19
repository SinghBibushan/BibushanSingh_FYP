"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchNotifications();
    const interval = setInterval(() => {
      void fetchNotifications();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  async function fetchNotifications() {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = (await res.json()) as {
          notifications?: Notification[];
          unreadCount?: number;
        };
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleNotificationClick(notification: Notification) {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: notification._id }),
      });
    } finally {
      setShowDropdown(false);
      if (notification.link) {
        router.push(notification.link);
      }
      void fetchNotifications();
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative rounded-full border border-border bg-white/72 p-2.5 shadow-[0_8px_24px_rgba(24,34,53,0.05)] transition hover:bg-white"
        aria-label="Notifications"
        type="button"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 ? (
          <span className="absolute right-0 top-0 flex h-5 w-5 items-center justify-center rounded-full bg-secondary text-xs font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {showDropdown ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
          <div className="absolute right-0 z-50 mt-2 max-h-96 w-84 overflow-y-auto rounded-[26px] border border-border bg-card shadow-[0_24px_60px_rgba(24,34,53,0.14)]">
            <div className="border-b border-border p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {unreadCount} unread
                </span>
              </div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-sm text-muted-foreground">
                Loading notifications...
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="font-semibold text-foreground">No notifications yet</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Booking updates, reminders, and verification notices will appear here.
                </p>
              </div>
            ) : (
              <div>
                {notifications.slice(0, 8).map((notif) => (
                  <button
                    key={notif._id}
                    onClick={() => void handleNotificationClick(notif)}
                    className={`w-full border-b border-border p-4 text-left transition hover:bg-white ${
                      !notif.read ? "bg-secondary/8" : ""
                    }`}
                    type="button"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-foreground">{notif.title}</h4>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                          {notif.message}
                        </p>
                      </div>
                      {!notif.read ? (
                        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-secondary" />
                      ) : null}
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      {new Date(notif.createdAt).toLocaleString()}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
