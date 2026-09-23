import React from 'react';
import { 
  AlertOctagon, 
  RotateCcw, 
  Flame, 
  ShieldAlert, 
  Activity, 
  Zap,
  TrendingUp
} from 'lucide-react';
import { useBridgeStore } from '../../store/useBridgeStore';

export function ExtremeFailureModal() {
  const collapseSimulation = useBridgeStore(state => state.collapseSimulation);
  const resetCollapse = useBridgeStore(state => state.resetCollapse);

  if (!collapseSimulation.active) return null;

  return (
    <div className="extreme-failure-hud-overlay">
      <div className="failure-banner-card">
        <div className="failure-top-bar">
          <div className="failure-alert-tag">
            <AlertOctagon size={16} className="animate-spin text-crimson flex-shrink-0" />
            <span>EXTREME FAILURE SIMULATION</span>
          </div>
          <span className="failure-disclaimer-pill">DEMO ONLY</span>
        </div>

        <div className="failure-main-grid">
          <div className="failure-stat-box">
            <span className="stat-k">STRUCTURAL STATUS</span>
            <span className="stat-v text-crimson font-bold">
              {collapseSimulation.step === 'COLLAPSED' ? 'CATASTROPHIC COLLAPSE' : 'CRITICAL OVERLOAD'}
            </span>
          </div>
          <div className="failure-stat-box">
            <span className="stat-k">FAILURE ZONE</span>
            <span className="stat-v text-amber font-mono font-bold">Span 3 Mid-Span</span>
          </div>
          <div className="failure-stat-box">
            <span className="stat-k">PEAK STRAIN</span>
            <span className="stat-v text-crimson font-mono font-bold">&gt; 1,850 µε</span>
          </div>
          <div className="failure-stat-box">
            <span className="stat-k">DEFLECTION SAG</span>
            <span className="stat-v text-crimson font-mono font-bold">
              {collapseSimulation.step === 'COLLAPSED' ? '-14.0 m (Failed)' : '-4.5 m (Sagging)'}
            </span>
          </div>
        </div>

        {/* Collapse Stage Timeline */}
        <div className="collapse-stage-timeline">
          <div className={`stage-node ${collapseSimulation.progress >= 10 ? 'active' : ''}`}>
            <span className="node-dot" />
            <span className="node-label">Overload</span>
          </div>
          <div className={`stage-node ${collapseSimulation.progress >= 30 ? 'active' : ''}`}>
            <span className="node-dot" />
            <span className="node-label">Critical</span>
          </div>
          <div className={`stage-node ${collapseSimulation.progress >= 50 ? 'active' : ''}`}>
            <span className="node-dot" />
            <span className="node-label">Snapping</span>
          </div>
          <div className={`stage-node ${collapseSimulation.progress >= 80 ? 'active' : ''}`}>
            <span className="node-dot" />
            <span className="node-label">Fracture</span>
          </div>
          <div className={`stage-node ${collapseSimulation.progress >= 100 ? 'active' : ''}`}>
            <span className="node-dot" />
            <span className="node-label">Collapse</span>
          </div>
        </div>

        {/* Big Reset Button */}
        <div className="failure-actions-row">
          <button className="reset-collapse-hero-btn" onClick={resetCollapse}>
            <RotateCcw size={14} />
            <span>RESTORE & RESET BRIDGE TWIN</span>
          </button>
        </div>
      </div>
    </div>
  );
}
