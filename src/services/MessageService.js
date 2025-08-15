// Dummy in-memory data for MVP
let messages = [];
const dummyUsers = [
  "Alice",
  "Bob",
  "Charlie",
  "Diana",
  "Ethan"
];

export const MessageService = {
  getUsers: async () => {
    return dummyUsers;
  },

  getConversation: async (currentUser, selectedUser) => {
    return messages.filter(
      (m) =>
        (m.sender === currentUser && m.receiver === selectedUser) ||
        (m.sender === selectedUser && m.receiver === currentUser)
    );
  },

  sendMessage: async ({ sender, receiver, content }) => {
    messages.push({
      sender,
      receiver,
      content,
      timestamp: Date.now(),
    });

    // Simulate auto-reply from receiver after 1 second
    setTimeout(() => {
      messages.push({
        sender: receiver,
        receiver: sender,
        content: `Auto-reply from ${receiver}: "${content}"`,
        timestamp: Date.now(),
      });
    }, 1000);
  },
};
