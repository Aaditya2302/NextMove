import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshDistortMaterial, Sphere } from '@react-three/drei';
import * as THREE from 'three';

export function VoiceSphere({ analyser, isRecording, onClick }) {
  const meshRef = useRef();
  const materialRef = useRef();
  const dataArray = useRef(null);

  // Initialize data array for analyser
  useEffect(() => {
    if (analyser) {
      dataArray.current = new Uint8Array(analyser.frequencyBinCount);
    } else {
      dataArray.current = null;
    }
  }, [analyser]);

  useFrame((state) => {
    if (!meshRef.current || !materialRef.current) return;

    // Default gentle rotation
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.2;
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;

    // Default distortion (calm state)
    let targetDistort = 0.2;
    let targetSpeed = 1;
    let targetScale = 1;
    let targetColor = new THREE.Color('#2dd4bf'); // Cyan accent

    if (isRecording && analyser && dataArray.current) {
      analyser.getByteFrequencyData(dataArray.current);
      // Calculate average frequency volume
      let sum = 0;
      for (let i = 0; i < dataArray.current.length; i++) {
        sum += dataArray.current[i];
      }
      const average = sum / dataArray.current.length;
      
      // Normalize average (0 to 1) roughly
      const normalizedVol = Math.min(average / 100, 1.0); 

      // Morph based on volume
      targetDistort = 0.3 + normalizedVol * 0.6; // Distort up to 0.9
      targetSpeed = 2 + normalizedVol * 5; // Speed up to 7
      targetScale = 1 + normalizedVol * 0.3; // Grow up to 1.3x

      // Change color based on volume (cyan to white/bright teal)
      targetColor.lerpColors(
        new THREE.Color('#2dd4bf'),
        new THREE.Color('#f8fafc'),
        normalizedVol
      );
    } else if (isRecording && !analyser) {
        // waiting for stream to initialize
        targetDistort = 0.4;
        targetSpeed = 3;
        targetColor = new THREE.Color('#94a3b8');
    } else {
        // Not recording - rest state
        targetDistort = 0.15;
        targetSpeed = 1;
        targetColor = new THREE.Color('#404040'); // Dark gray when inactive
    }

    // Lerp values for smooth transitions
    materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, targetDistort, 0.1);
    materialRef.current.speed = THREE.MathUtils.lerp(materialRef.current.speed, targetSpeed, 0.1);
    meshRef.current.scale.setScalar(THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, 0.1));
    materialRef.current.color.lerp(targetColor, 0.1);
  });

  return (
    <mesh 
      ref={meshRef} 
      onClick={onClick}
      onPointerOver={(e) => {
        document.body.style.cursor = 'pointer';
        if (!isRecording && materialRef.current) {
            materialRef.current.color.lerp(new THREE.Color('#525252'), 1); // Slight hover effect
        }
      }}
      onPointerOut={(e) => document.body.style.cursor = 'auto'}
    >
      <sphereGeometry args={[1.5, 64, 64]} />
      <MeshDistortMaterial
        ref={materialRef}
        color="#404040"
        envMapIntensity={1}
        clearcoat={0.8}
        clearcoatRoughness={0.2}
        metalness={0.8}
        roughness={0.2}
        distort={0.15}
        speed={1}
      />
    </mesh>
  );
}
