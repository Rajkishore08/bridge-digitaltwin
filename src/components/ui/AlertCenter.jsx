import React from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Eye, 
  Wrench, 
  Calendar, 
  Check, 
  Activity, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBridgeStore } from '../../store/useBridgeStore';

export function AlertCenter() {
  const alerts = useBridgeStore(state => state.alerts);
  const acknowledgeAlert = useBridgeStore(state => state.acknowledgeAlert);
  const scheduleInspection = useBridgeStore(state => state.scheduleInspection);
  const executeMaintenance = useBridgeStore(state => state.executeMaintenance);
  const maintenance = useBridgeStore(state => state.maintenance);
  const setCameraPreset = useBridgeStore(state => state.setCameraPreset);
  const selectSensor = useBridgeStore(state => state.selectSensor);

  const activeAlerts = alerts.filter(a => !a.resolved);

  const handleMaintenanceClick = () => {
    executeMaintenance();
    // Fire confetti when repair sequence finishes
    setTimeout(() => {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.7 },
        colors: ['#06b6d4', '#10b981', '#38bdf8']
      });
    }, 1800);
  };

  const handleFocusFault = (alert) => {
    if (alert.componentId) {
      setCameraPreset(alert.componentId);
    }
    if (alert.sensorId) {
      selectSensor(alert.sensorId);
    }
  };

  return (
    <div className="panel-box alert-center-panel">
      <div className="panel-title-bar">
        <div className="panel-title">
          <ShieldAlert size={15} className="text-crimson" />
          <span>ALERT TRIAGE & MAINTENANCE WORKFLOW</span>
        </div>
        <span className={`alert-count-pill ${activeAlerts.length > 0 ? 'active' : ''}`}>
          {activeAlerts.length} Active
        </span>
      </div>

      {/* Maintenance In-Progress Status Bar */}
      {maintenance.status !== 'IDLE' && (
        <div className={`maintenance-status-card ${maintenance.status.toLowerCase()}`}>
          <div className="maint-header">
            <div className="maint-title">
              <Wrench size={14} className="text-cyan animate-spin" />
              <span>MAINTENANCE STATUS: {maintenance.status}</span>
            </div>
            <span className="maint-assigned">{maintenance.technicianAssigned}</span>
          </div>

          {maintenance.status === 'IN_PROGRESS' && (
            <div className="maint-progress-wrap">
              <div className="progress-bar-bg">
                <div className="progress-bar-fill" style={{ width: `${maintenance.progress}%` }} />
              </div>
              <span className="progress-pct">{maintenance.progress}% Calibrated</span>
            </div>
          )}

          {maintenance.status === 'SCHEDULED' && (
            <div className="maint-action-row">
              <span className="text-xs text-slate">Technician crew on standby.</span>
              <button className="execute-maint-btn" onClick={handleMaintenanceClick}>
                <Sparkles size={13} />
                <span>Simulate Maintenance</span>
              </button>
            </div>
          )}

          {maintenance.status === 'RESOLVED' && (
            <div className="maint-resolved-row">
              <CheckCircle2 size={15} className="text-emerald" />
              <span>Bridge component normalized & stress relieved.</span>
            </div>
          )}
        </div>
      )}

      {/* Active Alerts List */}
      <div className="alerts-list">
        {activeAlerts.length === 0 ? (
          <div className="empty-alerts-box">
            <CheckCircle2 size={24} className="text-emerald opacity-80" />
            <div className="empty-title">All Monitoring Channels Normal</div>
            <div className="empty-subtitle">
              No active stress, vibration, or displacement anomalies detected.
            </div>
          </div>
        ) : (
          activeAlerts.map(alert => {
            const isCrit = alert.level === 'CRITICAL';
            return (
              <div key={alert.id} className={`alert-item-card ${isCrit ? 'critical' : 'warning'}`}>
                <div className="alert-top">
                  <div className="alert-badge-wrap">
                    <span className={`alert-level-badge ${isCrit ? 'crit' : 'warn'}`}>
                      {alert.level}
                    </span>
                    <span className="alert-location">{alert.location}</span>
                  </div>
                  <span className="alert-time">{alert.timestamp}</span>
                </div>

                <div className="alert-msg">{alert.message}</div>

                <div className="alert-telemetry-row">
                  <span>Current: <strong>{alert.currentValue} {alert.unit}</strong></span>
                  <span>Demo Limit: <strong>{alert.threshold} {alert.unit}</strong></span>
                </div>

                {/* Action Buttons for Industrial Closed Loop */}
                <div className="alert-action-buttons">
                  <button 
                    className="alert-btn focus-btn"
                    onClick={() => handleFocusFault(alert)}
                    title="Focus 3D camera on affected bridge location"
                  >
                    <Eye size={12} />
                    <span>Focus Location</span>
                  </button>

                  {!alert.acknowledged && (
                    <button 
                      className="alert-btn ack-btn"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      <Check size={12} />
                      <span>Acknowledge</span>
                    </button>
                  )}

                  {!alert.maintenanceScheduled && (
                    <button 
                      className="alert-btn sched-btn"
                      onClick={() => scheduleInspection(alert.id)}
                    >
                      <Calendar size={12} />
                      <span>Schedule Inspection</span>
                    </button>
                  )}

                  {alert.maintenanceScheduled && maintenance.status !== 'IN_PROGRESS' && maintenance.status !== 'RESOLVED' && (
                    <button 
                      className="alert-btn maint-btn"
                      onClick={handleMaintenanceClick}
                    >
                      <Wrench size={12} />
                      <span>Simulate Maintenance</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
