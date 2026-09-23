import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useBridgeStore } from '../../store/useBridgeStore';
import { BRIDGE_DIMENSIONS } from '../../data/bridgeConfig';

const VEHICLE_CATALOG = [
  { type: 'sedan', length: 4.2, width: 1.8, height: 1.35, colors: ['#0284c7', '#dc2626', '#f8fafc', '#1e293b', '#64748b'], mass: 1.6 },
  { type: 'suv', length: 4.8, width: 1.95, height: 1.65, colors: ['#0f172a', '#e2e8f0', '#0369a1', '#b91c1c', '#334155'], mass: 2.3 },
  { type: 'van', length: 5.6, width: 2.0, height: 2.2, colors: ['#f59e0b', '#f8fafc', '#3b82f6'], mass: 3.8 },
  { type: 'bus', length: 11.5, width: 2.5, height: 3.2, colors: ['#10b981', '#0284c7', '#e11d48'], mass: 14.5 },
  { type: 'truck', length: 14.2, width: 2.6, height: 3.8, colors: ['#dc2626', '#ea580c', '#2563eb', '#475569'], mass: 42.0 },
];

const LANES = [
  { id: 'S1', x: -4.8, direction: 1 },  // Southbound Lane 1
  { id: 'S2', x: -1.8, direction: 1 },  // Southbound Lane 2
  { id: 'N1', x: 1.8, direction: -1 },  // Northbound Lane 1
  { id: 'N2', x: 4.8, direction: -1 },  // Northbound Lane 2
];

// Helper for realistic rubber tire + chrome rim
function Wheel({ position, radius = 0.36, width = 0.22 }) {
  return (
    <group position={position} rotation={[0, 0, Math.PI / 2]}>
      {/* Rubber Tire */}
      <mesh castShadow>
        <cylinderGeometry args={[radius, radius, width, 14]} />
        <meshStandardMaterial color="#0f172a" roughness={0.9} metalness={0.1} />
      </mesh>
      {/* Metallic Wheel Rim */}
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[radius * 0.6, radius * 0.6, width + 0.02, 10]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.3} metalness={0.8} />
      </mesh>
    </group>
  );
}

// 1. Realistic Modern Sedan Car
function SedanModel({ color, isCollapsing }) {
  return (
    <group>
      {/* Lower Aerodynamic Body Chassis */}
      <mesh position={[0, 0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.75, 0.45, 4.2]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.7} />
      </mesh>

      {/* Cabin Roof & Pillars */}
      <mesh position={[0, 0.72, -0.2]} castShadow>
        <boxGeometry args={[1.5, 0.45, 2.2]} />
        <meshStandardMaterial color={color} roughness={0.25} metalness={0.7} />
      </mesh>

      {/* Tinted Windshield & Glass Windows */}
      <mesh position={[0, 0.7, -0.2]}>
        <boxGeometry args={[1.52, 0.42, 2.15]} />
        <meshStandardMaterial color="#030712" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Front Radiator Grille */}
      <mesh position={[0, 0.32, 2.11]}>
        <boxGeometry args={[1.2, 0.22, 0.05]} />
        <meshStandardMaterial color="#18181b" roughness={0.8} metalness={0.3} />
      </mesh>

      {/* Xenon LED Headlights */}
      <mesh position={[-0.6, 0.35, 2.12]}>
        <boxGeometry args={[0.35, 0.14, 0.05]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>
      <mesh position={[0.6, 0.35, 2.12]}>
        <boxGeometry args={[0.35, 0.14, 0.05]} />
        <meshBasicMaterial color="#f8fafc" />
      </mesh>

      {/* LED Tail Lights Bar */}
      <mesh position={[0, 0.38, -2.12]}>
        <boxGeometry args={[1.5, 0.12, 0.05]} />
        <meshBasicMaterial color={isCollapsing ? '#fbbf24' : '#ef4444'} />
      </mesh>

      {/* 4 Wheels */}
      <Wheel position={[-0.88, 0.28, 1.25]} />
      <Wheel position={[0.88, 0.28, 1.25]} />
      <Wheel position={[-0.88, 0.28, -1.25]} />
      <Wheel position={[0.88, 0.28, -1.25]} />
    </group>
  );
}

