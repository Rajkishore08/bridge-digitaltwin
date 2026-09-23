import { create } from 'zustand';
import { SENSORS_DATA } from '../data/sensorConfig';
import { BRIDGE_COMPONENTS } from '../data/bridgeConfig';

export const useBridgeStore = create((set, get) => ({
  // 1. Environmental & Simulation Inputs
  trafficLevel: 'LOW', // 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME'
  vehicleWeight: 1.0,  // 1.0 = Standard (40t), 1.6 = Heavy (65t), 2.2 = Overloaded (90t)
  windSpeed: 18,       // km/h (0 to 140)
  temperature: 24,     // °C (-10 to 55)
  simulationSpeed: 1,  // 0 (paused), 1, 2, 5
  activeScenario: 'normal',
  lightingMode: 'NIGHT', // 'DAY' | 'SUNSET' | 'NIGHT'

  // 2. Viewport & 3D Twin Controls
  viewMode: 'LIVE',    // 'LIVE' | 'STRESS' | 'VIBRATION' | 'DISPLACEMENT' | 'SENSOR' | 'TRAFFIC'
  cameraPreset: 'OVERVIEW',
  cameraCommand: null, // { type: 'ZOOM_IN'|'ZOOM_OUT'|'ROTATE_LEFT'|'ROTATE_RIGHT'|'ROTATE_UP'|'ROTATE_DOWN'|'VIEW_TOP'|'VIEW_SIDE'|'VIEW_FRONT'|'VIEW_ISO'|'RESET', ts: number }
  selectedSensorId: null,
  selectedComponentId: null,
  hoveredSensorId: null,
  hoveredComponentId: null,
  selectedZone: null,  // 'SPAN_01'..'SPAN_04', 'TOWER_01'..'02', 'PIER_01'..'04'

  // 3. Exaggerated Displacement Mode
  displacementExaggerated: true,
  displacementMultiplier: 10,

  // 4. Historical Playback Scrubber
  historicalTime: 0, // 0 = Live, -1 = 24h ago, -7 = 7d ago, -30 = 30d ago
  isHistoricalPlaying: false,

  // 5. Extreme Failure & Bridge Collapse Simulation
  collapseSimulation: {
    active: false,
    progress: 0, // 0 - 100
    step: 'NORMAL', // 'NORMAL' | 'OVERLOAD' | 'CRACKING' | 'SNAPPING' | 'COLLAPSED'
    failingComponentId: 'SPAN_03',
  },

  // 6. Automated 14-Step Industrial Demo Tour
  autoDemo: {
    active: false,
    currentStep: 1,
    totalSteps: 14,
    timer: null,
  },

  // 7. Active Modals & Overlays
  activeModal: null, // null | 'LEARN' | 'ARCHITECTURE' | 'SENSOR_TABLE' | 'EXPORT_REPORT' | 'DEMO_GUIDE'

  // 8. Telemetry State
  sensors: SENSORS_DATA.map(s => ({
    ...s,
    currentValue: s.baseValue,
    history: [s.baseValue],
    status: 'normal',
    trend: 'stable',
    rms: (s.baseValue * 0.05).toFixed(2),
    frequency: (3.2 + (Math.random() - 0.5) * 0.2).toFixed(2),
  })),

  // Multi-segmented structural health model (Span 3 has 6 localized segments for continuous heatmap)
  componentHealth: BRIDGE_COMPONENTS.reduce((acc, comp) => {
    acc[comp.id] = {
      status: 'normal',
      stressPercent: 20,
      strain: comp.baselineStrain || 200,
      vibration: 0.08,
      displacement: 8.0,
      defectFactor: 1.0,
      segments: [20, 22, 25, 24, 21, 20], // Localized finite-element stress segments
    };
    return acc;
  }, {}),

  overallHealthIndex: 96,
  structuralRiskScore: 12,

  // 9. Alerts & Incident Management
  alerts: [],
  eventLog: [
    {
      id: 'evt-init',
      time: new Date().toLocaleTimeString(),
      type: 'INFO',
      message: 'Smart Bridge Digital Twin online. 14 multi-modal sensor channels streaming via IoT Gateway-01.',
      location: 'System Core'
    }
  ],

  // 10. Maintenance Lifecycle
  maintenance: {
    status: 'IDLE', // 'IDLE' | 'INVESTIGATING' | 'SCHEDULED' | 'IN_PROGRESS' | 'RESOLVED'
    targetComponentId: null,
    targetSensorId: null,
    progress: 0,
    technicianAssigned: null,
  },

  // ================= ACTIONS =================

  setLightingMode: (mode) => set({ lightingMode: mode }),

  setTrafficLevel: (level) => {
    set({ trafficLevel: level, activeScenario: 'custom' });
    get().addEventLog('CONFIG', `Traffic load rate set to ${level}`);
  },

  setVehicleWeight: (weight) => {
    set({ vehicleWeight: weight, activeScenario: 'custom' });
    get().addEventLog('CONFIG', `Vehicle axle weight multiplier adjusted to ${weight.toFixed(1)}x`);
  },

  setWindSpeed: (speed) => {
    set({ windSpeed: speed, activeScenario: 'custom' });
    if (speed > 75) {
      get().addEventLog('ENV', `Crosswind warning: ${speed} km/h`);
    }
  },

  setTemperature: (temp) => set({ temperature: temp, activeScenario: 'custom' }),

  setSimulationSpeed: (speed) => set({ simulationSpeed: speed }),

  setViewMode: (mode) => {
    set({ viewMode: mode });
    get().addEventLog('VIEW', `Switched 3D mode to ${mode}`);
  },

  setCameraPreset: (preset) => set({ cameraPreset: preset }),

  triggerCameraCommand: (command) => set({ cameraCommand: { type: command, ts: Date.now() } }),

  selectSensor: (id) => {
    const sensor = get().sensors.find(s => s.id === id);
    set({
      selectedSensorId: id,
      selectedComponentId: sensor ? sensor.componentId : null
    });
    if (sensor) {
      get().addEventLog('INSPECT', `Inspecting sensor ${sensor.code} (${sensor.name})`);
    }
  },

  selectComponent: (componentId) => {
    set({
      selectedComponentId: componentId,
      selectedZone: componentId,
      selectedSensorId: null
    });
  },

  setSelectedZone: (zoneId) => set({ selectedZone: zoneId }),
  setHoveredSensor: (id) => set({ hoveredSensorId: id }),
  setHoveredComponent: (id) => set({ hoveredComponentId: id }),
  setActiveModal: (modalName) => set({ activeModal: modalName }),
  toggleDisplacementExaggeration: () => set(state => ({ displacementExaggerated: !state.displacementExaggerated })),

  setHistoricalTime: (days) => {
    set({ historicalTime: days });
    get().addEventLog('PLAYBACK', `Scrubbed historical timeline to ${days === 0 ? 'LIVE' : `${Math.abs(days)} Days Ago`}`);
  },

  setHistoricalPlaying: (isPlaying) => set({ isHistoricalPlaying: isPlaying }),

  addEventLog: (type, message, location = 'System') => {
    const newEvent = {
      id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      time: new Date().toLocaleTimeString(),
      type,
      message,
      location
    };
    set(state => ({
      eventLog: [newEvent, ...state.eventLog.slice(0, 59)]
    }));
  },

  updateTelemetry: ({ updatedSensors, updatedComponents, healthIndex, riskScore, newAlerts }) => {
    set(state => {
      // If collapse simulation is in progress, lock telemetry to catastrophic values
      if (state.collapseSimulation.active) {
        return {};
      }

      let mergedAlerts = [...state.alerts];
      if (newAlerts && newAlerts.length > 0) {
        newAlerts.forEach(na => {
          const existing = mergedAlerts.find(a => a.sensorId === na.sensorId && !a.resolved);
          if (!existing) {
            mergedAlerts.unshift(na);
          } else if (existing.level !== na.level) {
            existing.level = na.level;
            existing.message = na.message;
            existing.currentValue = na.currentValue;
          }
        });
      }

      return {
        sensors: updatedSensors,
        componentHealth: updatedComponents,
        overallHealthIndex: healthIndex,
        structuralRiskScore: riskScore,
        alerts: mergedAlerts
      };
    });
  },

  // Alert & Maintenance Actions
  acknowledgeAlert: (alertId) => {
    set(state => ({
      alerts: state.alerts.map(a => a.id === alertId ? { ...a, acknowledged: true } : a)
    }));
    get().addEventLog('ACTION', `Alert ${alertId} acknowledged by on-duty structural engineer.`);
  },

  scheduleInspection: (alertId) => {
    const alert = get().alerts.find(a => a.id === alertId);
    set(state => ({
      alerts: state.alerts.map(a => a.id === alertId ? { ...a, acknowledged: true, maintenanceScheduled: true } : a),
      maintenance: {
        status: 'SCHEDULED',
        targetComponentId: alert?.componentId || 'SPAN_03',
        targetSensorId: alert?.sensorId || 'S03',
        progress: 0,
        technicianAssigned: 'Civil Infrastructure Response Crew #2'
      }
    }));
    get().addEventLog('MAINTENANCE', `Inspection scheduled for ${alert?.location || 'Span 3'}. Work order logged.`);
  },

  executeMaintenance: () => {
    const { maintenance } = get();
    set(state => ({
      maintenance: { ...state.maintenance, status: 'IN_PROGRESS', progress: 20 }
    }));
    get().addEventLog('MAINTENANCE', `Maintenance crew deployed. Structural hydraulic jack stabilization & sensor recalibration started.`);

    setTimeout(() => {
      set(state => ({ maintenance: { ...state.maintenance, progress: 65 } }));
    }, 900);

    setTimeout(() => {
      set(state => {
        const targetCompId = state.maintenance.targetComponentId || 'SPAN_03';
        const updatedCompHealth = { ...state.componentHealth };
        if (updatedCompHealth[targetCompId]) {
          updatedCompHealth[targetCompId].defectFactor = 1.0;
          updatedCompHealth[targetCompId].status = 'normal';
          updatedCompHealth[targetCompId].segments = [20, 22, 24, 22, 20, 19];
        }

        return {
          maintenance: {
            ...state.maintenance,
            status: 'RESOLVED',
            progress: 100
          },
          alerts: state.alerts.map(a => 
            (a.componentId === targetCompId || a.sensorId === state.maintenance.targetSensorId) 
              ? { ...a, resolved: true, status: 'resolved' } 
              : a
          ),
          activeScenario: 'normal',
          trafficLevel: 'LOW',
          vehicleWeight: 1.0,
          windSpeed: 20,
          temperature: 24,
        };
      });

      get().addEventLog('RESOLVE', `Maintenance completed successfully on ${maintenance.targetComponentId || 'Span 3'}. Structural tension restored to factory baseline.`);
    }, 1800);
  },

  // ================= EXTREME FAILURE SIMULATION =================
  triggerExtremeFailure: () => {
    const store = get();
    store.addEventLog('CRITICAL', '🚨 EXTREME STRUCTURAL FAILURE SIMULATION INITIATED — FORCED OVERLOAD', 'Span 3');

    // Freeze normal traffic and zoom camera on Span 3
    set(state => ({
      collapseSimulation: {
        active: true,
        progress: 10,
        step: 'OVERLOAD',
        failingComponentId: 'SPAN_03',
      },
      cameraPreset: 'SPAN_03',
      viewMode: 'STRESS',
      trafficLevel: 'EXTREME',
      structuralRiskScore: 99,
      overallHealthIndex: 4,
    }));

    // Step 2: Critical Strain & Cable Snapping
    setTimeout(() => {
      set(state => ({
        collapseSimulation: { ...state.collapseSimulation, progress: 45, step: 'SNAPPING' },
        alerts: [
          {
            id: `alt-collapse-${Date.now()}`,
            sensorId: 'S03',
            sensorCode: 'SG-S03',
            componentId: 'SPAN_03',
            location: 'Span 3 / North Main Girder',
            level: 'CRITICAL',
            currentValue: 1850,
            unit: 'µε',
            threshold: 780,
            message: 'CATASTROPHIC STRAIN FAILURE: Stay cables anchor fracture on Span 3.',
            timestamp: new Date().toLocaleTimeString(),
            acknowledged: false,
          },
          ...state.alerts,
        ]
      }));
      store.addEventLog('CRITICAL', 'Stay cable array tensile rupture on Span 3. Main girder buckling.', 'Span 3');
    }, 1500);

    // Step 3: Deck Fracture & Full Collapse
    setTimeout(() => {
      set(state => ({
        collapseSimulation: { ...state.collapseSimulation, progress: 100, step: 'COLLAPSED' }
      }));
      store.addEventLog('CRITICAL', 'CATASTROPHIC COLLAPSE SIMULATION COMPLETE. Span 3 detached.', 'Span 3');
    }, 3200);
  },

  resetCollapse: () => {
    set(state => {
      const compHealth = { ...state.componentHealth };
      Object.keys(compHealth).forEach(k => {
        compHealth[k].defectFactor = 1.0;
        compHealth[k].status = 'normal';
        compHealth[k].stressPercent = 20;
        compHealth[k].segments = [20, 22, 25, 23, 21, 20];
      });

      return {
        collapseSimulation: {
          active: false,
          progress: 0,
          step: 'NORMAL',
          failingComponentId: 'SPAN_03',
        },
        trafficLevel: 'LOW',
        vehicleWeight: 1.0,
        windSpeed: 18,
        temperature: 24,
        viewMode: 'LIVE',
        cameraPreset: 'OVERVIEW',
        alerts: state.alerts.map(a => ({ ...a, resolved: true })),
        componentHealth: compHealth,
        structuralRiskScore: 12,
        overallHealthIndex: 96,
        maintenance: { status: 'IDLE', targetComponentId: null, targetSensorId: null, progress: 0, technicianAssigned: null },
      };
    });
    get().addEventLog('RESET', 'Bridge Digital Twin structural integrity restored from collapse simulation.');
  },

  // ================= AUTOMATED 14-STEP DEMO TOUR =================
  startAutoDemo: () => {
    set({ autoDemo: { active: true, currentStep: 1, totalSteps: 14, timer: null } });
    get().executeDemoStep(1);
  },

  stopAutoDemo: () => {
    const { autoDemo } = get();
    if (autoDemo.timer) clearTimeout(autoDemo.timer);
    set({ autoDemo: { active: false, currentStep: 1, totalSteps: 14, timer: null } });
  },

  executeDemoStep: (step) => {
    const store = get();
    if (!store.autoDemo.active && step !== 1) return;

    set(state => ({ autoDemo: { ...state.autoDemo, currentStep: step } }));

    switch (step) {
      case 1:
        store.resetSimulation();
        store.setCameraPreset('OVERVIEW');
        store.setViewMode('LIVE');
        store.addEventLog('DEMO', 'Demo Tour Step 1/14: Baseline physical bridge digital twin.');
        break;
      case 2:
        store.setViewMode('SENSOR');
        store.addEventLog('DEMO', 'Demo Tour Step 2/14: Inspecting 14 multi-modal sensor network nodes.');
        break;
      case 3:
        store.setCameraPreset('SPAN_03');
        store.selectSensor('S03');
        store.addEventLog('DEMO', 'Demo Tour Step 3/14: Zooming into Span 3 Fiber Bragg Grating strain gauge.');
        break;
      case 4:
        store.selectSensor(null);
        store.setTrafficLevel('MEDIUM');
        store.setViewMode('TRAFFIC');
        store.addEventLog('DEMO', 'Demo Tour Step 4/14: Vehicle traffic flow introduced.');
        break;
      case 5:
        store.setTrafficLevel('HIGH');
        store.setVehicleWeight(1.5);
        store.setViewMode('STRESS');
        store.addEventLog('DEMO', 'Demo Tour Step 5/14: Heavy vehicle loading increases deck stress.');
        break;
      case 6:
        store.setWindSpeed(85);
        store.setViewMode('VIBRATION');
        store.addEventLog('DEMO', 'Demo Tour Step 6/14: Crosswind excitation induces dynamic modal vibration.');
        break;
      case 7:
        store.applyScenario('overweight_freight');
        store.setCameraPreset('SPAN_03');
        store.setViewMode('STRESS');
        store.addEventLog('DEMO', 'Demo Tour Step 7/14: Overweight convoy causes concentrated Span 3 strain anomaly.');
        break;
      case 8:
        store.addEventLog('DEMO', 'Demo Tour Step 8/14: Critical anomaly detected. Span 3 turns RED on stress heatmap.');
        break;
      case 9:
        store.selectSensor('S03');
        store.addEventLog('DEMO', 'Demo Tour Step 9/14: Shift engineer inspects live telemetry waveform (820 µε).');
        break;
      case 10:
        const firstAlert = store.alerts[0];
        if (firstAlert) store.acknowledgeAlert(firstAlert.id);
        store.addEventLog('DEMO', 'Demo Tour Step 10/14: Engineer acknowledges critical structural alert.');
        break;
      case 11:
        if (firstAlert) store.scheduleInspection(firstAlert.id);
        store.addEventLog('DEMO', 'Demo Tour Step 11/14: Maintenance inspection work order dispatched.');
        break;
      case 12:
        store.executeMaintenance();
        store.addEventLog('DEMO', 'Demo Tour Step 12/14: Hydraulic stabilization & sensor re-calibration executing.');
        break;
      case 13:
        store.selectSensor(null);
        store.setCameraPreset('OVERVIEW');
        store.setViewMode('LIVE');
        store.addEventLog('DEMO', 'Demo Tour Step 13/14: Structural stress normalized, alerts resolved, bridge returns to GREEN.');
        break;
      case 14:
        store.addEventLog('DEMO', 'Demo Tour Step 14/14: Closed-loop SHM demonstration completed successfully!');
        break;
      default:
        break;
    }

    // Advance to next step after 4.5 seconds if auto tour is running
    if (step < 14) {
      const timer = setTimeout(() => {
        if (get().autoDemo.active) {
          get().executeDemoStep(step + 1);
        }
      }, 4500);
      set(state => ({ autoDemo: { ...state.autoDemo, timer } }));
    } else {
      setTimeout(() => {
        set(state => ({ autoDemo: { ...state.autoDemo, active: false } }));
      }, 5000);
    }
  },

  applyScenario: (scenarioName) => {
    switch (scenarioName) {
      case 'normal':
        set(state => {
          const compHealth = { ...state.componentHealth };
          Object.keys(compHealth).forEach(k => {
            compHealth[k].defectFactor = 1.0;
            compHealth[k].status = 'normal';
            compHealth[k].stressPercent = 20;
            compHealth[k].segments = [20, 22, 24, 22, 20, 19];
          });
          return {
            activeScenario: 'normal',
            trafficLevel: 'LOW',
            vehicleWeight: 1.0,
            windSpeed: 18,
            temperature: 22,
            alerts: state.alerts.map(a => ({ ...a, resolved: true })),
            componentHealth: compHealth,
            maintenance: { status: 'IDLE', targetComponentId: null, targetSensorId: null, progress: 0, technicianAssigned: null }
          };
        });
        get().addEventLog('SCENARIO', 'Scenario: Normal Nominal Operation');
        break;

      case 'rush_hour':
        set({
          activeScenario: 'rush_hour',
          trafficLevel: 'HIGH',
          vehicleWeight: 1.2,
          windSpeed: 25,
          temperature: 28,
        });
        get().addEventLog('SCENARIO', 'Scenario: Peak Rush Hour Traffic');
        break;

      case 'windstorm':
        set({
          activeScenario: 'windstorm',
          trafficLevel: 'MEDIUM',
          vehicleWeight: 1.0,
          windSpeed: 95,
          temperature: 14,
          viewMode: 'VIBRATION'
        });
        get().addEventLog('SCENARIO', 'Scenario: Severe Crosswind Storm (95 km/h Dynamic Gusts)');
        break;

      case 'overweight_freight':
        set(state => {
          const compHealth = { ...state.componentHealth };
          if (compHealth['SPAN_03']) {
            compHealth['SPAN_03'].defectFactor = 2.4;
            compHealth['SPAN_03'].segments = [35, 65, 92, 98, 70, 40]; // Span 3 continuous red center hotspot
          }
          return {
            activeScenario: 'overweight_freight',
            trafficLevel: 'EXTREME',
            vehicleWeight: 2.2,
            windSpeed: 30,
            temperature: 32,
            componentHealth: compHealth,
            viewMode: 'STRESS',
          };
        });
        get().addEventLog('SCENARIO', 'Scenario: Overweight Freight Convoy (Span 3 Critical Strain)');
        break;

      case 'thermal':
        set({
          activeScenario: 'thermal',
          trafficLevel: 'HIGH',
          vehicleWeight: 1.4,
          windSpeed: 12,
          temperature: 48,
        });
        get().addEventLog('SCENARIO', 'Scenario: Extreme Heatwave Thermal Expansion');
        break;

      default:
        break;
    }
  },

  resetSimulation: () => {
    get().applyScenario('normal');
    set({
      selectedSensorId: null,
      selectedComponentId: null,
      selectedZone: null,
      cameraPreset: 'OVERVIEW',
      viewMode: 'LIVE',
      collapseSimulation: { active: false, progress: 0, step: 'NORMAL', failingComponentId: 'SPAN_03' },
      historicalTime: 0,
      isHistoricalPlaying: false,
    });
    get().addEventLog('RESET', 'Bridge digital twin restored to factory baseline.');
  }
}));
