'use client';

import React, { useState, useRef, useEffect } from 'react';

const CustomChannelPreview = ({ 
  channel, 
  setActiveChannel, 
  watchers = {}, 
  displayTitle, 
  displayImage, 
  active, 
  currentUser,
  onSelect // This might not always be passed by Stream Chat
}) => {
  const [contextMenu, setContextMenu] = useState(null);
  const [isClient, setIsClient] = useState(false);
  const contextMenuRef = useRef(null);

  // Ensure we're on the client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Close context menu when clicking outside
  useEffect(() => {
    if (!isClient) return;
    
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isClient]);

  if (!isClient) {
    return (
      <div className="p-3 animate-pulse bg-gray-100 h-16 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  // Get the other user in the conversation
  const getOtherUser = () => {
    if (!channel?.state?.members) return null;
    const members = Object.values(channel.state.members);
    return members.find(member => member.user.id !== currentUser.id)?.user;
  };

  const otherUser = getOtherUser();
  const displayName = displayTitle || otherUser?.name || otherUser?.id || 'Unknown User';
  const lastMessage = channel?.state?.messages?.[channel.state.messages.length - 1];

  const handleRightClick = (e) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleChannelClick = () => {
    setContextMenu(null);
    
    console.log('Channel click - trying methods:', {
      setActiveChannel: !!setActiveChannel,
      onSelect: !!onSelect,
      channel: !!channel
    });
    
    // Try multiple ways to select the channel
    if (setActiveChannel && typeof setActiveChannel === 'function') {
      console.log('Using setActiveChannel');
      setActiveChannel(channel);
    } else if (onSelect && typeof onSelect === 'function') {
      console.log('Using onSelect');
      onSelect(channel);
    } else {
      console.log('Using custom event fallback');
      // Fallback to custom event
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('channelSelected', { 
          detail: { channel } 
        });
        window.dispatchEvent(event);
      }
    }
  };

  const deleteChat = async () => {
    try {
      await channel.hide();
      setContextMenu(null);
      showNotification('Chat deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting chat:', error);
      showNotification('Failed to delete chat', 'error');
    }
  };

  const leaveChat = async () => {
    try {
      await channel.removeMembers([currentUser.id]);
      setContextMenu(null);
      showNotification('Left chat successfully', 'success');
    } catch (error) {
      console.error('Error leaving chat:', error);
      showNotification('Failed to leave chat', 'error');
    }
  };

  const muteChat = async () => {
    try {
      await channel.mute();
      setContextMenu(null);
      showNotification('Chat muted', 'info');
    } catch (error) {
      console.error('Error muting chat:', error);
      showNotification('Failed to mute chat', 'error');
    }
  };

  const showNotification = (message, type = 'info') => {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-500' : 
                   type === 'error' ? 'bg-red-500' : 'bg-blue-500';
    
    notification.className = `fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded shadow-lg z-50`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 3000);
  };

  const formatTime = (date) => {
    if (!date) return '';
    try {
      const now = new Date();
      const messageDate = new Date(date);
      const diffInHours = (now - messageDate) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffInHours < 24 * 7) {
        return messageDate.toLocaleDateString([], { weekday: 'short' });
      } else {
        return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } catch (error) {
      return '';
    }
  };

  return (
    <>
      <div
        className={`p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 transition-colors ${
          active ? 'bg-blue-50 border-blue-200' : ''
        }`}
        onClick={handleChannelClick}
        onContextMenu={handleRightClick}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={displayImage || otherUser?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3B82F6&color=fff&size=40`}
              alt={displayName}
              className="w-10 h-10 rounded-full object-cover"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&size=40`;
              }}
            />
            {otherUser?.online && (
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <p className="font-medium text-gray-900 truncate text-sm">
                {displayName}
              </p>
              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
                {formatTime(lastMessage?.created_at)}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 truncate mt-1">
              {lastMessage ? (
                lastMessage.user?.id === currentUser.id ? (
                  <span>You: {lastMessage.text || 'Sent an attachment'}</span>
                ) : (
                  lastMessage.text || 'Sent an attachment'
                )
              ) : (
                'No messages yet'
              )}
            </p>
            
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-gray-400">
                Right-click for options
              </span>
              {channel?.countUnread && channel.countUnread() > 0 && (
                <div className="bg-blue-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                  {channel.countUnread()}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50 min-w-[160px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          <button
            onClick={handleChannelClick}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Open Chat
          </button>
          
          <button
            onClick={muteChat}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
            Mute Chat
          </button>

          <hr className="my-1 border-gray-200" />
          
          <button
            onClick={deleteChat}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Chat
          </button>
          
          <button
            onClick={leaveChat}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-red-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Leave Chat
          </button>
        </div>
      )}
    </>
  );
};

export default CustomChannelPreview;
