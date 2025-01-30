import { ShaderMaterial, ShaderMaterialParameters } from "three";

const vertexShader = /* glsl */ `
#ifdef USE_COLOR
  attribute vec3 color;
#else 
  uniform vec3 color;
#endif

uniform sampler2D noiseTexture; 
uniform float time;       
uniform float deltaTime;      

uniform float randomSpeed;
uniform vec3 randomMag;

varying vec3 vColor;
varying vec3 vNormal;

void main() {
  float distanceFactor = pow(length(position), 15e-1) * -5e-3;
  vec3 random = texture(noiseTexture, vec2(time * randomSpeed + distanceFactor , time * randomSpeed + distanceFactor )).rgb * randomMag;
  // Note the subtraction of 0.5 here to center noise around 0
  vec3 future = (texture(noiseTexture, vec2((time + deltaTime) * randomSpeed + distanceFactor , (time + deltaTime) * randomSpeed + distanceFactor )).rgb - vec3(0.5)) * randomMag;

  // rotate
  vec3 direction = normalize(future - random);
  float angle = atan(direction.z, direction.x);
  float s = sin(angle);
  float c = cos(angle);
  mat3 rotationY = mat3(
      c,   0.0,  s,
      0.0, 1.0,  0.0,
     -s,   0.0,  c
  );

  gl_Position = projectionMatrix * modelViewMatrix * vec4(position * rotationY + random, 1.0);
  vColor = color;
  vNormal = normalMatrix * normal;
}
`;

const fragmentShader = /* glsl */ `
varying vec3 vColor;
varying vec3 vNormal;

uniform vec3 emissive;        
uniform float emissiveIntensity;        
uniform vec3 lightDirection;
uniform vec3 lightColor;     
uniform vec3 ambientColor;  
void main() {
  vec3 N = normalize(vNormal);
  vec3 L = normalize(lightDirection);
  float lambertTerm = max(dot(N, -L), 0.0);
  vec3 diffuse = vColor * lightColor * lambertTerm;
  vec3 ambient = ambientColor * vColor;
  vec3 emissiveTerm = emissive * emissiveIntensity;
  vec3 finalColor = ambient + diffuse + emissiveTerm;
  gl_FragColor = vec4(finalColor, 1.0);
}
`;

export default class ProceduralAnimatedFishMaterial extends ShaderMaterial {
  constructor(parameter?: ShaderMaterialParameters) {
    super({ ...parameter, vertexShader, fragmentShader });
  }
}
