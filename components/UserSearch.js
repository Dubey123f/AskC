'use client';

import React, { useState, useEffect, useRef } from 'react';

const UserSearch = ({ client, currentUser, onChatStart }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [blockedUsers, setBlockedUsers] = useState(new Set());
  const [searchFilters, setSearchFilters] = useState({
    searchBy: 'all',
    sortBy: 'name',
    onlineOnly: false,
    limit: 20
  });
  const searchRef = useRef(null);
  const contextMenuRef = useRef(null);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(event.target)) {
        setContextMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load all users function - FIXED: Limited sort fields to maximum 5
  const loadAllUsers = async () => {
    try {
      const response = await client.queryUsers(
        { 
          id: { $ne: currentUser.id },
          role: { $ne: 'admin' }
        },
        { 
          // Only include the most important fields for sorting
          id: 1,
          name: 1,
          image: 1,
          online: 1,
          created_at: -1  // Reduced to 5 fields maximum
        },
        { limit: 100 }
      );
      setAllUsers(response.users || []);
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  // Load all users once when component mounts
  useEffect(() => {
    if (client && currentUser) {
      loadAllUsers();
    }
  }, [client, currentUser]);

  const createChannelId = (userId1, userId2) => {
    const sortedIds = [userId1, userId2].sort();
    const combined = sortedIds.join('-');
    
    if (combined.length > 60) {
      let hash = 0;
      for (let i = 0; i < combined.length; i++) {
        const char = combined.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return `dm-${Math.abs(hash).toString(36)}`;
    }
    
    return `dm-${combined}`;
  };

  const advancedSearch = (query, filters) => {
    if (!query.trim() && !filters.onlineOnly) {
      return [];
    }

    let filtered = [...allUsers];

    // Filter by online status
    if (filters.onlineOnly) {
      filtered = filtered.filter(user => user.online);
    }

    // Filter by search term
    if (query.trim()) {
      const queryLower = query.toLowerCase();
      
      filtered = filtered.filter(user => {
        const userName = (user.name || '').toLowerCase();
        const userId = (user.id || '').toLowerCase();
        const userEmail = (user.email || '').toLowerCase();

        switch (filters.searchBy) {
          case 'name':
            return userName.includes(queryLower);
          case 'id':
            return userId.includes(queryLower);
          case 'email':
            return userEmail.includes(queryLower);
          case 'all':
          default:
            return userName.includes(queryLower) || 
                   userId.includes(queryLower) || 
                   userEmail.includes(queryLower);
        }
      });
    }

    // Sort results
    switch (filters.sortBy) {
      case 'name':
        filtered.sort((a, b) => getDisplayName(a).localeCompare(getDisplayName(b)));
        break;
      case 'recent':
        filtered.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        break;
      case 'id':
        filtered.sort((a, b) => a.id.localeCompare(b.id));
        break;
    }

    return filtered.slice(0, filters.limit);
  };

  const searchUsers = (query = searchTerm, filters = searchFilters) => {
    setIsSearching(true);
    
    const results = advancedSearch(query, filters);
    setSearchResults(results);
    
    setTimeout(() => setIsSearching(false), 100);
  };

  const startChat = async (targetUser) => {
    if (blockedUsers.has(targetUser.id)) {
      alert('You have blocked this user. Unblock them first to start a chat.');
      return;
    }

    try {
      const channelId = createChannelId(currentUser.id, targetUser.id);
      console.log('Creating channel with ID:', channelId);
      
      const channel = client.channel('messaging', channelId, {
        members: [currentUser.id, targetUser.id],
        name: `${getDisplayName(currentUser)} & ${getDisplayName(targetUser)}`,
        created_by_id: currentUser.id,
      });

      await channel.create();
      onChatStart(channel);
      setSearchTerm('');
      setSearchResults([]);
      setShowAdvanced(false);
      setContextMenu(null);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  // Context menu handlers
  const handleRightClick = (e, user) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      user: user
    });
  };

  const deleteChat = async (targetUser) => {
    try {
      const channelId = createChannelId(currentUser.id, targetUser.id);
      const channel = client.channel('messaging', channelId);
      
      // Hide the channel for the current user
      await channel.hide();
      
      alert('Chat deleted successfully');
      setContextMenu(null);
    } catch (error) {
      console.error('Error deleting chat:', error);
      alert('Failed to delete chat');
    }
  };

  const blockUser = async (targetUser) => {
    try {
      setBlockedUsers(prev => new Set([...prev, targetUser.id]));
      alert(`User ${getDisplayName(targetUser)} has been blocked`);
      setContextMenu(null);
    } catch (error) {
      console.error('Error blocking user:', error);
      alert('Failed to block user');
    }
  };

  const unblockUser = async (targetUser) => {
    try {
      setBlockedUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(targetUser.id);
        return newSet;
      });
      alert(`User ${getDisplayName(targetUser)} has been unblocked`);
      setContextMenu(null);
    } catch (error) {
      console.error('Error unblocking user:', error);
      alert('Failed to unblock user');
    }
  };

  const refreshUsers = async () => {
    setIsSearching(true);
    await loadAllUsers();
    setIsSearching(false);
    alert('User list refreshed');
  };

  const getDisplayName = (user) => {
    if (!user) return 'Unknown User';
    if (user.name) return user.name;
    if (user.fullName) return user.fullName;
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.email) {
      const emailName = user.email.split('@')[0];
      return emailName.replace(/[._]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
    return user.id.replace(/[_-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const clearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setShowAdvanced(false);
    setSearchFilters({
      searchBy: 'all',
      sortBy: 'name',
      onlineOnly: false,
      limit: 20
    });
  };

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers();
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm, searchFilters, allUsers]);

  return (
    <div className="relative px-2 sm:px-4 py-2 border-b bg-white dark:bg-gray-900">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Search Users</h4>
        <button
          onClick={refreshUsers}
          className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full transition"
          title="Refresh user list"
          disabled={isSearching}
        >
          <svg className={`w-4 h-4 ${isSearching ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Main Search Input */}
      <div className="relative">
        <input
          ref={searchRef}
          type="text"
          placeholder={`Search ${allUsers.length} users...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-2 px-3 pr-20 sm:px-4 rounded-md border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 transition-colors"
        />
        
        {/* Search Controls */}
        <div className="absolute right-1 top-1 flex items-center space-x-1">
          {(searchTerm || searchResults.length > 0) && (
            <button
              onClick={clearSearch}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Clear search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`p-1 rounded transition-colors ${
              showAdvanced 
                ? 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
            title="Advanced search"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
            </svg>
          </button>
          
          {isSearching && (
            <div className="p-1">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Search Filters */}
      {showAdvanced && (
        <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Search by:</label>
              <select
                value={searchFilters.searchBy}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, searchBy: e.target.value }))}
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="all">All fields</option>
                <option value="name">Name only</option>
                <option value="id">ID only</option>
                <option value="email">Email only</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Sort by:</label>
              <select
                value={searchFilters.sortBy}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value="name">Name (A-Z)</option>
                <option value="recent">Recently created</option>
                <option value="id">User ID</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="onlineOnly"
                checked={searchFilters.onlineOnly}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, onlineOnly: e.target.checked }))}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="onlineOnly" className="text-gray-700 dark:text-gray-300">
                Online users only
              </label>
            </div>

            <div>
              <label className="block text-gray-700 dark:text-gray-300 mb-1">Max results:</label>
              <select
                value={searchFilters.limit}
                onChange={(e) => setSearchFilters(prev => ({ ...prev, limit: parseInt(e.target.value) }))}
                className="w-full p-2 rounded border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setSearchFilters(prev => ({ ...prev, onlineOnly: true, sortBy: 'recent' }))}
              className="px-3 py-1 text-xs bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors"
            >
              Online users
            </button>
            <button
              onClick={() => setSearchFilters(prev => ({ ...prev, sortBy: 'recent', limit: 10 }))}
              className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors"
            >
              Recently created
            </button>
            <button
              onClick={() => setSearchFilters(prev => ({ ...prev, sortBy: 'name', searchBy: 'name' }))}
              className="px-3 py-1 text-xs bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors"
            >
              Search names
            </button>
          </div>
        </div>
      )}

      {/* Search Results */}
      {(searchResults.length > 0 || (searchTerm && !isSearching) || searchFilters.onlineOnly) && (
        <div className="absolute left-2 right-2 sm:left-4 sm:right-4 mt-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600 shadow-lg max-h-72 overflow-y-auto z-20">
          {searchResults.length > 0 ? (
            <>
              <div className="px-3 py-2 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600 text-sm text-gray-600 dark:text-gray-400">
                Found {searchResults.length} user{searchResults.length !== 1 ? 's' : ''}
                {searchFilters.onlineOnly && ' (online only)'}
                <span className="text-xs text-gray-400 ml-2">• Right-click for options</span>
              </div>
              
              {searchResults.map((user) => {
                const displayName = getDisplayName(user);
                
                return (
                  <div
                    key={user.id}
                    className={`p-3 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors ${
                      blockedUsers.has(user.id) ? 'opacity-50 bg-red-50 dark:bg-red-900/20' : ''
                    }`}
                    onClick={() => startChat(user)}
                    onContextMenu={(e) => handleRightClick(e, user)}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <img
                          src={user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=3B82F6&color=fff&size=32`}
                          alt={displayName}
                          className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                          onError={(e) => {
                            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=random&color=fff&size=32`;
                          }}
                        />
                        {user.online && !blockedUsers.has(user.id) && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        )}
                        {blockedUsers.has(user.id) && (
                          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-red-400 border-2 border-white dark:border-gray-800 rounded-full"></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                          {displayName} {blockedUsers.has(user.id) && <span className="text-red-500 text-xs">(Blocked)</span>}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">ID: {user.id}</p>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-blue-600 dark:text-blue-400">
                            {blockedUsers.has(user.id) ? 'Right-click to unblock' : 'Click to chat • Right-click for options'}
                          </p>
                          {user.online && !blockedUsers.has(user.id) ? (
                            <span className="text-xs text-green-600 dark:text-green-400">Online</span>
                          ) : blockedUsers.has(user.id) ? (
                            <span className="text-xs text-red-500">Blocked</span>
                          ) : (
                            <span className="text-xs text-gray-400">Offline</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <p className="p-3 text-center text-sm text-gray-500 dark:text-gray-400">
              {searchTerm ? `No users found for "${searchTerm}"` : 'No users match the current filters'}
            </p>
          )}
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-2 z-50"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          <button
            onClick={() => startChat(contextMenu.user)}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Start Chat
          </button>
          
          <button
            onClick={() => deleteChat(contextMenu.user)}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Chat
          </button>

          {blockedUsers.has(contextMenu.user.id) ? (
            <button
              onClick={() => unblockUser(contextMenu.user)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-green-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
              Unblock User
            </button>
          ) : (
            <button
              onClick={() => blockUser(contextMenu.user)}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 text-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
              </svg>
              Block User
            </button>
          )}

          <hr className="my-1 border-gray-200 dark:border-gray-700" />
          
          <button
            onClick={() => {
              navigator.clipboard.writeText(contextMenu.user.id);
              alert('User ID copied to clipboard');
              setContextMenu(null);
            }}
            className="w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy User ID
          </button>
        </div>
      )}

      {/* Search Stats */}
      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex justify-between">
        <span>{allUsers.length} users available</span>
        {searchResults.length > 0 && (
          <span>{searchResults.length} results</span>
        )}
        {blockedUsers.size > 0 && (
          <span className="text-red-500">{blockedUsers.size} blocked</span>
        )}
      </div>
    </div>
  );
};

export default UserSearch;
