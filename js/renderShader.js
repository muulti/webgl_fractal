// Minimal WebGL shader renderer — fullscreen color shifter
(function(){
  const canvas = document.querySelector('.canvasContainer .renderCanvas') || (() => {
    const c = document.createElement('canvas');
    c.className = 'renderCanvas';
    document.querySelector('.canvasContainer').appendChild(c);
    return c;
  })();

  const gl = canvas.getContext('webgl');
  if(!gl) { console.error('WebGL not supported'); return; }

  const vs = `
    attribute vec2 a;
    void main(){ gl_Position = vec4(a,0.,1.); }
  `;

  const fs = `
    precision mediump float;
    uniform vec2 u_res;
    uniform float u_time;
    void main(){
      vec2 uv = gl_FragCoord.xy / u_res;
      // simple animated color fields -> map from -1..1 to 0..1
      float r = sin(u_time + uv.x * 6.2831) * 0.5 + 0.5;
      float g = sin(u_time*1.3 + uv.y * 6.2831) * 0.5 + 0.5;
      float b = sin(u_time*0.7 + (uv.x+uv.y) * 3.14159) * 0.5 + 0.5;
      gl_FragColor = vec4(r,g,b,1.0);
    }
  `;

  function compile(t, src){
    const s = gl.createShader(t);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if(!gl.getShaderParameter(s, gl.COMPILE_STATUS)){
      console.error(gl.getShaderInfoLog(s));
      gl.deleteShader(s);
      return null;
    }
    return s;
  }

  function program(vsSrc, fsSrc){
    const p = gl.createProgram();
    const a = compile(gl.VERTEX_SHADER, vsSrc);
    const b = compile(gl.FRAGMENT_SHADER, fsSrc);
    if(!a || !b) return null;
    gl.attachShader(p, a);
    gl.attachShader(p, b);
    gl.linkProgram(p);
    if(!gl.getProgramParameter(p, gl.LINK_STATUS)){
      console.error(gl.getProgramInfoLog(p));
      return null;
    }
    return p;
  }

  const prog = program(vs, fs);
  if(!prog) return;
  gl.useProgram(prog);

  // fullscreen quad
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1,-1,  1,-1,  -1,1,
    -1,1,   1,-1,   1,1
  ]), gl.STATIC_DRAW);

  const aLoc = gl.getAttribLocation(prog, 'a');
  gl.enableVertexAttribArray(aLoc);
  gl.vertexAttribPointer(aLoc, 2, gl.FLOAT, false, 0, 0);

  const uRes = gl.getUniformLocation(prog, 'u_res');
  const uTime = gl.getUniformLocation(prog, 'u_time');

  // device-pixel handling
  function resize(){
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.floor(canvas.clientWidth * dpr));
    const h = Math.max(1, Math.floor(canvas.clientHeight * dpr));
    if(canvas.width !== w || canvas.height !== h){
      canvas.width = w; canvas.height = h;
      gl.viewport(0,0,w,h);
    }
    gl.uniform2f(uRes, canvas.width, canvas.height);
  }
  // ensure a visual size if CSS not set
  if(!canvas.style.height) canvas.style.height = '480px';
  if(!canvas.style.width) canvas.style.width = '100%';

  window.addEventListener('resize', resize);
  resize();

  let t0 = performance.now();
  let raf = null;
  function frame(now){
    const time = (now - t0) * 0.001;
    gl.uniform1f(uTime, time);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    raf = requestAnimationFrame(frame);
  }

  // expose simple controls
  window.shaderRenderer = {
    start(){ if(!raf){ t0 = performance.now(); raf = requestAnimationFrame(frame); } },
    stop(){ if(raf){ cancelAnimationFrame(raf); raf = null; } },
    resize: resize
  };

  // auto-start
  window.shaderRenderer.start();
})();