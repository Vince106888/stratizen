import React, { useState, useEffect, useCallback } from "react";
import { getFirestore, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { app } from "../../services/firebase";
import { useNavigate } from "react-router-dom";
import "../../styles/Stratizen/SearchBar.css";

const db = getFirestore(app);

const SearchBar = ({ onSelectClub }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  // Debounce helper
  const debounce = (func, delay) => {
    let timer;
    return (...args) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Main search logic
  const searchFirestore = useCallback(
    async (term) => {
      if (!term.trim()) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const resultsArray = [];

        // Search Users
        const userQ = query(
          collection(db, "users"),
          where("displayName", ">=", term),
          where("displayName", "<=", term + "\uf8ff"),
          orderBy("displayName"),
          limit(5)
        );
        const userSnap = await getDocs(userQ);
        userSnap.forEach((doc) => {
          resultsArray.push({ type: "User", id: doc.id, ...doc.data() });
        });

        // Search Posts
        const postQ = query(
          collection(db, "posts"),
          where("content", ">=", term),
          where("content", "<=", term + "\uf8ff"),
          orderBy("content"),
          limit(5)
        );
        const postSnap = await getDocs(postQ);
        postSnap.forEach((doc) => {
          resultsArray.push({ type: "Post", id: doc.id, ...doc.data() });
        });

        // Search Clubs
        const clubQ = query(
          collection(db, "clubs"),
          where("name", ">=", term),
          where("name", "<=", term + "\uf8ff"),
          orderBy("name"),
          limit(5)
        );
        const clubSnap = await getDocs(clubQ);
        clubSnap.forEach((doc) => {
          resultsArray.push({ type: "Club", id: doc.id, ...doc.data() });
        });

        setResults(resultsArray);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const debouncedSearch = useCallback(debounce(searchFirestore, 400), [searchFirestore]);

  useEffect(() => {
    if (searchTerm.trim()) {
      debouncedSearch(searchTerm);
    } else {
      setResults([]);
    }
  }, [searchTerm, debouncedSearch]);

  const handleSelect = (item) => {
    setShowDropdown(false);
    setSearchTerm("");

    if (item.type === "User") {
      navigate(`/profile/${item.id}`);
    } else if (item.type === "Post") {
      navigate(`/post/${item.id}`);
    } else if (item.type === "Club") {
      if (onSelectClub) {
        onSelectClub(item.id); // Filter Hub feed
      } else {
        navigate(`/club/${item.id}`);
      }
    }
  };

  return (
    <div className="searchbar-container">
      <input
        type="text"
        placeholder="Search users, posts, clubs..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setShowDropdown(true);
        }}
        onFocus={() => searchTerm && setShowDropdown(true)}
        className="searchbar-input"
      />
      {loading && <span className="searchbar-loading">⏳</span>}

      {showDropdown && results.length > 0 && (
        <div className="searchbar-dropdown">
          {results.map((item) => (
            <div
              key={item.id}
              className="searchbar-item"
              onClick={() => handleSelect(item)}
            >
              <span className="searchbar-type">[{item.type}]</span>{" "}
              {item.type === "User" && <span>{item.displayName}</span>}
              {item.type === "Post" && (
                <span>{item.content?.slice(0, 40) || "Untitled post"}...</span>
              )}
              {item.type === "Club" && <span>{item.name}</span>}
            </div>
          ))}
        </div>
      )}

      {showDropdown && !loading && results.length === 0 && searchTerm && (
        <div className="searchbar-dropdown">
          <div className="searchbar-item no-results">No results found</div>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
