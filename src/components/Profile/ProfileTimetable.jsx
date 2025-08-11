// src/components/Profile/ProfileTimetable.jsx
import React, { useState, useEffect } from "react";
import "../../styles/Profile/ProfileTimetable.css";

// Strathmore brand colors
const STRATHMORE_PRIMARY = "#002147"; // deep navy blue
const STRATHMORE_GOLD = "#FFD100";    // golden yellow
const STRATHMORE_LIGHT = "#F4F4F4";   // soft light grey

const daysOfWeek = [
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"
];
const hours = Array.from({ length: 16 }, (_, i) => i + 7); // 7am to 10pm

function ProfileTimetable({ form = {}, onChange = () => {} }) {
  // Safe initialization
  const initialEvents = Array.isArray(form?.timetableEvents) ? form.timetableEvents : [];
  const [events, setEvents] = useState(initialEvents);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  // Keep events in sync with parent form
  useEffect(() => {
    onChange("timetableEvents", events);
  }, [events, onChange]);

  const handleAddClick = () => {
    setEditingEvent(null);
    setShowForm(true);
  };

  const handleEditClick = (event) => {
    setEditingEvent(event);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm("Delete this event?")) {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get("title")?.trim();
    const day = formData.get("day");
    const startHour = parseInt(formData.get("startHour"), 10);
    const endHour = parseInt(formData.get("endHour"), 10);
    const notes = formData.get("notes")?.trim();

    if (!title || !day || !startHour || !endHour || startHour >= endHour) {
      alert("Please fill in a valid title, day, and time range.");
      return;
    }

    if (editingEvent) {
      setEvents((prev) =>
        prev.map((e) =>
          e.id === editingEvent.id
            ? { ...e, title, day, startHour, endHour, notes }
            : e
        )
      );
    } else {
      setEvents((prev) => [
        ...prev,
        {
          id: Date.now(),
          title,
          day,
          startHour,
          endHour,
          notes,
        },
      ]);
    }
    setShowForm(false);
    setEditingEvent(null);
  };

  return (
    <div
      className="profile-timetable-container max-w-5xl mx-auto p-4 rounded-lg shadow-lg"
      style={{ backgroundColor: STRATHMORE_LIGHT }}
    >
      {/* Title + Quote */}
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <h3 style={{ color: STRATHMORE_PRIMARY, fontWeight: "bold", fontSize: "1.5rem" }}>
          Weekly Timetable
        </h3>
        <p style={{ fontStyle: "italic", color: STRATHMORE_PRIMARY }}>
          "Time is what we want most, but what we use worst." — William Penn
        </p>
      </div>

      {/* Add Event Button */}
      <div style={{ textAlign: "right", marginBottom: "0.5rem" }}>
        <button
          className="btn-add-event"
          style={{
            backgroundColor: STRATHMORE_GOLD,
            color: STRATHMORE_PRIMARY,
            padding: "0.5rem 1rem",
            borderRadius: "5px",
            fontWeight: "bold",
            border: "none",
            cursor: "pointer"
          }}
          onClick={handleAddClick}
        >
          + Add Event
        </button>
      </div>

      {/* Timetable Grid */}
      <div className="timetable-grid">
        {/* Header Row */}
        <div className="grid-header-time"></div>
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="grid-header-day"
            style={{
              backgroundColor: STRATHMORE_PRIMARY,
              color: "white",
              fontWeight: "bold",
              padding: "0.5rem",
              textAlign: "center"
            }}
          >
            {day}
          </div>
        ))}

        {/* Time Rows */}
        {hours.map((hour) => (
          <React.Fragment key={hour}>
            <div
              className="grid-time-label"
              style={{
                backgroundColor: "#e5e5e5",
                textAlign: "center",
                fontWeight: "bold"
              }}
            >
              {`${hour}:00`}
            </div>
            {daysOfWeek.map((day) => {
              const event = events.find(
                (e) =>
                  e.day === day &&
                  hour >= e.startHour &&
                  hour < e.endHour
              );
              return (
                <div
                  key={`${day}-${hour}`}
                  className={`grid-cell ${event ? "grid-cell-event" : ""}`}
                  style={{
                    backgroundColor: event ? STRATHMORE_GOLD : "white",
                    border: "1px solid #ddd",
                    cursor: event ? "pointer" : "default",
                    padding: event ? "0.2rem" : "0"
                  }}
                  onClick={() => {
                    if (event) handleEditClick(event);
                  }}
                  title={
                    event
                      ? `${event.title} (${event.startHour}:00 - ${event.endHour}:00)${
                          event.notes ? `\nNotes: ${event.notes}` : ""
                        }`
                      : ""
                  }
                >
                  {event && hour === event.startHour ? (
                    <div
                      className="event-title"
                      style={{
                        fontWeight: "bold",
                        color: STRATHMORE_PRIMARY
                      }}
                    >
                      {event.title}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
          onClick={() => setShowForm(false)}
        >
          <div
            className="modal-content"
            style={{
              background: "white",
              padding: "1.5rem",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "500px"
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4 style={{ color: STRATHMORE_PRIMARY, marginBottom: "1rem" }}>
              {editingEvent ? "Edit Event" : "Add Event"}
            </h4>
            <form onSubmit={handleFormSubmit} className="event-form">
              <label>
                Title *
                <input
                  type="text"
                  name="title"
                  defaultValue={editingEvent?.title || ""}
                  required
                  style={{ width: "100%", marginBottom: "0.5rem" }}
                />
              </label>
              <label>
                Day *
                <select
                  name="day"
                  defaultValue={editingEvent?.day || ""}
                  required
                  style={{ width: "100%", marginBottom: "0.5rem" }}
                >
                  <option value="" disabled>Select day</option>
                  {daysOfWeek.map((day) => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Start Hour *
                <select
                  name="startHour"
                  defaultValue={editingEvent?.startHour || 7}
                  required
                  style={{ width: "100%", marginBottom: "0.5rem" }}
                >
                  {hours.map((h) => (
                    <option key={h} value={h}>
                      {h}:00
                    </option>
                  ))}
                </select>
              </label>
              <label>
                End Hour *
                <select
                  name="endHour"
                  defaultValue={editingEvent?.endHour || 8}
                  required
                  style={{ width: "100%", marginBottom: "0.5rem" }}
                >
                  {hours.map((h) => (
                    <option key={h} value={h}>
                      {h}:00
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Notes
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={editingEvent?.notes || ""}
                  placeholder="Optional notes"
                  style={{ width: "100%", marginBottom: "0.5rem" }}
                />
              </label>
              <div
                className="form-buttons"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <button
                  type="submit"
                  style={{
                    backgroundColor: STRATHMORE_PRIMARY,
                    color: "white",
                    padding: "0.5rem 1rem",
                    borderRadius: "5px",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  style={{
                    backgroundColor: "#ccc",
                    padding: "0.5rem 1rem",
                    borderRadius: "5px",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  Cancel
                </button>
                {editingEvent && (
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm("Are you sure you want to delete this event?")) {
                        handleDelete(editingEvent.id);
                        setShowForm(false);
                      }
                    }}
                    style={{
                      backgroundColor: "red",
                      color: "white",
                      padding: "0.5rem 1rem",
                      borderRadius: "5px",
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    Delete
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProfileTimetable;
