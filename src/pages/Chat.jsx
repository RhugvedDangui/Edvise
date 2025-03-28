import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';

const Chat = () => {
  const { user } = useUser();
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState('');
  const [connections, setConnections] = useState([]);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socketRef = useRef();
  const messagesEndRef = useRef();

  useEffect(() => {
    if (user) {
      // Connect to socket server with CORS options
      socketRef.current = io('http://localhost:3001', {
        withCredentials: true,
        transports: ['websocket', 'polling']
      });
      
      // Listen for messages
      socketRef.current.on('chatMessage', (message) => {
        console.log('Received message:', message);
        setMessages(prevMessages => {
          // Check if message already exists to prevent duplicates
          const exists = prevMessages.some(m => 
            m.senderId === message.senderId && 
            m.timestamp === message.timestamp
          );
          if (!exists) {
            return [...prevMessages, message];
          }
          return prevMessages;
        });
        scrollToBottom();
      });

      // Listen for room join confirmation
      socketRef.current.on('roomCreated', ({ success, roomId }) => {
        console.log('Room joined:', roomId);
        // Request previous messages for this room
        socketRef.current.emit('getMessages', { roomId });
      });

      // Listen for previous messages
      socketRef.current.on('previousMessages', ({ messages: previousMessages }) => {
        console.log('Received previous messages:', previousMessages);
        if (Array.isArray(previousMessages)) {
          setMessages(previousMessages);
          scrollToBottom();
        }
      });

      // Listen for errors
      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        toast.error('Failed to connect to chat server');
      });

      // Clean up on unmount
      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
        }
      };
    }
  }, [user]);

  useEffect(() => {
    if (selectedChat && socketRef.current) {
      const roomId = getRoomId();
      console.log('Joining room:', roomId);
      
      // Join room
      socketRef.current.emit('createRoom', {
        roomId,
        userId: user.id,
        username: user.fullName || user.username,
        email: user.primaryEmailAddress.emailAddress,
        imageUrl: user.imageUrl
      });

      // Clear previous messages when switching chats
      setMessages([]);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (user) {
      fetchConnections();
    }
  }, [user]);

  const fetchConnections = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch connected mentors
      const mentorsRes = await fetch(`/api/connections/connected-mentors/${user?.id}`);
      if (!mentorsRes.ok) {
        throw new Error('Failed to fetch mentors');
      }
      const mentorsData = await mentorsRes.json();
      
      // Fetch connected mentees
      const menteesRes = await fetch(`/api/connections/connected-mentees/${user?.id}`);
      if (!menteesRes.ok) {
        throw new Error('Failed to fetch mentees');
      }
      const menteesData = await menteesRes.json();

      console.log('Fetched connections:', { mentors: mentorsData, mentees: menteesData });

      // Determine user's role
      const userRole = mentorsData.some(m => m.clerkId === user.id) ? 'Mentee' : 'Mentor';
      console.log('User role:', userRole);

      const formattedConnections = [
        ...mentorsData.map(mentor => ({
          id: mentor.clerkId,
          name: mentor.username || mentor.fullName || 'Unknown User',
          role: 'Mentor',
          lastMessage: '',
          time: '',
          unread: 0
        })),
        ...menteesData.map(mentee => ({
          id: mentee.clerkId,
          name: mentee.username || mentee.fullName || 'Unknown User',
          role: 'Mentee',
          lastMessage: '',
          time: '',
          unread: 0
        }))
      ].filter(conn => conn.id !== user.id); // Remove self from connections list

      console.log('Formatted connections:', formattedConnections);
      setConnections(formattedConnections);
    } catch (error) {
      console.error('Error fetching connections:', error);
      setError('Failed to load connections. Please try again later.');
      toast.error('Failed to load connections');
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !selectedChat || !socketRef.current) return;

    const roomId = getRoomId();
    const messageData = {
      roomId,
      senderId: user.id,
      senderName: user.fullName || user.username,
      message: message.trim(),
      senderRole: connections.find(c => c.id === selectedChat.id)?.role === 'Mentor' ? 'Mentee' : 'Mentor'
    };

    console.log('Sending message:', messageData);
    socketRef.current.emit('chatMessage', messageData);
    setMessage('');
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Helper function to get room ID
  const getRoomId = () => {
    if (!selectedChat || !user) return null;
    return [user.id, selectedChat.id].sort().join('-');
  };

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Please sign in to access chat
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900" style={{ zIndex: 50 }}>
      {/* Connections Sidebar */}
      <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Connections</h2>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <p className="text-red-500 dark:text-red-400">{error}</p>
            <button
              onClick={fetchConnections}
              className="mt-2 text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Try again
            </button>
          </div>
        ) : connections.length === 0 ? (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            <p>No connections found</p>
            <a 
              href="/mentors" 
              className="inline-block mt-2 text-primary-600 hover:text-primary-700 dark:text-primary-400"
            >
              Find mentors
            </a>
          </div>
        ) : (
          <div className="overflow-y-auto h-full">
            {connections.map((connection) => (
              <motion.button
                key={connection.id}
                whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)' }}
                onClick={() => setSelectedChat(connection)}
                className={`w-full p-4 flex items-start space-x-3 border-b border-gray-100 dark:border-gray-700
                  ${selectedChat?.id === connection.id ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <span className="text-lg font-medium text-primary-700 dark:text-primary-300">
                      {connection.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {connection.name}
                      </p>
                      <span className="text-xs text-primary-600 dark:text-primary-400">
                        {connection.role}
                      </span>
                    </div>
                    {connection.time && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {connection.time}
                      </span>
                    )}
                  </div>
                  {connection.lastMessage && (
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {connection.lastMessage}
                    </p>
                  )}
                </div>
                {connection.unread > 0 && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-primary-600 rounded-full">
                      {connection.unread}
                    </span>
                  </div>
                )}
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col relative">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="sticky top-0 p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                      {selectedChat.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                    {selectedChat.name}
                  </h2>
                  <p className="text-sm text-primary-600 dark:text-primary-400">
                    {selectedChat.role}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
              {messages.length === 0 ? (
                <div className="flex justify-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Start a conversation with {selectedChat.name}
                  </p>
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={`${msg.senderId}-${msg.timestamp}-${index}`}
                    className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.senderId === user.id
                          ? 'bg-primary-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-xs font-medium">
                          {msg.senderId === user.id ? 'You' : msg.senderName}
                        </span>
                        <span className="text-xs opacity-75">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-sm break-words">{msg.message}</p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="sticky bottom-0 p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 z-10">
              <form onSubmit={handleSendMessage} className="flex space-x-4 pr-16">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 min-w-0 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 
                    rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                    bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg 
                    hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  Send
                </motion.button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50 dark:bg-gray-900">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Select a chat to start messaging
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Choose from your connections on the left
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
