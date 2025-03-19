'use client';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useState, useEffect } from 'react';

// Type definitions for component props
interface FoodProps {
  position: [number, number, number];
  type: 'carrot' | 'chocolate';
  value: number;
  onEat: (value: number) => void;
}

interface HealthBarProps {
  health: number;
}

interface CatProps {
  health: number;
  setHealth: React.Dispatch<React.SetStateAction<number>>;
  onEat: (value: number) => void;
  position: [number, number, number];
}

// Define types for the refs
type MeshRefType = React.RefObject<THREE.Mesh>;
type GroupRefType = React.RefObject<THREE.Group>;

function Cat({ health, setHealth, onEat, position }: CatProps) {
  const catRef = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const leftEyeRef = useRef<THREE.Mesh>(null);
  const rightEyeRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const [speaking, setSpeaking] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [shake, setShake] = useState(false);

  // Mouse tracking for cat head and eyes
  useFrame(({ mouse, viewport }) => {
    if (!catRef.current || health <= 0) return;

    // Subtle head movement following mouse
    const x = (mouse.x * viewport.width) / 80;
    const y = (mouse.y * viewport.height) / 80;

    if (headRef.current) {
      headRef.current.rotation.y = THREE.MathUtils.lerp(headRef.current.rotation.y, x * 0.5, 0.1);
      headRef.current.rotation.x = THREE.MathUtils.lerp(headRef.current.rotation.x, -y * 0.2, 0.1);
    }

    // Eye pupil movement
    if (leftEyeRef.current && rightEyeRef.current) {
      leftEyeRef.current.position.x = THREE.MathUtils.lerp(
        leftEyeRef.current.position.x,
        -0.5 + x * 0.3,
        0.2
      );
      leftEyeRef.current.position.y = THREE.MathUtils.lerp(
        leftEyeRef.current.position.y,
        0 + y * 0.3,
        0.2
      );

      rightEyeRef.current.position.x = THREE.MathUtils.lerp(
        rightEyeRef.current.position.x,
        0.5 + x * 0.3,
        0.2
      );
      rightEyeRef.current.position.y = THREE.MathUtils.lerp(
        rightEyeRef.current.position.y,
        0 + y * 0.3,
        0.2
      );
    }

    // Animation effects
    if (bounce && catRef.current) {
      catRef.current.position.y = Math.sin(Date.now() * 0.01) * 0.2 + position[1];
      if (Date.now() % 1000 < 20) setBounce(false);
    }

    if (shake && catRef.current) {
      catRef.current.position.x = position[0] + Math.sin(Date.now() * 0.05) * 0.2;
      if (Date.now() % 500 < 20) setShake(false);
    }

    // Mouth animation
    if (speaking && mouthRef.current) {
      mouthRef.current.scale.y = 1.5 + Math.sin(Date.now() * 0.01) * 0.5;
    } else if (mouthRef.current) {
      mouthRef.current.scale.y = 1;
    }
  });

  const handleCatClick = () => {
    if (health <= 0) return;

    setSpeaking(true);
    setBounce(true);
    playSound(300, 0.3);

    setTimeout(() => {
      setSpeaking(false);
    }, 1000);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && health > 0) {
        setBounce(true);
        setSpeaking(true);
        playSound(350, 0.3);
        setTimeout(() => setSpeaking(false), 300);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [health]);

  const playSound = (baseFreq: number, duration: number) => {
    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.type = 'triangle';
      gainNode.gain.value = 0.2;
      oscillator.frequency.value = baseFreq;
      oscillator.start();

      setTimeout(() => {
        oscillator.stop();
        context.close();
      }, duration * 1000);
    } catch (e) {
      console.log('Audio context error:', e);
    }
  };

  return (
    <group ref={catRef} position={position} onClick={handleCatClick}>
      {/* Cat head */}
      <group ref={headRef}>
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <meshStandardMaterial color={health <= 0 ? '#888888' : '#FFA500'} roughness={0.8} />
        </mesh>

        {/* Left ear */}
        <mesh position={[-0.7, 0.9, 0]} rotation={[0, 0, Math.PI / 6]}>
          <coneGeometry args={[0.3, 0.8, 16]} />
          <meshStandardMaterial color={health <= 0 ? '#888888' : '#FFA500'} roughness={0.8} />
        </mesh>

        {/* Right ear */}
        <mesh position={[0.7, 0.9, 0]} rotation={[0, 0, -Math.PI / 6]}>
          <coneGeometry args={[0.3, 0.8, 16]} />
          <meshStandardMaterial color={health <= 0 ? '#888888' : '#FFA500'} roughness={0.8} />
        </mesh>

        {/* Left eye */}
        <group position={[-0.4, 0.2, 0.85]}>
          <mesh>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color={health <= 0 ? '#ff4444' : 'white'} />
          </mesh>

          {/* Left pupil */}
          <mesh ref={leftEyeRef} position={[0, 0, 0.15]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="black" />
          </mesh>
        </group>

        {/* Right eye */}
        <group position={[0.4, 0.2, 0.85]}>
          <mesh>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color={health <= 0 ? '#ff4444' : 'white'} />
          </mesh>

          {/* Right pupil */}
          <mesh ref={rightEyeRef} position={[0, 0, 0.15]}>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color="black" />
          </mesh>
        </group>

        {/* Nose */}
        <mesh position={[0, -0.1, 1]}>
          <sphereGeometry args={[0.15, 16, 16]} />
          <meshStandardMaterial color="#FF69B4" />
        </mesh>

        {/* Mouth */}
        <mesh ref={mouthRef} position={[0, -0.4, 0.9]} scale={[1, 1, 0.5]}>
          <torusGeometry args={[0.2, 0.05, 16, 16, Math.PI]} />
          <meshStandardMaterial color="black" />
        </mesh>
      </group>

      {/* Show "Meow" text when speaking */}
      {speaking && (
        <Text
          position={[0, 1.5, 0]}
          rotation={[0, Math.PI / 4, 0]}
          fontSize={0.5}
          color="black"
          anchorX="center"
          anchorY="middle"
          {...({} as any)}
        >
          Meow!
        </Text>
      )}
    </group>
  );
}

