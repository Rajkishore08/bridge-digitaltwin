import React, { useState } from 'react';
import { 
  Table, 
  X, 
  Search, 
  Download, 
  Eye, 
  TrendingUp, 
  TrendingDown, 
  Filter 
} from 'lucide-react';
import { useBridgeStore } from '../../store/useBridgeStore';

export function SensorTableModal() {
  const activeModal = useBridgeStore(state => state.activeModal);
  const setActiveModal = useBridgeStore(state => state.setActiveModal);
  const sensors = useBridgeStore(state => state.sensors);
  const selectSensor = useBridgeStore(state => state.selectSensor);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  if (activeModal !== 'SENSOR_TABLE') return null;

  const filteredSensors = sensors.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          s.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === 'ALL' || s.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleInspectRow = (sensorId) => {
    selectSensor(sensorId);
    setActiveModal(null);
  };

  return (
    <div className="modal-backdrop-generic" onClick={() => setActiveModal(null)}>
      <div className="modal-card-generic table-modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header-generic">
          <div className="modal-title-generic">
            <Table size={18} className="text-cyan" />
            <span>SENSOR TELEMETRY MATRIX (14 CHANNELS)</span>
          </div>
          <button className="inspector-close-btn" onClick={() => setActiveModal(null)}>
            <X size={16} />
          </button>
        </div>

        <div className="table-modal-toolbar">
          <div className="table-search-box">
            <Search size={14} className="text-slate" />
            <input
              type="text"
              placeholder="Search sensor code, name, location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="table-search-input"
            />
          </div>

          <div className="table-filter-tabs">
            {['ALL', 'STRAIN', 'ACCEL', 'DISP', 'TEMP', 'WIND', 'LOAD'].map(type => (
              <button
                key={type}
                className={`table-filter-btn ${filterType === type ? 'active' : ''}`}
                onClick={() => setFilterType(type)}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <div className="table-wrapper">
          <table className="sensor-data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>CODE</th>
                <th>SENSOR NAME & LOCATION</th>
                <th>TYPE</th>
                <th>LIVE VALUE</th>
                <th>WARNING THRESHOLD</th>
                <th>CRITICAL THRESHOLD</th>
                <th>STATUS</th>
                <th>TREND</th>
                <th>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredSensors.map(sensor => {
                const isCrit = sensor.status === 'critical';
                const isWarn = sensor.status === 'warning' || sensor.status === 'elevated';
                return (
                  <tr key={sensor.id} className={isCrit ? 'row-critical' : isWarn ? 'row-warning' : ''}>
                    <td className="font-mono text-cyan font-bold">{sensor.id}</td>
                    <td className="font-mono text-slate-light">{sensor.code}</td>
                    <td>
                      <div className="font-semibold text-white">{sensor.name}</div>
                      <div className="text-xs text-slate">{sensor.location}</div>
                    </td>
                    <td><span className="type-pill">{sensor.type}</span></td>
                    <td className="font-mono text-base font-bold">
                      <span className={isCrit ? 'text-crimson' : isWarn ? 'text-amber' : 'text-cyan'}>
                        {sensor.currentValue} {sensor.unit}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-amber">{sensor.thresholds.warning} {sensor.unit}</td>
                    <td className="font-mono text-xs text-crimson">{sensor.thresholds.critical} {sensor.unit}</td>
                    <td>
                      <span className={`status-pill ${sensor.status}`}>
                        {sensor.status.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {sensor.trend === 'increasing' ? (
                        <span className="text-amber flex items-center gap-1 font-mono text-xs"><TrendingUp size={12} /> UP</span>
                      ) : sensor.trend === 'decreasing' ? (
                        <span className="text-emerald flex items-center gap-1 font-mono text-xs"><TrendingDown size={12} /> DN</span>
                      ) : (
                        <span className="text-slate font-mono text-xs">STABLE</span>
                      )}
                    </td>
                    <td>
                      <button 
                        className="table-action-btn"
                        onClick={() => handleInspectRow(sensor.id)}
                        title="Focus 3D View on Sensor"
                      >
                        <Eye size={12} /> Focus
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
