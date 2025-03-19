# Dog Game (Previously Cat Game)

This folder contains both the original cat game and the new dog game.

## How to Use

### Step 1: Download the Shiba 3D Model
1. Visit [Sketchfab](https://sketchfab.com/) and search for "Shiba" 3D models
2. Download a free Shiba model in GLTF format (the model mentioned in the tutorial is by user zixisun02)
3. Extract the downloaded files into the `public/shiba` directory
4. Ensure there is a `scene.gltf` file in the `public/shiba` directory

### Step 2: Run the Game
1. Start your Next.js development server with `npm run dev` or `bun run dev`
2. Navigate to the `/catgame` route in your browser to access the game

## Game Features
- Interactive 3D Shiba dog model
- Feed the dog bones (good) and chocolate (bad)
- Click on the dog to make it bark
- Press space to make the dog jump
- Health bar tracking dog's health status

## Implementation Details
- Uses React Three Fiber and Drei for 3D rendering
- Dynamically loads components on the client side only
- Implements proper loading states and error boundaries

## Switching Back to Cat Game
If you want to use the original cat game instead, modify the `page.tsx` file to import and use `CatGame` instead of `DogGame`.

## Credits
Original cat game created by the KitaHack2025 team.
Shiba implementation inspired by Valentina Garavaglia's tutorial on Medium. 