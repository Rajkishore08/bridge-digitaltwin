import React from 'react';
import { 
  HeartPulse, 
  AlertTriangle, 
  Bell, 
  Radio, 
  Truck, 
  Thermometer, 
  Wind,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { useBridgeStore } from '../../store/useBridgeStore';

export function KpiBar() {
  const overallHealthIndex = useBridgeStore(state => state.overallHealthIndex);
  const structuralRiskScore = useBridgeStore(state => state.structuralRiskScore);
  const alerts = useBridgeStore(state => state.alerts);
  const sensors = useBridgeStore(state => state.sensors);
  const temperature = useBridgeStore(state => state.temperature);
  const windSpeed = useBridgeStore(state => state.windSpeed);
  const trafficLevel = useBridgeStore(state => state.trafficLevel);
  const vehicleWeight = useBridgeStore(state => state.vehicleWeight);

  const activeAlertsCount = alerts.filter(a => !a.resolved).length;
  const criticalCount = alerts.filter(a => !a.resolved && a.level === 'CRITICAL').length;
  
  // Calculate approx total vehicles / min
  const loadSensor = sensors.find(s => s.type === 'LOAD');
  const liveTrafficRate = loadSensor ? loadSensor.currentValue : 45;

  const getConditionLabel = () => {
    if (overallHealthIndex >= 85) return { text: 'GOOD / NOMINAL', class: 'text-emerald' };
    if (overallHealthIndex >= 65) return { text: 'MODERATE DEGRADATION', class: 'text-amber' };
    if (overallHealthIndex >= 40) return { text: 'ELEVATED STRESS', class: 'text-orange' };
    return { text: 'CRITICAL WARNING', class: 'text-crimson' };
  };

  const cond = getConditionLabel();

  return (
    <div className="kpi-bar-container">
      {/* KPI 1: Overall Condition */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">OVERALL CONDITION</span>
          <HeartPulse size={15} className="kpi-icon text-emerald" />
        </div>
        <div className={`kpi-value-lg ${cond.class}`}>{cond.text}</div>
        <div className="kpi-subtext">Structural Health Index: <strong>{overallHealthIndex}%</strong></div>
      </div>

      {/* KPI 2: Structural Risk Score */}
      <div className={`kpi-card ${structuralRiskScore > 65 ? 'card-critical-pulse' : ''}`}>
        <div className="kpi-header">
          <span className="kpi-title">STRUCTURAL RISK</span>
          <AlertTriangle size={15} className={`kpi-icon ${structuralRiskScore > 50 ? 'text-crimson' : 'text-cyan'}`} />
        </div>
        <div className="kpi-value-row">
          <span className={`kpi-value-num ${structuralRiskScore > 65 ? 'text-crimson' : structuralRiskScore > 40 ? 'text-amber' : 'text-cyan'}`}>
            {structuralRiskScore}%
          </span>
          <div className="risk-meter-bar">
            <div 
              className="risk-meter-fill" 
              style={{ 
                width: `${structuralRiskScore}%`,
                backgroundColor: structuralRiskScore > 65 ? '#ef4444' : structuralRiskScore > 40 ? '#f59e0b' : '#06b6d4'
              }}
            />
          </div>
        </div>
        <div className="kpi-subtext">
          {structuralRiskScore > 60 ? 'Exceeds demo target threshold' : 'Within safe operational envelope'}
        </div>
      </div>

      {/* KPI 3: Active Alerts */}
      <div className={`kpi-card ${criticalCount > 0 ? 'card-critical-bg' : ''}`}>
        <div className="kpi-header">
          <span className="kpi-title">ACTIVE ALERTS</span>
          <Bell size={15} className={`kpi-icon ${criticalCount > 0 ? 'text-crimson animate-bounce' : 'text-slate'}`} />
        </div>
        <div className="kpi-value-row">
          <span className={`kpi-value-num ${criticalCount > 0 ? 'text-crimson' : activeAlertsCount > 0 ? 'text-amber' : 'text-slate-light'}`}>
            {activeAlertsCount}
          </span>
          {criticalCount > 0 && (
            <span className="critical-tag-badge">{criticalCount} CRITICAL</span>
          )}
        </div>
        <div className="kpi-subtext">
          {activeAlertsCount === 0 ? '0 active incidents reported' : `${activeAlertsCount} anomaly events queued`}
        </div>
      </div>

      {/* KPI 4: Monitored Sensors */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">MONITORED SENSORS</span>
          <Radio size={15} className="kpi-icon text-cyan" />
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value-num text-cyan">{sensors.length} / {sensors.length}</span>
          <span className="telemetry-online-badge">ONLINE</span>
        </div>
        <div className="kpi-subtext">6 Modalities (Strain, Accel, LVDT, Temp, Wind, WIM)</div>
      </div>

      {/* KPI 5: Live Traffic Flux */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">TRAFFIC LOAD</span>
          <Truck size={15} className="kpi-icon text-indigo" />
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value-num text-indigo">{liveTrafficRate}</span>
          <span className="kpi-unit">veh/min</span>
        </div>
        <div className="kpi-subtext">Flux: <strong>{trafficLevel}</strong> • Axle: <strong>{vehicleWeight.toFixed(1)}x</strong></div>
      </div>

      {/* KPI 6: Ambient Temperature */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">TEMPERATURE</span>
          <Thermometer size={15} className="kpi-icon text-amber" />
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value-num text-amber">{temperature.toFixed(1)}</span>
          <span className="kpi-unit">°C</span>
        </div>
        <div className="kpi-subtext">Thermal Expansion: {((temperature - 20) * 0.12).toFixed(1)} mm</div>
      </div>

      {/* KPI 7: Wind Speed */}
      <div className="kpi-card">
        <div className="kpi-header">
          <span className="kpi-title">WIND SPEED</span>
          <Wind size={15} className="kpi-icon text-emerald" />
        </div>
        <div className="kpi-value-row">
          <span className="kpi-value-num text-emerald">{windSpeed}</span>
          <span className="kpi-unit">km/h</span>
        </div>
        <div className="kpi-subtext">Crosswind Vector: 248° SSW</div>
      </div>
    </div>
  );
}
