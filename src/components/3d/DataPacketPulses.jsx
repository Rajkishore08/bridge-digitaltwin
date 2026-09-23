import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useBridgeStore } from '../../store/useBridgeStore';

export function DataPacketPulses() {
  const sensors = useBridgeStore(state => state.sensors);
  const viewMode = useBridgeStore(state => state.viewMode);
  const particlesRef = useRef();

  // IoT Gateway locations on Tower 1 and Tower 2 crossbeams
  const gatewayPos1 = new THREE.Vector3(0, 22, -28);
  const gatewayPos2 = new THREE.Vector3(0, 22, 28);

  // Generate paths from each sensor to the nearest IoT Gateway
  const pulsePaths = useMemo(() => {
    return sensors.map((sensor, idx) => {
      const sensorPos = new THREE.Vector3(...sensor.position);
      const targetGateway = sensorPos.z < 0 ? gatewayPos1 : gatewayPos2;

      // Create a quadratic bezier arc path floating through air
      const midPoint = new THREE.Vector3()
        .addVectors(sensorPos, targetGateway)
        .multiplyScalar(0.5);
      midPoint.y += 4.5; // elevate arc

      const curve = new THREE.QuadraticBezierCurve3(sensorPos, midPoint, targetGateway);
      return {
        curve,
        speed: 0.6 + (idx % 4) * 0.2,
        offset: (idx * 0.15) % 1.0,
        color: sensor.status === 'critical' ? '#ef4444' : sensor.status === 'warning' ? '#f59e0b' : '#06b6d4',
      };
    });
  }, [sensors]);

  // Mesh instances for data packet photons
  const packetCount = pulsePaths.length;
  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state) => {
    if (!particlesRef.current) return;
    const time = state.clock.elapsedTime;

    pulsePaths.forEach((path, i) => {
      const t = (time * path.speed + path.offset) % 1.0;
      const pos = path.curve.getPoint(t);
      dummy.position.copy(pos);
      const scale = 0.35 + 0.15 * Math.sin(time * 6 + i);
      dummy.scale.set(scale, scale, scale);
      dummy.updateMatrix();
      particlesRef.current.setMatrixAt(i, dummy.matrix);
    });

    particlesRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <group>
      {/* Instanced Glowing Data Packet Photons */}
      <instancedMesh ref={particlesRef} args={[null, null, packetCount]}>
        <sphereGeometry args={[0.3, 12, 12]} />
        <meshBasicMaterial color="#38bdf8" />
      </instancedMesh>

      {/* IoT Gateway 1 Hardware Beacon (Tower 1) */}
      <group position={[0, 22, -28]}>
        <mesh>
          <boxGeometry args={[1.4, 1.4, 1.4]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Gateway Antenna */}
        <mesh position={[0, 1.4, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.4, 8]} />
          <meshBasicMaterial color="#06b6d4" />
        </mesh>
        <mesh position={[0, 2.1, 0]}>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
        <pointLight position={[0, 2.1, 0]} color="#06b6d4" intensity={1.5} distance={10} />
      </group>

      {/* IoT Gateway 2 Hardware Beacon (Tower 2) */}
      <group position={[0, 22, 28]}>
        <mesh>
          <boxGeometry args={[1.4, 1.4, 1.4]} />
          <meshStandardMaterial color="#0f172a" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[0, 1.4, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.4, 8]} />
          <meshBasicMaterial color="#06b6d4" />
        </mesh>
        <mesh position={[0, 2.1, 0]}>
          <sphereGeometry args={[0.18, 12, 12]} />
          <meshBasicMaterial color="#10b981" />
        </mesh>
        <pointLight position={[0, 2.1, 0]} color="#06b6d4" intensity={1.5} distance={10} />
      </group>
    </group>
  );
}
