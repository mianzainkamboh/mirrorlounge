'use client';

import { useState, useEffect, useRef } from 'react';
import { collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, serverTimestamp, where, Timestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage, isFirebaseConfigured } from '../../lib/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Image from 'next/image';

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'user' | 'admin';
  content: string;
  type: 'text' | 'image';
  imageUrl?: string;
  imageName?: string;
  timestamp: Timestamp | Date;
  isRead: boolean;
  chatRoomId: string;
}

interface ChatRoom {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  createdAt: Timestamp | Date;
  lastMessageAt: Timestamp | Date;
  lastMessage: string;
  unreadCount: number;
  isActive: boolean;
}

// Main chat component that uses hooks
function ChatComponent() {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Early returns for user authentication and loading state
  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Access Denied</h2>
          <p className="text-gray-600">Please sign in to access the chat.</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading chat...</p>
        </div>
      </div>
    );
  }

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load chat rooms
  useEffect(() => {
    if (!user || !db) return;

    try {
      const chatRoomsQuery = query(
        collection(db, 'chatRooms'),
        orderBy('lastMessageAt', 'desc')
      );

      const unsubscribe = onSnapshot(chatRoomsQuery, (snapshot) => {
        const rooms: ChatRoom[] = [];
        snapshot.forEach((doc) => {
          rooms.push({ id: doc.id, ...doc.data() } as ChatRoom);
        });
        setChatRooms(rooms);
        setIsLoading(false);
      }, (error) => {
        console.error('Error loading chat rooms:', error);
        setIsLoading(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up chat rooms listener:', error);
      setIsLoading(false);
    }
  }, [user]);

  // Load messages for selected chat room
  useEffect(() => {
    if (!selectedChatRoom || !db) {
      setMessages([]);
      return;
    }

    try {
      const messagesQuery = query(
        collection(db, 'messages'),
        where('chatRoomId', '==', selectedChatRoom.id),
        orderBy('timestamp', 'asc')
      );

      const unsubscribe = onSnapshot(messagesQuery, (snapshot) => {
        const msgs: ChatMessage[] = [];
        snapshot.forEach((doc) => {
          msgs.push({ id: doc.id, ...doc.data() } as ChatMessage);
        });
        setMessages(msgs);
        scrollToBottom();
      }, (error) => {
        console.error('Error loading messages:', error);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error setting up messages listener:', error);
    }
  }, [selectedChatRoom]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Send text message
  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChatRoom || !user || isSending || !db) return;

    setIsSending(true);
    try {
      const messageData = {
        senderId: user.uid,
        senderName: 'Admin',
        senderType: 'admin',
        content: newMessage.trim(),
        type: 'text',
        timestamp: serverTimestamp(),
        isRead: false,
        chatRoomId: selectedChatRoom.id,
      };

      await addDoc(collection(db, 'messages'), messageData);

      // Update chat room with last message
      await updateDoc(doc(db, 'chatRooms', selectedChatRoom.id), {
        lastMessage: newMessage.trim(),
        lastMessageAt: serverTimestamp(),
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Handle image upload
  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !selectedChatRoom || !user || isSending || !db || !storage) return;

    // Check file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      alert('Please select a valid image file (JPG, PNG, or SVG)');
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setIsSending(true);
    try {
      // Upload image to Firebase Storage
      const fileName = `chat_images/admin_${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Send image message
      const messageData = {
        senderId: user.uid,
        senderName: 'Admin',
        senderType: 'admin',
        content: 'Image',
        type: 'image',
        imageUrl: downloadURL,
        imageName: file.name,
        timestamp: serverTimestamp(),
        isRead: false,
        chatRoomId: selectedChatRoom.id,
      };

      await addDoc(collection(db, 'messages'), messageData);

      // Update chat room with last message
      await updateDoc(doc(db, 'chatRooms', selectedChatRoom.id), {
        lastMessage: 'Image',
        lastMessageAt: serverTimestamp(),
      });

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsSending(false);
    }
  };

  // Format timestamp
  const formatTime = (timestamp: Timestamp | Date | null) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) {
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  };

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Chat Rooms Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">User Chats</h2>
          <p className="text-sm text-gray-600">{chatRooms.length} active conversations</p>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {chatRooms.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <p>No active chats</p>
            </div>
          ) : (
            chatRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => setSelectedChatRoom(room)}
                className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedChatRoom?.id === room.id ? 'bg-pink-50 border-l-4 border-l-pink-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-gray-800 truncate">{room.userName}</h3>
                  <span className="text-xs text-gray-500">
                    {formatTime(room.lastMessageAt)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 truncate">{room.userEmail}</p>
                <p className="text-sm text-gray-500 truncate mt-1">{room.lastMessage}</p>
                {room.unreadCount > 0 && (
                  <span className="inline-block bg-pink-500 text-white text-xs px-2 py-1 rounded-full mt-2">
                    {room.unreadCount}
                  </span>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 flex flex-col">
        {selectedChatRoom ? (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  {selectedChatRoom.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{selectedChatRoom.userName}</h3>
                  <p className="text-sm text-gray-600">{selectedChatRoom.userEmail}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => {
                const isAdmin = message.senderType === 'admin';
                return (
                  <div
                    key={message.id}
                    className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isAdmin 
                        ? 'bg-pink-500 text-white' 
                        : 'bg-gray-200 text-gray-800'
                    }`}>
                      {message.type === 'text' ? (
                        <p className="text-sm">{message.content}</p>
                      ) : (
                        <div className="space-y-2">
                          {message.imageUrl && (
                            <div className="relative w-48 h-32">
                              <Image
                                src={message.imageUrl}
                                alt={message.imageName || 'Shared image'}
                                fill
                                className="object-cover rounded"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                            </div>
                          )}
                          <p className="text-xs opacity-75">{message.imageName}</p>
                        </div>
                      )}
                      <p className={`text-xs mt-1 ${
                        isAdmin ? 'text-pink-100' : 'text-gray-500'
                      }`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/jpeg,image/jpg,image/png,image/svg+xml"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isSending}
                  className="p-2 text-gray-500 hover:text-pink-500 transition-colors disabled:opacity-50"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  disabled={isSending}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={isSending || !newMessage.trim()}
                  className="px-6 py-2 bg-pink-500 text-white rounded-full hover:bg-pink-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSending ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    'Send'
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Select a Chat</h3>
              <p className="text-gray-600">Choose a conversation from the sidebar to start chatting with users.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Wrapper component that handles early returns before any hooks
export default function ChatPage() {
  // Check if Firebase is configured - must be first
  if (!isFirebaseConfigured()) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Chat Service Unavailable</h2>
          <p className="text-gray-600 mb-4">
            Firebase is not configured. Please set up your Firebase environment variables to use the chat feature.
          </p>
          <p className="text-sm text-gray-500">
            Contact your administrator for assistance with Firebase configuration.
          </p>
        </div>
      </div>
    );
  }

  // Additional safety check for db and storage
  if (!db || !storage) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md max-w-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Database Service Unavailable</h2>
          <p className="text-gray-600 mb-4">
            Firebase database or storage is not available. Please check your configuration.
          </p>
        </div>
      </div>
    );
  }

  // Render the main chat component
  return <ChatComponent />;
}