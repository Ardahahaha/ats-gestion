import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type ChatMessage = {
  id: string;
  user_id: string;
  pseudo: string;
  content: string;
  created_at: string;
};

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
};

// Stable color per pseudo
const colorForPseudo = (pseudo: string) => {
  let h = 0;
  for (let i = 0; i < pseudo.length; i++) h = (h * 31 + pseudo.charCodeAt(i)) % 360;
  return `hsl(${h} 70% 55%)`;
};

const ChatWidget = () => {
  const { user, pseudo } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [unread, setUnread] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);
  openRef.current = open;

  // Load + subscribe
  useEffect(() => {
    if (!user) return;
    let mounted = true;

    (async () => {
      const { data, error } = await supabase
        .from("chat_messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(200);
      if (!error && mounted && data) setMessages(data as ChatMessage[]);
    })();

    const channel = supabase
      .channel("chat_messages_realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "chat_messages" },
        (payload) => {
          const msg = payload.new as ChatMessage;
          setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
          if (!openRef.current && msg.user_id !== user.id) {
            setUnread((u) => u + 1);
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "chat_messages" },
        (payload) => {
          const old = payload.old as { id: string };
          setMessages((prev) => prev.filter((m) => m.id !== old.id));
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Auto-scroll to bottom when messages change or chat opens
  useEffect(() => {
    if (open && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open]);

  // Reset unread when opened
  useEffect(() => {
    if (open) setUnread(0);
  }, [open]);

  const send = async () => {
    const text = input.trim();
    if (!text || !user || !pseudo || sending) return;
    if (text.length > 2000) {
      toast.error("Message trop long (2000 caractères max)");
      return;
    }
    setSending(true);
    const { error } = await supabase.from("chat_messages").insert({
      user_id: user.id,
      pseudo,
      content: text,
    });
    setSending(false);
    if (error) {
      toast.error("Impossible d'envoyer le message");
      return;
    }
    setInput("");
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("chat_messages").delete().eq("id", id);
    if (error) toast.error("Suppression impossible");
  };

  if (!user) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/40 transition-transform hover:scale-105 active:scale-95"
        aria-label="Chat d'entreprise"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* Chat bubble */}
      {open && (
        <div className="fixed bottom-24 right-5 z-50 flex h-[70vh] max-h-[600px] w-[92vw] max-w-[400px] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-primary/15 to-transparent px-4 py-3">
            <div>
              <h3 className="font-display text-base uppercase tracking-tight text-foreground">
                Chat Équipe
              </h3>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                {messages.length} messages • temps réel
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-3 py-3">
            {messages.length === 0 && (
              <p className="mt-10 text-center text-sm text-muted-foreground">
                Aucun message. Lance la conversation 👋
              </p>
            )}
            {messages.map((m) => {
              const mine = m.user_id === user.id;
              return (
                <div
                  key={m.id}
                  className={`group flex flex-col ${mine ? "items-end" : "items-start"}`}
                >
                  <div className="mb-0.5 flex items-center gap-2 px-1">
                    <span
                      className="text-[11px] font-bold uppercase tracking-wide"
                      style={{ color: mine ? undefined : colorForPseudo(m.pseudo) }}
                    >
                      {mine ? "Moi" : m.pseudo}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatTime(m.created_at)}
                    </span>
                    {mine && (
                      <button
                        onClick={() => remove(m.id)}
                        className="opacity-0 transition-opacity group-hover:opacity-100"
                        aria-label="Supprimer"
                      >
                        <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                      </button>
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm shadow-sm ${
                      mine
                        ? "rounded-br-sm bg-primary text-primary-foreground"
                        : "rounded-bl-sm bg-muted text-foreground"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Composer */}
          <div className="border-t border-border bg-background/60 p-2">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                maxLength={2000}
                placeholder={pseudo ? `Message en tant que ${pseudo}…` : "Message…"}
                className="max-h-28 min-h-[40px] flex-1 resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={send}
                disabled={!input.trim() || sending}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-40"
                aria-label="Envoyer"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatWidget;
