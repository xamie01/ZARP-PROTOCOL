import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useMousePosition } from "@/hooks/useMousePosition";

export default function ShieldSphere() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mousePos = useMousePosition(0.05);
  const sphereRef = useRef<THREE.Mesh | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Icosahedron geometry - the shield sphere
    const isMobile = window.innerWidth < 768;
    const radius = isMobile ? 0.9 : 1.2;
    const geometry = new THREE.IcosahedronGeometry(radius, 2);
    const material = new THREE.MeshBasicMaterial({
      color: 0xffd100,
      wireframe: true,
      transparent: true,
      opacity: 0.7,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    sphereRef.current = mesh;

    // Animation loop
    const animate = () => {
      if (sphereRef.current) {
        // Auto-rotation
        sphereRef.current.rotation.y += isMobile ? 0.003 : 0.002;
        // Mouse parallax
        sphereRef.current.position.x = mousePos.x * 0.3;
        sphereRef.current.position.y = -mousePos.y * 0.3;
      }
      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);

    // Resize handler
    const handleResize = () => {
      if (!container || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // Entrance animation
    container.style.opacity = "0";
    container.style.transition = "opacity 1000ms cubic-bezier(0.16, 1, 0.3, 1)";
    requestAnimationFrame(() => {
      container.style.opacity = "1";
    });

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", handleResize);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [mousePos.x, mousePos.y]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 z-0 flex items-center justify-center"
    />
  );
}
