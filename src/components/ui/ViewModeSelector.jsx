import React from 'react';
import { 
  Eye, 
  Flame, 
  Waves, 
  Radio, 
  Truck, 
  Camera, 
  Layers, 
  Focus,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RotateCw,
  Compass,
  Maximize2
} from 'lucide-react';
import { useBridgeStore } from '../../store/useBridgeStore';

const VIEW_MODES = [
  { id: 'LIVE', label: 'Live Twin', icon: Eye, desc: 'Realistic industrial physical twin' },
  { id: 'STRESS', label: 'Stress Heatmap', icon: Flame, desc: 'Finite-element stress color gradient' },
  { id: 'VIBRATION', label: 'Vibration Mode', icon: Waves, desc: 'Exaggerated modal oscillation' },
  { id: 'SENSOR', label: 'Sensor Network', icon: Radio, desc: '3D telemetry node registry' },
  { id: 'TRAFFIC', label: 'Traffic Flow', icon: Truck, desc: 'Live vehicular lane distribution' },
];

const CAMERA_PRESETS = [
  { id: 'OVERVIEW', label: 'Full Overview' },
  { id: 'SPAN_01', label: 'Span 1 (S)' },
  { id: 'SPAN_02', label: 'Span 2' },
  { id: 'SPAN_03', label: 'Span 3 (Critical)' },
  { id: 'SPAN_04', label: 'Span 4 (N)' },
  { id: 'TOWERS', label: 'Pylons' },
  { id: 'PIERS', label: 'Piers' },
];

export function ViewModeSelector() {
  const viewMode = useBridgeStore(state => state.viewMode);
  const setViewMode = useBridgeStore(state => state.setViewMode);
  const cameraPreset = useBridgeStore(state => state.cameraPreset);
  const setCameraPreset = useBridgeStore(state => state.setCameraPreset);
  const triggerCameraCommand = useBridgeStore(state => state.triggerCameraCommand);
  const selectSensor = useBridgeStore(state => state.selectSensor);

  const handleCommand = (command) => {
    selectSensor(null);
    triggerCameraCommand(command);
  };

  return (
    <div className="view-mode-panel">
      {/* 1. 3D Visualization Modes */}
      <div className="view-mode-section">
        <div className="view-mode-title">
          <Layers size={13} className="text-cyan" />
          <span>3D MODE</span>
        </div>
        <div className="view-mode-tabs">
          {VIEW_MODES.map(mode => {
            const Icon = mode.icon;
            const isActive = viewMode === mode.id;
            return (
              <button
                key={mode.id}
                className={`view-tab-btn ${isActive ? 'active' : ''} ${mode.id === 'STRESS' ? 'stress-tab' : ''}`}
                onClick={() => setViewMode(mode.id)}
                title={mode.desc}
              >
                <Icon size={13} />
                <span>{mode.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Interactive Zoom & Angle Quick Bar */}
      <div className="camera-presets-section">
        <div className="view-mode-title">
          <Compass size={13} className="text-cyan" />
          <span>ZOOM & ROTATE</span>
        </div>
        <div className="camera-quick-nav-group">
          <button 
            className="cam-quick-btn" 
            onClick={() => handleCommand('ZOOM_IN')} 
            title="Zoom In (+)"
          >
            <ZoomIn size={13} />
          </button>
          <button 
            className="cam-quick-btn" 
            onClick={() => handleCommand('ZOOM_OUT')} 
            title="Zoom Out (-)"
          >
            <ZoomOut size={13} />
          </button>
          <button 
            className="cam-quick-btn" 
            onClick={() => handleCommand('ROTATE_LEFT')} 
            title="Rotate Angle Left (↺)"
          >
            <RotateCcw size={13} />
          </button>
          <button 
            className="cam-quick-btn" 
            onClick={() => handleCommand('ROTATE_RIGHT')} 
            title="Rotate Angle Right (↻)"
          >
            <RotateCw size={13} />
          </button>
          <button 
            className="cam-quick-btn view-pill-btn" 
            onClick={() => handleCommand('VIEW_TOP')} 
            title="Top-Down Bird's Eye View"
          >
            Top
          </button>
          <button 
            className="cam-quick-btn view-pill-btn" 
            onClick={() => handleCommand('VIEW_SIDE')} 
            title="Side Profile Elevation"
          >
            Side
          </button>
          <button 
            className="cam-quick-btn view-pill-btn" 
            onClick={() => handleCommand('VIEW_FRONT')} 
            title="Front Roadway Axis"
          >
            Front
          </button>
          <button 
            className="cam-quick-btn view-pill-btn" 
            onClick={() => handleCommand('RESET')} 
            title="Reset to Default Overview"
          >
            <Maximize2 size={11} />
          </button>
        </div>
      </div>

      {/* 3. Camera Location Presets */}
      <div className="camera-presets-section">
        <div className="view-mode-title">
          <Camera size={13} className="text-cyan" />
          <span>FOCUS PRESETS</span>
        </div>
        <div className="camera-pill-list">
          {CAMERA_PRESETS.map(preset => {
            const isActive = cameraPreset === preset.id;
            return (
              <button
                key={preset.id}
                className={`camera-pill-btn ${isActive ? 'active' : ''} ${preset.id === 'SPAN_03' ? 'critical-pill' : ''}`}
                onClick={() => {
                  selectSensor(null); // Clear sensor lock to allow camera preset to take effect
                  setCameraPreset(preset.id);
                }}
              >
                <Focus size={11} />
                <span>{preset.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
