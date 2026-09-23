import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { useBridgeStore } from '../../store/useBridgeStore';

const STATUS_COLOR_MAP = {
  normal: '#10b981',    // green
  warning: '#f59e0b',   // yellow
  elevated: '#f97316',  // orange
  critical: '#ef4444',  // red
};

function SingleSensorMarker({ sensor }) {
  const meshRef = useRef();
  const ringRef = useRef();

  const selectedSensorId = useBridgeStore(state => state.selectedSensorId);
  const hoveredSensorId = useBridgeStore(state => state.hoveredSensorId);
  const selectSensor = useBridgeStore(state => state.selectSensor);
  const setHoveredSensor = useBridgeStore(state => state.setHoveredSensor);
  const viewMode = useBridgeStore(state => state.viewMode);

  const isSelected = selectedSensorId === sensor.id;
  const isHovered = hoveredSensorId === sensor.id;
  const statusColor = STATUS_COLOR_MAP[sensor.status] || '#10b981';
  const isCritical = sensor.status === 'critical';
  const isWarning = sensor.status === 'warning' || sensor.status === 'elevated';

  // Subtle continuous rotation and pulse animation
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 1.5;
    }
    if (ringRef.current) {
      const pulseSpeed = isCritical ? 6 : isWarning ? 3.5 : 1.8;
      const scale = 1 + 0.3 * Math.sin(state.clock.elapsedTime * pulseSpeed);
      ringRef.current.scale.set(scale, scale, scale);
    }
  });

  const markerScale = viewMode === 'SENSOR' ? 1.4 : 1.0;

  return (
    <group 
      position={sensor.position}
      scale={markerScale}
      onClick={(e) => {
        e.stopPropagation();
        selectSensor(sensor.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHoveredSensor(sensor.id);
      }}
      onPointerOut={() => setHoveredSensor(null)}
    >
      {/* Central Diamond/Octahedron Sensor Core */}
      <mesh ref={meshRef}>
        <octahedronGeometry args={[0.55, 0]} />
        <meshStandardMaterial
          color={statusColor}
          emissive={statusColor}
          emissiveIntensity={isCritical ? 1.6 : isSelected ? 1.2 : 0.8}
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Pulsing Outer Status Ring */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.65, 0.8, 24]} />
        <meshBasicMaterial
          color={statusColor}
          side={2}
          transparent
          opacity={isCritical ? 0.9 : 0.6}
        />
      </mesh>

      {/* Point Light for local atmospheric illumination */}
      <pointLight
        color={statusColor}
        intensity={isCritical ? 3.0 : isSelected ? 2.0 : 0.8}
        distance={4.5}
      />

      {/* HTML Hover HUD Badge */}
      {(isHovered || isSelected || isCritical || viewMode === 'SENSOR') && (
        <Html
          position={[0, 1.2, 0]}
          center
          distanceFactor={35}
          style={{
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          <div className={`sensor-hud-badge ${sensor.status} ${isSelected ? 'selected' : ''}`}>
            <div className="badge-header">
              <span className="badge-code">{sensor.code}</span>
              <span className="badge-status">{sensor.status.toUpperCase()}</span>
            </div>
            <div className="badge-value">
              {sensor.currentValue} <span className="badge-unit">{sensor.unit}</span>
            </div>
            <div className="badge-location">{sensor.location}</div>
          </div>
        </Html>
      )}
    </group>
  );
}

export function SensorMarkers() {
  const sensors = useBridgeStore(state => state.sensors);

  return (
    <group>
      {sensors.map(sensor => (
        <SingleSensorMarker key={sensor.id} sensor={sensor} />
      ))}
    </group>
  );
}
