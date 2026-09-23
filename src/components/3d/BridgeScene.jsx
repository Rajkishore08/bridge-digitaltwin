import React, { useEffect, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useBridgeStore } from '../../store/useBridgeStore';
import { runPhysicsStep } from '../../simulation/simulationEngine';
import { BridgeStructure } from './BridgeStructure';
import { SensorMarkers } from './SensorMarkers';
import { TrafficSystem } from './TrafficSystem';
import { VibrationVisualizer } from './VibrationVisualizer';
import { DataPacketPulses } from './DataPacketPulses';
import { CollapseEffects } from './CollapseEffects';

// Camera Presets dictionary
const CAMERA_PRESETS = {
  OVERVIEW: { pos: [65, 42, 75], target: [0, 8, 0] },
  SPAN_01: { pos: [24, 18, -54], target: [0, 8, -54] },
  SPAN_02: { pos: [22, 16, -14], target: [0, 8, -14] },
  SPAN_03: { pos: [22, 16, 14], target: [0, 8, 14] }, // Critical fault zone
  SPAN_04: { pos: [24, 18, 54], target: [0, 8, 54] },
  TOWERS: { pos: [38, 35, 0], target: [0, 24, 0] },
  PIERS: { pos: [32, 6, 28], target: [0, 3, 28] },
};

