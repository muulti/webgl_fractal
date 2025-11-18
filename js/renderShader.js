import { getShaderCode } from './shaders/mandlebrot.js';

(function(){
  // get the html canvas element
  const canvas = document.querySelector('.canvasContainer .renderCanvas') || (() => {
    const c = document.createElement('canvas');
    c.className = 'renderCanvas';
    document.querySelector('.canvasContainer').appendChild(c);
    return c;
  })();

  const gl = canvas.getContext('webgl');
  if(!gl) { console.error('WebGL not supported'); return; }

  // inline vert (for now i think)
  const vs = `
    attribute vec2 a_position;
    varying vec2 v_pos;
    void main() {
        v_pos = a_position;               
        gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  // Fragment shader
  const fs = getShaderCode('mandelbrot');

  // Compilation & program creation
  //----------------------------------------------
  function compile(type, source){
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)){
      console.error(gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }
  function createProgram(vsSource, fsSource){
    const p = gl.createProgram();
    const vShader = compile(gl.VERTEX_SHADER, vsSource);
    const fShader = compile(gl.FRAGMENT_SHADER, fsSource);
    if(!vShader || !fShader) return null;
    gl.attachShader(p, vShader);
    gl.attachShader(p, fShader);
    gl.linkProgram(p);
    if(!gl.getProgramParameter(p, gl.LINK_STATUS)){
      console.error(gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  }

  const prog = createProgram(vs, fs);
  if(!prog) return;
  gl.useProgram(prog);
  //----------------------------------------------

  // Fullscreen quad
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1,-1,  1,-1,  -1,1,
    -1,1,   1,-1,   1,1
  ]), gl.STATIC_DRAW);

  const aLoc = gl.getAttribLocation(prog, 'a_position');
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

  // Send info to the shader proccess 
  const uCenter = gl.getUniformLocation(prog, 'u_center');
  const uZoom = gl.getUniformLocation(prog, 'u_zoom');
  const uMaxIter = gl.getUniformLocation(prog, 'u_maxIter');
  let centerX = 0, centerY = 0;
  let zoom = 2.5;

  gl.uniform2f(uCenter, centerX, centerY);
  gl.uniform1f(uZoom, zoom);
  gl.uniform1i(uMaxIter, 500);
  gl.uniform2f(uCenter, 0.0, 0.0);
  gl.uniform1f(uZoom, 2.5);
  gl.uniform1i(uMaxIter, 500);
  
  const uAspect = gl.getUniformLocation(prog, 'u_aspect');


    // Keep aspect ration constant
  function resize(){
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if (canvas.width !== w || canvas.height !== h)
    {
      canvas.width = w; 
      canvas.height = h;
      gl.viewport(0,0,w,h);
    }
    gl.uniform1f(uAspect, w/h);  
  }


  // Set default CSS size if not defined
  if(!canvas.style.height) canvas.style.height = '480px';
  if(!canvas.style.width) canvas.style.width = '100%';
  window.addEventListener('resize', resize);
  resize();


  // Zoom+Movement controls
  let isDragging = false;
  let lastMouse = {x:0, y:0};
  
  canvas.addEventListener('mousedown', e => { isDragging = true; lastMouse = {x:e.clientX, y:e.clientY}; });
  canvas.addEventListener('mouseup', () => { isDragging = false; });
  canvas.addEventListener('mousemove', e => {
    if(isDragging){
      const dx = (e.clientX - lastMouse.x) / canvas.width * zoom * 8;
      const dy = (lastMouse.y - e.clientY) / canvas.height * zoom * 8;
      centerX -= dx;
      centerY -= dy;
      lastMouse = {x:e.clientX, y:e.clientY};
      draw();
    }
  });

  canvas.addEventListener("wheel", e => {
    e.preventDefault();   // stop page scroll
    const factor = e.deltaY > 0 ? 1.01 : 0.99;
    zoom *= factor;
    if (zoom < 0.0000005) zoom = 0.0000005;
    if (zoom > 30.00) zoom = 30.00;
    //console.log(zoom);
    draw();
  }, { passive: false });
  let moveSpeed = 0.1;

window.addEventListener('keydown', e => {
    if (e.key=="r") { centerX = 0; centerY = 0; zoom = 2.5; }
    draw();
});
  


  function draw(){
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    gl.uniform2f(uCenter, centerX, centerY);
    gl.uniform1f(uZoom, zoom);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  
  draw();
})();