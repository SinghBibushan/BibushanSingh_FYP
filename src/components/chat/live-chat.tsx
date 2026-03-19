"use client";

import { useEffect, useRef, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface Message {
  _id: string;
  message: string;
  isAdmin: boolean;
  createdAt: string;
}

export function LiveChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    async function fetchMessages() {
      try {
        const res = await fetch("/api/chat");
        if (!res.ok) {
          return;
        }

        const data = (await res.json()) as { messages?: Message[] };
        if (active) {
          setMessages(data.messages ?? []);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void fetchMessages();
    const interval = setInterval(() => {
      void fetchMessages();
    }, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!newMessage.trim()) {
      return;
    }

    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newMessage.trim() }),
      });
      const data = (await res.json()) as {
        error?: string;
        message?: Message;
      };

      if (!res.ok) {
        throw new Error(data.error ?? "Failed to send message.");
      }

      setNewMessage("");
      const createdMessage = data.message;
      if (createdMessage) {
        setMessages((currentMessages) => [...currentMessages, createdMessage]);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send message.");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-[28px] border border-border bg-white/76 p-8 text-center text-sm text-muted-foreground">
        Loading support conversation...
      </div>
    );
  }

  return (
    <div className="flex h-[540px] flex-col overflow-hidden rounded-[28px] border border-border bg-white/78 shadow-[0_18px_45px_rgba(24,34,53,0.06)]">
      <div className="border-b border-border bg-[linear-gradient(145deg,#f8f3ea_0%,#f2e5d6_100%)] p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Live support chat</h3>
            <p className="text-sm text-muted-foreground">
              Messages refresh automatically every few seconds.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto bg-white/55 p-5">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-white">
              <MessageSquare className="h-7 w-7 text-muted-foreground" />
            </div>
            <p className="font-semibold text-foreground">No messages yet</p>
            <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
              Start a conversation if you have a question about the event or booking flow.
            </p>
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${msg.isAdmin ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[78%] rounded-[22px] px-4 py-3 ${
                  msg.isAdmin
                    ? "border border-border bg-white text-foreground"
                    : "bg-primary text-primary-foreground shadow-[0_12px_24px_rgba(24,34,53,0.14)]"
                }`}
              >
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
                  {msg.isAdmin ? "Support" : "You"}
                </p>
                <p className="text-sm leading-6">{msg.message}</p>
                <p className="mt-2 text-xs opacity-70">
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={sendMessage} className="border-t border-border bg-white/82 p-4">
        <div className="flex gap-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1"
          />
          <Button type="submit" disabled={sending || !newMessage.trim()} className="px-4">
            {sending ? "Sending..." : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </form>
    </div>
  );
}
