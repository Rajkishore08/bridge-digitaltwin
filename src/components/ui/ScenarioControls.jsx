import React from 'react';
import { 
  Sliders, 
  Truck, 
  Wind, 
  Thermometer, 
  Weight, 
  Info,
  Zap
} from 'lucide-react';
import { useBridgeStore } from '../../store/useBridgeStore';

export function ScenarioControls() {
  const trafficLevel = useBridgeStore(state => state.trafficLevel);
  const setTrafficLevel = useBridgeStore(state => state.setTrafficLevel);
  const vehicleWeight = useBridgeStore(state => state.vehicleWeight);
  const setVehicleWeight = useBridgeStore(state => state.setVehicleWeight);
  const windSpeed = useBridgeStore(state => state.windSpeed);
  const setWindSpeed = useBridgeStore(state => state.setWindSpeed);
  const temperature = useBridgeStore(state => state.temperature);
  const setTemperature = useBridgeStore(state => state.setTemperature);

  return (
    <div className="panel-box scenario-controls-panel">
      <div className="panel-title-bar">
        <div className="panel-title">
          <Sliders size={15} className="text-cyan" />
          <span>WHAT-IF SIMULATION & LOAD PARAMETERS</span>
        </div>
        <span className="demo-tag">DEMO CONTROLS</span>
      </div>

      <div className="sliders-grid">
        {/* 1. Traffic Density Selector */}
        <div className="control-group">
          <div className="control-label-row">
            <span className="control-label">
              <Truck size={13} className="text-indigo" /> Traffic Density
            </span>
            <span className="control-badge">{trafficLevel}</span>
          </div>
          <div className="traffic-button-group">
            {['LOW', 'MEDIUM', 'HIGH', 'EXTREME'].map(lvl => (
              <button
                key={lvl}
                className={`traffic-btn ${trafficLevel === lvl ? 'active' : ''} ${lvl === 'EXTREME' ? 'extreme' : ''}`}
                onClick={() => setTrafficLevel(lvl)}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* 2. Vehicle Axle Load Weight */}
        <div className="control-group">
          <div className="control-label-row">
            <span className="control-label">
              <Weight size={13} className="text-cyan" /> Gross Axle Weight Factor
            </span>
            <span className="control-val">{vehicleWeight.toFixed(1)}x nominal ({Math.round(vehicleWeight * 40)}t)</span>
          </div>
          <input
            type="range"
            min="1.0"
            max="2.5"
            step="0.1"
            value={vehicleWeight}
            onChange={(e) => setVehicleWeight(parseFloat(e.target.value))}
            className="slider-range range-cyan"
          />
          <div className="slider-ticks">
            <span>1.0x (Standard 40t)</span>
            <span>1.8x (Heavy 72t)</span>
            <span className="text-crimson">2.5x (Overloaded 100t)</span>
          </div>
        </div>

        {/* 3. Wind Velocity Slider */}
        <div className="control-group">
          <div className="control-label-row">
            <span className="control-label">
              <Wind size={13} className="text-emerald" /> Crosswind Velocity
            </span>
            <span className="control-val">{windSpeed} km/h</span>
          </div>
          <input
            type="range"
            min="0"
            max="130"
            step="2"
            value={windSpeed}
            onChange={(e) => setWindSpeed(parseInt(e.target.value))}
            className="slider-range range-emerald"
          />
          <div className="slider-ticks">
            <span>0 km/h (Calm)</span>
            <span>60 km/h (Gale)</span>
            <span className="text-crimson">130 km/h (Storm)</span>
          </div>
        </div>

        {/* 4. Ambient Temperature Slider */}
        <div className="control-group">
          <div className="control-label-row">
            <span className="control-label">
              <Thermometer size={13} className="text-amber" /> Ambient Deck Temp
            </span>
            <span className="control-val">{temperature}°C</span>
          </div>
          <input
            type="range"
            min="-10"
            max="55"
            step="1"
            value={temperature}
            onChange={(e) => setTemperature(parseInt(e.target.value))}
            className="slider-range range-amber"
          />
          <div className="slider-ticks">
            <span>-10°C (Ice)</span>
            <span>20°C (Nominal)</span>
            <span className="text-amber">55°C (Extreme Heat)</span>
          </div>
        </div>
      </div>

      {/* Real-time Physics Correlation Banner */}
      <div className="correlation-info-box">
        <Zap size={14} className="text-cyan flex-shrink-0" />
        <div className="correlation-text">
          <strong>Physics Coupling Active:</strong> Higher traffic volume & vehicle axle weights induce dynamic bending moments in Span 3, accelerating microstrain (µε) and triggering adaptive visual stress heatmaps.
        </div>
      </div>
    </div>
  );
}
