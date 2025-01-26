import { useEffect, useRef } from "react";
import * as THREE from 'three';
import { BloomEffect, EffectComposer, RenderPass, EffectPass, SMAAEffect } from 'postprocessing';
import './Hyperspeed.css';

const Hyperspeed = ({ effectOptions }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const composerRef = useRef(null);
  const frameIdRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    cameraRef.current = camera;
    camera.position.z = 5;

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Create a simple plane geometry
    const geometry = new THREE.PlaneGeometry(10, 10);
    const material = new THREE.MeshBasicMaterial({ 
      color: 0x3b82f6,
      side: THREE.DoubleSide 
    });
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // Post processing
    const composer = new EffectComposer(renderer);
    composerRef.current = composer;

    const renderPass = new RenderPass(scene, camera);
    composer.addPass(renderPass);

    const bloomEffect = new BloomEffect();
    const smaaEffect = new SMAAEffect();
    const effectPass = new EffectPass(camera, bloomEffect, smaaEffect);
    composer.addPass(effectPass);

    // Handle resize
    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;

      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      renderer.setSize(width, height);
      composer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);

    // Animation
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      plane.rotation.x += 0.01;
      plane.rotation.y += 0.01;
      composer.render();
    };

    animate();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (frameIdRef.current) {
        cancelAnimationFrame(frameIdRef.current);
      }
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      composer.dispose();
    };
  }, [effectOptions]);

  return <div ref={containerRef} className="hyperspeed-container" />;
};

export default Hyperspeed;