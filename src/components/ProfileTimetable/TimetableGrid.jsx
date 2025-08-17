// src/components/ProfileTimetable/TimetableGrid.jsx
import React, { useMemo, useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext"; // ✅ Theme integration
import "../../styles/ProfileTimetable/TimetableGrid.css";

const hours = Array.from({ length: 17 }, (_, i) => i + 6); // 6am-10pm
const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

// EventCard component
function EventCard({ event, onEdit, isDark }) {
  if (!event) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    onEdit?.(event);
  };

  const bgColor = event.type === "Class" 
    ? isDark ? "rgba(37, 99, 235, 0.8)" : "var(--class-color)" 
    : isDark ? "rgba(16, 185, 129, 0.8)" : "var(--event-color)";

  return (
    <div
      className={`tt-event-card ${event.multiple ? "multiple" : "single"}`}
      onClick={handleClick}
      style={{
        backgroundColor: bgColor,
        padding: event.multiple ? "2px 4px" : "6px 8px",
        color: isDark ? "#fff" : "#000",
      }}
      title={event.title}
    >
      {!event.multiple ? (
        <>
          <div className="tt-event-header">
            <span className="tt-event-title">
              {event.title} {event.type === "Class" ? "📚" : "📅"}
            </span>
          </div>
          {event.location && event.location.toLowerCase() !== "online" && (
            <div className="tt-event-location">{event.location}</div>
          )}
          {event.location?.toLowerCase() === "online" && event.onlineLink && (
            <a
              href={event.onlineLink}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="tt-event-online-link"
            >
              Join Online
            </a>
          )}
        </>
      ) : (
        <div className="tt-event-multiple-label">
          {event.type === "Class" ? "Class" : "Event"}
        </div>
      )}
    </div>
  );
}

export default function TimetableGrid({ events = [], onEditEvent, dayNameFromDate, value, user }) {
  const today = value ? new Date(value) : new Date();
  const todayDayName = dayNameFromDate(today);
  const [cellWidth, setCellWidth] = useState(100);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Update cell width on resize
  useEffect(() => {
    const handleResize = () => {
      const container = document.querySelector(".tt-grid-container");
      if (!container) return;
      const availableWidth = container.offsetWidth - 60; // 60px for time column
      setCellWidth(Math.max(60, Math.floor(availableWidth / 7)));
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Normalize events
  const mergedEvents = useMemo(() => {
    return events
      .filter((e) => e.userId === user?.uid)
      .map((e) => ({
        ...e,
        day: e.day || dayNameFromDate(new Date(e.date)),
        startHour: parseInt(e.startHour, 10),
        endHour: parseInt(e.endHour, 10),
      }));
  }, [events, user?.uid, dayNameFromDate]);

  // Map: day -> hour -> events[]
  const eventsMap = useMemo(() => {
    const map = {};
    for (const e of mergedEvents) {
      if (!map[e.day]) map[e.day] = {};
      for (let h = e.startHour; h < e.endHour; h++) {
        if (!map[e.day][h]) map[e.day][h] = [];
        map[e.day][h].push({
          ...e,
          multiple: map[e.day][h]?.length > 0,
        });
      }
    }
    return map;
  }, [mergedEvents]);

  const handleCellClick = (cellEvents, day, hour) => {
    if (!cellEvents?.length) {
      const eventDate = new Date(today);
      const clickedDayIndex = daysOfWeek.indexOf(day);
      const currentDayIndex = daysOfWeek.indexOf(todayDayName);
      eventDate.setDate(today.getDate() + (clickedDayIndex - currentDayIndex));

      onEditEvent({
        title: "",
        type: "event",
        day,
        startHour: hour,
        endHour: hour + 1,
        location: "",
        onlineLink: "",
        notes: "",
        date: eventDate.toISOString().split("T")[0],
        userId: user?.uid,
      });
      return;
    }

    if (cellEvents.length === 1) {
      onEditEvent(cellEvents[0]);
      return;
    }

    // Multiple events: fallback to first
    onEditEvent(cellEvents[0]);
  };

  const summarizeCell = (cellEvents) => {
    if (!cellEvents?.length) return "";
    const classes = cellEvents.filter((ev) => ev.type === "Class").length;
    const eventsCount = cellEvents.filter((ev) => ev.type !== "Class").length;
    const parts = [];
    if (classes) parts.push(`${classes} Class${classes > 1 ? "es" : ""}`);
    if (eventsCount) parts.push(`${eventsCount} Event${eventsCount > 1 ? "s" : ""}`);
    return parts.join(", ");
  };

  return (
    <div className={`tt-grid-container ${isDark ? "dark-mode" : ""}`}>
      {/* Column headers */}
      <div className="tt-grid-header">
        <div className="tt-grid-time-header" />
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className={`tt-grid-day-header ${day === todayDayName ? "today" : ""}`}
            style={{ width: `${cellWidth}px` }}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Time slots */}
      <div className="tt-grid-body">
        {hours.map((hour) => (
          <div key={hour} className="tt-grid-row">
            <div
              className={`tt-grid-time-label ${
                hour === today.getHours() ? "current-hour" : ""
              }`}
            >
              {hour}:00
            </div>
            {daysOfWeek.map((day) => {
              const cellEvents = eventsMap[day]?.[hour] || [];
              return (
                <div
                  key={`${day}-${hour}`}
                  className={`tt-grid-cell ${cellEvents.length ? "tt-grid-cell-event" : ""}`}
                  onClick={() => handleCellClick(cellEvents, day, hour)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    (e.key === "Enter" || e.key === " ") &&
                    handleCellClick(cellEvents, day, hour)
                  }
                  title={cellEvents.map((ev) => ev.title).join(", ")}
                  style={{ position: "relative", width: `${cellWidth}px` }}
                >
                  {cellEvents.length === 1 && (
                    <EventCard
                      event={cellEvents[0]}
                      onEdit={(ev) => onEditEvent(ev)}
                      isDark={isDark}
                    />
                  )}
                  {cellEvents.length > 1 && (
                    <div
                      className="tt-event-card multiple"
                      style={{
                        textAlign: "center",
                        fontSize: "0.75rem",
                        color: "#fff",
                        cursor: "pointer",
                      }}
                      title={cellEvents.map((ev) => ev.title).join(" | ")}
                    >
                      {summarizeCell(cellEvents)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
