"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type AdminUserListItem = {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  loyaltyPoints: number;
  loyaltyTier: string;
  createdAt: string;
};

export function UserManagementTable({
  initialUsers,
}: {
  initialUsers: AdminUserListItem[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState<string | null>(null);

  async function updateUserRole(userId: string, newRole: "USER" | "ADMIN") {
    setLoading(userId);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Failed to update user.");
      }

      toast.success(data.message ?? "User role updated successfully.");
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user,
        ),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user.");
    } finally {
      setLoading(null);
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) {
      return;
    }

    setLoading(userId);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Failed to delete user.");
      }

      toast.success(data.message ?? "User deleted successfully.");
      setUsers((currentUsers) => currentUsers.filter((user) => user.id !== userId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete user.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div
          key={user.id}
          className="grid gap-4 rounded-[24px] border border-border bg-white/82 p-4 md:grid-cols-[1fr_0.7fr_0.8fr_auto]"
        >
          <div>
            <p className="font-semibold text-foreground">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {user.loyaltyTier} • {user.loyaltyPoints} pts
            </p>
          </div>
          <div>
            <Badge
              className={
                user.role === "ADMIN" ? "border-primary/15 bg-primary/8 text-primary" : ""
              }
            >
              {user.role}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Joined: {new Date(user.createdAt).toLocaleDateString()}
          </div>
          <div className="flex flex-wrap gap-2">
            {user.role === "USER" ? (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateUserRole(user.id, "ADMIN")}
                disabled={loading === user.id}
              >
                Make Admin
              </Button>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={() => updateUserRole(user.id, "USER")}
                disabled={loading === user.id}
              >
                Remove Admin
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => deleteUser(user.id)}
              disabled={loading === user.id}
              className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
