import Dexie from 'dexie';
import CryptoJS from 'crypto-js';

const db = new Dexie('P2P_MessageDB');
db.version(1).stores({
  messages: '++id,sender,receiver,timestamp'
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
};
