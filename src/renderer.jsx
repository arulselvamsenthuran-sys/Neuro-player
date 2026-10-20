import { createRoot } from "react-dom/client";
import { useRef, useState } from "react";
import Header from "./components/Header";
import VideoPlayer from "./components/VideoPlayer";
import Sidebar from "./components/Sidebar";
import ErrorBoundary from "./components/ErrorBoundary";
import "./index.css";

const APP = () => {
  const videoPlayerRef = useRef(null);
  const sidebarRef = useRef(null);
  const [roi, setRoi] = useState(null);
  const [isSelectingRoi, setIsSelectingRoi] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [extractionMode, setExtractionMode] = useState("offline");

  // Shared subtitle overlay state — populated by Sidebar, consumed by VideoPlayer
  const [subtitleOverlay, setSubtitleOverlay] = useState({ enabled: false, segments: [] });

  // Safe layout toggle state for right panel
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const openFile = () => {
    videoPlayerRef.current?.openFileDialog?.();
  };

  const addToRecentFiles = (url, name) => {
    try {
      const existing = JSON.parse(localStorage.getItem('neuro-recent-files') || '[]');
      const filtered = existing.filter(f => f.url !== url);
      const next = [{ url, name }, ...filtered].slice(0, 10);
      localStorage.setItem('neuro-recent-files', JSON.stringify(next));
    } catch {}
  };

  const handleMenuAction = async (action) => {
    switch (action) {
      case "open_file":
        openFile();
        break;
      case "open_folder":
        videoPlayerRef.current?.openFolderDialog?.();
        break;
      case "quit":
        if (window.api && window.api.quit) window.api.quit();
        else window.close();
        break;
      case "fullscreen":
        const vContainer = document.querySelector('.video-player-container');
        if (!document.fullscreenElement) {
          await vContainer?.requestFullscreen().catch(e => console.error(e));
        } else {
          await document.exitFullscreen().catch(e => console.error(e));
        }
        break;
      case "mini_player":
      case "preferences":
      case "audio_settings":
      case "documentation":
      case "about":
        alert(`[Placeholder] ${action.replace('_', ' ').toUpperCase()} feature coming soon!`);
        break;
      default:
        break;
    }
  };

  const onVideoPlay = () => {
    sidebarRef.current?.autoStartServices?.();
  };

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Header openFile={openFile} onMenuAction={handleMenuAction} extractionMode={extractionMode} setExtractionMode={setExtractionMode} />

      <div style={{ flex: 1, minHeight: 0, display: "flex", gap: isSidebarOpen ? "24px" : "0px", padding: "24px", transition: "gap 0.4s cubic-bezier(0.4, 0, 0.2, 1)" }}>

        <div className={`video-wrapper ${!isSidebarOpen ? "expanded" : ""}`}>
          <VideoPlayer
            ref={videoPlayerRef}
            roi={roi}
            onRoiChange={(newRoi) => { setRoi(newRoi); setIsSelectingRoi(false); }}
            onPlay={onVideoPlay}
            isSelectingRoi={isSelectingRoi}
            isScanning={isScanning}
            subtitleOverlay={subtitleOverlay}
            onFileLoaded={addToRecentFiles}
          />

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={`sidebar-toggle-btn ${isSidebarOpen ? "open" : "collapsed"}`}
            title="Toggle Code Extractor Panel"
          >
            {isSidebarOpen ? "▶" : "◀"}
          </button>
        </div>

        <div className={`sidebar-wrapper ${isSidebarOpen ? "open" : "collapsed"}`}>
          <Sidebar
            ref={sidebarRef}
            videoPlayerRef={videoPlayerRef}
            roi={roi}
            isSelectingRoi={isSelectingRoi}
            onRequestRoiSelect={() => setIsSelectingRoi(true)}
            onCancelRoiSelect={() => { setIsSelectingRoi(false); setRoi(null); }}
            onScanStateChange={(scanning) => setIsScanning(scanning)}
            extractionMode={extractionMode}
            onSubtitleChange={(enabled, segments) => setSubtitleOverlay({ enabled, segments })}
          />
        </div>

      </div>
    </div>
  );
};

createRoot(document.getElementById("root")).render(
  <ErrorBoundary>
    <APP />
  </ErrorBoundary>
);
