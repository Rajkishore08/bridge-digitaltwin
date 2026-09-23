import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useBridgeStore } from '../../store/useBridgeStore';
import { BRIDGE_COMPONENTS, BRIDGE_DIMENSIONS } from '../../data/bridgeConfig';

const STATUS_COLORS = {
  normal: '#10b981',    // Emerald Green
  warning: '#f59e0b',   // Amber Yellow
  elevated: '#f97316',  // Orange
  critical: '#ef4444',  // Crimson Red
};

// Continuous finite element stress color interpolation helper
function getHeatmapColor(pct) {
  if (pct >= 80) return '#ef4444'; // Crimson Red (Critical Stress)
  if (pct >= 62) return '#f97316'; // Orange (Elevated Stress)
  if (pct >= 45) return '#f59e0b'; // Amber Yellow (Warning Threshold)
  if (pct >= 28) return '#84cc16'; // Lime (Moderate Load)
  return '#10b981';                // Emerald Green (Nominal)
}

export function BridgeStructure() {
  const viewMode = useBridgeStore(state => state.viewMode);
  const componentHealth = useBridgeStore(state => state.componentHealth);
  const selectedComponentId = useBridgeStore(state => state.selectedComponentId);
  const selectedZone = useBridgeStore(state => state.selectedZone);
  const hoveredComponentId = useBridgeStore(state => state.hoveredComponentId);
  const selectComponent = useBridgeStore(state => state.selectComponent);
  const setHoveredComponent = useBridgeStore(state => state.setHoveredComponent);
  const collapseSimulation = useBridgeStore(state => state.collapseSimulation);
  const displacementExaggerated = useBridgeStore(state => state.displacementExaggerated);

  const span3Ref = useRef();

  // Stay Cables Array generation
  const cables = useMemo(() => {
    const cableArray = [];
    const towerZs = BRIDGE_DIMENSIONS.towerZPositions; // [-28, 28]

    towerZs.forEach((towerZ, tIdx) => {
      for (let i = 1; i <= 8; i++) {
        const anchorHeight = 22 + i * 1.8;
        const offsetZ = (i * 3.6);
        const zSouth = towerZ - offsetZ;
        const zNorth = towerZ + offsetZ;

        [-6.2, 6.2].forEach(xPos => {
          if (zSouth >= -78 && zSouth <= 78) {
            cableArray.push({
              id: `c-s-${tIdx}-${i}-${xPos}`,
              start: [xPos * 0.25, anchorHeight, towerZ],
              end: [xPos, BRIDGE_DIMENSIONS.deckElevation + 0.6, zSouth],
              isSpan3: (zSouth >= 0 && zSouth <= 28),
            });
          }
          if (zNorth >= -78 && zNorth <= 78) {
            cableArray.push({
              id: `c-n-${tIdx}-${i}-${xPos}`,
              start: [xPos * 0.25, anchorHeight, towerZ],
              end: [xPos, BRIDGE_DIMENSIONS.deckElevation + 0.6, zNorth],
              isSpan3: (zNorth >= 0 && zNorth <= 28),
            });
          }
        });
      }
    });
    return cableArray;
  }, []);

  // Street light positions
  const streetLights = useMemo(() => {
    const lights = [];
    for (let z = -75; z <= 75; z += 15) {
      lights.push({ pos: [-6.8, BRIDGE_DIMENSIONS.deckElevation + 1.2, z], dir: 1 });
      lights.push({ pos: [6.8, BRIDGE_DIMENSIONS.deckElevation + 1.2, z], dir: -1 });
    }
    return lights;
  }, []);

  // Dynamic collapse animation frame hook
  useFrame((state, delta) => {
    if (span3Ref.current) {
      if (collapseSimulation.active) {
        // Progressive catastrophic failure: downward sag & roll tilt
        const sagAmount = collapseSimulation.step === 'COLLAPSED' ? 14 : collapseSimulation.step === 'SNAPPING' ? 5 : 2;
        const tiltAmount = collapseSimulation.step === 'COLLAPSED' ? 0.35 : collapseSimulation.step === 'SNAPPING' ? 0.12 : 0.04;
        span3Ref.current.position.y = THREE.MathUtils.lerp(span3Ref.current.position.y, -sagAmount, delta * 3);
        span3Ref.current.rotation.x = THREE.MathUtils.lerp(span3Ref.current.rotation.x, tiltAmount, delta * 3);
        span3Ref.current.rotation.z = THREE.MathUtils.lerp(span3Ref.current.rotation.z, tiltAmount * 0.5, delta * 3);
      } else {
        // Reset to normal (aligned with all other spans)
        span3Ref.current.position.y = 0;
        span3Ref.current.rotation.x = 0;
        span3Ref.current.rotation.z = 0;
      }
    }
  });

  return (
    <group>
      {/* ================= 1. FOUR SPANS WITH LOCALIZED HEATMAP TILES ================= */}
      {BRIDGE_COMPONENTS.filter(c => c.type === 'span').map(span => {
        const isSelected = selectedComponentId === span.id || selectedZone === span.id;
        const isHovered = hoveredComponentId === span.id;
        const health = componentHealth[span.id] || { status: 'normal', stressPercent: 20, segments: [20, 22, 24, 22, 20, 20] };
        const isSpan3 = span.id === 'SPAN_03';
        const isZoneDimmed = selectedZone && selectedZone !== span.id;

        // Number of localized sub-segments (6 sub-tiles per span)
        const SEGMENT_COUNT = 6;
        const segmentLength = span.length / SEGMENT_COUNT;
        const segments = health.segments || [20, 22, 24, 22, 20, 20];

        return (
          <group 
            key={span.id}
            ref={isSpan3 ? span3Ref : null}
            onClick={(e) => {
              e.stopPropagation();
              selectComponent(span.id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredComponent(span.id);
            }}
            onPointerOut={() => setHoveredComponent(null)}
          >
            {/* Multi-Segmented Deck Heatmap Slices */}
            {segments.map((segVal, sIdx) => {
              const segCenterZ = (span.zRange[0] + (sIdx + 0.5) * segmentLength);
              let tileColor = '#1e293b'; // Realistic uniform asphalt

              if (viewMode === 'STRESS') {
                tileColor = getHeatmapColor(segVal);
              } else if (viewMode === 'VIBRATION' || viewMode === 'DISPLACEMENT') {
                tileColor = '#0284c7';
              } else if (collapseSimulation.active && isSpan3) {
                tileColor = '#7f1d1d';
              } else {
                tileColor = '#1e293b';
              }

              const emissiveColor = isSelected
                ? '#06b6d4'
                : (viewMode === 'STRESS' ? tileColor : (collapseSimulation.active && isSpan3 ? '#ef4444' : '#000000'));
              
              const emissiveInt = isSelected
                ? 0.5
                : (viewMode === 'STRESS' ? 0.35 : (collapseSimulation.active && isSpan3 ? 0.8 : 0));

              return (
                <mesh
                  key={`seg-${span.id}-${sIdx}`}
                  position={[0, span.centerPos[1], segCenterZ]}
                  castShadow
                  receiveShadow
                >
                  <boxGeometry args={[BRIDGE_DIMENSIONS.deckWidth, BRIDGE_DIMENSIONS.deckThickness, segmentLength - 0.05]} />
                  <meshStandardMaterial
                    color={tileColor}
                    roughness={0.45}
                    metalness={0.5}
                    opacity={isZoneDimmed ? 0.35 : 1.0}
                    transparent={!!isZoneDimmed}
                    emissive={emissiveColor}
                    emissiveIntensity={emissiveInt}
                  />
                </mesh>
              );
            })}

            {/* Steel Truss & Box Girder Substructure */}
            <mesh position={[span.centerPos[0], span.centerPos[1] - 1.2, span.centerPos[2]]}>
              <boxGeometry args={[BRIDGE_DIMENSIONS.deckWidth - 2.4, 1.3, span.length - 0.4]} />
              <meshStandardMaterial
                color="#1e293b"
                roughness={0.7}
                metalness={0.8}
                wireframe={viewMode === 'STRESS'}
                opacity={isZoneDimmed ? 0.3 : 1.0}
                transparent={!!isZoneDimmed}
              />
            </mesh>

            {/* Expansion Joint Teeth on Span Ends */}
            <mesh position={[0, span.centerPos[1] + 0.62, span.zRange[1]]}>
              <boxGeometry args={[BRIDGE_DIMENSIONS.deckWidth, 0.1, 0.4]} />
              <meshStandardMaterial color="#64748b" metalness={0.9} />
            </mesh>

            {/* Maintenance Access Catwalk Under Deck */}
            <mesh position={[0, span.centerPos[1] - 2.0, span.centerPos[2]]}>
              <boxGeometry args={[2.0, 0.1, span.length - 1]} />
              <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.5} />
            </mesh>

            {/* Edge Safety Barriers */}
            <mesh position={[-6.7, span.centerPos[1] + 0.4, span.centerPos[2]]}>
              <boxGeometry args={[0.5, 0.7, span.length]} />
              <meshStandardMaterial color="#475569" metalness={0.6} />
            </mesh>
            <mesh position={[6.7, span.centerPos[1] + 0.4, span.centerPos[2]]}>
              <boxGeometry args={[0.5, 0.7, span.length]} />
              <meshStandardMaterial color="#475569" metalness={0.6} />
            </mesh>

            {/* Asphalt Road Lane Markings */}
            <mesh position={[0, span.centerPos[1] + 0.62, span.centerPos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.3, span.length - 0.5]} />
              <meshBasicMaterial color="#eab308" />
            </mesh>
            <mesh position={[-3.2, span.centerPos[1] + 0.62, span.centerPos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.2, span.length - 0.5]} />
              <meshBasicMaterial color="#f8fafc" />
            </mesh>
            <mesh position={[3.2, span.centerPos[1] + 0.62, span.centerPos[2]]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.2, span.length - 0.5]} />
              <meshBasicMaterial color="#f8fafc" />
            </mesh>
          </group>
        );
      })}

      {/* ================= 2. PYLONS / TOWERS WITH IOT GATEWAY HARDWARE ================= */}
      {BRIDGE_COMPONENTS.filter(c => c.type === 'tower').map(tower => {
        const isSelected = selectedComponentId === tower.id || selectedZone === tower.id;
        const isHovered = hoveredComponentId === tower.id;
        const isZoneDimmed = selectedZone && selectedZone !== tower.id;
        const zPos = tower.pos[2];

        return (
          <group 
            key={tower.id}
            onClick={(e) => {
              e.stopPropagation();
              selectComponent(tower.id);
            }}
            onPointerOver={(e) => {
              e.stopPropagation();
              setHoveredComponent(tower.id);
            }}
            onPointerOut={() => setHoveredComponent(null)}
          >
            {/* Left Tower Leg */}
            <mesh position={[-4.5, 19, zPos]} rotation={[0, 0, -0.09]} castShadow>
              <boxGeometry args={[1.9, 38, 2.9]} />
              <meshStandardMaterial 
                color={isSelected ? '#06b6d4' : isHovered ? '#67e8f9' : '#334155'} 
                roughness={0.35} 
                metalness={0.7}
                opacity={isZoneDimmed ? 0.35 : 1.0}
                transparent={!!isZoneDimmed}
              />
            </mesh>

            {/* Right Tower Leg */}
            <mesh position={[4.5, 19, zPos]} rotation={[0, 0, 0.09]} castShadow>
              <boxGeometry args={[1.9, 38, 2.9]} />
              <meshStandardMaterial 
                color={isSelected ? '#06b6d4' : isHovered ? '#67e8f9' : '#334155'} 
                roughness={0.35} 
                metalness={0.7}
                opacity={isZoneDimmed ? 0.35 : 1.0}
                transparent={!!isZoneDimmed}
              />
            </mesh>

            {/* Pylon Crown Saddle */}
            <mesh position={[0, 36.5, zPos]} castShadow>
              <boxGeometry args={[4.4, 4.8, 3.4]} />
              <meshStandardMaterial color="#1e293b" roughness={0.4} metalness={0.8} />
            </mesh>

            {/* Cross Beams & Maintenance Platforms */}
            <mesh position={[0, 6.2, zPos]}>
              <boxGeometry args={[12.5, 2.4, 3.4]} />
              <meshStandardMaterial color="#1e293b" roughness={0.6} metalness={0.7} />
            </mesh>
            <mesh position={[0, 22, zPos]}>
              <boxGeometry args={[7.4, 1.5, 2.2]} />
              <meshStandardMaterial color="#334155" roughness={0.5} metalness={0.7} />
            </mesh>

            {/* Top Aviation Warning Beacon */}
            <mesh position={[0, 39.2, zPos]}>
              <sphereGeometry args={[0.35, 16, 16]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <pointLight position={[0, 39.2, zPos]} color="#ef4444" distance={18} intensity={2.5} />
          </group>
        );
      })}

      {/* ================= 3. SUBSTRUCTURE PIERS & ELASTOMERIC BEARINGS ================= */}
      {BRIDGE_COMPONENTS.filter(c => c.type === 'pier').map(pier => (
        <group key={pier.id}>
          {/* Main Caisson Pier */}
          <mesh position={[0, 3.2, pier.pos[2]]} castShadow receiveShadow>
            <cylinderGeometry args={[4.4, 5.0, 7.5, 32]} />
            <meshStandardMaterial color="#334155" roughness={0.8} metalness={0.4} />
          </mesh>

          {/* Water Splash Footing */}
          <mesh position={[0, 0.4, pier.pos[2]]}>
            <cylinderGeometry args={[5.8, 6.2, 1.2, 32]} />
            <meshStandardMaterial color="#1e293b" roughness={0.9} />
          </mesh>

          {/* Elastomeric Bearings */}
          <mesh position={[-4, 7.0, pier.pos[2]]}>
            <cylinderGeometry args={[0.8, 0.8, 0.6, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.9} />
          </mesh>
          <mesh position={[4, 7.0, pier.pos[2]]}>
            <cylinderGeometry args={[0.8, 0.8, 0.6, 16]} />
            <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.9} />
          </mesh>
        </group>
      ))}

      {/* ================= 4. STAY CABLE NETWORK ================= */}
      <group>
        {cables.map(cable => {
          // If collapse simulation is in snapping phase, hide snapped cables on Span 3
          if (collapseSimulation.active && collapseSimulation.step !== 'NORMAL' && cable.isSpan3 && Math.random() > 0.4) {
            return null;
          }

          const startVec = new THREE.Vector3(...cable.start);
          const endVec = new THREE.Vector3(...cable.end);
          const curve = new THREE.LineCurve3(startVec, endVec);

          return (
            <mesh key={cable.id}>
              <tubeGeometry args={[curve, 8, 0.055, 6, false]} />
              <meshStandardMaterial 
                color={viewMode === 'VIBRATION' ? '#38bdf8' : '#cbd5e1'} 
                roughness={0.3} 
                metalness={0.85}
              />
            </mesh>
          );
        })}
      </group>

      {/* ================= 5. GUARDRAILS & STREET LIGHTS ================= */}
      <mesh position={[-6.9, BRIDGE_DIMENSIONS.deckElevation + 1.1, 0]}>
        <boxGeometry args={[0.15, 0.8, BRIDGE_DIMENSIONS.totalLength]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[6.9, BRIDGE_DIMENSIONS.deckElevation + 1.1, 0]}>
        <boxGeometry args={[0.15, 0.8, BRIDGE_DIMENSIONS.totalLength]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Street Light Posts */}
      {streetLights.map((light, idx) => (
        <group key={`light-${idx}`} position={light.pos}>
          <mesh position={[0, 1.8, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 3.6, 12]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} />
          </mesh>
          <mesh position={[light.dir * 0.4, 3.6, 0]} rotation={[0, 0, light.dir * 0.3]}>
            <cylinderGeometry args={[0.05, 0.05, 1.0, 8]} />
            <meshStandardMaterial color="#64748b" />
          </mesh>
          <mesh position={[light.dir * 0.8, 3.4, 0]}>
            <sphereGeometry args={[0.16, 12, 12]} />
            <meshBasicMaterial color="#38bdf8" />
          </mesh>
        </group>
      ))}

      {/* Shoreline Approach Terrain */}
      <mesh position={[0, 4.0, -96]}>
        <boxGeometry args={[34, 8, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
      <mesh position={[0, 4.0, 96]}>
        <boxGeometry args={[34, 8, 32]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>
    </group>
  );
}
