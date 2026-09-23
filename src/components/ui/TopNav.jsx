import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  RotateCcw, 
  Play, 
  Pause, 
  ShieldAlert, 
  ShieldCheck, 
  Sun, 
  Sunset, 
  Moon, 
  Sparkles, 
  AlertOctagon, 
  BookOpen, 
  Layers, 
  Table, 
  Download, 
  Clock 
} from 'lucide-react';
import { useBridgeStore } from '../../store/useBridgeStore';

export function TopNav() {
  const [timeStr, setTimeStr] = useState(new Date().toLocaleTimeString());
  const simulationSpeed = useBridgeStore(state => state.simulationSpeed);
  const setSimulationSpeed = useBridgeStore(state => state.setSimulationSpeed);
  const structuralRiskScore = useBridgeStore(state => state.structuralRiskScore);
  const resetSimulation = useBridgeStore(state => state.resetSimulation);
  const lightingMode = useBridgeStore(state => state.lightingMode);
  const setLightingMode = useBridgeStore(state => state.setLightingMode);
  const startAutoDemo = useBridgeStore(state => state.startAutoDemo);
  const triggerExtremeFailure = useBridgeStore(state => state.triggerExtremeFailure);
  const setActiveModal = useBridgeStore(state => state.setActiveModal);
  const alerts = useBridgeStore(state => state.alerts);
  const collapseSimulation = useBridgeStore(state => state.collapseSimulation);

  const activeAlertCount = alerts.filter(a => !a.resolved).length;

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeStr(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const getSystemStatus = () => {
    if (collapseSimulation.active) {
      return { label: 'CRITICAL FAILURE SIMULATION', class: 'status-critical', icon: AlertOctagon };
    }
    if (structuralRiskScore >= 70 || activeAlertCount > 0) {
      return { label: 'CRITICAL ATTENTION REQUIRED', class: 'status-critical', icon: ShieldAlert };
    }
    if (structuralRiskScore >= 45) {
      return { label: 'ELEVATED LOAD DETECTED', class: 'status-warning', icon: ShieldAlert };
    }
    return { label: 'ALL SYSTEMS NOMINAL', class: 'status-normal', icon: ShieldCheck };
  };

  const status = getSystemStatus();
  const StatusIcon = status.icon;

  return (
    <header className="top-nav-panel">
      {/* Brand & Digital Twin Identity */}
      <div className="nav-brand-section">
        <div className="brand-logo-glow">
          <Activity className="brand-icon" />
        </div>
        <div className="brand-text">
          <div className="brand-title">
            SMART BRIDGE <span className="brand-accent">DIGITAL TWIN</span>
          </div>
          <div className="brand-subtitle">
            STRUCTURAL HEALTH MONITORING (SHM) • IOT TELEMETRY PLATFORM
          </div>
        </div>
      </div>

      {/* Center Action Toolbar: Modals, Demo Tour, and Extreme Failure */}
      <div className="nav-tools-toolbar">
        {/* Day / Sunset / Night Lighting Mode Toggle */}
        <div className="lighting-toggle-group">
          <button 
            className={`light-mode-btn ${lightingMode === 'DAY' ? 'active' : ''}`}
            onClick={() => setLightingMode('DAY')}
            title="Daytime Sun Lighting"
          >
            <Sun size={13} />
          </button>
          <button 
            className={`light-mode-btn ${lightingMode === 'SUNSET' ? 'active' : ''}`}
            onClick={() => setLightingMode('SUNSET')}
            title="Golden Hour Sunset Lighting"
          >
            <Sunset size={13} />
          </button>
          <button 
            className={`light-mode-btn ${lightingMode === 'NIGHT' ? 'active' : ''}`}
            onClick={() => setLightingMode('NIGHT')}
            title="Night Environment with Bridge Luminaires"
          >
            <Moon size={13} />
          </button>
        </div>

        {/* Modal Triggers */}
        <button className="nav-tool-btn" onClick={() => setActiveModal('LEARN')} title="Educational SHM Guide">
          <BookOpen size={13} /> Learn Mode
        </button>
        <button className="nav-tool-btn" onClick={() => setActiveModal('ARCHITECTURE')} title="System Pipeline Architecture">
          <Layers size={13} /> Architecture
        </button>
        <button className="nav-tool-btn" onClick={() => setActiveModal('SENSOR_TABLE')} title="Sensor Telemetry Matrix">
          <Table size={13} /> Sensor Matrix
        </button>
        <button className="nav-tool-btn" onClick={() => setActiveModal('EXPORT_REPORT')} title="Export Inspection Report">
          <Download size={13} /> Export
        </button>

        {/* 14-Step Auto Demo Tour Button */}
        <button className="demo-tour-hero-btn" onClick={startAutoDemo} title="Start 14-Step Guided Presentation Tour">
          <Sparkles size={13} />
          <span>Demo Tour (14 Steps)</span>
        </button>

        {/* Extreme Failure Collapse Trigger */}
        <button 
          className="extreme-failure-trigger-btn"
          onClick={triggerExtremeFailure}
          title="Simulate Extreme Overload & Bridge Collapse"
        >
          <AlertOctagon size={13} />
          <span>Simulate Extreme Failure</span>
        </button>
      </div>

      {/* Right Controls: Status & Reset */}
      <div className="nav-controls-section">
        {/* Status Badge */}
        <div className={`system-status-badge ${status.class}`}>
          <StatusIcon size={14} className="status-badge-icon" />
          <span>{status.label}</span>
        </div>

        {/* Simulation Speed */}
        <div className="speed-controller">
          <button 
            className={`speed-btn ${simulationSpeed === 0 ? 'active' : ''}`}
            onClick={() => setSimulationSpeed(0)}
            title="Pause Simulation"
          >
            <Pause size={12} />
          </button>
          <button 
            className={`speed-btn ${simulationSpeed === 1 ? 'active' : ''}`}
            onClick={() => setSimulationSpeed(1)}
            title="1x Real-Time"
          >
            1x
          </button>
          <button 
            className={`speed-btn ${simulationSpeed === 2 ? 'active' : ''}`}
            onClick={() => setSimulationSpeed(2)}
            title="2x Fast"
          >
            2x
          </button>
          <button 
            className={`speed-btn ${simulationSpeed === 5 ? 'active' : ''}`}
            onClick={() => setSimulationSpeed(5)}
            title="5x Warp"
          >
            5x
          </button>
        </div>

        {/* Reset Button */}
        <button 
          className="reset-btn"
          onClick={resetSimulation}
          title="Reset Simulation State"
        >
          <RotateCcw size={13} />
          <span>Reset</span>
        </button>

        {/* Clock */}
        <div className="live-clock">
          <Clock size={13} />
          <span>{timeStr}</span>
        </div>
      </div>
    </header>
  );
}
