import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useBridgeStore } from '../../store/useBridgeStore';

export function CollapseEffects() {
  const collapseSimulation = useBridgeStore(state => state.collapseSimulation);
  const debrisRef = useRef();
  const dustRef = useRef();

  const DEBRIS_COUNT = 36;

  // Initial random debris physics attributes
  const debrisData = useMemo(() => {
    return Array.from({ length: DEBRIS_COUNT }, () => ({
      x: (Math.random() - 0.5) * 12,
      y: 7.5 - Math.random() * 2,
      z: 5 + Math.random() * 20, // Span 3 range
      vx: (Math.random() - 0.5) * 4,
      vy: -1 - Math.random() * 8,
      vz: (Math.random() - 0.5) * 4,
      rotX: Math.random() * Math.PI,
      rotY: Math.random() * Math.PI,
      scale: 0.4 + Math.random() * 0.8,
    }));
  }, []);

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    if (!collapseSimulation.active || !debrisRef.current) return;

    debrisData.forEach((d, i) => {
      // Apply gravity falling towards water (y = 0)
      d.y += d.vy * delta;
      d.x += d.vx * delta * 0.5;
      d.z += d.vz * delta * 0.5;
      d.rotX += delta * 3;
      d.rotY += delta * 2;

      // Splash reset upon hitting water
      if (d.y < 0.2) {
        d.y = 7.5;
        d.x = (Math.random() - 0.5) * 12;
        d.z = 5 + Math.random() * 20;
      }

      dummy.position.set(d.x, d.y, d.z);
      dummy.rotation.set(d.rotX, d.rotY, 0);
      dummy.scale.set(d.scale, d.scale, d.scale);
      dummy.updateMatrix();
      debrisRef.current.setMatrixAt(i, dummy.matrix);
    });

    debrisRef.current.instanceMatrix.needsUpdate = true;
  });

  if (!collapseSimulation.active) return null;

  return (
    <group>
      {/* Falling Concrete Fragment Debris */}
      <instancedMesh ref={debrisRef} args={[null, null, DEBRIS_COUNT]} castShadow>
        <boxGeometry args={[0.8, 0.6, 0.9]} />
        <meshStandardMaterial color="#475569" roughness={0.9} metalness={0.2} />
      </instancedMesh>

      {/* Emergency Red Flashing Strobe Lights on Towers and Span 3 */}
      <pointLight position={[0, 12, 14]} color="#ef4444" intensity={8} distance={60} />
      <pointLight position={[-6, 8, 14]} color="#ef4444" intensity={5} distance={30} />
      <pointLight position={[6, 8, 14]} color="#ef4444" intensity={5} distance={30} />

      {/* Snapped Cable Stubs Dangling */}
      {[-4, 4].map((xPos, idx) => (
        <group key={`snapped-${idx}`} position={[xPos, 20, 28]}>
          <mesh rotation={[0.4, 0, xPos > 0 ? 0.3 : -0.3]}>
            <cylinderGeometry args={[0.06, 0.06, 8, 6]} />
            <meshStandardMaterial color="#f87171" metalness={0.8} />
          </mesh>
        </group>
      ))}

      {/* Water Splash Impact Foam Rings */}
      <mesh position={[0, 0.1, 14]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[4, 9, 32]} />
        <meshBasicMaterial color="#fca5a5" transparent opacity={0.6} />
      </mesh>
    </group>
  );
}
