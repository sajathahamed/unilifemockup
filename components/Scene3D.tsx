'use client'

import { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, Torus, Icosahedron, Stars } from '@react-three/drei'
import * as THREE from 'three'

function AnimatedShapes() {
  const sphereRef = useRef<THREE.Mesh>(null)
  const torusRef = useRef<THREE.Mesh>(null)
  const icoRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    const t = state.clock.getElapsedTime()
    if (sphereRef.current) {
      sphereRef.current.rotation.x = t * 0.2
      sphereRef.current.rotation.y = t * 0.3
    }
    if (torusRef.current) {
      torusRef.current.rotation.x = t * 0.15
      torusRef.current.rotation.z = t * 0.1
    }
    if (icoRef.current) {
      icoRef.current.rotation.y = t * 0.25
      icoRef.current.rotation.z = t * 0.1
    }
  })

  return (
    <>
      <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
        <Sphere ref={sphereRef} args={[1, 64, 64]} position={[-2.5, 1, -2]}>
          <MeshDistortMaterial
            color="#2ec118"
            attach="material"
            distort={0.4}
            speed={2}
            roughness={0.2}
            metalness={0.8}
          />
        </Sphere>
      </Float>

      <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.8}>
        <Torus ref={torusRef} args={[0.8, 0.3, 32, 100]} position={[2.5, -0.5, -1]}>
          <MeshDistortMaterial
            color="#2ec118"
            attach="material"
            distort={0.3}
            speed={1.5}
            roughness={0.3}
            metalness={0.7}
          />
        </Torus>
      </Float>

      <Float speed={2.5} rotationIntensity={0.6} floatIntensity={1.2}>
        <Icosahedron ref={icoRef} args={[0.7, 0]} position={[0, -1.5, -3]}>
          <MeshDistortMaterial
            color="#ffffff"
            attach="material"
            distort={0.5}
            speed={2}
            roughness={0.2}
            metalness={0.9}
          />
        </Icosahedron>
      </Float>
    </>
  )
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#2ec118" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#2ec118" />
      <spotLight position={[0, 10, 0]} intensity={0.5} color="#ffffff" />
      
      <AnimatedShapes />
      
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      
      <fog attach="fog" args={['#0a0a0f', 5, 20]} />
    </>
  )
}

interface Scene3DProps {
  className?: string
}

export default function Scene3D({ className }: Scene3DProps) {
  return (
    <div className={className}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
      </Canvas>
    </div>
  )
}