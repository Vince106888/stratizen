// src/services/storage.js
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";   // <-- import storage instance here
import { updateUserProfile } from "./db"; 

export const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
export const IMAGE_MAX_SIZE = 2 * 1024 * 1024; // 2 MB

/**
 * Validate an image file (type + size).
 * @param {File} file
 * @param {number} maxSize
 * @returns {boolean}
 */
export function validateImageFile(file, maxSize = IMAGE_MAX_SIZE) {
  if (!file) return false;
  if (!VALID_IMAGE_TYPES.includes(file.type)) return false;
  if (file.size > maxSize) return false;
  return true;
}

/**
 * Upload a user image to Storage and return the download URL.
 *
 * @param {string} uid - user id
 * @param {File} file - File object from input
 * @param {string} imageKey - storage filename/key (default: "profilePicture")
 * @param {(progress:number, snapshot?:object)=>void} onProgress - optional progress callback (0-100)
 * @returns {Promise<string>} download URL
 */
export async function uploadUserImage(uid, file, imageKey = "profilePicture", onProgress) {
  if (!uid) throw new Error("UID is required");
  if (!file) throw new Error("File is required");

  if (!validateImageFile(file)) {
    throw new Error("Invalid file: only jpeg/png/gif/webp under 2MB allowed");
  }

  const storageRef = ref(storage, `users/${uid}/${imageKey}`);
  const metadata = { contentType: file.type };

  const uploadTask = uploadBytesResumable(storageRef, file, metadata);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (typeof onProgress === "function") onProgress(Math.round(progress), snapshot);
      },
      (error) => reject(error),
      async () => {
        try {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(url);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
}

/**
 * Delete a user's image from Storage.
 * @param {string} uid
 * @param {string} imageKey - storage filename/key (default: "profilePicture")
 * @returns {Promise<void>}
 */
export async function deleteUserImage(uid, imageKey = "profilePicture") {
  if (!uid) throw new Error("UID is required");
  const storageRef = ref(storage, `users/${uid}/${imageKey}`);
  await deleteObject(storageRef);
}

/**
 * Get download URL for an existing user image.
 * @param {string} uid
 * @param {string} imageKey - storage filename/key (default: "profilePicture")
 * @returns {Promise<string>} download URL
 */
export async function getUserImageUrl(uid, imageKey = "profilePicture") {
  if (!uid) throw new Error("UID is required");
  const storageRef = ref(storage, `users/${uid}/${imageKey}`);
  return await getDownloadURL(storageRef);
}

/**
 * Upload user profile photo and update Firestore user profile.
 * @param {string} uid
 * @param {File} file
 * @param {string} imageKey - storage filename/key (default: "profilePicture")
 * @returns {Promise<string>} download URL
 */
export async function saveProfilePhotoAndUpdateDB(uid, file, imageKey = "profilePicture") {
  if (!uid) throw new Error("UID is required");
  if (!file) throw new Error("File is required");

  // Upload image to Storage
  const imageUrl = await uploadUserImage(uid, file, imageKey);

  // Update Firestore profile document with new image URL
  const updateData = {};
  updateData[imageKey] = imageUrl;
  await updateUserProfile(uid, updateData);

  return imageUrl;
}
