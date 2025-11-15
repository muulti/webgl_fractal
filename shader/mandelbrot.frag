#version 300 es
precision highp float;

in vec2 v_position;
out vec4 outColor;

uniform vec2 u_resolution;
uniform float u_zoom;
uniform vec2 u_offset;
uniform int u_iterations;

void main() {
    vec2 c = v_position * u_zoom + u_offset;
    vec2 z = vec2(0.0);
    int i;
    for(i = 0; i < u_iterations; i++) {
        z = vec2(z.x*z.x - z.y*z.y, 2.0*z.x*z.y) + c;
        if(dot(z, z) > 4.0) break;
    }
    float color = float(i) / float(u_iterations);
    outColor = vec4(vec3(color), 1.0);
}
