"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export function UserManagementTable({ initialUsers }: { initialUsers: any[] }) {
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

      if (!response.ok) throw new Error("Failed to update user");

      toast.success("User role updated successfully");

      // Update local state
      setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update user");
    } finally {
      setLoading(null);
    }
  }

  async function deleteUser(userId: string) {
    if (!confirm("Are you sure you want to delete this user?")) return;

    setLoading(userId);
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete user");

      toast.success("User deleted successfully");
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete user");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div
          key={user.id}
          className="grid gap-4 rounded-2xl bg-muted p-4 md:grid-cols-[1fr_0.6fr_0.7fr_auto]"
        >
          <div>
            <p className="font-semibold">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {user.loyaltyTier} • {user.loyaltyPoints} pts
            </p>
          </div>
          <div>
            <Badge className={user.role === "ADMIN" ? "bg-purple-100 text-purple-700" : ""}>
              {user.role}
            </Badge>
          </div>
          <div className="text-sm text-muted-foreground">
            Joined: {new Date(user.createdAt).toLocaleDateString()}
          </div>
          <div className="flex gap-2">
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
              className="text-red-600 hover:text-red-700"
            >
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
