export function getShaderCode() {
    const fs = `
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
  return fs;
}
