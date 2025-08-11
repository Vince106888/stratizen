import Dexie from 'dexie';
import CryptoJS from 'crypto-js';

const db = new Dexie('P2P_MessageDB');
db.version(1).stores({
  messages: '++id,sender,receiver,timestamp',
});

const SECRET_KEY = 'supersecretkey123'; // Replace with session key or per-user key in production

function encryptMessage(text) {
  return CryptoJS.AES.encrypt(text, SECRET_KEY).toString();
}

function decryptMessage(cipherText) {
  try {
    return CryptoJS.AES.decrypt(cipherText, SECRET_KEY).toString(CryptoJS.enc.Utf8);
  } catch (err) {
    return '[Decryption Failed]';
  }
}

function getConversationId(userA, userB) {
  // Simple consistent id: sorted concatenation
  return [userA, userB].sort().join('_');
}

export const MessageService = {
  async sendMessage({ sender, receiver, content }) {
    const encrypted = encryptMessage(content);
    const timestamp = Date.now();

    await db.messages.add({
      sender,
      receiver,
      content: encrypted,
      timestamp,
    });
  },

  async getConversation(userA, userB) {
    const messages = await db.messages
      .where('timestamp')
      .between(0, Date.now())
      .toArray();

    return messages
      .filter(
        (msg) =>
          (msg.sender === userA && msg.receiver === userB) ||
          (msg.sender === userB && msg.receiver === userA)
      )
      .sort((a, b) => a.timestamp - b.timestamp)
      .map((msg) => ({
        ...msg,
        content: decryptMessage(msg.content),
      }));
  },

  async getUserConversations(userId) {
    // Get all messages where user is sender or receiver
    const messages = await db.messages
      .where('timestamp')
      .between(0, Date.now())
      .toArray();

    // Filter to those involving userId
    const relevant = messages.filter(
      (msg) => msg.sender === userId || msg.receiver === userId
    );

    // Group by conversation partner (the other user)
    const convosMap = new Map();

    for (const msg of relevant) {
      const otherUser = msg.sender === userId ? msg.receiver : msg.sender;
      const convId = getConversationId(userId, otherUser);

      if (!convosMap.has(convId)) {
        convosMap.set(convId, {
          conversationId: convId,
          participantId: otherUser,
          lastMessage: decryptMessage(msg.content),
          lastTimestamp: msg.timestamp,
          unreadCount: 0, // You can implement unread tracking here if you want
        });
      } else {
        // Update last message if newer
        const convo = convosMap.get(convId);
        if (msg.timestamp > convo.lastTimestamp) {
          convo.lastMessage = decryptMessage(msg.content);
          convo.lastTimestamp = msg.timestamp;
        }
      }
    }

    // Convert Map values to array, sort by lastTimestamp desc
    return Array.from(convosMap.values()).sort(
      (a, b) => b.lastTimestamp - a.lastTimestamp
    );
  },
};