function CameraRig() {
  const { camera } = useThree();
  const controlsRef = useRef();
  const cameraPreset = useBridgeStore(state => state.cameraPreset);
  const cameraCommand = useBridgeStore(state => state.cameraCommand);
  const selectedSensorId = useBridgeStore(state => state.selectedSensorId);
  const collapseSimulation = useBridgeStore(state => state.collapseSimulation);

  const targetCamPos = useRef(new THREE.Vector3(65, 42, 75));
  const targetLookAt = useRef(new THREE.Vector3(0, 8, 0));
  const isTransitioning = useRef(false);

  // Trigger smooth transition ONLY when preset / sensor selection / collapse changes
  useEffect(() => {
    if (collapseSimulation.active) {
      targetCamPos.current.set(30, 16, 20);
      targetLookAt.current.set(0, 4, 14);
      isTransitioning.current = true;
      return;
    }

    if (selectedSensorId) {
      const allSensors = useBridgeStore.getState().sensors;
      const sensor = allSensors.find(s => s.id === selectedSensorId);
      if (sensor) {
        targetCamPos.current.set(
          sensor.position[0] + 12,
          sensor.position[1] + 8,
          sensor.position[2] + 14
        );
        targetLookAt.current.set(...sensor.position);
        isTransitioning.current = true;
        return;
      }
    }

    const preset = CAMERA_PRESETS[cameraPreset] || CAMERA_PRESETS.OVERVIEW;
    targetCamPos.current.set(...preset.pos);
    targetLookAt.current.set(...preset.target);
    isTransitioning.current = true;
  }, [cameraPreset, selectedSensorId, collapseSimulation.active]);

  // Handle manual Camera Commands: Zoom In/Out, Rotate Angle Left/Right/Up/Down, Perspectives
  useEffect(() => {
    if (!cameraCommand) return;
    const { type } = cameraCommand;
    const controls = controlsRef.current;
    const currentTarget = controls ? controls.target.clone() : new THREE.Vector3(0, 8, 0);
    const currentCamPos = camera.position.clone();
    const offset = currentCamPos.clone().sub(currentTarget);
    const radius = offset.length();

    switch (type) {
      case 'ZOOM_IN': {
        const newRadius = Math.max(8, radius * 0.72);
        offset.setLength(newRadius);
        targetCamPos.current.copy(currentTarget).add(offset);
        targetLookAt.current.copy(currentTarget);
        isTransitioning.current = true;
        break;
      }
      case 'ZOOM_OUT': {
        const newRadius = Math.min(220, radius * 1.38);
        offset.setLength(newRadius);
        targetCamPos.current.copy(currentTarget).add(offset);
        targetLookAt.current.copy(currentTarget);
        isTransitioning.current = true;
        break;
      }
      case 'ROTATE_LEFT': {
        const angle = Math.PI / 6; // 30 deg orbit
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        targetCamPos.current.copy(currentTarget).add(offset);
        targetLookAt.current.copy(currentTarget);
        isTransitioning.current = true;
        break;
      }
      case 'ROTATE_RIGHT': {
        const angle = -Math.PI / 6;
        offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        targetCamPos.current.copy(currentTarget).add(offset);
        targetLookAt.current.copy(currentTarget);
        isTransitioning.current = true;
        break;
      }
      case 'ROTATE_UP': {
        const spherical = new THREE.Spherical().setFromVector3(offset);
        spherical.phi = Math.max(0.12, spherical.phi - 0.22);
        offset.setFromSpherical(spherical);
        targetCamPos.current.copy(currentTarget).add(offset);
        targetLookAt.current.copy(currentTarget);
        isTransitioning.current = true;
        break;
      }
      case 'ROTATE_DOWN': {
        const spherical = new THREE.Spherical().setFromVector3(offset);
        spherical.phi = Math.min(Math.PI / 2 - 0.04, spherical.phi + 0.22);
        offset.setFromSpherical(spherical);
        targetCamPos.current.copy(currentTarget).add(offset);
        targetLookAt.current.copy(currentTarget);
        isTransitioning.current = true;
        break;
      }
      case 'VIEW_TOP': {
        targetCamPos.current.set(0, 130, 0.001);
        targetLookAt.current.set(0, 8, 0);
        isTransitioning.current = true;
        break;
      }
      case 'VIEW_SIDE': {
        targetCamPos.current.set(110, 14, 0);
        targetLookAt.current.set(0, 8, 0);
        isTransitioning.current = true;
        break;
      }
      case 'VIEW_FRONT': {
        targetCamPos.current.set(0, 16, 120);
        targetLookAt.current.set(0, 8, 0);
        isTransitioning.current = true;
        break;
      }
      case 'VIEW_ISO':
      case 'RESET': {
        targetCamPos.current.set(65, 42, 75);
        targetLookAt.current.set(0, 8, 0);
        isTransitioning.current = true;
        break;
      }
      default:
        break;
    }
  }, [cameraCommand]);

  // Cancel auto-lerp immediately when user starts manual touch/orbit interaction
  useEffect(() => {
    const controls = controlsRef.current;
    if (!controls) return;

    const handleStart = () => {
      isTransitioning.current = false;
    };

    controls.addEventListener('start', handleStart);
    return () => controls.removeEventListener('start', handleStart);
  }, []);

  useFrame((state, delta) => {
    if (isTransitioning.current) {
      camera.position.lerp(targetCamPos.current, delta * 3.5);
      if (controlsRef.current) {
        controlsRef.current.target.lerp(targetLookAt.current, delta * 3.5);
        controlsRef.current.update();
      }

      // Once reached target, relinquish control completely to manual OrbitControls
      if (camera.position.distanceTo(targetCamPos.current) < 0.15) {
        isTransitioning.current = false;
      }
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.06}
      maxPolarAngle={Math.PI / 2 - 0.02}
      minDistance={6}
      maxDistance={250}
    />
  );
}

// Environmental Lighting Architecture based on DAY / SUNSET / NIGHT
function DynamicLighting() {
  const lightingMode = useBridgeStore(state => state.lightingMode);

  if (lightingMode === 'DAY') {
    return (
      <group>
        <ambientLight intensity={0.75} color="#e0f2fe" />
        <directionalLight
          position={[70, 100, 50]}
          intensity={2.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          color="#ffffff"
        />
        <hemisphereLight skyColor="#38bdf8" groundColor="#0f172a" intensity={0.8} />
      </group>
    );
  }

  if (lightingMode === 'SUNSET') {
    return (
      <group>
        <ambientLight intensity={0.5} color="#fed7aa" />
        <directionalLight
          position={[90, 30, -50]}
          intensity={2.8}
          castShadow
          color="#fb923c"
        />
        <hemisphereLight skyColor="#ea580c" groundColor="#0f172a" intensity={0.7} />
        <pointLight position={[0, 40, 0]} intensity={1.2} distance={100} color="#f97316" />
      </group>
    );
  }

  // NIGHT MODE
  return (
    <group>
      <ambientLight intensity={0.35} color="#38bdf8" />
      <directionalLight
        position={[60, 90, 45]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        color="#bae6fd"
      />
      <hemisphereLight skyColor="#0284c7" groundColor="#020b14" intensity={0.5} />
      <pointLight position={[0, 40, 0]} intensity={1.2} distance={120} color="#0ea5e9" />
    </group>
  );
}

// Background environment: Water, terrain, skyline
function BridgeEnvironment() {
  const lightingMode = useBridgeStore(state => state.lightingMode);

  const waterColor = lightingMode === 'DAY' ? '#0369a1' : lightingMode === 'SUNSET' ? '#7c2d12' : '#031525';
  const fogColor = lightingMode === 'DAY' ? '#0284c7' : lightingMode === 'SUNSET' ? '#431407' : '#020b14';

  return (
    <group>
      {/* Water Surface */}
      <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[600, 600, 32, 32]} />
        <meshStandardMaterial
          color={waterColor}
          roughness={0.08}
          metalness={0.9}
        />
      </mesh>

      {/* Shoreline Mountains */}
      <mesh position={[-140, 15, 0]} rotation={[0, Math.PI / 4, 0]}>
        <coneGeometry args={[45, 38, 5]} />
        <meshStandardMaterial color="#0b1e33" roughness={0.9} />
      </mesh>
      <mesh position={[-160, 22, -90]} rotation={[0, Math.PI / 3, 0]}>
        <coneGeometry args={[55, 48, 5]} />
        <meshStandardMaterial color="#081729" roughness={0.9} />
      </mesh>
      <mesh position={[-150, 18, 90]} rotation={[0, Math.PI / 6, 0]}>
        <coneGeometry args={[50, 42, 5]} />
        <meshStandardMaterial color="#081729" roughness={0.9} />
      </mesh>

      {/* Distant City Skyline */}
      <group position={[160, 0, 0]}>
        {[-80, -45, -15, 20, 55, 90].map((zPos, idx) => (
          <mesh key={idx} position={[0, 20 + (idx % 3) * 12, zPos]}>
            <boxGeometry args={[14, 40 + (idx % 4) * 20, 14]} />
            <meshStandardMaterial color="#091c30" roughness={0.8} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

// Physics Loop inside Canvas
function SimulationLoop() {
  const lastUpdateRef = useRef(0);
  const updateTelemetry = useBridgeStore(state => state.updateTelemetry);

  useFrame((state, delta) => {
    lastUpdateRef.current += delta;
    if (lastUpdateRef.current >= 0.2) {
      lastUpdateRef.current = 0;
      const storeState = useBridgeStore.getState();
      const result = runPhysicsStep(storeState, delta);
      if (result) {
        updateTelemetry(result);
      }
    }
  });

  return null;
}

export function BridgeScene() {
  const lightingMode = useBridgeStore(state => state.lightingMode);
  const bgColor = lightingMode === 'DAY' ? '#0f2b48' : lightingMode === 'SUNSET' ? '#2e1008' : '#020b14';

  return (
    <div className="canvas-container">
      <Canvas
        shadows
        camera={{ position: [65, 42, 75], fov: 48 }}
        gl={{ antialias: true, alpha: false }}
        onPointerMissed={() => {
          useBridgeStore.getState().selectSensor(null);
          useBridgeStore.getState().selectComponent(null);
        }}
      >
        <color attach="background" args={[bgColor]} />
        <fog attach="fog" args={[bgColor, 70, 260]} />

        {/* Dynamic Multi-Mode Lighting */}
        <DynamicLighting />

        {/* 3D Scene Systems */}
        <BridgeEnvironment />
        <BridgeStructure />
        <TrafficSystem />
        <SensorMarkers />
        <VibrationVisualizer />
        <DataPacketPulses />
        <CollapseEffects />

        {/* Camera and Real-time Physics Engine */}
        <CameraRig />
        <SimulationLoop />
      </Canvas>
    </div>
  );
}