// 2. Realistic SUV Model
function SuvModel({ color, isCollapsing }) {
  return (
    <group>
      {/* Lower Rugged Body */}
      <mesh position={[0, 0.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[1.9, 0.55, 4.6]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.65} />
      </mesh>

      {/* Upper High-Roof Cabin */}
      <mesh position={[0, 0.92, -0.25]} castShadow>
        <boxGeometry args={[1.68, 0.58, 2.8]} />
        <meshStandardMaterial color={color} roughness={0.3} metalness={0.65} />
      </mesh>

      {/* Roof Rails */}
      <mesh position={[-0.7, 1.24, -0.25]}>
        <boxGeometry args={[0.08, 0.06, 2.4]} />
        <meshStandardMaterial color="#475569" metalness={0.9} />
      </mesh>
      <mesh position={[0.7, 1.24, -0.25]}>
        <boxGeometry args={[0.08, 0.06, 2.4]} />
        <meshStandardMaterial color="#475569" metalness={0.9} />
      </mesh>

      {/* Tinted Glass */}
      <mesh position={[0, 0.9, -0.25]}>
        <boxGeometry args={[1.7, 0.52, 2.75]} />
        <meshStandardMaterial color="#020617" roughness={0.1} metalness={0.95} />
      </mesh>

      {/* Front Chrome Bumper & Fog Lights */}
      <mesh position={[0, 0.28, 2.32]}>
        <boxGeometry args={[1.6, 0.2, 0.08]} />
        <meshStandardMaterial color="#334155" metalness={0.7} />
      </mesh>

      {/* Dual Headlights */}
      <mesh position={[-0.65, 0.48, 2.32]}>
        <boxGeometry args={[0.4, 0.16, 0.05]} />
        <meshBasicMaterial color="#e0f2fe" />
      </mesh>
      <mesh position={[0.65, 0.48, 2.32]}>
        <boxGeometry args={[0.4, 0.16, 0.05]} />
        <meshBasicMaterial color="#e0f2fe" />
      </mesh>

      {/* Rear Taillights */}
      <mesh position={[-0.7, 0.52, -2.32]}>
        <boxGeometry args={[0.25, 0.35, 0.05]} />
        <meshBasicMaterial color={isCollapsing ? '#fbbf24' : '#ef4444'} />
      </mesh>
      <mesh position={[0.7, 0.52, -2.32]}>
        <boxGeometry args={[0.25, 0.35, 0.05]} />
        <meshBasicMaterial color={isCollapsing ? '#fbbf24' : '#ef4444'} />
      </mesh>

      {/* 4 Heavy-Duty Wheels */}
      <Wheel position={[-0.96, 0.34, 1.4]} radius={0.4} width={0.24} />
      <Wheel position={[0.96, 0.34, 1.4]} radius={0.4} width={0.24} />
      <Wheel position={[-0.96, 0.34, -1.4]} radius={0.4} width={0.24} />
      <Wheel position={[0.96, 0.34, -1.4]} radius={0.4} width={0.24} />
    </group>
  );
}

// 3. Realistic Commercial Delivery Van
function VanModel({ color, isCollapsing }) {
  return (
    <group>
      {/* Van Box Body */}
      <mesh position={[0, 0.95, -0.3]} castShadow receiveShadow>
        <boxGeometry args={[1.95, 1.4, 4.0]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Driver Front Cab Nose */}
      <mesh position={[0, 0.68, 2.0]} castShadow>
        <boxGeometry args={[1.92, 0.95, 1.2]} />
        <meshStandardMaterial color={color} roughness={0.4} metalness={0.4} />
      </mesh>

      {/* Cab Windshield */}
      <mesh position={[0, 0.85, 2.1]}>
        <boxGeometry args={[1.8, 0.55, 0.9]} />
        <meshStandardMaterial color="#0f172a" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Headlights & Taillights */}
      <mesh position={[-0.7, 0.45, 2.62]}>
        <boxGeometry args={[0.3, 0.2, 0.05]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
      <mesh position={[0.7, 0.45, 2.62]}>
        <boxGeometry args={[0.3, 0.2, 0.05]} />
        <meshBasicMaterial color="#fef08a" />
      </mesh>
      <mesh position={[-0.8, 0.7, -2.32]}>
        <boxGeometry args={[0.15, 0.6, 0.05]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0.8, 0.7, -2.32]}>
        <boxGeometry args={[0.15, 0.6, 0.05]} />
        <meshBasicMaterial color="#ef4444" />
      </mesh>

      {/* 4 Wheels */}
      <Wheel position={[-0.98, 0.36, 1.6]} radius={0.38} />
      <Wheel position={[0.98, 0.36, 1.6]} radius={0.38} />
      <Wheel position={[-0.98, 0.36, -1.4]} radius={0.38} />
      <Wheel position={[0.98, 0.36, -1.4]} radius={0.38} />
    </group>
  );
}

