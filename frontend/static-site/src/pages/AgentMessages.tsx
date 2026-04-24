import { useMemo, useState, useEffect, useRef } from "react";
import { MessageSquare, Search, Send, Paperclip, MoreVertical, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DashboardSidebar } from "./AdminDashboard";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messageService } from "@/services/message.service";
import { useAuth } from "@/context/AuthContext";
import { useSearchParams } from "react-router-dom";
import { Message } from "@/types/models";

const AgentMessages = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(
    searchParams.get("conversation") || null
  );
  const [messageText, setMessageText] = useState("");
  const [search, setSearch] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: conversationsData } = useQuery({
    queryKey: ["agent-conversations"],
    queryFn: () => messageService.conversations(),
  });

  const conversations = conversationsData?.data || [];

  const selectedConv = conversations.find((c) => c._id === selectedConversation) || null;

  const { data: messagesData, isLoading: messagesLoading } = useQuery({
    queryKey: ["conversation-messages", selectedConversation],
    queryFn: () => messageService.getMessages(selectedConversation || ""),
    enabled: Boolean(selectedConversation),
    // Removed refetchInterval - using Socket.IO for real-time updates
  });

  const currentMessages = messagesData?.data || [];

  // Real-time updates removed for static site

  // Mark messages as read when conversation is selected
  useEffect(() => {
    if (selectedConversation && user) {
      messageService.markAsRead(selectedConversation).catch(() => {
        // Silently fail if mark as read fails
      });
      queryClient.invalidateQueries({ queryKey: ["agent-conversations"] });
    }
  }, [selectedConversation, user, queryClient]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [currentMessages]);

  const filteredConversations = useMemo(
    () =>
      conversations.filter((conv) => {
        const other = conv.participants.find((p) => (p._id || p.id) !== (user?._id || user?.id));
        const displayName = `${other?.firstName || ""} ${other?.lastName || ""}`.trim() || other?.email || "User";
        return displayName.toLowerCase().includes(search.toLowerCase());
      }),
    [conversations, search, user]
  );

  const sendMutation = useMutation({
    mutationFn: (payload: { conversationId: string; content: string }) => messageService.send(payload),
    onSuccess: () => {
      setMessageText("");
      queryClient.invalidateQueries({ queryKey: ["conversation-messages", selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ["agent-conversations"] });
    },
  });

  const onSend = () => {
    if (!selectedConversation || !messageText.trim()) return;
    sendMutation.mutate({ conversationId: selectedConversation, content: messageText.trim() });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const getParticipant = (conversationId?: string) => {
    const conv = conversations.find((c) => c._id === conversationId);
    return conv?.participants.find((p) => (p._id || p.id) !== (user?._id || user?.id));
  };

  return (
    <div className="min-h-screen bg-muted flex">
      <DashboardSidebar active="Messages" role="agent" />

      <main className="flex-1 ml-64 flex">
        {/* Conversations List */}
        <div className="w-80 border-r border-border bg-card flex flex-col">
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-foreground">Messages</h2>
              <button className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <MoreVertical className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-border rounded-md pl-9 pr-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conv) => {
                const other = getParticipant(conv._id);
                const displayName = `${other?.firstName || ""} ${other?.lastName || ""}`.trim() || other?.email || "User";
                const unread = Number((conv.unreadCount as Record<string, number> | undefined)?.[user?._id || user?.id || ""] || 0);
                return (
                  <button
                    key={conv._id}
                    onClick={() => setSelectedConversation(conv._id)}
                    className={`w-full p-4 border-b border-border text-left hover:bg-muted transition-colors ${
                      selectedConversation === conv._id ? "bg-muted" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-bold text-sm">{displayName[0]?.toUpperCase() || "U"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-foreground text-sm">{displayName}</span>
                          <span className="text-xs text-muted-foreground">{conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString() : ""}</span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate mb-1">{conv.lastMessage?.content || "No messages yet"}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">{other?.role || "User"}</span>
                          {unread > 0 && (
                            <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                              {unread}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                No conversations yet
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedConv ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-sm">
                        {(
                          `${getParticipant(selectedConv._id)?.firstName || ""} ${getParticipant(selectedConv._id)?.lastName || ""}`.trim() ||
                          getParticipant(selectedConv._id)?.email ||
                          "U"
                        )[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">
                        {`${getParticipant(selectedConv._id)?.firstName || ""} ${getParticipant(selectedConv._id)?.lastName || ""}`.trim() ||
                          getParticipant(selectedConv._id)?.email ||
                          "Unknown"}
                      </div>
                      <div className="text-xs text-muted-foreground">{getParticipant(selectedConv._id)?.role || ""}</div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">View Profile</Button>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                {messagesLoading ? (
                  <p className="text-sm text-muted-foreground">Loading messages...</p>
                ) : currentMessages.length > 0 ? (
                  <>
                    {currentMessages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex ${(msg.senderId?._id || msg.senderId?.id) === (user?._id || user?.id) ? "justify-end" : "justify-start"}`}
                      >
                        <div className={`max-w-[70%] rounded-lg p-3 ${
                          (msg.senderId?._id || msg.senderId?.id) === (user?._id || user?.id)
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border border-border text-foreground"
                        }`}>
                          <div className="text-sm mb-1">{msg.content}</div>
                          <div className={`text-xs flex items-center gap-1 ${
                            (msg.senderId?._id || msg.senderId?.id) === (user?._id || user?.id) ? "text-primary-foreground/70" : "text-muted-foreground"
                          }`}>
                            {(msg.senderId?._id || msg.senderId?.id) === (user?._id || user?.id) ? <CheckCheck className="w-3 h-3" /> : null}
                            {msg.createdAt ? new Date(msg.createdAt).toLocaleString() : ""}
                          </div>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <MessageSquare className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-border bg-card">
                <div className="flex items-center gap-2">
                  <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                    <Paperclip className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <input
                    type="text"
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 border border-border rounded-md px-3 py-2 text-sm bg-background text-foreground outline-none focus:ring-2 focus:ring-primary"
                  />
                  <Button
                    size="sm"
                    className="gap-2"
                    onClick={onSend}
                    disabled={sendMutation.isPending || !messageText.trim()}
                  >
                    <Send className="w-4 h-4" /> Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Select a conversation to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AgentMessages;

