import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ParticleBackground = () => {
    const containerRef = useRef();
    
    useEffect(() => {
        // Scene setup
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        containerRef.current.appendChild(renderer.domElement);

        // Create particles
        const particlesGeometry = new THREE.BufferGeometry();
        const particlesCount = 5000;
        const posArray = new Float32Array(particlesCount * 3);

        // Fill with random positions
        for(let i = 0; i < particlesCount * 3; i++) {
            posArray[i] = (Math.random() - 0.5) * 5;
        }
        particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

        // Create material
        const particlesMaterial = new THREE.PointsMaterial({
            size: 0.005,
            color: '#3b82f6',
            transparent: true,
            blending: THREE.AdditiveBlending
        });

        // Create mesh
        const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
        scene.add(particlesMesh);
        camera.position.z = 2;

        // Animation
        const animate = () => {
            requestAnimationFrame(animate);
            particlesMesh.rotation.x += 0.0005;
            particlesMesh.rotation.y += 0.0005;
            renderer.render(scene, camera);
        };

        // Handle resize
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };

        window.addEventListener('resize', handleResize);
        animate();

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            containerRef.current?.removeChild(renderer.domElement);
        };
    }, []);

    return (
        <div 
            ref={containerRef} 
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1
            }}
        />
    );
};

export default ParticleBackground;