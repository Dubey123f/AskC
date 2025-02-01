 import { StreamChat } from "stream-chat"

import { clerkClient } from '@clerk/nextjs/server'
// const api_key = "hc8qx6vcvtcq";
// const api_secret = "a6j5q9g6bdyux7bn2tbetd6th25sdzpth3p26d8j7x4qzf2n67cqu4y6v2uc3gkh";
// const api_key = process.env.STREAM_API_KEY;
// const api_secret = process.env.STREAM_API_SECRET;
// const user_id = "user_2sDVVVsJYpNF4EHWtkkMGvYo6yp";
// const serverClient = StreamChat.getInstance(api_key, api_secret);
// Create User Token
// const token = serverClient.createToken(user_id);
// console.log(token);
// const user = await request.json()
// const token = serverClient.createToken(user.data.id);
function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}
export async function POST(request) {
    const serverClient = StreamChat.getInstance(process.env.STREAM_API_KEY, process.env.STREAM_API_SECRET);
    const user = await request.json()
    const token = serverClient.createToken(user.data.id);
    console.log("A NEW USER HAS BEEN CREATED", token);
    const client = await clerkClient()
await serverClient.upsertUser({
    id: user.data.id,
  })
  await client.users.updateUserMetadata(user.data.id, {
    publicMetadata: {
token: token
    },
  })

// await clerkClient.users.updateUser(user.data.id, {
//   publicMetadata: {
//     token: token,
//   },
// });
  const slugs = ["Python-new", "Javascript-new", "Java-new", "Cpp-new", "Go-new", "Ruby-new"];
slugs.forEach(async(item)=> {
  const channel = serverClient.channel('messaging', item, {
    image: 'https://getstream.io/random_png/?name=react',
    name: capitalize(item) + ' Discussion',
    members: [user.data.id],
    created_by_id: user.data.id,
  });
  await channel.create();
  channel.addMembers([user.data.id]);








    
  });
    return Response.json({ message: 'Hello World' })
  }


// import { StreamChat } from 'stream-chat';
// import { clerkClient } from '@clerk/nextjs/server';  // Correct import for Next.js

// const api_key = "t4dehsg52byh";
// const api_secret = "9te85zv7cxffxcqr6p2zcdk67cj3ck2k2xj4y36p5xss5p65h4k4rvfy74phwh3g";
// const serverClient = StreamChat.getInstance(api_key, api_secret);

// export async function POST(request) {
//   try {
//     const user = await request.json();
//     console.log('Received user data:', user);

//     if (!user.data || !user.data.id || !user.data.first_name || !user.data.last_name || !user.data.image_url) {
//       throw new Error('User data is incomplete');
//     }

//     const token = serverClient.createToken(user.data.id);
//     console.log("A NEW USER HAS BEEN CREATED", token);

//     await serverClient.upsertUser({
//       id: user.data.id,
//       name: `${user.data.first_name} ${user.data.last_name}`,
//       image: user.data.image_url,
//     });

//     // Ensure the method exists before calling it
//     if (!clerkClient?.users?.updateUserMetadata) {
//       throw new Error("updateUserMetadata method is unavailable.");
//     }

//     console.log("Updating user metadata for:", user.data.id);

//     await clerkClient.users.updateUserMetadata(user.data.id, {
//       publicMetadata: {
//         token: token,
//       },
//     });

//     const slugs = ["Python", "Javascript", "Java", "C Plus Plus", "Go", "Ruby"];
//     for (const item of slugs) {
//       const channel = serverClient.channel('messaging', item, {
//         name: `${item} Discussion`,
//         members: [user.data.id],
//         created_by_id: user.data.id,
//       });
//       await channel.create();
//       await channel.addMembers([user.data.id]);
//     }

//     return new Response(JSON.stringify({ message: 'User and channels created successfully' }), {
//       headers: { 'Content-Type': 'application/json' },
//     });
//   } catch (error) {
//     console.error('Error creating user or channels:', error);
//     return new Response(JSON.stringify({ error: error.message }), {
//       status: 500,
//       headers: { 'Content-Type': 'application/json' },
//     });
//   }
// }



