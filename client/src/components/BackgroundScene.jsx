import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

export function BackgroundScene() {
  const groupRef = useRef();

  useFrame((state) => {
    // Scroll-based animation
    // Assumes the page might be scrollable. We can link to window scroll.
    const scrollY = window.scrollY;
    if (groupRef.current) {
        // Slowly rotate the entire background group based on scroll and time
        groupRef.current.rotation.y = (scrollY * 0.001) + (state.clock.elapsedTime * 0.05);
        groupRef.current.position.y = scrollY * -0.002;
    }
  });

  return (
    <>
      <color attach="background" args={['#0a0a0a']} />
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={1} color="#ffffff" />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#2dd4bf" />
      
      <group ref={groupRef}>
        <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        
        {/* Decorative floating elements */}
        {Array.from({ length: 15 }).map((_, i) => (
          <Float 
            key={i} 
            speed={1} 
            rotationIntensity={2} 
            floatIntensity={2}
            position={[
              (Math.random() - 0.5) * 20,
              (Math.random() - 0.5) * 20,
              (Math.random() - 0.5) * 10 - 5
            ]}
          >
            <mesh>
              <octahedronGeometry args={[Math.random() * 0.5 + 0.1]} />
              <meshStandardMaterial 
                color={i % 3 === 0 ? "#2dd4bf" : "#404040"} 
                wireframe={i % 2 === 0}
                transparent
                opacity={0.3}
              />
            </mesh>
          </Float>
        ))}
      </group>
    </>
  );
}
