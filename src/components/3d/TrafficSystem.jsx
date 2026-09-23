import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useBridgeStore } from '../../store/useBridgeStore';
import { BRIDGE_DIMENSIONS } from '../../data/bridgeConfig';

const VEHICLE_TYPES = [
  { type: 'sedan', length: 3.2, width: 1.4, height: 1.0, color: '#38bdf8', weight: 'standard', mass: 1.8 },
  { type: 'suv', length: 3.8, width: 1.6, height: 1.3, color: '#e2e8f0', weight: 'standard', mass: 2.4 },
  { type: 'van', length: 4.6, width: 1.7, height: 1.8, color: '#f59e0b', weight: 'heavy', mass: 4.5 },
  { type: 'bus', length: 8.5, width: 2.1, height: 2.6, color: '#10b981', weight: 'heavy', mass: 14.0 },
  { type: 'truck', length: 9.4, width: 2.2, height: 2.8, color: '#ef4444', weight: 'overweight', mass: 38.0 },
];

const LANES = [
  { id: 'S1', x: -4.8, direction: 1 },  // Southbound Lane 1
  { id: 'S2', x: -1.8, direction: 1 },  // Southbound Lane 2
  { id: 'N1', x: 1.8, direction: -1 },  // Northbound Lane 1
  { id: 'N2', x: 4.8, direction: -1 },  // Northbound Lane 2
];

function VehicleMesh({ vehicle, lane, speed, startOffset }) {
  const meshRef = useRef();
  const progressRef = useRef(startOffset);
  const collapseSimulation = useBridgeStore(state => state.collapseSimulation);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Freeze vehicle movement if bridge is collapsing
    const effectiveSpeed = collapseSimulation.active ? 0 : speed;
    progressRef.current += delta * effectiveSpeed * lane.direction * 12;

    if (lane.direction === 1 && progressRef.current > 85) {
      progressRef.current = -85;
    } else if (lane.direction === -1 && progressRef.current < -85) {
      progressRef.current = 85;
    }

    meshRef.current.position.z = progressRef.current;

    const baseY = BRIDGE_DIMENSIONS.deckElevation + 0.6 + (vehicle.height / 2);

    // Dynamic collapse physics: if vehicle is on Span 3, make it drop into the river
    if (collapseSimulation.active && progressRef.current >= -4 && progressRef.current <= 32) {
      if (collapseSimulation.step === 'COLLAPSED') {
        // Fall all the way down into the river surface (Y = 0.5)
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, 0.5 + (vehicle.height * 0.2), delta * 4);
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0.45, delta * 3);
        meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, (lane.x > 0 ? 0.35 : -0.35), delta * 3);
      } else {
        // Initial sag/cracking
        const sag = collapseSimulation.step === 'SNAPPING' ? 5 : 2;
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, baseY - sag, delta * 3);
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0.15, delta * 3);
      }
    } else {
      // Normal flat deck road level
      meshRef.current.position.y = baseY;
      meshRef.current.rotation.x = 0;
      meshRef.current.rotation.z = 0;
    }
  });

  const isTruck = vehicle.type === 'truck';
  const isBus = vehicle.type === 'bus';

  return (
    <group
      ref={meshRef}
      position={[lane.x, BRIDGE_DIMENSIONS.deckElevation + 0.6 + (vehicle.height / 2), startOffset]}
    >
      {/* Main Chassis */}
      <mesh castShadow>
        <boxGeometry args={[vehicle.width, vehicle.height, vehicle.length]} />
        <meshStandardMaterial
          color={vehicle.color}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Cabin or Windows for Trucks and Buses */}
      {isTruck ? (
        <mesh position={[0, 0.4, lane.direction === 1 ? (vehicle.length / 2 - 1.2) : -(vehicle.length / 2 - 1.2)]}>
          <boxGeometry args={[vehicle.width - 0.1, vehicle.height * 0.9, 2.0]} />
          <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.9} />
        </mesh>
      ) : isBus ? (
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[vehicle.width + 0.02, vehicle.height * 0.45, vehicle.length * 0.9]} />
          <meshStandardMaterial color="#0284c7" roughness={0.1} metalness={0.9} />
        </mesh>
      ) : (
        <mesh position={[0, vehicle.height * 0.45, 0]}>
          <boxGeometry args={[vehicle.width * 0.85, vehicle.height * 0.55, vehicle.length * 0.5]} />
          <meshStandardMaterial color="#0284c7" roughness={0.1} metalness={0.9} />
        </mesh>
      )}

      {/* Headlights (Warm White Glow) */}
      <mesh position={[0, -0.1, lane.direction === 1 ? (vehicle.length / 2 + 0.05) : -(vehicle.length / 2 + 0.05)]}>
        <boxGeometry args={[vehicle.width * 0.7, 0.2, 0.1]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>

      {/* Taillights (Emergency flashing when collapsing) */}
      <mesh position={[0, -0.1, lane.direction === 1 ? -(vehicle.length / 2 + 0.05) : (vehicle.length / 2 + 0.05)]}>
        <boxGeometry args={[vehicle.width * 0.7, 0.18, 0.1]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
    </group>
  );
}

export function TrafficSystem() {
  const trafficLevel = useBridgeStore(state => state.trafficLevel);
  const vehicleWeight = useBridgeStore(state => state.vehicleWeight);
  const simulationSpeed = useBridgeStore(state => state.simulationSpeed);

  const vehicles = useMemo(() => {
    let countPerLane = 2; // LOW
    if (trafficLevel === 'MEDIUM') countPerLane = 4;
    if (trafficLevel === 'HIGH') countPerLane = 7;
    if (trafficLevel === 'EXTREME') countPerLane = 11;

    const list = [];
    LANES.forEach((lane) => {
      for (let i = 0; i < countPerLane; i++) {
        let vTypeIdx = Math.floor(Math.random() * VEHICLE_TYPES.length);
        if (vehicleWeight > 1.8 && Math.random() > 0.35) {
          vTypeIdx = 4; // Force heavy truck
        }

        const vType = VEHICLE_TYPES[vTypeIdx];
        const offset = -80 + (i * (160 / countPerLane)) + (Math.random() * 6 - 3);
        const speed = (0.7 + Math.random() * 0.5) * (simulationSpeed === 0 ? 0 : 1);

        list.push({
          id: `veh-${lane.id}-${i}-${vType.type}`,
          vehicle: vType,
          lane,
          speed,
          startOffset: offset,
        });
      }
    });

    return list;
  }, [trafficLevel, vehicleWeight, simulationSpeed]);

  return (
    <group>
      {vehicles.map(v => (
        <VehicleMesh
          key={v.id}
          vehicle={v.vehicle}
          lane={v.lane}
          speed={v.speed}
          startOffset={v.startOffset}
        />
      ))}
    </group>
  );
}
