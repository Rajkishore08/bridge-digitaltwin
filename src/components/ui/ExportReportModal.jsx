import React, { useState } from 'react';
import { 
  Download, 
  X, 
  FileText, 
  FileSpreadsheet, 
  CheckCircle2, 
  ShieldCheck 
} from 'lucide-react';
import { useBridgeStore } from '../../store/useBridgeStore';

export function ExportReportModal() {
  const activeModal = useBridgeStore(state => state.activeModal);
  const setActiveModal = useBridgeStore(state => state.setActiveModal);
  const sensors = useBridgeStore(state => state.sensors);
  const overallHealthIndex = useBridgeStore(state => state.overallHealthIndex);
  const structuralRiskScore = useBridgeStore(state => state.structuralRiskScore);
  const alerts = useBridgeStore(state => state.alerts);
  const trafficLevel = useBridgeStore(state => state.trafficLevel);
  const windSpeed = useBridgeStore(state => state.windSpeed);
  const temperature = useBridgeStore(state => state.temperature);

  const [downloaded, setDownloaded] = useState(false);

  if (activeModal !== 'EXPORT_REPORT') return null;

  const handleExportJSON = () => {
    const report = {
      reportType: "STRUCTURAL_HEALTH_MONITORING_DEMO_REPORT",
      timestamp: new Date().toISOString(),
      disclaimer: "SIMULATED DATA FOR EDUCATIONAL / DIGITAL TWIN PROTOTYPING ONLY. NON-SAFETY CRITICAL.",
      asset: {
        name: "Smart Cable-Stayed Bridge Digital Twin",
        structuralHealthIndex: `${overallHealthIndex}%`,
        riskScore: `${structuralRiskScore}%`,
        activeAlertsCount: alerts.filter(a => !a.resolved).length,
      },
      environmentalParameters: {
        trafficFlux: trafficLevel,
        windVelocityKmH: windSpeed,
        ambientTemperatureC: temperature,
      },
      sensorsTelemetry: sensors.map(s => ({
        id: s.id,
        code: s.code,
        name: s.name,
        type: s.type,
        location: s.location,
        currentValue: s.currentValue,
        unit: s.unit,
        status: s.status,
        warningThreshold: s.thresholds.warning,
        criticalThreshold: s.thresholds.critical,
      })),
      activeIncidents: alerts.filter(a => !a.resolved),
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bridge-shm-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  const handleExportCSV = () => {
    const headers = "Sensor_ID,Sensor_Code,Name,Location,Type,Current_Value,Unit,Status,Warning_Limit,Critical_Limit\n";
    const rows = sensors.map(s => 
      `"${s.id}","${s.code}","${s.name}","${s.location}","${s.type}",${s.currentValue},"${s.unit}","${s.status}",${s.thresholds.warning},${s.thresholds.critical}`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bridge-telemetry-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
  };

  return (
    <div className="modal-backdrop-generic" onClick={() => setActiveModal(null)}>
      <div className="modal-card-generic export-modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-header-generic">
          <div className="modal-title-generic">
            <Download size={18} className="text-cyan" />
            <span>EXPORT TELEMETRY & STRUCTURAL INSPECTION REPORT</span>
          </div>
          <button className="inspector-close-btn" onClick={() => setActiveModal(null)}>
            <X size={16} />
          </button>
        </div>

        <div className="export-modal-body">
          <p className="text-xs text-slate-light leading-relaxed mb-4">
            Generate an automated civil structural assessment report containing real-time telemetry from all 14 multi-modal sensor channels, environmental inputs, active alert logs, and structural risk scores.
          </p>

          <div className="export-options-grid">
            <div className="export-card" onClick={handleExportJSON}>
              <FileText size={28} className="text-cyan mb-2" />
              <div className="export-card-title">JSON Full Inspection Packet</div>
              <div className="export-card-desc">Complete structured dataset with metadata, alert objects, and physics correlation state.</div>
              <button className="export-action-btn">
                <Download size={13} /> Download JSON
              </button>
            </div>

            <div className="export-card" onClick={handleExportCSV}>
              <FileSpreadsheet size={28} className="text-emerald mb-2" />
              <div className="export-card-title">CSV Telemetry Table</div>
              <div className="export-card-desc">Tabular telemetry rows ready for Excel, MATLAB, Pandas, or analytical processing.</div>
              <button className="export-action-btn csv-btn">
                <Download size={13} /> Download CSV
              </button>
            </div>
          </div>

          {downloaded && (
            <div className="download-success-banner">
              <CheckCircle2 size={15} className="text-emerald" />
              <span>Inspection report successfully generated and saved to your device.</span>
            </div>
          )}

          <div className="demo-disclaimer-badge mt-4">
            <ShieldCheck size={13} className="text-amber flex-shrink-0" />
            <span>Simulated demonstration data for SHM digital-twin prototyping.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
