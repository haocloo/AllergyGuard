'use client';

import { useEffect, useState, useRef } from 'react';
import { useGameStore, initialFoodItems } from './store';
import { saveGameResult } from './actions';
import { v4 as uuidv4 } from 'uuid';

interface GameComponentProps {
  childId: string;
  onGameEnd: () => void;
}

// Main Game Component
export function GameComponent({ childId, onGameEnd }: GameComponentProps) {
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // Changed from 60 to 30 seconds
  const [safeItemsSliced, setSafeItemsSliced] = useState(0);
  const [allergenItemsSliced, setAllergenItemsSliced] = useState(0);
  const [totalItemsSliced, setTotalItemsSliced] = useState(0);
  const [gameEnded, setGameEnded] = useState(false);
  const [comboCount, setComboCount] = useState(0);
  const [showCombo, setShowCombo] = useState(false);
  const [wrongSlices, setWrongSlices] = useState(0); // New state for tracking wrong slices
  const [slicedItems, setSlicedItems] = useState<{name: string, isAllergen: boolean}[]>([]); // Track sliced items for summary
  const [showResults, setShowResults] = useState(false); // Show results summary
  const { childProfiles, allergies, foodItems, addGameResult } = useGameStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameItems = useRef<FoodObject[]>([]);
  const sliceEffects = useRef<SliceEffect[]>([]);
  const particles = useRef<Particle[]>([]);
  const comboTimer = useRef<NodeJS.Timeout | null>(null);
  const slicePathRef = useRef<SlicePath | null>(null);
  const animationFrameId = useRef<number>(0);
  
  // Mouse/touch tracking
  const isMouseDown = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });
  
  // Find current child profile
  const childProfile = childProfiles.find(profile => profile.id === childId);
  
  // Get child allergies and convert to lowercase for case-insensitive matching
  const childAllergies = childProfile ? childProfile.allergies.map(a => a.toLowerCase()) : ['dairy'];
  
  // If the profile has no allergies, assign a default for the demo
  const childAllergiesIds = childAllergies.length > 0 ? childAllergies : ['dairy'];

  // Helper function to check if an item contains an allergen
  const containsAllergen = (foodItem: any) => {
    // Check if any of the allergen categories match the child's allergies
    return foodItem.allergens.some((allergen: string) => 
      childAllergiesIds.some(allergyCat => 
        allergen.toLowerCase().includes(allergyCat) || 
        allergyCat.includes(allergen.toLowerCase())
      )
    );
  };

  // Set up game foods
  useEffect(() => {
    if (foodItems.length === 0) {
      useGameStore.getState().setFoodItems(initialFoodItems);
    }
  }, [foodItems]);

  // Initialize the game
  useEffect(() => {
    if (!canvasRef.current || gameEnded) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas size to match container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };
    
    // Initial resize
    resizeCanvas();
    
    // Handle window resize
    window.addEventListener('resize', resizeCanvas);
    
    // Random spawn location pattern - top, sides or bottom
    const getSpawnLocation = () => {
      const patterns = [
        // Top spawn (most common)
        { x: Math.random() * canvas.width, y: -50, vx: (Math.random() - 0.5) * 3, vy: 5 + Math.random() * 3 },
        // Left spawn
        { x: -50, y: Math.random() * canvas.height * 0.7, vx: 3 + Math.random() * 2, vy: -2 + Math.random() * 4 },
        // Right spawn
        { x: canvas.width + 50, y: Math.random() * canvas.height * 0.7, vx: -(3 + Math.random() * 2), vy: -2 + Math.random() * 4 }
      ];
      
      // 70% chance of top spawn, 15% each for sides
      const rand = Math.random();
      if (rand < 0.7) return patterns[0];
      else if (rand < 0.85) return patterns[1];
      else return patterns[2];
    };
    
    // Spawn interval for new food items - reduced spawn rate for slower game
    const spawnInterval = setInterval(() => {
      if (gameItems.current.length < 10 && foodItems.length > 0 && !gameEnded) {
        // Spawn 1-2 items at once occasionally
        const itemCount = Math.random() < 0.2 ? 2 : 1;
        
        for (let i = 0; i < itemCount; i++) {
          setTimeout(() => {
            if (!gameEnded) spawnFoodItem(getSpawnLocation());
          }, i * 350); // Increased delay between spawns (from 250 to 350)
        }
      }
    }, 2000); // Further increased from 1400 to 2000ms for even slower spawn rate
    
    // Animation loop
    const animate = () => {
      if (gameEnded) {
        cancelAnimationFrame(animationFrameId.current);
        return;
      }
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Draw background pattern
      drawBackground(ctx, canvas);
      
      // Draw slicing path if active
      if (slicePathRef.current && isMouseDown.current) {
        drawSlicePath(ctx, slicePathRef.current);
      }
      
      // Update and draw food items
      for (let i = gameItems.current.length - 1; i >= 0; i--) {
        const item = gameItems.current[i];
        
        // Update position with velocity
        item.x += item.vx * 0.6; // Reduced speed further from 0.8 to 0.6 (40% slower)
        item.y += item.vy * 0.6; // Reduced speed further from 0.8 to 0.6 (40% slower)
        item.vy += 0.08; // Reduced gravity from 0.12 to 0.08
        
        // Add rotation for flying effect
        item.rotation += item.rotationSpeed;
        
        // Check if out of bounds
        if (item.y > canvas.height + 100 || 
            item.x < -100 || 
            item.x > canvas.width + 100) {
          gameItems.current.splice(i, 1);
          continue;
        }
        
        // Draw food item
        drawFoodItem(ctx, item);
      }
      
      // Update and draw slice effects
      for (let i = sliceEffects.current.length - 1; i >= 0; i--) {
        const effect = sliceEffects.current[i];
        effect.life -= 1;
        
        if (effect.life <= 0) {
          sliceEffects.current.splice(i, 1);
          continue;
        }
        
        drawSliceEffect(ctx, effect);
      }
      
      // Update and draw particles
      for (let i = particles.current.length - 1; i >= 0; i--) {
        const particle = particles.current[i];
        particle.life -= 1;
        
        if (particle.life <= 0) {
          particles.current.splice(i, 1);
          continue;
        }
        
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.1; // gravity
        particle.size *= 0.95;
        
        drawParticle(ctx, particle);
      }
      
      // Draw combo notification if active
      if (showCombo && comboCount > 1) {
        drawComboText(ctx, comboCount);
      }
      
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      clearInterval(spawnInterval);
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', resizeCanvas);
      
      if (comboTimer.current) {
        clearTimeout(comboTimer.current);
      }
    };
  }, [canvasRef, gameEnded, foodItems]);
  
  // Game timer
  useEffect(() => {
    if (timeLeft > 0 && !gameEnded) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !gameEnded) {
      endGame('timeout');
    }
  }, [timeLeft, gameEnded]);
  
  // End game function - modified to include reason and show results
  const endGame = async (reason: 'timeout' | 'wrong_slices' = 'timeout') => {
    setGameEnded(true);
    setShowResults(true);
    
    // Save game result
    const gameResult = {
      childId,
      score,
      safeItemsSliced,
      allergenItemsSliced,
      totalItemsSliced,
      timestamp: new Date().toISOString()
    };
    
    // Add to store
    addGameResult(gameResult);
    
    // Save to database
    try {
      await saveGameResult(gameResult);
    } catch (error) {
      console.error('Error saving game result:', error);
    }
  };
  
  // Draw background pattern
  const drawBackground = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    
    const gridSize = 30;
    
    for (let x = 0; x < canvas.width; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }
    
    for (let y = 0; y < canvas.height; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  };
  
  // Draw combo text
  const drawComboText = (ctx: CanvasRenderingContext2D, count: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    ctx.save();
    
    const x = canvas.width / 2;
    const y = canvas.height / 2 - 50;
    
    ctx.font = 'bold 36px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // Draw text shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillText(`${count}x COMBO!`, x + 2, y + 2);
    
    // Draw text
    const gradient = ctx.createLinearGradient(x - 100, y - 20, x + 100, y + 20);
    gradient.addColorStop(0, '#ffdf22');
    gradient.addColorStop(1, '#ff9900');
    ctx.fillStyle = gradient;
    ctx.fillText(`${count}x COMBO!`, x, y);
    
    ctx.restore();
  };
  
  // Food item object type
  type FoodObject = {
    id: string;
    food: typeof foodItems[0];
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    rotation: number;
    rotationSpeed: number;
    isAllergen: boolean;
    sliced: boolean;
    slicedDirection?: number;
    halfOffset?: number;
  };
  
  // Slicing effect type
  type SliceEffect = {
    x: number;
    y: number;
    length: number;
    angle: number;
    color: string;
    life: number;
  };
  
  // Particle type
  type Particle = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    life: number;
  };
  
  // Slice path type
  type SlicePath = {
    points: { x: number; y: number }[];
    maxPoints: number;
  };
  
  // Create a slice path
  const createSlicePath = (): SlicePath => {
    return {
      points: [],
      maxPoints: 10 // Keep last 10 points
    };
  };
  
  // Draw slice path
  const drawSlicePath = (ctx: CanvasRenderingContext2D, path: SlicePath) => {
    if (path.points.length < 2) return;
    
    ctx.save();
    
    // Draw trail
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 3;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    ctx.beginPath();
    ctx.moveTo(path.points[0].x, path.points[0].y);
    
    for (let i = 1; i < path.points.length; i++) {
      ctx.lineTo(path.points[i].x, path.points[i].y);
    }
    
    ctx.stroke();
    
    // Draw glow effect
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 8;
    ctx.stroke();
    
    ctx.restore();
  };
  
  // Spawn a new food item
  const spawnFoodItem = (spawnPattern: { x: number, y: number, vx: number, vy: number }) => {
    if (foodItems.length === 0) return;
    
    // Pick random food from available items
    const randomIndex = Math.floor(Math.random() * foodItems.length);
    const food = foodItems[randomIndex];
    
    // Check if this food has any allergens that the child is allergic to
    const isAllergen = containsAllergen(food);
    
    const size = 1.5 + Math.random() * 0.5; // Increased size from 0.8 to 1.5 (nearly double)
    
    gameItems.current.push({
      id: uuidv4(),
      food,
      x: spawnPattern.x,
      y: spawnPattern.y,
      vx: spawnPattern.vx,
      vy: spawnPattern.vy,
      size,
      rotation: Math.random() * Math.PI * 2,
      rotationSpeed: (Math.random() - 0.5) * 0.04, // Reduced rotation speed from 0.06 to 0.04
      isAllergen,
      sliced: false
    });
  };
  
  // Create slice effect
  const createSliceEffect = (x: number, y: number, angle: number, color: string) => {
    const effect: SliceEffect = {
      x,
      y,
      length: 50 + Math.random() * 20,
      angle,
      color,
      life: 10
    };
    
    sliceEffects.current.push(effect);
  };
  
  // Create particles
  const createParticles = (x: number, y: number, color: string, count: number) => {
    for (let i = 0; i < count; i++) {
      const particle: Particle = {
        x,
        y,
        vx: (Math.random() - 0.5) * 5,
        vy: (Math.random() - 0.5) * 5 - 2,
        size: Math.random() * 5 + 2,
        color,
        life: Math.random() * 20 + 10
      };
      
      particles.current.push(particle);
    }
  };
  
  // Draw a food item on the canvas
  const drawFoodItem = (ctx: CanvasRenderingContext2D, item: FoodObject) => {
    ctx.save();
    
    // If the item is sliced, draw two halves
    if (item.sliced) {
      const offset = item.halfOffset || 8; // Increased offset from 5 to 8 for better visual separation
      const direction = item.slicedDirection || 0;
      
      // Draw first half
      ctx.save();
      ctx.translate(item.x - Math.cos(direction) * offset, item.y - Math.sin(direction) * offset);
      ctx.rotate(item.rotation);
      
      // Draw half circle
      ctx.beginPath();
      ctx.arc(0, 0, item.size * 20, direction, direction + Math.PI, false); // Multiplied size by 20 to make items larger
      ctx.lineTo(0, 0);
      ctx.closePath();
      
      ctx.fillStyle = item.isAllergen ? '#FF4136' : '#2ECC40';
      ctx.fill();
      
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
      
      // Draw second half
      ctx.save();
      ctx.translate(item.x + Math.cos(direction) * offset, item.y + Math.sin(direction) * offset);
      ctx.rotate(item.rotation);
      
      // Draw half circle
      ctx.beginPath();
      ctx.arc(0, 0, item.size * 20, direction + Math.PI, direction + Math.PI * 2, false); // Multiplied size by 20
      ctx.lineTo(0, 0);
      ctx.closePath();
      
      ctx.fillStyle = item.isAllergen ? '#FF4136' : '#2ECC40';
      ctx.fill();
      
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.restore();
    } else {
      // Draw whole food item
      ctx.translate(item.x, item.y);
      ctx.rotate(item.rotation);
      
      // Draw the food shape
      ctx.beginPath();
      ctx.arc(0, 0, item.size * 20, 0, Math.PI * 2); // Multiplied size by 20 to make items larger
      ctx.fillStyle = item.isAllergen ? '#FF4136' : '#2ECC40';
      ctx.fill();
      
      // Add a border
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw food name
      ctx.fillStyle = 'white';
      ctx.font = `${Math.max(14, item.size * 6)}px Arial`; // Increased font size from 12 to 14 minimum
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(item.food.name, 0, 0);
    }
    
    ctx.restore();
  };
  
  // Draw slice effect
  const drawSliceEffect = (ctx: CanvasRenderingContext2D, effect: SliceEffect) => {
    ctx.save();
    
    ctx.translate(effect.x, effect.y);
    ctx.rotate(effect.angle);
    
    // Draw line
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4 * (effect.life / 10);
    
    ctx.beginPath();
    ctx.moveTo(-effect.length / 2, 0);
    ctx.lineTo(effect.length / 2, 0);
    ctx.stroke();
    
    // Draw glow
    ctx.strokeStyle = effect.color;
    ctx.lineWidth = 10 * (effect.life / 10);
    ctx.globalAlpha = effect.life / 10 * 0.5;
    
    ctx.beginPath();
    ctx.moveTo(-effect.length / 2, 0);
    ctx.lineTo(effect.length / 2, 0);
    ctx.stroke();
    
    ctx.restore();
  };
  
  // Draw particle
  const drawParticle = (ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save();
    
    ctx.globalAlpha = particle.life / 30;
    ctx.fillStyle = particle.color;
    
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  };
  
  // Modified check slice collisions function
  const checkSliceCollisions = (path: SlicePath) => {
    if (path.points.length < 2) return;
    
    const startPoint = path.points[path.points.length - 2];
    const endPoint = path.points[path.points.length - 1];
    
    let slicedCount = 0;
    
    // Calculate slice direction
    const angle = Math.atan2(endPoint.y - startPoint.y, endPoint.x - startPoint.x);
    
    // Check each food item
    for (let i = gameItems.current.length - 1; i >= 0; i--) {
      const item = gameItems.current[i];
      
      // Skip already sliced items
      if (item.sliced) continue;
      
      // Calculate distance from slice line to food center
      const x1 = startPoint.x;
      const y1 = startPoint.y;
      const x2 = endPoint.x;
      const y2 = endPoint.y;
      const x0 = item.x;
      const y0 = item.y;
      
      // Line segment to point distance formula
      const lineLength = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
      
      if (lineLength === 0) continue;
      
      const t = Math.max(0, Math.min(1, ((x0 - x1) * (x2 - x1) + (y0 - y1) * (y2 - y1)) / (lineLength ** 2)));
      const projX = x1 + t * (x2 - x1);
      const projY = y1 + t * (y2 - y1);
      
      const distance = Math.sqrt((x0 - projX) ** 2 + (y0 - projY) ** 2);
      
      // Check if the slice is within the food item (increased hitbox for easier slicing)
      if (distance <= item.size * 20 + 10) { // Added +10 to make hitbox larger and easier to hit
        // Item hit - slice it!
        item.sliced = true;
        item.slicedDirection = angle;
        item.halfOffset = 0;
        item.vx += Math.cos(angle) * 2;
        item.vy += Math.sin(angle) * 2;
        
        // Handle points based on allergen or safe food
        setTotalItemsSliced(prev => prev + 1);
        
        // Track this item for the end game summary
        setSlicedItems(prev => [...prev, {name: item.food.name, isAllergen: item.isAllergen}]);
        
        // Check if allergen or safe food
        if (item.isAllergen) {
          // Sliced an allergen - penalize!
          createSliceEffect(item.x, item.y, angle, '#ff4d4d');
          setScore(prev => Math.max(0, prev - 10));
          setAllergenItemsSliced(prev => prev + 1);
          setWrongSlices(prev => prev + 1);
          setComboCount(0);
          
          // Check if we've reached 3 wrong slices
          if (wrongSlices + 1 >= 3) {
            endGame('wrong_slices');
          }
        } else {
          // Sliced a safe food - reward!
          createSliceEffect(item.x, item.y, angle, '#4CAF50');
          setScore(prev => prev + (10 + Math.floor(comboCount / 3) * 5));
          setSafeItemsSliced(prev => prev + 1);
          
          // Update combo
          setComboCount(prev => prev + 1);
          setShowCombo(true);
          
          if (comboTimer.current) {
            clearTimeout(comboTimer.current);
          }
          
          comboTimer.current = setTimeout(() => {
            setShowCombo(false);
          }, 1000);
        }
        
        slicedCount++;
      }
    }
    
    return slicedCount;
  };
  
  // Mouse/Touch event handlers
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameEnded) return;
    
    // Start slicing
    isMouseDown.current = true;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Create a new slice path
    slicePathRef.current = createSlicePath();
    slicePathRef.current.points.push({ x, y });
    
    // Save last position
    lastMousePos.current = { x, y };
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMouseDown.current || gameEnded || !slicePathRef.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Add point to slice path
    slicePathRef.current.points.push({ x, y });
    
    // Limit the number of points
    if (slicePathRef.current.points.length > slicePathRef.current.maxPoints) {
      slicePathRef.current.points.shift();
    }
    
    // Check for collisions
    checkSliceCollisions(slicePathRef.current);
    
    // Save last position
    lastMousePos.current = { x, y };
  };
  
  const handleMouseUp = () => {
    isMouseDown.current = false;
    slicePathRef.current = null;
  };
  
  const handleMouseLeave = () => {
    isMouseDown.current = false;
    slicePathRef.current = null;
  };
  
  // Touch event handlers (for mobile)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (gameEnded) return;
    
    e.preventDefault(); // Prevent scrolling
    
    // Start slicing
    isMouseDown.current = true;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Create a new slice path
    slicePathRef.current = createSlicePath();
    slicePathRef.current.points.push({ x, y });
    
    // Save last position
    lastMousePos.current = { x, y };
  };
  
  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isMouseDown.current || gameEnded || !slicePathRef.current) return;
    
    e.preventDefault(); // Prevent scrolling
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    // Add point to slice path
    slicePathRef.current.points.push({ x, y });
    
    // Limit the number of points
    if (slicePathRef.current.points.length > slicePathRef.current.maxPoints) {
      slicePathRef.current.points.shift();
    }
    
    // Check for collisions
    checkSliceCollisions(slicePathRef.current);
    
    // Save last position
    lastMousePos.current = { x, y };
  };
  
  const handleTouchEnd = () => {
    isMouseDown.current = false;
    slicePathRef.current = null;
  };

  // Add results summary component
  const ResultsSummary = () => {
    const allergyName = "Milk"; // For now, focusing on milk allergy
    
    // Group items by name and count them
    const itemCounts: Record<string, {correct: number, incorrect: number}> = {};
    
    slicedItems.forEach(item => {
      if (!itemCounts[item.name]) {
        itemCounts[item.name] = {correct: 0, incorrect: 0};
      }
      
      if (item.isAllergen) {
        // Incorrectly sliced allergen
        itemCounts[item.name].incorrect++;
      } else {
        // Correctly sliced safe food
        itemCounts[item.name].correct++;
      }
    });
    
    return (
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-10 p-4">
        <div className="bg-slate-800 rounded-lg p-6 w-full max-w-xl text-white">
          <h2 className="text-xl font-bold mb-4 text-center">Game Over!</h2>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-slate-700 p-3 rounded">
              <p className="text-center">Score</p>
              <p className="text-2xl font-bold text-center">{score}</p>
            </div>
            <div className="bg-slate-700 p-3 rounded">
              <p className="text-center">Time</p>
              <p className="text-2xl font-bold text-center">{30 - timeLeft}s</p>
            </div>
          </div>
          
          <div className="mb-4">
            <h3 className="font-semibold mb-2">Game Summary:</h3>
            <p>Player with <span className="text-red-400 font-semibold">{allergyName}</span> allergy</p>
            <p>Safe items sliced: {safeItemsSliced}</p>
            <p>Allergen items incorrectly sliced: {allergenItemsSliced}</p>
          </div>
          
          {Object.keys(itemCounts).length > 0 && (
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Foods Sliced:</h3>
              <div className="max-h-40 overflow-y-auto pr-2">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="text-left">Food</th>
                      <th className="text-center">Status</th>
                      <th className="text-center">Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(itemCounts).map(([name, counts]) => (
                      <tr key={name} className="border-t border-slate-700">
                        <td className="py-1">{name}</td>
                        <td className="text-center">
                          {counts.incorrect > 0 ? (
                            <span className="text-red-400">Allergen</span>
                          ) : (
                            <span className="text-green-400">Safe</span>
                          )}
                        </td>
                        <td className="text-center">{counts.correct + counts.incorrect}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          <div className="flex justify-center mt-4">
            <button
              onClick={onGameEnd}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-2 h-[500px] relative overflow-hidden">
      {/* Game UI overlay */}
      <div className="absolute top-0 left-0 right-0 z-10 flex justify-between items-center p-3 bg-gradient-to-b from-slate-900/70 to-transparent text-white">
        <div>
          <div className="text-lg font-bold">Score: {score}</div>
          <div className="text-sm">Safe: {safeItemsSliced} | Allergens: {allergenItemsSliced}</div>
        </div>
        <div>
          <div className="text-lg font-bold">Time: {timeLeft}s</div>
          <div className="text-sm">Wrong Slices: {wrongSlices}/3</div>
        </div>
      </div>
      
      {/* Game canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full rounded cursor-pointer"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      />
      
      {/* Results overlay */}
      {showResults && <ResultsSummary />}
    </div>
  );
} 