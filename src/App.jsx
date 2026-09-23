import React from 'react';
import { BridgeScene } from './components/3d/BridgeScene';
import { Dashboard } from './components/ui/Dashboard';

export function App() {
  return (
    <div className="digital-twin-app">
      {/* 3D WebGL Canvas Layer */}
      <BridgeScene />

      {/* 2D Interactive HUD Telemetry Dashboard Layer */}
      <Dashboard />
    </div>
  );
}

export default App;
