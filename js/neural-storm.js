export function initNeuralStorm() {
  const isMobile = window.innerWidth <= 768;
  const heroSection = document.querySelector('.hero');
  
  if (!heroSection) return;

  // Add Orbs for Layer 1
  const orb1 = document.createElement('div');
  orb1.className = 'aurora-orb orb-1';
  const orb2 = document.createElement('div');
  orb2.className = 'aurora-orb orb-2';
  const orb3 = document.createElement('div');
  orb3.className = 'aurora-orb orb-3';
  heroSection.appendChild(orb1);
  heroSection.appendChild(orb2);
  heroSection.appendChild(orb3);

  // Layer 3: Floating Symbols removed as requested


  // Layer 2: Three.js Network
  if (!window.THREE) return;
  const isMobileSize = window.innerWidth < 768;

  if (isMobileSize) {
    console.log('3D disabled on mobile');
    document.querySelector('.hero').style.background = `
      linear-gradient(
        135deg,
        #06060F 0%,
        #1a0533 50%,
        #06060F 100%
      )`;
    return;
  }
  
  const isTouchDevice = /Android|iPhone|iPad/i.test(navigator.userAgent) || isMobileSize;

  try {
    const container = document.createElement('div');
    container.id = 'neural-canvas-container';
    heroSection.appendChild(container);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    const canvasHeight = isTouchDevice ? window.innerHeight * 0.5 : heroSection.clientHeight;
    renderer.setSize(window.innerWidth, canvasHeight);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = 'auto';
    renderer.domElement.style.maxWidth = '100vw';
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    camera.position.z = 500;

    const brainGroup = new THREE.Group();
    scene.add(brainGroup);

    function generateBrainPoint() {
      let x, y, z;
      while (true) {
        // Tighter bounding box for denser look
        x = (Math.random() - 0.5) * 500; // width (X)
        y = (Math.random() - 0.5) * 400; // height (Y)
        z = (Math.random() - 0.5) * 550; // length (Z)
        
        let nx = x / 250;
        let ny = y / 200;
        let nz = z / 275;
        
        // Ellipsoid check (main cerebrum)
        let r2 = (nx*nx) + (ny*ny) + (nz*nz);
        
        // Cerebellum check (smaller sphere at bottom back)
        let cx = x / 100;
        let cy = (y + 150) / 80;
        let cz = (z + 180) / 100;
        let cr2 = (cx*cx) + (cy*cy) + (cz*cz);
        
        let isMain = r2 <= 1.0;
        let isCerebellum = cr2 <= 1.0;
        
        // Filter out if not in main brain or cerebellum
        if (!isMain && !isCerebellum) continue;
        
        // Longitudinal fissure (split hemispheres)
        if (Math.abs(nx) < 0.08 && isMain) continue;
        if (Math.abs(cx) < 0.05 && isCerebellum) continue;
        
        if (isMain) {
          // Flatten bottom of cerebrum
          if (ny < -0.3 && nz < 0.2) continue; 
          
          // Narrower front
          if (nz > 0.3 && Math.abs(nx) > (1.0 - 0.6 * nz)) continue;
          
          // Dip in middle top
          if (ny > 0.8 && Math.abs(nz) < 0.2) continue;
        }
        
        // Generate points mostly near the surface for a distinct shell shape
        // This makes it look more like the cortical surface
        if (isMain && Math.random() > 0.2 && r2 < 0.6) continue;
        
        return { x, y, z };
      }
    }

    // Increase particle count for denser brain
    const particleCount = isTouchDevice ? 300 : 800;
    const particles = [];
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    
    // Custom material
    const particleMaterial = new THREE.PointsMaterial({
      size: 2.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.9,
      sizeAttenuation: true
    });

    const baseColor = new THREE.Color(0xd946ef); // Fuchsia/Pink core color

    for (let i = 0; i < particleCount; i++) {
      const pt = generateBrainPoint();
      
      particlePositions[i * 3] = pt.x;
      particlePositions[i * 3 + 1] = pt.y;
      particlePositions[i * 3 + 2] = pt.z;

      particleColors[i * 3] = baseColor.r;
      particleColors[i * 3 + 1] = baseColor.g;
      particleColors[i * 3 + 2] = baseColor.b;

      particles.push({
        x: pt.x, y: pt.y, z: pt.z,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        vz: (Math.random() - 0.5) * 0.2,
        baseX: pt.x, baseY: pt.y, baseZ: pt.z,
        isPulsing: false,
        pulseIntensity: 0
      });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    brainGroup.add(particleSystem);

    // Line setup
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x8b5cf6, // Violet connections
      transparent: true,
      opacity: 0.10
    });
    
    // Max lines = (n * (n-1)) / 2
    const maxLines = (particleCount * (particleCount - 1)) / 2;
    const linePositions = new Float32Array(maxLines * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    
    const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    brainGroup.add(lineMesh);

    // Interaction variables
    const mouse = new THREE.Vector2(-9999, -9999);
    let isClicking = false;
    let clickPos = new THREE.Vector2();
    let clickTime = 0;

    container.addEventListener('mousemove', (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left - window.innerWidth / 2;
      mouse.y = -(e.clientY - rect.top) + heroSection.clientHeight / 2;
    });

    container.addEventListener('mouseleave', () => {
      mouse.x = -9999;
      mouse.y = -9999;
    });

    container.addEventListener('click', (e) => {
      if (isTouchDevice) return; // Handled by touchstart
      isClicking = true;
      clickTime = Date.now();
      const rect = container.getBoundingClientRect();
      clickPos.x = e.clientX - rect.left - window.innerWidth / 2;
      clickPos.y = -(e.clientY - rect.top) + canvasHeight / 2;

      createRipple(e.clientX, e.clientY);
    });

    function createRipple(clientX, clientY) {
      const rect = container.getBoundingClientRect();
      const ripple = document.createElement('div');
      ripple.className = 'neural-ripple';
      ripple.style.left = clientX - rect.left + 'px';
      ripple.style.top = clientY - rect.top + 'px';
      heroSection.appendChild(ripple);
      setTimeout(() => ripple.remove(), 1000);
    }

    // Touch & Gyro Support
    if (isTouchDevice) {
      container.addEventListener('touchstart', (e) => {
        isClicking = true;
        clickTime = Date.now();
        const rect = container.getBoundingClientRect();
        const touch = e.touches[0];
        clickPos.x = touch.clientX - rect.left - window.innerWidth / 2;
        clickPos.y = -(touch.clientY - rect.top) + canvasHeight / 2;
        createRipple(touch.clientX, touch.clientY);
      }, {passive: true});
      
      if (window.DeviceOrientationEvent) {
        window.addEventListener('deviceorientation', (e) => {
          if (!e.gamma || !e.beta) return;
          const tiltX = e.gamma * 2;
          const tiltY = e.beta * 2;
          camera.position.x += (tiltX - camera.position.x) * 0.05;
          camera.position.y += (-tiltY - camera.position.y) * 0.05;
          camera.lookAt(scene.position);
        });
      }
    }

    // Chain reaction pulse — neuron firing effect
    function triggerChainPulse(startIdx, depth = 0) {
      if (depth > 3) return; // Max cascade depth
      const p = particles[startIdx];
      p.isPulsing = true;
      p.pulseIntensity = 1 - (depth * 0.25);

      setTimeout(() => {
        p.isPulsing = false;
        p.pulseIntensity = 0;
      }, 500);

      // Find connected nodes and propagate
      if (depth < 3) {
        setTimeout(() => {
          for (let j = 0; j < particleCount; j++) {
            if (j === startIdx || particles[j].isPulsing) continue;
            const dx = p.x - particles[j].x;
            const dy = p.y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
              triggerChainPulse(j, depth + 1);
              break; // Only propagate to one connected node per level
            }
          }
        }, 120);
      }
    }

    setInterval(() => {
      const pIdx = Math.floor(Math.random() * particleCount);
      triggerChainPulse(pIdx, 0);
    }, 4000);

    window.addEventListener('resize', () => {
      if(!heroSection) return;
      const newHeight = isTouchDevice ? window.innerHeight * 0.5 : heroSection.clientHeight;
      camera.aspect = window.innerWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, newHeight);
    });

    function animate() {
      requestAnimationFrame(animate);

      const positions = particleSystem.geometry.attributes.position.array;
      const colors = particleSystem.geometry.attributes.color.array;
      let lineVertexIndex = 0;
      
      const now = Date.now();
      const clickAge = now - clickTime;
      const clickActive = isClicking && clickAge < 1000;
      const shockwaveRadius = clickActive ? (clickAge / 1000) * 400 : 0;

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        
        // Add slightly wobbly velocity
        p.vx += (Math.random() - 0.5) * 0.04;
        p.vy += (Math.random() - 0.5) * 0.04;
        p.vz += (Math.random() - 0.5) * 0.04;
        
        // Apply velocity
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz; // Ensure Z is also moving

        // Mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 150) {
          const force = (150 - dist) / 150;
          p.vx += (dx / dist) * force * 0.5;
          p.vy += (dy / dist) * force * 0.5;
        }

        // Click shockwave
        if (clickActive) {
          const cdx = p.x - clickPos.x;
          const cdy = p.y - clickPos.y;
          const cdist = Math.sqrt(cdx*cdx + cdy*cdy);
          
          if (Math.abs(cdist - shockwaveRadius) < 50) {
            p.vx += (cdx / cdist) * 2;
            p.vy += (cdy / cdist) * 2;
          }
        }

        // Return to baseline gently and apply friction
        p.vx += (p.baseX - p.x) * 0.02;
        p.vy += (p.baseY - p.y) * 0.02;
        p.vz += (p.baseZ - p.z) * 0.02;

        p.vx *= 0.9;
        p.vy *= 0.9;
        p.vz *= 0.9;

        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;

        // Colors — blend between base and bright cyan based on pulse intensity
        if (p.isPulsing && p.pulseIntensity > 0) {
          const t = p.pulseIntensity;
          colors[i * 3] = baseColor.r + (0 - baseColor.r) * t; // Blend to cyan (0, 1, 1)
          colors[i * 3 + 1] = baseColor.g + (1 - baseColor.g) * t;
          colors[i * 3 + 2] = baseColor.b + (1 - baseColor.b) * t;
        } else {
          colors[i * 3] = baseColor.r;
          colors[i * 3 + 1] = baseColor.g;
          colors[i * 3 + 2] = baseColor.b;
        }

        // Connections
        for (let j = i + 1; j < particleCount; j++) {
          const p2 = particles[j];
          const ddx = p.x - p2.x;
          const ddy = p.y - p2.y;
          const ddz = p.z - p2.z;
          const distance = Math.sqrt(ddx*ddx + ddy*ddy + ddz*ddz);

          // Reduced distance for denser connections
          if (distance < 50) {
            linePositions[lineVertexIndex++] = p.x;
            linePositions[lineVertexIndex++] = p.y;
            linePositions[lineVertexIndex++] = p.z;
            
            linePositions[lineVertexIndex++] = p2.x;
            linePositions[lineVertexIndex++] = p2.y;
            linePositions[lineVertexIndex++] = p2.z;
          }
        }
      }

      particleSystem.geometry.attributes.position.needsUpdate = true;
      particleSystem.geometry.attributes.color.needsUpdate = true;
      
      // Update lines
      lineMesh.geometry.setDrawRange(0, lineVertexIndex / 3);
      lineMesh.geometry.attributes.position.needsUpdate = true;

      // Rotate the entire brain group
      brainGroup.rotation.y += 0.002;

      renderer.render(scene, camera);
    }

    animate();
  } catch (e) {
    console.log('3D disabled');
  }
}
