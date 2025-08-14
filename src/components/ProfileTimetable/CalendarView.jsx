import React, { useMemo } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../../styles/ProfileTimetable/CalendarView.css";

export default function CalendarView({
  events = [],
  value,
  onChangeDate,
  onDayClick,
  user,
  dayNameFromDate,
}) {

  const formatDateToYMD = (date) => {
    try {
      const d = new Date(date);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return '1970-01-01'; // Fallback date
    }
  };

  const TODAY = new Date();

  // Helper function for consistent error handling
  const handleError = (error, context) => {
    console.error(`Error in ${context}:`, error);
    return []; // Return safe default value
  };

  // Safe date conversion with error handling
  const safeDateConversion = (date) => {
    try {
      if (!date) return new Date();
      return date?.toDate ? date.toDate() : new Date(date);
    } catch (error) {
      handleError(error, "date conversion");
      return new Date();
    }
  };

  // Filter events to this user with validation
  const userEvents = useMemo(() => {
    try {
      if (!user?.uid) return [];
      
      return events.filter((e) => {
        try {
          // Validate required fields
          if (!e.id || !e.date || e.startHour === undefined || e.endHour === undefined) {
            console.warn("Invalid event skipped:", e);
            return false;
          }
          return e.userId === user.uid;
        } catch (error) {
          handleError(error, "event filtering");
          return false;
        }
      });
    } catch (error) {
      handleError(error, "user events filtering");
      return [];
    }
  }, [events, user]);

  // Get current month range with validation
  const [startOfMonth, endOfMonth] = useMemo(() => {
    try {
      const safeValue = value instanceof Date ? value : new Date();
      const start = new Date(safeValue.getFullYear(), safeValue.getMonth(), 1);
      const end = new Date(safeValue.getFullYear(), safeValue.getMonth() + 1, 0);
      return [start, end];
    } catch (error) {
      handleError(error, "month range calculation");
      // Fallback to current month
      const now = new Date();
      return [
        new Date(now.getFullYear(), now.getMonth(), 1),
        new Date(now.getFullYear(), now.getMonth() + 1, 0)
      ];
    }
  }, [value]);

  // Then update the eventsByDate grouping logic:
  const eventsByDate = useMemo(() => {
    const grouped = {};
    
    userEvents.forEach((ev) => {
      try {
        const eventDate = ev.date;
        const isRecurring = Boolean(ev.recurring);
        const eventDay = ev.day ? String(ev.day).toLowerCase() : null;

        const addEvent = (date) => {
          const key = formatDateToYMD(date); // Use formatted date
          if (!grouped[key]) grouped[key] = [];
          grouped[key].push(ev);
        };

        if (isRecurring && eventDay) {
          let currentDate = new Date(startOfMonth);
          while (currentDate <= endOfMonth) {
            const currentDayName = dayNameFromDate(currentDate).toLowerCase();
            if (currentDayName === eventDay) {
              addEvent(currentDate);
            }
            currentDate.setDate(currentDate.getDate() + 1);
          }
        } else {
          addEvent(eventDate);
        }
      } catch (error) {
        console.error('Error processing event:', ev, error);
      }
    });
    
    return grouped;
  }, [userEvents, startOfMonth, endOfMonth, dayNameFromDate]);

  // Safe day click handler
  const handleDayClick = (date) => {
    try {
      const dateKey = formatDateToYMD(date); // Use consistent formatting
      const dayEvents = eventsByDate[dateKey] || [];
      if (onDayClick) {
        onDayClick(new Date(date), dayEvents); // Pass both Date object and formatted string if needed
      }
    } catch (error) {
      console.error('Day click error:', error);
    }
  };

  // Safe tile content renderer
  const renderTileContent = ({ date, view }) => {
    if (view !== "month") return null;
    
    try {
      const dateKey = safeDateConversion(date).toISOString().split('T')[0];
      const dayEvents = eventsByDate[dateKey] || [];
      if (!dayEvents.length) return null;

      return (
        <ul className="calendar-day-events-list">
          {dayEvents.map((ev) => {
            try {
              return (
                <li
                  key={ev.id || Math.random().toString(36).substring(2, 9)}
                  className="calendar-event-item"
                  title={`${ev.title || 'Untitled'} (${ev.startHour || '?'}:00 - ${ev.endHour || '?'}:00)`}
                >
                  <span 
                    className="calendar-event-dot" 
                    style={{
                      backgroundColor: ev.type === "Class" ? "var(--class-color)" : "var(--event-color)"
                    }} 
                  />
                  <span className="calendar-event-title">
                    {ev.title || 'Untitled Event'}
                  </span>
                </li>
              );
            } catch (error) {
              handleError(error, "event item rendering");
              return null;
            }
          })}
        </ul>
      );
    } catch (error) {
      handleError(error, "tile content rendering");
      return null;
    }
  };

  // Safe tile className generator
  const getTileClassName = ({ date, view }) => {
    if (view !== "month") return null;
    
    try {
      const dateKey = safeDateConversion(date).toISOString().split('T')[0];
      const hasEvents = eventsByDate[dateKey]?.length > 0;
      const isToday = date.toDateString() === TODAY.toDateString();
      
      const classes = [];
      if (isToday) classes.push("calendar-today");
      if (hasEvents) classes.push("calendar-has-events");
      return classes.join(" ");
    } catch (error) {
      handleError(error, "tile class generation");
      return null;
    }
  };

  return (
    <div className="calendar-view-container">
      <Calendar
        value={safeDateConversion(value)}
        onChange={(date) => {
          try {
            onChangeDate(date);
          } catch (error) {
            handleError(error, "date change handling");
          }
        }}
        onClickDay={handleDayClick}
        tileContent={renderTileContent}
        tileClassName={getTileClassName}
        className="custom-calendar"
      />
    </div>
  );
}