// ---------------------------------------------
// INLINE SHADER LIBRARY
// ---------------------------------------------

// Mandelbrot
const SHADER_MANDELBROT = `
    precision highp float;
    varying vec2 v_pos;

    uniform vec2 u_center;
    uniform float u_zoom;
    uniform int u_maxIter;
    uniform float u_aspect;  // new

    void main() {
        // scale x by aspect to avoid stretching
        float x0 = v_pos.x * u_zoom * u_aspect + u_center.x;
        float y0 = v_pos.y * u_zoom + u_center.y;

        float x = 0.0;
        float y = 0.0;
        float iteration = 0.0;

        for(int i = 0; i < 500; i++) {
            if(x*x + y*y > 4.0) break;
            float xtemp = x*x - y*y + x0;
            y = 2.0*x*y + y0;
            x = xtemp;
            iteration += 1.0;
        }

        float color = iteration / float(u_maxIter);
        gl_FragColor = vec4(color, color*0.7, color, 1.0);
    }
    `;

// Burning Ship
const SHADER_BURNING_SHIP = `
precision highp float;
varying vec2 v_pos;

uniform vec2 u_center;
uniform float u_zoom;
uniform float u_aspect;
uniform int u_maxIter;

void main() {
    vec2 c = vec2(
        u_center.x + v_pos.x * u_zoom * u_aspect,
        u_center.y + v_pos.y * u_zoom
    );

    vec2 z = vec2(0.0);
    int i;
    for(i = 0; i < u_maxIter; i++){
        z = vec2(abs(z.x), abs(z.y));
        float x = z.x*z.x - z.y*z.y + c.x;
        float y = 2.0*z.x*z.y + c.y;
        z = vec2(x, y);
        if(dot(z, z) > 4.0) break;
    }

    float t = float(i) / float(u_maxIter);
    gl_FragColor = vec4(vec3(t), 1.0);
}
`;

// Julia (parameterized)
const SHADER_JULIA = `
precision highp float;
varying vec2 v_pos;

uniform vec2 u_center;
uniform float u_zoom;
uniform float u_aspect;
uniform int u_maxIter;
uniform vec2 u_juliaC;

void main() {
    vec2 z = vec2(
        u_center.x + v_pos.x * u_zoom * u_aspect,
        u_center.y + v_pos.y * u_zoom
    );

    int i;
    for(i = 0; i < u_maxIter; i++){
        float x = z.x*z.x - z.y*z.y + u_juliaC.x;
        float y = 2.0*z.x*z.y + u_juliaC.y;
        z = vec2(x, y);
        if(dot(z,z) > 4.0) break;
    }

    float t = float(i) / float(u_maxIter);
    gl_FragColor = vec4(vec3(t), 1.0);
}
`;

// ---------------------------------------------
// FACTORY
// ---------------------------------------------
export function getShaderCode(name) {
  switch (name) {
    case "mandelbrot": return SHADER_MANDELBROT;
    case "burningShip": return SHADER_BURNING_SHIP;
    case "julia": return SHADER_JULIA;
    default:
      console.warn("Unknown shader:", name);
      return SHADER_MANDELBROT;
  }
}