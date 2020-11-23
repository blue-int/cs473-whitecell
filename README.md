# Team WhiteCell: Like-Pin System

Our prototype should be opened from a mobile app or pressing F12 in Chrome to open the developer tool and use the responsive design of iPhone X. If you want to build and test our prototype, set up these environments.

If you don't know about the lifecycle of Vue, before review our code, please refer to [this link](https://v3.vuejs.org/guide/instance.html#lifecycle-hooks).

## Views

### Login.vue

We implemented Google login via Firebase API.

### Lobby.vue

In the Lobby, the user can **create a new room** or **enter another room.** We handle all rooms in the Firebase Database, and rooms have some information respectively: title, host information, viewers, chats, banned users, etc.

### Room.vue

In the Room, you can see a video and chats. We used Firebase Snapshots for real-time updates of the viewers and ban lists. If you are banned, the snapshot will kick you from the room automatically. Save viewers and chats on the DB with subcollection 'viewers' and 'chatList', respectively.

## Components

### ChatBox.vue

The Chatbox component is the most important part of our implementation.

The chatbox monitors the whole-chats in the room in real-time. The chatbox provides some useful information and functions:

- Show pin chat

When a chat got enough amount of like, it calculates its popularity(implemented as a method 'estEndTime'). If It's popularity is the biggest in the whole-chat, it is pinned soon. Since our popularity equation has a time-factor, the pinned chat will be replaced with a new-popular chat soon.

- Ban Chat (for the host)

There is a possibility that trollers pin toxic-chats. Here is our solution: ban chatter and the participants who liked toxic chats. We update the banned users' list atomically through Firebase Transaction.

- Show your popularity

To motivate active participation for users, we decided to show the user's popularity. You can see how many likes did you got in the stream and how many your chats were pinned. We chase these variables via Firebase Snapshot, too.

- Chat with dummy

In a real-streaming environment, a lot of users participate in the chat concurrently. At the prototyping level, however, we cannot recruit thousands of participants to debug. So, we made dummy chats to make the tester could feel the user is chatting with thousands of participants. We collected dummy chats from the Twitch clip and processed them as JS array (you can see dummy chats in '@/components/dummy.js'). If click the chat with dummy button(bottom right side of the room), the system pushes the dummy chats automatically with small intervals.