// 4. Realistic Public Transit Bus
function BusModel({ color, isCollapsing }) {
  return (
    <group>
      {/* Main Bus Aerodynamic Shell */}
      <mesh position={[0, 1.45, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.45, 2.1, 11.2]} />
        <meshStandardMaterial color={color} roughness={0.35} metalness={0.5} />
      </mesh>

      {/* Wraparound Panoramic Dark Glass Windows */}
      <mesh position={[0, 1.65, 0]}>
        <boxGeometry args={[2.48, 0.95, 10.8]} />
        <meshStandardMaterial color="#020617" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Roof AC Climate Units */}
      <mesh position={[0, 2.62, 1.5]} castShadow>
        <boxGeometry args={[1.6, 0.28, 2.2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.62, -2.5]} castShadow>
        <boxGeometry args={[1.6, 0.28, 2.2]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.6} />
      </mesh>

      {/* Front Electronic Destination LED Sign */}
      <mesh position={[0, 2.2, 5.62]}>
        <boxGeometry args={[1.6, 0.28, 0.05]} />
        <meshBasicMaterial color="#f59e0b" />
      </mesh>

      {/* Front Headlights and Fog Clusters */}
      <mesh position={[-0.85, 0.6, 5.62]}>
        <boxGeometry args={[0.45, 0.25, 0.05]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0.85, 0.6, 5.62]}>
        <boxGeometry args={[0.45, 0.25, 0.05]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {/* Rear Vertical Tall Taillight Columns */}
      <mesh position={[-1.0, 1.1, -5.62]}>
        <boxGeometry args={[0.2, 1.2, 0.05]} />
        <meshBasicMaterial color={isCollapsing ? '#fbbf24' : '#ef4444'} />
      </mesh>
      <mesh position={[1.0, 1.1, -5.62]}>
        <boxGeometry args={[0.2, 1.2, 0.05]} />
        <meshBasicMaterial color={isCollapsing ? '#fbbf24' : '#ef4444'} />
      </mesh>

      {/* 6 Heavy Bus Wheels (Dual rear axles) */}
      <Wheel position={[-1.24, 0.44, 3.8]} radius={0.48} width={0.28} />
      <Wheel position={[1.24, 0.44, 3.8]} radius={0.48} width={0.28} />
      <Wheel position={[-1.24, 0.44, -2.6]} radius={0.48} width={0.28} />
      <Wheel position={[1.24, 0.44, -2.6]} radius={0.48} width={0.28} />
      <Wheel position={[-1.24, 0.44, -4.0]} radius={0.48} width={0.28} />
      <Wheel position={[1.24, 0.44, -4.0]} radius={0.48} width={0.28} />
    </group>
  );
}

