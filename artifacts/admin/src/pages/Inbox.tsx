import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare, Search, MoreVertical, Send, CheckCircle2,
  Ban, Clock, User, Phone, CheckCheck, Check, CornerDownRight, ShieldAlert, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ChatMessage {
  id: string;
  sender: 'client' | 'owner' | 'bot';
  senderName: string;
  text: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  spaId: string;
  clientId: string;
  clientName: string;
  clientPhone?: string;
  relatedBookingId?: string;
  status: 'open' | 'resolved' | 'blocked';
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: ChatMessage[];
}

const CANNED_RESPONSES = [
  "Hello! How can I help you today?",
  "Yes, we have availability this week. Let me check the schedule.",
  "Our deposit policy requires a 50% payment to secure the booking.",
  "I'm checking this with the team right now. One moment please.",
  "Your booking has been confirmed! We look forward to seeing you.",
  "We are located along Bofa Road, next to the main resort.",
  "Thank you for reaching out. Let me know if you have more questions."
];

export default function Inbox() {
  const { user } = useAuth();
  const { toast } = useToast();
  const spaId = user?.spaId || 's5';
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [replyText, setReplyText] = useState("");
  const [loading, setLoading] = useState(true);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchConversations();
  }, [spaId]);

  const fetchConversations = async () => {
    try {
      const res = await fetch(`/api/messages/conversations?spaId=${spaId}`);
      const data = await res.json();
      setConversations(Array.isArray(data) ? data : []);
      if (!activeConvId && Array.isArray(data) && data.length > 0) {
        setActiveConvId(data[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const activeConv = conversations.find(c => c.id === activeConvId);

  useEffect(() => {
    if (activeConvId) {
      // Mark as read
      const conv = conversations.find(c => c.id === activeConvId);
      if (conv && conv.unreadCount > 0) {
        fetch(`/api/messages/conversations/${activeConvId}/read`, { method: 'PATCH' })
          .then(() => {
            setConversations(prev => prev.map(c => 
              c.id === activeConvId ? { ...c, unreadCount: 0, messages: c.messages.map(m => ({ ...m, read: true })) } : c
            ));
          });
      }
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [activeConvId, conversations]);

  const handleSend = async () => {
    if (!replyText.trim() || !activeConvId) return;
    
    const tempText = replyText;
    setReplyText("");
    
    try {
      const res = await fetch(`/api/messages/conversations/${activeConvId}/reply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: tempText, senderName: user?.name, sender: 'owner' })
      });
      const newMsg = await res.json();
      
      setConversations(prev => prev.map(c => 
        c.id === activeConvId 
          ? { 
              ...c, 
              messages: [...c.messages, newMsg], 
              lastMessage: newMsg.text, 
              lastMessageAt: newMsg.timestamp 
            } 
          : c
      ).sort((a, b) => b.lastMessageAt.localeCompare(a.lastMessageAt)));
      
    } catch (e) {
      toast({ title: "Failed to send message", variant: "destructive" });
      setReplyText(tempText); // restore
    }
  };

  const handleStatusChange = async (status: 'resolved' | 'blocked') => {
    if (!activeConvId) return;
    try {
      await fetch(`/api/messages/conversations/${activeConvId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      
      toast({ 
        title: status === 'resolved' ? "Conversation marked resolved" : "User blocked" 
      });
      
      // Refresh list to remove blocked or update resolved status visually (if kept)
      fetchConversations();
      if (status === 'blocked') setActiveConvId(null);
      
    } catch (e) {
      toast({ title: "Action failed", variant: "destructive" });
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.clientName.toLowerCase().includes(search.toLowerCase()) || 
    c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const formatDate = (isoString: string) => {
    const d = new Date(isoString);
    if (new Date().toDateString() === d.toDateString()) return formatTime(isoString);
    return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;

  return (
    <div className="h-[calc(100vh-10rem)] flex flex-col space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Spa Inbox</h1>
          <p className="text-muted-foreground mt-1">Manage client messages and chatbot handoffs</p>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden bg-white border rounded-2xl shadow-sm">
        {/* Sidebar */}
        <div className="w-1/3 border-r flex flex-col min-w-[280px]">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search messages..." 
                className="pl-9 bg-gray-50 border-transparent focus:bg-white"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-3 opacity-20" />
                <p className="text-sm">No conversations found</p>
              </div>
            ) : (
              filteredConversations.map(conv => (
                <div 
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  className={`p-4 border-b cursor-pointer transition-colors ${
                    activeConvId === conv.id ? 'bg-primary/5 border-l-4 border-l-primary' : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className={`font-semibold text-sm ${conv.unreadCount > 0 ? 'text-gray-900' : 'text-gray-700'}`}>
                      {conv.clientName}
                    </p>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                      {formatDate(conv.lastMessageAt)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center gap-2">
                    <p className={`text-xs truncate ${conv.unreadCount > 0 ? 'font-medium text-gray-900' : 'text-muted-foreground'}`}>
                      {conv.lastMessage}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[1.25rem] text-center">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                  {conv.status === 'resolved' && (
                    <Badge variant="outline" className="mt-2 text-[10px] bg-green-50 text-green-700 border-green-200">
                      Resolved
                    </Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main Chat Area */}
        {activeConv ? (
          <div className="flex-1 flex flex-col min-w-0">
            {/* Chat Header */}
            <div className="h-16 border-b flex items-center justify-between px-6 shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {activeConv.clientName.charAt(0)}
                </div>
                <div>
                  <h2 className="font-semibold">{activeConv.clientName}</h2>
                  {activeConv.clientPhone && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {activeConv.clientPhone}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeConv.status !== 'resolved' && (
                  <Button variant="outline" size="sm" onClick={() => handleStatusChange('resolved')} className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Mark Resolved
                  </Button>
                )}
                <Button variant="outline" size="icon" onClick={() => handleStatusChange('blocked')} title="Block User">
                  <ShieldAlert className="w-4 h-4 text-red-500" />
                </Button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50 space-y-6">
              {activeConv.messages.map((msg, i) => {
                const isOwner = msg.sender === 'owner';
                const isBot = msg.sender === 'bot';
                const showSender = i === 0 || activeConv.messages[i-1].sender !== msg.sender;
                
                return (
                  <div key={msg.id} className={`flex flex-col ${isOwner ? 'items-end' : 'items-start'}`}>
                    {showSender && (
                      <span className="text-[10px] text-muted-foreground mb-1 ml-1 flex items-center gap-1">
                        {isBot ? <Sparkles className="w-3 h-3 text-purple-500" /> : null}
                        {msg.senderName} • {formatTime(msg.timestamp)}
                      </span>
                    )}
                    <div className="flex items-end gap-2 max-w-[75%]">
                      <div className={`px-4 py-2.5 rounded-2xl ${
                        isOwner ? 'bg-primary text-primary-foreground rounded-br-sm' : 
                        isBot ? 'bg-purple-100 text-purple-900 border border-purple-200 rounded-bl-sm' : 
                        'bg-white border text-gray-800 rounded-bl-sm shadow-sm'
                      }`}>
                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                      </div>
                      {isOwner && (
                        <div className="flex-shrink-0 text-muted-foreground mb-1">
                          {msg.read ? <CheckCheck className="w-3.5 h-3.5 text-blue-500" /> : <Check className="w-3.5 h-3.5" />}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t">
              {activeConv.status === 'resolved' ? (
                <div className="text-center p-3 bg-gray-50 text-muted-foreground rounded-lg border border-dashed text-sm flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  This conversation is marked as resolved.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {CANNED_RESPONSES.map((res, i) => (
                      <button 
                        key={i} 
                        onClick={() => setReplyText(res)}
                        className="text-xs whitespace-nowrap px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors border"
                      >
                        {res.length > 30 ? res.substring(0, 30) + '...' : res}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      value={replyText}
                      onChange={e => setReplyText(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                        }
                      }}
                      placeholder="Type a message..."
                      className="flex-1 rounded-full px-5"
                    />
                    <Button 
                      onClick={handleSend}
                      disabled={!replyText.trim()}
                      className="rounded-full w-10 h-10 p-0 flex items-center justify-center"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-gray-50/50">
            <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
            <p>Select a conversation to view messages</p>
          </div>
        )}
      </div>
    </div>
  );
}
