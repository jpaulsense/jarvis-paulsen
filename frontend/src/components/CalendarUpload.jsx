import { useState, useEffect, useRef } from 'react';
import { extractCalendarEvents } from '../api.js';
import { isHEICFile } from '../pwa.js';
import './CalendarUpload.css';

function CalendarUpload({ onEventsExtracted }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  // Check for shared image on mount
  useEffect(() => {
    const sharedFile = window.__PWA_STATUS__?.sharedFile;
    if (sharedFile) {
      console.log('Shared file detected from Apple Photos:', sharedFile.name);
      handleFile(sharedFile);
    }
  }, []);

  const handleFile = (selectedFile) => {
    if (!selectedFile) return;

    // Validate file type
    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setFile(selectedFile);
    setError(null);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    handleFile(selectedFile);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleProcess = async () => {
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      // Check if HEIC (informational)
      if (isHEICFile(file)) {
        console.log('HEIC file detected - backend will handle conversion');
      }

      const result = await extractCalendarEvents(file);
      console.log('Extraction result:', result);

      if (onEventsExtracted) {
        onEventsExtracted({
          events: result.events,
          ocrText: result.ocr_text,
          imageId: result.image_id,
        });
      }
    } catch (err) {
      console.error('Error extracting events:', err);
      setError(err.message || 'Failed to extract calendar events');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = () => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClickUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="calendar-upload">
      <h2>Upload Calendar Image</h2>

      {!preview ? (
        <div
          className={`upload-area ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClickUpload}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.heic,.heif"
            capture="environment"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
          <div className="upload-icon">📸</div>
          <p>Click to upload or drag and drop</p>
          <p className="upload-hint">Supports: JPG, PNG, HEIC (Apple Photos)</p>
        </div>
      ) : (
        <div className="preview-area">
          <div className="image-preview">
            <img src={preview} alt="Calendar preview" />
            <button
              className="remove-btn haptic-feedback"
              onClick={handleRemove}
              aria-label="Remove image"
            >
              ✕
            </button>
          </div>
          {file && (
            <div className="file-info">
              <p className="file-name">{file.name}</p>
              <p className="file-size">
                {(file.size / 1024 / 1024).toFixed(2)} MB
                {isHEICFile(file) && (
                  <span className="heic-badge">HEIC</span>
                )}
              </p>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      {preview && !loading && (
        <button
          className="process-btn haptic-feedback"
          onClick={handleProcess}
        >
          Extract Calendar Events
        </button>
      )}

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner-mobile" />
          <p>Processing your calendar image...</p>
          <p className="loading-step">
            Analyzing image with AI...
          </p>
        </div>
      )}
    </div>
  );
}

export default CalendarUpload;
