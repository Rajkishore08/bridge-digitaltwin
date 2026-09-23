import React from 'react';
import { 
  X, 
  Activity, 
  Radio, 
  Layers, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  AlertOctagon, 
  CheckCircle2, 
  Maximize2 
} from 'lucide-react';
import { useBridgeStore } from '../../store/useBridgeStore';
import { SENSOR_TYPES } from '../../data/sensorConfig';

export function SensorInspectorModal() {
  const selectedSensorId = useBridgeStore(state => state.selectedSensorId);
  const selectedComponentId = useBridgeStore(state => state.selectedComponentId);
  const selectSensor = useBridgeStore(state => state.selectSensor);
  const selectComponent = useBridgeStore(state => state.selectComponent);
  const setCameraPreset = useBridgeStore(state => state.setCameraPreset);
  const sensors = useBridgeStore(state => state.sensors);
  const componentHealth = useBridgeStore(state => state.componentHealth);

  if (!selectedSensorId && !selectedComponentId) {
    return null;
  }

  // If a sensor is selected
  const sensor = selectedSensorId ? sensors.find(s => s.id === selectedSensorId) : null;
  const compHealth = sensor ? componentHealth[sensor.componentId] : (selectedComponentId ? componentHealth[selectedComponentId] : null);
  const sensorTypeInfo = sensor ? (SENSOR_TYPES[sensor.type] || SENSOR_TYPES.STRAIN) : null;

  // Render SVG Sparkline
  const renderSparkline = (history = [], thresholds = { warning: 100, critical: 120 }) => {
    if (history.length < 2) return null;
    const width = 280;
    const height = 65;
    const min = Math.min(...history, thresholds.warning * 0.7);
    const max = Math.max(...history, thresholds.critical * 1.15);
    const range = max - min || 1;

    const points = history.map((val, idx) => {
      const x = (idx / (history.length - 1)) * width;
      const y = height - ((val - min) / range) * (height - 12) - 6;
      return `${x},${y}`;
    }).join(' ');

    const warnY = height - ((thresholds.warning - min) / range) * (height - 12) - 6;
    const critY = height - ((thresholds.critical - min) / range) * (height - 12) - 6;

    return (
      <svg className="sparkline-svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <defs>
          <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Demo Warning & Critical Threshold guide lines */}
        {warnY >= 0 && warnY <= height && (
          <line x1="0" y1={warnY} x2={width} y2={warnY} stroke="#f59e0b" strokeDasharray="3,3" strokeWidth="1" />
        )}
        {critY >= 0 && critY <= height && (
          <line x1="0" y1={critY} x2={width} y2={critY} stroke="#ef4444" strokeDasharray="3,3" strokeWidth="1.2" />
        )}

        {/* Sparkline curve */}
        <polyline
          fill="none"
          stroke={sensor?.status === 'critical' ? '#ef4444' : sensor?.status === 'warning' ? '#f59e0b' : '#06b6d4'}
          strokeWidth="2.5"
          points={points}
        />
      </svg>
    );
  };

  const handleClose = () => {
    selectSensor(null);
    selectComponent(null);
  };

  return (
    <div className="inspector-modal-card">
      {/* Header */}
      <div className="inspector-header">
        <div className="inspector-title-wrap">
          <div className="inspector-icon-box">
            <Radio size={16} className="text-cyan" />
          </div>
          <div>
            <div className="inspector-code">{sensor ? sensor.code : selectedComponentId}</div>
            <div className="inspector-name">{sensor ? sensor.name : `Component: ${selectedComponentId}`}</div>
          </div>
        </div>
        <button className="inspector-close-btn" onClick={handleClose}>
          <X size={15} />
        </button>
      </div>

      {sensor ? (
        <div className="inspector-body">
          {/* Live Metric Display */}
          <div className="inspector-metric-box">
            <div className="metric-label-row">
              <span className="metric-label">CURRENT TELEMETRY READING</span>
              <span className={`status-pill ${sensor.status}`}>
                {sensor.status.toUpperCase()}
              </span>
            </div>
            <div className="metric-big-value">
              <span className={`val-num ${sensor.status === 'critical' ? 'text-crimson' : sensor.status === 'warning' ? 'text-amber' : 'text-cyan'}`}>
                {sensor.currentValue}
              </span>
              <span className="val-unit">{sensor.unit}</span>
            </div>
            <div className="metric-sub-info">
              <span>Sampling: {sensor.samplingRate}</span>
              <span className="trend-badge">
                {sensor.trend === 'increasing' ? (
                  <span className="text-amber flex items-center gap-1"><TrendingUp size={12} /> Increasing</span>
                ) : sensor.trend === 'decreasing' ? (
                  <span className="text-emerald flex items-center gap-1"><TrendingDown size={12} /> Decreasing</span>
                ) : (
                  <span className="text-slate flex items-center gap-1">Stable</span>
                )}
              </span>
            </div>
          </div>

          {/* Sparkline History Chart */}
          <div className="inspector-chart-box">
            <div className="chart-title-row">
              <span>LIVE ROLLING WAVEFORM (25 SAMPLES)</span>
              <span className="text-xs text-slate">5 Hz Stream</span>
            </div>
            {renderSparkline(sensor.history, sensor.thresholds)}
            <div className="chart-legend">
              <span className="legend-item"><span className="legend-dot normal" /> Normal</span>
              <span className="legend-item"><span className="legend-dot warn" /> Demo Warning ({sensor.thresholds.warning} {sensor.unit})</span>
              <span className="legend-item"><span className="legend-dot crit" /> Demo Critical ({sensor.thresholds.critical} {sensor.unit})</span>
            </div>
          </div>

          {/* Details Table */}
          <div className="inspector-details-list">
            <div className="detail-row">
              <span className="detail-k">Sensor Modality:</span>
              <span className="detail-v">{sensorTypeInfo?.label}</span>
            </div>
            <div className="detail-row">
              <span className="detail-k">Structural Location:</span>
              <span className="detail-v">{sensor.location}</span>
            </div>
            <div className="detail-row">
              <span className="detail-k">Component ID:</span>
              <span className="detail-v text-cyan font-mono">{sensor.componentId}</span>
            </div>
            <div className="detail-row">
              <span className="detail-k">Component Stress:</span>
              <span className="detail-v font-mono">{compHealth?.stressPercent || 20}%</span>
            </div>
          </div>

          <div className="demo-disclaimer-badge">
            <AlertOctagon size={12} className="text-amber flex-shrink-0" />
            <span>Demonstration threshold for educational MVP. Non-safety critical.</span>
          </div>
        </div>
      ) : (
        /* Structural Component Fallback */
        <div className="inspector-body">
          <div className="inspector-metric-box">
            <div className="metric-label-row">
              <span className="metric-label">STRUCTURAL COMPONENT STRESS</span>
              <span className={`status-pill ${compHealth?.status || 'normal'}`}>
                {(compHealth?.status || 'normal').toUpperCase()}
              </span>
            </div>
            <div className="metric-big-value">
              <span className="val-num text-cyan">{compHealth?.stressPercent || 20}%</span>
              <span className="val-unit">Stress Load</span>
            </div>
          </div>

          <div className="inspector-details-list">
            <div className="detail-row">
              <span className="detail-k">Estimated Microstrain:</span>
              <span className="detail-v font-mono">{compHealth?.strain || 210} µε</span>
            </div>
            <div className="detail-row">
              <span className="detail-k">Dynamic Vibration:</span>
              <span className="detail-v font-mono">{compHealth?.vibration || 0.08} m/s²</span>
            </div>
            <div className="detail-row">
              <span className="detail-k">Midspan Deflection:</span>
              <span className="detail-v font-mono">{compHealth?.displacement || 8.0} mm</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
