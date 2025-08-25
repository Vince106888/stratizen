// src/services/storage.js
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "./firebase";
import { updateUserProfile } from "./db";

export const VALID_IMAGE_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
export const IMAGE_MAX_SIZE = 2 * 1024 * 1024; // 2 MB

/**
 * Validate an image file (type + size)
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
 * Generic image upload function
 * @param {string} path - Storage path
 * @param {File} file - File object from input
 * @param {function} [onProgress] - Optional progress callback (0-100)
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
 * Delete an image by storage path
 */
export async function deleteImage(path) {
  if (!path) throw new Error("Storage path is required");
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

/**
 * Get download URL for any storage path
 */
export async function getImageUrl(path) {
  if (!path) throw new Error("Storage path is required");
  const storageRef = ref(storage, path);
  return await getDownloadURL(storageRef);
}

/**
 * User-specific wrappers
 */
export function uploadUserImage(uid, file, imageKey = "profilePicture", onProgress) {
  return uploadImage(`users/${uid}/${imageKey}`, file, onProgress);
}

export function deleteUserImage(uid, imageKey = "profilePicture") {
  return deleteImage(`users/${uid}/${imageKey}`);
}

export function getUserImageUrl(uid, imageKey = "profilePicture") {
  return getImageUrl(`users/${uid}/${imageKey}`);
}

export async function saveProfilePhotoAndUpdateDB(uid, file, imageKey = "profilePicture") {
  const imageUrl = await uploadUserImage(uid, file, imageKey);
  await updateUserProfile(uid, { [imageKey]: imageUrl });
  return imageUrl;
}

/**
 * Marketplace-specific wrappers
 */
export function uploadMarketplaceImage(itemId, file, imageKey = "thumbnail", onProgress) {
  return uploadImage(`marketplace/${itemId}/${imageKey}`, file, onProgress);
}

export function deleteMarketplaceImage(itemId, imageKey = "thumbnail") {
  return deleteImage(`marketplace/${itemId}/${imageKey}`);
}

export function getMarketplaceImageUrl(itemId, imageKey = "thumbnail") {
  return getImageUrl(`marketplace/${itemId}/${imageKey}`);
}

/**
 * Post-specific wrappers (Stratizen feed)
 */
export function uploadPostImage(postId, file, imageKey = "media", onProgress) {
  if (!postId) throw new Error("Post ID is required");
  if (!file) throw new Error("File is required");

  // ensure uniqueness by appending timestamp + original filename
  const uniqueName = `${imageKey}_${Date.now()}_${file.name}`;
  return uploadImage(`posts/${postId}/${uniqueName}`, file, onProgress);
}

export function deletePostImage(postId, imageKey = "media") {
  if (!postId) throw new Error("Post ID is required");
  return deleteImage(`posts/${postId}/${imageKey}`);
}

export function getPostImageUrl(postId, imageKey = "media") {
  if (!postId) throw new Error("Post ID is required");
  return getImageUrl(`posts/${postId}/${imageKey}`);
}
