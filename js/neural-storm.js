export function initNeuralStorm() {
  const heroSection = document.querySelector('.hero');
  if (!heroSection) return;

  const canvas = document.createElement('canvas');
  canvas.id = 'neural-canvas';
  canvas.style.position = 'absolute';
  canvas.style.top = '0';
  canvas.style.left = '0';
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.style.zIndex = '0';
  canvas.style.pointerEvents = 'auto';
  
  // Append to particles background div or hero section
  const particlesBg = document.getElementById('particles');
  if (particlesBg) {
      particlesBg.appendChild(canvas);
  } else {
      heroSection.appendChild(canvas);
  }

  const ctx = canvas.getContext('2d');

  let width, height;
  let nodes = [];
  let pulses = [];
  
  const NODE_COUNT = 200;
  const CONNECT_DIST = 90;
  const MOUSE_RADIUS = 80;
  
  let mouse = { x: -1000, y: -1000, active: false };

  function resize() {
      // Use hero section bounds for the canvas size
      width = canvas.width = heroSection.clientWidth;
      height = canvas.height = heroSection.clientHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  heroSection.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
      mouse.active = true;
      
      // Randomly trigger extra pulses near mouse
      if (Math.random() < 0.1) {
          const nearbyNodes = nodes.filter(n => Math.hypot(n.x - mouse.x, n.y - mouse.y) < MOUSE_RADIUS);
          if (nearbyNodes.length >= 2) {
              const startNode = nearbyNodes[Math.floor(Math.random() * nearbyNodes.length)];
              triggerPulse(startNode);
          }
      }
  });

  heroSection.addEventListener('mouseleave', () => {
      mouse.active = false;
      mouse.x = -1000;
      mouse.y = -1000;
  });

  class Node {
      constructor() {
          this.initShape();
          this.baseX = this.x;
          this.baseY = this.y;
          
          this.vx = 0;
          this.vy = 0;
          
          this.color = Math.random() > 0.5 ? '#a855f7' : '#c4b5fd';
          this.baseSize = Math.random() * 1.5 + 0.5;
          this.size = this.baseSize;
          
          this.phase = Math.random() * Math.PI * 2;
          this.phaseSpeed = 0.02 + Math.random() * 0.02;
          
          this.flashTimer = 0;
          this.rippleTimer = 0;
      }

      initShape() {
          while (true) {
              let nx = (Math.random() * 2 - 1);
              let ny = (Math.random() * 2 - 1);
              
              let widthAtY = 1.0 - (ny + 1) * 0.2; 
              if (ny < -0.5) widthAtY = 1.0 - Math.abs(ny + 0.5) * 0.5; 
              
              if (Math.abs(nx) > widthAtY) continue;
              
              if (Math.abs(nx) < 0.05) {
                  if (Math.random() > 0.1) continue;
              }

              let r = Math.sqrt(nx*nx + ny*ny);
              if (r < 0.5 && Math.random() > 0.3) continue;

              let scale = Math.min(width, height) * 0.4;
              this.x = width / 2 + nx * scale;
              this.y = height / 2 + ny * scale;
              break;
          }
      }

      update(time, rotationAngle) {
          this.phase += this.phaseSpeed;
          
          let cx = width / 2;
          let cy = height / 2;
          let dx = this.baseX - cx;
          let dy = this.baseY - cy;
          
          let rx = dx * Math.cos(rotationAngle) - dy * Math.sin(rotationAngle);
          let ry = dx * Math.sin(rotationAngle) + dy * Math.cos(rotationAngle);
          
          let targetX = cx + rx + Math.sin(this.phase) * 5;
          let targetY = cy + ry + Math.cos(this.phase) * 5;

          let distToMouse = Math.hypot(this.x - mouse.x, this.y - mouse.y);
          if (mouse.active && distToMouse < MOUSE_RADIUS) {
              let force = (MOUSE_RADIUS - distToMouse) / MOUSE_RADIUS;
              targetX -= (mouse.x - this.x) * force * 0.2;
              targetY -= (mouse.y - this.y) * force * 0.2;
              
              if (this.rippleTimer <= 0) {
                  this.rippleTimer = 60;
              }
          }

          if (Math.random() < 0.001) this.flashTimer = 30;

          if (this.flashTimer > 0) this.flashTimer--;
          if (this.rippleTimer > 0) this.rippleTimer--;

          this.vx += (targetX - this.x) * 0.05;
          this.vy += (targetY - this.y) * 0.05;
          this.vx *= 0.8;
          this.vy *= 0.8;
          
          this.x += this.vx;
          this.y += this.vy;

          this.size = this.baseSize;
          if (this.flashTimer > 0) this.size += (this.flashTimer / 30) * 2;
          if (this.rippleTimer > 0) this.size += (this.rippleTimer / 60) * 3;
      }

      draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
          
          if (this.flashTimer > 0 || this.rippleTimer > 0) {
              ctx.fillStyle = '#ffffff';
              ctx.shadowBlur = 10;
              ctx.shadowColor = '#ffffff';
          } else {
              ctx.fillStyle = this.color;
              ctx.shadowBlur = 5;
              ctx.shadowColor = this.color;
          }
          
          ctx.fill();
          ctx.shadowBlur = 0; 
      }
  }

  class Pulse {
      constructor(startNode, endNode) {
          this.startNode = startNode;
          this.endNode = endNode;
          this.progress = 0;
          this.speed = 0.02 + Math.random() * 0.03;
      }

      update() {
          this.progress += this.speed;
          return this.progress >= 1;
      }

      draw() {
          let x = this.startNode.x + (this.endNode.x - this.startNode.x) * this.progress;
          let y = this.startNode.y + (this.endNode.y - this.startNode.y) * this.progress;
          
          ctx.beginPath();
          ctx.arc(x, y, 2, 0, Math.PI * 2);
          ctx.fillStyle = '#ffffff';
          ctx.shadowBlur = 8;
          ctx.shadowColor = '#ff77ff';
          ctx.fill();
          ctx.shadowBlur = 0;
      }
  }

  for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push(new Node());
  }

  nodes.forEach(node => {
      node.neighbors = [];
      nodes.forEach(other => {
          if (node !== other && Math.hypot(node.baseX - other.baseX, node.baseY - other.baseY) < CONNECT_DIST * 1.5) {
              node.neighbors.push(other);
          }
      });
  });

  function triggerPulse(startNode) {
      if (startNode.neighbors.length > 0) {
          const endNode = startNode.neighbors[Math.floor(Math.random() * startNode.neighbors.length)];
          pulses.push(new Pulse(startNode, endNode));
      }
  }

  function animate(time) {
      ctx.clearRect(0, 0, width, height);
      
      const rotationAngle = Math.sin(time * 0.0005) * 0.05;

      nodes.forEach(node => node.update(time, rotationAngle));

      if (Math.random() < 0.05) {
          triggerPulse(nodes[Math.floor(Math.random() * nodes.length)]);
      }

      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
              let n1 = nodes[i];
              let n2 = nodes[j];
              let dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
              
              if (dist < CONNECT_DIST) {
                  let alpha = 1 - (dist / CONNECT_DIST);
                  let isHovered = (n1.rippleTimer > 0 || n2.rippleTimer > 0);
                  
                  if (isHovered) {
                      ctx.strokeStyle = `rgba(255, 119, 255, ${alpha})`;
                      ctx.lineWidth = 1.5;
                  } else {
                      let gradient = ctx.createLinearGradient(n1.x, n1.y, n2.x, n2.y);
                      gradient.addColorStop(0, `rgba(168, 85, 247, ${alpha * 0.5})`);
                      gradient.addColorStop(1, `rgba(75, 0, 130, ${alpha * 0.5})`);
                      ctx.strokeStyle = gradient;
                      ctx.lineWidth = 0.5;
                  }
                  
                  ctx.beginPath();
                  ctx.moveTo(n1.x, n1.y);
                  ctx.lineTo(n2.x, n2.y);
                  ctx.stroke();
              }
          }
      }

      for (let i = pulses.length - 1; i >= 0; i--) {
          if (pulses[i].update()) {
              pulses.splice(i, 1);
          } else {
              pulses[i].draw();
          }
      }

      nodes.forEach(node => node.draw());

      requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
