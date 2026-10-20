import React, { useState, useRef, useEffect } from "react";
import "./Header.css";
// Important: Ensure your logo is saved directly inside src/assets/neuro-logo.png
import logoImg from "../assets/neuro-logo.png";

export default function Header({ openFile, onMenuAction, extractionMode, setExtractionMode }) {
  const [activeWindow, setActiveWindow] = useState(null);
  const [windowPos, setWindowPos] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  useEffect(() => {
    function handleOutsideClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveWindow(null);
      }
    }

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, []);

  const handleAction = (action) => {
    onMenuAction?.(action);
    setActiveWindow(null);
  };

  const openWindow = (name, event) => {
    const rect = event.target.getBoundingClientRect();

    setWindowPos({
      top: rect.bottom + 6,   // small gap under menu
      left: rect.left
    });

    setActiveWindow(activeWindow === name ? null : name);
  };

  return (
    <>
      <header className="header">
        <div className="logo-container logo-hover-effect" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <img src={logoImg} alt="Neuro Player Logo" className="app-logo" style={{ height: "24px", width: "auto", filter: "drop-shadow(0 0 8px rgba(34,211,238,0.5))" }} />
          <div className="logo">Neuro Player</div>
        </div>

        <nav className="nav">
          <div
            className={`menu-item ${activeWindow === "file" ? "active" : ""}`}
            onClick={(e) => openWindow("file", e)}
          >
            File
          </div>

          <div
            className={`menu-item ${activeWindow === "view" ? "active" : ""}`}
            onClick={(e) => openWindow("view", e)}
          >
            View
          </div>

          <div
            className={`menu-item ${activeWindow === "tools" ? "active" : ""}`}
            onClick={(e) => openWindow("tools", e)}
          >
            Tools
          </div>

          <div
            className={`menu-item ${activeWindow === "help" ? "active" : ""}`}
            onClick={(e) => openWindow("help", e)}
          >
            Help
          </div>
        </nav>

        <div style={{ marginLeft: "auto", marginRight: "20px", display: "flex", alignItems: "center" }}>

          <div className="segmented-toggle" data-active={extractionMode}>
            <div
              className={`toggle-option ${extractionMode === 'offline' ? 'active' : ''}`}
              onClick={() => setExtractionMode && setExtractionMode('offline')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
              Offline
            </div>
            <div
              className={`toggle-option ${extractionMode === 'online' ? 'active' : ''}`}
              onClick={() => setExtractionMode && setExtractionMode('online')}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></svg>
              Online
            </div>
          </div>

        </div>

      </header>

      {activeWindow && (
        <div
          ref={menuRef}
          className="menu-window"
          style={{
            top: windowPos.top,
            left: windowPos.left
          }}
        >
          {activeWindow === "file" && (
            <>
              <div
                className="window-item"
                onClick={() => handleAction('open_file')}
              >
                Open File
              </div>
              <div className="window-item" onClick={() => handleAction('open_folder')}>Open Folder</div>
              <div className="window-item" onClick={() => handleAction('quit')}>Quit</div>
            </>
          )}

          {activeWindow === "view" && (
            <>
              <div className="window-item" onClick={() => handleAction('fullscreen')}>Fullscreen</div>
              <div className="window-item" onClick={() => handleAction('mini_player')}>Mini Player</div>
            </>
          )}

          {activeWindow === "tools" && (
            <>
              <div className="window-item" onClick={() => handleAction('preferences')}>Preferences</div>
              <div className="window-item" onClick={() => handleAction('audio_settings')}>Audio Settings</div>
            </>
          )}

          {activeWindow === "help" && (
            <>
              <div className="window-item" onClick={() => handleAction('documentation')}>Documentation</div>
              <div className="window-item" onClick={() => handleAction('about')}>About</div>
            </>
          )}
        </div>
      )}
    </>
  );
}
