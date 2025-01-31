import { invalidate, useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  Color,
  FrontSide,
  Mesh,
  MeshStandardMaterial,
  NoBlending,
  Object3D,
  RepeatWrapping,
  Texture,
  Vector3,
} from "three";
import { forwardRef, useImperativeHandle, useMemo, useRef } from "react";
import ProceduralAnimatedFishMaterial from "../../../materials/fish/fish-material";
import { useTexture } from "@react-three/drei";
import fishModel from "@/assets/models/base-fish.glb?url";
import noiseTextureImg from "@/assets/texture/noiseRGBTexture.png";
const createProceduralFishMaterial = (
  originalMaterial: MeshStandardMaterial,
  noiseTexture: Texture
) => {
  const color = originalMaterial.emissive;
  const colorVec = new Vector3(color.r, color.g, color.b);
  const material = new ProceduralAnimatedFishMaterial({
    uniforms: {
      color: { value: colorVec },
      emissive: { value: colorVec },
      emissiveIntensity: { value: 1.0 },
      noiseTexture: { value: noiseTexture },
      time: { value: 0.0 },
      deltaTime: { value: 0.0 },
      randomSpeed: { value: 8e-3 },
      randomMag: { value: new Vector3(10, 10, 10) },
      // light
      lightDirection: { value: new Vector3(-1, -1, -1).normalize() },
      lightColor: { value: new Color(0xffffff) },
      ambientColor: { value: new Color(0x111111) },
    },
  });

  material.side = FrontSide;
  material.transparent = false;
  material.polygonOffset = true;
  material.polygonOffsetFactor = 1;
  material.polygonOffsetUnits = 1;
  material.blending = NoBlending;
  material.depthTest = true;
  material.depthWrite = true;
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
  const noiseTexture = useTexture(noiseTextureImg, (texture) => {
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
  });
  const [proceduralMaterials] = useMemo(
    () => [
      meshes.map((mesh) =>
        createProceduralFishMaterial(
          mesh.material as MeshStandardMaterial,
          noiseTexture
        )
      ),
    ],
    [meshes, noiseTexture]
  );
  const [fishBodyMaterial, fishFinsMaterial, fishEyesMaterial] =
    proceduralMaterials;

  useImperativeHandle(
    ref,
    () => ({
      getObject3D: () => fishRef.current!,
    }),
    []
  );

  useFrame((_, delta) => {
    const fish = fishRef.current;
    if (!fish) return;
    proceduralMaterials.forEach((mat) => {
      mat.uniforms.time.value += delta;
      mat.uniforms.deltaTime.value = delta;
    });

    invalidate();
  });

  return (
    <object3D ref={fishRef} position={fish.position}>
      <mesh key="fish-fins" args={[fishFins.geometry, fishFinsMaterial]} />
      <mesh key="fish-eyes" args={[fishEyes.geometry, fishEyesMaterial]} />
      <mesh key="fish-body" args={[fishBody.geometry, fishBodyMaterial]} />
    </object3D>
  );
});
