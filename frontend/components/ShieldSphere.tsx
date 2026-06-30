"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useMousePosition } from "@/hooks/useMousePosition";

export default function ShieldSphere() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePos = useMousePosition(0.04); // smooth inertia
  const mousePosRef = useRef(mousePos);
  const groupRef = useRef<THREE.Group | null>(null);
  const outerParticlesRef = useRef<THREE.Points | null>(null);
  const innerParticlesRef = useRef<THREE.Points | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rafRef = useRef<number>(0);

  // Sync mouse ref
  mousePosRef.current = mousePos;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 3.5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const isMobile = window.innerWidth < 768;
    const group = new THREE.Group();
    scene.add(group);
    groupRef.current = group;

    // Create a circular point texture using canvas
    const createCircleTexture = (colorStr: string) => {
      const canvas = document.createElement("canvas");
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const gradient = ctx.createRadialGradient(8, 8, 0, 8, 8, 8);
        gradient.addColorStop(0, colorStr);
        gradient.addColorStop(0.3, colorStr);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 16, 16);
      }
      const texture = new THREE.CanvasTexture(canvas);
      return texture;
    };

    // Outer Gold Particles
    const outerCount = isMobile ? 600 : 1200;
    const outerGeometry = new THREE.BufferGeometry();
    const outerPositions = new Float32Array(outerCount * 3);
    const outerOriginalPositions = new Float32Array(outerCount * 3);
    const outerSpeeds = new Float32Array(outerCount);

    const radiusOuter = isMobile ? 1.0 : 1.4;
    for (let i = 0; i < outerCount; i++) {
      // Golden spiral distribution / sphere distribution
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      const x = radiusOuter * Math.sin(phi) * Math.cos(theta);
      const y = radiusOuter * Math.sin(phi) * Math.sin(theta);
      const z = radiusOuter * Math.cos(phi);

      outerPositions[i * 3] = x;
      outerPositions[i * 3 + 1] = y;
      outerPositions[i * 3 + 2] = z;

      outerOriginalPositions[i * 3] = x;
      outerOriginalPositions[i * 3 + 1] = y;
      outerOriginalPositions[i * 3 + 2] = z;

      outerSpeeds[i] = 0.5 + Math.random() * 1.5;
    }

    outerGeometry.setAttribute("position", new THREE.BufferAttribute(outerPositions, 3));
    const outerMaterial = new THREE.PointsMaterial({
      size: isMobile ? 0.08 : 0.05,
      map: createCircleTexture("#FFD100"),
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const outerParticles = new THREE.Points(outerGeometry, outerMaterial);
    group.add(outerParticles);
    outerParticlesRef.current = outerParticles;

    // Inner Purple Particles (core density)
    const innerCount = isMobile ? 400 : 800;
    const innerGeometry = new THREE.BufferGeometry();
    const innerPositions = new Float32Array(innerCount * 3);
    const innerOriginalPositions = new Float32Array(innerCount * 3);

    const radiusInner = isMobile ? 0.6 : 0.8;
    for (let i = 0; i < innerCount; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      
      const x = radiusInner * Math.sin(phi) * Math.cos(theta);
      const y = radiusInner * Math.sin(phi) * Math.sin(theta);
      const z = radiusInner * Math.cos(phi);

      innerPositions[i * 3] = x;
      innerPositions[i * 3 + 1] = y;
      innerPositions[i * 3 + 2] = z;

      innerOriginalPositions[i * 3] = x;
      innerOriginalPositions[i * 3 + 1] = y;
      innerOriginalPositions[i * 3 + 2] = z;
    }

    innerGeometry.setAttribute("position", new THREE.BufferAttribute(innerPositions, 3));
    const innerMaterial = new THREE.PointsMaterial({
      size: isMobile ? 0.1 : 0.07,
      map: createCircleTexture("#5D5FEF"),
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const innerParticles = new THREE.Points(innerGeometry, innerMaterial);
    group.add(innerParticles);
    innerParticlesRef.current = innerParticles;

    let time = 0;
    const animate = () => {
      time += 0.005;

      // Rotate groups in opposite directions
      if (outerParticlesRef.current) {
        outerParticlesRef.current.rotation.y = time * 0.4;
        outerParticlesRef.current.rotation.x = time * 0.15;

        // Wave morphing on outer points
        const positions = outerParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < outerCount; i++) {
          const x = outerOriginalPositions[i * 3];
          const y = outerOriginalPositions[i * 3 + 1];
          const z = outerOriginalPositions[i * 3 + 2];
          
          // Noise wave scaling factor
          const wave = 1.0 + 0.08 * Math.sin(time * outerSpeeds[i] + x * 2.0 + y * 2.0);
          positions[i * 3] = x * wave;
          positions[i * 3 + 1] = y * wave;
          positions[i * 3 + 2] = z * wave;
        }
        outerParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      if (innerParticlesRef.current) {
        innerParticlesRef.current.rotation.y = -time * 0.6;
        innerParticlesRef.current.rotation.z = time * 0.2;

        const positions = innerParticlesRef.current.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < innerCount; i++) {
          const x = innerOriginalPositions[i * 3];
          const y = innerOriginalPositions[i * 3 + 1];
          const z = innerOriginalPositions[i * 3 + 2];
          
          // Morph inner points slightly
          const wave = 1.0 + 0.05 * Math.cos(time * 2.0 + z * 3.0);
          positions[i * 3] = x * wave;
          positions[i * 3 + 1] = y * wave;
          positions[i * 3 + 2] = z * wave;
        }
        innerParticlesRef.current.geometry.attributes.position.needsUpdate = true;
      }

      // Dynamic cursor reactivity (inertia tracking mouse)
      if (groupRef.current) {
        // Slow float inertia towards target cursor offset
        const targetX = mousePosRef.current.x * 0.8;
        const targetY = -mousePosRef.current.y * 0.8;
        
        groupRef.current.position.x += (targetX - groupRef.current.position.x) * 0.05;
        groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.05;

        // Subtle tilt
        groupRef.current.rotation.x += (targetY * 0.3 - groupRef.current.rotation.x) * 0.05;
        groupRef.current.rotation.y += (targetX * 0.3 - groupRef.current.rotation.y) * 0.05;
      }

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Initial entrance animation
    container.style.opacity = "0";
    container.style.transition = "opacity 1200ms cubic-bezier(0.16, 1, 0.3, 1)";
    requestAnimationFrame(() => {
      container.style.opacity = "1";
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
      outerGeometry.dispose();
      outerMaterial.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none"
    />
  );
}
