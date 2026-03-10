"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { readJson } from "@/lib/api";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    try {
      await readJson<{ message: string }>(response);
      toast.success("You have been logged out.");
      router.push("/");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Logout failed.");
    }
  }

  return (
    <Button variant="outline" onClick={handleLogout}>
      <LogOut className="h-4 w-4" />
      Log out
    </Button>
  );
}
