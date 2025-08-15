// src/services/storage.js
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";
import { updateUserProfile } from "./db";

export const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
export const IMAGE_MAX_SIZE = 2 * 1024 * 1024; // 2 MB

/**
 * Validate an image file (type + size).
 */
export function validateImageFile(file, maxSize = IMAGE_MAX_SIZE) {
  if (!file) return false;
  if (!VALID_IMAGE_TYPES.includes(file.type)) return false;
  if (file.size > maxSize) return false;
  return true;
}

/**
 * Generic image upload function.
 *
 * @param {string} path - Storage path (e.g., "users/uid/profilePicture" or "marketplace/itemId/thumbnail")
 * @param {File} file - File object from input
 * @param {(progress:number, snapshot?:object)=>void} [onProgress] - Optional progress callback (0-100)
 * @returns {Promise<string>} - Download URL
 */
export async function uploadImage(path, file, onProgress) {
  if (!path) throw new Error("Storage path is required");
  if (!file) throw new Error("File is required");

  if (!validateImageFile(file)) {
    throw new Error("Invalid file: only jpeg/png/gif/webp under 2MB allowed");
  }

  const storageRef = ref(storage, path);
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
 * Generic delete function for any storage path.
 */
export async function deleteImage(path) {
  if (!path) throw new Error("Storage path is required");
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

/**
 * Generic get URL function for any storage path.
 */
export async function getImageUrl(path) {
  if (!path) throw new Error("Storage path is required");
  const storageRef = ref(storage, path);
  return await getDownloadURL(storageRef);
}

/**
 * Convenience wrapper: Upload a user image.
 */
export function uploadUserImage(uid, file, imageKey = "profilePicture", onProgress) {
  return uploadImage(`users/${uid}/${imageKey}`, file, onProgress);
}

/**
 * Convenience wrapper: Delete a user image.
 */
export function deleteUserImage(uid, imageKey = "profilePicture") {
  return deleteImage(`users/${uid}/${imageKey}`);
}

/**
 * Convenience wrapper: Get user image URL.
 */
export function getUserImageUrl(uid, imageKey = "profilePicture") {
  return getImageUrl(`users/${uid}/${imageKey}`);
}

/**
 * Upload profile photo and update Firestore user profile.
 */
export async function saveProfilePhotoAndUpdateDB(uid, file, imageKey = "profilePicture") {
  const imageUrl = await uploadUserImage(uid, file, imageKey);
  await updateUserProfile(uid, { [imageKey]: imageUrl });
  return imageUrl;
}

/**
 * Convenience wrapper: Upload a marketplace listing image.
 */
export function uploadMarketplaceImage(itemId, file, imageKey = "thumbnail", onProgress) {
  return uploadImage(`marketplace/${itemId}/${imageKey}`, file, onProgress);
}

/**
 * Convenience wrapper: Delete a marketplace image.
 */
export function deleteMarketplaceImage(itemId, imageKey = "thumbnail") {
  return deleteImage(`marketplace/${itemId}/${imageKey}`);
}

/**
 * Convenience wrapper: Get marketplace image URL.
 */
export function getMarketplaceImageUrl(itemId, imageKey = "thumbnail") {
  return getImageUrl(`marketplace/${itemId}/${imageKey}`);
}
