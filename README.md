# README

Before you start, you should use a Google Account to use our system. Please prepare if you don't have one. Also, the UI supports only a mobile environment. Please use our prototype through a mobile device or press F12 in Chrome to open the developer tool and use the responsive design of iPhone X.

If you don't know about lifecycle of Vue, before review our code, please refer to [this link](https://v3.vuejs.org/guide/instance.html#lifecycle-hooks).

## Views

### Login.vue

We implemented Google login via Firebase API.

### Lobby.vue

In the Lobby, the user can **create a new room** or **enter another room.** We handle all rooms in the Cloud Firestore, and rooms have some information respectively: title, host information, viewers, chats, banned users, etc.

### Room.vue

In the Room, you can see a video and chats. We used Cloud Firestore for real-time updates of the viewers and ban lists. If you are banned, the router will kick you from the room automatically. Save viewers and chats on the DB with subcollection 'viewers' and 'chatList', respectively.

## Components

### ChatBox.vue

The ChatBox component is the most important part of our implementation.

The ChatBox monitors the whole chats of the room in real-time. The ChatBox provides some useful information and functions:

- Show pin chat

  When a chat gets a sufficient amount of like, it calculates its own popularity(implemented as a method 'estEndTime'). If It's popularity is the biggest in the whole chat, it is pinned. Since our popularity equation has a time-factor, as time flows, the pinned chat will be replaced with the popular chat at that point.

- Ban Chat (for the host)

  There is a possibility that trollers pin toxic chats. Here is our solution: ban the chatter and the participants who liked toxic chats at the same time. We update the banned users list atomically through Firebase Transaction.

- Show your popularity

  To motivate active participation for users, we decided to show the user's popularity. You can see how many likes you got in the stream and how many of your chats were pinned. We chase these variables via the Cloud Firestore, too.

- Chat with dummy

  In a real-streaming environment, a lot of users participate in the chat concurrently. At the prototyping level, however, we cannot recruit thousands of participants. So, we made dummy chats to make the tester feel as he/she is chatting with thousands of participants. We collected dummy chats from the Twitch clip and processed them as JS array (you can see dummy chats in '@/components/dummy.js'). If you click the 'dummy chat' button at the bottom right side of the room, the system pushes the dummy chats to the database automatically with appropriate intervals.
