import React from 'react';
import { 
  Sparkles, 
  ChevronRight, 
  Square, 
  Play, 
  Activity, 
  CheckCircle2, 
  ShieldAlert, 
  Wrench 
} from 'lucide-react';
import { useBridgeStore } from '../../store/useBridgeStore';

const DEMO_STEPS_NARRATIVE = [
  { step: 1, title: 'BASELINE ASSET DIGITAL TWIN', desc: 'Initialize physical cable-stayed bridge digital twin in nominal condition. All 14 multi-modal sensor channels streaming.' },
  { step: 2, title: 'TELEMETRY SENSOR NETWORK', desc: 'Isolating technical sensor beacons (Strain Gauges, Accelerometers, LVDT, Thermocouples, Anemometer, WIM).' },
  { step: 3, title: 'FIBER BRAGG GRATING INSPECTION', desc: 'Deep-dive camera focus onto Span 3 critical strain node S03. Live waveform at baseline 360 µε.' },
  { step: 4, title: 'DYNAMIC TRAFFIC FLUX', desc: 'Introducing vehicular traffic flow across 4 lanes (sedans, SUVs, delivery vans).' },
  { step: 5, title: 'HEAVY AXLE LOAD INJECTION', desc: 'Elevating traffic density to HIGH with heavy freight vehicles. Live bending moments increase strain to 550 µε.' },
  { step: 6, title: 'AERODYNAMIC CROSSWIND EXCITATION', desc: 'Simulating 85 km/h crosswind turbulence. Switching to Vibration Mode to visualize modal harmonic oscillation.' },
  { step: 7, title: 'OVERWEIGHT CONVOY ANOMALY', desc: 'Overloaded 90-ton freight trucks transit Span 3. Concentrated load pushes strain over demo safety threshold.' },
  { step: 8, title: 'CRITICAL ANOMALY & HEATMAP SHIFT', desc: 'Span 3 exceeds 780 µε and turns CRIMSON RED. AI anomaly detector automatically triggers critical alerts.' },
  { step: 9, title: 'ENGINEER LIVE TELEMETRY INSPECTION', desc: 'Shift engineer inspects live sparkline waveform. Rapid strain accumulation verified.' },
  { step: 10, title: 'INCIDENT ACKNOWLEDGEMENT', desc: 'Shift engineer acknowledges critical alert in the Triage Center. Risk score reaches 85%.' },
  { step: 11, title: 'MAINTENANCE WORK ORDER DISPATCH', desc: 'Civil engineering crew dispatched. Automated structural stabilization protocol queued.' },
  { step: 12, title: 'SIMULATED MAINTENANCE & TENSIONING', desc: 'Hydraulic jacking and cable tension re-calibration in progress. Deck strain relieved.' },
  { step: 13, title: 'STRUCTURAL RECOVERY & RESOLUTION', desc: 'Span 3 stress returns to baseline (20%). Alert auto-resolves and bridge mesh turns back to GREEN.' },
  { step: 14, title: 'CLOSED-LOOP MONITORING COMPLETE', desc: 'Demonstrated complete industrial loop: Sense → Stream → Visualize → Analyze → Alert → Maintain.' },
];

export function AutoDemoTourModal() {
  const autoDemo = useBridgeStore(state => state.autoDemo);
  const stopAutoDemo = useBridgeStore(state => state.stopAutoDemo);
  const executeDemoStep = useBridgeStore(state => state.executeDemoStep);

  if (!autoDemo.active) return null;

  const currentInfo = DEMO_STEPS_NARRATIVE[autoDemo.currentStep - 1] || DEMO_STEPS_NARRATIVE[0];
  const progressPct = (autoDemo.currentStep / autoDemo.totalSteps) * 100;

  return (
    <div className="auto-demo-tour-banner">
      <div className="demo-tour-header">
        <div className="demo-tour-title-wrap">
          <Sparkles size={16} className="text-cyan animate-pulse" />
          <span className="demo-tour-title">INDUSTRIAL DEMONSTRATOR TOUR</span>
          <span className="demo-step-badge">STEP {autoDemo.currentStep} / {autoDemo.totalSteps}</span>
        </div>
        <button className="demo-stop-btn" onClick={stopAutoDemo} title="Exit Demo Tour">
          <Square size={12} fill="#ef4444" color="#ef4444" />
          <span>Exit Tour</span>
        </button>
      </div>

      <div className="demo-tour-progress-bar">
        <div className="demo-tour-fill" style={{ width: `${progressPct}%` }} />
      </div>

      <div className="demo-tour-body">
        <div className="demo-step-heading">{currentInfo.title}</div>
        <div className="demo-step-desc">{currentInfo.desc}</div>
      </div>

      <div className="demo-tour-footer">
        <span className="demo-auto-hint">Auto-advancing every 4.5s...</span>
        {autoDemo.currentStep < 14 && (
          <button 
            className="demo-next-step-btn"
            onClick={() => executeDemoStep(autoDemo.currentStep + 1)}
          >
            <span>Next Step</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
