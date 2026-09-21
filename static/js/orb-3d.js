/**
 * NEXORA AI — 3D Neural Orb Visualization
 * Lightweight Three.js implementation of an abstract AI neural sphere.
 * Auto-pauses when canvas is hidden to conserve GPU/battery.
 */

(function () {
  'use strict';

  const NexoraOrb = {
    scene: null,
    camera: null,
    renderer: null,
    orb: null,
    particles: null,
    animationId: null,
    canvas: null,
    clock: null,
    isActive: false,
    mouse: { x: 0, y: 0 },

    /**
     * Initialize the 3D orb on the given canvas element
     */
    init(canvasId) {
      this.canvas = document.getElementById(canvasId);
      if (!this.canvas || !window.THREE) {
        console.warn('[NexoraOrb] Canvas or Three.js not available.');
        return;
      }

      this.clock = new THREE.Clock();

      // Scene
      this.scene = new THREE.Scene();

      // Camera
      this.camera = new THREE.PerspectiveCamera(60, this.canvas.clientWidth / this.canvas.clientHeight, 0.1, 100);
      this.camera.position.z = 4;

      // Renderer
      this.renderer = new THREE.WebGLRenderer({
        canvas: this.canvas,
        antialias: true,
        alpha: true
      });
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
      this.renderer.setClearColor(0x000000, 0);

      // Lights
      const ambientLight = new THREE.AmbientLight(0x334466, 0.6);
      this.scene.add(ambientLight);

      const pointLight1 = new THREE.PointLight(0x00f0ff, 1.2, 20);
      pointLight1.position.set(3, 2, 4);
      this.scene.add(pointLight1);

      const pointLight2 = new THREE.PointLight(0x6366f1, 0.8, 20);
      pointLight2.position.set(-3, -2, 3);
      this.scene.add(pointLight2);

      // Core Orb — wireframe sphere with glowing material
      const orbGeometry = new THREE.IcosahedronGeometry(1.2, 3);
      const orbMaterial = new THREE.MeshPhongMaterial({
        color: 0x0a1628,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.15,
        wireframe: true,
        transparent: true,
        opacity: 0.55
      });
      this.orb = new THREE.Mesh(orbGeometry, orbMaterial);
      this.scene.add(this.orb);

      // Inner glow sphere
      const innerGeometry = new THREE.SphereGeometry(0.85, 24, 24);
      const innerMaterial = new THREE.MeshPhongMaterial({
        color: 0x06080e,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.08,
        transparent: true,
        opacity: 0.3
      });
      const innerSphere = new THREE.Mesh(innerGeometry, innerMaterial);
      this.scene.add(innerSphere);

      // Particle constellation
      this._createParticles();

      // Events
      window.addEventListener('resize', () => this._onResize());
      this.canvas.addEventListener('mousemove', (e) => {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        this.mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
      });

      this.start();
    },

    _createParticles() {
      const count = 120;
      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);

      for (let i = 0; i < count; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(2 * Math.random() - 1);
        const r = 1.8 + Math.random() * 2.2;

        positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
        positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
        positions[i * 3 + 2] = r * Math.cos(phi);

        // Random blue-cyan palette
        const isCyan = Math.random() > 0.5;
        colors[i * 3] = isCyan ? 0.0 : 0.39;
        colors[i * 3 + 1] = isCyan ? 0.94 : 0.4;
        colors[i * 3 + 2] = isCyan ? 1.0 : 0.95;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

      const material = new THREE.PointsMaterial({
        size: 0.03,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        sizeAttenuation: true
      });

      this.particles = new THREE.Points(geometry, material);
      this.scene.add(this.particles);
    },

    _onResize() {
      if (!this.canvas || !this.camera || !this.renderer) return;
      const w = this.canvas.clientWidth;
      const h = this.canvas.clientHeight;
      this.camera.aspect = w / h;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(w, h);
    },

    /**
     * Animation loop
     */
    _animate() {
      if (!this.isActive) return;
      this.animationId = requestAnimationFrame(() => this._animate());

      const elapsed = this.clock.getElapsedTime();

      // Slow organic rotation with mouse influence
      if (this.orb) {
        this.orb.rotation.y = elapsed * 0.15 + this.mouse.x * 0.3;
        this.orb.rotation.x = elapsed * 0.08 + this.mouse.y * 0.2;

        // Subtle breathing scale
        const breathe = 1 + Math.sin(elapsed * 0.8) * 0.03;
        this.orb.scale.set(breathe, breathe, breathe);

        // Pulsing emissive
        this.orb.material.emissiveIntensity = 0.12 + Math.sin(elapsed * 1.2) * 0.06;
      }

      if (this.particles) {
        this.particles.rotation.y = elapsed * 0.04;
        this.particles.rotation.x = elapsed * 0.02;
      }

      this.renderer.render(this.scene, this.camera);
    },

    start() {
      this.isActive = true;
      this._animate();
    },

    stop() {
      this.isActive = false;
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
    },

    /**
     * Destroy and clean up resources
     */
    destroy() {
      this.stop();
      if (this.renderer) {
        this.renderer.dispose();
      }
    }
  };

  window.NexoraOrb = NexoraOrb;
})();
