import { FC, MutableRefObject, useEffect, useRef, useState } from "react";
import { useThree } from "@react-three/fiber";
import {
  PIDMovementHandlerR3F,
  PIDMovementHandlerRef,
} from "../common/PIDMovementHandlerR3F";
import { FishRef } from "./FishR3F";
import { Object3D, Plane, Raycaster, Vector2, Vector3 } from "three";

const raycaster = new Raycaster();
interface FishControllerProps {
  fishRef: MutableRefObject<FishRef>;
}

export const FishControllerR3F: FC<FishControllerProps> = ({ fishRef }) => {
  const objectRef = useRef<Object3D | undefined>();
  const pidRef = useRef<PIDMovementHandlerRef>(null);
  const [destination, setDestination] = useState(new Vector3(0, 0, 0));
  const oldDestinationRef = useRef(new Vector3(0, 0, 0));
  const { gl, camera, size } = useThree();

  useEffect(() => {
    const plane = new Plane();
    const ndcVector = new Vector2();
    const cameraDirection = new Vector3();
    const origin = new Vector3();
    const intersectionPoint = new Vector3();
    const handlePointerDown = (e: MouseEvent) => {
      if (e.button !== 0) return;
      plane.setFromNormalAndCoplanarPoint(
        camera.getWorldDirection(cameraDirection).normalize(),
        origin
      );
      const x = (e.clientX / size.width) * 2 - 1;
      const y = -(e.clientY / size.height) * 2 + 1;
      raycaster.setFromCamera(ndcVector.set(x, y), camera);
      raycaster.ray.intersectPlane(plane, intersectionPoint);
      setDestination(intersectionPoint);

      const distanceFromOld =
        oldDestinationRef.current.distanceTo(intersectionPoint);
      if (distanceFromOld > 2) {
        pidRef.current?.softResetController();
      }

      oldDestinationRef.current.copy(intersectionPoint);
    };

    gl.domElement.addEventListener("mousedown", handlePointerDown);
    return () => {
      gl.domElement.removeEventListener("mousedown", handlePointerDown);
    };
  }, [camera, gl.domElement, size.height, size.width]);
  
  return (
    <>

      <PIDMovementHandlerR3F
        ref={pidRef}
        objectRef={(() => {
          console.log(fishRef)
          objectRef.current = fishRef.current?.getObject3D();
          return objectRef;
        })()}
        destination={destination}
        p={3e-2}
        i={0e-3}
        d={3e-1}
        randomFactor={0.1}
      />
    </>
  );
};
