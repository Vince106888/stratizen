// src/components/ProfileTimetable/CalendarView.jsx
import React, { useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../styles/ProfileTimetable/CalendarView.css";
import { useTheme } from "../../context/ThemeContext";

export default function CalendarView({
  events = [],
  value,
  onChangeDate,
  onDayClick,
  user,
  dayNameFromDate,
}) {
  const { theme } = useTheme(); // dark/light mode
  const TODAY = new Date();

  const formatDateToYMD = (date) => {
    try {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } catch {
      return '1970-01-01';
    }
  };

  const safeDateConversion = (date) => {
    try {
      if (!date) return new Date();
      return date?.toDate ? date.toDate() : new Date(date);
    } catch {
      return new Date();
    }
  };

  // Define a dynamic color map for event types
  const eventTypeColors = {
    class: "#004aad", // Strathmore blue
    event: "#ffcc00", // Strathmore gold
    meeting: "#00b894",
    exam: "#d32f2f",
    workshop: "#6c5ce7",
    default: "#888888"
  };

  // Filter events for current user
  const userEvents = useMemo(() => {
    if (!user?.uid) return [];
    return events.filter(
      e => e?.id && e?.date && e?.startHour !== undefined && e?.endHour !== undefined && e.userId === user.uid
    );
  }, [events, user]);

  // Current month range
  const [startOfMonth, endOfMonth] = useMemo(() => {
    const safeValue = value instanceof Date ? value : new Date();
    return [
      new Date(safeValue.getFullYear(), safeValue.getMonth(), 1),
      new Date(safeValue.getFullYear(), safeValue.getMonth() + 1, 0)
    ];
  }, [value]);

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped = {};

    userEvents.forEach(ev => {
      const addEvent = (date) => {
        const key = formatDateToYMD(date);
        if (!grouped[key]) grouped[key] = [];
        grouped[key].push(ev);
      };

      try {
        const isRecurring = Boolean(ev.recurring);
        const eventDay = ev.day?.toLowerCase();

        if (isRecurring && eventDay) {
          let currentDate = new Date(startOfMonth);
          while (currentDate <= endOfMonth) {
            if (dayNameFromDate(currentDate).toLowerCase() === eventDay) {
              addEvent(currentDate);
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }
        } else {
          addEvent(ev.date);
        }
      } catch (err) {
        console.error("Error processing event:", ev, err);
      }
    });

    return grouped;
  }, [userEvents, startOfMonth, endOfMonth, dayNameFromDate]);

  const handleDayClick = (date) => {
    const dateKey = formatDateToYMD(date);
    const dayEvents = eventsByDate[dateKey] || [];
    onDayClick?.(new Date(date), dayEvents);
  };

  const renderTileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const dateKey = formatDateToYMD(date);
    const dayEvents = eventsByDate[dateKey] || [];
    if (!dayEvents.length) return null;

    return (
      <ul className="calendar-day-events-list">
        {dayEvents.map(ev => {
          const type = ev.type?.toLowerCase() || "default";
          const dotColor = eventTypeColors[type] || eventTypeColors.default;

          return (
            <li
              key={ev.id}
              className="calendar-event-item"
              title={`${ev.title || "Untitled"} (${ev.startHour || "?"}:00 - ${ev.endHour || "?"}:00)`}
            >
              <span
                className={`calendar-event-dot ${type}`}
                style={{ backgroundColor: dotColor }}
              />
              <span className="calendar-event-title">{ev.title || "Untitled Event"}</span>
            </li>
          );
        })}
      </ul>
    );
  };

  const getTileClassName = ({ date, view }) => {
    if (view !== "month") return null;

    const dateKey = formatDateToYMD(date);
    const hasEvents = eventsByDate[dateKey]?.length > 0;
    const isToday = date.toDateString() === TODAY.toDateString();

    const classes = [];
    if (isToday) classes.push("calendar-today");
    if (hasEvents) classes.push("calendar-has-events");
    if (theme === "dark") classes.push("calendar-dark-mode");
    return classes.join(" ");
  };

  return (
    <div className={`calendar-view-container ${theme === "dark" ? "dark" : "light"}`}>
      <Calendar
        value={safeDateConversion(value)}
        onChange={(date) => onChangeDate?.(date)}
        onClickDay={handleDayClick}
        tileContent={renderTileContent}
        tileClassName={getTileClassName}
        className="custom-calendar"
      />
    </div>
  );
}
