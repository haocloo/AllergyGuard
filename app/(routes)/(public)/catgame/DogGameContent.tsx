'use client';
import { Canvas, useFrame, useThree, useLoader } from '@react-three/fiber';
import { OrbitControls, Text, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import { useRef, useState, useEffect } from 'react';

// Type definitions for component props
interface FoodProps {
  position: [number, number, number];
  type: 'bone' | 'chocolate';
  value: number;
  onEat: (value: number) => void;
}

interface HealthBarProps {
  health: number;
}

interface DogProps {
  health: number;
  setHealth: React.Dispatch<React.SetStateAction<number>>;
  onEat: (value: number) => void;
  position: [number, number, number];
}

// Define types for the refs
type MeshRefType = React.RefObject<THREE.Mesh>;
type GroupRefType = React.RefObject<THREE.Group>;

function Dog({ health, setHealth, onEat, position }: DogProps) {
  const dogRef = useRef<THREE.Group>(null);
  const [speaking, setSpeaking] = useState(false);
  const [bounce, setBounce] = useState(false);
  const [shake, setShake] = useState(false);

  // Load the 3D model using useGLTF instead of GLTFLoader
  const fileUrl = '/shiba/scene.gltf';
  const { scene } = useGLTF(fileUrl);

  // Clone the model to avoid reference issues
  const model = scene.clone();

  // Scale model down to appropriate size
  model.scale.set(0.5, 0.5, 0.5);

  // Adjust position as needed
  model.position.set(0, -1, 0);

  // Animation effects for dog movement
  useFrame(() => {
    if (!dogRef.current || health <= 0) return;

    // Animation effects
    if (bounce && dogRef.current) {
      dogRef.current.position.y = Math.sin(Date.now() * 0.01) * 0.2 + position[1];
      if (Date.now() % 1000 < 20) setBounce(false);
    }

    if (shake && dogRef.current) {
      dogRef.current.position.x = position[0] + Math.sin(Date.now() * 0.05) * 0.2;
      if (Date.now() % 500 < 20) setShake(false);
    }

    // Add a gentle rotation to the model to make it look more alive
    if (dogRef.current) {
      dogRef.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.1;
    }
  });

  const handleDogClick = () => {
    if (health <= 0) return;

    setSpeaking(true);
    setBounce(true);
    playSound(400, 0.3); // Higher pitch for a dog bark

    setTimeout(() => {
      setSpeaking(false);
    }, 1000);
  };

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === 'Space' && health > 0) {
        setBounce(true);
        setSpeaking(true);
        playSound(450, 0.3);
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

      oscillator.type = 'square'; // Different waveform for dog bark sound
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
    <group ref={dogRef} position={position} onClick={handleDogClick}>
      {/* Use the loaded 3D model */}
      <primitive object={model} />

      {/* Show "Woof" text when speaking */}
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
          Woof!
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
      // If clicked, animate toward the dog
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
      {type === 'bone' ? (
        // Bone shape (simplified)
        <cylinderGeometry args={[0.1, 0.1, 1, 8]} />
      ) : (
        // Chocolate
        <boxGeometry args={[0.6, 0.4, 0.2]} />
      )}
      <meshStandardMaterial color={type === 'bone' ? '#f0f0f0' : '#6B4423'} roughness={0.7} />
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

      {/* Dog */}
      <Dog position={[0, 0, 0]} health={health} setHealth={setHealth} onEat={handleEat} />

      {/* Foods */}
      <Food position={[-2.5, -2, 0]} type="bone" value={20} onEat={handleEat} />
      <Food position={[2.5, -2, 0]} type="chocolate" value={-15} onEat={handleEat} />

      {/* Instructions */}
      <Text position={[0, -3, 0]} fontSize={0.2} color="black" {...({} as any)}>
        Click the dog to bark | Press Space to jump | Feed with foods
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
function DogGameContent() {
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

export default DogGameContent;
