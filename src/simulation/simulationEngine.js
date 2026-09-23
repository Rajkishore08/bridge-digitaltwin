/**
 * Simulation Physics & Sensor Correlation Engine
 * Correlates traffic flux, wind gusting, and thermal gradient to bridge structural response
 */

import { BRIDGE_COMPONENTS } from '../data/bridgeConfig';

const TRAFFIC_MULTIPLIERS = {
  LOW: 1.0,
  MEDIUM: 1.8,
  HIGH: 3.2,
  EXTREME: 5.5,
};

export function runPhysicsStep(storeState, deltaTime) {
  const {
    trafficLevel,
    vehicleWeight,
    windSpeed,
    temperature,
    sensors,
    componentHealth,
    simulationSpeed,
  } = storeState;

  if (simulationSpeed === 0) {
    return null; // Paused
  }

  const trafficMult = (TRAFFIC_MULTIPLIERS[trafficLevel] || 1.0) * vehicleWeight;
  const tempDelta = temperature - 20; // baseline 20°C
  // Extreme thermal stress when hot (>35°C) or freezing (<5°C)
  const thermalStrain = Math.abs(tempDelta) * 3.6;
  const windFactor = Math.pow(windSpeed / 20, 1.4);

  // Slight pseudo-random micro-jitter to simulate live real-world sensor noise
  const jitter = (scale = 1) => (Math.random() - 0.5) * scale;

  const updatedComponents = { ...componentHealth };
  const newAlerts = [];

  // 1. Update Bridge Structural Components
  BRIDGE_COMPONENTS.forEach(comp => {
    const compState = updatedComponents[comp.id] || {
      status: 'normal',
      stressPercent: 20,
      strain: 200,
      vibration: 0.08,
      displacement: 8.0,
      defectFactor: 1.0
    };

    const defect = compState.defectFactor || 1.0;
    
    // Baseline strain + traffic strain + thermal expansion + defect amplification
    let compStrain = (comp.baselineStrain || 220) * (0.6 + 0.45 * trafficMult) * defect;
    compStrain += thermalStrain + jitter(6);

    // Vibration from traffic motion & crosswind turbulence
    let compVib = 0.05 + (trafficMult * 0.04) + (windFactor * 0.08) * defect + Math.abs(jitter(0.02));

    // Midspan displacement
    let compDisp = (compStrain / 35) + (tempDelta * 0.15);

    // Stress Percentage (0 to 100%)
    let stressPct = Math.min(100, Math.max(12, (compStrain / 720) * 100));

    // Dynamic 6-segment finite-element stress profile for each span
    const centerProfile = comp.id === 'SPAN_03'
      ? [0.75, 0.94, 1.15, 1.20, 0.96, 0.76]
      : [0.80, 0.95, 1.06, 1.06, 0.95, 0.80];
    
    const dynamicSegments = centerProfile.map(w => 
      Math.min(100, Math.max(10, Math.round(stressPct * w)))
    );

    // Determine health classification
    let status = 'normal';
    if (stressPct >= 80 || compStrain >= 650) {
      status = 'critical'; // Red
    } else if (stressPct >= 62 || compStrain >= 520) {
      status = 'elevated'; // Orange
    } else if (stressPct >= 45 || compStrain >= 380) {
      status = 'warning'; // Yellow / Amber
    }

    updatedComponents[comp.id] = {
      ...compState,
      strain: Math.round(compStrain),
      vibration: parseFloat(compVib.toFixed(3)),
      displacement: parseFloat(compDisp.toFixed(1)),
      stressPercent: Math.round(stressPct),
      segments: dynamicSegments,
      status
    };
  });

  // 2. Update All 14 Sensor Registry Channels
  const updatedSensors = sensors.map(sensor => {
    const compId = sensor.componentId;
    const compData = updatedComponents[compId] || {};
    let val = sensor.baseValue;

    switch (sensor.type) {
      case 'STRAIN':
        val = compData.strain ? compData.strain + jitter(5) : sensor.baseValue * trafficMult;
        val = Math.max(80, Math.round(val));
        break;

      case 'ACCEL':
        val = (compData.vibration || 0.1) + Math.abs(jitter(0.015));
        val = parseFloat(val.toFixed(3));
        break;

      case 'DISP':
        val = (compData.displacement || 10) + jitter(0.3);
        val = parseFloat(Math.max(0, val).toFixed(1));
        break;

      case 'TEMP':
        val = temperature + jitter(0.4);
        val = parseFloat(val.toFixed(1));
        break;

      case 'WIND':
        val = windSpeed + jitter(3.5);
        val = parseFloat(Math.max(0, val).toFixed(1));
        break;

      case 'LOAD':
        const baseVeh = trafficLevel === 'LOW' ? 42 : trafficLevel === 'MEDIUM' ? 88 : trafficLevel === 'HIGH' ? 145 : 210;
        val = Math.max(5, Math.round(baseVeh * vehicleWeight + jitter(12)));
        break;

      default:
        val = sensor.baseValue;
    }

    // Determine Sensor Status against thresholds
    let status = 'normal';
    const { warning, critical } = sensor.thresholds;
    if (val >= critical) {
      status = 'critical';
    } else if (val >= warning) {
      status = 'warning';
    } else if (val >= warning * 0.9) {
      status = 'elevated';
    }

    // Check if new alert should be raised
    if (status === 'critical' || status === 'warning') {
      newAlerts.push({
        id: `alt-${sensor.id}-${Date.now()}`,
        sensorId: sensor.id,
        sensorCode: sensor.code,
        componentId: sensor.componentId,
        location: sensor.location,
        type: sensor.type,
        level: status === 'critical' ? 'CRITICAL' : 'WARNING',
        currentValue: val,
        unit: sensor.unit,
        threshold: status === 'critical' ? critical : warning,
        message: `${status.toUpperCase()}: ${sensor.name} reading ${val} ${sensor.unit} exceeds demo threshold of ${status === 'critical' ? critical : warning} ${sensor.unit}`,
        timestamp: new Date().toLocaleTimeString(),
        acknowledged: false,
        maintenanceScheduled: false,
        resolved: false,
      });
    }

    // Maintain 30-point rolling history for sparkline charts
    const history = [...(sensor.history || [sensor.baseValue])];
    if (history.length > 25) history.shift();
    history.push(val);

    const prevVal = history[history.length - 2] || val;
    const trend = val > prevVal + 0.5 ? 'increasing' : val < prevVal - 0.5 ? 'decreasing' : 'stable';

    return {
      ...sensor,
      currentValue: val,
      history,
      status,
      trend,
    };
  });

  // 3. Compute Aggregated Overall Health Index & Structural Risk Score
  const compValues = Object.values(updatedComponents);
  const maxStress = Math.max(...compValues.map(c => c.stressPercent || 20));
  const avgStress = compValues.reduce((sum, c) => sum + (c.stressPercent || 20), 0) / compValues.length;

  const structuralRiskScore = Math.min(100, Math.round((maxStress * 0.7) + (avgStress * 0.3)));
  const overallHealthIndex = Math.max(0, 100 - structuralRiskScore);

  return {
    updatedSensors,
    updatedComponents,
    healthIndex: overallHealthIndex,
    riskScore: structuralRiskScore,
    newAlerts: newAlerts.slice(0, 3), // throttle alerts
  };
}
