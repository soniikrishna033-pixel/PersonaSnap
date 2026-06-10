export class BrainLogo {
  constructor(containerId, size = 45, interactive = true) {
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
      this.container.style.height = `auto`;
      this.container.style.position = 'relative';
      this.container.style.display = 'inline-block';
      this.container.style.verticalAlign = 'middle';
      this.container.style.filter = 'drop-shadow(0 0 20px rgba(124, 58, 237, 0.5))';

      this.scene = new THREE.Scene();
      this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
      this.camera.position.z = 10;

      this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
      this.renderer.setSize(size, size);
      this.renderer.domElement.style.width = '100%';
      this.renderer.domElement.style.height = 'auto';
      this.renderer.domElement.style.maxWidth = '100vw';
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.container.appendChild(this.renderer.domElement);

      this.createBrainMesh();
      this.setupLighting();

      this.baseSpeed = 0.01;
      this.currentSpeed = this.baseSpeed;
      this.targetSpeed = this.baseSpeed;

      if (this.interactive) {
        this.setupInteractions();
      }

      this.animate();
    } catch (e) {
      console.log('3D disabled');
    }
  }

  createBrainMesh() {
    // We use a custom shader material for the gradient and inner glow
    const vertexShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;
      
      // Simple noise function
      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
      vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
      
      float snoise(vec3 v) { 
        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

        vec3 i  = floor(v + dot(v, C.yyy) );
        vec3 x0 = v - i + dot(i, C.xxx) ;

        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min( g.xyz, l.zxy );
        vec3 i2 = max( g.xyz, l.zxy );

        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy;
        vec3 x3 = x0 - D.yyy;

        i = mod289(i); 
        vec4 p = permute( permute( permute( 
                   i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
                 + i.y + vec4(0.0, i1.y, i2.y, 1.0 )) 
                 + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

        float n_ = 0.142857142857; // 1.0/7.0
        vec3  ns = n_ * D.wyz - D.xzx;

        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_ );

        vec4 x = x_ *ns.x + ns.yyyy;
        vec4 y = y_ *ns.x + ns.yyyy;
        vec4 h = 1.0 - abs(x) - abs(y);

        vec4 b0 = vec4( x.xy, y.xy );
        vec4 b1 = vec4( x.zw, y.zw );

        vec4 s0 = floor(b0)*2.0 + 1.0;
        vec4 s1 = floor(b1)*2.0 + 1.0;
        vec4 sh = -step(h, vec4(0.0));

        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

        vec3 p0 = vec3(a0.xy,h.x);
        vec3 p1 = vec3(a0.zw,h.y);
        vec3 p2 = vec3(a1.xy,h.z);
        vec3 p3 = vec3(a1.zw,h.w);

        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;

        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), 
                                      dot(p2,x2), dot(p3,x3) ) );
      }

      void main() {
        vUv = uv;
        
        // Base sphere
        vec3 pos = position;
        
        // Create left/right hemisphere gap by squishing the middle
        float hemisphereGap = abs(pos.x);
        pos.x *= 1.0 + smoothstep(0.0, 0.5, hemisphereGap) * 0.2;
        pos.y *= 0.8; // squish slightly vertical
        pos.z *= 1.1; // elongated front/back

        // Apply noise displacement for wrinkles
        float noise = snoise(pos * 3.0) * 0.2;
        float noise2 = snoise(pos * 8.0) * 0.05;
        pos += normal * (noise + noise2);

        // Center indent (longitudinal fissure)
        float fissure = smoothstep(0.4, 0.0, abs(pos.x));
        pos -= normal * fissure * 0.5;

        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        vViewPosition = -mvPosition.xyz;
        vNormal = normalMatrix * normal;
        gl_Position = projectionMatrix * mvPosition;
      }
    `;

    const fragmentShader = `
      varying vec2 vUv;
      varying vec3 vNormal;
      varying vec3 vViewPosition;

      void main() {
        vec3 color1 = vec3(124.0/255.0, 58.0/255.0, 237.0/255.0); // Violet
        vec3 color2 = vec3(6.0/255.0, 182.0/255.0, 212.0/255.0); // Cyan

        // Gradient based on UV y and x
        vec3 color = mix(color1, color2, vUv.x + vUv.y * 0.5);

        // Basic lighting
        vec3 normal = normalize(vNormal);
        vec3 viewDir = normalize(vViewPosition);
        
        // Rim lighting (inner glow effect)
        float rim = 1.0 - max(dot(viewDir, normal), 0.0);
        rim = smoothstep(0.6, 1.0, rim);
        
        // Highlight
        vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
        float diffuse = max(dot(normal, lightDir), 0.0);
        
        vec3 finalColor = color * (diffuse * 0.8 + 0.2) + rim * color1;
        
        gl_FragColor = vec4(finalColor, 1.0);
      }
    `;

    const geometry = new THREE.SphereGeometry(3, 64, 64);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.scene.add(this.mesh);
  }

  setupLighting() {
    // Using shaders mostly, but let's add an ambient just in case we switch
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    this.scene.add(ambientLight);
  }

  setupInteractions() {
    this.container.addEventListener('mouseenter', () => {
      this.targetSpeed = this.baseSpeed * 2.5;
    });

    this.container.addEventListener('mouseleave', () => {
      this.targetSpeed = this.baseSpeed;
    });

    this.container.addEventListener('click', () => {
      this.currentSpeed = 0.5; // Quick spin
    });

    // Mobile gyro
    if (window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', (e) => {
        if (!e.gamma || !e.beta) return;
        // Subtle tilt
        const tiltX = e.beta * (Math.PI / 180);
        const tiltY = e.gamma * (Math.PI / 180);
        this.mesh.rotation.x = tiltX * 0.5;
      });
    }
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    // Smooth speed interpolation
    this.currentSpeed += (this.targetSpeed - this.currentSpeed) * 0.1;
    
    if (this.mesh) {
      this.mesh.rotation.y += this.currentSpeed;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Global initialization function
export function initBrainLogos() {
  document.querySelectorAll('.brain-logo-container').forEach(container => {
    const size = parseInt(container.getAttribute('data-size')) || 45;
    new BrainLogo(container.id, size);
  });
}
