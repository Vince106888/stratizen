// src/components/Stratizen/PostEditor.jsx
import React, { useState, useRef } from "react";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { app } from "../../services/firebase";
import "../../styles/Stratizen/PostEditor.css";

const db = getFirestore(app);
const storage = getStorage(app);

const MAX_MEDIA_FILES = 3;
const MAX_FILE_SIZE_MB = 10;
const MAX_CHAR_COUNT = 500;

export default function PostEditor({ currentUser, onPostCreated }) {
  const [content, setContent] = useState("");
  const [mediaFiles, setMediaFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  // Extract URLs from text
  const extractLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.match(urlRegex) || [];
  };

  // Extract tagged usernames like @username
  const extractTags = (text) => {
    const tagRegex = /@(\w+)/g;
    const tags = [];
    let match;
    while ((match = tagRegex.exec(text)) !== null) {
      tags.push(match[1]);
    }
    return tags;
  };

  const handleMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + mediaFiles.length > MAX_MEDIA_FILES) {
      setError(`You can upload up to ${MAX_MEDIA_FILES} media files.`);
      return;
    }
    for (const file of files) {
      if (file.size / (1024 * 1024) > MAX_FILE_SIZE_MB) {
        setError(`File ${file.name} exceeds ${MAX_FILE_SIZE_MB}MB size limit.`);
        return;
      }
    }
    setMediaFiles((prev) => [...prev, ...files]);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadMediaFiles = async () => {
    const urls = [];
    for (const file of mediaFiles) {
      const storageRef = ref(
        storage,
        `posts/${currentUser.uid}/${Date.now()}_${file.name}`
      );
      const uploadTask = uploadBytesResumable(storageRef, file);

      await new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          null,
          (error) => reject(error),
          async () => {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            urls.push({
              url: downloadURL,
              type: file.type.startsWith("video") ? "video" : "image",
            });
            resolve();
          }
        );
      });
    }
    return urls;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && mediaFiles.length === 0) {
      setError("Post cannot be empty.");
      return;
    }
    if (content.length > MAX_CHAR_COUNT) {
      setError(`Post cannot exceed ${MAX_CHAR_COUNT} characters.`);
      return;
    }

    setUploading(true);
    setError(null);

    try {
      let media = [];
      if (mediaFiles.length) {
        media = await uploadMediaFiles();
      }

      const links = extractLinks(content);
      const tagsUsernames = extractTags(content);
      const tags = []; // TODO: resolve usernames to user IDs

      await addDoc(collection(db, "posts"), {
        authorId: currentUser.uid,
        content: content.trim(),
        createdAt: serverTimestamp(),
        media,
        tags,
        links,
        visibility: "public",
      });

      // Reset form
      setContent("");
      setMediaFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";

      // Notify parent that a post was created
      if (onPostCreated) onPostCreated();
    } catch (err) {
      setError("Failed to create post. Try again.");
      console.error(err);
    }
    setUploading(false);
  };

  const removeMediaFile = (index) => {
    setMediaFiles((files) => files.filter((_, i) => i !== index));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <form className="post-editor" onSubmit={handleSubmit}>
      <textarea
        placeholder="What's on your mind? Tag friends with @, share links, add media..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={uploading}
        maxLength={MAX_CHAR_COUNT}
      />
      <div className="char-count">
        {content.length}/{MAX_CHAR_COUNT}
      </div>

      {mediaFiles.length > 0 && (
        <div className="media-preview">
          {mediaFiles.map((file, i) => (
            <div key={i} className="media-thumb">
              {file.type.startsWith("image") ? (
                <img src={URL.createObjectURL(file)} alt={`media-${i}`} />
              ) : file.type.startsWith("video") ? (
                <video controls width="100">
                  <source src={URL.createObjectURL(file)} />
                </video>
              ) : null}
              <button
                type="button"
                onClick={() => removeMediaFile(i)}
                aria-label="Remove media"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="post-editor-actions">
        <label htmlFor="media-upload" className="media-upload-label" tabIndex={0}>
          📎 Add Media
        </label>
        <input
          id="media-upload"
          type="file"
          accept="image/*,video/*"
          multiple
          ref={fileInputRef}
          onChange={handleMediaChange}
          disabled={uploading}
          style={{ display: "none" }}
        />
        <button type="submit" disabled={uploading}>
          {uploading ? "Posting..." : "Post"}
        </button>
      </div>

      {error && <p className="error-message">{error}</p>}
    </form>
  );
}
