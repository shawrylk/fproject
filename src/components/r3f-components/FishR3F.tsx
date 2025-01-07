import { useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import fishModel from "../../assets/models/base-fish.glb?url"; //"@/assets/models/base-fish.glb";

export const FishR3F = () => {
  const { scene, nodes, materials } = useLoader(GLTFLoader, fishModel);
  const fish = nodes.Fish;
  console.log(scene, nodes, materials);
  return (
    <>
      <primitive key={fish.uuid} object={fish} shadows />;
    </>
  );
};
