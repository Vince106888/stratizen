import Dexie from 'dexie';
import { db as cloudDB } from './firebase.js';
import { doc, setDoc } from 'firebase/firestore';

// Initialize the Dexie database
export const db = new Dexie('P2PPlatformDB');

// Define the schema for the database with indexes
db.version(1).stores({
  profiles: '++id, name, email, bio, username', // Added username index for profile
  marketplace: '++id, title, description, price, userId, timestamp', // Indexed by userId for better queries
  messages: '++id, senderId, receiverId, content, timestamp' // Indexed by senderId, receiverId for better querying
});

// Helper functions for CRUD operations

// Profiles CRUD Operations

// Add a new profile
export const addProfile = async (profile) => {
  try {
    const id = await db.profiles.add(profile);
    console.log(`Profile added with ID: ${id}`);
    return id;
  } catch (error) {
    console.error("Error adding profile: ", error);
  }
};

// Get a profile by ID
export const getProfile = async (id) => {
  try {
    const profile = await db.profiles.get(id);
    return profile;
  } catch (error) {
    console.error("Error fetching profile: ", error);
  }
};

// Update a profile
export const updateProfile = async (id, updatedProfile) => {
  try {
    const updated = await db.profiles.update(id, updatedProfile);
    return updated;
  } catch (error) {
    console.error("Error updating profile: ", error);
  }
};

// Delete a profile
export const deleteProfile = async (id) => {
  try {
    await db.profiles.delete(id);
    console.log(`Profile with ID ${id} deleted.`);
  } catch (error) {
    console.error("Error deleting profile: ", error);
  }
};

// Marketplace CRUD Operations

// Add a new marketplace listing
export const addListing = async (listing) => {
  try {
    const id = await db.marketplace.add(listing);
    console.log(`Listing added with ID: ${id}`);
    return id;
  } catch (error) {
    console.error("Error adding listing: ", error);
  }
};

// Get all marketplace listings
export const getAllListings = async () => {
  try {
    const listings = await db.marketplace.toArray();
    return listings;
  } catch (error) {
    console.error("Error fetching listings: ", error);
  }
};

// Get marketplace listing by ID
export const getListingById = async (id) => {
  try {
    const listing = await db.marketplace.get(id);
    return listing;
  } catch (error) {
    console.error("Error fetching listing: ", error);
  }
};

// Delete a marketplace listing
export const deleteListing = async (id) => {
  try {
    await db.marketplace.delete(id);
    console.log(`Listing with ID ${id} deleted.`);
  } catch (error) {
    console.error("Error deleting listing: ", error);
  }
};

// Messages CRUD Operations

// Add a new message
export const addMessage = async (message) => {
  try {
    const id = await db.messages.add(message);
    console.log(`Message added with ID: ${id}`);
    return id;
  } catch (error) {
    console.error("Error adding message: ", error);
  }
};

// Get messages between two users
export const getMessagesBetweenUsers = async (userId1, userId2) => {
  try {
    const messages = await db.messages
      .where('senderId')
      .equals(userId1)
      .and((message) => message.receiverId === userId2)
      .toArray();
    return messages;
  } catch (error) {
    console.error("Error fetching messages: ", error);
  }
};

// Get all messages of a user (sent or received)
export const getMessagesByUser = async (userId) => {
  try {
    const messages = await db.messages
      .where('senderId')
      .equals(userId)
      .or('receiverId')
      .equals(userId)
      .toArray();
    return messages;
  } catch (error) {
    console.error("Error fetching user's messages: ", error);
  }
};

// Delete a message
export const deleteMessage = async (id) => {
  try {
    await db.messages.delete(id);
    console.log(`Message with ID ${id} deleted.`);
  } catch (error) {
    console.error("Error deleting message: ", error);
  }
};

// Sync with Cloud (Firebase)

export const syncWithCloud = async () => {
  try {
    // Sync Profiles
    const profiles = await db.profiles.toArray();
    profiles.forEach(async (profile) => {
      await firebase.firestore().collection('profiles').doc(profile.id.toString()).set(profile);
    });

    // Sync Marketplace Listings
    const listings = await db.marketplace.toArray();
    listings.forEach(async (listing) => {
      await firebase.firestore().collection('marketplace').doc(listing.id.toString()).set(listing);
    });

    // Sync Messages
    const messages = await db.messages.toArray();
    messages.forEach(async (message) => {
      await firebase.firestore().collection('messages').doc(message.id.toString()).set(message);
    });

    console.log('Data synced with cloud');
  } catch (error) {
    console.error('Error syncing with cloud:', error);
  }
};

// Offline Sync Queue

const offlineQueue = [];

// Add to the offline queue if there's no internet connection
export const addToOfflineQueue = (operation, data) => {
  offlineQueue.push({ operation, data });
  console.log(`Added operation to offline queue: ${operation}`);
};

// Retry syncing offline operations once the connection is restored
export const retryOfflineQueue = async () => {
  if (navigator.onLine) {
    while (offlineQueue.length > 0) {
      const { operation, data } = offlineQueue.shift();
      try {
        switch (operation) {
          case 'addProfile':
            await addProfile(data);
            break;
          case 'addListing':
            await addListing(data);
            break;
          case 'addMessage':
            await addMessage(data);
            break;
          // Add other operations as necessary
          default:
            console.error('Unknown operation:', operation);
        }
      } catch (error) {
        console.error('Error retrying operation from offline queue:', error);
      }
    }
  }
};

// Monitor network status and retry syncing when back online
window.addEventListener('online', retryOfflineQueue);
window.addEventListener('offline', () => console.log('You are offline, data will sync once back online.'));