function Food({ position, type, value, onEat }: FoodProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [pos, setPos] = useState(position);

  useFrame(() => {
    if (!meshRef.current) return;

    if (!clicked) {
      // Floating animation
      meshRef.current.position.y = pos[1] + Math.sin(Date.now() * 0.002) * 0.2;
      meshRef.current.rotation.y += 0.01;
    } else {
      // If clicked, animate toward the cat
      const targetPos = [0, 0, 0];
      meshRef.current.position.x = THREE.MathUtils.lerp(
        meshRef.current.position.x,
        targetPos[0],
        0.1
      );
      meshRef.current.position.y = THREE.MathUtils.lerp(
        meshRef.current.position.y,
        targetPos[1],
        0.1
      );
      meshRef.current.position.z = THREE.MathUtils.lerp(
        meshRef.current.position.z,
        targetPos[2],
        0.1
      );
      meshRef.current.scale.x = THREE.MathUtils.lerp(meshRef.current.scale.x, 0, 0.1);
      meshRef.current.scale.y = THREE.MathUtils.lerp(meshRef.current.scale.y, 0, 0.1);
      meshRef.current.scale.z = THREE.MathUtils.lerp(meshRef.current.scale.z, 0, 0.1);

      // When the animation is nearly complete
      if (meshRef.current.scale.x < 0.05) {
        onEat(value);
        setClicked(false);
        // Reset
        meshRef.current.position.set(...pos);
        meshRef.current.scale.set(1, 1, 1);
      }
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={pos}
      scale={hover ? 1.2 : 1}
      onClick={() => !clicked && setClicked(true)}
      onPointerOver={() => setHover(true)}
      onPointerOut={() => setHover(false)}
    >
      {type === 'carrot' ? (
        <coneGeometry args={[0.3, 1, 16]} />
      ) : (
        <boxGeometry args={[0.6, 0.4, 0.2]} />
      )}
      <meshStandardMaterial color={type === 'carrot' ? '#FFA500' : '#6B4423'} roughness={0.7} />
    </mesh>
  );
}

function HealthBar({ health }: HealthBarProps) {
  const { viewport } = useThree();

  return (
    <group position={[-viewport.width / 4, viewport.height / 3, 0]}>
      {/* Background bar */}
      <mesh position={[0, 0, -0.1]}>
        <planeGeometry args={[2, 0.3]} />
        <meshBasicMaterial color="#555" />
      </mesh>

      {/* Health fill */}
      <mesh position={[(health / 100 - 1) * 1, 0, 0]} scale={[health / 100, 1, 1]}>
        <planeGeometry args={[2, 0.3]} />
        <meshBasicMaterial color={health > 50 ? '#4CAF50' : '#ff4444'} />
      </mesh>

      {/* Text */}
      <Text position={[0, 0, 0.1]} fontSize={0.15} color="white" {...({} as any)}>
        {`HP: ${Math.round(health)}%`}
      </Text>
    </group>
  );
}

function Scene() {
  const [health, setHealth] = useState(100);

  const handleEat = (value: number) => {
    const newHealth = Math.min(Math.max(health + value, 0), 100);
    setHealth(newHealth);

    const baseFreq = value > 0 ? 400 : 200;
    const duration = value > 0 ? 0.2 : 0.5;

    try {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.type = 'triangle';
      gainNode.gain.value = 0.2;
      oscillator.frequency.value = baseFreq;
      oscillator.start();

      setTimeout(() => {
        oscillator.stop();
        context.close();
      }, duration * 1000);
    } catch (e) {
      console.log('Audio context error:', e);
    }
  };

  return (
    <>
      {/* Health bar */}
      <HealthBar health={health} />

      {/* Cat */}
      <Cat position={[0, 0, 0]} health={health} setHealth={setHealth} onEat={handleEat} />

      {/* Foods */}
      <Food position={[-2.5, -2, 0]} type="carrot" value={20} onEat={handleEat} />
      <Food position={[2.5, -2, 0]} type="chocolate" value={-15} onEat={handleEat} />

      {/* Instructions */}
      <Text position={[0, -3, 0]} fontSize={0.2} color="black" {...({} as any)}>
        Click the cat to meow | Press Space to jump | Feed with foods
      </Text>

      {health <= 0 && (
        <Text position={[0, 2, 0]} fontSize={0.5} color="red" {...({} as any)}>
          Game Over! Refresh to play again
        </Text>
      )}
    </>
  );
}

// The actual component that uses Three.js - only imported on the client side
function CatGameContent() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <OrbitControls
          enablePan={false}
          minDistance={4}
          maxDistance={10}
          enableDamping
          dampingFactor={0.05}
        />
        <Scene />
      </Canvas>
    </div>
  );
}

export default CatGameContent;
