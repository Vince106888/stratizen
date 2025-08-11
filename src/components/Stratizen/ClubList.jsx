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
import "../../styles/Stratizen/ClubList.css";

const OFFICIAL_CLUBS = [
  {
    name: "Strathmore Business Club",
    description: "Networking and professional development for business students.",
  },
  {
    name: "Strathmore Debating Society",
    description: "Debating and public speaking events.",
  },
  {
    name: "Strathmore Tech Club",
    description: "For students interested in technology and innovation.",
  },
  {
    name: "Strathmore Environmental Club",
    description: "Promotes environmental awareness and sustainability.",
  },
  {
    name: "Strathmore Music Society",
    description: "For students passionate about music and performing arts.",
  },
  {
    name: "Strathmore Drama Club",
    description: "Theatre and acting activities.",
  },
];

export default function ClubList() {
  const db = getFirestore();
  const auth = getAuth();
  const user = auth.currentUser;

  const [clubs, setClubs] = useState([]);
  const [joinedClubs, setJoinedClubs] = useState(new Set());
  const { join, leave, loading } = useMembership("clubs");
  const [loadingClubId, setLoadingClubId] = useState(null);

  // Modal states for leaving confirmation
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClubId, setSelectedClubId] = useState(null);

  // Club creation states
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // Search input state
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Real-time fetch clubs, seed if none
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "clubs"), async (snapshot) => {
      let data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      if (data.length === 0) {
        // Seed official clubs once
        for (const club of OFFICIAL_CLUBS) {
          await addDoc(collection(db, "clubs"), {
            ...club,
            memberCount: 0,
            createdBy: "system",
            createdAt: serverTimestamp(),
          });
        }
        return; // Next snapshot will pick seeded clubs
      }

      setClubs(data);
    });
    return unsubscribe;
  }, [db]);

  // 2. Fetch user's joined clubs once on load or user change
  useEffect(() => {
    async function fetchUserClubs() {
      if (!user) return;
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setJoinedClubs(new Set(userData.clubs || []));
      }
    }
    fetchUserClubs();
  }, [db, user]);

  // 3. Filter clubs by search
  const filteredClubs = useMemo(() => {
    if (!searchTerm.trim()) return clubs;
    return clubs.filter((club) =>
      club.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clubs, searchTerm]);

  // 4. Create a new club & auto-join creator
  async function handleCreateClub() {
    if (!user) {
      toast.error("You must be logged in to create a club.");
      return;
    }
    if (!newName.trim()) {
      toast.error("Club name cannot be empty.");
      return;
    }
    setCreating(true);
    try {
      const docRef = await addDoc(collection(db, "clubs"), {
        name: newName.trim(),
        description: newDescription.trim(),
        memberCount: 1,
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });

      await join(docRef.id);

      setNewName("");
      setNewDescription("");
      toast.success("Club created and you have joined!");
    } catch (e) {
      toast.error("Failed to create club: " + e.message);
    }
    setCreating(false);
  }

  // 5. Join club handler
  async function handleJoin(clubId) {
    setLoadingClubId(clubId);
    try {
      await join(clubId);
      setJoinedClubs((prev) => new Set(prev).add(clubId));
      toast.success("Joined club!");
    } catch (e) {
      toast.error("Failed to join club: " + e.message);
    }
    setLoadingClubId(null);
  }

  // 6. Leave club confirmation modal open
  function onLeaveClick(clubId) {
    setSelectedClubId(clubId);
    setModalOpen(true);
  }

  // 7. Confirm leave club
  async function confirmLeave() {
    if (!selectedClubId) return;
    setLoadingClubId(selectedClubId);
    try {
      await leave(selectedClubId);
      setJoinedClubs((prev) => {
        const newSet = new Set(prev);
        newSet.delete(selectedClubId);
        return newSet;
      });
      toast.success("Left club");
    } catch (e) {
      toast.error("Failed to leave club: " + e.message);
    }
    setLoadingClubId(null);
    setModalOpen(false);
    setSelectedClubId(null);
  }

  function cancelLeave() {
    setModalOpen(false);
    setSelectedClubId(null);
  }

  // 8. Delete club (only if user is creator)
  async function handleDelete(clubId) {
    const club = clubs.find((c) => c.id === clubId);
    if (!club) return;
    if (club.createdBy !== user.uid) {
      toast.error("Only the club creator can delete this club.");
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete the club "${club.name}"? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "clubs", clubId));
      toast.success("Club deleted.");
    } catch (e) {
      toast.error("Failed to delete club: " + e.message);
    }
  }

  return (
    <>
      {/* Create Club Form */}
      <div className="create-club-form">
        <h2>Create a New Club</h2>
        <input
          type="text"
          placeholder="Club name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          disabled={creating}
        />
        <textarea
          placeholder="Club description (optional)"
          value={newDescription}
          onChange={(e) => setNewDescription(e.target.value)}
          disabled={creating}
          rows={3}
        />
        <button onClick={handleCreateClub} disabled={creating}>
          {creating ? "Creating..." : "Create Club"}
        </button>
      </div>

      {/* Search Input */}
      <div className="club-search">
        <input
          type="search"
          placeholder="Search clubs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search clubs"
        />
      </div>

      {/* Available Clubs Heading */}
      <h2 className="clublist-heading">Available Clubs</h2>

      {/* Loading / Empty */}
      {clubs.length === 0 && (
        <p className="text-center text-gray-600">Loading clubs...</p>
      )}

      {/* Clubs Grid */}
      <div className="club-cards-grid">
        {filteredClubs.map(({ id, name, description, memberCount, createdBy }) => {
          const isMember = joinedClubs.has(id);
          const isLoading = loading && loadingClubId === id;
          const isOwner = user && createdBy === user.uid;
          const isOfficial = createdBy === "system";

          return (
            <div key={id} className="club-card">
              <div>
                <h3 className="club-title">
                  {name}
                  {isOfficial && (
                    <span className="club-official-badge">Official</span>
                  )}
                </h3>
                <p className="club-description">{description}</p>
                <p className="club-member-count">
                  {memberCount ?? 0} member{memberCount !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="club-buttons">
                <button
                  onClick={() => (isMember ? onLeaveClick(id) : handleJoin(id))}
                  disabled={isLoading}
                  className={isMember ? "btn-leave" : "btn-join"}
                >
                  {isLoading
                    ? "Processing..."
                    : isMember
                    ? "Leave Club"
                    : "Join Club"}
                </button>

                {isOwner && (
                  <button
                    onClick={() => handleDelete(id)}
                    className="btn-delete"
                    disabled={loadingClubId === id}
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
        title="Confirm Leave Club"
        message="Are you sure you want to leave this club? You will lose access to its posts and updates."
        onConfirm={confirmLeave}
        onCancel={cancelLeave}
      />
    </>
  );
}
