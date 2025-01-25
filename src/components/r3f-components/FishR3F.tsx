import { invalidate, useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  FrontSide,
  MathUtils,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Quaternion,
  RepeatWrapping,
  Texture,
  Vector3,
} from "three";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import ProceduralAnimatedFishMaterial from "../../materials/fish/fish-material";
import { useTexture } from "@react-three/drei";
import fishModel from "@/assets/models/base-fish.glb?url";
import noiseTextureImg from "@/assets/texture/noiseTexture.png";

const MIN_ROTATION_SPEED = 0.2;
const MAX_ROTATION_SPEED = 7;
const createProceduralFishMaterial = (
  originalMaterial: MeshStandardMaterial,
  noiseTexture: Texture
) => {
  new MeshStandardMaterial();
  const colorVec = new Vector3(
    originalMaterial.emissive.r,
    originalMaterial.emissive.g,
    originalMaterial.emissive.b
  );
  const material = new ProceduralAnimatedFishMaterial({
    uniforms: {
      color: { value: colorVec },
      emissive: { value: colorVec },
      emissiveIntensity: { value: 1.0 },
      noiseTexture: { value: noiseTexture },
      movementIntensity: { value: 1.0 },
      time: { value: 0.0 },
      randomSpeed: { value: 0.2 },
    },
  });
  material.side = FrontSide;
  // material.lights = true;
  return material;
};

const lookAtPlusX = (
  matrix: Matrix4,
  position: Vector3,
  target: Vector3,
  up: Vector3
) => {
  const forward = new Vector3().subVectors(target, position).normalize();
  if (forward.lengthSq() < 1e-6) forward.set(1, 0, 0);
  const right = new Vector3().crossVectors(forward, up).normalize();
  const realUp = new Vector3().crossVectors(right, forward).normalize();
  return matrix.makeBasis(forward, realUp, right);
};

const clampVectorCone = (
  v: Vector3,
  maxDegrees: number,
  centerAxis = new Vector3(1, 0, 0)
): Vector3 => {
  const maxRad = MathUtils.degToRad(maxDegrees);
  const angle = v.angleTo(centerAxis); // in [0..π]

  if (angle > maxRad) {
    const length = v.length();
    const rotationAxis = new Vector3().crossVectors(centerAxis, v);
    // If cross is 0, means v is collinear with centerAxis => no unique rotation axis
    // fallback: pick any orthonormal axis, e.g. (0,1,0)
    if (rotationAxis.lengthSq() < 1e-12) {
      rotationAxis.set(0, 1, 0);
    } else {
      rotationAxis.normalize();
    }

    const rotateBy = angle - maxRad;
    const quat = new Quaternion().setFromAxisAngle(rotationAxis, -rotateBy);

    v.applyQuaternion(quat);
    v.setLength(length);
  }

  return v;
};

const clampVectorConeRespectDirection = (
  v: Vector3,
  maxDegrees: number,
  axis = new Vector3(1, 0, 0)
): Vector3 => {
  // Check if v is in front or behind the axis
  if (v.dot(axis) >= 0) {
    // front side => clamp around +axis
    clampVectorCone(v, maxDegrees, axis);
  } else {
    // behind => clamp around -axis
    const negAxis = new Vector3().copy(axis).negate();
    clampVectorCone(v, maxDegrees, negAxis);
  }
  return v;
};

export interface FishRef {
  getObject3D: () => Object3D;
}

export const FishR3F = forwardRef<FishRef>(function Fish(_, ref) {
  const { nodes } = useLoader(GLTFLoader, fishModel);
  const fish = nodes.Fish;
  const meshes = fish.children as Mesh[];
  const [fishBody, fishFins, fishEyes] = meshes;
  const fishRef = useRef<Object3D>(null);
  const lastPositionRef = useRef<Vector3>(fish.position);
  const [velocity, upAxis, rotationQuaternion, rotationMatrix] = useMemo(
    () => [
      new Vector3(),
      new Vector3(0, 1, 0),
      new Quaternion(),
      new Matrix4(),
    ],
    []
  );

  useImperativeHandle(
    ref,
    () => ({
      getObject3D: () => fishRef.current!,
    }),
    []
  );

  const noiseTexture = useTexture(noiseTextureImg, (texture) => {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
  });

  const proceduralMaterials = useMemo(
    () =>
      meshes.map((mesh) =>
        createProceduralFishMaterial(
          mesh.material as MeshStandardMaterial,
          noiseTexture
        )
      ),
    [meshes, noiseTexture]
  );
  const [fishBodyMaterial, fishFinsMaterial, fishEyesMaterial] =
    proceduralMaterials;

  useFrame((_, delta) => {
    const fish = fishRef.current;
    if (!fish) return;
    proceduralMaterials.forEach((mat) => (mat.uniforms.time.value += delta));
    velocity.subVectors(fish.position, lastPositionRef.current);
    clampVectorConeRespectDirection(velocity, 15, new Vector3(1, 0, 0));
    fish.quaternion.slerp(
      rotationQuaternion.setFromRotationMatrix(
        lookAtPlusX(
          rotationMatrix,
          fish.position,
          new Vector3().addVectors(fish.position, velocity),
          upAxis
        )
      ),
      Math.min(
        MAX_ROTATION_SPEED,
        Math.max(1e3 * velocity.lengthSq(), MIN_ROTATION_SPEED)
      ) * delta
    );
    lastPositionRef.current.copy(fishRef.current.position);
    invalidate();
  });

  return (
    <object3D ref={fishRef} position={fish.position}>
      <mesh key="fish-body" args={[fishBody.geometry, fishBodyMaterial]} />
      <mesh key="fish-fins" args={[fishFins.geometry, fishFinsMaterial]} />
      <mesh key="fish-eyes" args={[fishEyes.geometry, fishEyesMaterial]} />
    </object3D>
  );
});
