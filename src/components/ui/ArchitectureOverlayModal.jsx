import React, { useState } from 'react';
import { 
  Layers, 
  X, 
  Radio, 
  Cpu, 
  Activity, 
  Server, 
  BrainCircuit, 
  ShieldAlert, 
  Wrench, 
  ArrowRight, 
  CheckCircle2 
} from 'lucide-react';
import { useBridgeStore } from '../../store/useBridgeStore';

const PIPELINE_STEPS = [
  {
    id: 'SENSORS',
    label: '1. SENSORS LAYER',
    icon: Radio,
    color: '#06b6d4',
    desc: '14 multi-modal sensor nodes continuously measuring microstrain (FBG), triaxial acceleration, displacement (LVDT), temperature, wind velocity, and live axle loading.'
  },
  {
    id: 'GATEWAYS',
    label: '2. IoT GATEWAYS',
    icon: Cpu,
    color: '#38bdf8',
    desc: 'Dual on-bridge edge hardware units (Tower 1 & 2) providing analog-to-digital sampling, local buffering, and fiber-optic data transmission.'
  },
  {
    id: 'EDGE',
    label: '3. EDGE FILTERING',
    icon: Server,
    color: '#818cf8',
    desc: 'High-frequency Fourier transforms (FFT) and moving average algorithms filter raw noise and extract peak modal vibration frequencies.'
  },
  {
    id: 'TWIN',
    label: '4. 3D DIGITAL TWIN',
    icon: Layers,
    color: '#10b981',
    desc: 'Real-time WebGL / Three.js cyber-physical model synchronized to live telemetry, rendering finite element stress heatmaps and harmonic deflection.'
  },
  {
    id: 'ANALYTICS',
    label: '5. AI & ANOMALY ENGINE',
    icon: BrainCircuit,
    color: '#f59e0b',
    desc: 'Physics-based rule engine and predictive degradation models comparing live telemetry against configurable demonstration thresholds.'
  },
  {
    id: 'ALERTS',
    label: '6. ALERT TRIAGE',
    icon: ShieldAlert,
    color: '#ef4444',
    desc: 'Automated threshold breach notification, severity level scoring (Warning / Elevated / Critical), and auto-focus 3D camera fault tracking.'
  },
  {
    id: 'MAINTENANCE',
    label: '7. MAINTENANCE LOOP',
    icon: Wrench,
    color: '#10b981',
    desc: 'Closed-loop dispatch workflow: Work Order creation, structural tension re-calibration, stress relief validation, and audit trail logging.'
  },
];

export function ArchitectureOverlayModal() {
  const activeModal = useBridgeStore(state => state.activeModal);
  const setActiveModal = useBridgeStore(state => state.setActiveModal);
  const [selectedStepId, setSelectedStepId] = useState('TWIN');

  if (activeModal !== 'ARCHITECTURE') return null;

  const currentStep = PIPELINE_STEPS.find(s => s.id === selectedStepId) || PIPELINE_STEPS[0];

  return (
    <div className="modal-backdrop-generic" onClick={() => setActiveModal(null)}>
      <div className="modal-card-generic arch-modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header-generic">
          <div className="modal-title-generic">
            <Layers size={18} className="text-cyan" />
            <span>END-TO-END DIGITAL TWIN DATA PIPELINE ARCHITECTURE</span>
          </div>
          <button className="inspector-close-btn" onClick={() => setActiveModal(null)}>
            <X size={16} />
          </button>
        </div>

        <div className="arch-modal-body">
          {/* Interactive Flow Pipeline Nodes */}
          <div className="arch-pipeline-flow">
            {PIPELINE_STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isSelected = selectedStepId === step.id;
              return (
                <React.Fragment key={step.id}>
                  <div
                    className={`arch-node-box ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedStepId(step.id)}
                    style={{ borderColor: isSelected ? step.color : 'rgba(255,255,255,0.1)' }}
                  >
                    <Icon size={18} style={{ color: step.color }} />
                    <span className="arch-node-name">{step.label}</span>
                  </div>
                  {idx < PIPELINE_STEPS.length - 1 && (
                    <ArrowRight size={14} className="text-slate flex-shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Deep-dive Details Card for Selected Pipeline Node */}
          <div className="arch-step-detail-card">
            <div className="step-detail-header">
              <div className="step-tag" style={{ color: currentStep.color }}>
                {currentStep.label}
              </div>
              <span className="text-xs text-slate">Pipeline Stage Active & Synchronized</span>
            </div>
            <p className="step-detail-desc">{currentStep.desc}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
