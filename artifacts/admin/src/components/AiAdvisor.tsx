import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Minimize2, Maximize2, Loader2, Sparkles, TrendingUp, BarChart2, Megaphone, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { customFetch } from "@workspace/api-client-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  ts: string;
}

const QUICK_PROMPTS = [
  { icon: TrendingUp, label: "Revenue this month", prompt: "What was my total revenue this month and how does it compare week by week?" },
  { icon: BarChart2, label: "Top services", prompt: "Which services are generating the most revenue and bookings?" },
  { icon: Sparkles, label: "Business tips", prompt: "Based on my current performance, what improvements do you recommend to grow my revenue?" },
  { icon: Megaphone, label: "Marketing ideas", prompt: "What services should I be promoting right now based on recent booking trends?" },
];

export default function AiAdvisor() {
  const { user, token } = useAuth();
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: `Hello${user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋 I'm Bea AI, your business advisor. I have access to your real-time spa analytics. Ask me anything about your performance, bookings, revenue, or get personalized recommendations!`,
      ts: new Date().toISOString(),
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: Message = { id: Date.now().toString(), role: "user", text, ts: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const thinkingId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: thinkingId, role: "assistant", text: "...", ts: new Date().toISOString() }]);

    try {
      const data: any = await customFetch("/api/ai/admin-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ message: text }),
      });
      setMessages(prev => prev.map(m => m.id === thinkingId ? { ...m, text: data.reply || "I couldn't generate a response." } : m));
    } catch (e: any) {
      setMessages(prev => prev.map(m => m.id === thinkingId ? { ...m, text: e.message || "Sorry, I ran into an error. Please try again." } : m));
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 px-4 py-3 text-white shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 group"
        title="Open AI Advisor"
      >
        <div className="relative flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
          <Bot className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-purple-600 animate-pulse" />
        </div>
        <span className="font-semibold text-sm">Bea AI</span>
        <Sparkles className="h-4 w-4 text-yellow-300 animate-pulse" />
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex flex-col rounded-2xl border border-purple-200/50 bg-white shadow-2xl shadow-purple-500/20 transition-all duration-300 ${minimized ? 'h-[52px] w-72' : 'h-[520px] w-80'}`}>
      {/* Header */}
      <div className="flex items-center gap-3 rounded-t-2xl bg-gradient-to-r from-violet-600 to-purple-600 p-3 text-white">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/20">
          <Bot className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold leading-none">Bea AI Advisor</p>
          <p className="text-[11px] text-purple-200 mt-0.5">Business Intelligence</p>
        </div>
        <button onClick={() => setMinimized(v => !v)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
          {minimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
        </button>
        <button onClick={() => setOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
          <X className="h-4 w-4" />
        </button>
      </div>

      {!minimized && (
        <>
          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3">
            {messages.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                {msg.role === 'assistant' && (
                  <div className="h-7 w-7 shrink-0 mt-1 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                )}
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white rounded-br-sm'
                    : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                }`}>
                  {msg.text === '...' ? (
                    <div className="flex gap-1 items-center py-1">
                      <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:0ms]" />
                      <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:150ms]" />
                      <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:300ms]" />
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Quick prompts — shown only when just the welcome message */}
            {messages.length === 1 && (
              <div className="space-y-1.5 mt-2">
                <p className="text-[11px] text-gray-400 font-medium uppercase tracking-wide px-1">Quick Questions</p>
                {QUICK_PROMPTS.map(qp => (
                  <button
                    key={qp.label}
                    onClick={() => sendMessage(qp.prompt)}
                    className="flex items-center gap-2 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-left text-xs text-gray-700 hover:border-purple-300 hover:bg-purple-50 transition-colors group"
                  >
                    <qp.icon className="h-3.5 w-3.5 text-purple-500 shrink-0" />
                    <span className="flex-1">{qp.label}</span>
                    <ChevronRight className="h-3 w-3 text-gray-400 group-hover:text-purple-500 transition-colors" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-gray-100 p-2">
            <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 focus-within:border-purple-300 focus-within:ring-1 focus-within:ring-purple-100 transition-all">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(input)}
                placeholder="Ask about your business..."
                className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
                disabled={loading}
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || loading}
                className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-purple-600 text-white disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
