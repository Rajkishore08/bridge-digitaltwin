import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useBridgeStore } from '../../store/useBridgeStore';
import * as THREE from 'three';

export function VibrationVisualizer() {
  const viewMode = useBridgeStore(state => state.viewMode);
  const windSpeed = useBridgeStore(state => state.windSpeed);
  const trafficLevel = useBridgeStore(state => state.trafficLevel);
  const lineRef = useRef();

  useFrame((state) => {
    if (!lineRef.current) return;
    const time = state.clock.elapsedTime * (3 + windSpeed * 0.05);
    const amp = viewMode === 'VIBRATION' ? 1.4 : 0.2;

    const positions = lineRef.current.geometry.attributes.position.array;
    for (let i = 0; i <= 60; i++) {
      const z = -75 + (i * 2.5);
      // Dual harmonic mode: primary flexural wave + localized Span 3 resonant flutter
      const primaryWave = Math.sin(time + (z * 0.08)) * amp;
      const span3Flutter = (z > 0 && z < 28) ? Math.cos(time * 2.5) * amp * 0.8 : 0;
      
      positions[i * 3 + 1] = 7.5 + primaryWave + span3Flutter;
    }
    lineRef.current.geometry.attributes.position.needsUpdate = true;
  });

  if (viewMode !== 'VIBRATION' && windSpeed < 70) return null;

  const points = [];
  for (let i = 0; i <= 60; i++) {
    const z = -75 + (i * 2.5);
    points.push(new THREE.Vector3(0, 7.5, z));
  }
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <group>
      <line ref={lineRef} geometry={lineGeometry}>
        <lineBasicMaterial color="#38bdf8" linewidth={3} transparent opacity={0.8} />
      </line>

      {/* Vibration Mode Resonance Vectors */}
      {viewMode === 'VIBRATION' && (
        <group position={[0, 9.5, 14]}>
          <mesh>
            <coneGeometry args={[0.6, 1.4, 16]} />
            <meshBasicMaterial color="#f43f5e" />
          </mesh>
        </group>
      )}
    </group>
  );
}
