// src/components/ResourceLibrary/HighlightsPanel.jsx
import React, { useMemo } from "react";
import "../../styles/ResourceLibrary/HighlightsPanel.css";

const truncate = (s, n = 28) =>
  s?.length > n ? s.slice(0, n) + "…" : s || "Untitled";

const HighlightsPanel = ({ resources = [], subjects = [] }) => {
  // 🔥 Trending subjects
  const trending = useMemo(() => {
    const bySubject = new Map();
    resources.forEach((r) => {
      const key = r.subjectId || "other";
      bySubject.set(key, (bySubject.get(key) || 0) + (r.viewCount || 0));
    });
    return Array.from(bySubject.entries())
      .map(([subjectId, score]) => ({
        subjectId,
        score,
        name: subjects.find((s) => s.id === subjectId)?.name || "Other",
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }, [resources, subjects]);

  // 🔗 Quick Links (Top 12 by views)
  const quickLinks = useMemo(() => {
    return [...resources]
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 12);
  }, [resources]);

  return (
    <aside className="highlights-panel animate-slideInRight">
      {/* Highlights */}
      <h2 className="panel-title">✨ Highlights</h2>

      {/* Most Viewed */}
      <div className="stat-card">
        <div className="stat-title">🔥 Most Viewed (Top 5)</div>
        {resources.length === 0 ? (
          <p className="muted">No resources yet.</p>
        ) : (
          <ul className="stat-list">
            {resources
              .slice()
              .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
              .slice(0, 5)
              .map((r) => (
                <li key={r.id} className="stat-item">
                  <span className="truncate" title={r.title}>
                    {r.title}
                  </span>
                  <span className="badge">{r.viewCount || 0}</span>
                </li>
              ))}
          </ul>
        )}
      </div>

      <div className="divider" />

      {/* Trending Subjects */}
      <div className="stat-card">
        <div className="stat-title">📈 Trending Subjects</div>
        {trending.length === 0 ? (
          <p className="muted">No subject trends yet.</p>
        ) : (
          <ul className="stat-list">
            {trending.map((t) => (
              <li key={t.subjectId} className="stat-item">
                <span>{t.name}</span>
                <span className="badge">{t.score}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="divider" />

      {/* Quick Links */}
      <div className="links-card">
        <h2 className="panel-title">🔗 Quick Links</h2>

        {quickLinks.length === 0 ? (
          <p className="muted">No links yet. Add a resource to see it here.</p>
        ) : (
          <ul className="links-list">
            {quickLinks.map((r) => (
              <li key={r.id} className="link-item">
                <a
                  href={r.url || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link"
                  title={r.title}
                >
                  {truncate(r.title)}
                </a>
                <button
                  className="chip"
                  onClick={() =>
                    navigator.clipboard.writeText(r.url || "")
                  }
                  title="Copy link"
                >
                  Copy
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="divider" />
        <div className="mt-3">
          <a className="btn-secondary submit-btn" href="#add-resource">
            + Submit a Link
          </a>
        </div>
      </div>

      <div className="divider" />
      <div className="tip">
        ⭐ Tip: Use filters + search to narrow your results, then bookmark your
        favorite links below.
      </div>
    </aside>
  );
};

export default HighlightsPanel;
