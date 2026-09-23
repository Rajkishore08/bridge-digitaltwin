import React from 'react';
import { 
  Layers, 
  ShieldCheck, 
  AlertTriangle, 
  AlertOctagon, 
  Eye, 
  Focus,
  CheckCircle2
} from 'lucide-react';
import { useBridgeStore } from '../../store/useBridgeStore';
import { BRIDGE_COMPONENTS } from '../../data/bridgeConfig';

export function ComponentHealthPanel() {
  const componentHealth = useBridgeStore(state => state.componentHealth);
  const selectedZone = useBridgeStore(state => state.selectedZone);
  const setSelectedZone = useBridgeStore(state => state.setSelectedZone);
  const setCameraPreset = useBridgeStore(state => state.setCameraPreset);
  const selectSensor = useBridgeStore(state => state.selectSensor);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'critical':
        return <AlertOctagon size={13} className="text-crimson" />;
      case 'elevated':
      case 'warning':
        return <AlertTriangle size={13} className="text-amber" />;
      default:
        return <CheckCircle2 size={13} className="text-emerald" />;
    }
  };

  const handleZoneClick = (comp) => {
    if (selectedZone === comp.id) {
      setSelectedZone(null);
    } else {
      setSelectedZone(comp.id);
      if (comp.type === 'span') {
        setCameraPreset(comp.id);
      } else if (comp.type === 'tower') {
        setCameraPreset('TOWERS');
      } else {
        setCameraPreset('PIERS');
      }
    }
    selectSensor(null);
  };

  return (
    <div className="panel-box component-health-panel">
      <div className="panel-title-bar">
        <div className="panel-title">
          <Layers size={15} className="text-cyan" />
          <span>STRUCTURAL ZONES & HEALTH MATRIX</span>
        </div>
        {selectedZone && (
          <button className="clear-zone-btn" onClick={() => setSelectedZone(null)}>
            Clear Isolation
          </button>
        )}
      </div>

      <div className="zones-list">
        {BRIDGE_COMPONENTS.map(comp => {
          const health = componentHealth[comp.id] || { status: 'normal', stressPercent: 20 };
          const isSelected = selectedZone === comp.id;
          const isCrit = health.status === 'critical';
          const isWarn = health.status === 'warning' || health.status === 'elevated';

          return (
            <div
              key={comp.id}
              className={`zone-item-row ${isSelected ? 'active' : ''} ${isCrit ? 'crit-zone' : isWarn ? 'warn-zone' : ''}`}
              onClick={() => handleZoneClick(comp)}
            >
              <div className="zone-left">
                {getStatusIcon(health.status)}
                <div>
                  <div className="zone-name">{comp.name}</div>
                  <div className="zone-code font-mono text-slate text-xs">{comp.code} • Limit: {comp.designLoadLimit}</div>
                </div>
              </div>

              <div className="zone-right">
                <div className="font-mono text-xs font-bold">
                  <span className={isCrit ? 'text-crimson' : isWarn ? 'text-amber' : 'text-emerald'}>
                    {health.stressPercent}% Stress
                  </span>
                </div>
                <button className="zone-focus-btn" title="Isolate and focus zone in 3D">
                  <Focus size={11} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
