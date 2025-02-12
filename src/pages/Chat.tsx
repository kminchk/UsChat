import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { format } from 'date-fns';
import { Send, Settings, Loader, MessageCircle, User } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';

export default function Chat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);

  if (!currentUser?.username) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('timestamp'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(messages);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (newMessage.trim() && !sending && currentUser?.username) {
      try {
        setSending(true);
        await addDoc(collection(db, 'messages'), {
          text: newMessage.trim(),
          sender: currentUser.username,
          timestamp: serverTimestamp()
        });
        setNewMessage('');
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setSending(false);
      }
    }
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-sky-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-400 p-2 rounded-lg">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
                UsChat
              </h1>
              <p className="text-sm text-gray-500">
                with {currentUser.username === 'sky' ? 'sea' : 'sky'}
              </p>
            </div>
          </div>
          <Link to="/profile" className="group">
            <div className="flex items-center space-x-2 p-2 rounded-lg hover:bg-blue-50 transition-colors">
              <div className="bg-blue-100 rounded-full p-2 group-hover:bg-blue-200 transition-colors">
                <User className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-sm text-gray-600 group-hover:text-blue-600 transition-colors">Profile</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex justify-center items-center h-full">
            <Loader className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            {messages.map((message) => {
              const isSender = message.sender === currentUser.username;
              return (
                <div
                  key={message.id}
                  className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs md:max-w-md px-4 py-2 rounded-2xl shadow-sm
                      ${isSender 
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white' 
                        : 'bg-white text-gray-800'
                      }
                      ${isSender ? 'rounded-tr-sm' : 'rounded-tl-sm'}
                    `}
                  >
                    <div className="text-sm">{message.text}</div>
                    <div className={`text-xs mt-1 ${
                      isSender ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp ? format(message.timestamp.toDate(), 'HH:mm') : ''}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Message Input */}
      <form onSubmit={handleSubmit} className="bg-white border-t border-blue-100 p-4">
        <div className="max-w-7xl mx-auto flex space-x-4">
          <div className="relative flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full px-6 py-3 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className={`absolute right-2 top-1/2 transform -translate-y-1/2
                ${sending || !newMessage.trim() 
                  ? 'bg-gray-300 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500'
                } 
                text-white rounded-full p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 
                flex items-center justify-center w-10 h-10 transition-all duration-200`}
            >
              {sending ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}