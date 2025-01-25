import { ShaderMaterial, ShaderMaterialParameters } from "three";
const vertexShader = /* glsl */ `
#ifdef USE_COLOR
attribute vec3 color;
#else 
uniform vec3 color;
#endif

uniform sampler2D noiseTexture; 
uniform float time;       
uniform float movementIntensity;        
uniform float randomSpeed;
varying vec3 vColor;

void main() {
    // Transform vertex to UV coordinates
    // vec2 uv = position.xy * 0.5 + 0.5; // Normalize position to [0, 1]
    // vec3 noise = texture2D(noiseTexture, uv).rgb;
    // vec3 displacedPosition.xyz = position + (noise - 0.5) * movementIntensity;
    float distToCenter = length(position);
    float offsetX = texture2D(noiseTexture, vec2(time * 0.1, 0.0) * randomSpeed).r - 0.5;
    float offsetY = texture2D(noiseTexture, vec2(time * 0.07, time * 0.15) * randomSpeed).r - 0.5;
    float offsetZ = texture2D(noiseTexture, vec2(time * 0.2, time * 0.05) * randomSpeed).r - 0.5;
    float multiplier = movementIntensity + (distToCenter * 1.0);
    vec3 randomOffset = vec3(offsetX, offsetY, offsetZ) * multiplier;
    vec3 displacedPosition = position + randomOffset;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
    vColor = color;
}
`;

const fragmentShader = /* glsl */ `
uniform vec3 emissive;        
uniform float emissiveIntensity;        
varying vec3 vColor;
void main() {
  gl_FragColor = vec4(vColor + emissive * emissiveIntensity, 1.0);
}
`;

export default class ProceduralAnimatedFishMaterial extends ShaderMaterial {
  constructor(parameter?: ShaderMaterialParameters) {
    super({ ...parameter, vertexShader, fragmentShader });
  }
}
