const canvas = document.getElementById('glCanvas');
const gl = canvas.getContext('webgl2');

if (!gl) {
    alert("WebGL2 is not supported in your browser.");
}

// Utility: fetch and compile a shader
async function loadShader(url, type) {
    const response = await fetch(url);
    const source = await response.text();
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error(`Error compiling shader ${url}:`, gl.getShaderInfoLog(shader));
    }
    return shader;
}

// Main initialization
async function init() {
    // Load shaders
    const vertexShader = await loadShader('shaders/mandelbrot.vert', gl.VERTEX_SHADER);
    const fragmentShader = await loadShader('shaders/mandelbrot.frag', gl.FRAGMENT_SHADER);

    // Create program
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error("Program linking failed:", gl.getProgramInfoLog(program));
    }

    // Quad vertices
    const vertices = new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
         1,  1
    ]);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uZoom = gl.getUniformLocation(program, "u_zoom");
    const uOffset = gl.getUniformLocation(program, "u_offset");
    const uIterations = gl.getUniformLocation(program, "u_iterations");

    // Initial parameters
    let zoom = 3.0;
    let offset = {x: -0.5, y: 0.0};
    let iterations = 500;

    // Mouse interaction
    let isDragging = false;
    let lastMouse = {x:0, y:0};

    canvas.addEventListener('mousedown', e => { isDragging = true; lastMouse = {x: e.clientX, y: e.clientY}; });
    canvas.addEventListener('mouseup', e => { isDragging = false; });
    canvas.addEventListener('mousemove', e => {
        if(isDragging) {
            const dx = (e.clientX - lastMouse.x) / canvas.width * zoom;
            const dy = (e.clientY - lastMouse.y) / canvas.height * zoom;
            offset.x -= dx;
            offset.y += dy;
            lastMouse = {x: e.clientX, y: e.clientY};
            draw();
        }
    });

    // Zoom with wheel
    canvas.addEventListener('wheel', e => {
        e.preventDefault();
        const factor = e.deltaY < 0 ? 0.8 : 1.25;
        zoom *= factor;
        draw();
    });

    // Draw function
    function draw() {
        gl.viewport(0, 0, canvas.width, canvas.height);
        gl.clear(gl.COLOR_BUFFER_BIT);

        gl.useProgram(program);
        gl.bindVertexArray(vao);

        gl.uniform2f(uResolution, canvas.width, canvas.height);
        gl.uniform1f(uZoom, zoom);
        gl.uniform2f(uOffset, offset.x, offset.y);
        gl.uniform1i(uIterations, iterations);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    draw();
}

// Start
init();
