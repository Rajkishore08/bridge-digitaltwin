import React, { useState } from 'react';
import { 
  Sliders, 
  ShieldAlert, 
  BrainCircuit, 
  Terminal, 
  ChevronLeft, 
  ChevronRight,
  History,
  Layers
} from 'lucide-react';
import { TopNav } from './TopNav';
import { KpiBar } from './KpiBar';
import { ViewModeSelector } from './ViewModeSelector';
import { ScenarioControls } from './ScenarioControls';
import { ComponentHealthPanel } from './ComponentHealthPanel';
import { AlertCenter } from './AlertCenter';
import { PredictiveAnalyticsPanel } from './PredictiveAnalyticsPanel';
import { EventAuditTrail } from './EventAuditTrail';
import { HistoricalPlaybackBar } from './HistoricalPlaybackBar';
import { SensorInspectorModal } from './SensorInspectorModal';
import { AutoDemoTourModal } from './AutoDemoTourModal';
import { ExtremeFailureModal } from './ExtremeFailureModal';
import { LearnModeModal } from './LearnModeModal';
import { ArchitectureOverlayModal } from './ArchitectureOverlayModal';
import { SensorTableModal } from './SensorTableModal';
import { ExportReportModal } from './ExportReportModal';
import { CameraControlsWidget } from './CameraControlsWidget';
import { useBridgeStore } from '../../store/useBridgeStore';

export function Dashboard() {
  const [leftPanelOpen, setLeftPanelOpen] = useState(true);
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [leftTab, setLeftTab] = useState('SCENARIO'); // 'SCENARIO' | 'ZONES'
  const [bottomTab, setBottomTab] = useState('HISTORICAL'); // 'LOG' | 'PREDICTIVE' | 'HISTORICAL'
  const collapseSimulation = useBridgeStore(state => state.collapseSimulation);

  return (
    <div className="dashboard-overlay-root">
      {/* 1. Top Navigation & Global Controls */}
      <TopNav />

      {/* 2. Real-Time Telemetry KPI Bar */}
      <KpiBar />

      {/* 3. Floating 3D Mode & Camera Controls */}
      <ViewModeSelector />

      {/* 4. Left HUD Drawer: Scenarios & Bridge Zoning */}
      <div className={`hud-drawer left-drawer ${leftPanelOpen ? 'open' : 'closed'}`}>
        <button 
          className="drawer-toggle-btn left-toggle" 
          onClick={() => setLeftPanelOpen(!leftPanelOpen)}
          title={leftPanelOpen ? "Collapse Left Drawer" : "Expand Left Drawer"}
        >
          {leftPanelOpen ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>
        {leftPanelOpen && (
          <div className="drawer-inner-content">
            <div className="left-drawer-tabs">
              <button 
                className={`drawer-tab-btn ${leftTab === 'SCENARIO' ? 'active' : ''}`}
                onClick={() => setLeftTab('SCENARIO')}
              >
                <Sliders size={13} /> Load Controls
              </button>
              <button 
                className={`drawer-tab-btn ${leftTab === 'ZONES' ? 'active' : ''}`}
                onClick={() => setLeftTab('ZONES')}
              >
                <Layers size={13} /> Bridge Zones
              </button>
            </div>
            {leftTab === 'SCENARIO' ? <ScenarioControls /> : <ComponentHealthPanel />}
          </div>
        )}
      </div>

      {/* 5. Right HUD Drawer: Alert Triage & Maintenance Workflow (Replaced by ExtremeFailureModal during collapse) */}
      {!collapseSimulation.active && (
        <div className={`hud-drawer right-drawer ${rightPanelOpen ? 'open' : 'closed'}`}>
          <button 
            className="drawer-toggle-btn right-toggle" 
            onClick={() => setRightPanelOpen(!rightPanelOpen)}
            title={rightPanelOpen ? "Collapse Alert Center" : "Expand Alert Center"}
          >
            {rightPanelOpen ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
          {rightPanelOpen && (
            <div className="drawer-inner-content">
              <AlertCenter />
            </div>
          )}
        </div>
      )}

      {/* 6. Extreme Failure Collapse Emergency HUD (Docked on the Right Side) */}
      <ExtremeFailureModal />

      {/* 6b. Interactive Floating Camera & Viewport Navigation Widget */}
      <CameraControlsWidget />

      {/* 7. Bottom Floating Panel: Historical Scrubber, Predictive Analytics, Event Stream */}
      <div className="bottom-hud-panel">
        <div className="bottom-tab-bar">
          <button 
            className={`bottom-tab-btn ${bottomTab === 'HISTORICAL' ? 'active' : ''}`}
            onClick={() => setBottomTab('HISTORICAL')}
          >
            <History size={13} />
            <span>Historical Playback Replay</span>
          </button>
          <button 
            className={`bottom-tab-btn ${bottomTab === 'PREDICTIVE' ? 'active' : ''}`}
            onClick={() => setBottomTab('PREDICTIVE')}
          >
            <BrainCircuit size={13} />
            <span>Simulated Predictive Stress (30-Day AI Forecast)</span>
          </button>
          <button 
            className={`bottom-tab-btn ${bottomTab === 'LOG' ? 'active' : ''}`}
            onClick={() => setBottomTab('LOG')}
          >
            <Terminal size={13} />
            <span>System Event Stream</span>
          </button>
        </div>

        <div className="bottom-tab-body">
          {bottomTab === 'HISTORICAL' && <HistoricalPlaybackBar />}
          {bottomTab === 'PREDICTIVE' && <PredictiveAnalyticsPanel />}
          {bottomTab === 'LOG' && <EventAuditTrail />}
        </div>
      </div>

      {/* 8. Interactive Sensor/Component Inspector Drawer */}
      <SensorInspectorModal />

      {/* 9. Automated 14-Step Presentation Tour Overlay */}
      <AutoDemoTourModal />

      {/* 10. Educational, Architecture, Table & Export Modals */}
      <LearnModeModal />
      <ArchitectureOverlayModal />
      <SensorTableModal />
      <ExportReportModal />
    </div>
  );
}