// 5. Realistic 18-Wheeler Heavy Semi-Truck & Corrugated Container
function TruckModel({ color, isCollapsing }) {
  return (
    <group>
      {/* 1. FRONT CAB (Tractor Unit) */}
      <group position={[0, 0, 4.4]}>
        {/* Cab Engine Hood & Sleeper Body */}
        <mesh position={[0, 1.45, 0.4]} castShadow receiveShadow>
          <boxGeometry args={[2.45, 2.1, 2.6]} />
          <meshStandardMaterial color={color} roughness={0.25} metalness={0.7} />
        </mesh>

        {/* Lower Engine Nose */}
        <mesh position={[0, 0.85, 2.1]} castShadow>
          <boxGeometry args={[2.35, 1.1, 1.6]} />
          <meshStandardMaterial color={color} roughness={0.25} metalness={0.7} />
        </mesh>

        {/* Front Chrome Radiator Grille */}
        <mesh position={[0, 0.85, 2.92]}>
          <boxGeometry args={[1.8, 0.95, 0.08]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.15} metalness={0.95} />
        </mesh>

        {/* Front High Windshield & Sun Visor */}
        <mesh position={[0, 1.85, 1.4]}>
          <boxGeometry args={[2.2, 0.65, 0.8]} />
          <meshStandardMaterial color="#020617" roughness={0.1} metalness={0.95} />
        </mesh>
        <mesh position={[0, 2.25, 1.8]}>
          <boxGeometry args={[2.3, 0.12, 0.3]} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.9} />
        </mesh>

        {/* Dual Chrome Exhaust Stacks */}
        <mesh position={[-1.15, 2.4, -0.6]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 2.2, 10]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.1} metalness={0.98} />
        </mesh>
        <mesh position={[1.15, 2.4, -0.6]} castShadow>
          <cylinderGeometry args={[0.08, 0.08, 2.2, 10]} />
          <meshStandardMaterial color="#cbd5e1" roughness={0.1} metalness={0.98} />
        </mesh>

        {/* Front Projector Headlights */}
        <mesh position={[-0.9, 0.55, 2.92]}>
          <boxGeometry args={[0.45, 0.28, 0.05]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.9, 0.55, 2.92]}>
          <boxGeometry args={[0.45, 0.28, 0.05]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>

        {/* Cab Wheels (Steer Axle + Drive Axles) */}
        <Wheel position={[-1.25, 0.48, 1.9]} radius={0.52} width={0.3} />
        <Wheel position={[1.25, 0.48, 1.9]} radius={0.52} width={0.3} />
        <Wheel position={[-1.25, 0.48, -0.4]} radius={0.52} width={0.3} />
        <Wheel position={[1.25, 0.48, -0.4]} radius={0.52} width={0.3} />
      </group>

      {/* 2. TRAILER & 40FT INTERMODAL SHIPPING CONTAINER */}
      <group position={[0, 0, -2.4]}>
        {/* Heavy Steel Trailer Chassis Frame */}
        <mesh position={[0, 0.75, 0]} castShadow>
          <boxGeometry args={[2.4, 0.35, 9.8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.8} metalness={0.6} />
        </mesh>

        {/* 40ft Shipping Container Box */}
        <mesh position={[0, 2.15, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.55, 2.45, 9.4]} />
          <meshStandardMaterial color="#0284c7" roughness={0.5} metalness={0.3} />
        </mesh>

        {/* Container Corrugation Ribs & Details */}
        {[-3.5, -2.0, -0.5, 1.0, 2.5, 4.0].map((zPos, rIdx) => (
          <mesh key={`rib-${rIdx}`} position={[0, 2.15, zPos]}>
            <boxGeometry args={[2.58, 2.42, 0.12]} />
            <meshStandardMaterial color="#0369a1" roughness={0.6} />
          </mesh>
        ))}

        {/* Rear Container Cargo Doors & Locking Bars */}
        <mesh position={[0, 2.15, -4.72]}>
          <boxGeometry args={[2.4, 2.3, 0.05]} />
          <meshStandardMaterial color="#0f172a" roughness={0.8} />
        </mesh>

        {/* Rear Safety Mudflaps & Warning Taillights */}
        <mesh position={[-0.9, 0.65, -4.72]}>
          <boxGeometry args={[0.5, 0.25, 0.05]} />
          <meshBasicMaterial color={isCollapsing ? '#fbbf24' : '#ef4444'} />
        </mesh>
        <mesh position={[0.9, 0.65, -4.72]}>
          <boxGeometry args={[0.5, 0.25, 0.05]} />
          <meshBasicMaterial color={isCollapsing ? '#fbbf24' : '#ef4444'} />
        </mesh>

        {/* Tandem Rear Dual Wheels */}
        <Wheel position={[-1.25, 0.48, -2.8]} radius={0.52} width={0.3} />
        <Wheel position={[1.25, 0.48, -2.8]} radius={0.52} width={0.3} />
        <Wheel position={[-1.25, 0.48, -4.1]} radius={0.52} width={0.3} />
        <Wheel position={[1.25, 0.48, -4.1]} radius={0.52} width={0.3} />
      </group>
    </group>
  );
}

