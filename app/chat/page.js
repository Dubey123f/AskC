// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useUser } from '@clerk/nextjs';
// import { StreamChat } from 'stream-chat';
// import { Chat, ChannelList, Channel, Window, ChannelHeader, MessageList, MessageInput, Thread } from 'stream-chat-react';
// import UserSearch from '../../components/UserSearch';
// import AllUsers from '../../components/AllUsers';
// import 'stream-chat-react/dist/css/v2/index.css';

// const ChatPage = () => {
//   const { isLoaded, isSignedIn, user } = useUser();
//   const [client, setClient] = useState(null);
//   const [channel, setChannel] = useState(null);
//   const [showAllUsers, setShowAllUsers] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState(false);

//   useEffect(() => {
//     if (!isLoaded || !isSignedIn) return;

//     const initializeChat = async () => {
//       const apiKey = "hc8qx6vcvtcq"; // Replace with your actual API key
//       const userToken = user.publicMetadata.token;

//       if (!userToken) {
//         console.error('User token is missing');
//         return;
//       }

//       try {
//         const chatClient = StreamChat.getInstance(apiKey);
        
//         await chatClient.connectUser(
//           {
//             id: user.id,
//             name: user.fullName,
//             image: user.profileImageUrl,
//           },
//           userToken
//         );

//         setClient(chatClient);
//       } catch (error) {
//         console.error('Error connecting to chat:', error);
//       }
//     };

//     initializeChat();

//     return () => {
//       if (client) {
//         client.disconnectUser();
//       }
//     };
//   }, [isLoaded, isSignedIn, user]);

//   const handleChannelSelect = (channel) => {
//     setChannel(channel);
//     setSidebarOpen(false); // Close sidebar on mobile when channel is selected
//   };

//   const handleChatStart = (newChannel) => {
//     setChannel(newChannel);
//     setSidebarOpen(false); // Close sidebar on mobile when chat starts
//   };

//   const clearCurrentChat = () => {
//     setChannel(null);
//   };

//   if (!isLoaded) return <div>Loading...</div>;
//   if (!isSignedIn) return <div>Please sign in to access chat</div>;
//   if (!client) return <div>Setting up chat client...</div>;

