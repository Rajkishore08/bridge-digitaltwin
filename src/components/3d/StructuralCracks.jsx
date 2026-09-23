import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useBridgeStore } from '../../store/useBridgeStore';

// Procedural crack branch definitions across Span 3 (Z: 0 to 28) and Span 2 (Z: -28 to 0)
const CRACK_NETWORKS = [
  // Primary Major Transverse Fracture (Span 3 Midspan Joint Z = 14)
  {
    spanId: 'SPAN_03',
    centerZ: 14,
    points: [
      [-6.2, 8.12, 12.8],
      [-4.5, 8.12, 13.4],
      [-2.8, 8.12, 13.1],
      [-1.2, 8.12, 14.2],
      [0.0, 8.12, 13.8],
      [1.5, 8.12, 14.6],
      [3.2, 8.12, 14.1],
      [4.8, 8.12, 14.9],
      [6.2, 8.12, 14.3],
    ],
    branches: [
      [
        [-1.2, 8.12, 14.2],
        [-0.4, 8.12, 15.6],
        [0.8, 8.12, 16.8],
        [2.2, 8.12, 17.5],
      ],
      [
        [1.5, 8.12, 14.6],
        [2.6, 8.12, 13.2],
        [3.9, 8.12, 12.4],
      ],
      [
        [-4.5, 8.12, 13.4],
        [-5.2, 8.12, 15.1],
        [-5.9, 8.12, 16.2],
      ]
    ]
  },
  // Secondary Longitudinal Shear Crack (Span 3 Left Wheel Track)
  {
    spanId: 'SPAN_03',
    centerZ: 8,
    points: [
      [-3.2, 8.12, 4.5],
      [-3.0, 8.12, 6.8],
      [-3.4, 8.12, 9.2],
      [-2.9, 8.12, 11.5],
      [-3.3, 8.12, 13.8],
    ],
    branches: [
      [
        [-3.0, 8.12, 6.8],
        [-1.8, 8.12, 7.6],
        [-0.5, 8.12, 8.1],
      ],
      [
        [-2.9, 8.12, 11.5],
        [-4.2, 8.12, 12.3],
      ]
    ]
  },
  // Secondary Diagonal Shear Crack (Span 3 Right Wheel Track)
  {
    spanId: 'SPAN_03',
    centerZ: 20,
    points: [
      [3.1, 8.12, 16.5],
      [3.5, 8.12, 18.9],
      [2.9, 8.12, 21.2],
      [3.4, 8.12, 23.5],
      [3.0, 8.12, 25.8],
    ],
    branches: [
      [
        [3.5, 8.12, 18.9],
        [4.6, 8.12, 19.8],
        [5.8, 8.12, 20.4],
      ]
    ]
  },
  // Span 2 High Overload Crack (Z = -14)
  {
    spanId: 'SPAN_02',
    centerZ: -14,
    points: [
      [-5.5, 8.12, -15.2],
      [-3.2, 8.12, -14.4],
      [-1.0, 8.12, -14.8],
      [1.4, 8.12, -13.9],
      [3.8, 8.12, -14.5],
      [5.6, 8.12, -13.8],
    ],
    branches: [
      [
        [-1.0, 8.12, -14.8],
        [-0.2, 8.12, -16.1],
        [1.1, 8.12, -17.2],
      ]
    ]
  }
];

// Helper to construct ribbon geometry with thickness along polyline
function createRibbonGeometry(points, width = 0.22) {
  const geom = new THREE.BufferGeometry();
  const vertices = [];
  const uvs = [];

  for (let i = 0; i < points.length - 1; i++) {
    const p1 = new THREE.Vector3(...points[i]);
    const p2 = new THREE.Vector3(...points[i + 1]);

    const dir = new THREE.Vector3().subVectors(p2, p1).normalize();
    const up = new THREE.Vector3(0, 1, 0);
    const normal = new THREE.Vector3().crossVectors(dir, up).normalize();

    const v1 = p1.clone().addScaledVector(normal, -width / 2);
    const v2 = p1.clone().addScaledVector(normal, width / 2);
    const v3 = p2.clone().addScaledVector(normal, -width / 2);
    const v4 = p2.clone().addScaledVector(normal, width / 2);

    // Two triangles per segment quad
    vertices.push(v1.x, v1.y, v1.z);
    vertices.push(v2.x, v2.y, v2.z);
    vertices.push(v3.x, v3.y, v3.z);

    vertices.push(v2.x, v2.y, v2.z);
    vertices.push(v4.x, v4.y, v4.z);
    vertices.push(v3.x, v3.y, v3.z);

    uvs.push(0, 0, 1, 0, 0, 1);
    uvs.push(1, 0, 1, 1, 0, 1);
  }

  geom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geom.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geom.computeVertexNormals();
  return geom;
}

