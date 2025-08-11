import React, { useEffect, useState, useMemo } from "react";
import {
  getFirestore,
  collection,
  onSnapshot,
  doc,
  getDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useMembership } from "../../hooks/useMembership";
import ConfirmModal from "../common/ConfirmModal";
import { toast } from "react-toastify";
import "../../styles/Stratizen/GroupList.css";

const OFFICIAL_GROUPS = [
  {
    name: "Strathmore Entrepreneurs",
    description: "Connecting and empowering aspiring entrepreneurs.",
  },
  {
    name: "Strathmore Volunteer Group",
    description: "Community service and outreach programs.",
  },
  {
    name: "Strathmore Study Group",
    description: "Collaborative academic study and peer support.",
  },
  // Add more official groups here as needed
];

export default function GroupList() {
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  const [groups, setGroups] = useState([]);
  const [joinedGroups, setJoinedGroups] = useState(new Set());
  const { join, leave, loading } = useMembership("groups");
  const [loadingGroupId, setLoadingGroupId] = useState(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "groups"), async (snapshot) => {
      let data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      if (data.length === 0) {
        for (const group of OFFICIAL_GROUPS) {
          await addDoc(collection(db, "groups"), {
            ...group,
            memberCount: 0,
            createdBy: "system",
            createdAt: serverTimestamp(),
          });
        }
        return;
      }

      setGroups(data);
    });
    return unsubscribe;
  }, [db]);

  useEffect(() => {
    async function fetchUserGroups() {
      if (!user) return;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setJoinedGroups(new Set(userData.groups || []));
      }
    }
    fetchUserGroups();
  }, [db, user]);

  const filteredGroups = useMemo(() => {
    if (!searchTerm.trim()) return groups;
    return groups.filter((group) =>
      group.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [groups, searchTerm]);

  async function handleCreateGroup() {
    if (!user) {
      toast.error("You must be logged in to create a group.");
      return;
    }
    if (!newName.trim()) {
      toast.error("Group name cannot be empty.");
      return;
    }
    setCreating(true);
    try {
      const docRef = await addDoc(collection(db, "groups"), {
        name: newName.trim(),
        description: newDescription.trim(),
        memberCount: 1,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });

      await join(docRef.id);

      setNewName("");
      setNewDescription("");
      toast.success("Group created and you have joined!");
    } catch (e) {
      toast.error("Failed to create group: " + e.message);
    }
    setCreating(false);
  }

  async function handleJoin(groupId) {
    setLoadingGroupId(groupId);
    try {
      await join(groupId);
      setJoinedGroups((prev) => new Set(prev).add(groupId));
      toast.success("Joined group!");
    } catch (e) {
      toast.error("Failed to join group: " + e.message);
    }
    setLoadingGroupId(null);
  }

  function onLeaveClick(groupId) {
    setSelectedGroupId(groupId);
    setModalOpen(true);
  }

  async function confirmLeave() {
    if (!selectedGroupId) return;
    setLoadingGroupId(selectedGroupId);
    try {
      await leave(selectedGroupId);
      setJoinedGroups((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedGroupId);
        return newSet;
      });
      toast.success("Left group");
    } catch (e) {
      toast.error("Failed to leave group: " + e.message);
    }
    setLoadingGroupId(null);
    setModalOpen(false);
    setSelectedGroupId(null);
  }

  function cancelLeave() {
    setModalOpen(false);
    setSelectedGroupId(null);
  }

  async function handleDelete(groupId) {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;
    if (group.createdBy !== user.uid) {
      toast.error("Only the group creator can delete this group.");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the group "${group.name}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "groups", groupId));
      toast.success("Group deleted.");
    } catch (e) {
      toast.error("Failed to delete group: " + e.message);
    }
  }

  return (
    <>
      {/* Create Group Form */}
      <div className="create-group-form">
        <h2>Create a New Group</h2>
        <input
          type="text"
          placeholder="Group name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={creating}
        />
        <textarea
          placeholder="Group description (optional)"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          disabled={creating}
          rows={3}
        />
        <button onClick={handleCreateGroup} disabled={creating}>
          {creating ? "Creating..." : "Create Group"}
        </button>
      </div>

      {/* Search Input */}
      <div className="group-search">
        <input
          type="search"
          placeholder="Search groups..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search groups"
        />
      </div>

      {/* Available Groups Heading */}
      <h2 className="grouplist-heading">Available Groups</h2>

      {/* Loading / Empty */}
      {groups.length === 0 && (
        <p className="text-center text-gray-600">Loading groups...</p>
      )}

      {/* Groups Grid */}
      <div className="group-cards-grid">
        {filteredGroups.map(({ id, name, description, memberCount, createdBy }) => {
          const isMember = joinedGroups.has(id);
          const isLoading = loading && loadingGroupId === id;
          const isOwner = user && createdBy === user.uid;
          const isOfficial = createdBy === "system";

          return (
            <div key={id} className="group-card">
              <div>
                <h3 className="group-title">
                  {name}
                  {isOfficial && (
                    <span className="group-official-badge">Official</span>
                  )}
                </h3>
                <p className="group-description">{description}</p>
                <p className="group-member-count">
                  {memberCount ?? 0} member{memberCount !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="group-buttons">
                <button
                  onClick={() => (isMember ? onLeaveClick(id) : handleJoin(id))}
                  disabled={isLoading}
                  className={isMember ? "btn-leave" : "btn-join"}
                >
                  {isLoading
                    ? "Processing..."
                    : isMember
                    ? "Leave Group"
                    : "Join Group"}
                </button>

                {isOwner && (
                  <button
                    onClick={() => handleDelete(id)}
                    className="btn-delete"
                    disabled={loadingGroupId === id}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Confirm Leave Modal */}
      <ConfirmModal
        isOpen={modalOpen}
        title="Confirm Leave Group"
        message="Are you sure you want to leave this group? You will lose access to its posts and updates."
        onConfirm={confirmLeave}
        onCancel={cancelLeave}
      />
    </>
  );
}