//   return (
//     <div className="flex flex-col h-screen">
//       {/* Mobile header */}
//       <div className="md:hidden flex items-center justify-between p-3 border-b bg-gray-50">
//         <button
//           onClick={() => setSidebarOpen(!sidebarOpen)}
//           className="p-2 text-gray-600 focus:outline-none"
//         >
//           <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             {sidebarOpen ? (
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             ) : (
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
//             )}
//           </svg>
//         </button>
//         <h2 className="font-semibold text-gray-700">Private Chat</h2>
//         {channel && (
//           <button
//             onClick={clearCurrentChat}
//             className="p-2 text-gray-600 focus:outline-none"
//             title="Close chat"
//           >
//             <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         )}
//       </div>

//       <Chat client={client} className="flex-1">
//         <div className="flex h-full">
//           {/* Sidebar */}
//           <div className={`fixed md:static top-0 left-0 h-full w-64 bg-white border-r z-30 transform ${
//             sidebarOpen ? 'translate-x-0' : '-translate-x-full'
//           } transition-transform duration-200 ease-in-out md:translate-x-0`}>
            
//             {/* Desktop header */}
//             <div className="p-4 border-b hidden md:block">
//               <div className="flex justify-between items-center">
//                 <h2 className="text-lg font-semibold">Private Chat</h2>
//                 <button
//                   onClick={clearCurrentChat}
//                   className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
//                   title="Clear current chat"
//                 >
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>
//             </div>

//             {/* Toggle users button */}
//             <div className="p-4 border-b">
//               <button
//                 onClick={() => setShowAllUsers(!showAllUsers)}
//                 className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
//               >
//                 {showAllUsers ? 'Hide Users' : 'Show All Users'}
//               </button>
//             </div>

//             <UserSearch client={client} currentUser={user} onChatStart={handleChatStart} />

//             {showAllUsers && (
//               <AllUsers client={client} currentUser={user} onChatStart={handleChatStart} />
//             )}

//             <div className="border-t">
//               <ChannelList
//                 filters={{ type: 'messaging', members: { $in: [user.id] } }}
//                 sort={{ last_message_at: -1 }}
//                 options={{ limit: 10 }}
//                 onSelect={handleChannelSelect}
//               />
//             </div>
//           </div>

//           {/* Overlay for mobile */}
//           {sidebarOpen && (
//             <div
//               className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
//               onClick={() => setSidebarOpen(false)}
//             />
//           )}

//           {/* Chat area */}
//           <div className="flex-1 flex flex-col">
//             {channel ? (
//               <Channel channel={channel}>
//                 <Window>
//                   <ChannelHeader />
//                   <MessageList />
//                   <MessageInput />
//                 </Window>
//                 <Thread />
//               </Channel>
//             ) : (
//               <div className="flex flex-col items-center justify-center h-full bg-gray-100">
//                 <h2 className="text-xl sm:text-2xl font-semibold text-gray-600 mb-2 text-center">
//                   Welcome to Private Chat
//                 </h2>
//                 <p className="text-gray-500 text-center px-2 mb-4">
//                   Search for users above or select an existing conversation to start chatting
//                 </p>
//                 <div className="text-sm text-gray-400 space-y-1 text-center">
//                   <p>• Right-click on users for more options</p>
//                   <p>• Block/unblock users</p>
//                   <p>• Delete chat history</p>
//                   <p>• Copy user IDs</p>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </Chat>
//     </div>
//   );
// };

// export default ChatPage;


'use client';

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { StreamChat } from 'stream-chat';
import { Chat, ChannelList, Channel, Window, ChannelHeader, MessageList, MessageInput, Thread, LoadingIndicator } from 'stream-chat-react';
import UserSearch from '../../components/UserSearch';
import AllUsers from '../../components/AllUsers';
import 'stream-chat-react/dist/css/v2/index.css';

const ChatPage = () => {
  const { isLoaded, isSignedIn, user } = useUser();
  const [client, setClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [showAllUsers, setShowAllUsers] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;

    const initializeChat = async () => {
      try {
        setIsConnecting(true);
        setConnectionError(null);

        const apiKey = "hc8qx6vcvtcq"; // Replace with your actual API key
        
        // Try to get token from user metadata first
        let userToken = user.publicMetadata.token;
        
        // If no token in metadata, try to get from API
        if (!userToken) {
          try {
            const response = await fetch('/api/stream-token', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ userId: user.id }),
            });
            
            if (response.ok) {
              const { token } = await response.json();
              userToken = token;
            }
          } catch (fetchError) {
            console.warn('Could not fetch token from API, falling back to dev token');
          }
        }

        const chatClient = StreamChat.getInstance(apiKey);
        
        // If still no token, use dev token (for development only)
        if (!userToken) {
          userToken = chatClient.devToken(user.id);
          console.warn('Using dev token - not suitable for production');
        }
        
        await chatClient.connectUser(
          {
            id: user.id,
            name: user.fullName || user.firstName || user.emailAddresses[0]?.emailAddress || user.id,
            image: user.imageUrl,
            email: user.emailAddresses[0]?.emailAddress,
          },
          userToken
        );

        setClient(chatClient);
      } catch (error) {
        console.error('Error connecting to chat:', error);
        setConnectionError(error.message);
      } finally {
        setIsConnecting(false);
      }
    };

    initializeChat();

    return () => {
      if (client) {
        client.disconnectUser();
      }
    };
  }, [isLoaded, isSignedIn, user]);

  const handleChannelSelect = (selectedChannel) => {
    setChannel(selectedChannel);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleChatStart = (newChannel) => {
    setChannel(newChannel);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const clearCurrentChat = () => {
    setChannel(null);
  };

  // Loading states
  if (!isLoaded || isConnecting) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <LoadingIndicator size={40} />
          <p className="mt-4 text-gray-600">
            {!isLoaded ? 'Loading user data...' : 'Connecting to chat...'}
          </p>
        </div>
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Access Restricted</h2>
          <p className="text-gray-600">Please sign in to access the chat application.</p>
        </div>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center p-6 bg-white rounded-lg shadow-md max-w-md">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Connection Error</h2>
          <p className="text-gray-600 mb-4">{connectionError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <LoadingIndicator size={40} />
          <p className="mt-4 text-gray-600">Initializing chat...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Mobile header */}
      <div className="md:hidden flex items-center justify-between p-3 border-b bg-white shadow-sm">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {sidebarOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        <h2 className="font-semibold text-gray-700">
          {channel ? 'Chat' : 'Private Chat'}
        </h2>
        {channel && (
          <button
            onClick={clearCurrentChat}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition"
            title="Close chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      <Chat client={client} className="flex-1">
        <div className="flex h-full">
          {/* Sidebar */}
          <div className={`fixed md:static top-0 left-0 h-full w-80 bg-white border-r shadow-lg z-30 transform ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } transition-transform duration-300 ease-in-out md:translate-x-0`}>
            
            {/* Desktop header */}
            <div className="p-4 border-b hidden md:block bg-gray-50">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-800">Private Chat</h2>
                <button
                  onClick={clearCurrentChat}
                  className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition"
                  title="Clear current chat"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* User Status */}
            <div className="p-4 border-b bg-blue-50">
              <div className="flex items-center space-x-3">
                <img
                  src={user.imageUrl}
                  alt={user.fullName || user.firstName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {user.fullName || user.firstName || 'User'}
                  </p>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm text-gray-600">Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Search Users - This component has delete/block functionality */}
            <UserSearch client={client} currentUser={user} onChatStart={handleChatStart} />

            {/* Toggle All Users */}
            <div className="p-4 border-b">
              <button
                onClick={() => setShowAllUsers(!showAllUsers)}
                className="w-full p-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
                <span>{showAllUsers ? 'Hide All Users' : 'Show All Users'}</span>
              </button>
            </div>

            {/* All Users Component */}
            {showAllUsers && (
              <div className="border-b">
                <AllUsers client={client} currentUser={user} onChatStart={handleChatStart} />
              </div>
            )}

            {/* Channel List */}
            <div className="flex-1 overflow-hidden">
              <div className="p-3 bg-gray-50 border-b">
                <h3 className="text-sm font-medium text-gray-700">Recent Conversations</h3>
              </div>
              <div className="h-full overflow-y-auto">
                <ChannelList
                  filters={{ type: 'messaging', members: { $in: [user.id] } }}
                  sort={{ last_message_at: -1 }}
                  options={{ limit: 20 }}
                  onSelect={handleChannelSelect}
                  showChannelSearch={true}
                />
              </div>
            </div>
          </div>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            {channel ? (
              <Channel channel={channel}>
                <Window>
                  <ChannelHeader />
                  <MessageList />
                  <MessageInput />
                </Window>
                <Thread />
              </Channel>
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-gradient-to-br from-blue-50 to-gray-100">
                <div className="text-center max-w-md mx-auto p-6">
                  <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-700 mb-3">
                    Welcome to Private Chat
                  </h2>
                  <p className="text-gray-500 mb-6 leading-relaxed">
                    Search for users in the sidebar or select an existing conversation to start chatting securely.
                  </p>
                  
                  {/* Feature highlights */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Search & find users</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Block/unblock users</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Real-time messaging</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Delete chat history</span>
                    </div>
                  </div>

                  {/* Quick action button */}
                  <button
                    onClick={() => setSidebarOpen(true)}
                    className="mt-6 md:hidden px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center space-x-2 mx-auto"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span>Find Users to Chat</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </Chat>
    </div>
  );
};

export default ChatPage;
