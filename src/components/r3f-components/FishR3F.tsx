import { invalidate, useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  Mesh,
  MeshStandardMaterial,
  Object3D,
  RepeatWrapping,
  Texture,
  Vector3,
} from "three";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import ProceduralAnimatedFishMaterial from "../../materials/fish/fish-material";
import { useTexture } from "@react-three/drei";
import fishModel from "@/assets/models/base-fish.glb?url";
import noiseTextureImg from "@/assets/texture/noiseTexture.png";

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
  return material;
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
    proceduralMaterials.forEach(
      (material) => (material.uniforms.time.value += delta)
    );
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
