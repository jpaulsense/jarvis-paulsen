import { useState } from 'react';
import { addEventsToCalendar } from '../api.js';
import './EventsList.css';

function EventsList({ events, ocrText, onComplete, onUploadAnother }) {
  const [selectedEvents, setSelectedEvents] = useState(
    new Set(events.map((_, index) => index))
  );
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const toggleEvent = (index) => {
    const newSelected = new Set(selectedEvents);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedEvents(newSelected);
  };

  const toggleAll = () => {
    if (selectedEvents.size === events.length) {
      setSelectedEvents(new Set());
    } else {
      setSelectedEvents(new Set(events.map((_, index) => index)));
    }
  };

  const formatDateTime = (dateTimeString) => {
    try {
      const date = new Date(dateTimeString);
      return date.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return dateTimeString;
    }
  };

  const formatDateRange = (startDateTime, endDateTime) => {
    try {
      const start = new Date(startDateTime);
      const end = new Date(endDateTime);

      const startStr = start.toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      const endStr = end.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });

      return `${startStr} - ${endStr}`;
    } catch {
      return `${startDateTime} - ${endDateTime}`;
    }
  };

  const handleAddToCalendar = async () => {
    const eventsToAdd = events.filter((_, index) =>
      selectedEvents.has(index)
    );

    if (eventsToAdd.length === 0) {
      setError('Please select at least one event to add');
      return;
    }

    setAdding(true);
    setError(null);

    try {
      const result = await addEventsToCalendar(eventsToAdd);
      console.log('Calendar result:', result);

      setSuccess(true);

      if (onComplete) {
        onComplete(result);
      }
    } catch (err) {
      console.error('Error adding to calendar:', err);
      setError(err.message || 'Failed to add events to calendar');
    } finally {
      setAdding(false);
    }
  };

  if (success) {
    return (
      <div className="success-state">
        <div className="success-icon">✓</div>
        <h2>Events Added Successfully!</h2>
        <p>
          {selectedEvents.size} event{selectedEvents.size !== 1 ? 's' : ''} added
          to your calendar
        </p>
        <button
          className="secondary-btn haptic-feedback"
          onClick={onUploadAnother}
        >
          Upload Another Calendar
        </button>
      </div>
    );
  }

  return (
    <div className="events-list">
      <div className="events-header">
        <h2>
          Found {events.length} Event{events.length !== 1 ? 's' : ''}
        </h2>
        <p className="events-subtitle">
          Review and select events to add to your calendar
        </p>
      </div>

      <div className="select-all">
        <label className="checkbox-label haptic-feedback">
          <input
            type="checkbox"
            checked={selectedEvents.size === events.length}
            onChange={toggleAll}
          />
          <span>
            Select All ({selectedEvents.size}/{events.length} selected)
          </span>
        </label>
      </div>

      <div className="events-container">
        {events.map((event, index) => (
          <div
            key={index}
            className={`event-card ${
              selectedEvents.has(index) ? 'selected' : ''
            } haptic-feedback`}
            onClick={() => toggleEvent(index)}
          >
            <div className="event-checkbox-wrapper">
              <input
                type="checkbox"
                checked={selectedEvents.has(index)}
                onChange={() => toggleEvent(index)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="event-content">
              <h3 className="event-title">{event.summary}</h3>
              <div className="event-time">
                📅 {formatDateRange(event.start_datetime, event.end_datetime)}
              </div>
              {event.description && (
                <div className="event-description">{event.description}</div>
              )}
              {event.location && (
                <div className="event-location">📍 {event.location}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="actions safe-area-bottom">
        <button
          className="primary-btn haptic-feedback"
          onClick={handleAddToCalendar}
          disabled={adding || selectedEvents.size === 0}
        >
          {adding ? (
            <>
              <div className="button-spinner" />
              Adding...
            </>
          ) : (
            <>
              Add {selectedEvents.size} Event
              {selectedEvents.size !== 1 ? 's' : ''} to Calendar
            </>
          )}
        </button>
        <button
          className="secondary-btn haptic-feedback"
          onClick={onUploadAnother}
          disabled={adding}
        >
          Upload Another
        </button>
      </div>

      {ocrText && (
        <details className="ocr-details">
          <summary>View Extracted Text (OCR)</summary>
          <pre className="ocr-text">{ocrText}</pre>
        </details>
      )}
    </div>
  );
}

export default EventsList;
