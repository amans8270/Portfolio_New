'use client';

import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Torus, Icosahedron, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';

function FloatingOrb({ position, color, scale }: { position: [number, number, number]; color: string; scale: number }) {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.x = state.clock.elapsedTime * 0.3;
            ref.current.rotation.y = state.clock.elapsedTime * 0.2;
        }
    });
    return (
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={1.5}>
            <Icosahedron ref={ref} args={[scale, 1]} position={position}>
                <meshStandardMaterial
                    color={color}
                    wireframe
                    transparent
                    opacity={0.3}
                    emissive={color}
                    emissiveIntensity={0.3}
                />
            </Icosahedron>
        </Float>
    );
}

function FloatingTorus({ position, color }: { position: [number, number, number]; color: string }) {
    const ref = useRef<THREE.Mesh>(null);
    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.x = state.clock.elapsedTime * 0.4;
            ref.current.rotation.z = state.clock.elapsedTime * 0.2;
        }
    });
    return (
        <Float speed={2} rotationIntensity={1} floatIntensity={2}>
            <Torus ref={ref} args={[0.4, 0.12, 16, 40]} position={position}>
                <meshStandardMaterial
                    color={color}
                    transparent
                    opacity={0.4}
                    metalness={0.8}
                    roughness={0.2}
                    emissive={color}
                    emissiveIntensity={0.2}
                />
            </Torus>
        </Float>
    );
}

function ParticleField() {
    const count = 1500;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 20;
    }
    const positionAttr = new THREE.BufferAttribute(positions, 3);
    const ref = useRef<THREE.Points>(null);

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.y = state.clock.elapsedTime * 0.02;
            ref.current.rotation.x = state.clock.elapsedTime * 0.01;
        }
    });

    return (
        <Points ref={ref} limit={count}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" {...positionAttr} />
            </bufferGeometry>
            <PointMaterial
                transparent
                color="#818cf8"
                size={0.04}
                sizeAttenuation
                depthWrite={false}
                opacity={0.6}
            />
        </Points>
    );
}

export default function HeroScene() {
    return (
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
            <Canvas
                camera={{ position: [0, 0, 6], fov: 60 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.3} />
                <pointLight position={[5, 5, 5]} intensity={1} color="#818cf8" />
                <pointLight position={[-5, -5, 5]} intensity={0.5} color="#38bdf8" />

                <ParticleField />

                {/* Left cluster */}
                <FloatingOrb position={[-3.5, 1.5, -2]} color="#6366f1" scale={0.8} />
                <FloatingOrb position={[-2.5, -1.5, -1]} color="#a78bfa" scale={0.4} />
                <FloatingTorus position={[-3, -0.5, -1.5]} color="#818cf8" />

                {/* Right cluster */}
                <FloatingOrb position={[3.5, 1, -2]} color="#38bdf8" scale={0.6} />
                <FloatingOrb position={[2.5, -2, -1]} color="#22d3ee" scale={0.35} />
                <FloatingTorus position={[3, 0.5, -1]} color="#38bdf8" />

                {/* Top center */}
                <FloatingOrb position={[0.5, 2.5, -3]} color="#c4b5fd" scale={0.5} />

                {/* Bottom spread */}
                <FloatingOrb position={[-1, -2.5, -2]} color="#818cf8" scale={0.3} />
                <FloatingTorus position={[1.5, -1.5, -2]} color="#a78bfa" />
            </Canvas>
        </div>
    );
}
