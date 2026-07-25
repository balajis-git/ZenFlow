import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import {
  useGetChatsQuery,
  useCreateOrGetPrivateChatMutation,
  useCreateGroupChatMutation,
  useGetMessagesQuery,
  useMarkMessagesAsReadMutation,
} from '../../redux/api/chatApi';
import { useGetEmployeesQuery } from '../../redux/api/employeeApi';
import { MessageSquare, Send, Plus, Users, User, X } from 'lucide-react';
import io from 'socket.io-client';

const Chat = () => {
  const { user } = useSelector((state) => state.auth);
  const [activeChat, setActiveChat] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [socket, setSocket] = useState(null);

  // Modals
  const [isNewDmOpen, setIsNewDmOpen] = useState(false);

  // Queries
  const { data: chatData, isLoading: chatLoading } = useGetChatsQuery();
  const { data: empData } = useGetEmployeesQuery({ limit: 100 });
  const { data: initialMessagesData } = useGetMessagesQuery(activeChat?._id, {
    skip: !activeChat?._id,
  });

  // Mutations
  const [createOrGetChat] = useCreateOrGetPrivateChatMutation();
  const [markRead] = useMarkMessagesAsReadMutation();

  const messagesEndRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const socketClient = io(window.location.origin);
    socketClient.emit('setup', user?._id);

    socketClient.on('messageReceived', (newMsg) => {
      if (activeChat?._id === newMsg.chat) {
        setMessages((prev) => [...prev, newMsg]);
      }
    });

    socketClient.on('typing', () => setIsTyping(true));
    socketClient.on('stopTyping', () => setIsTyping(false));

    setSocket(socketClient);
    return () => socketClient.disconnect();
  }, [user?._id, activeChat?._id]);

  // Load initial messages from database when activeChat changes
  useEffect(() => {
    if (initialMessagesData?.messages) {
      setMessages(initialMessagesData.messages);
      if (activeChat?._id) {
        markRead(activeChat._id);
        socket?.emit('joinChat', activeChat._id);
      }
    }
  }, [initialMessagesData, activeChat, markRead, socket]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageText.trim() || !activeChat) return;

    socket?.emit('newMessage', {
      chat: activeChat._id,
      sender: user._id,
      content: messageText,
    });

    setMessageText('');
    socket?.emit('stopTyping', activeChat._id);
  };

  const handleSelectDmUser = async (targetUserId) => {
    try {
      const res = await createOrGetChat(targetUserId).unwrap();
      if (res.chat) {
        setActiveChat(res.chat);
        setIsNewDmOpen(false);
      }
    } catch (err) {
      alert(err.data?.message || 'Failed to start chat.');
    }
  };

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 overflow-hidden">
      {/* Sidebar Channels List */}
      <div className="glass w-full md:w-80 rounded-3xl p-4 border border-slate-200/50 dark:border-darkBorder/10 flex flex-col justify-between">
        <div className="space-y-4">
          <div className="flex items-center justify-between px-2 pt-2">
            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Messages</h2>
            <button
              onClick={() => setIsNewDmOpen(true)}
              className="p-2 rounded-xl bg-brand-500/10 text-brand-500 hover:bg-brand-500/20 transition"
            >
              <Plus size={18} />
            </button>
          </div>

          {/* Chat Rooms List */}
          <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] pr-1">
            {chatLoading ? (
              <p className="text-center text-xs text-slate-400 py-10">Loading chats...</p>
            ) : chatData?.chats?.length === 0 ? (
              <p className="text-center text-xs text-slate-400 py-10">No messages yet. Start a chat!</p>
            ) : (
              chatData?.chats?.map((c) => {
                const targetUser = c.participants?.find((p) => p._id !== user?._id);
                const chatTitle = c.type === 'group' ? c.name : targetUser?.name;
                const isSelected = activeChat?._id === c._id;

                return (
                  <div
                    key={c._id}
                    onClick={() => setActiveChat(c)}
                    className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition ${
                      isSelected
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                        : 'hover:bg-slate-100/60 dark:hover:bg-darkBorder/20'
                    }`}
                  >
                    <img
                      src={targetUser?.profileImage || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                      alt={chatTitle}
                      className="h-10 w-10 rounded-xl object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-slate-800 dark:text-white'}`}>
                        {chatTitle}
                      </p>
                      <p className={`text-xs truncate ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                        {c.latestMessage ? c.latestMessage.content : 'No messages yet'}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className="glass flex-1 rounded-3xl border border-slate-200/50 dark:border-darkBorder/10 flex flex-col justify-between overflow-hidden">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-4 px-6 border-b border-slate-100 dark:border-darkBorder/10 bg-white/40 dark:bg-darkCard/40">
              <div className="flex items-center gap-3">
                {(() => {
                  const targetUser = activeChat.participants?.find((p) => p._id !== user?._id);
                  return (
                    <>
                      <img
                        src={targetUser?.profileImage}
                        alt={targetUser?.name}
                        className="h-10 w-10 rounded-xl object-cover"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-800 dark:text-white">
                          {activeChat.type === 'group' ? activeChat.name : targetUser?.name}
                        </h3>
                        <p className="text-[11px] text-slate-400">{targetUser?.designation || 'Active'}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>

            {/* Message Body */}
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {messages.map((m) => {
                const isMe = m.sender?._id === user?._id || m.sender === user?._id;
                return (
                  <div key={m._id} className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}>
                    {!isMe && (
                      <img
                        src={m.sender?.profileImage}
                        alt={m.sender?.name}
                        className="h-7 w-7 rounded-full object-cover"
                      />
                    )}
                    <div
                      className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 ${
                        isMe
                          ? 'bg-brand-500 text-white rounded-br-none shadow-md shadow-brand-500/10'
                          : 'bg-slate-100 dark:bg-darkBorder/40 text-slate-800 dark:text-slate-100 rounded-bl-none'
                      }`}
                    >
                      <p>{m.content}</p>
                      <span className={`block text-[9px] text-right ${isMe ? 'text-white/70' : 'text-slate-400'}`}>
                        {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                );
              })}
              {isTyping && <p className="text-[11px] italic text-slate-400">Someone is typing...</p>}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-100 dark:border-darkBorder/10 flex items-center gap-3">
              <input
                type="text"
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value);
                  socket?.emit('typing', activeChat._id);
                }}
                className="flex-1 rounded-xl bg-slate-100/50 dark:bg-darkBg border-0 py-3 px-4 text-sm dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-500/20"
              />
              <button
                type="submit"
                className="rounded-xl bg-brand-500 hover:bg-brand-600 p-3 text-white shadow-md transition"
              >
                <Send size={18} />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-6">
            <MessageSquare size={48} className="mb-4 opacity-50 text-brand-500" />
            <h3 className="text-lg font-bold text-slate-700 dark:text-slate-300">Select a Chat to Start Messaging</h3>
            <p className="text-xs text-slate-500 mt-1">Select an employee from the channel list or start a new direct message.</p>
          </div>
        )}
      </div>

      {/* New DM Modal */}
      {isNewDmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="glass w-full max-w-sm rounded-3xl p-6 border border-slate-200/50 dark:border-darkBorder/30 shadow-2xl relative">
            <button className="absolute right-6 top-6 text-slate-400 hover:text-slate-600" onClick={() => setIsNewDmOpen(false)}>
              <X size={20} />
            </button>

            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">New Direct Message</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {empData?.employees
                ?.filter((e) => e._id !== user?._id)
                .map((emp) => (
                  <div
                    key={emp._id}
                    onClick={() => handleSelectDmUser(emp._id)}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-100/60 dark:hover:bg-darkBorder/20 cursor-pointer"
                  >
                    <img src={emp.profileImage} alt={emp.name} className="h-8 w-8 rounded-full object-cover" />
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{emp.name}</p>
                      <p className="text-[10px] text-slate-400">{emp.designation}</p>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
