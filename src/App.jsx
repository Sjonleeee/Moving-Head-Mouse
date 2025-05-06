import React, { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import * as THREE from 'three';

const Model = ({ mousePosition }) => {
  const { scene } = useGLTF('/src/assets/character.glb', (gltf) => {
    console.log('Model loaded successfully:', gltf);
  }, (error) => {
    console.error('Error loading model:', error);
  });
  
  const headRef = useRef();
  const { camera } = useThree();

  useFrame(() => {
    if (headRef.current) {
      // Create a plane at the model's position
      const plane = new THREE.Plane();
      const normal = new THREE.Vector3();
      const intersectionPoint = new THREE.Vector3();
      
      // Set up the plane
      normal.copy(camera.position).normalize();
      plane.setFromNormalAndCoplanarPoint(normal, scene.position);
      
      // Create raycaster
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mousePosition, camera);
      
      // Get intersection point
      raycaster.ray.intersectPlane(plane, intersectionPoint);
      
      // Make head look at the intersection point
      headRef.current.lookAt(intersectionPoint.x, intersectionPoint.y, 2);
    }
  });

  // Set up model and its parts
  React.useEffect(() => {
    if (scene) {
      console.log('Scene loaded, available objects:', scene.children);
      scene.position.y -= 1;
      headRef.current = scene.getObjectByName('Head_3');
      console.log('Head found:', headRef.current);
    }
  }, [scene]);

  return <primitive object={scene} />;
};

const Scene = () => {
  const [mousePosition, setMousePosition] = useState(new THREE.Vector2());
  const cameraRef = useRef();
  const targetPosition = useRef(new THREE.Vector3(0, 1, 2.5));

  const handleMouseMove = (event) => {
    // Convert mouse position to normalized device coordinates (-1 to +1)
    const x = (event.clientX / window.innerWidth) * 2 - 1;
    const y = -(event.clientY / window.innerHeight) * 2 + 1;
    
    setMousePosition({ x, y });

    // Calculate camera offset based on mouse position
    // Multiply by 0.5 to make the movement more subtle
    const offsetX = x * 0.5;
    const offsetY = y * 0.3;
    
    // Update target position with smooth movement
    targetPosition.current.set(offsetX, 1 + offsetY, 2.5);
  };

  // Smooth camera movement
  useFrame(() => {
    if (cameraRef.current) {
      // Smoothly interpolate camera position
      cameraRef.current.position.lerp(targetPosition.current, 0.05);
      // Make camera look at the center
      cameraRef.current.lookAt(0, 1, 0);
    }
  });

  return (
    <Canvas
      camera={{ position: [0, 1, 2.5], fov: 45 }}
      onMouseMove={handleMouseMove}
    >
      <color attach="background" args={['#f0f0f0']} />
      <ambientLight intensity={1} />
      <directionalLight position={[0, 20, 20]} intensity={10} />
      <Suspense fallback={null}>
        <Model mousePosition={mousePosition} />
      </Suspense>
      <primitive ref={cameraRef} object={new THREE.Object3D()} />
    </Canvas>
  );
};

const App = () => {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Scene />
    </div>
  );
};

export default App;