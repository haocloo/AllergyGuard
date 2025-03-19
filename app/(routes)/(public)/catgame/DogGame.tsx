'use client';
import React, { useState, useEffect, Component } from 'react';
import dynamic from 'next/dynamic';

// Import the Three.js components dynamically to ensure they only load on the client
const DynamicDogGameContent = dynamic(() => import('./DogGameContent'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full w-full">
      <div className="text-xl animate-pulse">Initializing 3D environment...</div>
    </div>
  ),
});

// This component will only be rendered on the client side
function ClientOnly({ children }: { children: React.ReactNode }) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
}

// Error boundary component to catch and display any errors in the Three.js code
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: Error): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Three.js error:', error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center text-center p-4">
          <div>
            <h2 className="text-2xl font-bold text-red-500 mb-2">Something went wrong</h2>
            <p className="mb-4">
              There was an error loading the 3D dog game. This could be due to browser compatibility
              or WebGL support issues.
            </p>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Export a dynamic component that will only render on the client
export default function DogGame() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <ClientOnly>
        <ErrorBoundary>
          <DynamicDogGameContent />
        </ErrorBoundary>
      </ClientOnly>
    </div>
  );
}
