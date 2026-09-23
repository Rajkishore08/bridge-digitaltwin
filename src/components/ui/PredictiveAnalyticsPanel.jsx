import React from 'react';
import { 
  TrendingUp, 
  BrainCircuit, 
  Sparkles, 
  AlertCircle,
  HelpCircle
} from 'lucide-react';
import { useBridgeStore } from '../../store/useBridgeStore';

export function PredictiveAnalyticsPanel() {
  const structuralRiskScore = useBridgeStore(state => state.structuralRiskScore);
  const trafficLevel = useBridgeStore(state => state.trafficLevel);
  const vehicleWeight = useBridgeStore(state => state.vehicleWeight);

  // Generate dynamic 30-day forecast points based on current loading
  const baseRisk = structuralRiskScore || 20;
  const growthRate = (trafficLevel === 'EXTREME' ? 1.8 : trafficLevel === 'HIGH' ? 1.2 : 0.4) * vehicleWeight;

  const points = [
    { day: 'Day -10', val: Math.max(10, baseRisk - 15) },
    { day: 'Day -5', val: Math.max(12, baseRisk - 8) },
    { day: 'Today', val: baseRisk },
    { day: 'Day +7', val: Math.min(100, Math.round(baseRisk + growthRate * 6)) },
    { day: 'Day +14', val: Math.min(100, Math.round(baseRisk + growthRate * 12)) },
    { day: 'Day +21', val: Math.min(100, Math.round(baseRisk + growthRate * 18)) },
    { day: 'Day +30', val: Math.min(100, Math.round(baseRisk + growthRate * 25)) },
  ];

  const width = 360;
  const height = 95;
  const minVal = 0;
  const maxVal = 100;

  const getX = (idx) => 25 + (idx / (points.length - 1)) * (width - 45);
  const getY = (val) => height - 20 - ((val - minVal) / (maxVal - minVal)) * (height - 35);

  // Past line (index 0 to 2)
  const pastPointsStr = points.slice(0, 3).map((p, i) => `${getX(i)},${getY(p.val)}`).join(' ');
  // Forecast line (index 2 to 6)
  const forecastPointsStr = points.slice(2).map((p, i) => `${getX(i + 2)},${getY(p.val)}`).join(' ');

  const thresholdY = getY(75); // 75% Demo threshold

  return (
    <div className="panel-box predictive-panel">
      <div className="panel-title-bar">
        <div className="panel-title">
          <BrainCircuit size={15} className="text-cyan" />
          <span>SIMULATED PREDICTIVE STRESS ANALYTICS</span>
        </div>
        <span className="demo-tag">SIMULATED AI</span>
      </div>

      <div className="predictive-content">
        <div className="predictive-chart-wrap">
          <svg className="predictive-svg" width="100%" height={height} viewBox={`0 0 ${width} ${height}`}>
            {/* Background Grid */}
            <line x1="25" y1={getY(25)} x2={width - 20} y2={getY(25)} stroke="#1e293b" strokeDasharray="2,2" />
            <line x1="25" y1={getY(50)} x2={width - 20} y2={getY(50)} stroke="#1e293b" strokeDasharray="2,2" />
            <line x1="25" y1={getY(75)} x2={width - 20} y2={getY(75)} stroke="#1e293b" strokeDasharray="2,2" />

            {/* Demo Safety Threshold Line */}
            <line x1="25" y1={thresholdY} x2={width - 20} y2={thresholdY} stroke="#ef4444" strokeWidth="1.2" strokeDasharray="4,4" />
            <text x={width - 18} y={thresholdY + 3} fill="#ef4444" fontSize="8" textAnchor="end">75% Critical Limit</text>

            {/* Past Solid Line */}
            <polyline fill="none" stroke="#06b6d4" strokeWidth="2.2" points={pastPointsStr} />

            {/* Forecast Dashed Line */}
            <polyline 
              fill="none" 
              stroke={baseRisk > 60 ? '#f97316' : '#38bdf8'} 
              strokeWidth="2.2" 
              strokeDasharray="5,3" 
              points={forecastPointsStr} 
            />

            {/* Data Dots */}
            {points.map((p, idx) => (
              <g key={idx}>
                <circle
                  cx={getX(idx)}
                  cy={getY(p.val)}
                  r={idx === 2 ? 4 : 2.5}
                  fill={idx === 2 ? '#38bdf8' : idx > 2 ? '#f97316' : '#06b6d4'}
                  stroke="#020b14"
                  strokeWidth="1"
                />
                <text x={getX(idx)} y={height - 5} fill="#64748b" fontSize="7.5" textAnchor="middle">
                  {p.day}
                </text>
              </g>
            ))}
          </svg>
        </div>

        <div className="predictive-meta-row">
          <div className="pred-legend">
            <span className="legend-chip"><span className="chip-line solid" /> Current Trend</span>
            <span className="legend-chip"><span className="chip-line dashed" /> 30-Day AI Projection</span>
          </div>
          <div className="pred-time-to-crit">
            Est. Maintenance Horizon: <strong>{baseRisk > 70 ? 'IMMEDIATE' : baseRisk > 45 ? '18 Days' : '> 180 Days'}</strong>
          </div>
        </div>

        <div className="disclaimer-note">
          * Simulated predictive degradation based on dynamic load accumulation. For demonstration only.
        </div>
      </div>
    </div>
  );
}
