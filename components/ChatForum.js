

// 'use client'
// import React from 'react'
// import { useState, useEffect } from 'react';

// import { useCreateChatClient, Chat, Channel, ChannelHeader, MessageInput, MessageList, Thread, Window } from 'stream-chat-react';
// import { useUser } from '@clerk/nextjs';
// import 'stream-chat-react/dist/css/v2/index.css';
// function capitalize(str) {
//   return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
// }
// const ChatForum = ({clerkUser,slug}) => {
// const apiKey = process.env.STREAM_API_KEY;
// const userId = clerkUser.id;
// const userName = clerkUser.name;

// const userToken = clerkUser.token;
// console.log(userToken);

// const user = {
//   id: userId,
//   name: userName,
//   image: `https://getstream.io/random_png/?name=${userName}`,
// };
// const [channel, setChannel] = useState();
// const client = useCreateChatClient({
//   apiKey,
//   tokenOrProvider: userToken,
//   userData: user,
// });

// useEffect(() => {
//   if (!client) return;

//   const channel = client.channel('messaging', slug, {
//     image: 'https://getstream.io/random_png/?name=react',
//     name: capitalize(slug) + ' Discussion',
//     members: [userId],
//   });

//   setChannel(channel);
//   // channel.addMembers([userId]);
// }, [client, slug, userId]);

// if (!client) return <div>Setting up client & connection...</div>;

// return (
//   <Chat client={client}>
//     <Channel channel={channel}>
//       <Window>
//         <ChannelHeader />
//         <MessageList />
//         <MessageInput />
//       </Window>
//       <Thread />
//     </Channel>
//   </Chat>
// );
// }

// export default ChatForum
'use client'
import React, { useState, useEffect } from 'react';
import { 
  useCreateChatClient, 
  Chat, 
  Channel, 
  ChannelHeader, 
  MessageInput, 
  MessageList, 
  Thread, 
  Window 
} from 'stream-chat-react';
import { useUser } from '@clerk/nextjs';
import 'stream-chat-react/dist/css/v2/index.css';

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

const ChatForum = ({ clerkUser, slug }) => {
  const apiKey = process.env.STREAM_API_KEY;
  const userId = clerkUser.id;
  const userName = clerkUser.name;
  const userToken = clerkUser.token;

  const user = {
    id: userId,
    name: userName,
    image: `https://getstream.io/random_png/?name=${userName}`,
  };

  const [channel, setChannel] = useState();
  const client = useCreateChatClient({
    apiKey,
    tokenOrProvider: userToken,
    userData: user,
  });

  useEffect(() => {
    if (!client) return;

    const initChannel = async () => {
      const c = client.channel('messaging', slug, {
        image: 'https://getstream.io/random_png/?name=react',
        name: capitalize(slug) + ' Discussion',
        members: [userId],
      });
      await c.watch();
      setChannel(c);
    };

    initChannel();
  }, [client, slug, userId]);

  if (!client || !channel) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        Setting up chat...
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen md:h-[80vh] bg-white">
      <Chat client={client} theme="messaging light">
        <Channel channel={channel}>
          <div className="flex flex-col md:flex-row h-full">
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput />
            </Window>
            <Thread />
          </div>
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatForum;






// 'use client'
// import React from 'react'
// import { useState, useEffect } from 'react';
// import { useCreateChatClient, Chat, Channel, ChannelHeader, MessageInput, MessageList, Thread, Window } from 'stream-chat-react';
// import 'stream-chat-react/dist/css/v2/index.css';

// function capitalize(str) {
//   return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
// }

// const ChatForum = ({ clerkUser, slug }) => {
//   if (!clerkUser) {
//     console.error('clerkUser is undefined');
//     return <div>Error: User data is missing</div>;
//   }

//   const apiKey = 't4dehsg52byh';
//   const userId = clerkUser.id;
//   const userName = clerkUser.name;
//   const userToken = clerkUser.token;

//   const user = {
//     id: userId,
//     name: userName,
//     image: `https://getstream.io/random_png/?name=${userName}`,
//   };

//   const [channel, setChannel] = useState();
//   const client = useCreateChatClient({
//     apiKey,
//     tokenOrProvider: userToken,
//     userData: user,
//   });

//   useEffect(() => {
//     if (!client) return;

//     const channel = client.channel('messaging', slug, {
//       image: 'https://getstream.io/random_png/?name=react',
//       name: capitalize(slug.replace(/-/g, ' ')) + ' Discussion',
//       members: [userId],
//     });

//     setChannel(channel);
//   }, [client, slug, userId]);

//   if (!client || !channel) return <div>Setting up client & connection...</div>;

//   return (
//     <Chat client={client}>
//       <Channel channel={channel}>
//         <Window>
//           <ChannelHeader />
//           <MessageList />
//           <MessageInput />
//         </Window>
//         <Thread />
//       </Channel>
//     </Chat>
//   );
// }

// export default ChatForum;
