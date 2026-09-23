import React, { useState } from 'react';
import { 
  ListOrdered, 
  Filter, 
  Terminal, 
  AlertTriangle, 
  CheckCircle, 
  Wrench, 
  Settings 
} from 'lucide-react';
import { useBridgeStore } from '../../store/useBridgeStore';

export function EventAuditTrail() {
  const [filterType, setFilterType] = useState('ALL');
  const eventLog = useBridgeStore(state => state.eventLog);

  const filteredLogs = eventLog.filter(log => {
    if (filterType === 'ALL') return true;
    if (filterType === 'ALERTS') return log.type === 'ALERT' || log.type === 'CRITICAL' || log.type === 'WARNING';
    if (filterType === 'MAINT') return log.type === 'MAINTENANCE' || log.type === 'RESOLVE' || log.type === 'ACTION';
    if (filterType === 'SYS') return log.type === 'CONFIG' || log.type === 'INFO' || log.type === 'SCENARIO';
    return true;
  });

  const getBadgeClass = (type) => {
    switch (type) {
      case 'CRITICAL':
      case 'ALERT':
        return 'badge-critical';
      case 'WARNING':
      case 'ENV':
        return 'badge-warning';
      case 'RESOLVE':
      case 'ACTION':
        return 'badge-success';
      case 'MAINTENANCE':
        return 'badge-info';
      default:
        return 'badge-neutral';
    }
  };

  return (
    <div className="panel-box event-log-panel">
      <div className="panel-title-bar">
        <div className="panel-title">
          <Terminal size={15} className="text-cyan" />
          <span>SYSTEM EVENT AUDIT LOG</span>
        </div>
        <div className="log-filter-chips">
          {['ALL', 'ALERTS', 'MAINT', 'SYS'].map(ft => (
            <button
              key={ft}
              className={`filter-chip ${filterType === ft ? 'active' : ''}`}
              onClick={() => setFilterType(ft)}
            >
              {ft}
            </button>
          ))}
        </div>
      </div>

      <div className="event-log-stream">
        {filteredLogs.map(log => (
          <div key={log.id} className="event-log-row">
            <span className="log-time">{log.time}</span>
            <span className={`log-badge ${getBadgeClass(log.type)}`}>
              {log.type}
            </span>
            <span className="log-msg">{log.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
