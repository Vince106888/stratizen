// src/pages/Noticeboard.jsx
import React, { useEffect, useState } from "react"; 
import { useUser } from "../hooks/useUser";
import { listenNotices } from "../services/noticeboardService";

import SchoolNotices from "../components/Noticeboard/SchoolNotices";
import AnnouncementList from "../components/Noticeboard/AnnouncementList";
import NoticeFilters from "../components/Noticeboard/NoticeFilters";
import NoticeList from "../components/Noticeboard/NoticeList";
import FloatingNoticeButton from "../components/Noticeboard/FloatingNoticeButton";
import NoticeForm from "../components/Noticeboard/NoticeForm";
import "../styles/Noticeboard.css";

export default function Noticeboard() {
  const { user, loading } = useUser();

  const [notices, setNotices] = useState({ school: [], others: [] });
  const [announcements, setAnnouncements] = useState([]);
  const [filteredNotices, setFilteredNotices] = useState([]);
  const [showNoticeForm, setShowNoticeForm] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const unsubscribe = listenNotices(user, (allNotices) => {
        // Include both "school" and "official" in SchoolNotices
        const schoolNotices = allNotices.filter(
          n => n.type === "school" || n.type === "official"
        );

        // Everything else goes to community/other notices
        const otherNotices = allNotices.filter(
          n => n.type !== "school" && n.type !== "official" && n.type !== "announcement"
        );

        const announcementNotices = allNotices.filter(n => n.type === "announcement");

        setNotices({ school: schoolNotices, others: otherNotices });
        setAnnouncements(announcementNotices);
        setFilteredNotices(otherNotices); // default community view
      });

      return () => unsubscribe();
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="noticeboard-page">
        <p className="noticeboard-loading">Loading notices...</p>
      </div>
    );
  }

  return (
    <div className="noticeboard-page flex flex-col lg:flex-row gap-6 p-4 relative">
      {/* Main Board */}
      <main className="noticeboard-main flex-1 space-y-8">
        <header className="noticeboard-header mb-4">
          <h1 className="noticeboard-title text-2xl font-bold text-primary">📌 Noticeboard</h1>
        </header>

        {/* School Notices */}
        <section className="school-notices-section">
          <h2 className="section-title">Official School Notices</h2>
          <SchoolNotices 
            notices={notices.school || []} 
            canEdit={user?.role === "administrator"} 
          />
        </section>

        {/* Announcements */}
        <section className="announcements-section">
          <h2 className="section-title">Latest Announcements</h2>
          <AnnouncementList announcements={announcements || []} />
        </section>

        {/* Community / Group Notices */}
        <section className="community-notices-section">
          <h2 className="section-title">Community Notices</h2>

          <NoticeFilters 
            notices={notices.others || []} 
            onFilter={setFilteredNotices} 
          />

          <NoticeList notices={filteredNotices || []} />
        </section>
      </main>

      {/* Sidebar */}
      <aside className="noticeboard-sidebar w-full lg:w-64 flex-shrink-0 bg-white border-l border-gray-200 p-4 rounded-md shadow-sm space-y-6">
        <h2 className="sidebar-title text-xl font-semibold text-primary">📌 Filters & Info</h2>

        <ul className="sidebar-filters space-y-2">
          <li className="filter-item cursor-pointer hover:text-accent" onClick={() => setFilteredNotices(notices.others)}>All Notices</li>
          <li className="filter-item cursor-pointer hover:text-accent" onClick={() => setFilteredNotices(notices.others.filter(n => n.pinned))}>Pinned</li>
          <li className="filter-item cursor-pointer hover:text-accent" onClick={() => setFilteredNotices(notices.others.filter(n => n.type === "event"))}>Events</li>
          <li className="filter-item cursor-pointer hover:text-accent" onClick={() => setFilteredNotices(notices.others.filter(n => n.type === "opportunity"))}>Opportunities</li>
          <li className="filter-item cursor-pointer hover:text-accent" onClick={() => setFilteredNotices(notices.others.filter(n => n.type === "lostfound"))}>Lost & Found</li>
        </ul>

        <div className="sidebar-tips bg-gray-50 p-3 rounded-md shadow-inner">
          <h3 className="tips-title font-semibold">Quick Tips</h3>
          <p className="tips-text text-sm text-gray-600">
            Pinned notices appear at the top. Students can only suggest notices.
          </p>
        </div>
      </aside>

      {/* Floating Add Notice Button */}
      <FloatingNoticeButton 
        user={user} 
        onAdd={() => setShowNoticeForm(true)} 
      />

      {/* Notice Form Modal */}
      {showNoticeForm && (
        <div className="notice-form-modal fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="notice-form-wrapper bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative">
            <button 
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 font-bold"
              onClick={() => setShowNoticeForm(false)}
            >
              ✕
            </button>
            <NoticeForm user={user} onSuccess={() => setShowNoticeForm(false)} />
          </div>
        </div>
      )}
    </div>
  );
}
