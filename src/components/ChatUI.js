import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import './ChatUI.css';

const ChatUI = () => {
  // State for socket connection
  const [socket, setSocket] = useState(null);
  // State for current user info
  const [user, setUser] = useState(null);
  // State for online users
  const [users, setUsers] = useState([]);
  // State to store messages
  const [messages, setMessages] = useState([]);
  // State for the input field
  const [newMessage, setNewMessage] = useState('');
  // State for the selected recipient (for direct messaging)
  const [recipient, setRecipient] = useState(null);
  // State for username modal
  const [showUsernameModal, setShowUsernameModal] = useState(true);
  // State for username input
  const [usernameInput, setUsernameInput] = useState('');  // State for username error
  const [usernameError, setUsernameError] = useState('');
  // Ref to auto-scroll messages
  const messagesEndRef = useRef(null);
    // Initialize socket connection
  useEffect(() => {
    const serverUrl = process.env.NODE_ENV === 'production'
      ? 'https://webbased-chat.onrender.com'  // Production URL
      : 'http://localhost:7777';              // Development URL

    const newSocket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => newSocket.close();
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Handle receiving user info
    socket.on('user_info', (userData) => {
      setUser(userData);
      // Add welcome message
      setMessages([{
        id: Date.now(),
        text: `Welcome to the chat, ${userData.name}!`,
        sender: 'system',
        timestamp: new Date().toISOString()
      }]);
    });

    // Handle receiving updated users list
    socket.on('users_update', (updatedUsers) => {
      setUsers(updatedUsers);
    });    // Handle receiving new messages
    socket.on('new_message', (messageData) => {
      setMessages(prevMessages => [...prevMessages, {
        ...messageData,
        timestamp: new Date().toISOString()
      }]);
    });
    
    // Handle typing notifications
    socket.on('user_typing', ({ userId, userName, to }) => {
      // Only show typing indicators for relevant users (group chat or selected direct message)
      const shouldShowTyping = !to || 
                              to === user?.id || 
                              (recipient && userId === recipient.id);
      
      if (shouldShowTyping) {
        setTypingUsers(prev => {
          // Add user to typing users if not already present
          if (!prev.find(u => u.id === userId)) {
            return [...prev, { id: userId, name: userName }];
          }
          return prev;
        });
        
        // Remove typing indicator after 3 seconds of inactivity
        setTimeout(() => {
          setTypingUsers(prev => prev.filter(u => u.id !== userId));
        }, 3000);
      }
    });

    // Cleanup event listeners
    return () => {
      socket.off('user_info');
      socket.off('users_update');
      socket.off('new_message');
      socket.off('user_typing');
    };
  }, [socket, recipient, user]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Function to handle sending a new message
  const handleSendMessage = () => {
    if (!socket || newMessage.trim() === '') return;
    
    // Create a new message object
    const messageData = {
      id: Date.now(),
      text: newMessage,
      sender: user.id,
      senderName: user.name,
      to: recipient ? recipient.id : null,
      timestamp: new Date().toISOString()
    };
    
    // Send the message via socket
    socket.emit('send_message', messageData);
    
    // Clear the input field
    setNewMessage('');
  };
  // Handle Enter key press to send message
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  // Function to format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Function to handle selecting a recipient for direct messaging
  const handleSelectRecipient = (selectedUser) => {
    if (selectedUser.id === user?.id) return; // Can't message yourself
    setRecipient(recipient?.id === selectedUser.id ? null : selectedUser);
  };

  // Determine if message is from current user
  const isOwnMessage = (message) => {
    return message.sender === user?.id;
  };

  // Function to handle username submission
  const handleUsernameSubmit = (e) => {
    e.preventDefault();
    
    // Validate username
    if (!usernameInput.trim()) {
      setUsernameError('Please enter a username');
      return;
    }
    
    // Check username length
    if (usernameInput.trim().length < 3) {
      setUsernameError('Username must be at least 3 characters');
      return;
    }
    
    // Remove any special characters
    const cleanUsername = usernameInput.trim().replace(/[^\w\s]/gi, '');
    
    // Send username to server
    if (socket) {
      socket.emit('set_username', cleanUsername);
      setShowUsernameModal(false);
    }
  };

  // State for emoji picker
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // State for typing indicator
  const [typingUsers, setTypingUsers] = useState([]);
  
  // Timestamp for last typing notification
  const lastTypingNotification = useRef(null);

  // Function to toggle emoji picker
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };
  
  // Function to handle emoji selection
  const handleEmojiSelect = (emoji) => {
    setNewMessage(prevMessage => prevMessage + emoji);
    setShowEmojiPicker(false);
  };
    // Function to notify typing status
  const notifyTyping = () => {
    if (!socket || !user) return;
    
    // Limit sending typing notifications to once per second
    const now = Date.now();
    if (!lastTypingNotification.current || now - lastTypingNotification.current > 1000) {
      socket.emit('typing', { 
        userId: user.id, 
        userName: user.name,
        to: recipient ? recipient.id : null 
      });
      lastTypingNotification.current = now;
    }
  };

  return (
    <>
      {/* Username Modal */}
      {showUsernameModal && (
        <div className="username-modal-overlay">
          <div className="username-modal">
            <h2>Enter Your Username</h2>
            <p>Please enter a username to join the chat</p>
            
            <form onSubmit={handleUsernameSubmit}>
              <input
                type="text"
                placeholder="Your username..."
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                autoFocus
              />
              {usernameError && <div className="username-error">{usernameError}</div>}
              <button type="submit">Join Chat</button>
            </form>
          </div>
        </div>
      )}
      
      {/* Main Chat App */}
      <div className="chat-app">
        <div className="users-sidebar">
          <div className="users-header">
            <h3>Online Users</h3>
            {user && <div className="current-user">You: {user.name}</div>}
          </div>
          <div className="users-list">
            {users.filter(u => u.id !== user?.id).map((u) => (
              <div 
                key={u.id} 
                className={`user-item ${recipient?.id === u.id ? 'selected' : ''}`}
                onClick={() => handleSelectRecipient(u)}
              >
                <div className="user-avatar">{u.name.charAt(0)}</div>
                <div className="user-name">{u.name}</div>
                <div className="user-status"></div>
              </div>
            ))}
            {users.length <= 1 && (
              <div className="no-users">No other users online</div>
            )}
          </div>
        </div>

      <div className="chat-container">
        <div className="chat-header">
          <h2>
            {recipient 
              ? `Chat with ${recipient.name}` 
              : 'Group Chat'}
          </h2>
          {recipient && (
            <button 
              className="back-to-group" 
              onClick={() => setRecipient(null)}
            >
              Back to Group
            </button>
          )}
        </div>
        
        <div className="chat-messages">
          {messages
            .filter(message => 
              !recipient || 
              message.sender === 'system' || 
              message.to === null || 
              message.to === user?.id || 
              message.sender === recipient.id || 
              (message.to === recipient.id && message.sender === user?.id)
            )
            .map((message) => (
              <div 
                key={message.id} 
                className={`message ${
                  message.sender === 'system' 
                    ? 'system-message' 
                    : isOwnMessage(message) 
                      ? 'user-message' 
                      : 'other-message'
                }`}
              >
                {!isOwnMessage(message) && message.sender !== 'system' && (
                  <div className="message-sender">{message.senderName}</div>
                )}
                <div className="message-content">
                  <p>{message.text}</p>
                  <span className="message-time">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              </div>
            ))
          }
          <div ref={messagesEndRef} />
        </div>
          {/* Typing indicators */}
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            {typingUsers.length === 1 ? (
              <span>{typingUsers[0].name} is typing...</span>
            ) : (
              <span>Several people are typing...</span>
            )}
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        )}
        
        <div className="chat-input">
          <button 
            type="button" 
            className="emoji-button"
            onClick={toggleEmojiPicker}
          >
            😊
          </button>
          
          {showEmojiPicker && (
            <div className="emoji-picker">
              <div className="emoji-picker-close" onClick={() => setShowEmojiPicker(false)}>×</div>
              <div className="emoji-grid">
                {['😊', '😂', '❤️', '👍', '🎉', '🔥', '👋', '😎', '🤔', '😢', '😡', '🥳', '👏', '🙏', '🤗', '😴'].map(emoji => (
                  <div 
                    key={emoji} 
                    className="emoji-item" 
                    onClick={() => handleEmojiSelect(emoji)}
                  >
                    {emoji}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <input
            type="text"
            placeholder={
              recipient 
                ? `Message ${recipient.name}...` 
                : "Message everyone..."
            }
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            onInput={notifyTyping}
          />
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
    </>
  );
};

export default ChatUI;
