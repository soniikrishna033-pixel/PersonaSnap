export class BrainLogo {
  constructor(containerId, size = 150, interactive = true) {
    if (window.innerWidth < 768) {
      console.log('3D disabled on mobile');
      return;
    }
    
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    try {
      this.size = size;
      this.interactive = interactive;
      this.container.style.width = `100%`;
      this.container.style.maxWidth = `${size}px`;
      this.container.style.height = `${size}px`;
      this.container.style.position = 'relative';
      this.container.style.display = 'inline-block';
      this.container.style.verticalAlign = 'middle';

      // --- 1. SCENE & CAMERA SETUP ---
      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(60, 1, 0.1, 1000);
      this.camera.position.set(0, 2, 8);

      this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      this.renderer.setSize(size, size);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      this.container.appendChild(this.renderer.domElement);

      // --- 2. LIGHTING (Neon Cyberpunk Aesthetics) ---
      const ambientLight = new THREE.AmbientLight(0x111122, 1.5);
      this.scene.add(ambientLight);

      const blueLight = new THREE.PointLight(0x00f0ff, 3, 15);
      blueLight.position.set(3, 3, 3);
      this.scene.add(blueLight);

      const violetLight = new THREE.PointLight(0xbd00ff, 3, 15);
      violetLight.position.set(-3, -2, -3);
      this.scene.add(violetLight);

      const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
      directionalLight.position.set(5, 10, 7);
      this.scene.add(directionalLight);

      // --- 3. CREATING THE BRAIN GROUP ---
      this.brainGroup = new THREE.Group();
      this.scene.add(this.brainGroup);

      // A. Fractured Geometric Purple/Metallic Plates
      const plateGeometry = new THREE.IcosahedronGeometry(3, 3); 
      const plateMaterial = new THREE.MeshStandardMaterial({
          color: 0x4a2e80,       // Deep purple
          metalness: 0.9,        // Highly metallic
          roughness: 0.2,        // Glossy smooth
          flatShading: true,     // Gives the fractured/geometric look
          bumpScale: 0.05
      });
      const brainPlates = new THREE.Mesh(plateGeometry, plateMaterial);
      this.brainGroup.add(brainPlates);

      // B. Glowing Neon Blue/Violet Fissures
      const fissureGeometry = new THREE.IcosahedronGeometry(3.02, 3);
      this.fissureMaterial = new THREE.MeshBasicMaterial({
          color: 0x00aaff,
          wireframe: true,
          transparent: true,
          opacity: 0.8
      });
      const brainFissures = new THREE.Mesh(fissureGeometry, this.fissureMaterial);
      this.brainGroup.add(brainFissures);

      // C. Temporal Region Mechanical Gear Cluster & Optical Sensor
      this.gearGroup = new THREE.Group();
      this.gearGroup.position.set(2, 0.5, 1.5); // Positioned at the temporal lobe
      this.gearGroup.rotation.y = Math.PI / 3;

      // Outer Gear Ring
      const gearGeo = new THREE.TorusGeometry(0.6, 0.1, 8, 24);
      const gearMat = new THREE.MeshStandardMaterial({ color: 0x8c8c9e, metalness: 1.0, roughness: 0.3 });
      this.gear = new THREE.Mesh(gearGeo, gearMat);
      this.gearGroup.add(this.gear);

      // Central Bright Optical Sensor (The "Eye")
      const sensorGeo = new THREE.CylinderGeometry(0.3, 0.3, 0.2, 32);
      sensorGeo.rotateX(Math.PI / 2);
      const sensorMat = new THREE.MeshBasicMaterial({ color: 0x00ffff }); // Bright Cyan core
      const opticalSensor = new THREE.Mesh(sensorGeo, sensorMat);
      opticalSensor.position.z = 0.05;
      this.gearGroup.add(opticalSensor);

      this.brainGroup.add(this.gearGroup);

      this.clock = new THREE.Clock();

      if (this.interactive) {
        this.setupInteractions();
      }

      this.animate();
    } catch (e) {
      console.log('3D disabled', e);
    }
  }

  setupInteractions() {
    this.container.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      this.brainGroup.rotation.x = y * 0.5;
      this.brainGroup.rotation.z = -x * 0.5;
    });

    this.container.addEventListener('mouseleave', () => {
      this.brainGroup.rotation.x = 0;
      this.brainGroup.rotation.z = 0;
    });
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    const elapsedTime = this.clock.getElapsedTime();

    // Slow 360-degree rotation on the vertical axis (Y-axis)
    this.brainGroup.rotation.y = elapsedTime * 0.15; 

    // Subtly pulsate the neon fissures to mimic electrical brain activity
    this.fissureMaterial.opacity = 0.5 + Math.sin(elapsedTime * 4) * 0.3;

    // Rotate the mechanical gear independently
    this.gear.rotation.z = elapsedTime * 0.5;

    this.renderer.render(this.scene, this.camera);
  }
}

// Global initialization function
export function initBrainLogos() {
  document.querySelectorAll('.brain-logo-container').forEach(container => {
    const size = parseInt(container.getAttribute('data-size')) || 150;
    new BrainLogo(container.id, size);
  });
}
