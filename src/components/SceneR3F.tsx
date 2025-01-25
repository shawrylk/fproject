import { Canvas } from "@react-three/fiber";
import {
  Environment,
  OrbitControls,
  PerspectiveCamera,
} from "@react-three/drei";
import { MOUSE, Vector3 } from "three";
import { MutableRefObject, useRef, useState } from "react";
import { FishControllerR3F } from "./r3f-components/FishControllerR3F";
import { FishR3F, FishRef } from "./r3f-components/FishR3F";

const DEFAULT_FOV = 75;
const NEAR = 1e-6;
const FAR = 1e9;
export const SceneR3F = () => {
  const [position] = useState(new Vector3(0, 0, 3));
  const fishRef = useRef<FishRef>(null);

  return (
    <>
      <Canvas
        frameloop="demand"
        resize={{ debounce: 8 }}
        dpr={[1, 2]}
        shadows
        gl={{ antialias: true, logarithmicDepthBuffer: true }}
        style={{
          background: "#000000",
          position: "relative",
          top: 0,
          left: 0,
          height: "100vh",
          width: "100vw",
          overflow: "hidden",
          pointerEvents: "auto",
          zIndex: 0,
        }}
      >
        <ambientLight intensity={1} />
        <Environment preset="apartment" />
        <directionalLight intensity={1} position={[1, 1, 1]} />
        <PerspectiveCamera
          near={NEAR}
          far={FAR}
          makeDefault
          position={[position.x, position.y, position.z]}
          fov={DEFAULT_FOV}
          zoom={1}
          aspect={window.innerWidth / window.innerHeight}
        />
        <OrbitControls
          dampingFactor={1}
          makeDefault
          mouseButtons={{ MIDDLE: MOUSE.PAN }}
          zoomSpeed={2}
          zoomToCursor
        />
        {/* <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <planeGeometry args={[50, 50]} />
          <meshStandardMaterial color="#555" />
        </mesh> */}
        <FishR3F ref={fishRef} />
        <FishControllerR3F fishRef={fishRef as MutableRefObject<FishRef>} />;
      </Canvas>
    </>
  );
};