export function StructuralCracks() {
  const componentHealth = useBridgeStore(state => state.componentHealth);
  const collapseSimulation = useBridgeStore(state => state.collapseSimulation);
  const trafficLevel = useBridgeStore(state => state.trafficLevel);
  const vehicleWeight = useBridgeStore(state => state.vehicleWeight);

  const crackGroupRef = useRef();

  // Pre-generate static ribbon geometries
  const meshGeometries = useMemo(() => {
    return CRACK_NETWORKS.map(net => {
      const mainGeom = createRibbonGeometry(net.points, 0.28);
      const branchGeoms = net.branches.map(b => createRibbonGeometry(b, 0.18));
      return {
        spanId: net.spanId,
        mainGeom,
        branchGeoms,
        centerZ: net.centerZ,
      };
    });
  }, []);

  // Compute highest stress in Span 3 and Span 2
  const span3Health = componentHealth['SPAN_03'] || { stressPercent: 20, status: 'normal' };
  const span2Health = componentHealth['SPAN_02'] || { stressPercent: 20, status: 'normal' };

  const span3Stress = span3Health.stressPercent || 20;
  const span2Stress = span2Health.stressPercent || 20;

  // Cracks appear when stress surpasses 68% or during collapse or high axle overload
  const isExtremeOverload = trafficLevel === 'EXTREME' || vehicleWeight >= 1.8;
  const hasCracks = collapseSimulation.active || span3Stress >= 68 || isExtremeOverload;

  useFrame((state) => {
    if (!crackGroupRef.current) return;
    const time = state.clock.getElapsedTime();

    // Subtle pulsing emission under critical overload
    const pulse = 0.5 + Math.sin(time * 6) * 0.4;
    crackGroupRef.current.children.forEach(child => {
      if (child.material && child.material.emissiveIntensity !== undefined) {
        child.material.emissiveIntensity = span3Stress >= 85 || collapseSimulation.active ? 1.2 * pulse : 0.6;
      }
    });
  });

  if (!hasCracks) return null;

  return (
    <group ref={crackGroupRef} position={[0, 0.02, 0]}>
      {meshGeometries.map((item, idx) => {
        const spanStress = item.spanId === 'SPAN_03' ? span3Stress : span2Stress;
        if (spanStress < 65 && !collapseSimulation.active && !isExtremeOverload) return null;

        // Dynamic scale factor based on stress severity
        const severity = Math.min(2.2, Math.max(0.6, (spanStress - 60) / 18));
        const isCritical = spanStress >= 82 || collapseSimulation.active;
        const fissureColor = isCritical ? '#ef4444' : '#f59e0b';

        return (
          <group key={`crack-net-${idx}`} scale={[1, 1, severity]}>
            {/* Main Primary Crevice Fissure */}
            <mesh geometry={item.mainGeom}>
              <meshStandardMaterial
                color="#09090b"
                roughness={0.95}
                metalness={0.1}
                emissive={fissureColor}
                emissiveIntensity={isCritical ? 0.9 : 0.4}
                polygonOffset
                polygonOffsetFactor={-2}
                polygonOffsetUnits={-2}
              />
            </mesh>

            {/* Glowing Stress Fissure Core Ribbon */}
            <mesh geometry={item.mainGeom} scale={[0.5, 1, 0.95]}>
              <meshBasicMaterial
                color={fissureColor}
                transparent
                opacity={isCritical ? 0.85 : 0.5}
                polygonOffset
                polygonOffsetFactor={-4}
                polygonOffsetUnits={-4}
              />
            </mesh>

            {/* Branching Fractures */}
            {item.branchGeoms.map((bGeom, bIdx) => (
              <mesh key={`branch-${idx}-${bIdx}`} geometry={bGeom}>
                <meshStandardMaterial
                  color="#18181b"
                  roughness={0.9}
                  emissive={isCritical ? '#ef4444' : '#d97706'}
                  emissiveIntensity={0.6}
                  polygonOffset
                  polygonOffsetFactor={-2}
                  polygonOffsetUnits={-2}
                />
              </mesh>
            ))}

            {/* Concrete Spall Fracture Dust Particles when Critical */}
            {isCritical && (
              <mesh position={[0, 8.2, item.centerZ]}>
                <sphereGeometry args={[0.35, 8, 8]} />
                <meshBasicMaterial color="#f87171" transparent opacity={0.7} />
              </mesh>
            )}
          </group>
        );
      })}
    </group>
  );
}
