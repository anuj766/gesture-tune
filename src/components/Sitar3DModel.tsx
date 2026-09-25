'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

interface Sitar3DModelProps {
  modelPath?: string;
  activeNotesCount?: number;
}

export function Sitar3DModel({
  modelPath = '/classical_musical_instrument_-_sitar.glb',
  activeNotesCount = 0,
}: Sitar3DModelProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const pulseRef = useRef<number>(0);
  const pointLightRef = useRef<THREE.PointLight | null>(null);
  const haloMeshRef = useRef<THREE.Mesh | null>(null);

  useEffect(() => {
    if (activeNotesCount > 0) {
      pulseRef.current = 1.0;
    }
  }, [activeNotesCount]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let isSubscribed = true;

    // 1. Scene, Camera & WebGL Renderer Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 5.2);

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. High-Radiance Golden Lighting (Hero Aura Glow)
    const ambientLight = new THREE.AmbientLight(0xfff8e7, 2.2);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffd700, 3.5);
    dirLight1.position.set(5, 8, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x800f2f, 2.0);
    dirLight2.position.set(-5, -5, -3);
    scene.add(dirLight2);

    // Central Glowing Point Light
    const pointLight = new THREE.PointLight(0xfcd34d, 6.0, 15);
    pointLight.position.set(0, 0, 1.5);
    scene.add(pointLight);
    pointLightRef.current = pointLight;

    // 3. Glowing Radiant Aura Halo Sphere Mesh Behind Sitar
    const haloGeo = new THREE.SphereGeometry(2.4, 32, 32);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    const haloMesh = new THREE.Mesh(haloGeo, haloMat);
    scene.add(haloMesh);
    haloMeshRef.current = haloMesh;

    // Inner Glowing Ring Accent
    const ringGeo = new THREE.RingGeometry(1.6, 2.2, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xd4af37,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.position.z = -0.5;
    scene.add(ringMesh);

    // 4. Load User 3D GLTF Hero Model (/classical_musical_instrument_-_sitar.glb)
    const loader = new GLTFLoader();
    let modelNode: THREE.Object3D | null = null;

    loader.load(
      modelPath,
      (gltf) => {
        if (!isSubscribed) return;
        modelNode = gltf.scene;

        // Auto-center and scale model as HERO element
        const box = new THREE.Box3().setFromObject(modelNode);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        modelNode.position.sub(center);

        // HERO Model Scale (Significantly enlarged to dominate as centerpiece)
        const maxDim = Math.max(size.x, size.y, size.z);
        const scaleFactor = 6.8 / (maxDim || 1);
        modelNode.scale.set(scaleFactor, scaleFactor, scaleFactor);

        // Classic majestic sitar tilt pose
        modelNode.rotation.z = Math.PI * 0.14;

        scene.add(modelNode);
      },
      undefined,
      (err) => {
        console.error('Error loading 3D sitar model:', err);
      }
    );

    // 5. Animation Frame Loop (Slow Floating & Glowing Pulse)
    let animFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      if (!isSubscribed) return;
      animFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Slow Elegant 3D Rotation & Slow Floating Motion
      if (modelNode) {
        modelNode.rotation.y = elapsedTime * 0.14; // Majestic slow rotation
        modelNode.position.y = Math.sin(elapsedTime * 0.7) * 0.28; // Slow floating bobbing
      }

      // Rotate Background Glowing Ring Accent
      ringMesh.rotation.z = -elapsedTime * 0.08;

      // Decay string hit aura pulse
      pulseRef.current = Math.max(0, pulseRef.current - 0.03);

      if (pointLightRef.current) {
        pointLightRef.current.intensity = 6.0 + pulseRef.current * 10.0;
      }

      if (haloMeshRef.current) {
        haloMeshRef.current.scale.setScalar(1.0 + pulseRef.current * 0.3);
        (haloMeshRef.current.material as THREE.MeshBasicMaterial).opacity =
          0.22 + pulseRef.current * 0.35 + Math.sin(elapsedTime * 2) * 0.05;
      }

      renderer.render(scene, camera);
    };

    animate();

    // 6. Window Resize Handler
    const handleResize = () => {
      if (!container || !isSubscribed) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      isSubscribed = false;
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [modelPath]);

  return <div ref={mountRef} className="w-full h-full block pointer-events-none" />;
}
