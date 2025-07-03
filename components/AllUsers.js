'use client';

import React, { useState, useEffect } from 'react';

const AllUsers = ({ client, currentUser, onChatStart }) => {
  const [allUsers, setAllUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const createChannelId = (userId1, userId2) => {
    const sortedIds = [userId1, userId2].sort();
    const combined = sortedIds.join('-');
    if (combined.length > 60) {
      let hash = 0;
      for (let i = 0; i < combined.length; i++) {
        hash = ((hash << 5) - hash) + combined.charCodeAt(i);
        hash &= hash;
      }
      return `dm-${Math.abs(hash).toString(36)}`;
    }
    return `dm-${combined}`;
  };

  useEffect(() => {
    const fetchAllUsers = async () => {
      setIsLoading(true);
      try {
        const response = await client.queryUsers(
          { id: { $ne: currentUser.id }, role: { $ne: 'admin' } },
          { id: 1, name: 1, image: 1, created_at: -1 },
          { limit: 50, presence: true }
        );
        setAllUsers(response.users || []);
      } catch (error) {
        console.error('Error fetching users:', error);
        setAllUsers([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (client && currentUser) fetchAllUsers();
  }, [client, currentUser]);

  const startChat = async (targetUser) => {
    try {
      const channelId = createChannelId(currentUser.id, targetUser.id);
      const channel = client.channel('messaging', channelId, {
        members: [currentUser.id, targetUser.id],
        name: `${currentUser.fullName || currentUser.name} & ${targetUser.name}`,
        created_by_id: currentUser.id,
      });

      // ✅ Always watch after create to make sure it’s active
      await channel.create();
      await channel.watch();

      onChatStart(channel);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  const getDisplayName = (user) => user.name || user.fullName || user.id || 'Unknown User';
  const getUserImage = (user) =>
    user.image || user.profileImageUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName(user))}&background=3B82F6&color=fff`;

  return (
    <div className="p-3 sm:p-4 border-b bg-white dark:bg-gray-900">
      <h3 className="text-base sm:text-lg font-semibold mb-3 text-gray-800 dark:text-gray-100">
        Available Users ({allUsers.length})
      </h3>

      {isLoading && (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading users...</p>
        </div>
      )}

      <div className="space-y-1 max-h-[calc(100vh-200px)] overflow-y-auto">
        {allUsers.map((user) => (
          <div
            key={user.id}
            className="flex items-center gap-3 p-2 sm:p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded cursor-pointer transition"
            onClick={() => startChat(user)}
          >
            <div className="relative flex-shrink-0">
              <img
                src={getUserImage(user)}
                alt={getDisplayName(user)}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(getDisplayName(user))}&background=3B82F6&color=fff`;
                }}
              />
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full"></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                {getDisplayName(user)}
              </p>
              <p className="text-xs text-gray-500 truncate">ID: {user.id}</p>
              <p className="text-xs text-blue-600">Click to start chat</p>
            </div>
          </div>
        ))}
      </div>

      {!isLoading && allUsers.length === 0 && (
        <div className="text-center py-8">
          <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
          </svg>
          <p className="text-gray-500">No other users found</p>
          <p className="text-xs text-gray-400 mt-1">Users will appear here once they join</p>
        </div>
      )}

      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-700 dark:text-gray-300">
          <p><strong>Debug Info:</strong></p>
          <p>Current User: {currentUser?.fullName || currentUser?.name || currentUser?.id}</p>
          <p>Total Users Found: {allUsers.length}</p>
        </div>
      )}
    </div>
  );
};

export default AllUsers;
