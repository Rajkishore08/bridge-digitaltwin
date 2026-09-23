import React from 'react';
import { 
  BookOpen, 
  X, 
  Activity, 
  Zap, 
  MoveVertical, 
  Thermometer, 
  Wind, 
  Truck, 
  Cpu, 
  Layers, 
  HelpCircle 
} from 'lucide-react';
import { useBridgeStore } from '../../store/useBridgeStore';

const LEARNING_TOPICS = [
  {
    icon: Activity,
    color: '#06b6d4',
    title: 'Fiber Bragg Grating (FBG) Strain Gauges',
    desc: 'Measures microstrain (µε) along the longitudinal steel girders and concrete soffits. Changes in structural load alter the reflected optical wavelength, detecting bending moments and tensile stress.',
    role: 'Early detection of localized fatigue, overload, and micro-cracking.'
  },
  {
    icon: Zap,
    color: '#a855f7',
    title: 'Triaxial Piezoelectric Accelerometers',
    desc: 'Captures high-frequency acceleration (m/s²) and structural vibrations. Identifies bridge modal frequencies (natural bending and torsional frequencies) to detect stiffness degradation or flutter.',
    role: 'Vibration monitoring, seismic response, and dynamic wind resonance detection.'
  },
  {
    icon: MoveVertical,
    color: '#3b82f6',
    title: 'Linear Variable Differential Transformers (LVDT)',
    desc: 'Tracks vertical displacement and mid-span deflection (mm) relative to baseline pier benchmarks and expansion joint movements.',
    role: 'Ensuring bridge deflections remain within allowable serviceability limit states.'
  },
  {
    icon: Thermometer,
    color: '#f59e0b',
    title: 'Surface Thermocouples & Temperature Gradients',
    desc: 'Records thermal variations (°C) across the top deck slab and steel box girders to compute thermal expansion and separate environmental effects from structural damage.',
    role: 'Thermal compensation in baseline strain analytics.'
  },
  {
    icon: Wind,
    color: '#10b981',
    title: 'Ultrasonic 3D Wind Anemometers',
    desc: 'Measures horizontal and vertical wind velocity vectors (km/h) and turbulence intensity at pylon heights.',
    role: 'Correlating aerodynamic vortex shedding with stay cable vibrations.'
  },
  {
    icon: Truck,
    color: '#ec4899',
    title: 'Weigh-in-Motion (WIM) Sensors',
    desc: 'Embedded piezo-quartz strip sensors on approach road lanes that measure vehicle axle weights, gross vehicle weight (GVW), and traffic flux in real time.',
    role: 'Live load quantification and overweight vehicle enforcement.'
  },
  {
    icon: Cpu,
    color: '#38bdf8',
    title: 'IoT Edge Gateways & Data Telemetry',
    desc: 'Ruggedized on-bridge computing nodes that ingest raw high-frequency sensor streams (100–200 Hz), compute RMS/peak values, and transmit aggregated telemetry to the digital twin.',
    role: 'Low-latency edge anomaly detection and wireless transmission.'
  },
  {
    icon: Layers,
    color: '#f43f5e',
    title: 'Digital Twin & AI Stress Analytics',
    desc: 'A synchronized 3D cyber-physical representation running continuous physics correlation models to map live telemetry directly onto finite element structural components.',
    role: 'Condition-based predictive maintenance and real-time structural risk scoring.'
  },
];

export function LearnModeModal() {
  const activeModal = useBridgeStore(state => state.activeModal);
  const setActiveModal = useBridgeStore(state => state.setActiveModal);

  if (activeModal !== 'LEARN') return null;

  return (
    <div className="modal-backdrop-generic" onClick={() => setActiveModal(null)}>
      <div className="modal-card-generic learn-modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header-generic">
          <div className="modal-title-generic">
            <BookOpen size={18} className="text-cyan" />
            <span>EDUCATIONAL GUIDE: STRUCTURAL HEALTH MONITORING (SHM)</span>
          </div>
          <button className="inspector-close-btn" onClick={() => setActiveModal(null)}>
            <X size={16} />
          </button>
        </div>

        <div className="learn-modal-body">
          <p className="learn-intro-text">
            Structural Health Monitoring (SHM) combines multi-modal sensors, IoT gateways, and real-time digital twins to continuously evaluate the physical condition and safety of civil infrastructure assets.
          </p>

          <div className="learn-grid">
            {LEARNING_TOPICS.map((topic, idx) => {
              const Icon = topic.icon;
              return (
                <div key={idx} className="learn-topic-card">
                  <div className="topic-header">
                    <div className="topic-icon-wrap" style={{ backgroundColor: `${topic.color}20`, borderColor: topic.color }}>
                      <Icon size={16} style={{ color: topic.color }} />
                    </div>
                    <div className="topic-title" style={{ color: topic.color }}>{topic.title}</div>
                  </div>
                  <p className="topic-desc">{topic.desc}</p>
                  <div className="topic-role">
                    <strong>SHM Purpose:</strong> {topic.role}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
