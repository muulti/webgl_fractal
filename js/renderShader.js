import { getCanvas, makeGL, createProgram } from "./utils.js";
import { getShaderCode } from "./shaders.js";

(function () {

  const canvas = getCanvas(".renderCanvas", ".appContainer");
  const gl = makeGL(canvas);
  if (!gl) return;

  // Vertex shader
  const VS = `
    attribute vec2 a_position;
    varying vec2 v_pos;
    void main() {
      v_pos = a_position;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }
  `;

  // Pick fractal here:
  const FS = getShaderCode("mandelbrot");

  const prog = createProgram(gl, VS, FS);
  if (!prog) return;
  gl.useProgram(prog);

  // Fullscreen TRIANGLE geometry
  const buf = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]),
    gl.STATIC_DRAW
  );

  const aPos = gl.getAttribLocation(prog, "a_position");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  // Uniforms
  const uCenter  = gl.getUniformLocation(prog, "u_center");
  const uZoom    = gl.getUniformLocation(prog, "u_zoom");
  const uAspect  = gl.getUniformLocation(prog, "u_aspect");
  const uMaxIter = gl.getUniformLocation(prog, "u_maxIter");

  let centerX = 0, centerY = 0;
  let zoom = 2.5;

  gl.uniform1i(uMaxIter, 500);

  // Resize handler
  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const w = Math.floor(canvas.clientWidth * dpr);
    const h = Math.floor(canvas.clientHeight * dpr);

    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0,0,w,h);
    }
    gl.uniform1f(uAspect, w/h);
  }
  window.addEventListener("resize", resize);
  resize();

  // Interaction -------------------------------------------------------
  let dragging = false;
  let last = { x: 0, y: 0 };

  canvas.addEventListener("mousedown", e => {
    dragging = true;
    last = { x: e.clientX, y: e.clientY };
  });

  canvas.addEventListener("mouseup", () => dragging = false);

  canvas.addEventListener("mousemove", e => {
    if (!dragging) return;
    const dx = (e.clientX - last.x) / canvas.width * zoom * 8;
    const dy = (last.y - e.clientY) / canvas.height * zoom * 8;

    centerX -= dx;
    centerY -= dy;

    last = { x: e.clientX, y: e.clientY };
    draw();
  });

  canvas.addEventListener("wheel", e => {
    e.preventDefault();
    zoom *= (e.deltaY > 0 ? 1.01 : 0.99);
    zoom = Math.min(Math.max(zoom, 0.0000005), 30.0);
    draw();
  }, { passive: false });

  window.addEventListener("keydown", e => {
    if (e.key === "r") {
      centerX = 0; centerY = 0; zoom = 2.5;
      draw();
    }
  });

  // Render ------------------------------------------------------------
  function draw() {
    gl.uniform2f(uCenter, centerX, centerY);
    gl.uniform1f(uZoom, zoom);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  draw();

})();