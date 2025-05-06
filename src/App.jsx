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

// New component for camera movement
const CameraController = ({ mousePosition }) => {
  const { camera } = useThree();

  useFrame(() => {
    // Smooth camera movement based on mouse position
    const targetX = mousePosition.x * 0.5; // Adjust these values to control movement range
    const targetY = mousePosition.y * 0.5;
    
    // Smoothly interpolate camera position
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    
    // Keep the camera looking at the center
    camera.lookAt(0, 0, 0);
  });

  return null;
};

const Scene = () => {
  const [mousePosition, setMousePosition] = useState(new THREE.Vector2());

  const handleMouseMove = (event) => {
    setMousePosition({
      x: (event.clientX / window.innerWidth) * 2 - 1,
      y: -(event.clientY / window.innerHeight) * 2 + 1
    });
  };

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
        <CameraController mousePosition={mousePosition} />
      </Suspense>
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