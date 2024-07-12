const vertexShader = `
uniform float time;
uniform float scrollSpeed;
        varying vec2 vUv;

        void main() {
            vUv = uv;
            vec3 pos = position;

            // Diagonal flutter effect using sine waves
            float flutter = sin((pos.x + pos.y) * 2.0 + time * 5.0) * 0.07 * scrollSpeed;
            pos.z += flutter;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
`;
const fragmentShader = `
uniform sampler2D uTexture;
varying vec2 vUv;
uniform vec3 pointLightPosition;
uniform vec3 pointLightColor;

void main() {
    vec4 color = texture2D(uTexture, vUv);
    // vec3 normalizedLight = normalize(pointLightPosition);
    // vec3 lightDirection = gl_FragCoord.xyz - normalizedLight;
    // vec3 lighting = pointLightColor * 0.3;
    // gl_FragColor = vec4(vec4(lighting, 1.0)+color);
    gl_FragColor = color;
}
`;