function VehicleActor({ vehicle, lane, speed, startOffset }) {
  const meshRef = useRef();
  const progressRef = useRef(startOffset);
  const collapseSimulation = useBridgeStore(state => state.collapseSimulation);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Halt forward motion if bridge is collapsing
    const effectiveSpeed = collapseSimulation.active ? 0 : speed;
    progressRef.current += delta * effectiveSpeed * lane.direction * 12;

    if (lane.direction === 1 && progressRef.current > 85) {
      progressRef.current = -85;
    } else if (lane.direction === -1 && progressRef.current < -85) {
      progressRef.current = 85;
    }

    meshRef.current.position.z = progressRef.current;

    const baseY = BRIDGE_DIMENSIONS.deckElevation + 0.6;

    // Dynamic collapse physics: vehicles on Span 3 drop and tilt into water
    if (collapseSimulation.active && progressRef.current >= -4 && progressRef.current <= 32) {
      if (collapseSimulation.step === 'COLLAPSED') {
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, 0.6, delta * 3.8);
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0.42, delta * 2.8);
        meshRef.current.rotation.z = THREE.MathUtils.lerp(meshRef.current.rotation.z, (lane.x > 0 ? 0.3 : -0.3), delta * 2.8);
      } else {
        const sag = collapseSimulation.step === 'SNAPPING' ? 5 : 2;
        meshRef.current.position.y = THREE.MathUtils.lerp(meshRef.current.position.y, baseY - sag, delta * 3);
        meshRef.current.rotation.x = THREE.MathUtils.lerp(meshRef.current.rotation.x, 0.14, delta * 3);
      }
    } else {
      meshRef.current.position.y = baseY;
      meshRef.current.rotation.x = 0;
      meshRef.current.rotation.z = 0;
    }
  });

  const isCollapsing = collapseSimulation.active;
  const headingRotation = lane.direction === 1 ? 0 : Math.PI;

  return (
    <group
      ref={meshRef}
      position={[lane.x, BRIDGE_DIMENSIONS.deckElevation + 0.6, startOffset]}
      rotation={[0, headingRotation, 0]}
    >
      {vehicle.type === 'sedan' && <SedanModel color={vehicle.color} isCollapsing={isCollapsing} />}
      {vehicle.type === 'suv' && <SuvModel color={vehicle.color} isCollapsing={isCollapsing} />}
      {vehicle.type === 'van' && <VanModel color={vehicle.color} isCollapsing={isCollapsing} />}
      {vehicle.type === 'bus' && <BusModel color={vehicle.color} isCollapsing={isCollapsing} />}
      {vehicle.type === 'truck' && <TruckModel color={vehicle.color} isCollapsing={isCollapsing} />}
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
        let vTypeIdx = Math.floor(Math.random() * VEHICLE_CATALOG.length);
        if (vehicleWeight > 1.8 && Math.random() > 0.3) {
          vTypeIdx = 4; // Force heavy truck under extreme axle factor
        }

        const template = VEHICLE_CATALOG[vTypeIdx];
        const color = template.colors[Math.floor(Math.random() * template.colors.length)];
        const offset = -80 + (i * (160 / countPerLane)) + (Math.random() * 6 - 3);
        const speed = (0.75 + Math.random() * 0.45) * (simulationSpeed === 0 ? 0 : 1);

        list.push({
          id: `veh-${lane.id}-${i}-${template.type}`,
          type: template.type,
          color,
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
      {vehicles.map((v) => (
        <VehicleActor
          key={v.id}
          vehicle={v}
          lane={v.lane}
          speed={v.speed}
          startOffset={v.startOffset}
        />
      ))}
    </group>
  );
}
