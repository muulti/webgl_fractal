//WEBGL functions
export function getCanvas(selector, parentSelector) {
  let canvas = document.querySelector(selector);
  if (!canvas) {
    canvas = document.createElement("canvas");
    canvas.className = selector.replace(".", "");
    document.querySelector(parentSelector).appendChild(canvas);
  }
  return canvas;
}

export function makeGL(canvas) {
  const gl = canvas.getContext("webgl");
  if (!gl) {
    console.error("WebGL not supported");
    return null;
  }
  return gl;
}

export function compileShader(gl, type, src) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, src);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function createProgram(gl, vsSrc, fsSrc) {
  const vs = compileShader(gl, gl.VERTEX_SHADER, vsSrc);
  const fs = compileShader(gl, gl.FRAGMENT_SHADER, fsSrc);
  if (!vs || !fs) return null;

  const prog = gl.createProgram();
  gl.attachShader(prog, vs);
  gl.attachShader(prog, fs);
  gl.linkProgram(prog);

  if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
    console.error("Link error:", gl.getProgramInfoLog(prog));
    return null;
  }
  return prog;
}