import React, { useState } from 'react';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  RotateCw, 
  ArrowUp, 
  ArrowDown, 
  Compass, 
  Maximize2, 
  Rotate3d,
  Layers,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { useBridgeStore } from '../../store/useBridgeStore';

export function CameraControlsWidget() {
  const [isExpanded, setIsExpanded] = useState(true);
  const triggerCameraCommand = useBridgeStore(state => state.triggerCameraCommand);
  const selectSensor = useBridgeStore(state => state.selectSensor);

  const handleCommand = (command) => {
    selectSensor(null); // Clear sensor focus lock when manual camera action is triggered
    triggerCameraCommand(command);
  };

  return (
    <div className={`camera-controls-widget ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="cam-widget-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="cam-widget-title">
          <Compass size={14} className="text-cyan animate-pulse-slow" />
          <span>CAMERA & VIEWPORT</span>
        </div>
        <button className="cam-toggle-expand-btn">
          {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        </button>
      </div>

      {isExpanded && (
        <div className="cam-widget-body">
          {/* Zoom & Orbit Button Row */}
          <div className="cam-actions-group">
            <span className="cam-group-label">ZOOM & ORBIT</span>
            <div className="cam-btn-grid">
              <button 
                className="cam-ctrl-btn"
                onClick={() => handleCommand('ZOOM_IN')}
                title="Zoom In (or scroll wheel up)"
              >
                <ZoomIn size={14} />
                <span>Zoom In</span>
              </button>
              <button 
                className="cam-ctrl-btn"
                onClick={() => handleCommand('ZOOM_OUT')}
                title="Zoom Out (or scroll wheel down)"
              >
                <ZoomOut size={14} />
                <span>Zoom Out</span>
              </button>
              <button 
                className="cam-ctrl-btn"
                onClick={() => handleCommand('ROTATE_LEFT')}
                title="Rotate Left 30°"
              >
                <RotateCcw size={14} />
                <span>Orbit Left</span>
              </button>
              <button 
                className="cam-ctrl-btn"
                onClick={() => handleCommand('ROTATE_RIGHT')}
                title="Rotate Right 30°"
              >
                <RotateCw size={14} />
                <span>Orbit Right</span>
              </button>
              <button 
                className="cam-ctrl-btn"
                onClick={() => handleCommand('ROTATE_UP')}
                title="Tilt Pitch Up (Bird's Eye)"
              >
                <ArrowUp size={14} />
                <span>Pitch Up</span>
              </button>
              <button 
                className="cam-ctrl-btn"
                onClick={() => handleCommand('ROTATE_DOWN')}
                title="Tilt Pitch Down (Deck Level)"
              >
                <ArrowDown size={14} />
                <span>Pitch Down</span>
              </button>
            </div>
          </div>

          {/* Quick Perspective Views */}
          <div className="cam-actions-group">
            <span className="cam-group-label">CAMERA ANGLES</span>
            <div className="cam-angles-row">
              <button 
                className="cam-angle-pill"
                onClick={() => handleCommand('VIEW_ISO')}
                title="3D Isometric Perspective"
              >
                <Rotate3d size={11} /> 3D Iso
              </button>
              <button 
                className="cam-angle-pill"
                onClick={() => handleCommand('VIEW_TOP')}
                title="Top-Down Bird's Eye View"
              >
                Top-Down
              </button>
              <button 
                className="cam-angle-pill"
                onClick={() => handleCommand('VIEW_SIDE')}
                title="Side Profile Elevation"
              >
                Side Profile
              </button>
              <button 
                className="cam-angle-pill"
                onClick={() => handleCommand('VIEW_FRONT')}
                title="Front Roadway Axis"
              >
                Front View
              </button>
              <button 
                className="cam-angle-pill reset-pill"
                onClick={() => handleCommand('RESET')}
                title="Reset Camera to Default Overview"
              >
                <Maximize2 size={11} /> Reset
              </button>
            </div>
          </div>

          {/* Touch & Mouse Quick Legend */}
          <div className="cam-nav-hint">
            <span>🖱️ Drag to rotate • Right-click/2-finger drag to pan • Scroll to zoom</span>
          </div>
        </div>
      )}
    </div>
  );
}
