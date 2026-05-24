"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

type NotificationItem = {
  _id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
};

export function NotificationsCenter() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    void fetchNotifications();
  }, []);

  async function fetchNotifications() {
    try {
      const response = await fetch("/api/notifications");
      const data = (await response.json()) as {
        notifications?: NotificationItem[];
        unreadCount?: number;
      };

      if (!response.ok) {
        throw new Error("Could not load notifications.");
      }

      setNotifications(data.notifications ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load notifications.");
    } finally {
      setLoading(false);
    }
  }

  async function markSingleNotification(notification: NotificationItem) {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId: notification._id }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not update notification.");
      }

      setNotifications((current) =>
        current.map((item) =>
          item._id === notification._id ? { ...item, read: true } : item,
        ),
      );
      setUnreadCount((current) => Math.max(0, current - (notification.read ? 0 : 1)));

      if (notification.link) {
        router.push(notification.link);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update notification.");
    }
  }

  async function markAllNotifications() {
    setMarkingAll(true);

    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ markAll: true }),
      });
      const data = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Could not mark notifications as read.");
      }

      setNotifications((current) => current.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
      toast.success("All notifications marked as read.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update notifications.");
    } finally {
      setMarkingAll(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-[26px] border border-border bg-white/82 p-8 text-center text-sm text-muted-foreground">
        Loading notifications...
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-[26px] border border-border bg-white/82 p-10 text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-white">
          <Bell className="h-7 w-7 text-secondary" />
        </div>
        <h2 className="text-3xl font-semibold leading-none text-foreground">
          No notifications yet
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          Booking updates, reminders, verification notices, and check-in messages will
          appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 rounded-[28px] border border-border bg-white/72 px-6 py-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-[0.72rem] uppercase tracking-[0.22em] text-muted-foreground">
            Notification center
          </p>
          <p className="mt-2 text-3xl font-semibold leading-none text-foreground">
            {unreadCount} unread
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={markAllNotifications}
          disabled={markingAll || unreadCount === 0}
        >
          <CheckCheck className="h-4 w-4" />
          {markingAll ? "Updating..." : "Mark all as read"}
        </Button>
      </div>

      <div className="space-y-3">
        {notifications.map((notification) => (
          <button
            key={notification._id}
            type="button"
            onClick={() => void markSingleNotification(notification)}
            className={`w-full rounded-[26px] border p-5 text-left transition hover:border-primary/20 hover:bg-white ${
              notification.read
                ? "border-border bg-white/72"
                : "border-secondary/25 bg-secondary/8"
            }`}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <p className="font-semibold text-foreground">{notification.title}</p>
                  {!notification.read ? (
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-secondary" />
                  ) : null}
                </div>
                <p className="text-sm leading-7 text-muted-foreground">
                  {notification.message}
                </p>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {notification.type.replaceAll("_", " ")}
                </p>
              </div>
              <p className="text-xs text-muted-foreground">
                {new Date(notification.createdAt).toLocaleString()}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
