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

    const particleCount = isTouchDevice ? 40 : 120;
    const particles = [];
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    const particleColors = new Float32Array(particleCount * 3);
    
    // Custom material to allow individual vertex colors (for pulsing)
    const particleMaterial = new THREE.PointsMaterial({
      size: 2.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      sizeAttenuation: true
    });

    const baseColor = new THREE.Color(0xffffff);

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * window.innerWidth - window.innerWidth / 2;
      const y = Math.random() * heroSection.clientHeight - heroSection.clientHeight / 2;
      const z = (Math.random() - 0.5) * 200;
      
      particlePositions[i * 3] = x;
      particlePositions[i * 3 + 1] = y;
      particlePositions[i * 3 + 2] = z;

      particleColors[i * 3] = baseColor.r;
      particleColors[i * 3 + 1] = baseColor.g;
      particleColors[i * 3 + 2] = baseColor.b;

      particles.push({
        x: x, y: y, z: z,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        baseX: x, baseY: y,
        isPulsing: false,
        pulseIntensity: 0
      });
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));
    
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Line setup
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.15
    });
    
    // Max lines = (n * (n-1)) / 2
    const maxLines = (particleCount * (particleCount - 1)) / 2;
    const linePositions = new Float32Array(maxLines * 6);
    const lineGeometry = new THREE.BufferGeometry();
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    
    const lineMesh = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lineMesh);

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
        
        // Basic movement
        p.x += p.vx;
        p.y += p.vy;

        // Bounce
        if (p.x > window.innerWidth / 2 || p.x < -window.innerWidth / 2) p.vx *= -1;
        if (p.y > heroSection.clientHeight / 2 || p.y < -heroSection.clientHeight / 2) p.vy *= -1;

        // Mouse repulsion
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx*dx + dy*dy);
        
        if (dist < 200) {
          const force = (200 - dist) / 200;
          p.x += (dx / dist) * force * 2;
          p.y += (dy / dist) * force * 2;
        }

        // Click shockwave
        if (clickActive) {
          const cdx = p.x - clickPos.x;
          const cdy = p.y - clickPos.y;
          const cdist = Math.sqrt(cdx*cdx + cdy*cdy);
          
          // If particle is near the expanding shockwave ring
          if (Math.abs(cdist - shockwaveRadius) < 50) {
            p.x += (cdx / cdist) * 5;
            p.y += (cdy / cdist) * 5;
          }
        }

        // Return to baseline gently
        p.x += (p.baseX - p.x) * 0.005;
        p.y += (p.baseY - p.y) * 0.005;

        positions[i * 3] = p.x;
        positions[i * 3 + 1] = p.y;
        positions[i * 3 + 2] = p.z;

        // Colors — blend between white and violet based on pulse intensity
        if (p.isPulsing && p.pulseIntensity > 0) {
          const t = p.pulseIntensity;
          colors[i * 3] = 1 - (1 - 0.48) * t;
          colors[i * 3 + 1] = 1 - (1 - 0.22) * t;
          colors[i * 3 + 2] = 1 - (1 - 0.93) * t;
        } else {
          colors[i * 3] = 1;
          colors[i * 3 + 1] = 1;
          colors[i * 3 + 2] = 1;
        }

        // Connections
        for (let j = i + 1; j < particleCount; j++) {
          const p2 = particles[j];
          const ddx = p.x - p2.x;
          const ddy = p.y - p2.y;
          const distance = Math.sqrt(ddx*ddx + ddy*ddy);

          if (distance < 150) {
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

      renderer.render(scene, camera);
    }

    animate();
  } catch (e) {
    console.log('3D disabled');
  }
}
