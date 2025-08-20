"use client";
import { useEffect, useRef, useState } from "react";
import type { Socket } from "socket.io-client";

type ChatMessage = {
  text: string;
  from: string;
  clientId: string;
  ts: number;
  kind?: "user" | "system";
};

export default function ChatPanel({
  socket,
  roomId,
  name,
  mySocketId,
  collapsed = false,
}: {
  socket: Socket | null;
  roomId: string | null;
  name: string;
  mySocketId: string | null;
  collapsed?: boolean;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [peerTyping, setPeerTyping] = useState<string | null>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

// 1) Make sending depend on mySocketId too
const canSend = !!socket && !!roomId && !!name && !!mySocketId;


  // auto-scroll to bottom on new messages
  useEffect(() => {
    scrollerRef.current?.scrollTo({
      top: scrollerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length]);

  // wire socket events
  // 2) Wire socket events (add mySocketId to deps + ignore my own echoes)
useEffect(() => {
  if (!socket || !roomId) return;

  socket.emit("chat:join", { roomId, name });

  const onMsg = (m: ChatMessage) => {
    // UI-only dedupe: skip the server echo of my own optimistic message
    if (m.clientId === mySocketId) return;
    setMessages((prev) => [...prev, { ...m, kind: "user" }]);
  };

  const onSystem = (m: { text: string }) => {
    setMessages((prev) => [
      ...prev,
      { text: m.text, from: "system", clientId: "system", ts: Date.now(), kind: "system" },
    ]);
  };

  const onTyping = ({ from, typing }: { from: string; typing: boolean }) => {
    setPeerTyping(typing ? `${from} is typing…` : null);
    if (typing) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setPeerTyping(null), 3000);
    }
  };

  socket.on("chat:message", onMsg);
  socket.on("chat:system", onSystem);
  socket.on("chat:typing", onTyping);

  return () => {
    socket.off("chat:message", onMsg);
    socket.off("chat:system", onSystem);
    socket.off("chat:typing", onTyping);
  };
}, [socket, roomId, name, mySocketId]); // ← include mySocketId


// 3) Send using a guaranteed clientId (since canSend requires mySocketId)
const sendMessage = () => {
  if (!canSend || !input.trim()) return;
  const payload = {
    roomId: roomId!,
    text: input.trim(),
    from: name,
    clientId: mySocketId!,        // ← use the real socket id
    ts: Date.now(),
  };
  setMessages((prev) => [...prev, { ...payload, kind: "user" }]); // optimistic
  socket!.emit("chat:message", payload);
  setInput("");
  socket!.emit("chat:typing", { roomId, from: name, typing: false });
};


  const handleTyping = (value: string) => {
    setInput(value);
    if (!socket || !roomId) return;
    socket.emit("chat:typing", { roomId, from: name, typing: true });
  };

  if (collapsed) return null;

  return (
    <div className="flex flex-col h-full border border-white/10 rounded-2xl bg-white/[0.03]">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
        <div className="text-sm font-medium text-white/80">Chat</div>
        <div className="text-[10px] uppercase tracking-wider text-white/50">
          {roomId ? `Room ${roomId}` : "—"}
        </div>
      </div>

      <div ref={scrollerRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2">
        {messages.map((m, idx) => {
          const mine = m.clientId === mySocketId;
          const isSystem = m.kind === "system";
          return (
            <div key={idx} className={`flex ${isSystem ? "justify-center" : mine ? "justify-end" : "justify-start"}`}>
              <div
                className={
                  isSystem
                    ? "text-xs text-white/50 italic"
                    : `max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                        mine ? "bg-indigo-600 text-white" : "bg-white/10 text-white/90"
                      }`
                }
                title={new Date(m.ts).toLocaleTimeString()}
              >
                {isSystem ? (
                  <span>{m.text}</span>
                ) : (
                  <>
                    {!mine && <div className="text-[10px] text-white/60 mb-1">{m.from}</div>}
                    <div>{m.text}</div>
                  </>
                )}
              </div>
            </div>
          );
        })}
        {peerTyping && <div className="text-xs text-white/60 italic">{peerTyping}</div>}
      </div>

      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2">
          <input
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500/60"
            placeholder={canSend ? "Type a message…" : "Connecting chat…"}
            value={input}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
            disabled={!canSend}
          />
          <button
            onClick={sendMessage}
            disabled={!canSend || !input.trim()}
            className="h-10 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-sm font-medium"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
